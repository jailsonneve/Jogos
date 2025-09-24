let players = [];
let mode = null;
let rotation = 0;

const truths = {
  leve: [
    "Qual sua comida favorita?",
    "Qual a última série que você assistiu?",
    "Você já colou em uma prova?",
    "Quem é seu melhor amigo?"
  ],
  valeTudo: [
    "Qual foi sua maior vergonha?",
    "Você já ficou com mais de uma pessoa na mesma festa?",
    "Qual seu segredo mais cabeludo?",
    "Qual foi sua pior ressaca?"
  ]
};

const dares = {
  leve: [
    "Dance por 10 segundos.",
    "Faça uma careta engraçada.",
    "Fale o alfabeto ao contrário.",
    "Conte uma piada ruim."
  ],
  valeTudo: [
    "Beba 3 goles da sua bebida.",
    "Imite alguém até adivinharem.",
    "Envie uma mensagem aleatória para um contato.",
    "Cante um funk alto."
  ]
};

function setMode(selected) {
  mode = selected;
  document.getElementById("modeSelection").classList.add("hidden");
  document.getElementById("playerSection").classList.remove("hidden");
  alert("Modo escolhido: " + (selected === "leve" ? "Tranquilo" : "Vale Tudo"));
}

function addPlayer() {
  const nameInput = document.getElementById("playerName");
  if (nameInput.value.trim() !== "") {
    players.push(nameInput.value);
    updatePlayerList();
    nameInput.value = "";

    if (players.length >= 2) {
      document.getElementById("rouletteSection").classList.remove("hidden");
      document.getElementById("cardsSection").classList.remove("hidden");
      drawRoulette();
    }
  }
}

function updatePlayerList() {
  const list = document.getElementById("playerList");
  list.innerHTML = "";
  players.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p;
    list.appendChild(li);
  });
}

function drawRoulette() {
  const canvas = document.getElementById("rouletteCanvas");
  const ctx = canvas.getContext("2d");
  const radius = canvas.width / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const angleStep = (2 * Math.PI) / players.length;

  players.forEach((player, i) => {
    const angle = i * angleStep;

    ctx.beginPath();
    ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, radius, angle, angle + angleStep);
    ctx.fillStyle = i % 2 === 0 ? "#ff4d6d" : "#ffcc00";
    ctx.fill();

    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(angle + angleStep / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.fillText(player, radius - 10, 5);
    ctx.restore();
  });
}

function spinRoulette() {
  if (players.length < 2) {
    alert("Adicione pelo menos 2 jogadores!");
    return;
  }

  const canvas = document.getElementById("rouletteCanvas");
  const duration = 3000;
  const spins = 5 * 360; 
  const extra = Math.floor(Math.random() * 360);
  const finalRotation = rotation + spins + extra;

  let start = null;
  function animate(timestamp) {
    if (!start) start = timestamp;
    const progress = timestamp - start;
    const angle = rotation + ((finalRotation - rotation) * (progress / duration));
    drawRoulette();
    canvas.style.transform = `rotate(${angle}deg)`;

    if (progress < duration) {
      requestAnimationFrame(animate);
    } else {
      rotation = finalRotation % 360;
      selectPlayers();
    }
  }
  requestAnimationFrame(animate);
}

function selectPlayers() {
  const angleStep = 360 / players.length;
  const pointerA = (rotation + 0) % 360;
  const pointerB = (rotation + 180) % 360;

  const indexA = Math.floor(pointerA / angleStep) % players.length;
  const indexB = Math.floor(pointerB / angleStep) % players.length;

  const p1 = players[indexA];
  const p2 = players[indexB];

  document.getElementById("playersSelected").textContent =
    `👉 ${p1} pergunta para ${p2} 👈`;
}

function drawCard(type) {
  if (!mode) {
    alert("Escolha o modo primeiro!");
    return;
  }
  let card;
  if (type === "truth") {
    card = truths[mode][Math.floor(Math.random() * truths[mode].length)];
  } else {
    card = dares[mode][Math.floor(Math.random() * dares[mode].length)];
  }
  document.getElementById("cardResult").textContent = card;
}
