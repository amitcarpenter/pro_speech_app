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

export const upload = multer({ storage: storage });
export const uploadProfileImage = upload.single('profileImage');
export const uploadSectionImage = upload.single('section_image');
export const uploadModuleImage = upload.single('module_image');
export const uploadFile = upload.single('file');
export const uploadMultipleFiles = upload.array('file', 50);



// Initialize upload
export const upload_question = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // Limit file size to 1MB
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    },
}).fields([{ name: 'options', maxCount: 5 }, { name: 'correctOption', maxCount: 1 }]); // Adjust field names and max count as per your requirements

// Check file type
function checkFileType(file: Express.Multer.File, cb: multer.FileFilterCallback) {
    const filetypes = /./; 
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Images only!'));
    }
}