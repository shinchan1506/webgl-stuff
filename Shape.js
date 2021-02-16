const defaultvec4 = vec4(0, 0, 0, 0);

function isValidColor (color) {
    if ( Array.isArray( color ) && color.length == 3 
        && color[0] >= 0 && color[1] >= 0 && color[2] >=0
        && color[0] <= 1 && color[1] <= 1 && color[2] <=1 ) {
        
        return true;
                                                            
    }
    return false;
}

class Vertex {
    constructor ( position, color, normal = vec3(0,0,0),  ambient = defaultvec4, diffuse = defaultvec4, specular = defaultvec4) {
        this.position = position;
        this.normal = normal;
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
        this.color = color;
    }

    setNormal (normal) {
        this.normal = normal;
    }
    
    setAmbient (ambient) {
        this.ambient = ambient;
    }

    setDiffuse (diffuse) {
        this.diffuse = diffuse;
    }

    setSpecular (specular) {
        this.specular = specular;
    }

}