import React, { useState } from "react";

function Verify() {
	var bp = require("./Path.js");
	let code;
	const [message, setMessage] = useState("");

	const doVerify = async (event) => {
		event.preventDefault();
		var obj = { code: code.value };
		var js = JSON.stringify(obj);
		try {
			const response = await fetch(bp.buildPath("api/verify"), {
				method: "POST",
				body: js,
				headers: { "Content-Type": "application/json" },
			});
			var res = JSON.parse(await response.text());
			if (res.error) {
				console.log(res.error);
				setMessage("Invalid Code");
				return;
			} else {
				setMessage("");
				window.location.href = "/";
			}
		} catch (e) {}
	};

	return (
		<div id="verifyDiv">
			<form onSubmit={doVerify}>
				<span id="title">Insert Code</span>
				<br />
				<input
					type="text"
					id="code"
					placeholder="ex:123456"
					ref={(c) => (code = c)}
				/>
			</form>
			<span id="codeResult">{message}</span>
		</div>
	);
}

export default Verify;
