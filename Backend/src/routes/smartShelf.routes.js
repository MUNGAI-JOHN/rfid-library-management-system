const express = require("express");

const upload = require("../middleware/upload.middleware");
const smartShelfController = require("../controllers/smartShelf.controllers");

const router = express.Router();

router.post("/patron-scan", smartShelfController.scanPatron);

router.post("/book-scan", smartShelfController.scanBook);
router.post("/capture", upload.single("image"), smartShelfController.capture);

module.exports = router;
