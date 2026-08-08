import assests from "../assets/assests";
import "../index.css";
import { useUser } from "../../contexts/useUser";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { user } = useUser();
  const {updateUser} = useUser();

  const navigate = useNavigate();
  const [name, setName] = useState(
    user ? user.firstName + " " + user.lastName : "Your Name"
  );
  const [bio, setBio] = useState(user ? user.bio : "Your bio goes here.");
  const [avatar, setAvatar] = useState(user && user.avatar? user.avatar : assests.avatarIcon);

  const handleSubmit = async (e) => { 
    e.preventDefault();
    // Handle form submission logic here
    console.log("Name:", name);
    console.log("Bio:", bio);
    console.log("Avatar: ", avatar);
    const firstName = name.split(" ")[0];
    const lastName = name.split(" ")[1] || "";
    
    try {
       await updateUser({firstName, lastName, bio, avatar});

    alert("Profile updated successfully!");
    navigate('/')  
    } catch (error) {
      console.log(error);
    }
   
  }

  async function handleUploadImage(e){ 

    
    const newAvatarFile = e.target.files[0];
    console.log("handle upload image func reached" + newAvatarFile);
     if (newAvatarFile) {
      const formData = new FormData();
      formData.append("image", newAvatarFile);
      const response = await fetch("http://localhost:3000/api/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      const avatarUrl = data.secure_url;
      console.log(avatarUrl);
      setAvatar(avatarUrl);
    }
  }


  return (
    <div
      className="flex flex-col items-center justify-center h-screen  bg-cover bg-no-repeat"
      style={{ backgroundImage: `url(${assests.backgroundImage})` }}
    >
      {/* Page heading */}
      <div className=" flex justify-around items-center ">
        <div className="flex-1 h-16">
          {" "}
          <img className="w-16 h-full" src={assests.mainLogo} alt="" />
        </div>
        <div className="flex-1 momo-signature-regular text-4xl text-white">
          {" "}
          VibeChat
        </div>
      </div>
      {/* main container */}
      <div className="backdrop-blur-lg border-2 border-purple-500 border-solid rounded-md flex flex-col justify-center items-center m-0 p-6 pb-12 gap-2">
        {/* form heading */}

        <h2 className="text-gray-400 momo-signature-regular pb-3">
          Edit Profile
        </h2>

        {/* Form container */}
        <form
          action=""
          className="flex w-full items-center justify-around gap-4"
        >
          {/* Avatar Upload div */}
          <div className="">
            <label
              htmlFor="avatar-upload"
              className="flex justify-center items-center rounded-full overflow-hidden w-36 h-36"
            >
              <input
                type="file"
                id="avatar-upload"
                accept="image/jpeg, image/png"
                className=""
                hidden 
                onChange={handleUploadImage}
              />

              <img
                className="h-full w-full object-cover cursor-pointer"
                src={avatar}
                alt=""
              />
            </label>
          </div>

          {/* Name and Bio upload div */}
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Edit Your Name"
              value={name}
              className="input-style"
              onChange={(e) => setName(e.target.value)}
            />
            <textarea
              className="overflow-auto resize-ys [&::-webkit-scrollbar]:hidden scrollbar-none bg-transparent text-white border-2 border-purple-500 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-white/50"
              cols={14}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            ></textarea>

            <div className="w-full flex justify-center items-center">
              <button
                type="submit"
                className="p-3 w-32 rounded-xl text-white bg-purple-800"
                onClick={handleSubmit}
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
