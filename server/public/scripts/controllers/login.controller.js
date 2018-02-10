myApp.controller('LoginController', ['$http', '$location', 'UserService', function($http, $location, UserService) {
    console.log('LoginController created');
    var self = this;
    self.user = {
        username: '',
        family:'',
        password: ''
    };
    self.message = '';

    self.login = function() {
      if(self.user.username === '' || self.user.password === '') {
	      self.message = "Choose a username and password!";
      } else {
        console.log('sending to server...', self.user);
        $http.post('/api/user/login', self.user).then(
        function(response) {
          if(response.status == 200) {
            console.log('success: ', response.data);
            // location works with SPA (ng-route)
            $location.path('/user');
          } else {
            console.log('failure error: ', response);
            self.message = "Incorrect credentials. Please try again.";
          }
        },
        function(response) {
          console.log('failure error: ', response);
          self.message = "Incorrect credentials. Please try again.";
        });
      }
    };

    self.registerUser = function() {
      if(self.user.username === '' || self.user.password === '' || self.user.family === '') {
	      self.message = "Username, family and password must all be entered!";

      } else {
            console.log('sending to server...', self.user);
            $http.post('/api/user/register', self.user).then(function(response) {
            	console.log('success');
          $location.path('/home');
        },
        function(response) {
          console.log('error');
          self.message = "Something went wrong. Please try again."
        });
      }
    }
}]);