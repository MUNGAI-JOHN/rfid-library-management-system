const exitService = require("../services/exit.service");

const exitLibrary = async (req, res, next) => {
  try {
    const { patronRfid, bookRfid } = req.body;

    const result = await exitService.exitLibrary(patronRfid, bookRfid);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exitLibrary,
};
