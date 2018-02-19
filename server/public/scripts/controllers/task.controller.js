myApp.controller('TaskController', ['TaskService', function (TaskService) {
	console.log('TaskController created');
	let self = this;
	self.taskService = TaskService;
	self.taskObject = TaskService.taskObject;
}]);
