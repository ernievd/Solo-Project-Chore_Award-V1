myApp.service('ParentUserService', ['$http', '$location', '$filter' ,function ($http, $location, $filter,) {
	console.log('ParentUserService Loaded');
	let self = this;

	self.userObject = {};
	self.taskObject = {};
	self.addUserObject = {};
	self.editTaskObject = {};
	self.awardObject = {};
	self.userArray = [];
	self.updateUserObject = {};
	self.userParentArray = [];

	//self.getUser
	// Ask the server if this user is logged in and populate the self.userObject with the current logged in user data
	//  Also ensures that only users with the role of parent can access this area
	self.getuser = function () {
		let promise = $http.get('/api/user')
			.then(function (response) {
					if (response.data.username && response.data.role ==='parent' ) {
						// user has a current session on the server and is of type parent
						//Populate userObject for later use
						self.userObject.userName = response.data.username;
						self.userObject.family = response.data.family;
						self.userObject.role = response.data.role;
					} else {
						// unlikely to get here, but if we do, bounce them back to the login page
						$location.path("/home");
					}
				},
				// error response of unauthorized (403)
				function (response) {
					// user has no session, bounce them back to the login page
					$location.path("/home");

				});
		return promise;
	}; // End self.getUser

	//self.logout
	// Log out the current user
	self.logout = function () {
		$http.get('/api/user/logout')
			.then(function (response) {
					console.log('logged out');
					$location.path("/home");
				},
				function (response) {
					console.log('logged out error');
					$location.path("/home");
				});
	};//End self.logout

	//self.getTasks
	// Get all the current tasks from all current users and populate the self.taskObject with the data
	self.getTasks = function () {
		$http.get('/api/user/gettasks')
			.then(function (response) {
					// console.log('response.data received in getTasks is :', response.data);
					self.taskObject = response.data;
				},
				function (response) {
					console.log('error in getting tasks from the router :', response);
				});
	}; //End self.GetTasks


	//self.addTaskToDatabase
	// Adds a new task to the database
	// Requires a task object to be passed in with a task schema that has the task data to be added to the database
	//  Since self.userObject has the current logged in parent username and family last name we
	//      can use it in this function to populate the assigned by and family data
	self.addTaskToDatabase = function (taskObj) {
		//Add the current logged in username to the task object data so we have that user that assigned the task
		taskObj.assignedby = self.userObject.userName;
		//Since a parent added it then it is assumed that confirmed is true
		taskObj.confirmed = true;
		//This is a new task therefore completed is false by default.
		taskObj.completed = false;
		//Add the current logged in family name to the task object data so we have that proper family associated with the task
		taskObj.family = self.userObject.family;

		$http.post(`/api/user/addTask/${dataObj.user_id}`, dataObj).then(function (response) {
				console.log('success');
				//Keeping this for now. Used to redirect if you want after the post
				// $location.path('/home');
			},
			function (response) {
				console.log('error');
				self.message = "Something went wrong. Please try again."
			});
		//update the tasks listed in the DOM
		self.getTasks();
	};//End self.addTaskToDatabase

	//self.addUser function
	// Adds a new user to the database
	// Requires a role type to be passed in
	self.addUser = function (role) {
			if (self.addUserObject.username === '' || self.addUserObject.password === '') {
				//TODO - change this message to a popup - https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_popup
				self.message = "Username and password must all be entered!";

			} else {
				// a new user is creating a new  and therefore defaults to registering user is defaulted as a parent and will add children users under there account
				self.addUserObject.role = role;
				self.addUserObject.family = self.userObject.family;

				// console.log('sending to server self.addUserObject...', self.addUserObject);
				// return $http(....
				let promise = $http.post('/api/user/register', self.addUserObject).then(function (response) {
						console.log('success on addUser post');
						// Update user list object
						return self.getUsers();
						// $location.path('/parentUser');
					},
					function (response) {
						console.log('error');
						self.message = "Something went wrong. Please try again."
					});

				return promise;
			}

		};//End self.addUser

	//self.changeToEditTaskView
	// Update the self.editTaskObjects data with the passed in data and also update the date so it is a Date object
	self.changeToEditTaskView = function (editTaskObj) {
		self.editTaskObject = editTaskObj.task;
		self.editTaskObject.duedate = $filter('date')(self.editTaskObject.duedate, "MM-dd-yyyy");
		self.editTaskObject.duedate = new Date(self.editTaskObject.duedate);
		$location.path('/editTask');
	};//End self.changeToEditTaskView

	//self.updateTask
	// Update the the task currently loaded into the self.editTaskObject
	self.updateTask = function () {
		return $http.put(`/api/user/updateTask/${self.editTaskObject._id}`, self.editTaskObject)
			.then(function (response) {
				//Update the task list
				self.getTasks();
				$location.path('/parentUser');
			})
			.catch(function (response) {
				console.log('error on put with updating task', response);
			});
	};//End self.updateTask

	//self.deleteTask
	// Delete the task currently loaded into the self.editTaskObject
	self.deleteTask = function () {
		if (confirm("Confirm delete")) {
			$http.delete(`/api/user/deleteTask/${self.editTaskObject._id}`, self.editTaskObject)
				.then(function (response) {
					//Update the task list
					console.log('Delete Success:', response);
					self.getTasks();
					$location.path('/parentUser');
				})
				.catch(function (response) {
					console.log('error on Delete', response);
				});
		} else {
			txt = "You pressed Cancel!";
		}
	};//End self.deleteTask

	//self.deleteUser
	// Delete the user that is passed in
	// Requires a user object with a user Schema
	self.deleteUser = function (userToDelete) {
		if (confirm("Confirm delete")) {
			//When we pass in a parent it comes in as parent.parent. We must change it to be able to reuse this function
			if (userToDelete.parent != undefined){ userToDelete = userToDelete.parent}

			//If this is a child user then we have to also delete all associated tasks
			if (userToDelete.role === 'child'){
				// Delete all associated tasks
				for (let i=0 ; i< userToDelete.tasks.length ; i++) {
					console.log('##########   Task to Delete is :', userToDelete.tasks[i]);
					$http.delete(`/api/user/deleteTask/${userToDelete.tasks[i]}`, userToDelete.tasks[i])
						.then(function (response) {
							console.log('Delete Success:', response);
						})
						.catch(function (response) {
							console.log('error on Delete', response);
						});
				}
			}

			//Delete the associated award
			$http.delete(`/api/user/deleteAward/${userToDelete.award_id[0]._id}`, userToDelete)
				.then(function (response) {
					console.log('Delete Success:', response);
				})
				.catch(function (response) {
					console.log('error on Delete', response);
				});

			//Delete the user
			$http.delete(`/api/user/deleteUser/${userToDelete._id}`, userToDelete)
				.then(function (response) {
					console.log('Delete Success:', response);
				})
				.catch(function (response) {
					console.log('error on Delete', response);
				});
		} else {
			$location.path('/parenEditUser');
		}
		self.getUsers();
		self.getTasks();
		$location.path('/parentEditUser');
	};//End self.deleteUser

	//self.getUsers
	// Get all the users in the database and add the parents to self.userParentArray and the children to self.userArray
	self.getUsers = function () {
		let promise = $http.get('/api/user/getUsers')
			.then(function (response) {
					//Clear the arrays so we do not keep appending them
					self.userArray = [];
					self.userParentArray = [];
					for (let i = 0; i < response.data.length; i++) {
						if (response.data[i].role === 'child') {
							//Populate userArray with children users for later use
							self.userArray.push(response.data[i]);
						}
						else if(response.data[i].role === 'parent'){
							//Populate userParentArray with parent users for later use
							self.userParentArray.push(response.data[i]);
						}
					}
					return true;
				},
				function (response) {
					console.log('error in getting users from the router :', response);
					return false;
				});
		return promise;
	};//End self.getUsers

	//self.changeToEditView
	// Update the self.awardObject with the passed in award object and direct the user to the edituser view
	self.changeToEditView = function(award){
		//TODO - Change awardObjet name to something else
		self.awardObject = award.child;
		$location.path('/editUser');
	};//End self.changeToEditView

	//self.changeToEditView
	// Direct the user to the parentuser view
	self.goToParentView = function(){
		// self.awardObject = award.child;
		$location.path('/parentUser');
	};//End self.changeToEditView

	//self.editUser
	// Takes in an object with the user schema and updates the database  with the data it the object has in it
	self.editUser = function(userObject){
		self.getTasks();
		console.log('userObject is :', userObject);
		$http.put(`/api/user/editUser/`, userObject)
			.then(function (response) {
				self.getTasks();
				$location.path('/parentEditUser');
			})
				.catch(function (response) {
					console.log('error on put when editing award', response);
				});
	};//End self.editUser

	//self.completeTask
	// Toggles the task complete, updates the point totals and then updates the task data and user data in the database
	self.completeTask = function (task) {
		console.log('the task is - ', task);
		//assign the userToEditObject to the user we are updating - use the finduser function
		userToEditObject = self.findUser(task.assignedto);
		task.completed = !task.completed;

		console.log('#########task.pointvalue is :', task.pointvalue);
		$http.put(`/api/user/updateTask/${task._id}`, task)
			.then(function (response) {
				// console.log('get response', response);
				if (task.completed === true){
					console.log('*********self.userObject.points_earned is ', userToEditObject.points_earned);
					userToEditObject.points_earned += task.pointvalue;
					console.log('userToEditObject.points_earned after addition is ', userToEditObject.points_earned);
				}
				else{
					console.log('*********self.userObject.points_earned is ', userToEditObject.points_earned);
					userToEditObject.points_earned -= task.pointvalue;
					console.log('userToEditObject.points_earned after subtraction is ', userToEditObject.points_earned);
				}

				self.editUser(userToEditObject);
				//Update the task list
				// self.getTasks();
			})
			.catch(function (response) {
				console.log('error on put with updating task', response);
			});
	};//End self.completeTask

	//self.finduser function
	// Goes through the array that holds all the child users and when it finds a match it returns an object with the matches users data
	self.findUser = function (name) {
		for (let i=0; i< self.userArray.length; i++){
			if ( self.userArray[i].username === name){
				userMatch = self.userArray[i];
			}
		}
		return userMatch;
	}; // End self.findUSer

	//self.editAward function
	// Requires an object using the award schema and updates the database with the objects data
	self.editAward = function(editObj){
		console.log('edit award object is :', editObj);
		$http.put(`/api/user/editAward`, editObj)
			.then(function (response) {
				//self.getTasks();
			})
			.catch(function (response) {
				console.log('error on put when editing award', response);
			});
	};//End self.editAward

	//self.uploadPicture
	// Uploads a picture to FileStack to use for the award and then updates the award in the database with the link of the picture.
	//  assigning the fsClient as the API key for use with FileStack
	//TODO - should this key be in the .env? Will this prevent users from uploading when live?
	//const fsClient = process.env.FILESTACK-API_KEY;
	let fsClient = filestack.init('Ax2kts5B6SyWczF8XeHOEz');
	self.uploadPicture = function(childData) {
		fsClient.pick({
			fromSources:["local_file_system","imagesearch","facebook","instagram","dropbox"],
			accept:["image/*"]
		}).then(function(response) {
			let pictureLink = response.filesUploaded[0].url;
			console.log('my link is ', pictureLink);
			console.log('self.editTaskObject is ', self.editTaskObject);
			console.log('child data passed in is ', childData);
			awardObj = childData.child.award_id[0];
			awardObj.link = pictureLink;
			//update the award with the new picture link
			self.editAward(awardObj);
		});
	};//End self.uploadPicture


	self.addPhoto = function (response) {
		return response.filesUploaded[0].url
	} // End self.addPhoto
}]);



