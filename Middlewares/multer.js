import multer from "multer";

// Set the file size limit to 100MB
const multerUpload = multer({
  limits: { fileSize: 1024 * 1024 * 100 }, // 100MB in bytes
});

// Configure single file upload for an avatar
const singleAvatar = multerUpload.single("avatar");

// Configure multiple file upload, allowing up to 4 files
const attachmentsMulter = multerUpload.array("files", 5);

export { multerUpload, singleAvatar, attachmentsMulter };
