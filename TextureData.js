/* TextureData.js
//	
//	Written by Shin Imai for CS 425, Fall 2020
*/


// texture data for a texturethat says "PARK"
function fillParkArray( ) {

	// This function returns a 32 x 32 RGBA texture image.
	
    var result = new Uint8Array( 32 * 32 * 4 );
    
    // background yellow
    for( r = 0; r < 32; r++ ) {
		for( c = 0; c < 32; c++ ) {
			result[ r * 128 + c * 4 ] = 205;
			result[ r * 128 + c * 4 + 1 ] = 220;
			result[ r * 128 + c * 4 + 2 ] = 57;
			result[ r * 128 + c * 4 + 3 ] = 255;
        }
    }

    // points for the letter P
    for ( r = 2; r < 31; r++) {
        for (c = 2; c < 8; c++ ) {
            // the blue i'm using; rgb (63,81,181)
            if ( (c >= 4 && c <= 5 ) &&  ( ( r >= 2 && r <= 4 ) || (r >= 14 && r <= 16 )) ) {
                result[ r * 128 + c * 4 ] = 63;
                result[ r * 128 + c * 4 + 1 ] = 81;
                result[ r * 128 + c * 4 + 2 ] = 181;
                result[ r * 128 + c * 4 + 3 ] = 255;
                continue;
            }
            if (c > 3 && r > 5) continue;
            result[ r * 128 + c * 4 ] = 63;
			result[ r * 128 + c * 4 + 1 ] = 81;
			result[ r * 128 + c * 4 + 2 ] = 181;
			result[ r * 128 + c * 4 + 3 ] = 255;
        }
    }


    return result;
}


function fillStripes( red, green, blue) {
    var result = new Uint8Array( 32 * 32 * 4 );
    
    // background transparent
    for( r = 0; r < 32; r++ ) {
		for( c = 0; c < 32; c++ ) {
			result[ r * 128 + c * 4 ] = 255;
			result[ r * 128 + c * 4 + 1 ] = 255;
			result[ r * 128 + c * 4 + 2 ] = 255;
			result[ r * 128 + c * 4 + 3 ] = 0;
        }
    }

    // points for the letter P
    for ( r = 0; r < 32; r+=4) {
        for (rtemp = r; rtemp < r+2; rtemp++) {
            for( c = 0; c < 32; c++ ) {
                result[ rtemp * 128 + c * 4 ] = red;
                result[ rtemp * 128 + c * 4 + 1 ] = green;
                result[ rtemp * 128 + c * 4 + 2 ] = blue;
                result[ rtemp * 128 + c * 4 + 3 ] = 255;
            }
        }
        
    }

    return result;
}

// not exactly a checkerboard pattern, but more like squares
function fillCheckers( red, green, blue) {
    var result = new Uint8Array( 32 * 32 * 4 );
    
    for( r = 0; r < 32; r++ ) {
		for( c = 0; c < 32; c++ ) {
            result[ r * 128 + c * 4 ] = 15;
            result[ r * 128 + c * 4 + 1 ] = 15;
            result[ r * 128 + c * 4 + 2 ] = 15;
            result[ r * 128 + c * 4 + 3 ] = 0;

            if ( (r-c > -6 && r-c < 6) || (r+c > 26 && r+c < 38) ) {
                result[ r * 128 + c * 4 ] = red;
                result[ r * 128 + c * 4 + 1 ] = green;
                result[ r * 128 + c * 4 + 2 ] = blue;
                result[ r * 128 + c * 4 + 3 ] = 255;
            }
        }
    }

    return result;
}

// a texture that says "HI"
function fillHI() {
    var result = new Uint8Array( 32 * 32 * 4 );
    
    for( r = 0; r < 32; r++ ) {
		for( c = 0; c < 32; c++ ) {
            result[ r * 128 + c * 4 ] = 15;
            result[ r * 128 + c * 4 + 1 ] = 15;
            result[ r * 128 + c * 4 + 2 ] = 15;
            result[ r * 128 + c * 4 + 3 ] = 0;
        }
    }

    // H
    for (r = 1; r < 31; r++) {
        for (c = 1; c <=4; c++) {
            result[ r * 128 + c * 4 ] = 255;
            result[ r * 128 + c * 4 + 1 ] = 255;
            result[ r * 128 + c * 4 + 2 ] = 255;
            result[ r * 128 + c * 4 + 3 ] = 255;
        }

        for (c = 10; c <=13; c++) {
            result[ r * 128 + c * 4 ] = 255;
            result[ r * 128 + c * 4 + 1 ] = 255;
            result[ r * 128 + c * 4 + 2 ] = 255;
            result[ r * 128 + c * 4 + 3 ] = 255;
        }
    }
    for (r = 11; r < 20 + 1; r++) {
        for (c = 5; c <=10; c++) {
            result[ r * 128 + c * 4 ] = 255;
            result[ r * 128 + c * 4 + 1 ] = 255;
            result[ r * 128 + c * 4 + 2 ] = 255;
            result[ r * 128 + c * 4 + 3 ] = 255;
        }
    }

    // I
    for (r = 1; r < 11 + 1; r++) {
        for (c = 18; c <=31; c++) {
            result[ r * 128 + c * 4 ] = 255;
            result[ r * 128 + c * 4 + 1 ] = 255;
            result[ r * 128 + c * 4 + 2 ] = 255;
            result[ r * 128 + c * 4 + 3 ] = 255;
        }
    }

    for (r = 21; r < 31 + 1; r++) {
        for (c = 18; c <=31; c++) {
            result[ r * 128 + c * 4 ] = 255;
            result[ r * 128 + c * 4 + 1 ] = 255;
            result[ r * 128 + c * 4 + 2 ] = 255;
            result[ r * 128 + c * 4 + 3 ] = 255;
        }
    }

    for (r = 1; r < 31 + 1; r++) {
        for (c = 22; c <=27; c++) {
            result[ r * 128 + c * 4 ] = 255;
            result[ r * 128 + c * 4 + 1 ] = 255;
            result[ r * 128 + c * 4 + 2 ] = 255;
            result[ r * 128 + c * 4 + 3 ] = 255;
        }
    }


    return result;
}