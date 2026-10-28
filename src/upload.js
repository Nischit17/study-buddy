import multer from "multer";

const MAX_SIZE_MB = 5;

// Accept ONE file from the form field named "file": PDF only, max 5 MB.
// memoryStorage keeps the file in RAM (req.file.buffer); we only need its text.
export const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (file.mimetype !== "application/pdf") {
      const error = new Error("Only PDF files are allowed");
      error.status = 400;
      return callback(error);
    }
    callback(null, true);
  },
}).single("file");
