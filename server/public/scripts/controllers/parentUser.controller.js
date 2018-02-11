myApp.controller('ParentUserController', ['ParentUserService', function(ParentUserService) {
  console.log('ParentUserController created');
  var self = this;
  self.parentUserService = ParentUserService;
  self.userObject = ParentUserService.userObject;
}]);
