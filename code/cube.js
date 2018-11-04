"use strict";

var canvas;
var gl;

//var NumVertices  = 36;

var points = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 12, -15, 0 ];

var thetaLoc;

var mvMatrixLoc;
var pmvMatrixLoc;


var black = [ 0.0, 0.0, 0.0, 1.0 ]; 
var red = [ 1.0, 0.0, 0.0, 1.0 ]; 
var yellow = [ 1.0, 1.0, 0.0, 1.0 ]; 
var green = [ 0.0, 1.0, 0.0, 1.0 ]; 
var blue = [ 0.0, 0.0, 1.0, 1.0 ]; 
var magenta = [ 1.0, 0.0, 1.0, 1.0 ]; 
var cyan = [ 0.0, 1.0, 1.0, 1.0 ]; 
var white = [ 1.0, 1.0, 1.0, 1.0 ];
var orange = [ 1.0, 0.5, 0.0, 1.0 ]; 

window.onload = function init()
{
    var modeDebug=false;
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

    if(modeDebug)
        document.getElementById( "xButton" ).onclick = function () {
            onload2();
        };
    else onload2();
}

function onload2(){
    canvas = document.getElementById( "gl-canvas" );
    ///events handlers per les tecles 
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    crearMapa();
    //colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );


    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    thetaLoc = gl.getUniformLocation(program, "theta");
	mvMatrixLoc = gl.getUniformLocation(program, "uMVMatrix");
	pmvMatrixLoc = gl.getUniformLocation(program, "pMVMatrix");

    //event listeners for buttons

    document.getElementById( "xButton" ).onclick = function () {
        axis = xAxis;
    };
    document.getElementById( "yButton" ).onclick = function () {
        axis = yAxis;
    };
    document.getElementById( "zButton" ).onclick = function () {
        axis = zAxis;
    };

    render();
}

function crearMapa(){
    var x=0.0, y=0.2, z=-0.2;

    var size=0.5;
    var sizeX=size, sizeY=size, sizeZ=size;

    quad( //terra
        vec4(-sizeX+x,-sizeY+y, sizeZ+z,1.0),
        vec4(-sizeX+x,-sizeY+y,-sizeZ+z,1.0),
        vec4( sizeX+x,-sizeY+y, sizeZ+z,1.0),
        vec4( sizeX+x,-sizeY+y,-sizeZ+z,1.0),
        blue
    );
    quad( //paret esquerra
        vec4(-sizeX+x,-sizeY+y, sizeZ+z,1.0),
        vec4(-sizeX+x,-sizeY+y,-sizeZ+z,1.0),
        vec4(-sizeX+x, sizeY+y, sizeZ+z,1.0),
        vec4(-sizeX+x, sizeY+y,-sizeZ+z,1.0),
        red
    );
    quad( //paret dreta
        vec4( sizeX+x,-sizeY+y, sizeZ+z,1.0),
        vec4( sizeX+x,-sizeY+y,-sizeZ+z,1.0),
        vec4( sizeX+x, sizeY+y, sizeZ+z,1.0),
        vec4( sizeX+x, sizeY+y,-sizeZ+z,1.0),
        orange
    );
}

var numVertex = 0;

function quad(p1, p2, p3, p4, color){
    var vertices = [ p1, p2, p3, p2, p3, p4];
    for(var i=0;i<vertices.length;i++){
        points.push(vertices[i]);
        colors.push(color);
        numVertex++;
    }
}


var currentlyPressedKeys = {};
function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
}
function handleKeyUp(event) {
	currentlyPressedKeys[event.keyCode] = false;
}

var pitch = 0;
var pitchRate = 0;
var yaw = 0;
var yawRate = 0;
var xPos = 0;
var yPos = 0;
var zPos = 0;
var speed = 0;

function handleKeys() {
	if (currentlyPressedKeys[33]) {
		// Page Up
		pitchRate = 0.1;
	} else if (currentlyPressedKeys[34]) {
		// Page Down
		pitchRate = -0.1;
	} else {
		pitchRate = 0;
	}
	if (currentlyPressedKeys[37] || currentlyPressedKeys[65]) {
		// Left cursor key or A
        yawRate = 0.1;
        console.log("imhere")
	} else if (currentlyPressedKeys[39] || currentlyPressedKeys[68]) {
		// Right cursor key or D
		yawRate = -0.1;
	} else {
		yawRate = 0;
	}
	if (currentlyPressedKeys[38] || currentlyPressedKeys[87]) {
		// Up cursor key or W
		speed = 0.003;
	} else if (currentlyPressedKeys[40] || currentlyPressedKeys[83]) {
		// Down cursor key
		speed = -0.003;
	} else {
		speed = 0;
	}
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

var lastTime = 0;
// Used to make us "jog" up and down as we move forward.
var joggingAngle = 0;


function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;
        if (speed != 0) {
            xPos -= Math.sin(degToRad(yaw)) * speed * elapsed;
            zPos -= Math.cos(degToRad(yaw)) * speed * elapsed;
            joggingAngle += elapsed * 0.6; // 0.6 "fiddle factor" - makes it feel more realistic :-)
            yPos = Math.sin(degToRad(joggingAngle)) / 20 + 0.4
        }
        yaw += yawRate * elapsed;
        pitch += pitchRate * elapsed;
    }
    lastTime = timeNow;
}



var mvMatrix = mat4();
var pmvMatrix = mat4();
var mvMatrixStack = [];
	
function render()
{

    requestAnimFrame( render );

    handleKeys();


    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //.theta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, theta);   


    var persp = perspective(45, canvas.width / canvas.height, 0.1, 100.0);
    pmvMatrix = mult(persp,pmvMatrix);

    mvMatrix = mat4();
    var rotation1 = rotate(-pitch, [1, 0, 0]);
    var rotation2 = rotate(-yaw, [0, 1, 0]);
    var translation = translate(-xPos, -yPos, -zPos);

    //rotate(-pitch, [1, 0, 0])*rotate(-yaw, [0, 1, 0])*translate(-xPos, -yPos, -zPos)*mvMatrix;
    // mvMatrix = mult(rotation1, mvMatrix);
    // mvMatrix = mult(rotation2, mvMatrix);
    // mvMatrix = mult(translation, mvMatrix);

    var rotation = mult(rotation1, rotation2);
    var movment = mult(rotation, translation);
    mvMatrix = mult(movment, mvMatrix);

    console.log("ayy ", mvMatrix)

    gl.uniformMatrix4fv(mvMatrixLoc, false, flatten(mvMatrix) );       
    gl.uniformMatrix4fv(pmvMatrixLoc, false, flatten(pmvMatrix) );       

    gl.drawArrays( gl.TRIANGLES, 0, numVertex );
    animate();
}
