import { TryCatch } from "../Middlewares/error.js";
import { Chat } from "../Models/chat.js";
import { Message } from "../Models/Message.js";
import { User } from "../Models/user.js";
import ErrorHandler from "../Utils/utility.js";
import { emitEvent } from "../Utils/features.js"
import { REFETCH_CHATS } from "../constants/events.js"
import { getOtherMember } from "../constants/helper.js";

const newChat = TryCatch(async (req, res, next) => {
  const { otherUserId } = req.body;
  const userId = req.user; // Assuming req.user contains the authenticated user's ID
  const user = await User.findById(req.user)
  const otherUser = await User.findById(otherUserId)

  // Check if otherUserId is provided
  if (!otherUserId) {
    return next(new ErrorHandler("Chat Couldn't Create: otherUserId is required", 404));
  }

  // Check if a chat between the two users already exists
  let chat = await Chat.findOne({
    groupChat: false,
    members: { $all: [userId, otherUserId] },
  });

  if (chat) {
    // If chat already exists, return the existing chat
    return res.status(200).json({
      success: true,
      chatAlready: true,
      chatId: chat._id,
    });
  }

  const members = [req.user, otherUserId]
  // Create a new chat if none exists
  chat = await Chat.create({
    members,
    name: `${user.fullName}-${otherUser.fullName}`,
  }),

    emitEvent(req, REFETCH_CHATS, members);

  return res.status(200).json({
    success: true,
    message: "Chat created successfully",
    chat,
  });
});

const getChatList = TryCatch(async (req, res, next) => {
  const chats = await Chat.find({ members: req.user }).populate(
    "members",
    "fullName profile"
  );

  const transformedChats = chats.map(({ _id, name, members, groupChat }) => {
    const otherMember = getOtherMember(members, req.user);

    return {
      _id,
      groupChat,
      avatar: groupChat
        ? members.slice(0, 3).map(({ profile }) => profile.url)
        : [otherMember.profile.url],
      name: groupChat ? name : otherMember.fullName,
      members: members.reduce((prev, curr) => {
        if (curr._id.toString() !== req.user.toString()) {
          prev.push(curr._id);
        }
        return prev;
      }, []),
    };
  });

  return res.status(200).json({
    success: true,
    chats: transformedChats,
  });
});

const getChat = TryCatch(async (req, res, next) => {
  const chat = await Chat.findById(req.params.id).populate(
    "members",
    "fullName profile"
  );

  const otherMember = getOtherMember(chat.members, req.user);
  const transformedChat = {
    _id: chat._id,
    groupChat: chat.groupChat,
    avatar: chat.groupChat
      ? chat.members.slice(0, 3).map(({ profile }) => profile.url)
      : otherMember.profile.url,
    name: chat.groupChat ? chat.name : otherMember.fullName,
    members: chat.members.reduce((prev, curr) => {
      if (curr._id.toString() !== req.user.toString()) {
        prev.push(curr._id);
      }
      return prev;
    }, []),
  };


  return res.status(200).json({
    success: true,
    chat: transformedChat,
  });
})


const sendMessage = TryCatch(async (req, res, next) => {
  const { otherUserId, content, chatId } = req.body;
  const userId = req.user;
  if (!userId || !otherUserId)
    return next(new ErrorHandler("Message Couldn't Sent", 404));
  const chat = await Chat.findById(chatId);
  const message = await Message.create({
    sender: userId,
    chat: chatId,
    reciever: otherUserId,
    content,
  });
  chat.messages.push(message);
  await chat.save();

  return res.status(200).json({
    success: true,
    message: "Message sent",
  });
});

const getAllMessages = TryCatch(async (req, res, next) => {
  const chatId = req.params.id;

  const messages = await Message.find({ chat: chatId }).populate(
    "sender",
    "username profile"
  );

  return res.status(200).json({ success: true, messages });
});

export { newChat, getChat, sendMessage, getAllMessages, getChatList };
