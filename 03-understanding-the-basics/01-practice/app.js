const http = require("http");
const routes = require("./routes.js");

const server = http.createServer(routes.requestHandler);

server.listen(3000, function () {
    console.log("Server is run");
});
