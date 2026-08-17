// Singleton socket.io instance shared across the app
let io = null;

export const setIO = (ioInstance) => {
  io = ioInstance;
};

export const getIO = () => io;
