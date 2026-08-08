const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const shelfController = require("../controllers/shelf.controller");

router.post("/create", authenticate, shelfController.create);

router.get("/", authenticate, shelfController.getAll);

module.exports = router;
