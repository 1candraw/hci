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
    // Membuat nama file unik: slip-123456789.jpg atau alatberat-123456.jpg
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const prefix = file.fieldname === 'proof_file' ? 'slip-' : 'upload-';
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter file gambar dan PDF
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung! Hanya gunakan JPG, JPEG, PNG, WEBP, atau PDF.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Batas maksimal 10 MB
  fileFilter: fileFilter
});

module.exports = upload;