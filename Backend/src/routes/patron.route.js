const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const patronController = require("../controllers/patron.controllers");

router.post("/create", authenticate, patronController.create);
router.get("/getAll", authenticate, patronController.getAll);
router.put("/:id", authenticate, patronController.update);

module.exports = router;
