// const nodemailer = require("nodemailer");

// module.exports = async (email, subject, text) => {
// 	try {
// 		const transporter = nodemailer.createTransport({
// 			host: process.env.HOST,
// 			// service: process.env.SERVICE,
// 			port: 587,
// 			// secure: false,
// 			auth: {
// 				user: process.env.USER,
// 				pass: process.env.PASS,
// 			},
// 			// tls: {
// 			// 	minVersion: "TLSv1",
// 			// },
// 		});

// 		await transporter.sendMail({
// 			from: process.env.USER,
// 			to: email,
// 			subject: subject,
// 			html: text,
// 		});
// 		console.log("Email sent Successfully");
// 	} catch (e) {
// 		console.log("Email not sent");
// 		console.log(e);
// 	}
// };

// ===============================================
// Some testy test
// ===============================================
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const generateToken = require("./tokenUtils");
const verificationToken = generateToken();

const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
	"23471699850-ffffaboh9mqeq4pb59dcbi1e8o3tp1u9.apps.googleusercontent.com", // ClientID
	"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", // Client Secret
	"https://developers.google.com/oauthplayground" // Redirect URL
);

oauth2Client.setCredentials({
	refresh_token:
		"1//04ROIGOOQVs5rCgYIARAAGAQSNwF-L9IrzW2B-jwLkoxxhIw-DAjZaih2o_7GgVJExhoBIx4Tlx0UhU2NnjCODjM4IbO8EitQ9f0",
});

const accessToken = oauth2Client.getAccessToken();

const smtpTransport = nodemailer.createTransport({
	service: "gmail",
	auth: {
		type: "OAuth2",
		user: "bbbtesty@gmail.com",
		clientId:
			"23471699850-ffffaboh9mqeq4pb59dcbi1e8o3tp1u9.apps.googleusercontent.com",
		clientSecret: "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",
		refreshToken:
			"1//04ROIGOOQVs5rCgYIARAAGAQSNwF-L9IrzW2B-jwLkoxxhIw-DAjZaih2o_7GgVJExhoBIx4Tlx0UhU2NnjCODjM4IbO8EitQ9f0",
		accessToken: accessToken,
	},
});

const mailOptions = {
	from: "bbbtesty@gmail.com",
	to: "bbbtesty@gmail.com",
	subject: "Node.js Email with Secure OAuth",
	generateTextFromHTML: true,
	html: `Click the following link to verify your email: <a href='http://localhost:5000/verify/${verificationToken}'>Click here</a>`,
};

async function sending() {
	smtpTransport.sendMail(mailOptions, (error, response) => {
		error ? console.log(error) : console.log(response);
		smtpTransport.close();
		return error ? "error in email" : "";
	});
}
module.exports = { sending };
