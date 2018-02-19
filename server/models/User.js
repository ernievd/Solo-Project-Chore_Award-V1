const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Mongoose Schema
const PersonSchema = new Schema({
	username: {type: String, required: true, index: {unique: true}},
	family: {type: String, required: true},
	role: {type: String, required: true},
	password: {type: String, required: true},
	points_earned: {type: Number, required: false},
	award_id: [{type: Schema.Types.ObjectId, ref: 'awards'}],
	tasks: [{type: Schema.Types.ObjectId, ref: 'tasks'}]
});


module.exports = mongoose.model('User', PersonSchema);

// var personSchema = Schema({
// 	_id: Schema.Types.ObjectId,
// 	name: String,
// 	age: Number,
// 	stories: [{ type: Schema.Types.ObjectId, ref: 'Story' }]
// });
//
// var storySchema = Schema({
// 	author: { type: Schema.Types.ObjectId, ref: 'Person' },
// 	title: String,
// 	fans: [{ type: Schema.Types.ObjectId, ref: 'Person' }]
// });