import logo from "./logo.svg";
import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import { Toaster } from "react-hot-toast";

// import Home from "./components/home/Home";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import Main from "./pages/Main";

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />{" "}
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<Products />} />
      </Routes>
    </Router>
  );
}

export default App;
