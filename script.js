const popSound = new Audio("assets/pop.mp3");
let score = 0;
let timer = 30;
let gameInterval, timerInterval;
let bubbles = [];
const bubbleCount = 5;
const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFBE0B"];


const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gameBoard = document.getElementById("gameBoard");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const menu = document.getElementById("menu");
const endScreen = document.getElementById("endScreen");
const finalScore = document.getElementById("finalScore");

function resizeCanvas() {
    // Get the available size for the canvas (subtracting any padding/margins as needed)
    const dpr = window.devicePixelRatio || 1;
    // Use the actual rendered size of the gameBoard
    const rect = gameBoard.getBoundingClientRect();
    // Set canvas CSS size
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    // Set canvas pixel size for crisp rendering
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    ctx.scale(dpr, dpr);
}

window.addEventListener("resize", () => {
    if (gameBoard.style.display !== "none") {
        resizeCanvas();
    }
});

function playPopSound() {
    popSound.currentTime = 0;
    popSound.play();
}

function updateScore(points) {
    score += points;
    scoreDisplay.innerText = `Score: ${score}`;
}

function startGame() {
    // Reset game state
    menu.style.display = "none";
    endScreen.style.display = "none";
    document.getElementById("highScores").style.display = "none";
    gameBoard.style.display = "flex";
    gameInfo.style.display = "flex"; // Show score and timer during the game
    score = 0;
    timer = 30;
    bubbles = [];
    updateScore(0);
    timerDisplay.innerText = `Time: ${timer}`;

    // Responsive canvas
    resizeCanvas();

    // Create bubbles and start game loop
    createBubbles();
    gameInterval = setInterval(updateGame, 1000 / 60); // 60 FPS
    timerInterval = setInterval(updateTimer, 1000); // 1-second timer
}

function endGame() {
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    gameBoard.style.display = "none";
    gameInfo.style.display = "none"; // Hide score and timer after the game
    endScreen.style.display = "flex";
    finalScore.innerText = `Your Score: ${score}`;

    // Update high score in localStorage
    const highScore = localStorage.getItem("highScore") || 0;
    if (score > highScore) {
        localStorage.setItem("highScore", score);
    }
}

function updateTimer() {
    timer--;
    timerDisplay.innerText = `Time: ${timer}`;
    if (timer <= 0) {
        endGame();
    }
}

function createBubbles() {
    const maxBubbles = 6;
    let attempts = 0;
    while (bubbles.length < maxBubbles && attempts < 1000) {
        const radius = Math.random() * 20 + 20;
        // Speed up all balls a bit more
        const speed = radius > 35 ? 2.1 : radius > 25 ? 3.1 : 4.3;
        const color = radius > 35 ? "#FF0000" : radius > 25 ? "#FFFF00" : "#00FF00";
        const x = Math.random() * (canvas.width - 2 * radius) + radius;
        const y = Math.random() * (canvas.height - 2 * radius) + radius;
        // Check for overlap
        let overlapping = false;
        for (let i = 0; i < bubbles.length; i++) {
            const other = bubbles[i];
            const dist = Math.sqrt((x - other.x) ** 2 + (y - other.y) ** 2);
            if (dist < radius + other.radius + 4) { // 4px buffer
                overlapping = true;
                break;
            }
        }
        if (!overlapping) {
            bubbles.push({
                x,
                y,
                radius,
                color,
                speed,
                popped: false
            });
        }
        attempts++;
    }
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    // Update bubbles
    bubbles.forEach((bubble, index) => {
        if (bubble.popped || bubble.y - bubble.radius > canvas.height) {
            // Replace popped or exited bubble
            const radius = Math.random() * 20 + 20;
            // Speed up all balls a bit more
            const speed = radius > 35 ? 2.1 : radius > 25 ? 3.1 : 4.3;
            const color = radius > 35 ? "#FF0000" : radius > 25 ? "#FFFF00" : "#00FF00"; // Red for big, Yellow for medium, Green for small
            bubbles[index] = {
                x: Math.random() * canvas.width,
                y: -radius, // Start above the screen
                radius,
                color,
                speed,
                popped: false
            };
        } else {
            // Move bubble down
            bubble.y += bubble.speed;

            // Draw bubble
            ctx.beginPath();
            ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
            ctx.fillStyle = bubble.color;
            ctx.fill();
        }
    });
}


function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if (e.touches && e.touches.length > 0) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
    } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }
    return { x, y };
}

canvas.addEventListener("mousedown", (e) => {
    const { x, y } = getCanvasCoords(e);
    checkPop(x, y);
});
canvas.addEventListener("touchstart", (e) => {
    const { x, y } = getCanvasCoords(e);
    checkPop(x, y);
    e.preventDefault();
}, { passive: false });

function checkPop(x, y) {
    bubbles.forEach(bubble => {
        const dist = Math.sqrt((x - bubble.x) ** 2 + (y - bubble.y) ** 2);
        if (dist < bubble.radius && !bubble.popped) {
            bubble.popped = true; // Mark bubble as popped
            playPopSound(); // Play pop sound
            const points = bubble.radius > 35 ? 1 : bubble.radius > 25 ? 2 : 3; // Points based on size
            updateScore(points); // Update score
        }
    });
}

function showMenu() {
    endScreen.style.display = "none";
    document.getElementById("highScores").style.display = "none";
    gameBoard.style.display = "none";
    gameInfo.style.display = "none"; // Hide score and timer on the menu
    menu.style.display = "flex";
}

function removeAds() {
    alert("Ads removed! (This is a placeholder)");
}

function viewHighScores() {
    const highScore = localStorage.getItem("highScore") || 0;
    document.getElementById("highScoreValue").innerText = highScore;
    menu.style.display = "none";
    endScreen.style.display = "none";
    document.getElementById("highScores").style.display = "block";
}