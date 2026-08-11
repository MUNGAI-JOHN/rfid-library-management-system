const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Make sure upload directory exists
const uploadDirectory = path.join(__dirname, "../uploads/shelf");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const fileName = `shelf-${Date.now()}${extension}`;

    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  console.log("========== FILE UPLOAD ==========");
  console.log("Filename:", file.originalname);
  console.log("Mimetype:", file.mimetype);
  console.log("=================================");

  const extension = path.extname(file.originalname).toLowerCase();

  const allowedExtensions = [".jpg", ".jpeg", ".png"];

  if (allowedExtensions.includes(extension)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG and PNG images are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;
