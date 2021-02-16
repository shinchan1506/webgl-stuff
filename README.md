# Amusement park  test

## What it does and how it works:
I have 3 different textures that are made as arrays in TextureData.js. 
The first is "Stripes" which is self explanatory. The second is "Checkers," which is actually more like a grid. 
The final one is "HI," which is the texture for the sign that will read "HI."

I added texture coordinates for the shapes in their respective files (Cube.js, CylinderFunctions.js, coneFunctions.js). 
The fragment shader can be notified whether or not to texture map an object by using the uniform float called texEnabled.
If texEnabled is 0.0, then the texture will not be mapped. Otherwise, the texture that is bound will be mapped.

In the amusement park, everything but the cube seats are texture mapped. The carousel's foundation (the cone and the cylinder) have the stripes texture.
The ferris wheel has the checkers texture, and the sign has the HI texture.