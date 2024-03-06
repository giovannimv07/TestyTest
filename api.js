require("express");
require("mongodb");
require("mongoose");

exports.setApp = function (app, mongoose) {
	const User = require("./models/user.js");
	const Card = require("./models/card.js");
	const generateToken = require("./utils/tokenUtils");

	app.post("/api/register", async (req, res, next) => {
		//=======================================================
		// incoming: firstName, lastName, email, username, password
		// outgoing: error
		//=======================================================
		const { firstName, lastName, email, username, password } = req.body;
		const newUsers = new User({
			FirstName: firstName,
			LastName: lastName,
			Email: email,
			Login: username,
			Password: password,
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
		// const db = client.db("COP4331Cards");
		// const results = await db
		// 	.collection("Cards")
		// 	.find({ Card: { $regex: _search + ".*", $options: "i" } })
		// 	.toArray();

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

	// Email stufff=============================

	app.post('/api/email', async (req, res, next) => {
		// incoming: emaiTo
		// outgoing: error

		var error = '';
		const { emailTo, message, subject, link } = req.body;

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
			to: emailTo,
			subject: subject,
			generateTextFromHTML: true,
			html: `<div><p>${message}</p><a href='${link}'>Click Me!</a></div>`,
		};

		let ret;
		smtpTransport.sendMail(mailOptions, (error, response) => {
			error ? console.log(error) : console.log(response);
			smtpTransport.close();
			//return error ? "error in email" : "";
			ret = { response: response, error: error };
		});

		res.status(200).json(ret);
	});

	// for checking email
	app.get("/api/verify/:token", async (req, res) => {
		const { token } = req.params;

		try {
			// Find the user in the database by the verification token
			const user = await User.findOne({ TokenKey: token });

			if (!user) {
				return res.status(404).json("User not found");
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
