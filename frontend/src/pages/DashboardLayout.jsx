import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";

import "./Dashboard.css";

function DashboardLayout() {
  return (
    <div className="dashboard">
      <Sidebar />

      <div className="dashboard-content">
        <Navbar />

        <main className="dashboard-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
