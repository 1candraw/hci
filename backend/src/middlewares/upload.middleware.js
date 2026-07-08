const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Memastikan folder penyimpanan ada
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi tempat simpan dan nama file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    // Membuat nama file unik: alatberat-123456789.jpg
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'alatberat-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter khusus gambar
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung! Hanya gunakan JPG, JPEG, atau PNG.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Batas maksimal diperbesar jadi 5 MB
  fileFilter: fileFilter
});

module.exports = upload;