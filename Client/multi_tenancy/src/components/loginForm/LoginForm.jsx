import React, { useState } from "react";
import "./LoginForm.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookie from "js-cookie";
import { toast } from "react-hot-toast";

function LoginForm() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  console.log("Form Data ", formData);

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/login",
        formData
      );

      if (response.status === 200) {
        toast.success("Login successful! Redirecting to Products...");

        console.log("Auth Token: ", response.data.token);
        Cookie.set("authToken", response.data.token, { expires: 1 });

        setFormData({
          username: "",
          password: "",
        });
        setTimeout(() => {
          navigate("/products");
        }, 1000);
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred during login. Try again.");
      setMessage("An error occurred during registration.");
    }
  };

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>Login</h1>
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

export default LoginForm;
