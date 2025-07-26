// src/socket.js
import { io } from "socket.io-client";

const soketurl = import.meta.env.VITE_SOCKET_URL;

 let socket = io(soketurl, {
    transports: ['websocket'],
    reconnection: true,
    autoConnect: true,
  });

export default socket;
