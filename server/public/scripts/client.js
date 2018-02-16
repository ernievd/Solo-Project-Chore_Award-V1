let myApp = angular.module('myApp', ['ngRoute']);

/// Routes ///
myApp.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      redirectTo: 'home'
    })
    .when('/home', {
      templateUrl: '/views/templates/home.html',
      controller: 'LoginController as vm',
    })
    .when('/register', {
      templateUrl: '/views/templates/register.html',
      controller: 'LoginController as vm'
    })
    .when('/parentUser', {
	  templateUrl: '/views/templates/parentUser.html',
	  controller: 'ParentUserController as vm',
	  resolve: {
		  getuser: function (ParentUserService) {
			  return ParentUserService.getuser();
		  }
	  }
  })
	  .when('/editTask', {
		  templateUrl: '/views/templates/editTask.html',
		  controller: 'ParentUserController as vm',
		  resolve: {
			  getuser: function (ParentUserService) {
				  return ParentUserService.getuser();
			  }
		  }
	  })

    .when('/info', {
      templateUrl: '/views/templates/info.html',
      controller: 'InfoController as vm',
      resolve: {
        getuser: function (ParentUserService) {
          return ParentUserService.getuser();
        }
      }
    })

	  .when('/logout', {
		  templateUrl: '/views/templates/logout.html',
		  controller: 'TaskController as vm',
		  resolve: {
			  getuser: function (ParentUserService) {
				  return ParentUserService.getuser();
			  }
		  }
	  })
    .otherwise({
      template: '<h1>404</h1>'
    });
}]);
