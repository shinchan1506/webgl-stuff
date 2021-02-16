/* projectDraw.js
//	
//	Written by Shin Imai for CS 425, Fall 2020
*/

// Object-independent variables
var gl;				// WebGL graphics environment
var program;		// The shader program
var aspectRatio;	// Aspect ratio of viewport

// Axes-related  variables
var nAxesPoints = 0;	// Number of points in the vertex arrays for the axes
var vbufferID_axes;		// ID of buffer holding axes positions
var cbufferID_axes;		// ID of buffer holding axes colors

// Simple geometry buffers and positions data
var signBuffers;						// Buffer IDS for the sign
var coneBuffers;						// Array of buffer IDs used by the randomly colored cone
var solidConeBuffers;					// Array of buffer IDs used by the solid color cone
var cylinderBuffers;					// Array of buffer IDs used by cyliner
var carouselSeatBuffers = []; 			// Array of Array of buffer IDS used for the carousel seats
var carouselSeatPositions = []; 		// Array of seat positions for ccarousel
var wheelSeatBuffers = [];   			// Array of Array of buffer IDS used for the ferris wheel passenger cars
var wheelSeatPositions = [];  			// Array of passenger car positions for ferris wheel
var wheelOffset = vec3(2,1,-1.5);		// where the wheel will be centered at
var carouselOffset = vec3(0.5,0,0.5);	// where the carousel will be centered at
var signOffset = vec3(0.5, 0, -2);

// details about geometry and rides
var nSeats = 12; 						// num seats on carousel and ferris wheel
var nConeSectors = 10;					// Number of sectors in first cone
var nConeSectors2 = 11;					// Number of sectors in second cone
var nCylinderSectors = 10;

// camera-related
const DEFAULT_THETA = 0;				// Angle at which the camera is facing
const LENGTH_CAM = 1;					// Radius, or magnitude of vector from eye to at
const FIXED_Y = 0.25;					// Keep y constant for the camera so it only moves on the XZ plane
const DEFAULT_EYE = vec3(-2,FIXED_Y,0);	// Default position for the eye

// textures
var stripes;
var checkers;
var sign;

// Use the default eye as the center and calculate the position on the circle which will be "at". Radius is LENGTH_CAM
const DEFAULT_AT = add(DEFAULT_EYE, vec3 (LENGTH_CAM * Math.cos(radians(DEFAULT_THETA)), FIXED_Y, LENGTH_CAM * Math.sin(DEFAULT_THETA)));

// camera variables that can be changed by the user later in the program
var eye = DEFAULT_EYE;
var at = DEFAULT_AT;
var cam_theta = DEFAULT_THETA;
var movementSpeed = .1;
var cam_rotate_speed = 1;

// program execution related
var startTime = Date.now();		// start time of program execution
var delay = 10; 				// how long till next render

// light data with the ambience, diffuse, specular listed, point light is defaulted to source of vec3(0,0,0)
var ambientLight = {
	ambientProduct: {type: "v4", value: vec4(0.5, 0.5, 0.5, 1.0 ) },
	diffuseProduct: {type: "v4", value: vec4(1.0, 1.0, 1.0,  1.0)},
	specularProduct: {type: "v4", value: vec4(1.0, 0.8, 1.0, 1.0 )},
}

var directedLight = {
	ambientProduct: {type: "v4", value:  vec4(0.5, 0.1, 0.5, 1.0 )  },
	diffuseProduct: {type: "v4", value: vec4(1.0, 1.0, 1.0,  1.0)  },
	specularProduct: {type: "v4", value:  vec4(1.0, 0.1, 1.0, 1.0)},
	direction: {type: "v4", value: vec4(0.0, 0.0, 1.0, 0.0)},
	source: {type: "v4", value: vec4 (0.0, 0.0, 0.0, 0.0)}
}


var carouselShininess = 20.0;
var wheelShininess = 200.0;

// text for instructions
const INSTRUCTIONS = "<b>CONTROLS</b>: </br> \
Press <b>W</b> to move forward </br> \
Press <b>S</b> to move backwards </br> \
Press <b>A</b> to rotate view to the left </br> \
Press <b>D</b> to rotate view to the right </br> \
Press <b>R</b> to reset view</br>";




// Initialization function runs whenever the page is loaded

