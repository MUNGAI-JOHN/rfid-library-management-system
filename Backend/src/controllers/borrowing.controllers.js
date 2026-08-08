const borrowingService = require("../services/borrowing.service");

const borrowBook = async (req, res, next) => {
  try {
    const borrowing = await borrowingService.borrowBook(req.body);

    res.status(201).json({
      success: true,
      message: "Book borrowed successfully.",
      data: borrowing,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  borrowBook,
};
