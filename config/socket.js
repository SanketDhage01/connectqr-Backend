import { Server } from 'socket.io';

let io = null;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    // Client joins their personal user room (used for receiving system alerts, new chat starts)
    socket.on('join_owner', (ownerId) => {
      socket.join(ownerId);
      console.log(`Socket [${socket.id}] joined owner room: ${ownerId}`);
    });

    // Client joins a specific conversation room (for sending/receiving text/typing events)
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`Socket [${socket.id}] joined conversation room: ${conversationId}`);
    });

    // Typing activity indicator
    socket.on('typing', ({ conversationId, senderType, senderName }) => {
      socket.to(conversationId).emit('typing', { senderType, senderName });
    });

    socket.on('stop_typing', ({ conversationId, senderType }) => {
      socket.to(conversationId).emit('stop_typing', { senderType });
    });

    // Mark messages as read receipt
    socket.on('read_receipt', ({ conversationId, senderType }) => {
      socket.to(conversationId).emit('read_receipt', { conversationId, senderType });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  return io;
};
