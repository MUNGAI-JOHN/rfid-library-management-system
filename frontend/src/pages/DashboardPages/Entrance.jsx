import { useEffect, useState } from "react";
import { getEntranceLogs } from "../../api/entrance.api";

import "./Entrance.css";

function Entrance() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEntranceLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getEntranceLogs();

      console.log("Entrance logs:", response);

      if (response.success) {
        setLogs(response.data);
      }
    } catch (error) {
      console.error("Get entrance logs error:", error);

      setError(error.response?.data?.message || "Failed to load entrance logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntranceLogs();
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="entrance-page">
      {/* HEADER */}

      <div className="entrance-header">
        <div>
          <h1>Entrance Logs</h1>

          <p>Monitor patrons entering the library.</p>
        </div>

        <button className="refresh-button" onClick={loadEntranceLogs} disabled={loading}>
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {/* ERROR */}

      {error && <div className="error-message">{error}</div>}

      {/* STATISTICS */}

      <div className="entrance-stats">
        <div className="stat-card">
          <p>Total Entries</p>
          <h2>{logs.length}</h2>
        </div>

        <div className="stat-card">
          <p>Today's Entries</p>

          <h2>
            {
              logs.filter((log) => {
                const today = new Date();
                const entryDate = new Date(log.entranceTime);

                return today.toDateString() === entryDate.toDateString();
              }).length
            }
          </h2>
        </div>
      </div>

      {/* TABLE */}

      <div className="entrance-card">
        <div className="table-header">
          <div>
            <h2>Entrance History</h2>

            <p>Patrons recorded by the entrance RFID reader.</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading entrance logs...</div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <h3>No entrance records</h3>

            <p>Entrance records will appear here when patrons scan their RFID cards.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Patron RFID</th>
                  <th>Entrance Time</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log, index) => (
                  <tr key={log.id}>
                    <td>{index + 1}</td>

                    <td>
                      <div className="patron-info">
                        <span className="patron-icon">👤</span>

                        <strong>{log.patronRfid}</strong>
                      </div>
                    </td>

                    <td>{formatDate(log.entranceTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Entrance;
