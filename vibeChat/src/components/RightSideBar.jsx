import React from "react";
import assets from "../assets/assests";
import { UseProfile } from "../../contexts/profilesContext";
import { useMessage } from "../../contexts/messageContext";
import { useUser } from "../../contexts/useUser";

const RightSideBar = () => {
  const { selectedUser, setSelectedUser, setUserSelected } = UseProfile();
  const { user } = useUser();

  const { messages } = useMessage();
  const sharedImages =
    messages && messages.filter((item) => item.image).map((item) => item.image);

  return (
    // main container
    <div className="h-full w-full flex flex-col justify-center items-center gap-6 p-4">
      {/* avatar */}
      <div className=" h-32 w-32 rounded-full overflow-hidden">
        <img
          className="w-full h-full object-cover"
          src={selectedUser.avatar ? selectedUser.avatar : assets.avatarIcon}
          alt=""
        />
      </div>

      {/* bio  */}
      <div>
        <div className="text-lg font-semibold text-center">
          {selectedUser.firstName + " " + selectedUser.lastName}
        </div>
        <div className="text-sm text-gray-400 text-center">
          {selectedUser.bio}
        </div>
      </div>
      {/* shared media */}
      <p>Shared media </p>

      <div className="max-h-[300px] overflow-y-auto">
  <div className="columns-2 gap-2 p-2">
    {sharedImages &&
      sharedImages.map((image) => (
        <img
          key={image}
          src={image}
          alt=""
          className="mb-2 w-full rounded-lg break-inside-avoid"
        />
      ))}
  </div>
</div>
    </div>
  );
};

export default RightSideBar;
