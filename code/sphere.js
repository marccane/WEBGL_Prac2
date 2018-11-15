"use strict";

class Sphere{
    constructor(gl, program, numTimesToSubdivide, color){
        this.gl = gl;
        this.program = program;
        this.cBuffer = undefined;
        this.vBuffer = undefined;
        this.points = [];
        this.colors = [];
        this.numVertexSphere = 0;
        this.scaleMatrix = mat4();
        this.translationMatrix = mat4();
        this.rotationMatrix = mat4();
        this.color = color;
        let va = vec4(0.0, 0.0, -1.0, 1);
        let vb = vec4(0.0, 0.942809, 0.333333, 1);
        let vc = vec4(-0.816497, -0.471405, 0.333333, 1);
        let vd = vec4(0.816497, -0.471405, 0.333333, 1);
        this.tetrahedron(va, vb, vc, vd, numTimesToSubdivide); 
        this.initBuffers();
    }

    initBuffers(){
        this.cBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, this.cBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(this.colors), gl.STATIC_DRAW );

        this.vBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(this.points), gl.STATIC_DRAW );

    }

    triangle(a, b, c) {
        this.points.push(a);
        this.points.push(b);
        this.points.push(c);
        let col = this.color;
        this.colors.push(col); 
        this.colors.push(col);
        this.colors.push(col);
        this.numVertexSphere += 3;
    }

    divideTriangle(a, b, c, count) {
        if ( count > 0 ) {

           var ab = normalize(mix( a, b, 0.5), true);
           var ac = normalize(mix( a, c, 0.5), true);
           var bc = normalize(mix( b, c, 0.5), true);

           this.divideTriangle( a, ab, ac, count - 1 );
           this.divideTriangle( ab, b, bc, count - 1 );
           this.divideTriangle( bc, c, ac, count - 1 );
           this.divideTriangle( ab, bc, ac, count - 1 );
        }
        else { // draw tetrahedron at end of recursion
           this.triangle( a, b, c );
        }
    }

    tetrahedron(a, b, c, d, n) {
        this.divideTriangle(a, b, c, n);
        this.divideTriangle(d, c, b, n);
        this.divideTriangle(a, d, b, n);
        this.divideTriangle(a, c, d, n);
    } 

    setScale(x, y, z){
        this.scaleMatrix = scalem(x,y,z);
    }

    addScalanation(x,y,z){
        this.scaleMatrix = mult(this.scaleMatrix, scalem(x,y,z));
    }

    setTranslation(x,y,z){
        this.translationMatrix = translate(x,y,z);
    }

    addRotation(angle, axis){ //adds a rotation effect to the object, rep angle i vector de 3 amb els eixos de rotació
        this.rotationMatrix = mult(this.rotationMatrix, rotate(angle,axis));   
    }

    addTranslation(x,y,z){
        this.translationMatrix = mult(this.translationMatrix, translate(x,y,z));
    }


    draw(){
        let movement = mult(this.rotationMatrix, this.translationMatrix);
        let transformation = mult(movement, this.scaleMatrix);

        let uniformLoc = gl.getUniformLocation(this.program, "objectTransformation");
        gl.uniformMatrix4fv(uniformLoc, false, flatten(transformation) ); 

        gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
        let vertexPos = gl.getAttribLocation(this.program, "vPosition");
        gl.vertexAttribPointer(vertexPos, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vertexPos);

        gl.bindBuffer( gl.ARRAY_BUFFER, this.cBuffer  );
        let vertexColor = gl.getAttribLocation( this.program, "vColor" );
        gl.vertexAttribPointer( vertexColor, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vertexColor );

        gl.drawArrays( gl.LINES, 0, this.numVertexSphere );
    }

}