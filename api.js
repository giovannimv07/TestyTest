require("express");
require("mongodb");
require("mongoose");

exports.setApp = function (app, mongoose) {
	const User = require("./models/user.js");
	const Card = require("./models/card.js");
	const nodemailer = require("nodemailer");
	const { google } = require("googleapis");
	// const generateToken = require("./utils/tokenUtils");

	app.post("/api/register", async (req, res, next) => {
		//=======================================================
		// incoming: firstName, lastName, email, username, password
		// outgoing: error
		//=======================================================
		const { firstName, lastName, email, username, password, code } =
			req.body;
		const newUsers = new User({
			FirstName: firstName,
			LastName: lastName,
			Email: email,
			Login: username,
			Password: password,
			TokenKey: code,
		});
		var error = "";
		try {
			let duplicate = await User.find({ Login: username });
			if (duplicate.length > 0) {
				return res.status(409).json("Username taken");
			} else {
				newUsers.save();
			}
		} catch (e) {
			error = e.toString();
		}
		var ret = { error: error };
		res.status(error ? 500 : 200).json(ret);
	});
	app.post("/api/login", async (req, res, next) => {
		//=======================================================
		// incoming: login, password
		// outgoing: id, firstName, lastName, verified, error
		//=======================================================
		// var error = "";
		const { login, password } = req.body;

		const results = await User.find({ Login: login, Password: password });
		var id = -1;
		var fn = "";
		var ln = "";
		// var ver = false;
		var ret;
		if (results.length > 0) {
			id = results[0].UserId;
			fn = results[0].FirstName;
			ln = results[0].LastName;
			// ver = results[0].Verified;

			try {
				const token = require("./createJWT.js");
				ret = token.createToken(fn, ln, id);
			} catch (e) {
				ret = { error: e.message };
			}
		} else {
			ret = { error: "Login/Password incorrect" };
		}
		res.status(200).json(ret);
	});
	app.post("/api/addcard", async (req, res, next) => {
		//=======================================================
		// incoming: userId, card, jwtToken
		// outgoing: error
		//=======================================================
		var token = require("./createJWT.js");
		const { userId, card, jwtToken } = req.body;

		try {
			if (token.isExpired(jwtToken)) {
				var r = { error: "The JWT is no longer valid", jwtToken: "" };
				res.status(200).json(r);
				return;
			}
		} catch (e) {
			console.log(e.message);
			var r = { error: e.message, jwtToken: "" };
			res.status(200).json(r);
			return;
		}

		const newCard = new Card({ Card: card, UserId: userId });
		var error = "";
		try {
			newCard.save();
		} catch (e) {
			error = e.toString();
		}
		var refreshedToken = null;
		try {
			refreshedToken = token.refresh(jwtToken);
		} catch (e) {
			console.log(e.message);
		}
		var ret = { error: error, jwtToken: refreshedToken };
		res.status(200).json(ret);
	});
	app.post("/api/searchcards", async (req, res, next) => {
		//=======================================================
		// incoming: userId, search
		// outgoing: results[], error
		//=======================================================
		var token = require("./createJWT.js");

		var error = "";
		//===========================================
		// need to check this thing for UserID=======
		//===========================================
		const { userId, search, jwtToken } = req.body;

		try {
			if (token.isExpired(jwtToken)) {
				var r = { error: "The JWT is no longer valid", jwtToken: "" };
				res.status(200).json(r);
				return;
			}
		} catch (e) {
			console.log(e.message);
			var r = { error: e.message, jwtToken: "" };
			res.status(200).json(r);
			return;
		}

		var _search = search.trim();
		const results = await Card.find({
			Card: { $regex: _search + ".*", $options: "i" },
		});

		var _ret = [];
		for (var i = 0; i < results.length; i++) {
			_ret.push(results[i].Card);
		}

		var refreshedToken = null;
		try {
			refreshedToken = token.refresh(jwtToken);
		} catch (e) {
			console.log(e.message);
		}

		var ret = { results: _ret, error: error, jwtToken: refreshedToken };

		res.status(200).json(ret);
	});

	app.post("/api/email", async (req, res, next) => {
		//===========================================
		// incoming: emailTo, message, subject, link
		// outgoing: error
		//===========================================

		var error = "";
		const { emailTo, message, subject, link } = req.body;

		const OAuth2 = google.auth.OAuth2;

		const oauth2Client = new OAuth2(
			process.env.CLIENT_ID, // ClientID
			process.env.CLIENT_SECRET, // Client Secret
			process.env.REDIRECT_URIS
			// Redirect URL
		);

		oauth2Client.setCredentials({
			refresh_token: process.env.REFRESH,
		});

		const accessToken = oauth2Client.getAccessToken();

		const smtpTransport = nodemailer.createTransport({
			service: process.env.SERVICE,
			auth: {
				type: process.env.TYPE,
				user: process.env.USER,
				clientId: process.env.CLIENT_ID,
				clientSecret: process.env.CLIENT_SECRET,
				refreshToken: process.env.REFRESH,
				accessToken: accessToken,
			},
		});

		const mailOptions = {
			from: process.env.FROM,
			to: emailTo,
			subject: subject,
			generateTextFromHTML: true,
			html: `<div><p>${message}</p><a href='${link}'>Click Me!</a></div>`,
		};

		smtpTransport.sendMail(mailOptions, (error, response) => {
			let ret = error
				? { response: "", error: error.message }
				: { response: "Success", error: "" };
			res.status(200).json(ret);
			smtpTransport.close();
			//return error ? "error in email" : "";
		});
	});

	// for checking email
	// Don't delete line 213 is fpr reference
	// app.get("/api/verify/:token", async (req, res) => {
	app.post("/api/verify", async (req, res, next) => {
		//===========================================
		// incoming: code
		// outgoing: error
		//===========================================
		// const { token } = req.params;
		const { code } = req.body;

		try {
			// Find the user in the database by the verification token
			const user = await User.findOne({ TokenKey: code });

			if (!user) {
				return res.status(404).json("Invalid Code");
			}

			// Mark the user as verified
			user.Verified = true;
			user.TokenKey = null;

			await user.save();

			res.status(200).json(
				"Email verification successful. You can now log in."
			);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: error.toString() });
		}
	});
};
