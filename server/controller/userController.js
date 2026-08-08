import { findUserByEmailAndPassword, findUserAndUpdate, User } from "../model/User.js";

export async function getAllUsers() { 
  try {
    const users = await User.find()
    return users;
  } catch (error) {
    
  }
}

export async function registerUser({
  firstName,
  lastName,
  bio,
  email,
  password,
  avatar
}) {
  try {
    const newUser = await User.create({
      firstName: firstName,
      lastName: lastName,
      bio: bio,
      email: email,
      password: password,
      avatar: avatar
    });
    return (newUser)
  } catch (error) {
    return error;
  }
}

export async function loginUser({ email, password }) {
  try {
    const user = await findUserByEmailAndPassword({ email, password });

    if (!user) {
      console.log("User not founded error ");
      return null;
    }
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function updateUser(body) {
  try {
    const { firstName, lastName, bio, avatar, email } = body;

    console.log("Update user in the controller reached");
    
    const updatedUser = await findUserAndUpdate(
     firstName, lastName, bio, avatar, email
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }
    return updatedUser;

  } catch (error) {
    throw error;
  }
}
