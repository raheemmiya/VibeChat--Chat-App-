import mongoose from "mongoose";

// Function to connect to the database

export const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/vibechat`);
    mongoose.connection.on("connected", () =>
      console.log("Database connected Successfully"),
    );

    mongoose.connection.on("error", (error) =>
      console.log("Connection failed " + error),
    );
    mongoose.connection.on("disconnected", () =>
      console.log("Database disconnected"),
    );
    await mongoose.connect(`${process.env.MONGODB_URI}/vibechat`);
    console.log("Connection state:", mongoose.connection.readyState);
  } catch (error) {
    console.log(error);
  }
};
