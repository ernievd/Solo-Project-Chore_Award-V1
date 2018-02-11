myApp.controller('InfoController', ['ParentUserService', function(ParentUserService) {
  console.log('InfoController created');
  var self = this;
  self.parentUserService = ParentUserService;
}]);
