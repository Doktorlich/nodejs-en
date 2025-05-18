const { Server } = require("socket.io");
let io;

module.exports = {
    init: httpServer => {
        io = new Server(httpServer, {
            cors: {
                origin: "http://localhost:3000", // или порт вашего фронтенда
                methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
                credentials: true,
            },
        });
        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error("Socked.io not initialized!");
        }
        return io;
    },
};
