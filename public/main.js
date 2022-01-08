const socket = io();

const msgs = document.getElementById("msgs");
const user = document.getElementById("username");
const terminal = document.getElementById("terminal");
const input = document.getElementById("keyboard-input");
const sendBtn = document.getElementById("send-btn");

const sendMSG = () => {
    const data = {
        input: input.value,
        username: user.value,
        id: socket.id
    }
    socket.emit("msg", data);
}

sendBtn.addEventListener("click", sendMSG);
//CHATROOM
input.addEventListener("keydown", e => { socket.emit("typing", { user: username.value, isTyping: true }); if (e.key == "Enter") sendMSG(); });
input.addEventListener("keyup", () => socket.emit("typing", { user: username.value, isTyping: false }));
socket.on("msg", data => msgs.innerHTML += `<p>${data.username}: ${data.input}</p>`);
socket.on("typing", data => terminal.innerHTML = (data.isTyping) ? `<p>${data.user} is typing...</p>` : "");