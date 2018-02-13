myApp.controller('ParentUserController', ['ParentUserService', function(ParentUserService) {
	console.log('ParentUserController created');
	//taskName, childName, dueDate, assignedBy, pointValue

	var self = this;
	self.parentUserService = ParentUserService;
	self.userObjectObject = ParentUserService.userObject;
	self.task = {
		taskName: '',
		childName:'',
        category: '',
		dueDate:'',
		// assignedBy: '',
		pointValue: ''

	};
	self.addTaskToDatabase =function () {
		console.log('self.task object is : ', self.task);
		if (self.task.taskName === '' || self.task.childName === '' || self.task.category === '' || self.task.dueDate === ''
			|| self.task.pointValue === '') {
			self.message = "All task fields must be be completed";
		}
		else {
			self.parentUserService.addTaskToDatabase(self.task);
		}
	}


}]);