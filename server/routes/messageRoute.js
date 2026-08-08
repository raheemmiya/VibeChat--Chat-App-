import express from "express";
import { createMessage, getAllMessagesByUser, getMessages, uploadImageToCloudinary } from "../controller/messageController.js";
import upload from "../middleware/multer.js";

const messageRouter = express.Router();

messageRouter.post("/send-message", async (req, res) => {
  try {
    const response = await createMessage(req.body);
    res.status(201).json(response);
  } catch (error) {
    console.log(error);
  }
});

messageRouter.get("/get-messages", async (req, res) => {
  try {
    const user1 = req.query.user1;
    const user2 = req.query.user2;
    const response = await getMessages(user1, user2);
    res.status(201).json(response);
  } catch (error) {
    console.log(error);
  }
});

messageRouter.get('/get-messages-by-user', async (req, res) =>{ 
  try {

    const userId = req.query.userId;
    const messages = await  getAllMessagesByUser(userId)
    res.json(messages);
    
  } catch (error) {
    console.log(error);
    
  }
})

// returns { secure_url } to match your frontend's data.secure_url
messageRouter.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }
    const result = await uploadImageToCloudinary(req.file.buffer);
    res.status(200).json({ secure_url: result.secure_url });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Image upload failed" });
  }
});

export default messageRouter;