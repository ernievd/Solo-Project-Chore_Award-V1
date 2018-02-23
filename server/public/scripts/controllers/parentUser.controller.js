myApp.controller('ParentUserController', ['ParentUserService' , '$location', function (ParentUserService, $location) {
	console.log('ParentUserController created');
	//taskName, childName, dueDate, assignedBy, pointValue



	let self = this;
	self.userArray = [];

	self.parentUserService = ParentUserService;
	self.userObjectObject = ParentUserService.userObject;

	self.parentUserService.getTasks();
	self.parentUserService.userArray = [];
	self.parentUserService.getUsers();



	self.addUser = function (role) {
		ParentUserService.addUserObject = self.addUserObject;
		self.parentUserService.addUser(role);
		//Add a promise and .then to this
		self.addUserObject = {};
		// $location.path('/parentEditUser');
	};

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

		self.task.childName = self.parentUserService.userArray[index].username;
		self.task.user_id = self.parentUserService.userArray[index]._id;
		if (self.task.taskName === '' || self.task.childName === '' || self.task.category === '' || self.task.dueDate === ''
			|| self.task.pointValue === '') {
			self.message = "All task fields must be be completed";
		}
		else {
			self.parentUserService.addTaskToDatabase(self.task);
			//clear the fields TODO - set up a promise
			self.task = {};
			self.childUserIndex = null;
			// self.parentTask.$setPristine();

		}
	};

	// self.changeToEditView = function(award){
	// 	self.parentUserService.awardObject = award;
	// 	self.award = award;
	// 	$location.path('/editAward');
	// 	console.log('self.award object is :', self.award);
	// };

	// self.editAward = function (awardObject) {
	// 	$location.path('/parentUser');
	// 	self.parentUserService.editAward(awardObject);
	// }

}]);