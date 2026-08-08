import { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../api/auth.api";
import "./Register.css";

function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");

      return;
    }

    try {
      await registerUser({
        fullName: formData.fullName,

        email: formData.email,

        password: formData.password,
      });

      alert("Registration successful.");

      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h1>Kabarak University</h1>

        <h2>Library Management System</h2>

        <p>Create Librarian Account</p>

        <form onSubmit={handleSubmit}>
          <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} />

          <input type="email" name="email" placeholder="Email Address" onChange={handleChange} />

          <input type="password" name="password" placeholder="Password" onChange={handleChange} />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            onChange={handleChange}
          />

          <button>Create Account</button>
        </form>

        <div className="login-link">
          Already have an account?
          <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
