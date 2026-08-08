import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  avatar: { type: String, required: false },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  bio: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export const User = mongoose.model("User", userSchema);

export async function findUserByEmailAndPassword({ email, password }) {
  try {
    const currentUser = await User.findOne({
      email: email,
      password: password,
    });

    if (!currentUser) {
      return null;
    }
    return currentUser;
  } catch (error) {
    console.log(error);
    return;
  }
}

export async function findUserAndUpdate(firstName, lastName, bio, avatar, email) {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      { firstName: firstName, lastName: lastName, bio: bio , avatar: avatar},
      { new: true },
    );
    return updatedUser;
  } catch (error) {
    throw error;
  }
}
