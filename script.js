// Jewelry data with positions and sizes
const jewelryData = {
    necklace1: {
        image: 'necklace1.png',
        defaultPosition: { x: 50, y: 30 },
        defaultSize: 100,
        type: 'necklace',
        facePosition: { x: 0.5, y: 0.6 } // Position relative to face (0-1)
    },
    necklace2: {
        image: 'necklace2.png',
        defaultPosition: { x: 50, y: 30 },
        defaultSize: 100,
        type: 'necklace',
        facePosition: { x: 0.5, y: 0.6 }
    },
    earrings1: {
        image: 'necklace3.png',
        defaultPosition: { x: 50, y: 20 },
        defaultSize: 80,
        type: 'earrings',
        facePosition: { x: 0.3, y: 0.4 } // Left ear position
    }
};

// DOM Elements
const jewelryOverlay = document.getElementById('jewelry-overlay');
const sizeSlider = document.getElementById('size-slider');
const positionSlider = document.getElementById('position-slider');
const jewelryButtons = document.querySelectorAll('.jewelry-btn');
const cameraFeed = document.getElementById('camera-feed');
const startCameraBtn = document.getElementById('start-camera');
const cameraContainer = document.querySelector('.camera-container');
const fallbackContainer = document.querySelector('.fallback-container');
const cameraModeBtn = document.getElementById('camera-mode');
const modelModeBtn = document.getElementById('model-mode');
const faceOverlay = document.getElementById('face-overlay');
const faceDetectionMessage = document.getElementById('face-detection-message');

let currentJewelry = null;
let currentJewelryElement = null;
let stream = null;
let faceDetectionActive = false;
let faceDetector = null;
let lastDetectedFace = null;
let animationFrameId = null;

// Initialize jewelry overlay
function initializeJewelryOverlay() {
    jewelryOverlay.style.position = 'absolute';
    jewelryOverlay.style.pointerEvents = 'none';
}

// Create jewelry element
function createJewelryElement(jewelryType) {
    const jewelry = jewelryData[jewelryType];
    const element = document.createElement('img');
    element.src = jewelry.image;
    element.style.position = 'absolute';
    element.style.width = `${jewelry.defaultSize}%`;
    element.style.left = `${jewelry.defaultPosition.x}%`;
    element.style.top = `${jewelry.defaultPosition.y}%`;
    element.style.transform = 'translate(-50%, -50%)';
    return element;
}

// Update jewelry position and size
function updateJewelry() {
    if (!currentJewelryElement) return;

    const size = sizeSlider.value;
    const position = positionSlider.value;
    
    // Clear previous jewelry
    jewelryOverlay.innerHTML = '';
    
    if (currentJewelry === 'earrings1') {
        // Special handling for earrings - create two elements
        const leftEarring = currentJewelryElement.cloneNode(true);
        const rightEarring = currentJewelryElement.cloneNode(true);
        
        leftEarring.style.width = `${size}%`;
        rightEarring.style.width = `${size}%`;
        
        if (lastDetectedFace && faceDetectionActive) {
            // Position earrings based on face landmarks
            const leftEarX = lastDetectedFace.landmarks.getLeftEye()[0].x;
            const rightEarX = lastDetectedFace.landmarks.getRightEye()[0].x;
            const earY = lastDetectedFace.landmarks.getNose()[0].y;
            
            leftEarring.style.left = `${leftEarX}px`;
            leftEarring.style.top = `${earY}px`;
            
            rightEarring.style.left = `${rightEarX}px`;
            rightEarring.style.top = `${earY}px`;
        } else {
            // Fallback to slider-based positioning
            leftEarring.style.left = `${30 + (position * 0.4)}%`;
            rightEarring.style.left = `${70 - (position * 0.4)}%`;
        }
        
        jewelryOverlay.appendChild(leftEarring);
        jewelryOverlay.appendChild(rightEarring);
    } else {
        // For necklaces
        currentJewelryElement.style.width = `${size}%`;
        
        if (lastDetectedFace && faceDetectionActive) {
            // Position necklace based on face landmarks
            const faceWidth = lastDetectedFace.detection.box.width;
            const faceHeight = lastDetectedFace.detection.box.height;
            const faceX = lastDetectedFace.detection.box.x;
            const faceY = lastDetectedFace.detection.box.y;
            
            // Position necklace below the chin
            const necklaceX = faceX + (faceWidth / 2);
            const necklaceY = faceY + faceHeight * 0.8;
            
            currentJewelryElement.style.left = `${necklaceX}px`;
            currentJewelryElement.style.top = `${necklaceY}px`;
        } else {
            // Fallback to slider-based positioning
            currentJewelryElement.style.left = `${position}%`;
        }
        
        jewelryOverlay.appendChild(currentJewelryElement);
    }
}

