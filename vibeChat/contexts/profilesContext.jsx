import { createContext, useContext, useState } from "react";

export const ProfileContext = createContext() 

export const UseProfile = () =>{ 
    return useContext(ProfileContext)
} 

export const ProfilesProvider = ({children}) =>{ 
     // users that is selected to chat with
      const [selectedUser, setSelectedUser] = useState("");
      function setUserSelected(user) {
        setSelectedUser(user);
      }
      return ( 
        <ProfileContext.Provider value = {{ 
            selectedUser, setSelectedUser, setUserSelected
        }}>
            {children}
        </ProfileContext.Provider>
      )
}


