import Message from "../model/Message.js";
import cloudinary from "../lib/cloudinary.js";
import streamifier from "streamifier";

export async function createMessage(data) {
  try {
    const newMessage = await Message.create({
      senderId: data.senderId,
      recieverId: data.recieverId,
      message: data.message || "",
      image: data.image || "",
      seen: false,
      timestamps: data.timestamps,
    });
    return newMessage;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function getMessages(user1, user2) {
  try {
    const response = await Message.find({
      $or: [
        { senderId: user1, recieverId: user2 },
        { senderId: user2, recieverId: user1 },
      ],
    }).sort({ createdAt: 1 });

    return response;
  } catch (error) {
    console.log(error);
  }
}

export async function getAllMessagesByUser(userId) {
  try {
      const allMessages = Message.find({ 
        $or: [
          {senderId: userId}, 
          {recieverId: userId}
        ]
      }).sort({createdAt: -1})
      return allMessages;

  } catch (error) {
    console.log(error);
  }
}
export async function markMessageSeen(senderId, recieverId) {
  try {
    const response = await Message.updateMany(
      {
        senderId: senderId,
        recieverId: recieverId,
        seen:false
      },
      {
        $set: {
          seen: true,
        },
      },
    );
    return response;
  } catch (error) {
    console.log(error);
  }
}

// uploads a buffer straight to Cloudinary, no temp file needed
export function uploadImageToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "chat-app-images" },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}
