const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const bookController = require("../controllers/book.controllers");

router.post("/create", authenticate, bookController.create);
router.get("/all", authenticate, bookController.getBooks);

module.exports = router;
