import mongoose from "mongoose";

const connectDb = (uri) => {
  mongoose
    .connect(uri, { dbName: "gatherSpot" })
    .then((data) => console.log(`DB Connected To: ${data.connection.host}`))
    .catch((err) => {
      throw err;
    });
};

export { connectDb };
