import { useState } from "react";
import "./Settings.css";

function Settings() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [notifications, setNotifications] = useState({
    enabled: true,
    problematicPatron: true,
    unauthorizedBook: true,
    smartShelf: true,
  });

  const [librarySettings, setLibrarySettings] = useState({
    libraryName: "Library System",
    borrowingPeriod: 14,
    maxBooks: 3,
  });

  const handleNotificationChange = (name) => {
    setNotifications({
      ...notifications,
      [name]: !notifications[name],
    });
  };

  const handleLibraryChange = (e) => {
    setLibrarySettings({
      ...librarySettings,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    console.log("Notification settings:", notifications);
    console.log("Library settings:", librarySettings);

    alert("Settings saved successfully.");
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your library system preferences.</p>
        </div>
      </div>

      {/* ACCOUNT */}
      <div className="settings-card">
        <div className="settings-card-header">
          <h2>Account</h2>
          <p>Your librarian account information.</p>
        </div>

        <div className="settings-grid">
          <div className="settings-field">
            <label>Full Name</label>

            <input type="text" value={user?.fullName || ""} readOnly />
          </div>

          <div className="settings-field">
            <label>Email</label>

            <input type="email" value={user?.email || ""} readOnly />
          </div>
        </div>

        <button className="secondary-button">Change Password</button>
      </div>

      {/* NOTIFICATIONS */}
      <div className="settings-card">
        <div className="settings-card-header">
          <h2>Notifications</h2>
          <p>Choose which library events should generate alerts.</p>
        </div>

        <div className="settings-options">
          <label className="setting-option">
            <div>
              <strong>Enable Notifications</strong>
              <span>Receive notifications from the library system.</span>
            </div>

            <input
              type="checkbox"
              checked={notifications.enabled}
              onChange={() => handleNotificationChange("enabled")}
            />
          </label>

          <label className="setting-option">
            <div>
              <strong>Problematic Patron Alerts</strong>
              <span>Alert when a problematic patron enters the library.</span>
            </div>

            <input
              type="checkbox"
              checked={notifications.problematicPatron}
              onChange={() => handleNotificationChange("problematicPatron")}
            />
          </label>

          <label className="setting-option">
            <div>
              <strong>Unauthorized Book Alerts</strong>
              <span>Alert when an unborrowed library book attempts to exit.</span>
            </div>

            <input
              type="checkbox"
              checked={notifications.unauthorizedBook}
              onChange={() => handleNotificationChange("unauthorizedBook")}
            />
          </label>

          <label className="setting-option">
            <div>
              <strong>Smart Shelf Alerts</strong>
              <span>Alert when suspicious activity occurs on the Smart Shelf.</span>
            </div>

            <input
              type="checkbox"
              checked={notifications.smartShelf}
              onChange={() => handleNotificationChange("smartShelf")}
            />
          </label>
        </div>
      </div>

      {/* LIBRARY */}
      <div className="settings-card">
        <div className="settings-card-header">
          <h2>Library Settings</h2>
          <p>Configure basic library rules.</p>
        </div>

        <div className="settings-grid">
          <div className="settings-field">
            <label>Library Name</label>

            <input
              type="text"
              name="libraryName"
              value={librarySettings.libraryName}
              onChange={handleLibraryChange}
            />
          </div>

          <div className="settings-field">
            <label>Borrowing Period (Days)</label>

            <input
              type="number"
              name="borrowingPeriod"
              min="1"
              value={librarySettings.borrowingPeriod}
              onChange={handleLibraryChange}
            />
          </div>

          <div className="settings-field">
            <label>Maximum Books Per Patron</label>

            <input
              type="number"
              name="maxBooks"
              min="1"
              value={librarySettings.maxBooks}
              onChange={handleLibraryChange}
            />
          </div>
        </div>
      </div>

      {/* SYSTEM STATUS */}
      <div className="settings-card">
        <div className="settings-card-header">
          <h2>System Status</h2>
          <p>Current RFID library system components.</p>
        </div>

        <div className="system-status">
          <div className="status-item">
            <span>Backend Server</span>
            <strong className="online">● Online</strong>
          </div>

          <div className="status-item">
            <span>RFID Entrance</span>
            <strong className="online">● Online</strong>
          </div>

          <div className="status-item">
            <span>RFID Exit</span>
            <strong className="online">● Online</strong>
          </div>

          <div className="status-item">
            <span>Smart Shelf</span>
            <strong className="online">● Online</strong>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button className="save-button" onClick={handleSave}>
          Save Settings
        </button>
      </div>
    </div>
  );
}

export default Settings;
