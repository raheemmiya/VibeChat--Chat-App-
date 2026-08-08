import { useState } from "react";
import assests from "../assets/assests";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/useUser";

const LoginPage = () => {
  const { loginUser } = useUser();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(password);

    try {
      await loginUser ({email, password}); 
      navigate('/') 
    } catch (error) {
      console.log(error);
      alert("Login failed. Please check your credentials."); 
    }
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
      <div className="w-[30%] h-[50%] p-4 flex flex-col items-center justify-center border-2 border-purple-600 rounded-xl">
        {/* title */}
        <span className="text-5xl pb-4">Login</span>
        {/* login form */}
        <form
          className="flex justify-center flex-col items-center"
        >
          <label htmlFor="email">Email: </label>
          <input
            className="input-style"
            type="text"
            placeholder="Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <br />
          <label htmlFor="password">Password: </label>
          <input
            className="input-style"
            type="password"
            id="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></input>
          {/* login button */}
          <button
            className="bg-black text-white px-6 py-3 mt-2 rounded-lg border-purple-700 border-2"
            type="submit"
            onClick={handleSubmit}
          >
            Login
          </button>
        </form>
        {/* signup navigation form */}
        <span className="m-0 w-full flex justify-end items-end cursor-pointer text-white">
          {" "}
          <i className="" >
            {" "}
            <u>Don't have an account?</u>
          </i>{" "}
        </span>
      </div>
    </div>
  );
};

export default LoginPage;
