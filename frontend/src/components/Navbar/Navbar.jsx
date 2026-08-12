import "./dashboard-navbar.css";

import { useEffect, useState } from "react";
import { FaBell, FaSearch, FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getUnreadNotifications } from "../../api/notification.api";

function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  const today = new Date();

  const date = today.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadNotifications = async () => {
    try {
      const response = await getUnreadNotifications();

      setUnreadCount(response.data?.length || 0);
    } catch (error) {
      console.error("Failed to load unread notifications:", error);
    }
  };

  useEffect(() => {
    fetchUnreadNotifications();

    // Check for new notifications every 5 seconds
    const interval = setInterval(() => {
      fetchUnreadNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
        <Link to="/dashboard/notifications" className="notification-bell">
          <FaBell />

          {unreadCount > 0 && (
            <span className="notification-count">{unreadCount > 99 ? "99+" : unreadCount}</span>
          )}
        </Link>

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
