import React, { useState } from "react";
// import { jwtDecode } from "jwt-decode";

function Register() {
	var bp = require("./Path.js");
	var firstName;
	var lastName;
	var email;
	var username;
	var password;

	const [message, setMessage] = useState("");

	const doRegister = async (event) => {
		event.preventDefault();
		let code = Math.floor(100000 + Math.random() * 900000);

		var obj = {
			firstName: firstName.value,
			lastName: lastName.value,
			email: email.value,
			username: username.value,
			password: password.value,
			code: code,
		};
		//console.log("Register obj: ", obj);
		var js = JSON.stringify(obj);
		//console.log("Register js: ", js);

		try {
			const response = await fetch(bp.buildPath("api/register"), {
				method: "POST",
				body: js,
				headers: { "Content-Type": "application/json" },
			});

			var res = JSON.parse(await response.text());

			if (res.error) {
				console.log(res.error);
				setMessage("Username is already taken.");
				return;
			} else {
				setMessage("");
				// window.location.href = "/";
			}
		} catch (e) {
			console.log("register error");
			alert(e.toString());
			return;
		}
		// sending email after a susscesfull registration
		let maily = {
			emailTo: email.value,
			message: "Please enter the following code: " + code,
			subject: "Email Verification Code",
			link: "https://www.google.com/",
		};
		//console.log("maily object: ", maily);
		//console.log("maily msg: ", maily.message);
		let jst = JSON.stringify(maily);
		//console.log("Maily: " + JSON.parse(jst));
		try {
			const mailing = await fetch(bp.buildPath("api/email"), {
				method: "POST",
				body: jst,
				headers: { "Content-Type": "application/json" },
			});
			console.log("Mailing: " + JSON.stringify(mailing));

			res = JSON.parse(await mailing.text());
			//console.log("Error: ", res);

			if (res.error) {
				console.log(res.error);
				setMessage("Could not send verification email, try again");
			} else {
				setMessage("");
				window.location.href = "/verify";
			}
		} catch (e) {
			console.log("Mail error");
			alert(e.toString());
			return;
		}
	};

	return (
		<div id="registerDiv">
			<form onSubmit={doRegister}>
				<span id="inner-title">PLEASE Register</span>
				<br />
				<input
					type="text"
					id="firstName"
					placeholder="Username"
					ref={(c) => (firstName = c)}
				/>
				<br />
				<br />
				<input
					type="text"
					id="lastName"
					placeholder="LastName"
					ref={(c) => (lastName = c)}
				/>
				<br />
				<br />
				<input
					type="email"
					id="email"
					placeholder="Email"
					ref={(c) => (email = c)}
				/>
				<br />
				<br />
				<input
					type="text"
					id="username"
					placeholder="Username"
					ref={(c) => (username = c)}
				/>
				<br />
				<br />
				<input
					type="password"
					id="password"
					placeholder="Password"
					ref={(c) => (password = c)}
				/>
				<br />
				<br />
				<input
					type="submit"
					id="registerButton"
					className="buttons"
					value="Do It"
					onClick={doRegister}
				/>
			</form>
			<span id="registerResult">{message}</span>
		</div>
	);
}

export default Register;
