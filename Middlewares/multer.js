import multer from "multer";

const multerUpload = multer({
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

const upload = multerUpload.single("file");


export { upload };