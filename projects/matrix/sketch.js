let c = document.getElementById("can");
let ctx = c.getContext("2d");
ctx.fillStyle = "rgb(0,0,0)";
c.width = window.innerWidth;
c.height = window.innerHeight;
let letters = Array(256).join(1).split('');
let id = setInterval(draw, 50);
let srot = 0;

function draw() {
    width = window.innerWidth;
    height = window.innerHeight;
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.fillRect(0, 0, width, height);


    letters.map(function(y_pos, index) {
        text = String.fromCharCode(33 + Math.random() * 256);
        x_pos = index * 10;
        //sets a ranbow pattern rotating at a set interval
        let colored = Math.abs(Math.sin(((index + 1) + srot + 0) / 100) * 155 + 100);
        let cologre = Math.abs(Math.sin(((index + 1) + srot + 200) / 100) * 155 + 100);
        let coloblu = Math.abs(Math.sin(((index + 1) + srot + 400) / 100) * 155 + 100);
        ctx.fillStyle = 'rgb(' + colored + ',' + cologre + ',' + coloblu + ')';

        ctx.fillText(text, x_pos, y_pos);
        letters[index] = (y_pos > 300 + Math.random() * 1e4) ? 0 : y_pos + 10;
    })
    srot++;
}

document.addEventListener('onload', draw);