const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Mongoose Schema

const TasksSchema = new Schema({
	taskname: { type: String, required: true },
	category: { type: String, required: true },
	duedate: { type: Date, required: true },
	assignedto: { type: String, required: true },
	assignedby: { type: String, required: true },
	pointvalue: { type: Number, required: true  },
	confirmed: {  type: Boolean, required: true},
	completed: { type: Boolean, required: true }
});


module.exports = mongoose.model('Tasks', TasksSchema);
