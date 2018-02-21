const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Mongoose Schema
const AwardsSchema = new Schema({
	awardname: {type: String, required: true},
	pointvalue: {type: Number, required: true},
	link: {type: String, required: false},
	family: {type: String, required: true}
});


module.exports = mongoose.model('Awards', AwardsSchema);
