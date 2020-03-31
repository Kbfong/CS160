
// Vertex shader program from ASg3
var VSHADER_SOURCE3 =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'varying vec4 v_Color;\n' + 
  'uniform mat4 u_projectionMatrix;\n' +
  'uniform mat4 u_viewMatrix;\n' +
  'uniform mat4 u_transformMatrix;\n' +
  'attribute vec2 a_TexCoord;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '  gl_Position = u_projectionMatrix * u_viewMatrix * u_transformMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' +  
  '  v_TexCoord = a_TexCoord;\n' +
  '}\n';

// Fragment shader program from ASg3
var FSHADER_SOURCE3 =
  'precision mediump float;\n' + 
  'varying vec4 v_Color;\n' +    
  'uniform sampler2D u_Sampler;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color + texture2D(u_Sampler, v_TexCoord);\n' +
  '}\n';


  // Vertex shader program from ASg2
var VSHADER_SOURCE2 =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_ModelMatrix;' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * u_ModelMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program from ASg2
var FSHADER_SOURCE2 =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

//vertex shader prograzm from asg4
 var VSHADER_SOURCE4 =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_projectionMatrix;\n' +
  'uniform mat4 u_viewMatrix;\n' +
  'uniform mat4 u_ModelMatrix;\n' +    
  'uniform mat4 u_NormalMatrix;\n' +   
  'varying vec4 v_Color;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +
  'void main() {\n' +
  '  gl_Position = u_projectionMatrix * u_viewMatrix * u_ModelMatrix * a_Position;\n' +
    
  '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
  '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '  v_Color = a_Color;\n' + 
  '}\n';

// Fragment shader program from asg4
var FSHADER_SOURCE4 =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform vec3 u_LightColor;\n' +     // Light color
  'uniform vec3 u_LightPosition;\n' +  // Position of the light source
  'uniform vec3 u_AmbientLight;\n' +   // Ambient light color
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +
  'varying vec4 v_Color;\n' +
  'uniform int u_normalViz;\n' +
  'void main() {\n' +
     // Normalize the normal because it is interpolated and not 1.0 in length any more
  '  vec3 normal = normalize(v_Normal);\n' +
     // Calculate the light direction and make its length 1.
  '  vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' +
     // The dot product of the light direction and the orientation of a surface (the normal)
  '  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
     // Calculate the final color from diffuse reflection and ambient reflection
  '  vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;\n' +
  '  vec3 ambient = u_AmbientLight * v_Color.rgb;\n' +
  '  int normalViz = u_normalViz;\n'+
  '  if ( normalViz == 1 )\n' +
  '  {\n'+
  '    gl_FragColor = vec4(v_Normal, 1);\n' +
  '  }\n'+
  '  else\n'+
  '  {\n'+
  '    gl_FragColor = vec4(diffuse + ambient, v_Color.a);\n' +
  '  }\n'+
  '}\n';


var eye = [0, 2.5, 0];
var up = [0, 1, 0];
var look = [0, 0, 5];
var fov = 120; 
var aspect = 1;
var near = 1;
var far = 100; 
var n = 36;
var perspectiveMatrix = new Matrix4();
var lookAtMatrix = new Matrix4();
var ground = new Matrix4();
var horizon = new Matrix4();
var worldCubes = new Matrix4();

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
 var sphereVertices = [];
    var sphereIndices = [];
    var sphereRGB = [];


var stone = new Image();
stone.src = './textures/stone.jpg';
var creamy = new Image();
creamy.src = './textures/creamy.jpg';

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
  console.log('Failed to get the rendering context for WebGL');
  return;
  }

  if (!initShaders(gl, VSHADER_SOURCE2, FSHADER_SOURCE2)) {
  console.log('Failed to intialize shaders.');
  return;
  }

    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  if (!u_MvpMatrix) { 
      console.log('Failed to get the storage location of u_MvpMatrix');
      return;
  }

    //set the clear color
 // gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
 // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  drawAnimal(gl);
 

  vpMatrix.setPerspective(30, 2, 1, 100);
  vpMatrix.lookAt(20, 0, 0, 0, 0, 0, 0, 1, 0);
  // Pass the model view projection matrix to u_MvpMatrix
  gl.uniformMatrix4fv(u_MvpMatrix, false, vpMatrix.elements);
  vpMatrix.rotate(0, 0, 1, 0);

      drawAnimal(gl);

 

      // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE3, FSHADER_SOURCE3)) {
  console.log('Failed to intialize shaders.');
  return;
  }



 // gl.enable(gl.DEPTH_TEST)

