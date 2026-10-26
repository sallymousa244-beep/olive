import { db, authReady } from "./firebase-config.js";

import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp,
    collection,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const visitorName =
    sessionStorage.getItem("visitorName") || "زائر البستان";

const welcomeMessage = document.getElementById("welcomeMessage");
const plantTreeBtn = document.getElementById("plantTreeBtn");
const myTree = document.getElementById("myTree");
const treeName = document.getElementById("treeName");
const plantingMessage = document.getElementById("plantingMessage");
const wishBtn = document.getElementById("wishBtn");
const communityTrees = document.getElementById("communityTrees");
const treesCounter = document.getElementById("treesCounter");

let planted = false;
let plantingInProgress = false;
let groveLoaded = false;
let currentUid = null;

welcomeMessage.textContent =
    `أهلاً ${visitorName}، هذه رحلتك إلى بستان الأمل 🌿`;

// إخفاء الشجرة حتى تضغط الزائرة زر الزراعة
myTree.classList.remove("grow");
myTree.style.animation = "none";
myTree.style.transform = "translateX(-50%) scale(0)";
myTree.style.opacity = "0";

treeName.classList.remove("visible");
wishBtn.hidden = true;

plantTreeBtn.disabled = true;
plantingMessage.textContent =
    "🌳 جاري تحميل أشجار البستان...";

// أماكن الأشجار المحفوظة
const treePositions = [
    [12, 73], [25, 65], [72, 72],
    [85, 64], [16, 48], [77, 47],
    [37, 55], [58, 60], [47, 38],
    [88, 43], [10, 35], [67, 33]
];

// تشغيل حركة نمو الشجرة عند الضغط فقط
function growMyTree(name) {
    planted = true;

    plantTreeBtn.hidden = true;
    plantTreeBtn.disabled = true;

    plantingMessage.textContent =
        "🌱 شجرتك تنمو الآن في بستان الأمل...";

    treeName.classList.remove("visible");

    myTree.classList.remove("grow");
    myTree.style.animation = "";
    myTree.style.transform = "";
    myTree.style.opacity = "";

    // إعادة تشغيل الحركة من البداية
    void myTree.offsetWidth;

    myTree.classList.add("grow");

    setTimeout(() => {
        treeName.textContent = `🌿 شجرة ${name}`;
        treeName.classList.add("visible");

        plantingMessage.textContent =
            "🌳 مبارك! شجرتك أصبحت جزءًا من بستان الأمل الرقمي";

        wishBtn.hidden = false;
    }, 4000);
}

// تحميل جميع الأشجار القديمة
async function initializeGrove() {
    try {
        const credential = await authReady;
        currentUid = credential.user.uid;

        onSnapshot(
            collection(db, "trees"),
            (snapshot) => {

                communityTrees.replaceChildren();

                treesCounter.textContent =
                    `🌳 عدد أشجار الأمل: ${snapshot.size}`;

                const documents = [...snapshot.docs].sort(
                    (a, b) => a.id.localeCompare(b.id)
                );

                let positionIndex = 0;

                documents.forEach((treeDoc) => {
                    const treeData = treeDoc.data();

                    // لا نكرر شجرة الزائرة الحالية
                    // لأنها ستظهر عند الضغط على زر الزراعة
                    if (treeDoc.id === currentUid) {
                        return;
                    }

                    const tree = document.createElement("div");
                    tree.className = "community-tree";

                    const position =
                        treePositions[
                            positionIndex % treePositions.length
                        ];

                    tree.style.left = position[0] + "%";
                    tree.style.top = position[1] + "%";

                    const image = document.createElement("img");
                    image.src = "olive-tree.png";
                    image.alt = "شجرة زيتون";

                    const label = document.createElement("div");
                    label.className = "visitor-label";

                    label.textContent =
                        treeData.visitorName || "زائر البستان";

                    tree.appendChild(image);
                    tree.appendChild(label);

                    communityTrees.appendChild(tree);

                    positionIndex++;
                });

                // تفعيل الزراعة بعد ظهور الأشجار القديمة
                if (!groveLoaded) {
                    groveLoaded = true;

                    plantingMessage.textContent =
                        "🌿 البستان جاهز! اضغطي لزراعة شجرتك";

                    plantTreeBtn.disabled = false;
                }
            },
            (error) => {
                console.error("خطأ تحميل الأشجار:", error);

                plantingMessage.textContent =
                    "تعذر تحميل أشجار البستان";

                treesCounter.textContent =
                    "تعذر تحميل الأشجار";
            }
        );

    } catch (error) {
        console.error("خطأ الاتصال:", error);

        plantingMessage.textContent =
            "تعذر الاتصال بالبستان، حاولي تحديث الصفحة";
    }
}

// زراعة الشجرة عند الضغط على الزر
plantTreeBtn.addEventListener("click", async () => {

    if (planted || plantingInProgress || !groveLoaded) {
        return;
    }

    plantingInProgress = true;
    plantTreeBtn.disabled = true;

    plantingMessage.textContent =
        "🌿 جاري التحقق من شجرتك...";

    try {
        const credential = await authReady;
        const uid = credential.user.uid;

        const treeRef = doc(db, "trees", uid);
        const existingTree = await getDoc(treeRef);

        let savedName = visitorName;

        if (existingTree.exists()) {
            // الشجرة موجودة مسبقًا
            // لا نضيف نسخة ثانية
            savedName =
                existingTree.data().visitorName || visitorName;

        } else {
            // أول مرة تزرع فيها الزائرة
            await setDoc(treeRef, {
                visitorName: visitorName,
                ownerId: uid,
                createdAt: serverTimestamp()
            });
        }

        // الحركة تبدأ فقط بعد الضغط والحفظ
        growMyTree(savedName);

    } catch (error) {
        console.error("خطأ حفظ الشجرة:", error);

        plantingMessage.textContent =
            "تعذر حفظ الشجرة، حاولي مرة ثانية";

        plantTreeBtn.disabled = false;

    } finally {
        plantingInProgress = false;
    }
});

// الانتقال إلى صفحة شجرة الأمنيات
wishBtn.addEventListener("click", () => {
    window.location.href = "wishes.html";
});

// تشغيل البستان
initializeGrove();