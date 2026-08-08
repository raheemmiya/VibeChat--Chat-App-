import React, { useEffect, useRef, useState } from "react";
import assests from "../assets/assests";
import { UseProfile } from "../../contexts/profilesContext";
import { useSocket } from "../../contexts/socketContext";
import { useUser } from "../../contexts/useUser";
import { useMessage } from "../../contexts/messageContext";

function formatTime(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const ChatContainer = () => {
  const { sendMessage } = useSocket();
  const {socket, onlineUsers} = useSocket();
  const { selectedUser } = UseProfile();
  const { user } = useUser();
  const { getMessages, messages , getLastMessages} = useMessage();

  const bottomRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const loadMessages = async () => {
      await getMessages(user._id, selectedUser._id);
    };
    loadMessages();

    // mark seen to the just message loaded users 
    if (socket) {
      //tell the server the message is seen
       socket.emit('mark-seen', {senderId:selectedUser._id, recieverId: user._id})
    }
  }, [selectedUser, socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function checkIfOnline(userId){ 
    return onlineUsers.includes(userId)
  }

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = e.target.text.value;
    let imageUrl = "";

    if (selectedImage) {
      const formData = new FormData();
      formData.append("image", selectedImage);
      const response = await fetch("http://localhost:3000/api/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      imageUrl = data.secure_url;
    }

    sendMessage({
      senderId: user._id,
      recieverId: selectedUser._id,
      message,
      image: imageUrl,
    });

    setSelectedImage(null);
    setImagePreview(null);
    e.target.reset();
  };

  return (
    <div className="flex flex-col h-full w-full ">
      {/* chat header */}
      <div className=" h-16 flex  flex-col items-center justify-center px-4 m-2">
        {/* name and avatar container */}
        <div className="h-[90%] flex justify-center  items-center gap-4 px-4">
          <div className="h-12 w-12 rounded-full overflow-hidden">
            <img
              className="h-full w-full object-cover"
              src={selectedUser.avatar || assests.avatarIcon}
              alt=""
            />
          </div>

          <div className="max-w-full">
            <h2 className="text-lg ">
              {selectedUser.firstName + " " + selectedUser.lastName}
            </h2>
            {checkIfOnline(selectedUser._id) ? (
              <div className="text-green-500  flex items-center justify-center gap-3">
                <span className="bg-green-400 rounded-full h-2 p-2"></span>
                Online
              </div>
            ) : (
              <div className="text-gray-500 flex items-center gap-3 justify-center">
                <span className="bg-red-50 rounded-full h-2 p-2"></span>
                Offline
              </div>
            )}
          </div>
        </div>
        {/* small bottom border line */}
        <div className="w-[80%] h-1 border-b-2 border-white"> </div>
      </div>

      {/* chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
        {messages &&
          messages.map((item, index) => {
            const isSender = item.senderId === user._id;

            const currentDate = new Date(item.createdAt).toDateString();
            const previousDate =
              index > 0
                ? new Date(messages[index - 1].createdAt).toDateString()
                : null;
            const showDateDivider = currentDate !== previousDate;
            const isLastSenderMessage =
              isSender && index === messages.length - 1;

            return (
              <div key={item._id || index}>
                {/* Date Divider */}
                {showDateDivider && (
                  <div className="flex items-center justify-center my-4">
                    <div className="px-4 py-1 text-xs text-gray-400 bg-white/10 rounded-full">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                )}

                {/* Message */}
                <div
                  className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] flex flex-col ${isSender ? "items-end" : "items-start"}`}
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt="attachment"
                        className="max-w-[220px] rounded-2xl mb-1 border border-white/10"
                      />
                    )}
                    {item.message && (
                      <div
                        className={`px-4 py-2 text-sm leading-relaxed break-words shadow-sm ${
                          isSender
                            ? "bg-gradient-to-br bg-purple-800 text-white rounded-2xl rounded-br-sm"
                            : "bg-[#23232e] text-gray-100 rounded-2xl rounded-bl-sm"
                        }`}
                      >
                        {item.message}
                      </div>
                    )}
                    <span className="text-[10px] text-gray-500 mt-1 px-1">
                      {formatTime(item.timestamps || item.createdAt)}
                    </span>
                    {isLastSenderMessage && (
                      <span className="text-[10px] text-gray-500 mt-0.5 px-1">
                        {item.seen ? "Seen" : "Delivered"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        <div ref={bottomRef} />
      </div>

      {/* image preview strip */}
      {imagePreview && (
        <div className="px-4 pb-2">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="preview"
              className="h-20 rounded-lg border border-white/10"
            />
            <button
              type="button"
              onClick={() => {
                setSelectedImage(null);
                setImagePreview(null);
              }}
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
            ></button>
          </div>
        </div>
      )}

      {/* chat input box */}
      <form onSubmit={handleSubmit}>
        <div className="h-16 pb-3 flex items-center justify-center p-2">
          <div className="h-full w-full flex items-center justify-center backdrop:blur-sm bg-white/20 rounded-[25px] mx-4">
            {/* image upload icon */}
            <input
              type="file"
              id="image"
              accept="image/png, image/jpeg"
              hidden
              onChange={handleImageChange}
            />
            <label htmlFor="image" className="h-8 w-8 m-2 cursor-pointer ">
              <img
                className="w-full h-full object-contain"
                src={assests.imageUploadIcon}
                alt=""
              />
            </label>

            {/* user text input field */}
            <div className=" m-2 overflow-hidden flex-1 h-10 w-full mx-2 px-2 flex items-center">
              <input
                className="focus:outline-none bg-transparent focus-ring:2 focus:ring-white/50 w-full h-full"
                type="text"
                name="text"
                placeholder="Send a message.."
              />
            </div>
          </div>
          {/* send button */}
          <button type="submit" className="h-8 w-8 mr-2 cursor-pointer">
            <img
              className="w-full h-full object-contain"
              src={assests.sendIcon}
              alt=""
            />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatContainer;
