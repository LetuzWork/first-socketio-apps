// const socket = io();

const body = document.querySelector("body");

let data, myBlob, stamina = true,
    timer = 0,
    usersInst = [];

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
        x: Math.floor(Math.random() * (window.innerWidth - 50)),
        y: Math.floor(Math.random() * (window.innerHeight - 50)),
        id: Math.floor(Math.random() * 4096).toString(16),
        dir: 0,
        size: 50
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

socket.on("blob:show-users", users => {
    // console.log(users);
    usersInst = users;
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
    0: () => { return [myBlob.offsetTop, 0, "top", [0, 0.5]] },
    1: () => { return [window.innerWidth - (myBlob.offsetLeft + data.size), window.innerWidth - 5, "left", [0.5, 1]] },
    2: () => { return [window.innerHeight - (myBlob.offsetTop + data.size), window.innerHeight + 3, "top", [1, 0.5]] },
    3: () => { return [myBlob.offsetLeft + 3, 0, "left", [0, 0]] }
}

const dist = (x0, y0, x1, y1) => {
    return ((x1 - x0) ** 2 + (y0 - y1) ** 2) ** (1 / 2);
}

const intersect = (x0, y0, x1, y1) => {
    let bulletDist = dist(x0, y0, x1, y1);
    // console.log(bulletDist);
    return bulletDist < data.size * 0.7;
}

const setShoot = async(b, own) => {
    const bullet = `<div id="${b.id}" class="bullet" style="left:${b.left}px; top:${b.top}px; transition: all  ${b.dt}s linear;"></div>`
    body.innerHTML += bullet;
    let myBullet = document.getElementById(b.id);

    await setTimeout(() => myBullet.style[b.axis] = b.limit + "px", 100);
    let loop = setInterval(() => {
        socket.emit("blob:get-users");
        let found = usersInst.find(u => intersect(myBullet.offsetLeft, myBullet.offsetTop, u.x, u.y));
        if (found) socket.emit("blob:decrease", found);
    }, 100);

    await setTimeout(() => {
        if (own) stamina = true;
        body.removeChild(myBullet)
        clearInterval(loop);
    }, b.dt * 1000);

    return myBullet;
}
async function shoot() {
    stamina = false;
    myBlob = document.getElementById(data.id);

    const vel = 400,
        bulletId = Math.floor(Math.random() * 10 ** 8);

    const [dist, limit, axis, corr] = distance[data.dir]();

    bulletData = {
        id: bulletId,
        left: myBlob.offsetLeft + data.size * corr[1] + 10,
        top: myBlob.offsetTop + data.size * corr[0] + 10,
        dt: dist / vel,
        limit,
        axis
    }

    // console.log(dist, limit, axis);
    socket.emit("blob:shoot", bulletData);

    await setShoot(bulletData, true);
}

socket.on("blob:shoot", bullet => setShoot(bullet));
socket.on("blob:decrease", user => {
    // let bloby = document.getElementById(user.id);
    console.log(user.size);
    // if (data.id == user.id) data = user;
    // bloby.style.width = user.size + "px";
    // bloby.style.height = user.size + "px";
});
//Blob Movement
body.addEventListener("keydown", e => {
    const myBlob = document.getElementById(data.id);

    const vel = 20;
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