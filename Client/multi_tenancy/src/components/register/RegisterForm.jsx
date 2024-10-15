import React, { useState } from "react";
import "./RegisterForm.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function RegisterForm() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "user",
  });
  console.log("Form Data ", formData);

  const [agree, setAgree] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (!agree) {
  //     setMessage("You must agree to the terms to proceed.");
  //     return;
  //   }

  //   try {
  //     const response = await fetch("http://localhost:5000/register", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(formData),
  //     });

  //     if (response.ok) {
  //       setMessage("Registration successful! Tenant database created.");
  //     } else {
  //       setMessage("Registration failed.");
  //     }
  //   } catch (error) {
  //     console.error("Error:", error);
  //     setMessage("An error occurred during registration.");
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agree) {
      setMessage("You must agree to the terms to proceed.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/register",
        formData
      );

      if (response.status === 201) {
        setFormData({
          username: "",
          password: "",
          role: "user",
        });
        toast.success("Registration successful");
        setMessage("Registration successful! Tenant database created.");
        navigate("/login");
      } else {
        setMessage("Registration failed.");
      }
    } catch (error) {
      toast.error("Registration failed");
      console.error("Error:", error);
      setMessage("An error occurred during registration.");
    }
  };

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <div className="loginsignup-fields">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              id=""
              placeholder="User Name"
              required
            />
            <input
              type="password"
              name="password"
              id=""
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your Password"
              required
            />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="role-dropdown"
              required
            >
              <option value="" disabled selected>
                Select Role
              </option>
              <option value="user" selected>
                User
              </option>
              <option value="admin">Admin</option>
              <option value="employee">Employee</option>
            </select>{" "}
          </div>
          <div className="loginsignup-agree">
            <input
              type="checkbox"
              checked={agree}
              onChange={() => setAgree(!agree)}
            />
            <p>By continuing, I agree to the terms of use & privacy policy.</p>
          </div>
          <button type="submit" onChange={handleSubmit}>
            Continue
          </button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default RegisterForm;
