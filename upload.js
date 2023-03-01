const multer = require("multer");
const storage = multer.memoryStorage();

// Define file filter settings for multer
const fileFilter = function (req, file, cb) {
  // Accept only jpeg,jpg and png files
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, JPG and PNG files are accepted."
      ),
      false
    );
  }
};

// Initialize multer middleware with storage and file filter settings
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB file size limit
  },
});

module.exports = upload;
