import "./dashboard-navbar.css";

import { FaSearch, FaUserCircle } from "react-icons/fa";

function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  const today = new Date();

  const date = today.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="dashboard-navbar">
      <div className="dashboard-navbar-left">
        <h2>Dashboard</h2>

        <p>{date}</p>
      </div>

      <div className="dashboard-navbar-center">
        <div className="dashboard-search-box">
          <FaSearch />

          <input type="text" placeholder="Search books, patrons..." />
        </div>
      </div>

      <div className="dashboard-navbar-right">
        <div className="dashboard-profile">
          <FaUserCircle className="dashboard-profile-icon" />

          <div>
            <h4>{user?.fullName}</h4>

            <small>Librarian</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
