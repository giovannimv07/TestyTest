const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//Create Schema
const UserSchema = new Schema({
	// UserId: {
	// 	type: Number,
	// },
	FirstName: {
		type: String,
		required: true,
	},
	LastName: {
		type: String,
		required: true,
	},
	Email: {
		type: String,
		required: true,
	},
	Login: {
		type: String,
		required: true,
	},
	Password: {
		type: String,
		required: true,
	},
	TokenKey: {
		type: String,
	},
	Verified: { type: Boolean, default: false },
});
module.exports = User = mongoose.model("Users", UserSchema);
