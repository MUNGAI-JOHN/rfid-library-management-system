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

const getExitLogs = async (req, res, next) => {
  try {
    const exitLogs = await exitService.getExitLogs();

    res.status(200).json({
      success: true,
      data: exitLogs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exitLibrary,
  getExitLogs,
};
