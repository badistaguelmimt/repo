import { Server } from "socket.io";
import { setupChatSocket } from "../socket/chat.socket.js";

// Initialise Socket.IO et le rattache au serveur HTTP Express.
// On lui passe l'URL du frontend pour autoriser les connexions cross-origin.
export const initSocket = (server, { origin }) => {
    const io = new Server(server, {
        cors: {
            origin,
            credentials: true,
        },
    });

    // Délègue toute la logique métier du chat au module dédié
    setupChatSocket(io);

    console.log("Socket.IO initialisé");
    return io;
};
