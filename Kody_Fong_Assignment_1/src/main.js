//Alot of code will be used from Matsuda Chapters 2 and 3
//
//
//
//
//
//--------------------------------------------------------------------


// Vertex shader program from pg49 and pg 59 of Matsuda

var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute float a_PointSize; \n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = a_PointSize;\n' +
  '}\n';

// Fragment shader program from ColoredPoints.js pg 59 of Matsuda
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' + // uniform variable
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

var g_points = []; // The array for mouse click positions
var g_colors = [];  // The array to store the color of a point

var sizeArray = []; // The array to store sizes
var shapeArray = []; // The array to store shapes
var segmentArray = []; // The array to store segments

var mousePressed = false;
var size = 10/400;
var colors = [1.0, 0.0, 0.0, 1.0];
var shape = 'circle'; //The default shape will be a circle
var segments = 100;

function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');
    var clear = document.getElementById('clear');

    var square = document.getElementById('square');
    var triangle = document.getElementById('triangle');
    var circle = document.getElementById('circle');
    var shapeSize = document.getElementById('shapeSize');

    var red = document.getElementById('red');
    var green = document.getElementById('green');
    var blue = document.getElementById('blue');
    var segCount = document.getElementById('segCount');
    var transparency = document.getElementById('transparency');

    //clear button functionality
     clear.onclick = function() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        g_points = [];
        sizeArray = [];
        shapeArray = [];
        segmentArray = [];
        g_colors = [];
        // Specify the color for clearing <canvas>
        gl.clearColor(0.5, 0.5, 0.5, 1);
        // Clear <canvas>
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    //square button functionality
     square.onclick = function() {
        shape = 'square';
    }

    //circle button functionality
    circle.onclick = function() {
        shape = 'circle';
    }

    //triangle button functionality
    triangle.onclick = function() {
        shape = 'triangle';
    }
   


      //implementation of buttons and sliders
    shapeSize.oninput = function() {
        size = shapeSize.value/1000;
    };

    red.oninput = function() {
        colors[0] = parseFloat(red.value)/255;
    };
    green.oninput = function() {
        
        colors[1] = parseFloat(green.value/255);
        
    };
    blue.oninput = function() {

         colors[2] = parseFloat(blue.value/255);  
     };

    segCount.oninput = function() {
        segments = segCount.value;
    };
    
    transparency.oninput = function()
    {
        colors[3] = parseFloat(transparency.value/100);
    }
    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas );
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders 
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    //  Get the location of attribute variable
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');  
    if(a_Position < 0)
    {
        console.log('Fail to get the storage location of a_Position');
        return;
    }

    //Matsuda Pg 63

    var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get u_FragColor variable');
        return;
    }

    //pg 53 Matsuda
    canvas.onmousedown = function(ev) { mousePressed = true; click(ev, gl, canvas, a_Position, u_FragColor) };
    canvas.onmouseup = function(ev) { mousePressed = false; click(ev, gl, canvas, a_Position, u_FragColor) };
    canvas.onmousemove = function(ev) { click(ev, gl, canvas, a_Position, u_FragColor) };

    // Specify the color for clearing <canvas>
    gl.clearColor(0.5, 0.5, 0.5, 1);
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
} 

//pg 60 of Matsuda
function click(ev, gl, canvas, a_Position, u_FragColor) {
    if(mousePressed){
        var x = ev.clientX; // x coordinate of a mouse pointer
        var y = ev.clientY; // y coordinate of a mouse pointer
        var rect = ev.target.getBoundingClientRect();

        x = ((x - rect.left) - canvas.height/2)/(canvas.height/2);
        y = (canvas.width/2 - (y - rect.top))/(canvas.width/2);

        g_points.push([x,y]); //push the coordinates from where the mouse is clicked
        g_colors.push([colors[0], colors[1], colors[2], colors[3]]);
        sizeArray.push(size);
        shapeArray.push(shape);
        segmentArray.push(segments);

        //Clear canvas
        gl.clear(gl.COLOR_BUFFER_BIT);

        //Matsuda Pg 61
        var len = g_points.length;
        for(var i = 0; i < len; i++) {

            var xy = g_points[i];
            var rgba = g_colors[i];

            // Pass the position of a point to a_Position variable
            gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);

            // Pass the color of a point to u_FragColor variable
            gl.uniform4f(u_FragColor, rgba[0],rgba[1],rgba[2],rgba[3]);

            //Pg 71 of Matsuda
            // Set the positions of vertices
            var n = initVertexBuffers(gl, xy[0], xy[1], sizeArray[i], shapeArray[i], segmentArray[i]);

            if (n < 0) {
                console.log('Failed to set the positions of the vertices');
                return;
            }
            
            //Draw a Rectangle/Square Matsuda pg 91

            if(shapeArray[i] == 'square'){

                gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);

            }
            //Draw a Triangle Matsuda pg 86
            else if(shapeArray[i] == 'triangle'){

                gl.drawArrays(gl.TRIANGLES, 0, n);
            }

            //Draw a Circle.
            else if(shapeArray[i] == 'circle'){

                gl.drawArrays(gl.TRIANGLE_FAN, 0, n);
            }
        }
    }
}

function initVertexBuffers(gl, xPos, yPos, size, shapes, segments) {
    var vertices;
    var n; 

    //Matsuda Pg 90
    if(shapes == 'square'){
        vertices = new Float32Array([
            xPos-size, yPos+size,
            xPos-size, yPos-size,
            xPos+size, yPos+size,
            xPos+size, yPos-size,
        ]);
        n = 4;
    }
    else if(shapes == 'triangle'){
        vertices = new Float32Array([
            xPos, yPos+size,
            xPos-size, yPos-size,
            xPos+size, yPos-size,
        ]);
        n = 3;
    }
    else if(shapes == 'circle'){
        vertices = new Float32Array((segments*2) + 2);
        vertices[0] = xPos;
        vertices[1] = yPos;
        for(var i = 2; i <= vertices.length; i+=2){
            vertices[i] = vertices[0] + size*Math.cos(i*2*Math.PI/segments);
            vertices[i+1] = vertices[1] + size*Math.sin(i*2*Math.PI/segments);
        }
        n = segments;
    }
  
    // Pg 71 Matsuda
    //-------------------------------------

    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
  
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
      console.log('Failed to get the storage location of a_Position');
      return -1;
    }
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
  
    return n;
    
  } 


