import { db, authReady } from "./firebase-config.js";

import {
    collection,
    addDoc,
    serverTimestamp,
    onSnapshot,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const wishInput = document.getElementById("wishInput");
const saveWishBtn = document.getElementById("saveWishBtn");
const wishMessage = document.getElementById("wishMessage");
const wishLeaves = document.getElementById("wishLeaves");

const visitorName =
    sessionStorage.getItem("visitorName") || "زائر البستان";

// أماكن الأوراق فوق أغصان الشجرة
const positions = [
    [20, 35], [32, 22], [45, 17],
    [58, 22], [72, 33], [80, 45],
    [15, 50], [28, 45], [40, 35],
    [55, 38], [68, 48], [85, 58],
    [25, 60], [38, 55], [52, 57],
    [65, 63], [35, 72], [75, 70]
];

function addLeaf(data, index) {
    const leaf = document.createElement("div");
    leaf.className = "wish-leaf";

    const position = positions[index % positions.length];

    leaf.style.left = position[0] + "%";
    leaf.style.top = position[1] + "%";

    // كتابة الأمنية على الورقة
    const wishText = document.createElement("span");
    wishText.className = "leaf-text";
    wishText.textContent = data.wishText || "";

    leaf.appendChild(wishText);
    wishLeaves.appendChild(leaf);
}

// عرض الأمنيات المنشورة مباشرة
async function loadWishes() {
    try {
        await authReady;

        const q = query(
            collection(db, "wishes"),
            where("approved", "==", true)
        );

        onSnapshot(q, snapshot => {
            wishLeaves.replaceChildren();

            const docs = snapshot.docs.sort(
                (a, b) => a.id.localeCompare(b.id)
            );

            docs.forEach((item, index) => {
                addLeaf(item.data(), index);
            });
        }, error => {
            console.error(error);
            wishMessage.textContent =
                "تعذر تحميل الأمنيات";
        });

    } catch (error) {
        console.error(error);
    }
}

// حفظ الأمنية
saveWishBtn.addEventListener("click", async () => {
    const wishText = wishInput.value.trim();

    if (!wishText) {
        wishMessage.textContent = "اكتبي أمنيتك أولًا 🍃";
        return;
    }

    saveWishBtn.disabled = true;
    wishMessage.textContent = "جاري تعليق الأمنية...";

    try {
        const credential = await authReady;
        const uid = credential.user.uid;

        await addDoc(collection(db, "wishes"), {
            visitorName,
            ownerId: uid,
            wishText,
            approved: true,
            createdAt: serverTimestamp()
        });

        wishInput.value = "";
        wishMessage.textContent =
            "🍃 تم تعليق أمنيتك على الشجرة بنجاح!";

    } catch (error) {
        console.error(error);
        wishMessage.textContent =
            "تعذر حفظ الأمنية، تأكدي من إعدادات Firebase";
        saveWishBtn.disabled = false;
    }
});

loadWishes();