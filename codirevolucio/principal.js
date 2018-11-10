"use strict";

var black = [ 0.0, 0.0, 0.0, 1.0 ]; 
var red = [ 1.0, 0.0, 0.0, 1.0 ]; 
var yellow = [ 1.0, 1.0, 0.0, 1.0 ]; 
var green = [ 0.0, 1.0, 0.0, 1.0 ]; 
var blue = [ 0.0, 0.0, 1.0, 1.0 ]; 
var magenta = [ 1.0, 0.0, 1.0, 1.0 ]; 
var cyan = [ 0.0, 1.0, 1.0, 1.0 ]; 
var white = [ 1.0, 1.0, 1.0, 1.0 ];
var orange = [ 1.0, 0.5, 0.0, 1.0 ]; 

var canvas;
var gl;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];

var thetaLoc;

var objectes3D = [];

window.onload = function init(){
        document.getElementById( "xButton" ).onclick = function () {
            onload2();
    };
}

function onload2()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    thetaLoc = gl.getUniformLocation(program, "theta");

    objectes3D.push(new cosRevolucio(gl, program, (x => -0.5*x+1), 14, 140, [ 1.0, 0.0, 0.0, 1.0 ]));
    objectes3D[objectes3D.length - 1].addRotation(25,[1,1,1]);

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

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta[axis] += 1.0;
    gl.uniform3fv(thetaLoc, theta);

    for(var i=0;i<objectes3D.length;i++)
        objectes3D[i].draw();

    requestAnimFrame( render );
}
