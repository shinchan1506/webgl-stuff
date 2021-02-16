/* coneFunctions.js
	
	Written by John Bell for CS 425, Fall 2020
    
    This file contains code to create and draw a unit cone, centered at the origin.
    
*/

// Globals are evil.  We won't use any here. :-)
function createCone( nSectors, gl, color ) {
	
	// Accept a color as a second argument.  If invalid, assign colors
	
	var points = [ ];	// Vertex location data
	var colors = [ ];	// Vertex color data
	var normals = [];
	var texPoints = [];

	// Generate Points and Colors
	
	// Colors first.  Use passed color if it is value
	
	var validColor = isValidColor(color);
	

	// push vec3s into the colors array for each vertex.
	// If the passed color is valid, use it to make a vec3.  Otherwise use calls to Math.random( ).
	for( var i = 0; i < nSectors * 2 + 3; i++ ) {
		if( validColor )
		{
			// Push a valid color here, as a vec3
			colors.push( vec3( color ) );
		}
		else
		{
			// Push a random color here, as a vec3 
			colors.push( vec3(Math.random(), Math.random(), Math.random()) );
		}
	}

	// TODO 1 - push vertex positions  into the points array
	// Then the vertex locations, starting with the apex
	
	points.push ( vec3( 0, 1, 0) );
	normals.push (vec3( 0, 1, 0) );
	texPoints.push( vec2( 0.5, 1) );

	// Then the base points
	dTheta = radians( 360 / nSectors );
	for( i = 0; i < nSectors + 1; i++ ) { // Duplicate ( 1, 0, 0 ) to close loop.
		var theta = i * dTheta;
		// push a vertex here, using Math.cos( theta ) for X and Math.sin( theta ) for Z
		// ( Preceding line was corrected to terminate in "Z", not "Y". )
		points.push( vec3(Math.cos(theta), 0, Math.sin(theta)) );
		texPoints.push (vec2 ( i / nSectors, 0));
		// THIS IS NORMALS STUFF
		var nextOne = (i < nSectors) ? vec3(Math.cos(i + 1 * dTheta), 0, Math.sin(i+1 * dTheta)) : vec3(Math.cos(0 * dTheta), 0, Math.sin(0 * dTheta))
		var t1 = subtract(nextOne,vec3(Math.cos(theta), 0, Math.sin(theta)) );
		var t2 = subtract( vec3( 0, 1, 0),vec3(Math.cos(theta), 0, Math.sin(theta)) );
		var normal = normalize(cross(t1,t2));
		normals.push(vec3 ( normal ) );
	}	

	points.push(vec3 (0,0,0));
	texPoints.push (vec2 (0, 0) );
	normals.push( vec3 (0, -1, 0));
	// push the circle vertices again to fill in the bottom
	dTheta = radians( 360 / nSectors );
	for( i = 0; i < nSectors + 1; i++ ) { // Duplicate ( 1, 0, 0 ) to close loop.
		var theta = i * dTheta;
		points.push( vec3(Math.cos(theta), 0, Math.sin(theta)) );
		texPoints.push (vec2 (Math.cos(theta), Math.sin(theta)));
		normals.push( vec3 (0, -1, 0));
	}	

	nPoints = nSectors*2 + 2 + 1;
	
	// No need for drawElements here.  drawArrays will suit just fine.
	
	// Okay.  All data calculated.  Time to put it all in GPU buffers
	
	// Push Vertex Location Data to GPU
	// Hold off on connecting the data to the shader variables
	
	vbufferID = gl.createBuffer( );
	gl.bindBuffer( gl.ARRAY_BUFFER, vbufferID );
	gl.bufferData( gl.ARRAY_BUFFER, flatten( points ), gl.DYNAMIC_DRAW );
	
	// Push Vertex Color Data to GPU
	// Hold off on connecting the data to the shader variables
	
	// TODO2: Add calls to createBuffer, bindBuffer, and bufferData to push the color data to the GPU
	var cbufferID = gl.createBuffer( );
	gl.bindBuffer( gl.ARRAY_BUFFER, cbufferID );
	gl.bufferData( gl.ARRAY_BUFFER, flatten( colors ), gl.DYNAMIC_DRAW );
	
	var normalBufferID = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, normalBufferID);
	gl.bufferData( gl.ARRAY_BUFFER, flatten( normals ), gl.DYNAMIC_DRAW);
	
	var tbufferID = gl.createBuffer( );
	gl.bindBuffer( gl.ARRAY_BUFFER, tbufferID );
	gl.bufferData( gl.ARRAY_BUFFER, flatten( texPoints ), gl.STATIC_DRAW );
	

	// Unbind the buffer, for safety sake.
	
	gl.bindBuffer( gl.ARRAY_BUFFER, null );
	
	return [ vbufferID, cbufferID, normalBufferID, tbufferID  ];

}

function renderCone( buffers, nSectors, gl, program ) {
	
	// Okay.  All transformaation matrices sent to uniform variables.
	// Time to attach vertex shader variables to the buffers created in init( )
	
	// Connect the vertex data to the shader variables - First positions
	gl.bindBuffer( gl.ARRAY_BUFFER, buffers[ 0 ] );
	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );
	
	// Then the colors
	// TODO3 - Insert the code to connect the color data ( buffers[ 1 ] ) to the vertex shader variable "vColor"
	// using bindBuffer, getAttribLocation, vertexAttribPointer, and enableVertexAttribArray
	
	gl.bindBuffer( gl.ARRAY_BUFFER, buffers[1] );
	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray( vColor );

	gl.bindBuffer( gl.ARRAY_BUFFER, buffers[2] );
	var vNormal = gl.getAttribLocation(program, "vNormal");
	gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray( vNormal );

	gl.bindBuffer( gl.ARRAY_BUFFER, buffers[3] );
	var vTex = gl.getAttribLocation( program, "vTexCoords" );
	gl.vertexAttribPointer( vTex, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vTex );
	
	// Unbind the array buffer, for safety sake.
	
	gl.bindBuffer( gl.ARRAY_BUFFER, null );

	
	// And finally to draw the cone
	
	// TODO3 - use drawArrays to draw a TRIANGLE FAN using all the data points ( nSectors + 2 points )
	
	gl.drawArrays( gl.TRIANGLE_FAN, 0, nSectors + 2);	// Sides
	
	// TODO later - Draw the bottom.  Could possibly make this controlled by an extra passed parameter.
	gl.drawArrays( gl.TRIANGLE_FAN, nSectors + 1, nSectors + 2);
}
