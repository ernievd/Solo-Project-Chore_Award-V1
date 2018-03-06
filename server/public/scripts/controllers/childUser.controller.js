myApp.controller('ChildUserController', ['ChildUserService' , '$location', function (ChildUserService,) {
	console.log('ChildUserController created');

	let self = this;

	self.childUserService = ChildUserService;

	self.childUserService.getChildUser();
	self.childUserService.taskArray = [];
	self.childUserService.getChildTasks();

	self.task = {
		taskName: '',
		childName: '',
		category: '',
		dueDate: '',
		pointValue: '',
	};//End self.task

	self.childAddTask = function () {
		index = self.childUserIndex;
		self.task.childName = self.childUserService.userObject.username;
		self.task.user_id = self.childUserService.userObject._id;
		self.task.pointValue = 0;
		self.task.assignedby = self.task.childName;
		self.task.confirmed = false;
		self.task.completed = false;
		if (self.task.taskName === '' || self.task.category === '' || self.task.dueDate === '') {
			self.message = "All task fields must be be completed";
		}
		else {
			self.childUserService.addChildTaskToDatabase(self.task);
			self.task = {};
			self.childUserIndex = null;
		}
	};//End self.childAddTask

}]);