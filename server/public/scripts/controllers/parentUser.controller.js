myApp.controller('ParentUserController', ['ParentUserService' , '$location', function (ParentUserService, $location) {
	//console.log('ParentUserController created');

	let self = this;
	self.userArray = [];

	self.parentUserService = ParentUserService;
	//TODO - Can we reove this?
	self.userObjectObject = ParentUserService.userObject;

	self.parentUserService.getTasks();
	self.parentUserService.userArray = [];
	self.parentUserService.getUsers();

	self.addUser = function (role) {
		if (typeof self.addUserObject === 'undefined' || typeof role === 'undefined') {
			alert('All fields must be entered!');
		}
		else {
			ParentUserService.addUserObject = self.addUserObject;
			self.parentUserService.addUser(role).then(function (response) {
				self.addUserObject = {};
			});
		}
	}; //End self.addUser

	self.task = {
		taskName: '',
		childName: '',
		category: '',
		dueDate: '',
		pointValue: '',
	};

	self.addTaskToDatabase = function () {
		index = self.childUserIndex;
		self.task.childName = self.parentUserService.userArray[index].username;
		self.task.user_id = self.parentUserService.userArray[index]._id;
		if (self.task.taskName === '' || self.task.childName === '' || self.task.category === '' || self.task.dueDate === ''
			|| self.task.pointValue === '') {
			self.message = "All task fields must be be completed";
		}
		else {
			self.parentUserService.addTaskToDatabase(self.task);
			self.task = {};
			self.childUserIndex = null;
		}
	};


	//// To use if we add a modal
	//let modal = document.getElementById('myModal');
	//// Get the button that opens the modal
	//let btn = document.getElementById("myBtn");
	//// Get the <span> element that closes the modal
	//let span = document.getElementsByClassName("close")[0];
	//// When the user clicks the button, open the modal
	// self.openModal = function() {
	// 	modal.style.display = "block";
	// };

	// When the user clicks anywhere outside of the modal, close it
	// self.closeModal = function(event) {
	// 	// if (event.target == modal) {
	// 		modal.style.display = "none";
	// 	// }
	// }

}]);


