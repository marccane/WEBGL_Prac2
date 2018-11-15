"use strict";

class cosRevolucio{
    
    constructor(gl, program, funcX, funcY, LPERF, NDIVS, color){ //position és una array de 3
        this.gl = gl;
        this.program = program;
        if(Array.isArray(funcX)){
            this.funcX = undefined;
            this.funcY = undefined;
            this.Xvalues = funcX;
            this.Yvalues = funcY;
        }
        else{
            this.funcX = funcX;
            this.funcY = funcY;
        }
        
        this.points = undefined;
        this.colors = undefined;
        this.cBuffer = undefined;
        this.vBuffer = undefined;
        this.LPERF = LPERF;
        this.NDIVS = NDIVS;
        this.color = color;
        this.scaleMatrix = mat4();
        this.translationMatrix = mat4();
        this.rotationMatrix = mat4();

        this.Vertex3d = function (x,y,z) {
            this.vec = vec4(x,y,z,1.0);
        };

        this.Triangle = function() {
            this.vertices = []; //Vertex3d
        };

        this.Object = function() {
            this.vertices = []; //Vertex3d
            this.tris = []; //Triangles
            this.nvertices = 0;
        };

        this.Profile = function() {
            this.p = [];
        };

        this.objecte3d = new this.Object();
        this.initObj(this.objecte3d);

        this.initBuffersGPU();
    }

    initObj(m) //m és de tipus Object
    {
        var angle, x;
        var act = new this.Profile(), ini = new this.Profile();

        if(this.funcX == undefined) {
            for (var i=0;i<this.Xvalues.length;i++)
            {
                ini.p[i] = new this.Vertex3d(this.Xvalues[i],this.Yvalues[i],0).vec;
            }
        }
        else{
            for (var i=0;i<this.LPERF;i++)
            {
                x = i / this.LPERF;
                //ini.p[i] = new Vertex3d(x,-0.5*x+1,0).vec;
                ini.p[i] = new this.Vertex3d(this.funcX(x),this.funcY(x),0).vec;
            }

        }

        m.nvertices = 0;
        this.AddVertices(m, ini);
        for (var i = 1; i < this.NDIVS; i++)
        {
            angle = (2.0 * Math.PI* i)/this.NDIVS;
            this.RotateProfile(ini, act, angle);
            this.AddVertices(m, act);
            this.DefFaces (m, i-1, i);
        }
        this.DefFaces(m, this.NDIVS-1, 0);
    }

    AddVertices(m, p){
        for (var i = 0; i < this.LPERF; i++)
            m.vertices[m.nvertices++] = p.p[i];
    }

    RotateProfile(from, to, angle){
        for (var i = 0; i < this.LPERF; i++){
            var punt = from.p[i];
            var r = punt[0];
            to.p[i] = new this.Vertex3d( r*Math.cos(angle),punt[1],r*Math.sin(angle)).vec;
        }
    }

    DefFaces(m, a, b)
    { 
        var v1 = [], v2 = [];
        for (var i=a*this.LPERF; i<a*this.LPERF+this.LPERF-1; i++){
            v1.push(m.vertices[i]);
        }
        for (var i=b*this.LPERF; i<b*this.LPERF+this.LPERF-1; i++){
            v2.push(m.vertices[i]);
        }

        for(var i = 0; i<v1.length-1; i++){
            //primer triangle
            m.tris.push(v1[i]);
            m.tris.push(v2[i]);
            m.tris.push(v1[i+1]);
            //segon triangle
            m.tris.push(v2[i]);
            m.tris.push(v1[i+1]);
            m.tris.push(v2[i+1])
        }
    }

    initBuffersGPU(){

        this.points = this.objecte3d.tris;
        this.colors = new Array(this.points.length);

        for(var i=0;i<this.colors.length;i++) 
            this.colors[i]=this.color;

        this.cBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, this.cBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(this.colors), gl.STATIC_DRAW );

        this.vBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(this.points), gl.STATIC_DRAW );
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
        
        let movement = mult(this.translationMatrix,this.rotationMatrix);
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

        gl.drawArrays( gl.TRIANGLES, 0, this.points.length );
    }
}