// Load face detection models
async function loadFaceDetectionModels() {
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        faceDetectionMessage.textContent = 'Face detection ready';
        return true;
    } catch (error) {
        console.error('Error loading face detection models:', error);
        faceDetectionMessage.textContent = 'Face detection failed to load';
        return false;
    }
}

// Start face detection
async function startFaceDetection() {
    if (!stream) return;
    
    faceDetectionActive = true;
    faceDetectionMessage.textContent = 'Detecting face...';
    
    // Set up canvas for face detection
    const displaySize = { width: cameraFeed.width, height: cameraFeed.height };
    faceapi.matchDimensions(faceOverlay, displaySize);
    
    // Start detection loop
    detectFaces();
}

// Stop face detection
function stopFaceDetection() {
    faceDetectionActive = false;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    faceDetectionMessage.textContent = 'Face detection stopped';
}

// Detect faces in the video stream
async function detectFaces() {
    if (!faceDetectionActive) return;
    
    try {
        // Detect faces
        const detections = await faceapi.detectAllFaces(
            cameraFeed, 
            new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks();
        
        // Resize detections to match display size
        const displaySize = { width: cameraFeed.width, height: cameraFeed.height };
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        
        // Clear previous drawings
        const ctx = faceOverlay.getContext('2d');
        ctx.clearRect(0, 0, faceOverlay.width, faceOverlay.height);
        
        // Draw face detections (optional, for debugging)
        // faceapi.draw.drawDetections(faceOverlay, resizedDetections);
        // faceapi.draw.drawFaceLandmarks(faceOverlay, resizedDetections);
        
        // Update last detected face
        if (resizedDetections.length > 0) {
            lastDetectedFace = resizedDetections[0];
            faceDetectionMessage.textContent = 'Face detected';
            
            // Update jewelry position based on face
            updateJewelry();
        } else {
            lastDetectedFace = null;
            faceDetectionMessage.textContent = 'No face detected';
        }
    } catch (error) {
        console.error('Error detecting faces:', error);
        faceDetectionMessage.textContent = 'Face detection error';
    }
    
    // Continue detection loop
    animationFrameId = requestAnimationFrame(detectFaces);
}

// Start camera
async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        cameraFeed.srcObject = stream;
        cameraContainer.classList.add('active');
        startCameraBtn.style.display = 'none';
        
        // Wait for video to be ready
        cameraFeed.onloadedmetadata = async () => {
            // Set canvas dimensions to match video
            faceOverlay.width = cameraFeed.videoWidth;
            faceOverlay.height = cameraFeed.videoHeight;
            
            // Load face detection models and start detection
            const modelsLoaded = await loadFaceDetectionModels();
            if (modelsLoaded) {
                startFaceDetection();
            }
        };
    } catch (err) {
        console.error('Error accessing camera:', err);
        alert('Unable to access camera. Please check permissions and try again.');
    }
}

// Stop camera
function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        cameraFeed.srcObject = null;
        cameraContainer.classList.remove('active');
        startCameraBtn.style.display = 'block';
        stopFaceDetection();
    }
}

// Switch to camera mode
function switchToCameraMode() {
    cameraModeBtn.classList.add('active');
    modelModeBtn.classList.remove('active');
    fallbackContainer.classList.remove('active');
    cameraContainer.classList.add('active');
    
    // If camera is not already started, show the start button
    if (!stream) {
        startCameraBtn.style.display = 'block';
    }
}

// Switch to model mode
function switchToModelMode() {
    modelModeBtn.classList.add('active');
    cameraModeBtn.classList.remove('active');
    cameraContainer.classList.remove('active');
    fallbackContainer.classList.add('active');
    stopCamera();
}

// Event Listeners
jewelryButtons.forEach(button => {
    button.addEventListener('click', () => {
        const jewelryType = button.dataset.jewelry;
        currentJewelry = jewelryType;
        
        // Reset sliders to default values
        sizeSlider.value = jewelryData[jewelryType].defaultSize;
        positionSlider.value = 50;
        
        // Create and display new jewelry
        currentJewelryElement = createJewelryElement(jewelryType);
        updateJewelry();
        
        // Update active state of buttons
        jewelryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });
});

sizeSlider.addEventListener('input', updateJewelry);
positionSlider.addEventListener('input', updateJewelry);
startCameraBtn.addEventListener('click', startCamera);
cameraModeBtn.addEventListener('click', switchToCameraMode);
modelModeBtn.addEventListener('click', switchToModelMode);

// Initialize the overlay and set default mode
initializeJewelryOverlay();
switchToModelMode(); // Start in model mode by default 