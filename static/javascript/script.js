var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
ctx.lineWidth=16;
var width = canvas.width;
var height = canvas.height;
var curX, curY, prevX, prevY;
var hold = false;

var canvas_data = {"pencil": [], "line": [], "rectangle": [], "circle": [], "eraser": []}
var cnvBox = canvas.getBoundingClientRect();

function reset() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas_data = {"pencil": [], "eraser": []}
}

function reOffset() {
    cnvBox = canvas.getBoundingClientRect();
}

reOffset();
window.onscroll = function (e) {
    reOffset();
}
window.onresize = function (e) {
    reOffset();
}
window.onload = function(e){
    pencil();
    e.preventDefault();
    e.stopPropagation();
    reOffset();
}

window.onkeypress = function(e){
    e = e || window.event;
    var charCode = e.which || e.keyCode;
    var charStr = String.fromCharCode(charCode);

    if (charStr == "-"){
        reduce_pixel();
    } else if (charStr == "+") {
        add_pixel();
    }
}
function add_pixel(){
    ctx.lineWidth += 1;
}

function reduce_pixel(){
    if (ctx.lineWidth == 1){
        ctx.lineWidth = 1;
    }
    else{
        ctx.lineWidth -= 1;
    }
}

$("#canvas").mousemove(function (e) {
    handleMouseMove(e);
});

function handleMouseMove(e) {

    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    // calc the current mouse position
    mouseX = parseInt(e.clientX - cnvBox.left);
    mouseY = parseInt(e.clientY - cnvBox.top);
    // report the mouse position
    $mouse.text('Mouse position: ' + mouseX + ' / ' + mouseY);
}
// pencil tool


function pencil() {

    canvas.onmousedown = function (e) {
        // curX = e.clientX
        // curY = e.clientY
        curX = e.clientX - cnvBox.left;
        curY = e.clientY - cnvBox.top;
        hold = true;

        prevX = curX;
        prevY = curY;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
    };

    canvas.onmousemove = function (e) {
        if (hold) {
            // curX = e.clientX
            // curY = e.clientY
            curX = e.clientX - cnvBox.left;
            curY = e.clientY - cnvBox.top;
            draw();
        }
    };

    canvas.onmouseup = function (e) {
        hold = false;
    };

    canvas.onmouseout = function (e) {
        hold = false;
    };

    function draw() {

        ctx.lineTo(curX, curY);
        ctx.stroke();
        canvas_data.pencil.push({
            "startx": prevX,
            "starty": prevY,
            "endx": curX,
            "endy": curY,
            "thick": ctx.lineWidth,
            "color": ctx.strokeStyle
        });
    }
}


function submit() {



    // prevent submission of blanks
    if (canvas_data.pencil.length == 0) {
        alert("Draw something first");
    } else {
        var data = JSON.stringify(canvas_data);
        var image = canvas.toDataURL();
        var image_id = new Date().valueOf();
        $.ajax({
                type: "POST",
                url: "/upload_image",
                data: {
                    canvas_data: data,
                    image_url: image,
                    image_id: image_id
                }
            }
        ).done(function () {
            window.location.replace('/results/' + image_id);
        })
    }


}


