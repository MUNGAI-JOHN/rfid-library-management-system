const patronService = require("../services/patron.service");

const create = async (req, res, next) => {
  try {
    const patron = await patronService.create(req.body);

    res.status(201).json({
      success: true,
      data: patron,
    });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const patrons = await patronService.getAll();

    res.status(200).json({
      success: true,
      data: patrons,
    });
  } catch (error) {
    next(error);
  }
};

// const getPatronsByStatus = async (req, res, next) => {
//   try {
//     const patrons = await patronService.getPatronsByStatus();

//     res.status(200).json({
//       success: true,
//       data: patrons,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

const update = async (req, res, next) => {
  try {
    const patron = await patronService.update(req.params.id, req.body);

    res.status(200).json({
      success: true,
      data: patron,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getAll,
  update,
  // getPatronsByStatus,
};
