import multer from "multer";

const multerUpload = multer({
  limits: { fileSize: 1024 * 1024 * 5 },
});

const singleAvatar = multerUpload.single("avatar");

const multiple = multerUpload.single("files", 4);

export { multerUpload, singleAvatar, multiple };
