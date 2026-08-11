const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const borrowingController = require("../controllers/borrowing.controllers");

router.post("/borrow", borrowingController.borrowBook);
router.get("/all", borrowingController.getAllBorrowings);

module.exports = router;
