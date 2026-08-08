const express = require("express");
const router = express.Router();

const entranceController = require("../controllers/entrance.controllers");

router.post("/scan", entranceController.enterLibrary);

module.exports = router;
