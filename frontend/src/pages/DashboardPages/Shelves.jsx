import { useEffect, useState } from "react";
import { createShelf, getShelves } from "../../api/shelf.api";

import "./Shelves.css";

function Shelves() {
  // =========================
  // SHELVES
  // =========================
  const [shelves, setShelves] = useState([]);

  // =========================
  // ADD SHELF FORM
  // =========================
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    shelfName: "",
    description: "",
  });

  // =========================
  // MESSAGES & LOADING
  // =========================
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const [shelvesLoading, setShelvesLoading] = useState(true);

  // =========================
  // GET ALL SHELVES
  // =========================
  const loadShelves = async () => {
    try {
      setShelvesLoading(true);
      setError("");

      const response = await getShelves();

      console.log("Shelves:", response);

      if (response.success) {
        setShelves(response.data);
      }
    } catch (error) {
      console.error("Get shelves error:", error);

      setError(error.response?.data?.message || "Failed to load shelves.");
    } finally {
      setShelvesLoading(false);
    }
  };

  // Load shelves when page opens
  useEffect(() => {
    loadShelves();
  }, []);

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // OPEN FORM
  // =========================
  const handleOpenForm = () => {
    setMessage("");
    setError("");

    setFormData({
      shelfName: "",
      description: "",
    });

    setShowForm(true);
  };

  // =========================
  // CLOSE FORM
  // =========================
  const handleCloseForm = () => {
    setShowForm(false);

    setFormData({
      shelfName: "",
      description: "",
    });

    setMessage("");
    setError("");
  };

  // =========================
  // CREATE SHELF
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await createShelf(formData);

      console.log("Shelf created:", response);

      setMessage("Shelf created successfully.");

      setFormData({
        shelfName: "",
        description: "",
      });

      // Refresh shelves
      await loadShelves();

      // Close form
      setShowForm(false);
    } catch (error) {
      console.error("Create shelf error:", error);

      setError(error.response?.data?.message || "Failed to create shelf.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shelves-page">
      {/* =========================
          PAGE HEADER
      ========================= */}
      <div className="shelves-header">
        <div>
          <h1>Shelves</h1>

          <p>Manage and monitor your library shelves.</p>
        </div>

        <button type="button" className="add-shelf-button" onClick={handleOpenForm}>
          + Add Shelf
        </button>
      </div>

      {/* =========================
          SUCCESS MESSAGE
      ========================= */}
      {message && <div className="success-message">{message}</div>}

      {/* =========================
          ERROR MESSAGE
      ========================= */}
      {error && <div className="error-message">{error}</div>}

      {/* =========================
          ADD SHELF FORM
      ========================= */}
      {showForm && (
        <div className="shelf-form-card">
          <div className="form-title">
            <div>
              <h2>Add New Shelf</h2>

              <p>Create a shelf for your library books.</p>
            </div>

            <button type="button" className="close-form-button" onClick={handleCloseForm}>
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* SHELF NAME */}
            <div className="form-group">
              <label>Shelf Name</label>

              <input
                type="text"
                name="shelfName"
                value={formData.shelfName}
                onChange={handleChange}
                placeholder="e.g. A, B, C or Computer Science"
                required
              />
            </div>

            {/* DESCRIPTION */}
            <div className="form-group">
              <label>Description</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe this shelf..."
                rows="4"
              />
            </div>

            {/* BUTTONS */}
            <div className="form-buttons">
              <button type="button" className="cancel-button" onClick={handleCloseForm}>
                Cancel
              </button>

              <button type="submit" className="submit-shelf-button" disabled={loading}>
                {loading ? "Creating Shelf..." : "Create Shelf"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================
          SHELVES
      ========================= */}
      <div className="shelves-section">
        <div className="shelves-section-header">
          <h2>Library Shelves</h2>

          <span>
            {shelves.length} {shelves.length === 1 ? "shelf" : "shelves"}
          </span>
        </div>

        {shelvesLoading ? (
          <p>Loading shelves...</p>
        ) : shelves.length === 0 ? (
          <div className="empty-shelves">
            <h3>No shelves yet</h3>

            <p>Create your first shelf to start organizing books.</p>

            <button type="button" onClick={handleOpenForm}>
              + Add Shelf
            </button>
          </div>
        ) : (
          <div className="shelves-grid">
            {shelves.map((shelf) => (
              <div className="shelf-card" key={shelf.id}>
                {/* SHELF HEADER */}
                <div className="shelf-card-header">
                  <div>
                    <h3>Shelf {shelf.shelfName}</h3>

                    <p>{shelf.description || "No description"}</p>
                  </div>

                  <div className="book-count">{shelf.books?.length || 0}</div>
                </div>

                {/* BOOKS */}
                <div className="shelf-books">
                  <h4>Books on shelf</h4>

                  {!shelf.books || shelf.books.length === 0 ? (
                    <p className="no-books">No books currently on this shelf.</p>
                  ) : (
                    <div className="shelf-book-list">
                      {shelf.books.map((book) => (
                        <div className="shelf-book" key={book.id}>
                          <div>
                            <strong>{book.bookTitle}</strong>

                            <small>RFID: {book.rfid_bid}</small>
                          </div>

                          <span>{book.location}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Shelves;
