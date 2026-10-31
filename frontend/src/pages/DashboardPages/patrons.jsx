import { useEffect, useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import { createPatron, getPatrons, updatePatron } from "../../api/patron.api";
import "./patrons.css";

function Patrons() {
  const [showForm, setShowForm] = useState(false);
  const [patrons, setPatrons] = useState([]);
  const [editingPatron, setEditingPatron] = useState(null);
  const handleEdit = (patron) => {
    setEditingPatron({
      id: patron.id,
      fullName: patron.fullName,
      rfid_uid: patron.rfid_uid,
      status: patron.status,
    });
  };
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await updatePatron(editingPatron.id, {
        fullName: editingPatron.fullName,
        rfid_uid: editingPatron.rfid_uid,
        status: editingPatron.status,
      });

      setEditingPatron(null);

      await fetchPatrons();
    } catch (error) {
      console.error("Update patron error:", error);

      setError(error.response?.data?.message || "Failed to update patron.");
    }
  };
  const [loadingPatrons, setLoadingPatrons] = useState(true);
  const fetchPatrons = async () => {
    try {
      setLoadingPatrons(true);

      const response = await getPatrons();

      console.log("Patrons:", response);

      setPatrons(response.data || []);
    } catch (error) {
      console.error("Failed to fetch patrons:", error);

      setError(error.response?.data?.message || "Failed to load patrons.");
    } finally {
      setLoadingPatrons(false);
    }
  };
  useEffect(() => {
    fetchPatrons();
  }, []);
  const [formData, setFormData] = useState({
    fullName: "",
    rfid_uid: "",
  });

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await createPatron(formData);

      console.log("Patron created:", response);
      await fetchPatrons();
      setMessage("Patron created successfully.");

      setFormData({
        fullName: "",
        rfid_uid: "",
      });

      setShowForm(false);
    } catch (error) {
      console.error("Create patron error:", error);

      setError(error.response?.data?.message || "Failed to create patron.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patrons-page">
      {/* HEADER */}

      <div className="patrons-header">
        <div>
          <h1>Patrons</h1>

          <p>Manage library patrons and their RFID cards.</p>
        </div>

        <button
          className="add-patron-btn"
          onClick={() => {
            setShowForm(true);
            setMessage("");
            setError("");
          }}
        >
          <FaPlus />
          Add Patron
        </button>
      </div>

      {/* SUCCESS MESSAGE */}

      {message && <div className="success-message">{message}</div>}

      {/* ERROR MESSAGE */}

      {error && <div className="error-message">{error}</div>}

      {/* PATRON TABLE */}

      <div className="patrons-card">
        <div className="table-header">
          <h2>Library Patrons</h2>

          <span>
            {patrons.length} {patrons.length === 1 ? "Patron" : "Patrons"}
          </span>
        </div>

        <div className="patrons-table-container">
          {loadingPatrons ? (
            <div className="loading-patrons">Loading patrons...</div>
          ) : patrons.length === 0 ? (
            <div className="empty-patrons">
              <p>No patrons registered yet.</p>

              <button onClick={() => setShowForm(true)}>Add your first patron</button>
            </div>
          ) : (
            <table className="patrons-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Full Name</th>
                  <th>RFID UID</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {patrons.map((patron, index) => (
                  <tr key={patron.id}>
                    <td>{index + 1}</td>

                    <td>
                      <strong>{patron.fullName}</strong>
                    </td>

                    <td>
                      <span className="rfid-badge">{patron.rfid_uid}</span>
                    </td>

                    <td>
                      <span className="status-active">{patron.status}</span>
                    </td>
                    <td>
                      <span
                        className={
                          patron.status === "NORMAL_PATRON" ? "status-normal" : "status-problematic"
                        }
                      >
                        {patron.status}
                      </span>
                    </td>

                    <td>
                      <button className="edit-button" onClick={() => handleEdit(patron)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ADD PATRON MODAL */}

      {showForm && (
        <div className="modal-overlay">
          <div className="patron-modal">
            <div className="modal-header">
              <div>
                <h2>Add New Patron</h2>

                <p>Register a patron and associate their RFID card.</p>
              </div>

              <button className="close-modal" onClick={() => setShowForm(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>

                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter patron full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>RFID UID</label>

                <input
                  type="text"
                  name="rfid_uid"
                  value={formData.rfid_uid}
                  onChange={handleChange}
                  placeholder="e.g. sccom003122"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
                  Cancel
                </button>

                <button type="submit" className="save-patron-btn" disabled={loading}>
                  {loading ? "Saving..." : "Save Patron"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {editingPatron && (
        <div className="edit-overlay">
          <div className="edit-modal">
            <h2>Edit Patron</h2>

            <form onSubmit={handleUpdate}>
              <label>Full Name</label>

              <input
                type="text"
                value={editingPatron.fullName}
                onChange={(e) =>
                  setEditingPatron({
                    ...editingPatron,
                    fullName: e.target.value,
                  })
                }
                required
              />

              <label>RFID UID</label>

              <input
                type="text"
                value={editingPatron.rfid_uid}
                onChange={(e) =>
                  setEditingPatron({
                    ...editingPatron,
                    rfid_uid: e.target.value,
                  })
                }
                required
              />

              <label>Patron Status</label>

              <select
                value={editingPatron.status}
                onChange={(e) =>
                  setEditingPatron({
                    ...editingPatron,
                    status: e.target.value,
                  })
                }
              >
                <option value="NORMAL_PATRON">Normal Patron</option>

                <option value="PROBLEMATIC_PATRON">Problematic Patron</option>
              </select>

              <div className="edit-actions">
                <button type="button" onClick={() => setEditingPatron(null)}>
                  Cancel
                </button>

                <button type="submit">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Patrons;
