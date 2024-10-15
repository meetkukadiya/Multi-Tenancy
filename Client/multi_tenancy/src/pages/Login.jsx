import React from "react";
import Navbar from "../components/navbar/Navbar";
import "./CSS/Login.css";
import LoginForm from "../components/loginForm/LoginForm";

function Login() {
  return (
    <>
      <div className="">
        <Navbar />
        <LoginForm />
      </div>
    </>
  );
}

export default Login;
