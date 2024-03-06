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

		var obj = {
			firstName: firstName.value,
			lastName: lastName.value,
			email: email.value,
			username: username.value,
			password: password.value,
		};
		var js = JSON.stringify(obj);

		try {
			const response = await fetch(bp.buildPath("api/register"), {
				method: "POST",
				body: js,
				headers: { "Content-Type": "application/json" },
			});

			var res = JSON.parse(await response.text());

			if (res.error) {
				console.log(res.error);
				//console.log("Suppose to read setMessage");
				setMessage("Username is already taken.");
			} else {
				setMessage("");
				// window.location.href = "/";
			}
		} catch (e) {
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
					class="buttons"
					value="Do It"
					onClick={doRegister}
				/>
			</form>
			<span id="registerResult">{message}</span>
		</div>
	);
}

export default Register;
