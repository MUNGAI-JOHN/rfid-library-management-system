import { useEffect, useState } from "react";
import {
  getAllNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../api/notification.api";

import "./Notifications.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const backendUrl = "http://localhost:5121";

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAllNotifications();

      setNotifications(response.data || []);
    } catch (error) {
      console.error("Get notifications error:", error);

      setError(error.response?.data?.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );
    } catch (error) {
      console.error("Mark notification as read error:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error("Mark all as read error:", error);
    }
  };

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  if (loading) {
    return (
      <div className="notifications-page">
        <h1>Notifications</h1>
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1>Notifications</h1>
          <p>Monitor security alerts and library activities.</p>
        </div>

        {unreadCount > 0 && (
          <button className="mark-all-button" onClick={handleMarkAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      {error && <div className="notification-error">{error}</div>}

      <div className="notification-summary">
        <div>
          <strong>{notifications.length}</strong>
          <span>Total Notifications</span>
        </div>

        <div>
          <strong>{unreadCount}</strong>
          <span>Unread</span>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-notifications">
          <h2>No Notifications</h2>
          <p>You don't have any notifications yet.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => {
            const activity = notification.shelfActivity;

            const imageUrl = activity?.imageUrl ? `${backendUrl}${activity.imageUrl}` : null;

            return (
              <div
                key={notification.id}
                className={`notification-card ${!notification.isRead ? "unread" : ""}`}
              >
                <div className="notification-top">
                  <div>
                    <span className={`priority ${notification.priority.toLowerCase()}`}>
                      {notification.priority}
                    </span>

                    <h2>{notification.title}</h2>
                  </div>

                  {!notification.isRead && <span className="unread-dot"></span>}
                </div>

                <p className="notification-message">{notification.message}</p>

                {activity && (
                  <div className="notification-details">
                    <div className="detail-item">
                      <span>Patron</span>
                      <strong>{activity.patron?.fullName || notification.patronRfid}</strong>
                    </div>

                    <div className="detail-item">
                      <span>Book</span>
                      <strong>
                        {activity.book?.bookTitle || notification.bookRfid || "No book"}
                      </strong>
                    </div>

                    <div className="detail-item">
                      <span>Date</span>
                      <strong>{new Date(notification.createdAt).toLocaleString()}</strong>
                    </div>
                  </div>
                )}

                {imageUrl && (
                  <div className="notification-image-section">
                    <h3>Captured Image</h3>

                    <img
                      src={imageUrl}
                      alt="Smart Shelf security capture"
                      className="notification-image"
                      style={{ transform: "rotate(180deg)" }}
                    />

                    <button
                      type="button"
                      className="view-image-button"
                      onClick={() => setSelectedImage(imageUrl)}
                    >
                      View Full Image
                    </button>
                  </div>
                )}

                {!notification.isRead && (
                  <button className="read-button" onClick={() => handleMarkAsRead(notification.id)}>
                    Mark as read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Full-screen Rotated Lightbox Modal */}
      {selectedImage && (
        <div
          className="image-modal-overlay"
          onClick={() => setSelectedImage(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            cursor: "pointer",
          }}
        >
          <img
            src={selectedImage}
            alt="Full view capture"
            style={{
              maxHeight: "90vh",
              maxWidth: "90vw",
              transform: "rotate(180deg)",
              borderRadius: "8px",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Notifications;
