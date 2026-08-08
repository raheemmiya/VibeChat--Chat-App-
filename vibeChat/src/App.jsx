import React from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignUpPage from './pages/SignUpPage.jsx'
import ProfilePage from "./pages/ProfilePage.jsx";
import { useUser } from "../contexts/useUser.js";

const App = () => {
  const {user} = useUser();
 
  return (
    <div>

      <Routes>
        <Route path="/" element={user? <HomePage/> : <LoginPage/>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path ="/signup" element = { <SignUpPage/>}/>
        <Route path="/edit-profile" element={<ProfilePage />} />
      </Routes>
    </div>
  );
};

export default App;
