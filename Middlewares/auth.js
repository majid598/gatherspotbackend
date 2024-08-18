import jwt from "jsonwebtoken";
import ErrorHandler from "../Utils/utility.js";
import { User } from "../Models/user.js";
import { GATHER_SPOT_TOKEN } from "../constants/config.js"

export const isAuthenticated = (req, res, next) => {
  const token = req.cookies[GATHER_SPOT_TOKEN] || req.header("token");

  if (!token) return next(new ErrorHandler("Please Login first", 404));

  const decodeData = jwt.verify(token, process.env.JWT_SECRET);

  req.user = decodeData._id;

  next();
};

export const socketAuthenticator = async (err, socket, next) => {
  try {
    if (err) return next(err);

    const authToken = socket.request.cookies[GATHER_SPOT_TOKEN] || socket.request.headers['token'];

    if (!authToken)
      return next(new ErrorHandler("Please login to access this route", 401));

    const decodedData = jwt.verify(authToken, process.env.JWT_SECRET);

    const user = await User.findById(decodedData._id);

    if (!user)
      return next(new ErrorHandler("Please login to access this route", 401));

    socket.user = user;

    return next();
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Please login to access this route", 401));
  }
};