window.onload = function init( ) {
	
	// Set up the canvas, viewport, and clear color

	var canvas = document.getElementById( "gl-canvas" );
	gl=WebGLUtils.setupWebGL( canvas );
	if( !gl ) {
		alert( "No WebGL" );
	}
	
	gl.viewport( 0, 0, canvas.width, canvas.height );
	aspectRatio = canvas.width / canvas.height ;
	gl.clearColor( 0, 0, 0, 1.0 );
	
	// Load the shaders, create a GLSL program, and use it.
	program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );
	
	// Create the solid cone: the roof of the carousel
	solidConeBuffers = createCone( nConeSectors2, gl, [0.6,00,0]);
	
	// create the cylinder: the central support beam of the carousel
	cylinderBuffers = createCylinder(nCylinderSectors, gl, [0.4,0.4,0.4]);

	// create an nSeats amount of carousel seats/horses (as cubes)
	dTheta = radians( 360 / nSeats );
	for (numCubes = 0; numCubes < nSeats; numCubes++) {
		var theta = numCubes * dTheta;
		carouselSeatBuffers[numCubes] = createCube(gl, [Math.random(), Math.random(), Math.random()]);
		carouselSeatPositions[numCubes] = vec3(Math.cos(theta), 0, Math.sin(theta));
	}

	// create the ferris wheel as an nSeats amount of cylinders. Rotate them later
	dTheta = radians( 360 / nSeats );
	for (numCubes = 0; numCubes < nSeats; numCubes++) {
		var theta = numCubes * dTheta;
		wheelSeatBuffers[numCubes] = createCylinder(nCylinderSectors, gl, [Math.random(), Math.random(), Math.random()]);
		wheelSeatPositions[numCubes] = vec3(0, Math.sin(theta), Math.cos(theta));
	}

	// create the sign
	signBuffers = createCube(gl, [1,1,1]);
		

	gl.enable( gl.DEPTH_TEST );	// Note:  This line had an error in the exercise template.
	
	window.onkeydown = function(event) {
		var key = String.fromCharCode(event.keyCode);
		//console.log(eye);
        switch(key) {
			// reset eye and at to defaults
			case 'R':
				eye = vec3(DEFAULT_EYE);
				at = vec3(DEFAULT_AT);
				cam_theta = DEFAULT_THETA;
			break;

			// camera moving forward
			case 'W':
				var dir = vec3(at[0] - eye[0], at[1] - eye[1], at[2]-eye[2]); // at - eye
				var magDir = Math.sqrt(Math.pow(dir[0],2) + Math.pow(dir[1],2) + Math.pow(dir[2],2)); //magnitude
				var unitDir = vec3(dir[0]/magDir, dir[1]/magDir, dir[2]/magDir); //unit vector of direction

				// move forward by unit vector
				eye[0] = eye[0] + unitDir[0] * movementSpeed;
				//eye[1] = eye[1] + unitDir[1] * movementSpeed;
				eye[2] = eye[2] + unitDir[2] * movementSpeed;

				at[0] = at[0] + unitDir[0] * movementSpeed;
				//at[1] = at[1] + unitDir[1] * movementSpeed;
				at[2] = at[2] + unitDir[2] * movementSpeed;
			break;

			// calculate a circle and move "at" along the circle to the left
			case 'A':
				cam_theta = cam_theta - cam_rotate_speed;
				at[0] = eye[0] + LENGTH_CAM * Math.cos(radians(cam_theta));
				at[2] = eye[2] + LENGTH_CAM * Math.sin(radians(cam_theta));
			break;

			// camera moving backward
			case 'S':
				var dir = vec3(eye[0] - at[0], eye[1] - at[1], eye[2]-at[2]); // eye - at
				var magDir = Math.sqrt(Math.pow(dir[0],2) + Math.pow(dir[1],2) + Math.pow(dir[2],2)); //magnitude
				var unitDir = vec3(dir[0]/magDir, dir[1]/magDir, dir[2]/magDir); //unit vector of direction

				// move backwards by unit vector
				eye[0] = eye[0] + unitDir[0] * movementSpeed;
				//eye[1] = eye[1] + unitDir[1] * movementSpeed;
				eye[2] = eye[2] + unitDir[2] * movementSpeed;

				at[0] = at[0] + unitDir[0] * movementSpeed;
				//at[1] = at[1] + unitDir[1] * movementSpeed;
				at[2] = at[2] + unitDir[2] * movementSpeed;
			break;
			
			case 'D':
				cam_theta = cam_theta + cam_rotate_speed;
				at[0] = eye[0] + LENGTH_CAM * Math.cos(radians(cam_theta));
				at[2] = eye[2] + LENGTH_CAM * Math.sin(radians(cam_theta));
			break;

			default:
				document.getElementById("instructions").innerHTML = INSTRUCTIONS;
			break;
        }
	};

	gl.uniform3fv(gl.getUniformLocation(program, "eyePosition"),
	   flatten(eye) );

	
	// these are my lights; one point light called ambient light and one directed light called directedlight
	gl.uniform4fv( gl.getUniformLocation(program, "a1.ambientProduct"), ambientLight.ambientProduct.value );
	gl.uniform4fv( gl.getUniformLocation(program, "a1.diffuseProduct"), ambientLight.diffuseProduct.value);
	gl.uniform4fv( gl.getUniformLocation(program, "a1.specularProduct"), ambientLight.specularProduct.value);

	gl.uniform4fv( gl.getUniformLocation(program, "d1.ambientProduct"), directedLight.ambientProduct.value );
	gl.uniform4fv( gl.getUniformLocation(program, "d1.diffuseProduct"), directedLight.diffuseProduct.value);
	gl.uniform4fv( gl.getUniformLocation(program, "d1.specularProduct"), directedLight.specularProduct.value);
	gl.uniform4fv( gl.getUniformLocation(program, "d1.direction"), directedLight.direction.value);
	gl.uniform4fv( gl.getUniformLocation(program, "d1.source"), directedLight.source.value);

	// load the textures
	var texData = fillStripes( Math.random() * 255, Math.random() * 255, Math.random() * 255 ); // 32 x 32
	var texture = gl.createTexture( );
	gl.activeTexture( gl.TEXTURE0 );
	gl.bindTexture( gl.TEXTURE_2D, texture );
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, 32, 32, 0, gl.RGBA, gl.UNSIGNED_BYTE, texData );
	stripes = texture;

	var checkersTexData = fillCheckers( Math.random() * 255, Math.random() * 255, Math.random() * 255 ); // 32 x 32
	var checkersTex = gl.createTexture( );
	gl.activeTexture( gl.TEXTURE0 );
	gl.bindTexture( gl.TEXTURE_2D, checkersTex );
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, 32, 32, 0, gl.RGBA, gl.UNSIGNED_BYTE, checkersTexData );
	checkers = checkersTex;

	var signTexData = fillHI(); // 32 x 32
	var signTex = gl.createTexture( );
	gl.activeTexture( gl.TEXTURE0 );
	gl.bindTexture( gl.TEXTURE_2D, signTex );
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, 32, 32, 0, gl.RGBA, gl.UNSIGNED_BYTE, signTexData );
	sign = signTex;

	gl.generateMipmap( gl.TEXTURE_2D );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    
	// Initialization is done.  Now initiate first rendering
	render( );
}


