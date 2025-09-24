let players = [];
let mode = "menores";

const truths = {
  menores: [
    "Qual sua comida favorita?",
    "Já colou em uma prova?",
    "Quem é seu melhor amigo?"
  ],
  maiores: [
    "Qual foi sua maior vergonha na vida?",
    "Você já ficou com mais de uma pessoa na mesma festa?",
    "Qual sua pior ressaca?"
  ]
};

const dares = {
  menores: [
    "Dance uma música por 10 segundos.",
    "Faça uma careta até todos rirem.",
    "Fale o alfabeto ao contrário."
  ],
  maiores: [
    "Beba 3 goles da sua bebida.",
    "Imite alguém aqui até acertarem.",
    "Envie uma mensagem engraçada para um contato aleatório."
  ]
};

function setMode(selected) {
  mode = selected;
  alert("Modo escolhido: " + (selected === "menores" ? "Menores" : "Maiores"));
}

function addPlayer() {
  const nameInput = document.getElementById("playerName");
  if (nameInput.value.trim() !== "") {
    players.push(nameInput.value);
    updatePlayerList();
    nameInput.value = "";
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

function spinBottle() {
  if (players.length < 2) {
    alert("Adicione pelo menos 2 jogadores!");
    return;
  }

  const bottle = document.getElementById("bottle");
  const rotation = 720 + Math.floor(Math.random() * 720); // 2 a 4 voltas
  bottle.style.transform = `rotate(${rotation}deg)`;

  setTimeout(() => {
    const p1 = players[Math.floor(Math.random() * players.length)];
    let p2;
    do {
      p2 = players[Math.floor(Math.random() * players.length)];
    } while (p1 === p2);

    document.getElementById("playersSelected").textContent =
      `${p1} pergunta para ${p2}`;
  }, 3000);
}

function drawCard(type) {
  let card;
  if (type === "truth") {
    card = truths[mode][Math.floor(Math.random() * truths[mode].length)];
  } else {
    card = dares[mode][Math.floor(Math.random() * dares[mode].length)];
  }
  document.getElementById("cardResult").textContent = card;
}
