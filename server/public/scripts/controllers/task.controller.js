myApp.controller('TaskController', ['TaskService', function(TaskService) {
	console.log('ParentUserController created');
	var self = this;
	self.taskService = TaskService;
	self.taskObject = TaskService.taskObject;
}]);
