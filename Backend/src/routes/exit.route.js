const express = require("express");
const router = express.Router();

const exitController = require("../controllers/exit.controllers");

router.post("/scan", exitController.exitLibrary);
router.get("/exitlog", exitController.getExitLogs);

module.exports = router;
