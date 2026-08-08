const shelfService = require("../services/shelf.service");

const create = async (req, res, next) => {
  try {
    const shelf = await shelfService.create(req.body);

    res.status(201).json({
      success: true,
      data: shelf,
    });
  } catch (err) {
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const shelves = await shelfService.getAll();

    res.json({
      success: true,
      data: shelves,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  create,
  getAll,
};
