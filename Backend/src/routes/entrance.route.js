const express = require("express");
const router = express.Router();

const entranceController = require("../controllers/entrance.controllers");
const authenticate = require("../middleware/auth.middleware");

router.post("/scan", entranceController.enterLibrary);
router.get("/entrancelog", authenticate, entranceController.getEntranceLog);

module.exports = router;
