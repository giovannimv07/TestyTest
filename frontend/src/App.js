import React from "react";
import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import CardPage from "./pages/CardPage";
import VerifyPage from "./pages/VerifyPage";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" index element={<LoginPage />} />
				<Route path="/cards" index element={<CardPage />} />
				<Route path="/verify" index element={<VerifyPage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
