const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");
const menu = document.getElementById("menu");
const gameContainer = document.getElementById("game");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const menuBtn = document.getElementById("menuBtn");
const modeBtns = document.querySelectorAll(".mode-btn");
const instructions = document.getElementById("instructions");

// Configurações do jogo
const paddleWidth = 10;
const paddleHeight = 100;
const ballRadius = 8;

// Variáveis do jogo
let leftPaddle, rightPaddle, ball;
let scoreLeft = 0;
let scoreRight = 0;
let gameMode = "multiplayer";
let gameRunning = false;
let gamePaused = false;
let animationId;

// Inicialização do jogo
function initGame() {
  leftPaddle = {
    x: 20,
    y: canvas.height / 2 - paddleHeight / 2,
    speed: 7,
    dy: 0,
  };

  rightPaddle = {
    x: canvas.width - paddleWidth - 20,
    y: canvas.height / 2 - paddleHeight / 2,
    speed: 7,
    dy: 0,
  };

  ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballRadius,
    speed: 5,
    dx: 5 * (Math.random() > 0.5 ? 1 : -1),
    dy: 5 * (Math.random() > 0.5 ? 1 : -1),
  };

  scoreLeft = 0;
  scoreRight = 0;
  document.getElementById("scoreLeft").textContent = "0";
  document.getElementById("scoreRight").textContent = "0";
}

// Funções de desenho
function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
}

function drawNet() {
  ctx.fillStyle = "white";
  const netWidth = 2;
  const netHeight = 10;
  for (let i = 0; i < canvas.height; i += 15) {
    ctx.fillRect(canvas.width / 2 - netWidth / 2, i, netWidth, netHeight);
  }
}

function drawScores() {
  ctx.fillStyle = "white";
  ctx.font = "32px Arial";
  ctx.fillText(scoreLeft, canvas.width / 4, 50);
  ctx.fillText(scoreRight, 3 * canvas.width / 4, 50);
}

// Lógica da IA para single player
function updateAIPaddle() {
  if (gameMode === "singleplayer") {
    // IA simples: segue a bola com um pequeno delay
    const targetY = ball.y - paddleHeight / 2;
    const diff = targetY - rightPaddle.y;
    
    if (Math.abs(diff) > 5) {
      rightPaddle.dy = diff > 0 ? rightPaddle.speed * 0.8 : -rightPaddle.speed * 0.8;
    } else {
      rightPaddle.dy = 0;
    }
  }
}

// Atualização do jogo
function update() {
  if (gamePaused) return;

  // Move as raquetes
  leftPaddle.y += leftPaddle.dy;
  rightPaddle.y += rightPaddle.dy;

  // Limita as raquetes dentro do canvas
  if (leftPaddle.y < 0) leftPaddle.y = 0;
  if (leftPaddle.y + paddleHeight > canvas.height) leftPaddle.y = canvas.height - paddleHeight;
  if (rightPaddle.y < 0) rightPaddle.y = 0;
  if (rightPaddle.y + paddleHeight > canvas.height) rightPaddle.y = canvas.height - paddleHeight;

  // IA para single player
  if (gameMode === "singleplayer") {
    updateAIPaddle();
  }

  // Move a bola
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Colisão com topo e base
  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
    ball.dy = -ball.dy;
  }

  // Colisão com raquete esquerda
  if (
    ball.x - ball.radius < leftPaddle.x + paddleWidth &&
    ball.y > leftPaddle.y &&
    ball.y < leftPaddle.y + paddleHeight
  ) {
    ball.dx = -ball.dx;
    ball.speed += 0.5;
    ball.dx = ball.dx > 0 ? ball.speed : -ball.speed;
  }

  // Colisão com raquete direita
  if (
    ball.x + ball.radius > rightPaddle.x &&
    ball.y > rightPaddle.y &&
    ball.y < rightPaddle.y + paddleHeight
  ) {
    ball.dx = -ball.dx;
    ball.speed += 0.5;
    ball.dx = ball.dx > 0 ? ball.speed : -ball.speed;
  }

  // Pontuação
  if (ball.x - ball.radius < 0) {
    scoreRight++;
    document.getElementById("scoreRight").textContent = scoreRight;
    resetBall();
  }

  if (ball.x + ball.radius > canvas.width) {
    scoreLeft++;
    document.getElementById("scoreLeft").textContent = scoreLeft;
    resetBall();
  }
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.dx = -ball.dx;
  ball.dy = 5 * (Math.random() > 0.5 ? 1 : -1);
  ball.speed = 5;
}

function draw() {
  // Limpa o canvas
  drawRect(0, 0, canvas.width, canvas.height, "black");

  // Desenha a rede
  drawNet();

  // Desenha as raquetes
  drawRect(leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight, "white");
  drawRect(rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight, "white");

  // Desenha a bola
  drawCircle(ball.x, ball.y, ball.radius, "white");

  // Desenha os scores
  drawScores();

  // Desenha texto de pausa
  if (gamePaused) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PAUSADO", canvas.width / 2, canvas.height / 2);
    ctx.textAlign = "left";
  }
}

function gameLoop() {
  update();
  draw();
  if (gameRunning && !gamePaused) {
    animationId = requestAnimationFrame(gameLoop);
  }
}

// Controles
document.addEventListener("keydown", (e) => {
  if (!gameRunning || gamePaused) return;

  switch (e.key) {
    case "w":
    case "W":
      leftPaddle.dy = -leftPaddle.speed;
      break;
    case "s":
    case "S":
      leftPaddle.dy = leftPaddle.speed;
      break;
    case "ArrowUp":
      if (gameMode === "multiplayer") {
        rightPaddle.dy = -rightPaddle.speed;
      }
      break;
    case "ArrowDown":
      if (gameMode === "multiplayer") {
        rightPaddle.dy = rightPaddle.speed;
      }
      break;
    case " ":
      togglePause();
      break;
  }
});

document.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "w":
    case "W":
    case "s":
    case "S":
      leftPaddle.dy = 0;
      break;
    case "ArrowUp":
    case "ArrowDown":
      rightPaddle.dy = 0;
      break;
  }
});

// Controles da UI
modeBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    modeBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    gameMode = btn.dataset.mode;
    
    // Atualiza instruções
    if (gameMode === "singleplayer") {
      instructions.innerHTML = `
        <h5>Controles Single Player:</h5>
        <p>Jogador: W (cima) / S (baixo)</p>
        <p>Oponente: Controlado por IA</p>
      `;
    } else {
      instructions.innerHTML = `
        <h5>Controles Multiplayer:</h5>
        <p>Jogador 1: W (cima) / S (baixo)</p>
        <p>Jogador 2: ↑ (cima) / ↓ (baixo)</p>
      `;
    }
  });
});

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);
menuBtn.addEventListener("click", returnToMenu);

function startGame() {
  menu.classList.add("d-none");
  gameContainer.classList.remove("d-none");
  initGame();
  gameRunning = true;
  gamePaused = false;
  gameLoop();
}

function togglePause() {
  if (!gameRunning) return;
  
  gamePaused = !gamePaused;
  pauseBtn.textContent = gamePaused ? "▶️ Continuar" : "⏸️ Pausar";
  
  if (!gamePaused) {
    gameLoop();
  }
}

function returnToMenu() {
  gameRunning = false;
  gamePaused = false;
  cancelAnimationFrame(animationId);
  gameContainer.classList.add("d-none");
  menu.classList.remove("d-none");
  pauseBtn.textContent = "⏸️ Pausar";
}

// Inicialização
initGame();