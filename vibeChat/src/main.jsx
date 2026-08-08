import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "../contexts/userContext.jsx";
import { SocketProvider } from "../contexts/socketContext.jsx";
import { ProfilesProvider } from "../contexts/profilesContext.jsx";
import { MessageProvider } from "../contexts/messageContext.jsx";

createRoot(document.getElementById("root")).render(
  <UserProvider>
    <SocketProvider>
      <MessageProvider>
        <ProfilesProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ProfilesProvider>
      </MessageProvider>
    </SocketProvider>
  </UserProvider>,
);
