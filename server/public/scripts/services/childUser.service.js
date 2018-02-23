myApp.service('ChildUserService', ['$http', '$location', '$filter', function ($http, $location, $filter,) {
	console.log('ChildUserService Loaded');
	let self = this;

	self.userObject = {};
	self.taskObject = {};
	self.addUserObject = {};
	self.editTaskObject = {};
	self.awardObject = {};
	self.userArray = [];
	self.taskArray = [];


	// ask the server if this user is logged in
	self.getuser = function () {
		$http.get('/api/user')
			.then(function (response) {
					if (response.data.username && response.data.role ==='child' ) {
						// user has a current session on the server and is of type parent
						console.log('*** In getuser - response.data.role is :', response.data.role);
						self.userObject = response.data;
						console.log('self.userObject is :', self.userObject);
						// console.log('self.awardObject is :', self.awardObject);
						self.userObject.pointsRemaining = self.userObject.award_id[0].pointvalue - self.userObject.points_earned
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
//Get all the user data upon service startup-
	self.getuser();

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
		//Clear out the array before we load it
		$http.get('/api/user/gettasks')
			.then(function (response) {
					self.taskArray = [];
					//Loop to find only what the child user is responsible for
					for (i=0; i< response.data.length; i++){
						if (response.data[i].assignedto === self.userObject.username){
							// console.log('its a match!');
							self.taskArray.push(response.data[i]);
						}
					}
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
		// dataObj.assignedby = self.userObject.userName;
		//if parent added then confirmed is true - ** TODO- Check later to see if a parent role or child role
		// dataObj.confirmed = true;
		//new task therefore completed is false
		// dataObj.completed = false;

		// console.log('sending to server...', dataObj);
		//$http.put(`/api/user/updateTask/${self.editTaskObject._id}`, self.editTaskObject)
		dataObj.family = self.userObject.family;
		$http.post(`/api/user/addTask/${dataObj.user_id}`, dataObj).then(function (response) {
				//update the tasks listed in the DOM
				self.getTasks();
				console.log('success');
				//Keeping this for now. Used to redirect if you want after the post
				// $location.path('/home');
			},
			function (response) {
				console.log('error is', response);
				self.message = "Something went wrong. Please try again."
			});

	};

	//add user
	let promise =
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
				$http.post('/api/user/register', self.addUserObject).then(function (response) {
						console.log('success on addUser post');
						// Update user list object
						self.getUsers();
						$location.path('/parentUser');
					},
					function (response) {
						console.log('error');
						self.message = "Something went wrong. Please try again."
					});
			}
			return promise;
		};


	self.changeToEditTaskView = function (editTaskObj) {
		$location.path('/editChildTask');
		self.editTaskObject = editTaskObj.task;
		self.editTaskObject.duedate = $filter('date')(self.editTaskObject.duedate, "MM-dd-yyyy");
		self.editTaskObject.duedate = new Date(self.editTaskObject.duedate);

	};

	self.completeTask = function (editTaskObj) {
		self.editTaskObject = editTaskObj.task;
		self.editTaskObject.completed = !self.editTaskObject.completed;
		console.log('self.editTaskObject.pointvalue is :', self.editTaskObject.pointvalue);
		$http.put(`/api/user/updateTask/${self.editTaskObject._id}`, self.editTaskObject)
			.then(function (response) {
				// console.log('get response', response);
				if (self.editTaskObject.completed === true){
					console.log('*********self.userObject.points_earned is ', self.userObject.points_earned);
					self.userObject.points_earned += self.editTaskObject.pointvalue;
					console.log('self.userObject.points_earned after addition is ', self.userObject.points_earned);
				}
				else{
					console.log('*********self.userObject.points_earned is ', self.userObject.points_earned);
					self.userObject.points_earned -= self.editTaskObject.pointvalue;
					console.log('self.userObject.points_earned after subtraction is ', self.userObject.points_earned);
				}
				//self.editUser();
				//Update the task list
				// self.getTasks();
			})
			.catch(function (response) {
				console.log('error on put with updating task', response);
			});
	};


	self.getUsers = function () {
		//Clear the array so we do not keep appending it
		self.userArray = [];
		$http.get('/api/user/getUsers')
			.then(function (response) {
					// console.log('all users response.data is :', response.data);
					for (let i = 0; i < response.data.length; i++) {
						if (response.data[i].role === 'child') {
							//Populate childrenObject for later use
							self.userArray.push(response.data[i]);
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
		console.log('awardObject is :', self.awardObject);
		$http.put(`/api/user/editUser/`, self.awardObject)
			.then(function (response) {
				self.getTasks();
				$location.path('/parentUser');
			})
				.catch(function (response) {
					console.log('error on put when editing award', response);
				});
	};//End self.editUser


}]);



