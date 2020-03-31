// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_ModelMatrix;' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * u_ModelMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';



var currentAngle = 0;
var movement = 0;
var animalRotation = 0;
var g_last = 0;
var ANGLE_STEP = 45.0;
var newAngle = 0;
var increaseAngle = false;
var decreaseAngle = true;
var bounce = true;
var vpMatrix = new Matrix4(); 

  function main() {

  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');


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

  var rotateAnimal = document.getElementById("rotate");
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  if (!u_MvpMatrix) { 
      console.log('Failed to get the storage location of u_MvpMatrix');
      return;
  }

  //set the clear color
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  drawAnimal(gl);
 

  vpMatrix.setPerspective(30, 2, 1, 100);
  vpMatrix.lookAt(3, 1, 7, 0, 0, 0, 0, 1, 0);
  // Pass the model view projection matrix to u_MvpMatrix
  gl.uniformMatrix4fv(u_MvpMatrix, false, vpMatrix.elements);


  rotateAnimal.oninput = function() {
    var animalRotation = parseFloat(rotateAnimal.value);
      //CHAPTER 7 MATSUDA 
      // Set the eye point and the viewing volume
      vpMatrix.setPerspective(30, 2, 1, 100);
      vpMatrix.lookAt(3, 1, 7, 0, 0, 0, 0, 1, 0);
      vpMatrix.rotate(animalRotation, 0, 1, 0);
      // Pass the model view projection matrix to u_MvpMatrix
      gl.uniformMatrix4fv(u_MvpMatrix, false, vpMatrix.elements);
      drawAnimal(gl);
      
  }
  

function drawAnimal(gl){

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');

    // Head
    var headTranslation = [1.25 + movement,  1 + movement, 0];
    var headScale = [1, 0.5, 1.01];
    var headRotation = [0, 1, 0, 0];
    var headColor = [0.39, 0.26, 0.13];
    drawCube(gl, u_ModelMatrix, headTranslation, headScale, headRotation, headColor);

    // Body
    var bodyTranslation = [1.25 + movement,movement, 0];
    var bodyScale = [0.5, 0.5, 1.0];
    var bodyRotation = [1.5, 1.5, 1.5, 0.5];
    var bodyColor = [0.39, 0.26, 0.13];
    drawCube(gl, u_ModelMatrix, bodyTranslation, bodyScale, bodyRotation, bodyColor);


  

      // legs
    var leg1Translation = [1.55 + movement, -0.70 + movement, 0.59];
    var leg1Scale = [0.75, 0.2, 0.4];
    var leg1Rotation = [currentAngle, 0, 0, 1];
    var leg1Color = [0.40, 0.27, 0.15];
    drawCube(gl, u_ModelMatrix, leg1Translation, leg1Scale, leg1Rotation, leg1Color);

    var leg2Translation = [1.55 + movement, -0.70 + movement, -0.59];
    var leg2Scale = [0.75, 0.2, 0.4];
    var leg2Rotation = [currentAngle, 0, 0, 1];
    var leg2Color = [0.40, 0.27, 0.15];
    drawCube(gl, u_ModelMatrix, leg2Translation, leg2Scale, leg2Rotation, leg2Color);
    


    // arms
    
    var arm1Translation = [2.05 + movement, -0.02 + movement, 0.6];
    var arm1Scale = [0.35, 0.2, 0.4];
    var arm1Rotation = [currentAngle, 0, 0, 1];
    var arm1Color = [1.0, 0.8, 0.84];
    drawCube(gl, u_ModelMatrix, arm1Translation, arm1Scale, arm1Rotation, arm1Color);

    var arm2Translation = [2.05 + movement, -0.02 + movement, -0.6];
    var arm2Scale = [0.35, 0.2, 0.4];
    var arm2Rotation = [currentAngle, 0, 0, 1];
    var arm2Color = [1.0, 0.8, 0.84];
    drawCube(gl, u_ModelMatrix, arm2Translation, arm2Scale, arm2Rotation, arm2Color);

    //tail

    var tailTranslation = [.53 + movement, -0.3 + movement ,0.19];
    var tailScale = [0.2,0.3  ,0.2];
    var tailRotate = [45, 45, 0, 1];
    var tailColor = [0.82, 0.71, 0.55];
    drawCube(gl, u_ModelMatrix, tailTranslation, tailScale, tailRotate, tailColor);


    // Left Eye
    var leftTranslation = [2.16 + movement,1.3 + movement, 0.6];
    var leftScale = [0.1, 0.1, 0.2];
    var leftRotation = [0, 1, 0, 0];
    var leftColor = [0, 0, 0];
    drawCube(gl, u_ModelMatrix, leftTranslation, leftScale, leftRotation, leftColor);


    // Right Eye
    var rightTranslation = [2.16 + movement, 1.3 + movement, -0.6];
    var rightScale = [0.1, 0.1, 0.2];
    var rightRotation = [0, 1, 0, 0];
    var rightColor = [0, 0, 0];
    drawCube(gl, u_ModelMatrix, rightTranslation, rightScale, rightRotation, rightColor);

    // Nose 
    
    var noseTranslation = [2.48 + movement, 0.9 + movement, 0];
    var noseScale = [0.2, 0.1, 0.85];
    var noseRotation = [0, 1, 0, 0];
    var noseColor = [0.82, 0.71, 0.55];
    drawCube(gl, u_ModelMatrix, noseTranslation, noseScale, noseRotation, noseColor);
    
    // mouth
    
    var mouthTranslation = [2.75 + movement,0.89 + movement, -0.05];
    var mouthScale = [0.1, 0.1, 0.75];
    var mouthRotation = [0, 1, 0, 0];
    var mouthColor = [0.5, 0, 0.25];
    drawCube(gl, u_ModelMatrix, mouthTranslation, mouthScale, mouthRotation, mouthColor);
    

    // Left Ear
    var leftEarTranslation = [1.5 + movement,  1.1 + movement, 1.0];
    var leftEarScale = [0.5, 0.3, 0.75];
    var leftEarRotation = [0, 1, 0, 0];
    var leftEarColor = [0.82, 0.71, 0.55];
    drawCube(gl, u_ModelMatrix, leftEarTranslation, leftEarScale, leftEarRotation, leftEarColor);

    // Right Ear
    var rightEarTranslation = [1.5 + movement, 1.1 + movement, -1.0];
    var rightEarScale = [0.5, 0.3, 0.75];
    var rightEarRotation = [0, 1, 0, 0];
    var rightEarColor = [0.82, 0.71, 0.55];
    drawCube(gl, u_ModelMatrix, rightEarTranslation, rightEarScale, rightEarRotation, rightEarColor);

}

//Code below taken from Sample Program Hello Cube from Chapter 7 of Matsuda
//--------------------------------------------------------------------------------------------

function drawCube(gl, u_ModelMatrix, translation, scale, rotate, color) {

  //initialize the vertex buffer
    var n = initVertexBuffers(gl, color);
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }

    //Initialize the Matrix used to draw the cubes
    var modelMatrix = new Matrix4();
    modelMatrix.setTranslate(translation[0], translation[1], translation[2]);
    modelMatrix.scale(scale[0], scale[1], scale[2]);
    modelMatrix.rotate(rotate[0], rotate[1], rotate[2], rotate[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Draw the cube
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
	 g_last = Date.now();
}

function initVertexBuffers(gl, rgb){
    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3

    var vertices = new Float32Array([   // Vertex coordinates
        1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // v0-v3-v4-v5 right
        1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
        -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 left
        -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 down
        1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 back
    ]);

    var colors = new Float32Array([     // Colors
    rgb[0], rgb[1], rgb[2],  rgb[0], rgb[1], rgb[2],  rgb[0], rgb[1], rgb[2],  rgb[0], rgb[1], rgb[2],  // v0-v1-v2-v3 front(blue)
    rgb[0], rgb[1], rgb[2],  rgb[0], rgb[1], rgb[2],  rgb[0], rgb[1], rgb[2],  rgb[0], rgb[1], rgb[2],  // v0-v3-v4-v5 right(green)
    rgb[0], rgb[1], rgb[2],  rgb[0], rgb[1], rgb[2],  rgb[0], rgb[1], rgb[2],  rgb[0], rgb[1], rgb[2],  // v0-v5-v6-v1 up(red)
    rgb[0], rgb[1], rgb[2],  rgb[0], rgb[1], rgb[2],  rgb[0], rgb[1], rgb[2],  rgb[0], rgb[1], rgb[2],  // v1-v6-v7-v2 left
    rgb[0], rgb[1], rgb[2],  rgb[0], rgb[1], rgb[2],  rgb[0], rgb[1], rgb[2],  rgb[0], rgb[1], rgb[2],  // v7-v4-v3-v2 down
    rgb[0], rgb[1], rgb[2],  rgb[0], rgb[1], rgb[2],  rgb[0], rgb[1], rgb[2],  rgb[0], rgb[1], rgb[2]   // v4-v7-v6-v5 back
    ]);

    var indices = new Uint8Array([       // Indices of the vertices
    0, 1, 2,   0, 2, 3,    // front
    4, 5, 6,   4, 6, 7,    // right
    8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
    ]);

    // Create a buffer object
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) 
    return -1;

    // Write the vertex coordinates and color to the buffer object
    if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position'))
    return -1;

    if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color'))
    return -1;

    // Write the indices to the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function initArrayBuffer(gl, data, num, type, attribute) {
    var buffer = gl.createBuffer();   // Create a buffer object
    if (!buffer) {
      console.log('Failed to create the buffer object');
      return false;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // Assign the buffer object to the attribute variable
    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0) {
      console.log('Failed to get the storage location of ' + attribute);
      return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    // Enable the assignment of the buffer object to the attribute variable
    gl.enableVertexAttribArray(a_attribute);
  
    return true;
  }
//End of Matsuda Sample Program 
//-----------------------------------------------------------------------------



  //MATSUDA PG 129 CH 4

   var tick = function(){
    currentAngle = animate(currentAngle);
    drawAnimal(gl);
    requestAnimationFrame(tick);
  }
  tick(gl);
  
}
function animate(angle){


//Thanks for the help GIGI IN LAB :)

var now = Date.now();
var ellapsed = now - g_last; //milliseconds
//console.log(ellapsed);
g_last = now;
//console.log(g_last);
newAngle = angle + (ANGLE_STEP * ellapsed) / 100.0;
angle = newAngle;
console.log(angle);

if(angle > 7.25)
{
	increaseAngle = false; //if the angle goes past this point we want to rebound the angle back in the opposite negative direction
}
else if(angle < -7.25)
{
	increaseAngle = true; //if the angle goes past this point we want to rebound the angle back in the opposite positive direction
}

//same logic as animating, once the monkey reaches a certain point while moving up and down, send it in the opposite directikon
 if(movement > 0.03)
    {
      bounce = false;
    }
    else if(movement < -0.03)
    {
      bounce = true;
    }    

    if(bounce == true)
    {
      movement  +=  0.003;
    }
    else
    {
      movement -= 0.003;
    }
if(increaseAngle == true)
{
	return angle + 1;
}
else
{
	return angle - 1;
}

 

	
}