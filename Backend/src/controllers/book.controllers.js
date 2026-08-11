const bookService = require("../services/book.service");

const create = async (req, res, next) => {
  try {
    const book = await bookService.create(req.body);

    res.status(201).json({
      success: true,
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

const getBooks = async (req, res, next) => {
  try {
    const books = await bookService.getBooks();
    res.status(200).json({
      success: true,
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getBooks,
};
