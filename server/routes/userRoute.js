import express, { response } from "express";
import { User } from "../model/User.js";
import {
  loginUser,
  registerUser,
  updateUser,
  getAllUsers
} from "../controller/userController.js";

const userRouter = express.Router();

userRouter.post("/registerUser", async (req, res) => {
  try {
    
    const response = await registerUser(req.body);
    console.log("from userroute: " + response);
    res.status(201).json(response);
  } catch (error) {
    res.status(404).json(response);
  }
});

userRouter.post("/loginUser", async (req, res) => {
  try {
    
    const response = await loginUser(req.body);

    if (!response) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json({
      firstName: response.firstName,
      lastName: response.lastName,
      bio: response.bio,
      email: response.email,
      avatar: response.avatar,
      _id: response._id
    });
  } catch (error) {
    return res.status(404).json({
      error: "Login failed",
      message: error.message,
    });
  }
});

userRouter.put("/updateUser", async (req, res) => {
  try {
    const response = await updateUser(req.body);
    res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      error: "Update failed",
      message: error.message,
    });
  }
});

userRouter.get("/users", async (req, res) =>{ 
  try {
    const response = await getAllUsers();
    res.status(200).json(response)
  } catch (error) {
    
  }
})

export default userRouter;
