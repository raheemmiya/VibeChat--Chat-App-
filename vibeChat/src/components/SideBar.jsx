import React, { useState } from "react";
import assests from "../assets/assests";
import "../index.css";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/useUser";
import { useEffect } from "react";
import { UseProfile } from "../../contexts/profilesContext";
import { useMessage } from "../../contexts/messageContext";
import { useSocket } from "../../contexts/socketContext";

const SideBar = (props) => {
  const [searchTerms, setSearchTerms] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { allUsers, getAllUsers } = useUser();
  const { user } = useUser();
  const { onlineUsers } = useSocket();
  const loggedInUser = user;

  const { messages, getLastMessages, latestMessage, allMessages } =
    useMessage(); // CHANGED: added allMessages
  const navigate = useNavigate();

  const { selectedUser, setSelectedUser, setUserSelected } = UseProfile();

  function sortUsersByRecentMessage(users) {
    const copyUsers = [...users];
    return copyUsers.sort((a, b) => {
      const timeA = latestMessage[a._id] || "1970-01-01";
      const timeB = latestMessage[b._id] || "1970-01-01";

      return timeA > timeB ? -1 : timeA < timeB ? 1 : 0;
    });
  }

  const sortedUsersWithLoggedInUser = sortUsersByRecentMessage(allUsers);
  const sortedUsers = sortedUsersWithLoggedInUser.filter(
    (loggedOutUser) => loggedOutUser._id !== user._id,
  );

  function unSeenMessaageCount(senderId) {
    return allMessages.filter(
      // CHANGED: was `messages`, now `allMessages`
      (message) =>
        senderId === message.senderId &&
        user._id === message.recieverId &&
        !message.seen,
    ).length;
  }

  function checkIfOnline(userId) {
    return onlineUsers.includes(userId);
  }

  //search function users reloading
  function searchUsers() {
    return allUsers.filter((user) => {
      const userName = user.firstName.toLowerCase();
      const searchName = searchTerms.toLowerCase();
      return userName.includes(searchName);
    });
  }
  const searchRelatedUsers = searchUsers();

  //user is changed as of search
  function handleChangeUser(user) {
    setSearchTerms("");
    setSelectedUser(user);
  }

  useEffect(() => {
    getAllUsers();
  }, []);

  useEffect(() => {
    if (user) {
      getLastMessages(user._id);
    }
  }, [user]);

  return (
    <div className="flex flex-col gap-2 items-center justify-start p-4 h-full ">
      {/* logos */}
      <div className="w-full  flex justify-around items-center">
        <div className="flex-1 flex  items-center gap-4 h-16 w-auto p-2">
          {" "}
          <div className="border-2 border-purple-500 h-16 w-16 overflow-hidden rounded-full"> 
          <img
            className="w-full h-full object-cover"
            src={user.avatar ? user.avatar : assests.mainLogo}
            alt=""
            />
          </div>
          {user && <p>Hey, {user.firstName} </p>}
        </div>
        {!selectedUser && (
          <div className="flex-1 momo-signature-regular text-3xl">VibeChat</div>
        )}
        {/* menu */}
        <div
          className="relative z-20 text-white"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <img className="h-9" src={assests.menuIcon2} alt="" />
          {isOpen && (
            <div className="absolute top-8 right-0 bg-black text-white rounded-md shadow-lg w-40">
              <ul className="flex flex-col">
                <li
                  onClick={() =>
                    navigate("edit-profile", { state: selectedUser })
                  }
                  className="px-4 py-2 hover:bg-purple-600 cursor-pointer rounded-t-md"
                >
                  Edit Profile
                </li>
                <li
                  className="px-4 py-2 hover:bg-purple-600 cursor-pointer rounded-b-md"
                  onClick={() => navigate("/signup")}
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* search box */}
      <div className="w-full px-6 flex items-center justify-center z-10">
        <div className="w-full px-6 relative">
          <input
            type="text"
            value={searchTerms}
            onChange={(e) => setSearchTerms(e.target.value)}
            placeholder="Search Users"
            className="rounded-xl bg-purple-800 w-full pl-10 border-2 border-purple-700 px-4 focus:outline-none text-black focus:ring-2 focus:ring-white/50"
          />

          <svg
            className="absolute left-8 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-700"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="100"
            height="100"
            viewBox="0 0 48 48"
          >
            <path
              fill="#616161"
              d="M34.6 28.1H38.6V45.1H34.6z"
              transform="rotate(-45.001 36.586 36.587)"
            ></path>
            <path
              fill="#616161"
              d="M20 4A16 16 0 1 0 20 36A16 16 0 1 0 20 4Z"
            ></path>
            <path
              fill="#37474F"
              d="M36.2 32.1H40.2V44.400000000000006H36.2z"
              transform="rotate(-45.001 38.24 38.24)"
            ></path>
            <path
              fill="#64B5F6"
              d="M20 7A13 13 0 1 0 20 33A13 13 0 1 0 20 7Z"
            ></path>
            <path
              fill="#BBDEFB"
              d="M26.9,14.2c-1.7-2-4.2-3.2-6.9-3.2s-5.2,1.2-6.9,3.2c-0.4,0.4-0.3,1.1,0.1,1.4c0.4,0.4,1.1,0.3,1.4-0.1C16,13.9,17.9,13,20,13s4,0.9,5.4,2.5c0.2,0.2,0.5,0.4,0.8,0.4c0.2,0,0.5-0.1,0.6-0.2C27.2,15.3,27.2,14.6,26.9,14.2z"
            ></path>
          </svg>
          {/* users that are searched container */}
          {searchTerms && searchRelatedUsers.length > 0 && (
            <div className="absolute left-0 top-full z-50 mt-2 w-[70%] rounded-lg border overflow-hidden text-white border-gray-200 bg-black shadow-lg">
              {searchRelatedUsers.map((user) => (
                <button
                  className="hover:bg-purple-400 cursor-pointer p-4 border-b-2 w-full"
                  onClick={() => handleChangeUser(user)}
                >
                  {user.firstName + " " + user.lastName}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* chatheads */}
      <div className="h-full overflow-y-auto  w-full scrollbar-hidden">
        {sortedUsers.map((user) => (


            // users list sidebar div
          <div
            key={user._id}
            className="w-full h-16 px-2 flex items-center justify-start cursor-pointer  hover:opacity-50"
            onClick={() => setUserSelected(user)}
          >
            {/* user details*/}

            {/* avatar */}
            <div className="h-12 w-12  rounded-full overflow-hidden flex items-center justify-center">
              <img
                className="h-full w-full object-cover "
                src={user.avatar ? user.avatar : assests.avatarIcon}
                alt=""
              />
            </div>
            {/* name */}
            <div className="pl-2">
              <h2 className="text-white font-semibold">
                {user.firstName} {user.lastName}
              </h2>
            </div>

            {/* online icon */}
            <div>
              {checkIfOnline(user._id) ? (
                <div className="h-2 w-2 bg-green-400 rounded-full ml-2"></div>
              ) : (
                <div className="h-2 w-2 bg-red-400 rounded-full ml-2"></div>
              )}
            </div>

            {/* messages unread */}
            <div className="ml-auto">
              {unSeenMessaageCount(user._id) > 0 && (
                <div className="bg-purple-700 text-white rounded-full h-4 w-4 flex items-center justify-center  ml-4 text-xs">
                  <p className="text-base">{unSeenMessaageCount(user._id)} </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SideBar;
