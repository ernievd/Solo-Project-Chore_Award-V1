myApp.controller('TaskController', ['TaskService', function(TaskService) {
	console.log('TaskController created');
	var self = this;
	self.taskService = TaskService;
	self.taskObject = TaskService.taskObject;
}]);
