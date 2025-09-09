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
let waitingForMove = false; // flag para esperar movimento inicial
let aiDifficulty = 0.3; // dificuldade inicial da IA (vai crescendo)

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
  aiDifficulty = 0.3; // reseta a dificuldade no começo
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

  const diff = document.getElementById("difficultyDisplay");

  // Mostrar dificuldade no canto superior direito
  if (gameMode === "singleplayer") {
    diff.font = "20px Arial";
    diff.textContent = "Dificuldade: " + aiDifficulty.toFixed(2), canvas.width - 200, 30;
  }
}

// Flags de erro da IA
let aiMistake = false;
let aiMistakeDirection = 0;

// IA adaptativa
function updateAIPaddle() {
  if (gameMode === "singleplayer") {
    if (aiMistake) {
      // IA continua no erro até bater no topo ou no chão
      rightPaddle.dy = aiMistakeDirection * rightPaddle.speed;

      if (
        (aiMistakeDirection < 0 && rightPaddle.y <= 0) ||
        (aiMistakeDirection > 0 && rightPaddle.y + paddleHeight >= canvas.height)
      ) {
        aiMistake = false; // reset do erro
        rightPaddle.dy = 0;
      }
      return; // não processa lógica normal enquanto erra
    }

    // margem de erro diminui conforme a dificuldade aumenta
    const errorMargin = (1 - aiDifficulty) * 60;
    const targetY =
      ball.y - paddleHeight / 2 +
      (Math.random() * errorMargin - errorMargin / 2);
    const diff = targetY - rightPaddle.y;

    if (Math.abs(diff) > 10) {
      let direction = diff > 0 ? 1 : -1;

      // Chance da IA cometer um erro e inverter totalmente o controle
      const errorChance = (1 - aiDifficulty) * 0.2; // até 20% de chance
      if (Math.random() < errorChance) {
        aiMistake = true;
        aiMistakeDirection = direction * -1; // vai pro lado errado até bater no limite
        return;
      }

      // Ajuste da velocidade conforme dificuldade
      const reactionSpeed = rightPaddle.speed * (0.8 + aiDifficulty);
      rightPaddle.dy = direction * reactionSpeed;
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
  if (leftPaddle.y + paddleHeight > canvas.height)
    leftPaddle.y = canvas.height - paddleHeight;
  if (rightPaddle.y < 0) rightPaddle.y = 0;
  if (rightPaddle.y + paddleHeight > canvas.height)
    rightPaddle.y = canvas.height - paddleHeight;

  // IA para single player
  if (gameMode === "singleplayer") {
    updateAIPaddle();
  }

  // Só move a bola se não estiver esperando movimento
  if (!waitingForMove) {
    ball.x += ball.dx;
    ball.y += ball.dy;
  }

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

    if (aiDifficulty <= 0.9) {
      // aumenta dificuldade da IA a cada ponto do jogador
      aiDifficulty = Math.min(1, aiDifficulty + 0.1);
    }

    resetBall();
  }
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speed = 5;
  ball.dx = 5 * (Math.random() > 0.5 ? 1 : -1);
  ball.dy = 5 * (Math.random() > 0.5 ? 1 : -1);
  waitingForMove = true; // só começa de novo quando alguém mover
}

function draw() {
  drawRect(0, 0, canvas.width, canvas.height, "black");
  drawNet();
  drawRect(leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight, "white");
  drawRect(rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight, "white");
  drawCircle(ball.x, ball.y, ball.radius, "white");
  drawScores();

  if (gamePaused) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PAUSADO", canvas.width / 2, canvas.height / 2);
    ctx.textAlign = "left";
  }

  if (waitingForMove) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.font = "28px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      "Aguardando movimento para iniciar...",
      canvas.width / 2,
      canvas.height / 2
    );
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

  // libera a bola no primeiro movimento
  if (
    waitingForMove &&
    ["w", "W", "s", "S", "ArrowUp", "ArrowDown"].includes(e.key)
  ) {
    waitingForMove = false;
  }

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
      if (gameMode === "multiplayer") rightPaddle.dy = -rightPaddle.speed;
      break;
    case "ArrowDown":
      if (gameMode === "multiplayer") rightPaddle.dy = rightPaddle.speed;
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
modeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    modeBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    gameMode = btn.dataset.mode;

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
  waitingForMove = true; // só libera no primeiro movimento
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