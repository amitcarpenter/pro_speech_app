import multer from 'multer';
import path from 'path';

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/')); 
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`); 
    },
});

const upload = multer({ storage: storage });
export const uploadImage = upload.single('profileImage');
