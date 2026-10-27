import { useEffect, useState } from "react";
import { createBook, getBooks } from "../../api/book.api";
import { getShelves } from "../../api/shelf.api";
import "./Books.css";

function Books() {

  const [books, setBooks] = useState([]);


  const [shelves, setShelves] = useState([]);
  const [shelvesLoading, setShelvesLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    bookTitle: "",
    rfid_bid: "",
    shelfName: "",
  });


  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const [booksLoading, setBooksLoading] = useState(true);

  const loadBooks = async () => {
    try {
      setBooksLoading(true);

      const response = await getBooks();

      if (response.success) {
        setBooks(response.data);
      }
    } catch (error) {
      console.error("Get books error:", error);

      setError(error.response?.data?.message || "Failed to load books.");
    } finally {
      setBooksLoading(false);
    }
  };

  const loadShelves = async () => {
    try {
      setShelvesLoading(true);

      const response = await getShelves();

      console.log("Shelves response:", response);

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


  useEffect(() => {
    loadBooks();
    loadShelves();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleOpenForm = async () => {
    setMessage("");
    setError("");
    setShowForm(true);

    // Refresh shelves whenever the form opens
    await loadShelves();
  };

  const handleCloseForm = () => {
    setShowForm(false);

    setFormData({
      bookTitle: "",
      rfid_bid: "",
      shelfName: "",
    });

    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // Make sure shelf was selected
    if (!formData.shelfName) {
      setError("Please select a shelf.");
      return;
    }

    setLoading(true);

    try {
      const response = await createBook(formData);

      console.log("Book created:", response);

      setMessage("Book added successfully.");

      // Reset form
      setFormData({
        bookTitle: "",
        rfid_bid: "",
        shelfName: "",
      });

      // Refresh book list
      await loadBooks();

      // Close form
      setShowForm(false);
    } catch (error) {
      console.error("Create book error:", error);

      setError(error.response?.data?.message || "Failed to add book.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="books-page">
       <div className="books-header">
        <div>
          <h1>Books</h1>

          <p>Manage books in the library system.</p>
        </div>

        <button type="button" className="add-book-button" onClick={handleOpenForm}>
          + Add Book
        </button>
      </div>

      {message && <div className="success-message">{message}</div>}


      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="book-form-card">
          <div className="form-title">
            <div>
              <h2>Add New Book</h2>

              <p>Register a book and associate it with its RFID tag and shelf.</p>
            </div>

            <button type="button" className="close-form-button" onClick={handleCloseForm}>
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* BOOK TITLE */}
            <div className="form-group">
              <label>Book Title</label>

              <input
                type="text"
                name="bookTitle"
                value={formData.bookTitle}
                onChange={handleChange}
                placeholder="Enter book title"
                required
              />
            </div>

            {/* RFID */}
            <div className="form-group">
              <label>RFID Book ID</label>

              <input
                type="text"
                name="rfid_bid"
                value={formData.rfid_bid}
                onChange={handleChange}
                placeholder="Enter RFID UID"
                required
              />
            </div>

            {/* SHELF */}
            <div className="form-group">
              <label>Shelf</label>

              <select
                name="shelfName"
                value={formData.shelfName}
                onChange={handleChange}
                required
                disabled={shelvesLoading}
              >
                <option value="">{shelvesLoading ? "Loading shelves..." : "Select a shelf"}</option>

                {shelves.map((shelf) => (
                  <option key={shelf.id} value={shelf.shelfName}>
                    Shelf {shelf.shelfName}
                  </option>
                ))}
              </select>
            </div>

            {/* FORM BUTTONS */}
            <div className="form-buttons">
              <button type="button" className="cancel-button" onClick={handleCloseForm}>
                Cancel
              </button>

              <button
                type="submit"
                className="submit-book-button"
                disabled={loading || shelvesLoading}
              >
                {loading ? "Adding Book..." : "Add Book"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="books-list-section">
        <div className="books-list-header">
          <h2>All Books</h2>

          <span>
            {books.length} {books.length === 1 ? "book" : "books"}
          </span>
        </div>

        {booksLoading ? (
          <p>Loading books...</p>
        ) : books.length === 0 ? (
          <p>No books registered yet.</p>
        ) : (
          <div className="books-table-container">
            <table className="books-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>RFID</th>
                  <th>Shelf</th>
                  <th>Location</th>
                </tr>
              </thead>

              <tbody>
                {books.map((book) => (
                  <tr key={book.id}>
                    <td>{book.bookTitle}</td>

                    <td>{book.rfid_bid}</td>

                    <td>{book.shelf?.shelfName || "Not assigned"}</td>

                    <td>{book.location}</td>
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

export default Books;
