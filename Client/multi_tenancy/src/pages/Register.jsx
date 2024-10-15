import React from "react";
import Navbar from "../components/navbar/Navbar";
import "./CSS/Register.css";
import RegisterForm from "../components/register/RegisterForm";

function Register() {
  return (
    <>
      <Navbar className="r-navbar" />
      <RegisterForm className="r-form" />
    </>
  );
}

export default Register;
