const borrowingService = require("../services/borrowing.service");

const borrowBook = async (req, res) => {
  try {
    const { patronRfid, bookRfid } = req.body;

    const result = await borrowingService.borrowBook({
      patronRfid,
      bookRfid,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Borrow book error:", error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllBorrowings = async (req, res) => {
  try {
    const result = await borrowingService.getAllBorrowings();

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get borrowings error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  borrowBook,
  getAllBorrowings,
};