//CODE USED FROM MATSUDA ssCHAPTER 7 SAMPLE PROGRAM LookAtTraingles.js
//------------- -------------------------------------------------------
 

  var u_projectionMatrix = gl.getUniformLocation(gl.program, 'u_projectionMatrix');
  var u_viewMatrix = gl.getUniformLocation(gl.program, 'u_viewMatrix');

  perspectiveMatrix.setPerspective(fov, aspect, near, far);
    lookAtMatrix.setLookAt(
    eye[0], eye[1], eye[2],
    eye[0]+look[0], eye[1]+look[1], eye[2]+look[2],
    up[0], up[1], up[2]
  );
  gl.uniformMatrix4fv(u_projectionMatrix, false, perspectiveMatrix.elements);
  gl.uniformMatrix4fv(u_viewMatrix, false, lookAtMatrix.elements);
//----------------------------------------------------------------------

/*
  document.onkeydown = function(ev) {
    keydown(ev, gl, u_viewMatrix, lookAtMatrix);
   // drawAnimal(gl);
    drawScene(gl);
    
  }
  */
    
 // gl.clearColor(0.0, 0.0, 0.0, 1.0);
 gl.enable(gl.DEPTH_TEST);
 // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  drawScene(gl);





  if (!initShaders(gl, VSHADER_SOURCE4, FSHADER_SOURCE4)) {
  console.log('Failed to intialize shaders.');
  return;
  }

  var u_projectionMatrix = gl.getUniformLocation(gl.program, 'u_projectionMatrix');
  var u_viewMatrix = gl.getUniformLocation(gl.program, 'u_viewMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  var u_getNormalViz = gl.getUniformLocation(gl.program, 'u_normalViz');

  //gl.enable(gl.DEPTH_TEST);
  drawFloatySphere(gl);

}



function drawScene(gl) {
  drawGround(gl);
  drawSkyBox(gl);
  createWorld(gl);
  
}

function keydown(ev, gl, viewMatrix, lookAtMatrix) { 


  if (ev.keyCode == 87)  // w, forward
  { 
    eye[0] += 0.5 * look[0];
    eye[1] += 0.5 * look[1];
    eye[2] += 0.5 * look[2];
  } 

   else if (ev.keyCode == 83) //s, backward
   { 
    eye[0] -= 0.5 * look[0];
    eye[1] -= 0.5 * look[1];
    eye[2] -= 0.5 * look[2];
   } 
   else if (ev.keyCode == 68)  //d, rightward
   {

    var vec = crossProduct();
    vec = normalize(vec);
    eye[0] += .85 * vec[0];
    eye[1] += .85 * vec[1];
    eye[2] += .85 * vec[2];

   } 
  
   else if (ev.keyCode == 65)  //a, leftward
    { 
     var vec = crossProduct();
     vec = normalize(vec);
     eye[0] -= .85 * vec[0];
     eye[1] -= .85 * vec[1];
     eye[2] -= .85 * vec[2];
    }

  lookAtMatrix.setLookAt(
    eye[0], eye[1], eye[2],
    eye[0]+look[0], eye[1]+look[1], eye[2]+look[2],
    up[0], up[1], up[2]
  );
  gl.uniformMatrix4fv(viewMatrix, false, lookAtMatrix.elements);
}

function magnitude(vec) {
  
  return Math.sqrt(vec[0] * vec[0]) + (vec[1] * vec[1]) + (vec[2] * vec[2]);
}

function normalize(vec) {
   var mag = magnitude(vec);
   var normalized = [vec[0]/mag, vec[1]/mag, vec[2]/mag]; 
  return normalized;
}

function crossProduct() { 
  

 //CROSS PRODUCT FORMULA a2b3 - a3b2, a3b1 - a1b3, a1b2 - a2b1

 //a2b3 -a3b2
 var x = look[1] * up[2] - look[2] * up[1];
 //a3b1 - a1b3
 var y = look[2] * up[0] - look[0] * up[2];
 //a1b2 - a2b1
 var z = look[0] * up[1] - look[1] * up[0];
 return [x,y,z];
}

