const entranceService = require("../services/entrance.service");

const enterLibrary = async (req, res, next) => {
  try {
    const { patronRfid } = req.body;

    const entrance = await entranceService.enterLibrary(patronRfid);

    res.status(201).json({
      success: true,
      message: "Entrance recorded successfully.",
      data: entrance,
    });
  } catch (error) {
    next(error);
  }
};

const getEntranceLog = async (req, res, next) => {
  try {
    const entrancelog = await entranceService.getEntranceLog();
    res.status(200).json({
      success: true,
      data: entrancelog,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enterLibrary,
  getEntranceLog,
};
