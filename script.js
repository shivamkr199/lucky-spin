const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spin-btn');
const result = document.getElementById('result');
const spinSound = document.getElementById('spinSound');
const winSound = document.getElementById('winSound');

// Wheel segments data
const segments = [
    { min: 0, max: 40, color: '#90EE90' },    // Light green
    { min: 40, max: 50, color: '#FFD700' },   // Gold
    { min: 50, max: 60, color: '#006400' },   // Dark green
    { min: 60, max: 70, color: '#9ACD32' },   // Yellow-green
    { min: 70, max: 80, color: '#FFA500' },   // Orange
    { min: 80, max: 90, color: '#FFFFE0' },   // Light yellow
    { min: 90, max: 100, color: '#006400' },  // Dark green
    { min: 100, max: 110, color: '#FFA500' }, // Orange
    { min: 110, max: 120, color: '#FFFFE0' }, // Light yellow
    { min: 120, max: 130, color: '#90EE90' }, // Light green
    { min: 130, max: 140, color: '#006400' }, // Dark green
    { min: 140, max: 150, color: '#9ACD32' }, // Yellow-green
    { min: 150, max: 160, color: '#FFA500' }, // Orange
    { min: 160, max: 170, color: '#FFFFE0' }, // Light yellow
    { min: 170, max: 180, color: '#006400' }, // Dark green
    { min: 180, max: 190, color: '#FFA500' }, // Orange
    { min: 190, max: 200, color: '#006400' }  // Dark green
];

const ctx = wheel.getContext('2d');

// Configure audio
spinSound.loop = true;
spinSound.volume = 0.4;
winSound.volume = 0.7;

// Preload sounds
spinSound.load();
winSound.load();

let currentRotation = 0;
let isSpinning = false;

// Create a second spinning sound for seamless playback
const spinSound2 = spinSound.cloneNode(true);
spinSound2.volume = 0.4;
spinSound2.loop = true;
let currentSpinSound = spinSound;

function drawWheel() {
    const centerX = wheel.width / 2;
    const centerY = wheel.height / 2;
    const radius = wheel.width / 2 - 10;

    ctx.clearRect(0, 0, wheel.width, wheel.height);

    // Draw segments
    segments.forEach((segment, index) => {
        const startAngle = (index * (360 / segments.length)) * (Math.PI / 180);
        const endAngle = ((index + 1) * (360 / segments.length)) * (Math.PI / 180);

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = segment.color;
        ctx.fill();
        ctx.stroke();

        // Draw text
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + (endAngle - startAngle) / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#000';
        ctx.font = '16px Arial';
        ctx.fillText(`${segment.min}-${segment.max}`, radius - 20, 5);
        ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();
}

function rotateWheel(angle) {
    ctx.save();
    ctx.translate(wheel.width / 2, wheel.height / 2);
    ctx.rotate(angle * Math.PI / 180);
    ctx.translate(-wheel.width / 2, -wheel.height / 2);
    drawWheel();
    ctx.restore();
}

function spin() {
    if (isSpinning) return;
    isSpinning = true;
    result.textContent = '';

    // Switch between the two spin sounds for seamless playback
    currentSpinSound = currentSpinSound === spinSound ? spinSound2 : spinSound;
    currentSpinSound.currentTime = 0;
    currentSpinSound.play();

    // Generate random number of spins (3-5 complete rotations)
    const spinCount = 3 + Math.random() * 2;
    const totalDegrees = spinCount * 360 + Math.random() * 360;
    const duration = 5000; // 5 seconds
    const startTime = performance.now();
    const startRotation = currentRotation;

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth deceleration
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        currentRotation = startRotation + (totalDegrees * easeOut);
        rotateWheel(currentRotation);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isSpinning = false;
            currentSpinSound.pause();
            currentSpinSound.currentTime = 0;
            
            // Play win sound
            winSound.currentTime = 0;
            winSound.play();
            
            // Calculate result
            const normalizedRotation = (360 - (currentRotation % 360)) % 360;
            const segmentIndex = Math.floor((normalizedRotation / 360) * segments.length);
            const segment = segments[segmentIndex];
            result.textContent = `Result: ${segment.min}-${segment.max}`;
            
            // Show result in popup
            showPopup(segment);
        }
    }
    
    animate(performance.now());
}

function showPopup(segment) {
    const popup = document.getElementById('popup');
    const popupResult = document.getElementById('popup-result');
    popupResult.textContent = `${segment.min}-${segment.max}`;
    popup.classList.add('show');
}

function closePopup() {
    const popup = document.getElementById('popup');
    popup.classList.remove('show');
}

// Close popup when clicking outside
document.getElementById('popup').addEventListener('click', (e) => {
    if (e.target.id === 'popup') {
        closePopup();
    }
});

// Initial draw
drawWheel();

// Event listeners
spinBtn.addEventListener('click', spin);
