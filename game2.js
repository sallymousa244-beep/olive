const board = document.getElementById("memoryBoard");
const matchesText = document.getElementById("matches");
const timerText = document.getElementById("timer");
const message = document.getElementById("message");
const gameInfo = document.getElementById("gameInfo");
const successBox = document.getElementById("successBox");
const treeGrowth = document.getElementById("treeGrowth");
const nextBtn = document.getElementById("nextBtn");

// رموز مؤقتة لحين إضافة الصور الواقعية
const symbols = ["🫒", "🌿", "🌳", "🧺", "🌱", "🪵"];

const cards = [...symbols, ...symbols]
    .map((symbol, index) => ({
        id: index,
        symbol
    }))
    .sort(() => Math.random() - 0.5);

let firstCard = null;
let secondCard = null;
let locked = false;
let matches = 0;
let timeLeft = 90;
let gameOver = false;
let timerInterval = null;

function createBoard() {
    cards.forEach(cardData => {
        const card = document.createElement("button");

        card.type = "button";
        card.className = "memory-card";
        card.textContent = "❧";
        card.setAttribute("aria-label", "بطاقة مخفية");

        card.dataset.symbol = cardData.symbol;

        card.addEventListener("click", () => {
            flipCard(card);
        });

        board.appendChild(card);
    });
}

function flipCard(card) {
    if (
        locked ||
        gameOver ||
        card === firstCard ||
        card.classList.contains("matched")
    ) {
        return;
    }

    card.classList.add("flipped");
    card.textContent = card.dataset.symbol;
    card.setAttribute("aria-label", "بطاقة " + card.dataset.symbol);

    if (!firstCard) {
        firstCard = card;
        return;
    }

    secondCard = card;
    locked = true;

    if (firstCard.dataset.symbol === secondCard.dataset.symbol) {
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");

        firstCard.disabled = true;
        secondCard.disabled = true;

        matches++;
        matchesText.textContent = `🫒 ${matches} / 6 أزواج`;

        firstCard = null;
        secondCard = null;
        locked = false;

        if (matches === 6) {
            finishGame(true);
        }
    } else {
        setTimeout(() => {
            firstCard.classList.remove("flipped");
            secondCard.classList.remove("flipped");

            firstCard.textContent = "❧";
            secondCard.textContent = "❧";

            firstCard.setAttribute("aria-label", "بطاقة مخفية");
            secondCard.setAttribute("aria-label", "بطاقة مخفية");

            firstCard = null;
            secondCard = null;
            locked = false;
        }, 850);
    }
}

function finishGame(won) {
    gameOver = true;
    locked = true;
    clearInterval(timerInterval);

    if (won) {
        sessionStorage.setItem("challenge2", "completed");

        setTimeout(() => {
            board.hidden = true;
            gameInfo.hidden = true;
            message.hidden = true;

            successBox.hidden = false;
            treeGrowth.classList.add("animate");
        }, 700);
    } else {
        message.textContent = "انتهى الوقت! لم تكتمل المهمة 🌿";
    }
}

function startGame() {
    createBoard();

    timerInterval = setInterval(() => {
        if (gameOver) return;

        timeLeft--;
        timerText.textContent = `⏱️ ${timeLeft} ثانية`;

        if (timeLeft <= 0) {
            finishGame(false);
        }
    }, 1000);
}

nextBtn.addEventListener("click", () => {
    window.location.href = "game3.html";
});

startGame();