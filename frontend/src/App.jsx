import { BrowserRouter, Route, Routes } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./pages/DashboardLayout";
import Books from "./pages/DashboardPages/Books";
import Borrowing from "./pages/DashboardPages/Borrowing";
import Entrance from "./pages/DashboardPages/Entrance";
import Exit from "./pages/DashboardPages/Exit";
import Notifications from "./pages/DashboardPages/Notifications";
import Patrons from "./pages/DashboardPages/patrons";
import Settings from "./pages/DashboardPages/Settings";
import Shelves from "./pages/DashboardPages/Shelves";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="patrons" element={<Patrons />} />
          <Route path="books" element={<Books />} />
          <Route path="shelves" element={<Shelves />} />
          <Route path="borrowing" element={<Borrowing />} />
          <Route path="entrance" element={<Entrance />} />
          <Route path="exit" element={<Exit />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
