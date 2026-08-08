import { createContext, useContext, useState } from "react";

// Context:
export const UserContext = createContext();

// Provider
export const UserProvider = ({ children }) => {
  const testVar = "this is a test variable from userContext";
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);


  const getAllUsers = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const users = await response.json();
      setAllUsers(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const registerUser = async (userData) => {
    const response = await fetch("http://localhost:3000/api/registerUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    console.log(response);

    setUser(userData);
  };

  const loginUser = async (body) => {
    try {
      const response = await fetch("http://localhost:3000/api/loginUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log(data);
      

      if (!response.ok) {
        // Handle HTTP errors (4xx, 5xx)
        throw new Error(data.message || "Login failed");
      }

      setUser(data);

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error; // Re-throw so caller can handle it
    }
  };

  const logOutUser = () => {
    setUser(null);
  };

  const updateUser = async (body) => {
    // Update user logic here
    const response = await fetch("http://localhost:3000/api/updateUser", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...body, email: user.email }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.Error || "Update failed");
    }
    setUser(data);
    return data;
  };

  const value = {
    registerUser,
    loginUser,
    logOutUser,
    updateUser,
    user,
    testVar,
    getAllUsers, 
    allUsers
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
