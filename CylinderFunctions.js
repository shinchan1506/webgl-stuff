function createCylinder(nSectors, gl, color) {
    var points = [];
    var colors = [];
    var normals = [];
    var vertices = [];
    var texPoints = [];
    var validColor = isValidColor(color);

    // points of the bases, add center, then the circle around it. First do it for y=0 then y=1.
    dTheta = radians( 360 / nSectors );
    for (j = 0; j < 2; j++) {
        points.push(vec3 (0,j,0));
        var tempColor =  validColor ? vec3(color) : vec3(Math.random(), Math.random(), Math.random());
        colors.push(tempColor );
        normals.push( vec3 (0, 1, 0));
        vertices.push ( new Vertex( vec3 (0,j,0)),  vec3(tempColor), vec3(0, 1, 0) );
        texPoints.push( vec2 (0, 0) );

        for( i = 0; i < nSectors + 1; i++ ) { // Duplicate ( 1, 0, 0 ) to close loop.
            var theta = i * dTheta;
            // push a vertex here, using Math.cos( theta ) for X and Math.sin( theta ) for Z
            points.push( vec3(Math.cos(theta), j, Math.sin(theta)) );
            texPoints.push( vec2 ( Math.cos(theta), Math.sin(theta)) );
            colors.push( validColor ? vec3(color) : vec3(Math.random(), Math.random(), Math.random()) );
            tempColor = validColor ? vec3(color) : vec3(Math.random(), Math.random(), Math.random());
            normals.push( vec3 (0, 1, 0));

            vertices.push ( new Vertex( vec3 (0,j,0)),  vec3(tempColor), vec3(0, 1, 0) );
        }	
    }

    // points for the sides (use a triangle strip)
    var sides_size = 0;
    var sides_points = [];
    var side_vertices = [];
    dTheta = radians( 360 / nSectors );
    for (k = 0; k < nSectors + 1; k++) {
        var theta = k * dTheta;
        points.push(vec3(Math.cos(theta), 0, Math.sin(theta)) ); //top 
        texPoints.push ( vec2( k/nSectors ,1 ) );
        sides_points.push( vec3(Math.cos(theta), 0, Math.sin(theta))) ;
        side_vertices.push( new Vertex( vec3(Math.cos(theta), 0, Math.sin(theta)),
            validColor ? vec3(color) : vec3(Math.random(), Math.random(), Math.random()),
            ));

        colors.push( validColor ? vec3(color) : vec3(Math.random(), Math.random(), Math.random()) );

        points.push(vec3(Math.cos(theta), 1, Math.sin(theta)) ); // bottom
        texPoints.push ( vec2( k/nSectors ,0 ) );
        sides_points.push( vec3(Math.cos(theta), 1, Math.sin(theta))) ;
        colors.push( validColor ? vec3(color) : vec3(Math.random(), Math.random(), Math.random()) );
        side_vertices.push( new Vertex(  vec3(Math.cos(theta), 1, Math.sin(theta)),
            validColor ? vec3(color) : vec3(Math.random(), Math.random(), Math.random()),
            ));
        sides_size += 2;
    }

    // surface normals for each triangle on the side
    for (tri = 0; tri < sides_size; tri++)
    {
        // THIS IS NORMALS STUFF
        
		var nextVert = vec3(sides_points[(tri + 1) % sides_size]);
        var nextNextVert = vec3(sides_points[(tri + 2) % sides_size]);

        var t1 = subtract(vec3(sides_points[tri]), nextVert);
		var t2 = subtract(nextNextVert, nextVert);
		var normal = normalize(cross(t1,t2));
        normals.push(vec3 ( normal ) );
        
        // clock wise, so we need to manually make this one counter clockwise
        var nextVert = vec3(sides_points[(tri + 2) % sides_size]);
        var nextNextVert = vec3(sides_points[(tri + 3) % sides_size]);

        var t1 = subtract(vec3(sides_points[tri]), nextNextVert);
		var t2 = subtract(nextVert, nextNextVert);
		var normal = normalize(cross(t1,t2));
        normals.push(vec3 ( normal ) );
        
        
    }
    
    // Push Vertex Color Data to GPU
    // Hold off on connecting the data to the shader variables
    vbufferID = gl.createBuffer( );
    gl.bindBuffer( gl.ARRAY_BUFFER, vbufferID );
    gl.bufferData( gl.ARRAY_BUFFER, flatten( points ), gl.DYNAMIC_DRAW );
    
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
    
    return [ vbufferID, cbufferID, normalBufferID, tbufferID ];

}

function renderCylinder( buffers, nSectors, gl, program ) {
    // Connect the vertex data to the shader variables - First positions
    gl.bindBuffer( gl.ARRAY_BUFFER, buffers[ 0 ] );
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    // Then the colors
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

    // draw the bases
    gl.drawArrays( gl.TRIANGLE_FAN, 0, nSectors + 2);
    gl.drawArrays( gl.TRIANGLE_FAN, nSectors+2, nSectors + 2);

    //  draw the cylinder sides
    gl.drawArrays( gl.TRIANGLE_STRIP, (nSectors+2)*2, (nSectors+1)*2);	// Sides
}
