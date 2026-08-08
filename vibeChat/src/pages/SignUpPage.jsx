import React from "react";
import assests from "../assets/assests";
import { useFetcher, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUser } from "../../contexts/useUser";

const SignUpPage = () => {
  const { registerUser } = useUser();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("");

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  }

  const submitData = async (e) => {
    e.preventDefault();
    console.log("DATA submitted from frontend");
    let avatarUrl = "";
    avatarUrl = avatarFile;

    //send the avatar to the server to get the cloudinary which wil be uploaded to the database now:
    if (avatarFile) {
      const formData = new FormData();
      formData.append("image", avatarFile);
      const response = await fetch("http://localhost:3000/api/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      avatarUrl = data.secure_url;
      console.log(avatarUrl);
    }

    await registerUser({
      firstName,
      lastName,
      bio,
      email,
      password,
      avatar: avatarUrl
    });

    navigate("/login");
  };

  return (
    // main container
    <div className="w-screen h-screen flex flex-col items-center justify-center login-page-background text-purple-600 font-bold ">
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

      {/* main field*/}
      <div className="w-[50%] h-[80%] p-4 flex flex-col items-center justify-center border-2 border-purple-600 rounded-xl">
        {/* title */}
        <span className="text-5xl pb-4">SignUp</span>

        {/* Signup form */}
        <form
          className="flex justify-center flex-col items-center"
          action="POST"
        >
          <div className="flex justify-center items-center p-9 gap-5">
            {/* 1st div of form: without button, includes upload image div  */}

            {/* text form */}
            <div className="w-[50%] h-full">
              <label htmlFor="firstName">Enter your first name</label>
              <input
                type="text"
                className="input-style"
                required
                value={firstName}
                placeholder="First name"
                onChange={(e) => setFirstName(e.target.value)}
              />
              <label htmlFor="LastName">Enter your last name</label>
              <input
                type="text"
                className="input-style"
                required
                placeholder="last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />

              <label htmlFor="description">Your Bio: </label>
              <textarea
                className="bg-transparent border-2 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                name="description"
                id=""
                cols="35"
                rows="5"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              ></textarea>

              <label htmlFor="email">Email: </label>
              <input
                className="input-style"
                type="text"
                id="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <br />
              <label htmlFor="">Password: </label>
              <input
                className="input-style"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              ></input>
            </div>

            {/* Avatar form */}
            <div className="  flex-col  align-middle justify-center items-center">
              <label
                htmlFor="profileAvatar"
                className="flex p-2 mb-6  cursor-pointer items-center justify-center overflow-hidden rounded-full text-white border-purple-400 border-2"
              >
                Upload profile picture
              </label>

              {/* image div */}
              <div className=" h-52 w-52 rounded-full border-purple-700 border-4 overflow-hidden">
                <input
                  className="hidden"
                  type="file"
                  accept="image/jpeg image/png"
                  id="profileAvatar"
                  src=""
                  alt="upload an avatar"
                  onChange={handleAvatarChange}
                />
                {avatarPreview && (
                  <img
                    src={avatarPreview}
                    alt="your profile picture goes here!!"
                    srcset=""
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Signup button */}
          <button
            className="bg-black text-white px-6 py-3 mt-2 rounded-lg border-purple-700 border-2"
            onClick={submitData}
          >
            Sign Up
          </button>
        </form>
        {/* signup navigation form */}
        <span className="m-0 w-full flex justify-end items-end cursor-pointer text-white">
          {" "}
          <i onClick={() => navigate("/login")}>
            {" "}
            <u className="text-black">Already have an account?</u>
          </i>{" "}
        </span>
      </div>
    </div>
  );
};

export default SignUpPage;
