function createCube(gl, color) {
    var points = [];
    var colors = [];
    var normals = [];
    var texPoints = [];
    var validColor = isValidColor(color);

    // points of cube. Centered around 0,0,0
    var vertices = [
        vec3(-0.5,-0.5,-0.5), // 0
        vec3(-0.5,.5,-.5), // 1
        vec3(.5,.5,-0.5), // 2 
        vec3(.5,-0.5,-0.5), // 3
        vec3(.5,-0.5,.5), // 4
        vec3(.5,.5,.5), // 5
        vec3(-.5,.5,.5), // 6
        vec3(-.5,-.5,.5) // 7
    ];

    var texCoords = [
        vec2(0, 0),
        vec2(0, 1),
        vec2(1, 1),
        vec2(1, 0)
    ];

    // corresponding tex coords for each side
    var tex_indices = [ 
        1, 0, 3, 1, 2, 3, // front
        3, 0, 1, 1, 3, 2, // right
        0, 3, 1, 1, 3, 2, // top
        3, 0, 2, 2, 1, 0, // left
        0, 1, 3, 1, 3, 2, // bottom
        1, 0, 3, 3, 2, 1  // back
    ];

    // points to make up the triangles
    var points_indices = [
        1,0,3,  1,2,3, // front
        2,3,4,  4,2,5, // right
        1,2,6,  6,2,5, // top
        1,0,6,  6,7,0, // left
        0,7,3, 7,3,4, // bottom
        6,7,4, 4,5,6 //back
    ];

    // get the coordinates for vertices and push to points
    points_indices.forEach(index =>
        points.push(vertices[index])  
    );

    // push tex coords for each side
    tex_indices.forEach(index => 
        texPoints.push(texCoords[index])
    );
    

    // calculate normals
    for(index = 0; index < 36; index += 6) 
    {
        var dirA = vec3(subtract(points[index + 1], points[index]));
        var dirB = vec3(subtract(points[index + 2], points[index]));
        var orthog = vec3(normalize( cross(dirA, dirB) ) );
        for (surfNormals = 0; surfNormals < 6; surfNormals++) {
            normals.push(orthog);
        }
    }

    // colors ( divide by 6 to make sure each side has a uniform color)
    for (k = 0; k < 6; k++) {
        var tempColor = validColor ? vec3(color) : vec3(Math.random(), Math.random(), Math.random());
        for (l = 0; l < 6; l++){
            colors.push(tempColor);
        }
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
    
    return [ vbufferID, cbufferID, normalBufferID, tbufferID  ];

}

function renderCube( buffers, gl, program ) {
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
    gl.drawArrays( gl.TRIANGLES, 0, 36);
     
    // TEST FOR NORMALS (TODO DELETE LATER)
    /**
    gl.bindBuffer( gl.ARRAY_BUFFER, buffers[ 2 ] );
	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );
    gl.drawArrays( gl.LINES, 0, 36);
    */
}