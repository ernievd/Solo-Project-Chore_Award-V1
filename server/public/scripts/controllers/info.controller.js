myApp.controller('InfoController', ['ParentUserService', function (ParentUserService) {
	console.log('InfoController created');
	let self = this;
	self.parentUserService = ParentUserService;
}]);
