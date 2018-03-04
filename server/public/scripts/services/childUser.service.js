myApp.service('ChildUserService', ['$http', '$location', '$filter', function ($http, $location, $filter,) {
	console.log('ChildUserService Loaded');
	let self = this;

	self.userObject = {};
	self.editTaskObject = {};

	// ask the server if this user is logged in
	self.getChildUser = function () {
		return $http.get('/api/user')
			.then(function (response) {
					if (response.data.username && response.data.role ==='child' ) {
						self.userObject = response.data;
						self.userObject.pointsRemaining = self.userObject.award_id[0].pointvalue - self.userObject.points_earned
						return "I sent this from the return";
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
	};//END self.getChildUser

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

	self.getChildTasks = function () {
		$http.get('/api/user/gettasks')
			.then(function (response) {
					self.taskArray = [];
					//Loop to find only what the child user is responsible for
					for (i=0; i< response.data.length; i++){
						if (response.data[i].assignedto === self.userObject.username){
							self.taskArray.push(response.data[i]);
						}
					}
				},
				function (response) {
					console.log('error in getting tasks from the router :', response);
				});
	};//End self.getChildTasks


	self.addTaskToDatabase = function (dataObj) {
		dataObj.family = self.userObject.family;
		$http.post(`/api/user/addTask/${dataObj.user_id}`, dataObj).then(function (response) {
				//update the tasks listed in the DOM
				self.getChildTasks();
				console.log('success');
			},
			function (response) {
				console.log('error is', response);
				self.message = "Something went wrong. Please try again."
			});
	};//End self.addTaskToDatabase


	self.completeTask = function (editTaskObj) {
		self.editTaskObject = editTaskObj.task;
		//Update the completed flag to indicate that the task is done
		self.editTaskObject.completed = !self.editTaskObject.completed;
		$http.put(`/api/user/updateTask/${self.editTaskObject._id}`, self.editTaskObject)
			.then(function (response) {
				if (self.editTaskObject.completed === true){
					self.userObject.points_earned += self.editTaskObject.pointvalue;
				}
				else{
					self.userObject.points_earned -= self.editTaskObject.pointvalue;
				}
				// Now go to edit user and update the new user points
				//Check to see if award has need earned and set the awardEarnedFlag
				if ((self.userObject.award_id[0].pointvalue - self.userObject.points_earned) <= 0){
					self.userObject.awardEarnedFlag = true;
				}
				else {
					self.userObject.awardEarnedFlag = false;
				}
				//Update the user with the new points and award earned flag
				self.editUser(self.userObject);
			})
			.catch(function (response) {
				console.log('error on put with updating task', response);
			});
	};//End self.completeTask


	self.getUsers = function () {
		//Clear the array so we do not keep appending it
		self.userArray = [];
		$http.get('/api/user/getUsers')
			.then(function (response) {
					for (let i = 0; i < response.data.length; i++) {
						if (response.data[i].role === 'child') {
							//Populate childrenObject for later use
							self.userArray.push(response.data[i]);
						}
					}
				},
				function (response) {
					console.log('error in getting users from the router :', response);
				});
	};//End self.getUsers


	self.editUser = function(userObject){
		$http.put(`/api/user/editUser/`, userObject)
			.then(function (response) {
				self.getChildTasks();
				// $location.path('/parentUser');
			})
				.catch(function (response) {
					console.log('error on put when editing award', response);
				});
	};//End self.editUser


}]);