function initTextures(gl, vertices, name) {

  // Create a texture object
  var texture = gl.createTexture();   
  if (!texture) {
      console.log('Failed to create the texture object');
      return false;
  }
  
  // Get the storage location of u_Sampler
  var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  if (!u_Sampler) {
      console.log('Failed to get the storage location of u_Sampler');
      return false;
  }

  var image = new Image();  // Create the image object
  if (!image) {
    console.log('Failed to create the image object');
      return false;
  }
  
  //loads the textures based on their name
  if(name == 'stone') {
    loadTexture(gl, vertices, texture, u_Sampler, stone);
  } else if(name == 'creamy') {
    loadTexture(gl, vertices, texture, u_Sampler, creamy);
  } 
  return true;
  }

function drawCube(gl, n) {
  //pass in transformation matrix and set
  gl.drawArrays(gl.TRIANGLES, 0, 32)
}

function loadTexture(gl, vertices, texture, u_Sampler, image) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);
  
  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler, 0);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
}

function initVertexBuffers(gl, x, y, z, size, rgb){

   // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3

  r = rgb[0]
  g = rgb[1]
  b = rgb[2]
  var vertices = new Float32Array( [
    
    //top 
    x-size, y+size, z+size, r, g, b,
    x+size, y+size, z+size, r, g, b,
    x-size, y-size, z+size, r, g, b,
    x-size, y-size, z+size, r, g, b,
    x+size, y+size, z+size, r, g, b,
    x+size, y-size, z+size, r, g, b,
    //left
    x-size, y+size, z-size, r, g, b,
    x+size, y+size, z-size, r, g, b,
    x-size, y-size, z-size, r, g, b,
    x-size, y-size, z-size, r, g, b,
    x+size, y+size, z-size, r, g, b,
    x+size, y-size, z-size, r, g, b,
    //right
    x-size, y+size, z+size, r, g, b,
    x-size, y+size, z-size, r, g, b,
    x-size, y-size, z+size, r, g, b,
    x-size, y-size, z+size, r, g, b,
    x-size, y+size, z-size, r, g, b,
    x-size, y-size, z-size, r, g, b,
    //front
    x+size, y+size, z+size, r, g, b,
    x+size, y+size, z-size, r, g, b,
    x+size, y-size, z+size, r, g, b,
    x+size, y-size, z+size, r, g, b,
    x+size, y+size, z-size, r, g, b,
    x+size, y-size, z-size, r, g, b,
    //back       
    x-size, y+size, z-size, r, g, b,
    x+size, y+size, z-size, r, g, b,
    x-size, y+size, z+size, r, g, b,
    x-size, y+size, z+size, r, g, b,
    x+size, y+size, z-size, r, g, b,
    x+size, y+size, z+size, r, g, b,
    //bottom         
    x-size, y-size, z-size, r, g, b,  
    x+size, y-size, z-size, r, g, b,
    x-size, y-size, z+size, r, g, b,
    x-size, y-size, z+size, r, g, b,
    x+size, y-size, z-size, r, g, b,
    x+size, y-size, z+size, r, g, b
  ]);

  
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var FSIZE = vertices.BYTES_PER_ELEMENT;
  
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object
  
  // Get the storage location of a_Position, assign buffer and enable
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);  // Enable the assignment of the buffer object
  //console.log(vertices)

  var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
  if (a_TexCoord < 0) {
    console.log('Failed to get the storage location of a_TexCoord');
    return -1;
  }

  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.disableVertexAttribArray(a_TexCoord);
  return n;
  //gl.drawArrays(gl.TRIANGLES, 0, n);

}

