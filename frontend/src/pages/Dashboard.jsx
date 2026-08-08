import "./Dashboard.css";

import DashboardCards from "../components/DashboardCards/DashboardCards";

function Dashboard() {
  return (
    <div className="dashboard-home">
      <DashboardCards />

      <h1>Welcome to the Dashboard</h1>
    </div>
  );
}

export default Dashboard;
