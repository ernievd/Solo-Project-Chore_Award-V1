const express = require('express');
const encryptLib = require('../modules/encryption');
const User = require('../models/User');
const userStrategy = require('../strategies/user.strategy');

//for addTask
const Tasks = require('../models/Tasks');


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
  newUser.save()
    .then(() => { res.sendStatus(201); })
    .catch((err) => { next(err); });
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
router.post('/addTask', (req, res, next) => {
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

	const newTask = new Tasks({ taskname, category, duedate, assignedto, assignedby, pointvalue, confirmed, completed});
	 newTask.save()
	 	.then(() => { res.sendStatus(201); })
	 	.catch((err) => { next(err); });
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

module.exports = router;
