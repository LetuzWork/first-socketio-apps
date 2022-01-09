// const socket = io();

const body = document.querySelector("body");
const size = 50;
let data, myBlob, stamina = true;

//init
const mainBlob = data => { return `
    <div id="${data.id}" class="blob" style="background: #${data.bg}; left: ${data.x}px; top:${data.y}px;">
        <img class="target" src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Aries_symbol_%28fixed_width%29.svg/1200px-Aries_symbol_%28fixed_width%29.svg.png" alt="arrow"/>
    </div>
` }
const blob = data => { return `
    <div id="${data.id}" class="blob" style="background: #${data.bg}; left: ${data.x}px; top:${data.y}px; transform:rotate(${90*data?.dir}deg);">
    </div>
` }

// function getTop() { return parseInt(document.getElementById(data.id).style.top.substring(0, myBlob.style.top.length - 2)); }

// function getLeft() { return parseInt(document.getElementById(data.id).style.left.substring(0, myBlob.style.left.length - 2)); }

function getAxis(obj, axis) { return parseInt(obj.style[axis].substring(0, obj.style[axis].length - 2)); }

window.addEventListener("scroll", () => window.scrollTo(0, 0));
window.addEventListener("load", () => {
    data = {
        bg: Math.floor(Math.random() * 4096).toString(16),
        x: Math.floor(Math.random() * (window.innerWidth - size)),
        y: Math.floor(Math.random() * (window.innerHeight - size)),
        id: Math.floor(Math.random() * 4096).toString(16),
        dir: 0
    }
    body.innerHTML += mainBlob(data);
    body.innerHTML += (`
        <div id="visor:${data.id}" class="visor" style="background: #${data.bg};">${data.id}</div>
    `);
    socket.emit("blob:in", data);
    myBlob = document.getElementById(data.id);
});
socket.on("blob:initusers", users => {
    users.forEach(data => body.innerHTML += blob(data));
});

socket.on("blob:in", data => {
    body.innerHTML += blob(data);
});

socket.on("blob:delete", user => {
    console.log(user);
    const child = document.getElementById(user.id);
    console.log(child);
    body.removeChild(child);
});

const distance = {
    0: () => { return [myBlob.offsetTop, 0, "top"] },
    1: () => { return [window.innerWidth - (myBlob.offsetLeft + size), window.innerWidth - 5, "left"] },
    2: () => { return [window.innerHeight - (myBlob.offsetTop + size), window.innerHeight + 3, "top"] },
    3: () => { return [myBlob.offsetLeft + 3, 0, "left"] }
}
async function shoot() {
    stamina = false;
    myBlob = document.getElementById(data.id);

    const vel = 100,
        bulletId = Math.floor(Math.random() * 10 ** 8);

    const [dist, limit, axis] = distance[data.dir]();

    console.log(dist, limit, axis);
    const bullet = `<div id="${bulletId}" class="bullet" style="left:${myBlob.offsetLeft+size/2}px; top:${myBlob.offsetTop+size/2}px; transition: all  ${dist/vel}s linear;"></div>`
    body.innerHTML += bullet;
    const myBullet = document.getElementById(bulletId);

    await setTimeout(() => myBullet.style[axis] = limit + "px", 100);
    await setTimeout(() => { stamina = true;
        body.removeChild(myBullet) }, (dist / vel) * 1000);
    // socket.emit("blob:shoot",data);
}


//Blob Movement
body.addEventListener("keydown", e => {
    const myBlob = document.getElementById(data.id);

    //movement
    // let left = parseInt(myBlob.style.left.substring(0, myBlob.style.left.length - 2));
    // let top = parseInt(myBlob.style.top.substring(0, myBlob.style.top.length - 2));

    const vel = 5;
    if (e.key == "w") myBlob.style.top = myBlob.offsetTop - vel + "px";
    if (e.key == "a") myBlob.style.left = myBlob.offsetLeft - vel + "px";
    if (e.key == "s") myBlob.style.top = myBlob.offsetTop + vel + "px";
    if (e.key == "d") myBlob.style.left = myBlob.offsetLeft + vel + "px";

    data.x = myBlob.offsetLeft;
    data.y = myBlob.offsetTop;

    //target
    if (e.key == "ArrowUp") data.dir = 0;
    if (e.key == "ArrowRight") data.dir = 1;
    if (e.key == "ArrowDown") data.dir = 2;
    if (e.key == "ArrowLeft") data.dir = 3;

    myBlob.style.transform = `rotate(${(360/4)*data.dir}deg)`;

    socket.emit("blob:move", data);

    if (e.key == " " && stamina) shoot();
});

socket.on("blob:move", data => {
    const blob = document.getElementById(data.id);

    blob.style.top = data.y + "px";
    blob.style.left = data.x + "px";
    blob.style.transform = `rotate(${(360/4)*data.dir}deg)`;
});

//Blob shooting