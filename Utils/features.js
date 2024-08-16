import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import { v4 as uuid } from "uuid";

export const cookieOptions = {
  maxAge: 15 * 24 * 60 * 60 * 1000,
  sameSite: "none",
  httpOnly: true,
  secure: true,
};

export const sendToken = (res, user, code, message) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

  return res.status(code).cookie("insta-token", token, cookieOptions).json({
    success: true,
    user,
    message,
    token,
  });
};

const getBase64 = (file) =>
  `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

// Function to upload a file to Cloudinary
export const uploadFilesToCloudinary = async (files = []) => {
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        getBase64(file),
        {
          resource_type: "auto",
          public_id: uuid(),
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
    });
  });

  try {
    const results = await Promise.all(uploadPromises);

    const formattedResults = results.map((result) => ({
      public_id: result.public_id,
      url: result.secure_url,
    }));
    return formattedResults;
  } catch (err) {
    throw new Error(`Error uploading files to Cloudinary: ${err.message}`);
  }
};

export const shuffleArray = (array = []) => {
  const mutableArray = [...array]; // Create a mutable copy of the array
  for (let i = mutableArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [mutableArray[i], mutableArray[j]] = [mutableArray[j], mutableArray[i]]; // Shuffle the mutable array
  }
  return mutableArray;
};