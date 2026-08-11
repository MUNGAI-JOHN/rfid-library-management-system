const smartShelfService = require("../services/smartShelf.service");

const scanPatron = async (req, res) => {
  try {
    const { rfid_uid } = req.body;

    const result = await smartShelfService.scanPatron(rfid_uid);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const scanBook = async (req, res) => {
  try {
    const { bookRfid } = req.body;

    const result = await smartShelfService.scanBook(bookRfid);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const capture = async (req, res) => {
  try {
    console.log("========== CAPTURE START ==========");
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    console.log("===================================");

    const { bookRfid } = req.body;

    // Retrieve the active session to get the patronRfid
    if (!bookRfid) {
      return res.status(400).json({
        success: false,
        message: "bookRfid is required",
      });
    }

    if (!req.file) {
      console.log("❌ req.file is undefined");

      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    console.log("✅ IMAGE RECEIVED");
    console.log("Filename:", req.file.filename);
    console.log("Path:", req.file.path);

    const data = await smartShelfService.capture({
      bookRfid,
      imagePath: req.file.path,
    });

    res.status(201).json({
      success: true,
      message: "Capture recorded successfully",
      data,
    });
  } catch (error) {
    console.error("❌ Capture error:", error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  scanPatron,
  scanBook,
  capture,
};