function initTexturedBuffers(gl){
  // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3

   // SOME CODE USED DIRECTLY FROM MATSUDA CHAPTER 5 SAMPLE PROGRAM MultiAttributeColor.js
  //---------------------------------------------------------------------------------------------------------
  var vertices = new Float32Array( [
    // Top
    -1.0,  1.0, -1.0,    0, 0,
    -1.0,  1.0,  1.0,    0, 1,
     1.0,  1.0,  1.0,    1, 1,
     1.0,  1.0, -1.0,    1, 0,
    
    // Left 
    -1.0,  1.0,  1.0,    1, 1,
    -1.0, -1.0,  1.0,    1, 0,
    -1.0, -1.0, -1.0,    0, 0,
    -1.0,  1.0, -1.0,    0, 1,
 
    // Right 
     1.0,  1.0,  1.0,    1, 1,
     1.0, -1.0,  1.0,    1, 0,
     1.0, -1.0, -1.0,    0, 0,
     1.0,  1.0, -1.0,    0, 1,

    // Front
     1.0,  1.0,  1.0,    1, 1,
     1.0, -1.0,  1.0,    1, 0,
    -1.0, -1.0,  1.0,    0, 0,
    -1.0,  1.0,  1.0,    0, 1,

    // Back
     1.0,  1.0, -1.0,    1, 1,
     1.0, -1.0, -1.0,    1, 0,
    -1.0, -1.0, -1.0,    0, 0,
    -1.0,  1.0, -1.0,    0, 1,

    // Bottom
    -1.0, -1.0, -1.0,    1, 1,
    -1.0, -1.0,  1.0,    1, 0,
     1.0, -1.0,  1.0,    0, 0,
     1.0, -1.0, -1.0,    0, 1,
  ]);

  var indices = new Uint16Array( [
    0, 1, 2, 0, 2, 3, //front

    4, 5, 6, 4, 6, 7, //right
    
    8, 9, 10, 8, 10, 11, //up

    
    12, 13, 14, 12, 14, 15, //left

    
    16, 17, 18,  16, 18, 19, // Bottom

    
    20, 21, 22, 20, 22, 23 // Back
  ]);

  
 
  
  var vertexBuffer = gl.createBuffer();
  var indexBuffer = gl.createBuffer();

  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  if(!indexBuffer)
  {
    console.log('Failed to create the buffer object');
    return -1;
  }
  
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);



  var FSIZE = vertices.BYTES_PER_ELEMENT;
  
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 5, 0);
  gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object
  
  var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
  if (a_TexCoord < 0) {
    console.log('Failed to get the storage location of a_TexCoord');
    return -1;
  }
  // Assign the buffer object to a_TexCoord variable
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 5, FSIZE * 3);
  gl.enableVertexAttribArray(a_TexCoord);  // Enable the assignment of the buffer object

  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }

  gl.disableVertexAttribArray(a_Color);
  gl.vertexAttrib4f(a_Color, 0, 0, 0, 0);

  return indices.length;
}
//END OF SAMPLE PROGRAM USAGE
//---------------------------------------------------------------------------------



function  createWorld(gl){
  var world = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], 
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0], 
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], 
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
    [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
  ]                
  
  for( var i = 0; i < 32; i++) 
  {
    
    for( var j = 0; j < 32; j++) 
    {
      if (world[i][j] > 0)
       {
        var height = world[i][j];
        for (k = 1; k <= height; k++) 
        {
          var u_transformationMatrix = gl.getUniformLocation(gl.program, 'u_transformMatrix');
          n = initTexturedBuffers(gl, 0, 0, 0, 1);
          worldCubes.setScale(1, 1.5, 1)
          worldCubes.translate((16-j), k, (16-i));
          gl.uniformMatrix4fv(u_transformationMatrix, false, worldCubes.elements);
          if(((i+j + k) % 2) == 0) 
          {
            initTextures(gl, n, 'creamy');
          } else {
            initTextures(gl, n, 'stone');
          }
        }
      }
    }
  }
}

function drawSkyBox(gl){
  var u_transformationMatrix = gl.getUniformLocation(gl.program, 'u_transformMatrix');
  n = initVertexBuffers(gl, 0, 0, 0, 1, [0, 0, 0]);
  horizon.setScale(64, 128, 64);
  gl.uniformMatrix4fv(u_transformationMatrix, false, horizon.elements);
  drawCube(gl, n);
}
function drawGround(gl){
  var u_transformationMatrix = gl.getUniformLocation(gl.program, 'u_transformMatrix');
  n = initVertexBuffers(gl, 0, 0, 0, 1, [1, 1, 0]);
  ground.setScale(128, 0, 128);
  gl.uniformMatrix4fv(u_transformationMatrix, false, ground.elements);
  drawCube(gl, n);
}



function drawCubeAnimal(gl, u_ModelMatrix, translation, scale, rotate, color) {

  //initialize the vertex buffer
    var n = initVertexBuffersAnimal(gl, color);
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
  
}

