const socket = io();

const msgs = document.getElementById("msgs");
const user = document.getElementById("username");
const terminal = document.getElementById("terminal");
const input = document.getElementById("keyboard-input");
const sendBtn = document.getElementById("send-btn");



sendBtn.addEventListener("click",()=>{
    const data = {
        input: input.value,
        username: user.value,
        id: socket.id
    }
    socket.emit("msg",data);
});
//CHATROOM
input.addEventListener("keydown",()=> socket.emit("typing",{user:username.value,isTyping:true}));
input.addEventListener("keyup",()=> socket.emit("typing",{user:username.value,isTyping:false}));
socket.on("msg",data =>msgs.innerHTML += `<p>${data.username}: ${data.input}</p>` );
socket.on("typing",data =>terminal.innerHTML =(data.isTyping)? `<p>${data.user} is typing...</p>`: "" );
