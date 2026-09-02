```js
"use strict";

// ===============================
// 数据配置
// ===============================

const STORAGE_KEYS = {
    incense: "examGod_incense",
    incensePoints: "examGod_incensePoints"
};

const DEFAULT_INCIDENCE = 5;

// 防止用户连续快速点击
let isBowing = false;

// ===============================
// 工具函数
// ===============================

function getNumber(key, defaultValue = 0) {
    const value = Number(localStorage.getItem(key));

    return Number.isFinite(value) && value >= 0
        ? value
        : defaultValue;
}

function saveNumber(key, value) {
    localStorage.setItem(key, String(value));
}

function getElement(id) {
    return document.getElementById(id);
}

// ===============================
// 香和香火值
// ===============================

let incense = getNumber(
    STORAGE_KEYS.incense,
    DEFAULT_INCIDENCE
);

let incensePoints = getNumber(
    STORAGE_KEYS.incensePoints,
    0
);

function updateIncense() {
    const incenseDisplay = getElement("incenseCount");

    if (incenseDisplay) {
        incenseDisplay.textContent = incense;
    }

    // 如果你的 HTML 中有香火值显示区域，就会自动更新
    const pointsDisplay = getElement("incensePoints");

    if (pointsDisplay) {
        pointsDisplay.textContent = incensePoints;
    }
}

function addIncensePoints(points) {
    incensePoints += points;

    saveNumber(
        STORAGE_KEYS.incensePoints,
        incensePoints
    );

    updateIncense();
}

// ===============================
// 拜考神主逻辑
// ===============================

function baiKaoshen(godName) {
    if (isBowing) {
        return;
    }

    if (incense <= 0) {
        alert("你的香不够啦，可以先完成学习任务获得香火值。");
        return;
    }

    const animation = getElement("baiAnimation");
    const rewardPopup = getElement("rewardPopup");

    if (!animation || !rewardPopup) {
        console.error(
            "缺少 baiAnimation 或 rewardPopup 元素，请检查 index.html"
        );
        return;
    }

    isBowing = true;

    // 扣除一根香
    incense -= 1;
    saveNumber(STORAGE_KEYS.incense, incense);
    updateIncense();

    // 播放动画
    animation.style.display = "flex";

    setTimeout(() => {
        animation.style.display = "none";

        const reward = generateReward(godName);
        showReward(reward);

        rewardPopup.style.display = "block";

        isBowing = false;
    }, 1500);
}

// ===============================
// 奖励生成
// ===============================

function generateReward(godName) {
    const rewardPoints =
        Math.floor(Math.random() * 10) + 5;

    const buffList = [
        "今天适合完成一次专注学习",
        "今天适合复盘错题",
        "今天适合练习口语表达",
        "今天适合整理学习计划"
    ];

    const vocabList = [
        {
            word: "astronomy",
            meaning: "天文学"
        },
        {
            word: "hypothesis",
            meaning: "假设"
        },
        {
            word: "evaluate",
            meaning: "评估"
        },
        {
            word: "simulate",
            meaning: "模拟"
        },
        {
            word: "interpret",
            meaning: "解读"
        }
    ];

    const buff =
        buffList[
            Math.floor(Math.random() * buffList.length)
        ];

    const vocab =
        vocabList[
            Math.floor(Math.random() * vocabList.length)
        ];

    // 真正增加香火值
    addIncensePoints(rewardPoints);

    return {
        godName: String(godName || "考神"),
        rewardPoints,
        buff,
        vocab
    };
}

// ===============================
// 安全显示奖励
// 不使用 innerHTML 拼接用户内容
// ===============================

function showReward(reward) {
    const rewardContent = getElement("rewardContent");

    if (!rewardContent) {
        return;
    }

    // 清空原来的内容
    rewardContent.replaceChildren();

    const title = document.createElement("b");
    title.textContent =
        `${reward.godName} 已收到你的诚意 🙏`;

    const points = document.createElement("p");
    points.textContent =
        `🌟 香火值 +${reward.rewardPoints}`;

    const buff = document.createElement("p");
    buff.textContent =
        `✨ 今日建议：${reward.buff}`;

    const vocab = document.createElement("p");
    vocab.textContent =
        `📚 今日词汇：${reward.vocab.word} ${reward.vocab.meaning}`;

    rewardContent.appendChild(title);
    rewardContent.appendChild(points);
    rewardContent.appendChild(buff);
    rewardContent.appendChild(vocab);
}

// ===============================
// 关闭弹窗
// ===============================

function closePopup() {
    const rewardPopup = getElement("rewardPopup");

    if (rewardPopup) {
        rewardPopup.style.display = "none";
    }
}

// ===============================
// 初始化
// ===============================

function init() {
    updateIncense();
}

// 兼容 HTML 中的 onclick="baiKaoshen(...)"
window.baiKaoshen = baiKaoshen;
window.closePopup = closePopup;

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
```
