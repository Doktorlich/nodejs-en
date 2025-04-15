const fs = require("fs");

const users = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const requestHandler = function (req, res) {
    const url = req.url;
    const method = req.method;
    if (url === "/") {
        res.writeHead(200, { "content-type": "text/html" });
        res.write("<html>");
        res.write("<head><title>Default page</title></head>");
        res.write("<body><h1>Some text for default page '/'</h1></body>");
        res.write("</html>");
        return res.end();
    }
    if (url === "/users" && method === "GET") {
        res.writeHead(200, { "content-type": "text/html" });
        res.write("<html>");
        res.write("<head><title>Users page</title></head>");
        res.write("<ul>");
        users.forEach(user => {
            return res.write(`<body> <li>User ${user} </li></body>`);
        });
        res.write("</ul>");
        res.write("</html>");
        return res.end();
    }
    if (url === "/create-user" && method === "GET") {
        res.writeHead(200, { "content-type": "text/html" });
        res.write("<html>");
        res.write("<head><title>Create users</title></head>");
        res.write(`<body><form action="/create-user" method="POST">
						<label for="username">Input user</label>
						<input type="text" name="username" >
						<button type="submit">Submit user</button>
						</form></body>`);
        res.write("</html>");
        return res.end();
    }
    if (url === "/create-user" && method === "POST") {
        const arrayUsers = [];
        req.on("data", chunk => arrayUsers.push(chunk));
        return req.on("end", () => {
            const parsedArrayUsers = Buffer.concat(arrayUsers).toString();
            const message = parsedArrayUsers.split("=")[1];
            console.log(message);
            res.writeHead(302, { location: "/create-user" });
            return res.end();
        });
    }
    res.writeHead(404, { "content-type": "text/html" });
    return res.end("Error 404");
};

module.exports = {
    requestHandler,
};
