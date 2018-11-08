"use strict";

var gl;
var canvas;
var program;

//Map
var numVertex1 = 0;
var points1 = [];
var colors1 = [];
var cBuffer1, vColor1, vBuffer1;

//Sphere
var numVertexSphere = 0;
var pointsSphere = [];
var colorsSphere = [];
var cBufferSphere, vColorSphere, vBufferSphere;

//Generic
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
//var theta = [ 12, -15, 0 ];
var theta = [ -5, 10, 0 ];

var thetaLoc;

var mvMatrixLoc;
var SizeMatrixLoc;
var projectionMatrixLoc;

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

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    crearMapa();

    var numTimesToSubdivide = 5;
    var va = vec4(0.0, 0.0, -1.0, 1);
    var vb = vec4(0.0, 0.942809, 0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333, 1);

    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    gl.enable(gl.DEPTH_TEST);
    gl.cullFace(gl.FRONT);

    //Map
    cBuffer1 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer1 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors1), gl.STATIC_DRAW );

    vBuffer1 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer1 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points1), gl.STATIC_DRAW );

    //Sphere
    cBufferSphere = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBufferSphere );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsSphere), gl.STATIC_DRAW )

    vBufferSphere = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferSphere );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsSphere), gl.STATIC_DRAW );
    //endSphere

    thetaLoc = gl.getUniformLocation(program, "theta");
	mvMatrixLoc = gl.getUniformLocation(program, "uMVMatrix");
	SizeMatrixLoc = gl.getUniformLocation(program, "resize");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

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

//Mapa
function crearMapa(){
    var x=0.0, y=0, z=0;

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

function quad(p1, p2, p3, p4, color){
    var vertices = [ p1, p2, p3, p2, p3, p4];
    for(var i=0;i<vertices.length;i++){
        points1.push(vertices[i]);
        colors1.push(color);
        numVertex1++;
    }
}

//Esfera
function triangle(a, b, c) {
     pointsSphere.push(a);
     pointsSphere.push(b);
     pointsSphere.push(c);
     colorsSphere.push(red); //color de l'esfera hardcodejat aqui <---
     colorsSphere.push(blue);
     colorsSphere.push(green);
     numVertexSphere += 3;
}

function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {

        var ab = normalize(mix( a, b, 0.5), true);
        var ac = normalize(mix( a, c, 0.5), true);
        var bc = normalize(mix( b, c, 0.5), true);

        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else { // draw tetrahedron at end of recursion
        triangle( a, b, c );
    }
}

function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

//Interacció WASD
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
var yPos = 0.4;
var zPos = 5.0;
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
        yawRate = 0.05;
	} else if (currentlyPressedKeys[39] || currentlyPressedKeys[68]) {
		// Right cursor key or D
		yawRate = -0.05;
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
            yPos -=  Math.sin(degToRad(pitch)) * speed * elapsed;
        }
        yaw += yawRate * elapsed;
        pitch += pitchRate * elapsed;
    }
    lastTime = timeNow;
}

//Render
var mvMatrix = mat4();
var Identity = mat4();
var mvMatrixStack = [];

var escalatEsfera = 0.2
var scalematrix = flatten(scalem(escalatEsfera,escalatEsfera,escalatEsfera));

var near = 0.1;
var far = 50;
var left = -1.0;
var right = 1.0;
var ytop = 1.0;
var bottom = -1.0;

function render()
{
    

    handleKeys();

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //.theta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, theta);

    Identity = mat4();
    mvMatrix = mat4();
    var rotation1 = rotate(-pitch, [1, 0, 0]);
    var rotation2 = rotate(-yaw, [0, 1, 0]);
    var translation = translate(-xPos, -yPos, -zPos);

    var rotation = mult(rotation1, rotation2);
    var movment = mult(rotation, translation);
    mvMatrix = mult(mvMatrix, movment);

    //mvMatrix = mult( mvMatrix, lookAt([0,0,0],[0,1,0], [0,0,0]));

    //var projectionMatrix = ortho(left, right, bottom, ytop, near, far);


    var projectionMatrix = perspective(45, canvas.width / canvas.height, near, far);

    gl.uniformMatrix4fv(mvMatrixLoc, false, flatten(mvMatrix) );       
    gl.uniformMatrix4fv(SizeMatrixLoc, false, flatten(Identity) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );      

    //Map
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer1  );
    let vertexColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vertexColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexColor );

    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer1 );
    let vertexPos = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vertexPos, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPos);

    gl.drawArrays( gl.TRIANGLES, 0, numVertex1 );

    //Sphere
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferSphere );
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vPosition);

    gl.bindBuffer( gl.ARRAY_BUFFER, cBufferSphere  );
    vertexColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vertexColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexColor );
    
    //sphere resize 
    gl.uniformMatrix4fv(SizeMatrixLoc, false, scalematrix );   

    // for( var i=0; i<numVertexSphere; i+=3)
    //    gl.drawArrays( gl.TRIANGLES, i, 3 );

    gl.drawArrays( gl.TRIANGLES, 0, numVertexSphere );

    animate();

    requestAnimFrame( render );
}