function initArrayBufferAnimal(gl, data, num, type, attribute) {
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

  function initVertexBuffersAnimal(gl, rgb){
    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3

    var verticesAnimal = new Float32Array([   // Vertex coordinates
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

    var indicesAnimal = new Uint8Array([       // Indices of the vertices
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
    if (!initArrayBufferAnimal(gl, verticesAnimal, 3, gl.FLOAT, 'a_Position'))
    return -1;

    if (!initArrayBufferAnimal(gl, colors, 3, gl.FLOAT, 'a_Color'))
    return -1;

    // Write the indices to the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesAnimal, gl.STATIC_DRAW);

    return indicesAnimal.length;
}

function drawAnimal(gl){

    //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    //var u_transformationMatrix = gl.getUniformLocation(gl.program, 'u_transformMatrix');

    // Head
    var headTranslation = [1.25 + movement,  1 + 1, 0];
    var headScale = [1, 0.5, 1.01];
    var headRotation = [0, 1, 0, 0];
    var headColor = [0.39, 0.26, 0.13];
    drawCubeAnimal(gl, u_ModelMatrix, headTranslation, headScale, headRotation, headColor);

    // Body
    var bodyTranslation = [1.25 + movement,1, 0];
    var bodyScale = [0.5, 0.5, 1.0];
    var bodyRotation = [1.5, 1.5, 1.5, 0.5];
    var bodyColor = [0.39, 0.26, 0.13];
    drawCubeAnimal(gl, u_ModelMatrix, bodyTranslation, bodyScale, bodyRotation, bodyColor);


  

      // legs
    var leg1Translation = [1.55 + movement, -0.70 + 1, 0.59];
    var leg1Scale = [0.75, 0.2, 0.4];
    var leg1Rotation = [currentAngle, 0, 0, 1];
    var leg1Color = [0.40, 0.27, 0.15];
    drawCubeAnimal(gl, u_ModelMatrix, leg1Translation, leg1Scale, leg1Rotation, leg1Color);

    var leg2Translation = [1.55 + movement, -0.70 + 1, -0.59];
    var leg2Scale = [0.75, 0.2, 0.4];
    var leg2Rotation = [currentAngle, 0, 0, 1];
    var leg2Color = [0.40, 0.27, 0.15];
    drawCubeAnimal(gl, u_ModelMatrix, leg2Translation, leg2Scale, leg2Rotation, leg2Color);
    


    // arms
    
    var arm1Translation = [2.05 + movement, -0.02 + 1, 0.6];
    var arm1Scale = [0.35, 0.2, 0.4];
    var arm1Rotation = [currentAngle, 0, 0, 1];
    var arm1Color = [1.0, 0.8, 0.84];
    drawCubeAnimal(gl, u_ModelMatrix, arm1Translation, arm1Scale, arm1Rotation, arm1Color);

    var arm2Translation = [2.05 + movement, -0.02 + 1, -0.6];
    var arm2Scale = [0.35, 0.2, 0.4];
    var arm2Rotation = [currentAngle, 0, 0, 1];
    var arm2Color = [1.0, 0.8, 0.84];
    drawCubeAnimal(gl, u_ModelMatrix, arm2Translation, arm2Scale, arm2Rotation, arm2Color);

    //tail

    var tailTranslation = [.53 + movement, -0.3 + 1 ,0.19];
    var tailScale = [0.2,0.3  ,0.2];
    var tailRotate = [45, 45, 0, 1];
    var tailColor = [0.82, 0.71, 0.55];
    drawCubeAnimal(gl, u_ModelMatrix, tailTranslation, tailScale, tailRotate, tailColor);


    // Left Eye
    var leftTranslation = [2.16 + movement,1.3 + 1, 0.6];
    var leftScale = [0.1, 0.1, 0.2];
    var leftRotation = [0, 1, 0, 0];
    var leftColor = [0, 0, 0];
    drawCubeAnimal(gl, u_ModelMatrix, leftTranslation, leftScale, leftRotation, leftColor);


    // Right Eye
    var rightTranslation = [2.16 + movement, 1.3 + 1, -0.6];
    var rightScale = [0.1, 0.1, 0.2];
    var rightRotation = [0, 1, 0, 0];
    var rightColor = [0, 0, 0];
    drawCubeAnimal(gl, u_ModelMatrix, rightTranslation, rightScale, rightRotation, rightColor);

    // Nose 
    
    var noseTranslation = [2.48 + movement, 0.9 + 1, 0];
    var noseScale = [0.2, 0.1, 0.85];
    var noseRotation = [0, 1, 0, 0];
    var noseColor = [0.82, 0.71, 0.55];
    drawCubeAnimal(gl, u_ModelMatrix, noseTranslation, noseScale, noseRotation, noseColor);
    
    // mouth
    
    var mouthTranslation = [2.75 + movement,0.89 + 1, -0.05];
    var mouthScale = [0.1, 0.1, 0.75];
    var mouthRotation = [0, 1, 0, 0];
    var mouthColor = [0.5, 0, 0.25];
    drawCubeAnimal(gl, u_ModelMatrix, mouthTranslation, mouthScale, mouthRotation, mouthColor);
    

    // Left Ear
    var leftEarTranslation = [1.5 + movement,  1.1 + 1, 1.0];
    var leftEarScale = [0.5, 0.3, 0.75];
    var leftEarRotation = [0, 1, 0, 0];
    var leftEarColor = [0.82, 0.71, 0.55];
    drawCubeAnimal(gl, u_ModelMatrix, leftEarTranslation, leftEarScale, leftEarRotation, leftEarColor);

    // Right Ear
    var rightEarTranslation = [1.5 + movement, 1.1 + 1, -1.0];
    var rightEarScale = [0.5, 0.3, 0.75];
    var rightEarRotation = [0, 1, 0, 0];
    var rightEarColor = [0.82, 0.71, 0.55];
    drawCubeAnimal(gl, u_ModelMatrix, rightEarTranslation, rightEarScale, rightEarRotation, rightEarColor);

    //random floating cube

     var randomCubeTranslation = [16, 0.33, 1.0];
    var randomCubeScale = [0.5, 0.25, 0.5];
    var randomCubeRotation = [0, 1, 0, 0];
    var randomCubeColor = [0.5, 1, 0.75];
    drawCubeAnimal(gl, u_ModelMatrix, randomCubeTranslation,randomCubeScale,randomCubeRotation, randomCubeColor);

  

}


//code from https://stackoverflow.com/questions/47756053/webgl-try-draw-sphere
function initSphere(gl, rgb) {
    var SPHERE_DIV = 13;

    var i, ai, si, ci;
    var j, aj, sj, cj;
    var p1, p2;
    var r = rgb[0]
    var g = rgb[1]
    var b = rgb[2]
    

    // Generate coordinates
    for (j = 0; j <= SPHERE_DIV; j++) {
        aj = j * Math.PI / SPHERE_DIV;
        sj = Math.sin(aj);
        cj = Math.cos(aj);
        for (i = 0; i <= SPHERE_DIV; i++) {
            ai = i * 2 * Math.PI / SPHERE_DIV;
            si = Math.sin(ai);
            ci = Math.cos(ai);

            sphereVertices.push(si * sj);  // x
            sphereVertices.push(cj);       // y
            sphereVertices.push(ci * sj);  // z

            sphereRGB.push(r);
            sphereRGB.push(g);
            sphereRGB.push(b);
        }
    }

    // Generate indices
    for (j = 0; j < SPHERE_DIV; j++) {
        for (i = 0; i < SPHERE_DIV; i++) {
            p1 = j * (SPHERE_DIV + 1) + i;
            p2 = p1 + (SPHERE_DIV + 1);

            sphereIndices.push(p1);
            sphereIndices.push(p2);
            sphereIndices.push(p1 + 1);

            sphereIndices.push(p1 + 1);
            sphereIndices.push(p2);
            sphereIndices.push(p2 + 1);
        }
    }


    
  if (!initSphereArrayBuffer(gl, new Float32Array(sphereVertices),3, gl.FLOAT, 'a_Position',)) 
    return -1;

  if (!initSphereArrayBuffer(gl, 'a_Normal', new Float32Array(sphereVertices), gl.FLOAT, 3)) 
   return -1;
  if (!initSphereArrayBuffer(gl, new Float32Array(sphereRGB),3, gl.FLOAT, 'a_Color')) 
   return -1;
  
  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
 
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphereIndices), gl.STATIC_DRAW);
  
  return sphereIndices.length;
  
}






function drawFloatySphere(gl){
  var u_transformationMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  n = initSphere(gl, [1, 1, 0]);
  flatten = new Matrix4();
  flatten.setTranslate(10, 3, 1.5);
  flatten.scale(1, 1, 1)
  norm = new Matrix4();
  norm.setInverseOf(flatten);
  norm.transpose();

  gl.uniformMatrix4fv(u_transformationMatrix, false, flatten.elements);
  gl.uniformMatrix4fv(u_NormalMatrix, false, norm.elements);
  drawSphere(gl, n);
  
}

function drawSphere(gl, n) {
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
}

function initSphereArrayBuffer(gl, attribute, data, type, num) {
  // Create a buffer object
  var buffer = gl.createBuffer();
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
  