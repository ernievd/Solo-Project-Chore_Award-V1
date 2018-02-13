myApp.service('ParentUserService', ['$http', '$location', function ($http, $location) {
  console.log('ParentUserService Loaded');
  
  let self = this;

  self.userObject = {};
  self.taskObject = {};
  self.addUserObject = {};

  // ask the server if this user is logged in
  self.getuser = function () {
    $http.get('/api/user')
      .then(function (response) {
        if (response.data.username) {
          // user has a current session on the server

	        //Populate userObject for later use
          self.userObject.userName = response.data.username;
          self.userObject.family = response.data.family;
          self.userObject.role = response.data.role;
          console.log('User Data: ', self.userObject.userName);
        } else {
          // unlikely to get here, but if we do, bounce them back to the login page
          $location.path("/home");
        }
      },
      // error response of unauthorized (403)
      function(response) {
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
    function(response) {
      console.log('logged out error');
      $location.path("/home");
    });
  };

	self.getTasks = function () {
		$http.get('/api/user/gettasks')
			.then(function (response) {
					console.log('response.data received in getTasks is :', response.data);
					self.taskObject = response.data;
				},
				function(response) {
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
	    //TODO - where to I get the proper user_id?
	    dataObj.user_id = 1;
	    console.log('sending to server...', dataObj);
	    $http.post('/api/user/addTask', dataObj).then(function(response) {
	    	//update the tasks listed in the DOM
	    	self.getTasks();
	    	console.log('success');

			    //Keeping this for now. Used to redirect if you want after the post
			    // $location.path('/home');
		    },
		    function(response){
	    	    console.log('error');
	    	    self.message = "Something went wrong. Please try again."
	    });

    };

	self.addUser = function(role) {
		console.log('sending to server self.addUserObject...', self.addUserObject);
		console.log('sending to server self.userObject...', self.userObject);
		console.log('sending to server self...', self);

		if(self.addUserObject.username === '' || self.addUserObject.password === '') {
			//TODO - change this message to a popup - https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_popup
			self.message = "Username and password must all be entered!";

		} else {
			// a new user is creating a new  and therefore defaults to registering user is defaulted as a parent and will add children users under there account
			self.addUserObject.role = role;
			self.addUserObject.family = self.userObject.family;

			console.log('sending to server self.addUserObject...', self.addUserObject);
			$http.post('/api/user/register', self.addUserObject).then(function(response) {
					console.log('success on addUser post');
					$location.path('/parentUser');
				},
				function(response) {
					console.log('error');
					self.message = "Something went wrong. Please try again."
				});
		}
	}
}]);
