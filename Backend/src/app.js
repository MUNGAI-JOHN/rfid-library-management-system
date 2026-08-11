const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.route");
const patronRoutes = require("./routes/patron.route");
const bookRoutes = require("./routes/book.route");
const borrowingRoutes = require("./routes/borrowing.route");
const entranceRoutes = require("./routes/entrance.route");
const exitRoutes = require("./routes/exit.route");
const shelfRoutes = require("./routes/shelf.route");
const smartshelfRoutes = require("./routes/smartShelf.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/patron", patronRoutes);
app.use("/api/book", bookRoutes);
app.use("/api/shelf", shelfRoutes);
app.use("/api/smartshelf", smartshelfRoutes);
app.use("/api/borrowing", borrowingRoutes);
app.use("/api/entrance", entranceRoutes);
app.use("/api/exit", exitRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

module.exports = app;
