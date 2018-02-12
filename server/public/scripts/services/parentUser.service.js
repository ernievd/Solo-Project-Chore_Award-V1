myApp.service('ParentUserService', ['$http', '$location', function ($http, $location) {
  console.log('ParentUserService Loaded');
  
  let self = this;

  self.userObject = {};

  // ask the server if this user is logged in
  self.getuser = function () {
    $http.get('/api/user')
      .then(function (response) {
        if (response.data.username) {
          // user has a curret session on the server
          self.userObject.userName = response.data.username;
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
			    console.log('success');
			    //Keeping this for now. Used to redirect if you want after the post
			    // $location.path('/home');
		    },
		    function(response) {
			    console.log('error');
			    self.message = "Something went wrong. Please try again."
		    });


    }
}]);
