const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/');
  },
  filename: (req, file, cb) => {

    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

module.exports.uploadAvatar = (req, res) => {
  upload.single('avatar')(req, res, function (err) {
    if (err) {
      return res.status(500).send('Có lỗi xảy ra khi tải lên.');
    }
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
    const avatarURL = '/images/' + req.file.filename;
    res.render("../views/profile.pug", {
        avatarURL
    })
  });
};

