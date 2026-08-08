import { useState } from "react";
import assests from "../assets/assests";
import SideBar from "../components/SideBar";
import ChatContainer from "../components/ChatContainer";
import RightSideBar from "../components/RightSideBar";
import ChatAnywhere from "../components/ChatAnywhere";
import { useUser } from "../../contexts/useUser";
import { UseProfile } from "../../contexts/profilesContext";

const HomePage = () => {
  const { user } = useUser();
  const { selectedUser } = UseProfile();

  return (
    <div
      className="flex items-center justify-center h-screen  bg-cover bg-no-repeat"
      style={{ backgroundImage: `url(${assests.backgroundImage})` }}
    >
      <div className="w-[70%]  h-[75%] backdrop-blur-lg border-2 rounded-md flex justify-center  m-0">
        <div className="text-white flex-1 ">
          <SideBar />
        </div>
        {selectedUser ? (
          <>
            <div className="text-white bg-black/15 backdrop-blur-sm flex-1 min-w-[50%]  ">
              <ChatContainer />
            </div>

            <div className="text-white flex-1">
              <RightSideBar />
            </div>
          </>
        ) : (
          <ChatAnywhere />
        )}
      </div>
    </div>
  );
};

export default HomePage;
