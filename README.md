# AR Jewelry Try-On Mockup

A web-based mockup of an Augmented Reality jewelry try-on feature with face detection. This demo allows users to virtually try on different jewelry items on their face using their device's camera.

## Features

- Real-time face detection for accurate jewelry placement
- Try on different jewelry items (necklaces and earrings)
- Automatic positioning of jewelry based on facial landmarks
- Manual adjustment options for size and position
- Camera mode with live video feed
- Fallback model mode when camera is not available
- Responsive design that works on both desktop and mobile devices

## How to Use

1. Download the required face detection models (see instructions in the `models` directory)
2. Open `index.html` in a web browser
3. Click "Start Camera" to enable your device's camera
4. Select a jewelry item from the options on the right
5. The jewelry will automatically position itself on your face
6. Use the sliders to adjust:
   - Size: Make the jewelry larger or smaller
   - Position: Fine-tune the position of the jewelry

## Technical Details

This mockup is built using:
- HTML5
- CSS3
- Vanilla JavaScript
- Face-API.js for face detection

The application uses placeholder images for demonstration purposes. In a production environment, you would want to:
1. Replace placeholder images with actual jewelry images
2. Add more jewelry options
3. Implement more advanced AR functionality using a framework like AR.js or Three.js
4. Add more customization options (color, style, etc.)

## Face Detection Models

The application requires face detection models from the Face-API.js library. These models need to be downloaded separately and placed in the `models` directory. See the README in the `models` directory for detailed instructions.

## Future Improvements

- Add more jewelry types (rings, bracelets, etc.)
- Implement color customization
- Add 3D models for more realistic try-on
- Integrate with a real AR framework
- Add save/share functionality
- Implement user accounts to save favorite combinations
- Improve face tracking accuracy and performance
- Add support for multiple faces

## Note

This is a demonstration that uses face detection to simulate AR functionality. While it provides a more realistic experience than static positioning, it's still a simplified version of what would be possible with dedicated AR frameworks. 