const multer = require('multer');
const fs = require('fs').promises;

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadPath = 'uploads/';
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage, limits: { files: 5 } }); // Set the limit for the number of files

module.exports = upload;
