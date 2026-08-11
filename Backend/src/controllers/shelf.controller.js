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

const getAllShelves = async (req, res, next) => {
  try {
    const shelves = await shelfService.getAllShelves();

    res.status(200).json({
      success: true,
      data: shelves,
    });
  } catch (error) {
    next(error);
  }
};

const getShelfById = async (req, res, next) => {
  try {
    const shelf = await shelfService.getShelfById(req.params.id);

    if (!shelf) {
      return res.status(404).json({
        success: false,
        message: "Shelf not found",
      });
    }

    res.status(200).json({
      success: true,
      data: shelf,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getAllShelves,
  getShelfById,
};
