myApp.controller('ParentUserController', ['ParentUserService', function(ParentUserService) {
	console.log('ParentUserController created');
	//taskName, childName, dueDate, assignedBy, pointValue

	let self = this;
	self.parentUserService = ParentUserService;
	self.userObjectObject = ParentUserService.userObject;
	self.task = {
		taskName: '',
		childName: '',
        category: '',
		dueDate:'',
		// assignedBy: '',
		pointValue: '',
	};
	self.addTaskToDatabase =function () {
		console.log('childUserIndex is :', self.childUserIndex);
		console.log('self.task object is : ', self.task);
		index = self.childUserIndex;

		self.task.childName = self.parentUserService.childrenArray[index].username;
		self.task.user_id = self.parentUserService.childrenArray[index]._id;
		if (self.task.taskName === '' || self.task.childName === '' || self.task.category === '' || self.task.dueDate === ''
			|| self.task.pointValue === '') {
			self.message = "All task fields must be be completed";
		}
		else {
			self.parentUserService.addTaskToDatabase(self.task);
		}
	}


}]);