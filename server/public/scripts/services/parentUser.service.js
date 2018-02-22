myApp.service('ParentUserService', ['$http', '$location', '$filter', function ($http, $location, $filter,) {
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

	// ask the server if this user is logged in
	self.getuser = function () {
		$http.get('/api/user')
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
	};

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
	};

	self.getTasks = function () {
		$http.get('/api/user/gettasks')
			.then(function (response) {
					// console.log('response.data received in getTasks is :', response.data);
					self.taskObject = response.data;
				},
				function (response) {
					console.log('error in getting tasks from the router :', response);
				});
	};

	// Run upon service load to get all current tasks loaded in
	self.getTasks();

	// self.addTaskToDatabase = function (taskName, childName, dueDate, assignedBy, pointValue ) {
	self.addTaskToDatabase = function (dataObj) {
		//Add the user to the object so we have that user that added the task
		dataObj.assignedby = self.userObject.userName;
		//if parent added then confirmed is true - ** TODO- Check later to see if a parent role or child role
		dataObj.confirmed = true;
		//new task therefore completed is false
		dataObj.completed = false;
		dataObj.family = self.userObject.family;

		// console.log('sending to server...', dataObj);
		//$http.put(`/api/user/updateTask/${self.editTaskObject._id}`, self.editTaskObject)
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
	};

	//add user
	// let promise =
		self.addUser = function (role) {
			// console.log('sending to server self.addUserObject...', self.addUserObject);
			// console.log('sending to server self.userObject...', self.userObject);
			// console.log('sending to server self...', self);

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
						self.getUsers();
						// $location.path('/parentUser');
					},
					function (response) {
						console.log('error');
						self.message = "Something went wrong. Please try again."
					});

				return promise;
			}

		};


	self.changeToEditTaskView = function (editTaskObj) {
		// console.log('The task object is :', editTaskObj);
		$location.path('/editTask');
		self.editTaskObject = editTaskObj.task;
		// console.log('The self editTask object is ******:', self.editTaskObject);
		self.editTaskObject.duedate = $filter('date')(self.editTaskObject.duedate, "MM-dd-yyyy");
		self.editTaskObject.duedate = new Date(self.editTaskObject.duedate);
		// var today = $filter('date')(new Date(),'yyyy-MM-dd HH:mm:ss Z');
		// (binding("1288323623006 | date:'yyyy-MM-dd HH:mm:ss Z'"))
	};

	self.updateTask = function () {
		return $http.put(`/api/user/updateTask/${self.editTaskObject._id}`, self.editTaskObject)
			.then(function (response) {
				// console.log('get response', response);
				//Update the task list
				self.getTasks();
				// //if compltedtask has changed
				// self.completeTask(editTaskObj)
				$location.path('/parentUser');
			})
			.catch(function (response) {
				console.log('error on put with updating task', response);
			});
		self.getTasks();
	};

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
	};

	self.deleteUser = function (userToDelete) {
		if (confirm("Confirm delete")) {
			console.log('##########   User object to Delete is :', userToDelete);
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
	};

	self.getUsers = function () {
		$http.get('/api/user/getUsers')
			.then(function (response) {
					// console.log('all users response.data is :', response.data);
					//Clear the array so we do not keep appending it
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
					// console.log('all children are  :', self.userArray);

				},
				function (response) {
					console.log('error in getting users from the router :', response);
				});
	};

	self.getUsers();

	self.changeToEditView = function(award){
		self.awardObject = award.child;
		$location.path('/editUser');
		// console.log('self.award object is :', self.awardObject);
	};

	self.goToParentView = function(){
		// self.awardObject = award.child;
		$location.path('/parentUser');
		// console.log('self.award object is :', self.awardObject);
	};

	self.editUser = function(){
		self.getTasks();
		console.log('awardObject is :', self.awardObject);
		$http.put(`/api/user/editUser/`, self.awardObject)
			.then(function (response) {
				self.getTasks();
				// $location.path('/parentUser');
			})
				.catch(function (response) {
					console.log('error on put when editing award', response);
				});
	};//End self.editUser

	self.completeTask = function () {
		//finduser set up the associated child user to updateUserObject
		self.findUser(self.editTaskObject.assignedto);
		console.log('#########self.editTaskObject is :', self.editTaskObject);
		// console.log('#########self.updateUserObject is :', self.updateUserObject);
		console.log('######### BEFORE self.editTaskObject.completed is :', self.editTaskObject.completed);

		// self.editTaskObject = editTaskObj.task;
		// self.editTaskObject.completed = !self.editTaskObject.completed;
		console.log('######### AFTER self.editTaskObject.completed is :', self.editTaskObject.completed);

		console.log('#########self.editTaskObject.pointvalue is :', self.editTaskObject.pointvalue);
		$http.put(`/api/user/updateTask/${self.editTaskObject._id}`, self.editTaskObject)
			.then(function (response) {
				// console.log('get response', response);
				if (self.editTaskObject.completed === true){
					console.log('*********self.userObject.points_earned is ', self.updateUserObject.points_earned);
					self.updateUserObject.points_earned += self.editTaskObject.pointvalue;
					console.log('self.updateUserObject.points_earned after addition is ', self.updateUserObject.points_earned);
				}
				else{
					console.log('*********self.userObject.points_earned is ', self.updateUserObject.points_earned);
					self.updateUserObject.points_earned -= self.editTaskObject.pointvalue;
					console.log('self.updateUserObject.points_earned after subtraction is ', self.updateUserObject.points_earned);
				}

				self.editUser();
				//Update the task list
				self.getTasks();
			})
			.catch(function (response) {
				console.log('error on put with updating task', response);
			});
	};

	self.findUser = function (name) {
		for (let i=0; i< self.userArray.length; i++){
			if ( self.userArray[i].username === name){
				self.updateUserObject = self.userArray[i];
				console.log('self.updateUserObject is ', self.updateUserObject);
			}
		}

	};

	// self.editUser = function(){
	// 	console.log('self.updateUserObject is :', self.updateUserObject);
	// 	$http.put(`/api/user/editUser/`, self.updateUserObject)
	// 		.then(function (response) {
	// 			self.getTasks();
	// 		})
	// 		.catch(function (response) {
	// 			console.log('error on put when editing user', response);
	// 		});
	// }//End self.editUser

	self.editUser = function(editObj){
		console.log('ernie object is :', editObj);
		$http.put(`/api/user/editUser/`, editObj)
			.then(function (response) {
				self.getTasks();
				$location.path('/parentEditUser');
			})
			.catch(function (response) {
				console.log('error on put when editing user', response);
			});
	}//End self.editUser
}]);



