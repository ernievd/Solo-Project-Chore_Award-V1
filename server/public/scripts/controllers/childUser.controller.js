myApp.controller('ChildUserController', ['ChildUserService' , '$location', function (ChildUserService, $location) {
	console.log('ChildUserController created');
	//taskName, childName, dueDate, assignedBy, pointValue

	let self = this;

	self.childUserService = ChildUserService;

	//TODO - Can we reove this?
	self.userObjectObject = ChildUserService.userObject;

	self.childUserService.getuser();
	self.childUserService.taskArray = [];
	self.childUserService.getTasks();



	self.task = {
		taskName: '',
		childName: '',
		category: '',
		dueDate: '',
		pointValue: '',
	};//End self.task

	self.childAddTaskToDatabase = function () {
		// console.log('childUserIndex is :', self.childUserIndex);
		// console.log('self.task object is : ', self.task);
		index = self.childUserIndex;

		// self.task.childName = self.childUserService.userArray[index].username;
		console.log('self.childUserService.userObject is', self.childUserService.userObject);
		console.log('self.childUserService.userObject name is', self.childUserService.userObject.username);

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
			self.childUserService.addTaskToDatabase(self.task);
			//clear the fields TODO - set up a promise
			self.task = {};
			self.childUserIndex = null;
			// self.parentTask.$setPristine();
		}
	};

	// self.checkForAwardCompletion = function (){
	// 	if (self.childUserService.userObject.pointsRemaining <= 0){
	// 		console.log('AWARD CAN BE GIVEN!!');
	// 	}
	// };//End self.checkForAwardCompletion

}]);