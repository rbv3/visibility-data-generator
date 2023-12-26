# Rama: A study about vision occlusion on urban virtual environments

## Setup
Download [Node.js](https://nodejs.org/en/download/).
Run this followed commands:

``` bash
# Install dependencies (only the first time)
npm install

# Run the local server at localhost:8080
npm run dev

# Build for production in the dist/ directory
npm run build
```
## How to control the deformations
On the top right corner of your screen you'll see a small menu with some options:

- diameter: diameter of cilinder on distortions
- deformationZ: toggle on/off regular UrbanRama distortion
- deformationX: toggle on/off Rama distortion on the sides (X-Axis)
  
// Opacity: controls the opacity of the invisible materials

// Invisibility Radius: the radius (centered on the camera) in which all materials inside of the circle will be invisile

// offsetDeformationZ: toggle on/off UrbanRama distortion in a distance from the camera (the distance is the invisibility radius)

## How to control character
- WASD or arrows to move
- Z to go UP
- X to do DOWN
- Click and drag to rotate camera
