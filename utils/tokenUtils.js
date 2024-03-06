const crypto = require("crypto");

function generateToken() {
	const tokenLength = 32; // You can adjust the length of the token as needed
	return crypto.randomBytes(tokenLength).toString("hex");
}

module.exports = generateToken;
