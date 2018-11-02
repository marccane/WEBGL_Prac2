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
/*
function colorCube()
{
    aberracio( 1, 0, 3, 2 );
    aberracio( 2, 3, 7, 6 );
    aberracio( 3, 0, 4, 7 );
    aberracio( 6, 5, 1, 2 );
    aberracio( 4, 5, 6, 7 );
    aberracio( 5, 4, 0, 1 );
}

function aberracio(a, b, c, d)
{
    var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];

    // We need to parition the aberracio into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the aberracio indices

    //vertex color assigned by the index of the vertex

    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        //colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
        colors.push(vertexColors[a]);

    }
}*/

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //.theta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, theta);

    gl.drawArrays( gl.TRIANGLES, 0, numVertex );

    requestAnimFrame( render );
}
