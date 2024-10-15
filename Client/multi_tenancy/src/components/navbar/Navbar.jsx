import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <ul className="navbar-links">
        <li>
          <Link to="/login" className="nav-link">
            Login
          </Link>
        </li>
        <li>
          <Link to="/register" className="nav-link">
            Register
          </Link>
        </li>
      
      </ul>
    </nav>
  );
}

export default Navbar;