function render( ) {
	
	// Clear out the color buffers and the depth buffers.
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	
	// Create modelView using lookAt( eye, at, up );
	var modelView = lookAt( eye, at, vec3( 0, 1, 0 ) );
	var vModelView = gl.getUniformLocation( program, "vModelView" );
	gl.uniformMatrix4fv( vModelView, false, flatten( modelView ) );
	
	// Create another mat4 using perspective( ) and send it to the GPU
	var projection = perspective( 60, aspectRatio, 0.1, 20.0 );
	var vProjection = gl.getUniformLocation( program, "vProjection" );
	gl.uniformMatrix4fv( vProjection, false, flatten( projection ) );
	
	// Set the transformation matrix as a mat4 Identity matrix and send it to the GPU
	var transformation = mat4( );
	var vTransformation = gl.getUniformLocation( program, "vTransformation" );
	gl.uniformMatrix4fv( vTransformation, false, flatten( transformation ) );
	
	// Connect the axes vertex data to the shader variables - First positions
	gl.bindBuffer( gl.ARRAY_BUFFER, vbufferID_axes );
	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );
	
	// Then the axes colors
	gl.bindBuffer( gl.ARRAY_BUFFER, cbufferID_axes );
	var vColor = gl.getAttribLocation( program, "vColor" );
	gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vColor );
	
	gl.bindBuffer( gl.ARRAY_BUFFER, null );
	
	// Transformations and then draw
	var vTransformation = gl.getUniformLocation(program, "vTransformation");
	var vRotation = gl.getUniformLocation(program, "vRotation");

	// send off illumination data for the CAROUSEL to vertex shader
	gl.uniform1f(gl.getUniformLocation(program,
		"shininess"),carouselShininess);
	var materialAmbient = vec4( 0.2, 0.2, 0.2, 1.0 );
	var materialDiffuse = vec4( 0.8, 0.8, 0.8, 1.0);
	var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
	gl.uniform4fv(gl.getUniformLocation(program, "materialAmbient"),flatten(materialAmbient));
	gl.uniform4fv(gl.getUniformLocation(program, "materialDiffuse"),flatten(materialDiffuse) );
	gl.uniform4fv(gl.getUniformLocation(program, "materialSpecular"),flatten(materialSpecular) );
	
	// CHANGE TO HI TEXTURE
	gl.bindTexture( gl.TEXTURE_2D, sign );
	gl.uniform1i( gl.getUniformLocation( program, "texMap" ), 0 );
	gl.uniform1f( gl.getUniformLocation( program, "texEnabled" ), 1.0 );
	gl.generateMipmap( gl.TEXTURE_2D );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

	// Transform SIGN and draw. Centered at sign offset
	transformation = mult( translate( add(signOffset,vec3(0,1,0))), scalem( 2, 1, 0.01) );
	gl.uniformMatrix4fv( vTransformation, false, flatten(transformation));
	renderCube( signBuffers, gl, program);

	// change to stripes and enable textures
	gl.bindTexture( gl.TEXTURE_2D, stripes );
	gl.uniform1i( gl.getUniformLocation( program, "texMap" ), 0 );
	gl.uniform1f( gl.getUniformLocation( program, "texEnabled" ), 1.0 );
	gl.generateMipmap( gl.TEXTURE_2D );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

	// Transform cone and draw. Centered at carouselOffset
	transformation = mult( translate( add(carouselOffset,vec3(0,1,0))), scalem( 1.3, 0.4, 1.3 ) );
	gl.uniformMatrix4fv( vTransformation, false, flatten(transformation));
	renderCone( solidConeBuffers, nConeSectors2, gl, program);
	
	// Transform cylinder and draw. Centered at carouselOffset
	transformation = mult( translate( carouselOffset), scalem( 0.15, 1, 0.15 ) );
	gl.uniformMatrix4fv( vTransformation, false, flatten(transformation));
	renderCylinder( cylinderBuffers, nCylinderSectors, gl, program);
	
	// disable the textures
	gl.uniform1f( gl.getUniformLocation( program, "texEnabled" ), 0.0 );

	// Transform the seats (cubes) and draw. Rotate around the center of carousel (carouselOFfset)
	var difference = startTime - Date.now();
	var dTheta = radians( 360 / nSeats );
	for(seat = 0; seat < nSeats; seat++) {
		var theta = seat * dTheta + difference/1000;
		// this part does the compound rotations
		carouselSeatPositions[seat][0] = carouselOffset[0] + Math.cos(theta);
		carouselSeatPositions[seat][1] = carouselOffset[1] + Math.sin(radians(difference/10 + seat*1000))/5+1/5+0.5*.2;
		carouselSeatPositions[seat][2] = carouselOffset[2] + Math.sin(theta);

		transformation = mult( rotate(-difference/10, vec3(0,1,0)) , scalem(0.2,0.2,0.2) );
		transformation = mult(translate(carouselSeatPositions[seat]), transformation);
		gl.uniformMatrix4fv( vTransformation, false, flatten(transformation));

		var rotation = rotate(-difference/10, vec3(0,1,0));
		gl.uniformMatrix4fv( vRotation, false, flatten(rotation));

		// draw it
		renderCube( carouselSeatBuffers[seat], gl, program);
	}

	// send off  material properties for the FERRIS WHEEL to fragment shader
	gl.uniform1f(gl.getUniformLocation(program,
		"shininess"),wheelShininess);
	var materialAmbient = vec4( 1.0,1.0, 1.0, 1.0 );
	var materialDiffuse = vec4( 0.8, 0.8, 0.8, 1.0);
	var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
	gl.uniform4fv(gl.getUniformLocation(program, "materialAmbient"),flatten(materialAmbient));
	gl.uniform4fv(gl.getUniformLocation(program, "materialDiffuse"),flatten(materialDiffuse) );
	gl.uniform4fv(gl.getUniformLocation(program, "materialSpecular"),flatten(materialSpecular) );

	// change to checkers and enable textures
	gl.bindTexture( gl.TEXTURE_2D, checkers );
	gl.uniform1i( gl.getUniformLocation( program, "texMap" ), 0 );
	gl.uniform1f( gl.getUniformLocation( program, "texEnabled" ), 1.0 );
	gl.generateMipmap( gl.TEXTURE_2D );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

	// do pretty much the same thing for the ferris wheel but rotate on the x axis
	var dTheta = radians( 360 / nSeats );
	for(seat = 0; seat < nSeats; seat++) {
		var theta = seat * dTheta + difference/1000;
		wheelSeatPositions[seat][1] = carouselOffset[1] + Math.sin(theta);
		wheelSeatPositions[seat][2] = carouselOffset[2] + Math.cos(theta);

		// no need to rotate the ferris wheel passenger cars
		transformation = mult( rotate(90, vec3(0,0,1)) , scalem(0.15, 0.15, 0.15 ) );
		transformation = mult( translate(add(wheelSeatPositions[seat], wheelOffset)) ,transformation );
		gl.uniformMatrix4fv( vTransformation, false, flatten(transformation));

		var rotation = rotate(90, vec3(0,0,1));
		gl.uniformMatrix4fv( vRotation, false, flatten(rotation));

		//draw it
		renderCylinder( wheelSeatBuffers[seat], nCylinderSectors, gl, program);
	}


	
	// re-render after a delay
	setTimeout(
        function (){requestAnimFrame(render);}, delay
    );
}