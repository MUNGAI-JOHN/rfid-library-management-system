import { Link } from "react-router-dom";
import "./Sidebar.css";

import {
  FaBell,
  FaBook,
  FaCog,
  FaDoorClosed,
  FaDoorOpen,
  FaExchangeAlt,
  FaHome,
  FaLayerGroup,
  FaSignOutAlt,
  FaUsers,
} from "react-icons/fa";

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="logo">
        <h2>Kabarak</h2>

        <p>Library System</p>
      </div>

      <ul className="menu">
        <li className="active">
          <FaHome />
          <span>Dashboard</span>
        </li>

        <li>
          <Link to="/dashboard/books">
            <FaBook />
            <span>Books</span>
          </Link>
        </li>

        <li>
          <Link to="/dashboard/patrons">
            <FaUsers />
            <span>Patrons</span>
          </Link>
        </li>

        <li>
          <FaLayerGroup />
          <span>Shelves</span>
        </li>

        <li>
          <FaExchangeAlt />
          <span>Borrowing</span>
        </li>

        <li>
          <FaDoorOpen />
          <span>Entrance</span>
        </li>

        <li>
          <FaDoorClosed />
          <span>Exit</span>
        </li>

        <li>
          <FaBell />
          <span>Notifications</span>
        </li>

        <li>
          <FaCog />
          <span>Settings</span>
        </li>
      </ul>

      <div className="logout">
        <FaSignOutAlt />

        <span>Logout</span>
      </div>
    </div>
  );
}

export default Sidebar;
