import getPrismaInstance from "../utils/PrismaClient.js";
import { renameSync } from "fs";
import { generateAESKey, encryptWithAES, encryptAESKeyWithRSA, generateHMAC } from "../utils/cryptoFunctions.js";
import crypto from 'crypto';

export const addMessage = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const { message, from, to } = req.body;
    const getUser = onlineUsers.get(to);

    if (message && from && to) {
      const aesKey = generateAESKey();
      const encryptedAESKey = await encryptAESKeyWithRSA(parseInt(to, 10), aesKey);

      // Encrypt message using AES
      const iv = crypto.randomBytes(16);
      const encryptedMessage = encryptWithAES(message, aesKey, iv);
      const encryptedMessageString = encryptedMessage.toString('base64');
      console.log("Encrypted Message:", encryptedMessageString);
      const hmacKey = process.env.HMAC_KEY; // Shared HMAC key
      const hmac = generateHMAC(encryptedMessage, hmacKey);

      const newMessage = await prisma.messages.create({
        data: {
          message,
          sender: { connect: { id: parseInt(from) } },
          reciever: { connect: { id: parseInt(to) } },
          messageStatus: getUser ? "delivered" : "sent",
          encryptedAESKey,
          encryptedMessage: encryptedMessageString,
          iv: iv.toString('base64'),
          hmac,
        },
        include: { sender: true, reciever: true },
      });
      return res.status(201).send({ message: newMessage });
    }
    return res.status(400).send("From, to and Message is required");
  } catch (err) {
    next(err);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const { from, to } = req.params;

    const messages = await prisma.messages.findMany({
      where: {
        OR: [
          {
            senderId: parseInt(from),
            recieverId: parseInt(to),
          },
          {
            senderId: parseInt(to),
            recieverId: parseInt(from),
          },
        ],
      },
      orderBy: { id: "asc" },
    });
    const unreadMessages = [];
    messages.forEach((message, index) => {
      if (
        message.messageStatus !== "read" &&
        message.senderId === parseInt(to)
      ) {
        messages[index].messageStatus = "read";
        unreadMessages.push(message.id);
      }
    });
    await prisma.messages.updateMany({
      where: { id: { in: unreadMessages } },
      data: { messageStatus: "read" },
    });
    res.status(200).json({ messages });
  } catch (err) {
    next(err);
  }
};

export const addImageMessage = async (req, res, next) => {
  try {
    if (req.file) {
      const date = Date.now();
      let fileName = "uploads/images/" + date + req.file.originalname;
      renameSync(req.file.path, fileName);
      const prisma = getPrismaInstance();
      const { from, to } = req.query;
      if (from && to) {
        const hmacKey = process.env.HMAC_KEY; // Shared HMAC key
        const hmac = generateHMAC(fileName, hmacKey);

        const message = await prisma.messages.create({
          data: {
            message: fileName,
            sender: { connect: { id: parseInt(from) } },
            reciever: { connect: { id: parseInt(to) } },
            type: "image",
            hmac: hmac,
          },
        });
        return res.status(201).json({ message });
      }
      return res.status(400).send("From,to is required");
    }
    return res.status(400).send("Image is required");
  } catch (err) {
    next(err);
  }
};

export const addAudioMessage = async (req, res, next) => {
  try {
    if (req.file) {
      const date = Date.now();
      let fileName = "uploads/recordings/" + date + req.file.originalname;
      renameSync(req.file.path, fileName);
      const prisma = getPrismaInstance();
      const { from, to } = req.query;
      if (from && to) {
        const hmacKey = process.env.HMAC_KEY; // Shared HMAC key
        const hmac = generateHMAC(fileName, hmacKey);

        const message = await prisma.messages.create({
          data: {
            message: fileName,
            sender: { connect: { id: parseInt(from) } },
            reciever: { connect: { id: parseInt(to) } },
            type: "audio",
            hmac: hmac,
          },
        });
        return res.status(201).json({ message });
      }
      return res.status(400).send("From,to is required");
    }
    return res.status(400).send("Audio is required");
  } catch (err) {
    next(err);
  }
};

export const getInitialContactswithMessages = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.from);
    const prisma = getPrismaInstance();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        sentMessages: {
          include: {
            reciever: true,
            sender: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        recievedMessages: {
          include: {
            reciever: true,
            sender: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    const messages = [...user.sentMessages, ...user.recievedMessages];
    messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const users = new Map();
    const messageStatusChange = [];

    messages.forEach((msg) => {
      const isSender = msg.senderId === userId;
      const calculatedId = isSender ? msg.recieverId : msg.senderId;

      if (msg.messageStatus === "sent") {
        messageStatusChange.push(msg.id);
      }

      const {
        id,
        type,
        message,
        messageStatus,
        createdAt,
        senderId,
        recieverId,
        encryptedMessage,
        encryptedAESKey,
        iv,
        hmac,
      } = msg;

      if (!users.get(calculatedId)) {
        const user = {
          messageId: id,
          type,
          message,
          messageStatus,
          createdAt,
          senderId,
          recieverId,
          encryptedMessage,
          encryptedAESKey,
          iv,
          hmac,
          ...isSender ? msg.reciever : msg.sender,
        };

        users.set(calculatedId, user);
      }
    });

    if (messageStatusChange.length) {
      await prisma.messages.updateMany({
        where: { id: { in: messageStatusChange } },
        data: { messageStatus: "delivered" },
      });
    }

    return res.status(200).json({
      users: Array.from(users.values()).map(({ totalUnreadMessages, ...rest }) => rest),
      onlineUsers: Array.from(onlineUsers.keys()),
    });
  } catch (err) {
    next(err);
  }
};