myApp.controller('LoginController', ['$http', '$location', 'ParentUserService', 'ChildUserService', function ($http, $location, ParentUserService, ChildUserService) {
	console.log('LoginController created');
	let self = this;
	self.user = {
		username: '',
		family: '',
		role: '',
		password: ''
	};
	self.message = '';


	self.login = function () {
		if (self.user.username === '' || self.user.password === '') {
			self.message = "Choose a username and password!";
		} else {
			console.log('sending to server...', self.user);
			$http.post('/api/user/login', self.user).then(
				function (response) {
					console.log('******response is: ', response);

					if (response.status === 200) {
						console.log('success: ', response);
						console.log('response.data is ', response.data);
						//Direct the home page based on user
						if (response.data.role === 'parent'){$location.path('/parentUser');}
						else {
							//refresh the tasks before we load the child user page
							ChildUserService.getTasks();
							$location.path('/childUser');
						}
					}
					else {
						console.log('failure error: ', response);
						self.message = "Incorrect credentials. Please try again.";
					}
				},
				function (response) {
					console.log('failure error: ', response);
					self.message = "Incorrect credentials. Please try again.";
				});
		}
	};

	self.registerUser = function () {
		if (self.user.username === '' || self.user.password === '' || self.user.family === '') {
			self.message = "Username, family and password must all be entered!";

		} else {
			// a new user is creating a new  and therefore defaults to registering user is defaulted as a parent and will add children users under there account
			self.user.role = 'parent';
			console.log('sending to server...', self.user);
			$http.post('/api/user/register', self.user).then(function (response) {
					console.log('success');
					$location.path('/home');
				},
				function (response) {
					console.log('error');
					self.message = "Something went wrong. Please try again."
				});
		}
	}
}]);
