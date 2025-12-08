// 用户初始数据
let incense = 5;
let incenseDisplay = document.getElementById("incenseCount");

// 更新显示
function updateIncense() {
    incenseDisplay.textContent = incense;
}

// 拜考神主逻辑
function baiKaoshen(godName) {
    if (incense <= 0) {
        alert("你的香不够啦！去商城买一点吧～");
        return;
    }

    // 扣香
    incense--;
    updateIncense();

    // 播放拜神动画
    document.getElementById("baiAnimation").style.display = "flex";

    setTimeout(() => {
        document.getElementById("baiAnimation").style.display = "none";

        // 生成奖励
        const reward = generateReward(godName);

        // 显示弹窗
        document.getElementById("rewardContent").innerHTML = reward;
        document.getElementById("rewardPopup").style.display = "block";
    }, 1500);
}

// 奖励生成
function generateReward(god) {

    const incenseValue = Math.floor(Math.random() * 10) + 5; // 5-15
    const buffList = [
        "今日学习效率 +10%",
        "今日记忆力 +20%",
        "今日抗压力 +15%",
        "今日阅读速度 +25%",
    ];
    const buff = buffList[Math.floor(Math.random() * buffList.length)];

    const vocabList = [
        "astronomy 天文学",
        "hypothesis 假设",
        "evaluate 评估",
        "simulate 模拟",
        "interpret 解读"
    ];
    const vocab = vocabList[Math.floor(Math.random() * vocabList.length)];

    return `
        <b>${god} 已收到你的诚意🙏</b><br><br>
        🌟 香火值 + ${incenseValue}<br>
        ✨ Buff：${buff}<br>
        📚 小词汇：${vocab}
    `;
}

// 关闭弹窗
function closePopup() {
    document.getElementById("rewardPopup").style.display = "none";
}

// 初始化香数量
updateIncense();
