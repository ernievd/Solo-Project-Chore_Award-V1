const express = require('express');
const encryptLib = require('../modules/encryption');
const User = require('../models/User');
const userStrategy = require('../strategies/user.strategy');
const Tasks = require('../models/Tasks');
const Awards = require('../models/Awards');

const router = express.Router();

// Handles Ajax request for user information if user is authenticated
router.get('/', (req, res) => {
  // check if logged in
  if (req.isAuthenticated()) {
    // send back user object from database
    res.send(req.user);
  } else {
    // failure best handled on the server. do redirect here.
    res.sendStatus(403);
  }
});

// Handles POST request with new user data
// The only thing different from this and every other post we've seen
// is that the password gets encrypted before being inserted
router.post('/register', (req, res, next) => {
  const username = req.body.username;
  const family = req.body.family;
  const role = req.body.role;
  const password = encryptLib.encryptPassword(req.body.password);
  const points_earned = 0;

  const newUser = new User({ username, family, role, password, points_earned});
	newUser.save((error, userDoc) => {
		if (error) {
			res.sendStatus(500);
		}
		else {
			//Also update the award collection
			const newAward = new Awards({awardname: 'Nothing chosen', pointvalue: 0, link: ''});
			newAward.save((error, awardDoc) =>{
				if (error) {
					res.sendStatus(500);
				}
				else {
					console.log('userDoc._Id in update user is :', userDoc._id);
					User.findByIdAndUpdate(
						{
							"_id": userDoc._id
						},
						{$push: {award_id: awardDoc._id}},
						(pusherror, doc) => {
							if (pusherror) {
								console.log('error on push : ', pusherror);
								res.sendStatus(500);
							} else {
								console.log('updated user document: ', doc);
								console.log('-----------------------------');
								res.sendStatus(201);
							}
						}
					);
					//update user collection with the award id
					//award_id: { type: Schema.Types.ObjectId, ref: 'awards' },
				}

			})

			// awardname: { type: Number, required: true },
			// pointvalue: { type: Number, required: true },
			// link: { type: String, required: false }


		}
	})

});





// Get all the tasks in the database
router.get('/gettasks', (req, res) => {
	// Game is a reference to the collection when finding things in the DB
	Tasks.find({}, (error, foundTasks) => {
		if (error) {
			console.log('error on find: ', error);
			res.sendStatus(500);
		} else {
			res.send(foundTasks);
		}
	}); // end find
}); // end route

// Handles POST request with new task
router.post('/addTask/:userId', (req, res, next) => {
	console.log('in the router - req.body is :', req.body);
	const taskname = req.body.taskName;
	const category = req.body.category;
	const duedate = req.body.dueDate;
	const assignedto = req.body.childName;
	const assignedby = req.body.assignedby;
	const pointvalue = req.body.pointValue;
	// confirmed is true if the parent assigns it
	const confirmed = req.body.confirmed;
	const completed = req.body.completed;
	const taskId = req.body._id;
	const newTask = new Tasks({taskname, category, duedate, assignedto, assignedby, pointvalue, confirmed, completed});
	newTask.save((error, taskDoc) => {
		if (error) {
			res.sendStatus(500);
		}
		else {
			console.log('saved new task: ', taskDoc);
			console.log('-----------------------------');
			console.log('req.params.userId is ***', req.params.userId);
			// added the new rating, add it to the game document
			console.log('taskDoc._id is :',taskDoc._id);
			User.findByIdAndUpdate(
				{
					"_id": req.params.userId
				},
				{$push: {tasks: taskDoc._id}},
				(pusherror, doc) => {
					if (pusherror) {
						console.log('error on push to user task array: ', pusherror);
						res.sendStatus(500);
					} else {
						console.log('updated user document: ', doc);
						console.log('-----------------------------');
						res.sendStatus(201);
					}
				}
			);
		}
	});
});

// Handles login form authenticate/login POST
// userStrategy.authenticate('local') is middleware that we run on this route
// this middleware will run our POST if successful
// this middleware will send a 404 if not successful
router.post('/login', userStrategy.authenticate('local'), (req, res) => {
  res.sendStatus(200);
});

// clear all server session information about this user
router.get('/logout', (req, res) => {
  // Use passport's built-in method to log out the user
  req.logout();
  res.sendStatus(200);
});

// /updateTask/${editTaskObj._id}
router.put('/updateTask/:id', (req, res) => {
	console.log('req.params.id is :', req.params.id);
	console.log('req.body is : ', req.body);
	let taskId = req.params.id;
	let taskToUpdate = req.body;
	// update in collection
	Tasks.findByIdAndUpdate(
		{"_id": taskId},
		{$set: taskToUpdate},
		(error, updatedDocument) => {
			if (error) {
				console.log('error on task update: ', error);
				res.sendStatus(500);
			} else {
				// console.log('Document before it was updated!: ', updatedDocument);
				res.sendStatus(200);
			}
		}
	)

});

router.delete('/deleteTask/:id', (req, res) => {
	Tasks.findByIdAndRemove(
		{"_id": req.params.id},
		(error, deletedTask) =>{
			if(error){
				console.log('error on remove:', error);
				res.sendStatus(500);
			} else{
				console.log('task removed:', deletedTask);
				res.sendStatus(200);
			}
		}
	)
});

router.get('/getChildrenUsers', (req, res) => {

	User.find({}).populate({ path: 'award_id', model: Awards}).exec( (error, foundUsers) => {
		if (error) {
			console.log('error on find: ', error);
			res.sendStatus(500);
		} else {
			console.log('found user Documents: ', foundUsers);
			res.send(foundUsers);
		}
	})

	// User.find({}, (error, foundTasks) => {
	// 	if (error) {
	// 		console.log('error on find: ', error);
	// 		res.sendStatus(500);
	// 	} else {
	// 		res.send(foundTasks);
	// 	}
	// }); // end find
}); // end route

module.exports = router;
