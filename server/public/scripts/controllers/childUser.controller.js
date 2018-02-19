myApp.controller('ChildUserController', ['ChildUserService' , '$location', function (ChildUserService, $location) {
	console.log('ChildUserController created');
	//taskName, childName, dueDate, assignedBy, pointValue

	let self = this;
	self.userArray = [];

	self.childUserService = ChildUserService;
	self.userObjectObject = ChildUserService.userObject;


	self.task = {
		taskName: '',
		childName: '',
		category: '',
		dueDate: '',
		// assignedBy: '',
		pointValue: '',
	};
	self.addTaskToDatabase = function () {
		// console.log('childUserIndex is :', self.childUserIndex);
		// console.log('self.task object is : ', self.task);
		index = self.childUserIndex;

		self.task.childName = self.childUserService.userArray[index].username;
		self.task.user_id = self.childUserService.userArray[index]._id;
		if (self.task.taskName === '' || self.task.childName === '' || self.task.category === '' || self.task.dueDate === ''
			|| self.task.pointValue === '') {
			self.message = "All task fields must be be completed";
		}
		else {
			self.childUserService.addTaskToDatabase(self.task);
			//clear the fields TODO - set up a promise
			self.task = {};
			self.childUserIndex = null;
			// self.parentTask.$setPristine();

		}
	};

}]);