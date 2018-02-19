myApp.service('TaskService', ['$http', '$location', function ($http, $location) {
	console.log('TaskService Loaded');

	let self = this;

	self.taskObject = {};

	// ask the server if this user is logged in
	self.getuser = function () {
		$http.get('/api/user')
			.then(function (response) {
					if (response.data.username) {
						// user has a current session on the server
						self.userObject.userName = response.data.username;
						// console.log('User Data: ', self.userObject.userName);
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


}]);
