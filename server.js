const express = require("express");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get("/tasvivo", (req, res) => res.json("staying alive"));
const server = app.listen(PORT, () => { console.log("listening on port 3000") });

const SocketIO = require("socket.io");
const io = SocketIO(server);

//My vars
let users = [];
////////////////

io.on("connection", socket => {

    const _id = socket.id

    //CHATROOM
    socket.on("msg", data => {
        io.sockets.emit("msg", data);
        console.log(data);
    });

    socket.on("typing", data => {
        socket.broadcast.emit("typing", data);
    });

    //BLOBS
    socket.on("blob:in", data => {
        socket.broadcast.emit("blob:in", data);
        socket.emit("blob:initusers", users);
        data["uid"] = socket.id;
        users.push(data);
    });

    socket.on("blob:move", data => {
        socket.broadcast.emit("blob:move", data);
        let user = users[users.indexOf(users.filter(u => u.uid == _id)[0])];
        user.x = data.x;
        user.y = data.y;
        user.dir = data.dir;
    });

    socket.on("blob:shoot", data => {
        let user = users[users.indexOf(users.filter(u => u.uid == _id)[0])];
        user.size -= 5;
        socket.broadcast.emit("blob:shoot", user);
        // console.log(data + " shoot");
    });
    socket.on("blob:decrease", data => {

        socket.emit("blob:decrease", data);
    });

    //handle data and disconections

    socket.on("blob:users", () => {
        console.log(users);
    });
    socket.on("blob:get-users", () =>
        socket.emit("blob:show-users", users)
    );
    socket.on('disconnect', function() {
        console.log(_id);
        socket.broadcast.emit("blob:delete", users.filter(u => u.uid == _id)[0]);
        users = users.filter(u => u.uid != _id);
    });
})