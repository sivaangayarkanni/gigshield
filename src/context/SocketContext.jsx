import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children, userId }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Only connect if we have a userId
    if (userId) {
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      newSocket.emit('join_room', userId);

      return () => newSocket.disconnect();
    }
  }, [userId]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
