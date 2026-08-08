import { useState } from "react";
import { createBook } from "../../api/book.api";
import "./Books.css";

function Books() {
  const [formData, setFormData] = useState({
    bookTitle: "",
    rfid_bid: "",
    shelfName: "A",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await createBook(formData);

      console.log("Book created:", response);

      setMessage("Book added successfully.");

      setFormData({
        bookTitle: "",
        rfid_bid: "",
        shelfName: "A",
      });
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
          <p>Add books to the library system</p>
        </div>
      </div>

      <div className="book-form-card">
        <div className="form-title">
          <h2>Add New Book</h2>
          <p>Register a book and associate it with its RFID tag.</p>
        </div>

        {message && <div className="success-message">{message}</div>}

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
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

          <div className="form-group">
            <label>Shelf</label>

            <select name="shelfName" value={formData.shelfName} onChange={handleChange}>
              <option value="A">Shelf A</option>
            </select>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Adding Book..." : "Add Book"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Books;
