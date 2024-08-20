import { userSocketIDs } from "../app.js";
import { Chat } from "../Models/chat.js";

export const getOtherMember = (members, userId) =>
  members.find((member) => member._id.toString() !== userId.toString());

export const getSockets = (users = []) => {
  const sockets = users.map((user) => userSocketIDs.get(user.toString()));

  return sockets;
};

export const getBase64 = (file) =>
  `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

export const getAllChatMembers = async (user) => {
  try {
    // Retrieve all chats from the database
    const chats = await Chat.find({ members: user._id }) // Assuming 'members' field contains user IDs
    const allMembers = chats.flatMap(chat => chat.members.map(member => member.toString())).filter((member) => member.toString() !== user._id.toString());

    // Remove duplicates if needed
    const uniqueMembers = Array.from(new Set(allMembers))
    return uniqueMembers;
  } catch (error) {
    console.error('Error retrieving chat members:', error);
    return []; // Ensure it returns an array
  }
}