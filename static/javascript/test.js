var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var cw = canvas.width;
var ch = canvas.height;
var cnvBox = canvas.getBoundingClientRect();

function reOffset() {
    var BB = canvas.getBoundingClientRect();
    offsetX = BB.left;
    offsetY = BB.top;
}

var offsetX, offsetY;
reOffset();
window.onscroll = function (e) {
    reOffset();
}
window.onresize = function (e) {
    reOffset();
}

var isDown = false;
var startX, startY, mouseX, mouseY;

var $mouse = $('#mouse');
$("#canvas").mousemove(function (e) {
    handleMouseMove(e);
});

function handleMouseMove(e) {
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    // calc the current mouse position
    mouseX = parseInt(e.clientX - offsetX);
    mouseY = parseInt(e.clientY - offsetY);
    // report the mouse position
    $mouse.text('Mouse position: ' + mouseX + ' / ' + mouseY);
}

