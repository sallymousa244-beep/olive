const gameArea = document.getElementById("gameArea");
const counter = document.getElementById("counter");
const timer = document.getElementById("timer");
const message = document.getElementById("message");
const basket = document.getElementById("basket");
const basketCount = document.getElementById("basketCount");
const growingTree = document.getElementById("growingTree");
const growthMessage = document.getElementById("growthMessage");
const gameInfo = document.getElementById("gameInfo");

const successBox = document.getElementById("successBox");
const nextBtn = document.getElementById("nextBtn");

const totalOlives = 8;
let found = 0;
let timeLeft = 90;
let timerInterval = null;
let gameOver = false;

// أماكن موزعة على مساحة الصورة
const positions = [
    [12, 20], [32, 15], [58, 20], [82, 14],
    [20, 45], [45, 42], [72, 47], [90, 55],
    [10, 75], [35, 78], [60, 70], [83, 82],
    [52, 88], [75, 30], [28, 60], [92, 32]
];

function startGame() {
    clearInterval(timerInterval);

    found = 0;
    timeLeft = 90;
    gameOver = false;

    gameArea.querySelectorAll(".olive").forEach(olive => olive.remove());
basketCount.textContent = "0 / 8";
    successBox.hidden = true;
    gameArea.hidden = false;
gameInfo.hidden = false;
message.hidden = false;
    growingTree.classList.remove("animate");
nextBtn.hidden = true;
growthMessage.textContent = "شجرتك تستعد للنمو...";

    counter.textContent = "🫒 0 / 8";
    timer.textContent = "⏱️ 90 ثانية";
    message.textContent = "ابحث عن الحبات بين الأوراق";

    const shuffled = [...positions]
        .sort(() => Math.random() - 0.5);

    shuffled.slice(0, totalOlives).forEach((pos, index) => {
        const olive = document.createElement("button");

        olive.type = "button";
        olive.className = "olive";
        olive.style.left = pos[0] + "%";
        olive.style.top = pos[1] + "%";
        olive.setAttribute(
            "aria-label",
            `حبة زيتون مخفية رقم ${index + 1}`
        );

        olive.addEventListener("click", () => {
            if (gameOver || olive.classList.contains("found")) {
                return;
            }

            olive.classList.add("found");
found++;

flyToBasket(olive, index);

olive.style.visibility = "hidden";

counter.textContent = `🫒 ${found} / 8`;

            if (found === totalOlives) {
                finishGame(true);
            }
        });

        gameArea.appendChild(olive);
    });

    timerInterval = setInterval(() => {
        if (gameOver) return;

        timeLeft--;
        timer.textContent = `⏱️ ${timeLeft} ثانية`;

        if (timeLeft <= 0) {
            finishGame(false);
        }
    }, 1000);
}

function finishGame(won) {
    gameOver = true;
    clearInterval(timerInterval);

    if (won) {
        sessionStorage.setItem("challenge1", "completed");

        message.textContent = "اكتملت المهمة بنجاح!";

        // ننتظر وصول آخر حبة إلى السلة
        setTimeout(() => {

            // إخفاء صورة اللعبة والعداد
            gameArea.hidden = true;
            gameInfo.hidden = true;
            message.hidden = true;

            // إظهار شاشة نمو النبتة مكان اللعبة
            successBox.hidden = false;

            growingTree.classList.remove("animate");
            nextBtn.hidden = true;

            // إعادة تشغيل حركة النمو
            void growingTree.offsetWidth;
            growingTree.classList.add("animate");

            growthMessage.textContent =
                "شاهد شجرتك وهي تنمو 🌱";

            setTimeout(() => {
                growthMessage.textContent =
                    "رائع! اجتزت المرحلة الأولى 🌿";

                nextBtn.hidden = false;
            }, 2600);

        }, 750);

    } else {
        message.textContent =
            "انتهى الوقت! انتهى التحدي 🌿";
    }
}


nextBtn.addEventListener("click", () => {
    window.location.href = "game2.html";

});
function flyToBasket(olive, index) {
    const start = olive.getBoundingClientRect();
    const target = basket.getBoundingClientRect();

    const flying = document.createElement("div");
    flying.className = "flying-olive";

    if (index % 2 !== 0) {
        flying.classList.add("dark");
    }

    flying.style.left = start.left + start.width / 2 - 12 + "px";
    flying.style.top = start.top + start.height / 2 - 16 + "px";

    document.body.appendChild(flying);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            flying.style.left =
                target.left + target.width / 2 - 12 + "px";

            flying.style.top =
                target.top + target.height / 2 - 16 + "px";

            flying.style.transform = "scale(0.3)";
            flying.style.opacity = "0";
        });
    });

    setTimeout(() => {
        flying.remove();

        basket.classList.remove("bump");
        void basket.offsetWidth;
        basket.classList.add("bump");

        basketCount.textContent = `${found} / 8`;
    }, 650);
}
startGame();