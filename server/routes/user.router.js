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
		// console.log(req.user.id);
		User.find({'_id' : req.user.id}).populate({path: 'award_id', model: Awards}).exec((error, foundUsers) => {
			if (error) {
				console.log('error on find: ', error);
				res.sendStatus(500);
			} else {
				res.send(foundUsers[0]);
			}
		})
	} else {
		// failure best handled on the server. do redirect here.
		res.sendStatus(403);
	}
});//End router.get '/'

// Handles POST request with new user data
// The only thing different from this and every other post we've seen
// is that the password gets encrypted before being inserted
router.post('/register', (req, res, next) => {
	const username = req.body.username;
	const family = req.body.family;
	const role = req.body.role;
	const password = encryptLib.encryptPassword(req.body.password);
	const points_earned = 0;
	const newUser = new User({username, family, role, password, points_earned});
	newUser.save((error, userDoc) => {
		if (error) {
			res.sendStatus(500);
		}
		else {
			//Also update the award collection with default values
			const newAward = new Awards({awardname: 'Nothing chosen', pointvalue: 0, link: '', family: family});
			newAward.save((error, awardDoc) => {
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
								res.sendStatus(201);
							}
						}
					);
				}
			})
		}
	})
});//End router.post '/register'


// Get all the tasks in the database
router.get('/gettasks', (req, res) => {
	if (req.isAuthenticated()) {
		Tasks.find({ 'family' : req.user.family}, (error, foundTasks) => {
			if (error) {
				console.log('error on find: ', error);
				res.sendStatus(500);
			} else {
				res.send(foundTasks);
			}
		}); // end find
	} else {
		// failure best handled on the server. do redirect here.
		// res.sendStatus(403);
	}

}); //End router.get '/gettasks'

// Handles POST request with new task
router.post('/addTask/:userId', (req, res, next) => {
	const taskname = req.body.taskName;
	const category = req.body.category;
	const duedate = req.body.dueDate;
	const assignedto = req.body.childName;
	const assignedby = req.body.assignedby;
	const pointvalue = req.body.pointValue;
	const confirmed = req.body.confirmed;
	const completed = req.body.completed;
	const taskId = req.body._id;
	const family = req.body.family;
	const newTask = new Tasks({taskname, category, duedate, assignedto, assignedby, pointvalue, confirmed, completed, family});
	newTask.save((error, taskDoc) => {
		if (error) {
			res.sendStatus(500);
		}
		else {
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
						res.sendStatus(201);
					}
				}
			);
		}
	});
});//End router.post '/addTask/:userId'

// Handles login form authenticate/login POST
// userStrategy.authenticate('local') is middleware that we run on this route
// this middleware will run our POST if successful
// this middleware will send a 404 if not successful
router.post('/login', userStrategy.authenticate('local'), (req, res) => {
	// send req.user which has all the user info
	res.send(req.user);
});//End router.post '/login'


// clear all server session information about this user
router.get('/logout', (req, res) => {
	// Use passport's built-in method to log out the user
	req.logout();
	res.sendStatus(200);
}); //End router.get '/logout'

// update a task using its ID
router.put('/updateTask/:id', (req, res) => {
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
}); //End router.put '/updateTask/:id'

// delete a task using its ID
router.delete('/deleteTask/:id', (req, res) => {
	Tasks.findByIdAndRemove(
		{"_id": req.params.id},
		(error, deletedTask) => {
			if (error) {
				console.log('error on remove:', error);
				res.sendStatus(500);
			} else {
				console.log('task removed:', deletedTask);
				res.sendStatus(200);
			}
		}
	)
}); //End router.delete '/deleteTask/:id'

// delete a user using its ID
router.delete('/deleteUser/:id', (req, res) => {
	console.log('in ROUTER USER DELETE - req.params is :', req.params);
	 User.findByIdAndRemove(
		{"_id": req.params.id},
		(error, deletedUser) => {
			if (error) {
				console.log('error on remove:', error);
				res.sendStatus(500);
			} else {
				console.log('task removed:', deletedUser);
				res.sendStatus(200);
			}
		}
	)
}); //End router.delete '/deleteUser/:id'

// delete an award using its ID
router.delete('/deleteAward/:id', (req, res) => {
	Awards.findByIdAndRemove(
		{"_id": req.params.id},
		(error, deletedUser) => {
			if (error) {
				console.log('error on remove:', error);
				res.sendStatus(500);
			} else {
				console.log('task removed:', deletedUser);
				res.sendStatus(200);
			}
		}
	)
}); //End router.delete '/deleteAward/:id'

// get all users
router.get('/getUsers', (req, res) => {
	User.find({'family' : req.user.family}).populate({path: 'award_id', model: Awards}).exec((error, foundUsers) => {
		if (error) {
			console.log('error on find: ', error);
			res.sendStatus(500);
		} else {
			// console.log('found user Documents: ', foundUsers);
			res.send(foundUsers);
		}
	})

});//End router.get '/getUsers'

// edit an award
router.put('/editAward', (req, res) => {
	let awardId = req.body._id;
	let awardToUpdate = req.body;
	// update in collection
	Awards.findByIdAndUpdate(
		{"_id": awardId},
		{$set: awardToUpdate},
		(error, updatedDocument) => {
			if (error) {
				console.log('error on award update: ', error);
				res.sendStatus(500);
			} else {
				// console.log('Document before it was updated!: ', updatedDocument);
				res.sendStatus(200);
			}
		}
	)
}); //End router.put '/editAward'

// edit a user
router.put('/editUser/', (req, res) => {
	let userId = req.body._id;
	let userDataToUpdate = req.body;
	// update in collection
	User.findByIdAndUpdate(
		{"_id": userId},
		{$set: userDataToUpdate},
		(error, updatedDocument) => {
			if (error) {
				console.log('error on user update: ', error);
				res.sendStatus(500);
			}
			else {
				Awards.findByIdAndUpdate(
					{"_id": userDataToUpdate.award_id[0]._id},
					{$set: userDataToUpdate.award_id[0]},
					(error, updatedDocument) => {
						if (error) {
							console.log('error on award update: ', error);
							res.sendStatus(500);
						}
					}
				);
				res.sendStatus(200);
			}
		}
	)
}); //End router.put '/editUser/'


module.exports = router;
