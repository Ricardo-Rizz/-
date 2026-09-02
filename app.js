"use strict";

const STORAGE_KEY = "examGod_v1";

const EXAMS = {
  IELTS: {
    label: "IELTS",
    target: "目标总分",
    tasks: [
      ["复习 20 个高频词汇", "15 分钟", 20],
      ["完成一次 2 分钟口语练习", "10 分钟", 25],
      ["复盘 5 道错题", "20 分钟", 30]
    ]
  },
  TOEFL: {
    label: "TOEFL",
    target: "目标分数",
    tasks: [
      ["听力精听 15 分钟", "15 分钟", 20],
      ["完成 1 篇阅读练习", "25 分钟", 30],
      ["完成一次综合口语练习", "15 分钟", 25]
    ]
  },
  AP: {
    label: "AP",
    target: "目标科目 / 分数",
    tasks: [
      ["完成 15 道选择题", "25 分钟", 25],
      ["复习 1 个核心知识点", "20 分钟", 20],
      ["整理 3 道错题", "15 分钟", 25]
    ]
  },
  IB: {
    label: "IB",
    target: "目标科目 / 分数",
    tasks: [
      ["复习 1 个知识点", "20 分钟", 20],
      ["更新 IA / EE 进度", "25 分钟", 30],
      ["完成 10 道章节练习", "20 分钟", 25]
    ]
  }
};

const GODS = [
  { id: "ielts", name: "雅思导师", icon: "口", focus: "口语与写作", description: "帮助你练习表达，把想法说得更清楚。", advice: "今天试着用英语完整表达一个观点。" },
  { id: "toefl", name: "托福导师", icon: "听", focus: "听力与时间管理", description: "帮助你建立高效、稳定的考试节奏。", advice: "设定 25 分钟专注时间，不被手机打断。" },
  { id: "ap", name: "AP 导师", icon: "知", focus: "知识点与刷题", description: "帮助你拆解知识点，找到错题原因。", advice: "今天整理一道错题，并写下错误原因。" },
  { id: "ib", name: "IB 导师", icon: "路", focus: "IA、EE 与长期规划", description: "陪你把长期项目拆成今天能完成的一小步。", advice: "今天推进 IA 或 EE 项目至少 15 分钟。" }
];

const TIPS = [
  "先完成一个最小任务，今天就已经开始变好了。",
  "不要等状态完美，先学习 10 分钟。",
  "错题不是失败记录，而是下一次提分线索。",
  "稳定完成小目标，比偶尔熬夜更有效。"
];

function defaultState() {
  return {
    exam: "",
    target: "",
    examDate: "",
    dailyMinutes: 30,
    points: 0,
    incense: 5,
    streak: 0,
    lastStudyDate: "",
    lastIncenseClaimDate: "",
    studyMinutes: 0,
    completedTasks: {},
    records: [],
    mistakes: [],
    rewards: [],
    selectedGod: "ielts"
  };
}

let state = loadState();

function loadState() {
  try {
    return { ...defaultState(), ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}) };
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function todayKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function $(id) {
  return document.getElementById(id);
}

function el(tag, text, className = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.add("hidden"), 2400);
}

function openModal(content) {
  $("modal-content").replaceChildren(content);
  $("modal-backdrop").classList.remove("hidden");
}

function closeModal() {
  $("modal-backdrop").classList.add("hidden");
}

function claimDailyIncense() {
  if (state.lastIncenseClaimDate === todayKey()) return false;
  state.incense += 3;
  state.lastIncenseClaimDate = todayKey();
  saveState();
  return true;
}

function updateStreak() {
  const today = todayKey();
  if (state.lastStudyDate === today) return;
  if (!state.lastStudyDate) {
    state.streak = 1;
  } else {
    const previous = new Date(`${state.lastStudyDate}T00:00:00`);
    const current = new Date(`${today}T00:00:00`);
    const days = Math.round((current - previous) / 86400000);
    state.streak = days === 1 ? state.streak + 1 : 1;
  }
  state.lastStudyDate = today;
  if (state.streak === 3) claimReward("streak-3", "连续学习 3 天徽章");
  if (state.streak === 7) claimReward("streak-7", "连续学习 7 天资料兑换资格");
}

function claimReward(key, title) {
  if (state.rewards.some((item) => item.key === key)) return;
  state.rewards.push({ key, title, date: todayKey() });
}

function renderDashboard() {
  $("top-incense").textContent = state.incense;
  $("top-points").textContent = state.points;
  $("side-points").textContent = state.points;
  $("streak").textContent = state.streak;
  $("study-minutes").textContent = state.studyMinutes;
  $("mistake-count").textContent = state.mistakes.length;

  if (!state.exam) {
    $("exam-type").textContent = "未设置";
    $("target-score").textContent = "请先设置目标";
    $("days-left").textContent = "—";
    $("profile-summary").textContent = "还没有设置备考计划";
    return;
  }

  $("exam-type").textContent = state.exam;
  $("target-score").textContent = state.target ? `目标：${state.target}` : "尚未设置目标";
  $("profile-summary").textContent = `${state.exam} · 每日 ${state.dailyMinutes} 分钟`;

  if (!state.examDate) {
    $("days-left").textContent = "—";
  } else {
    const days = Math.ceil((new Date(`${state.examDate}T00:00:00`) - new Date()) / 86400000);
    $("days-left").textContent = Math.max(0, days);
  }
}

function getTasks() {
  if (!EXAMS[state.exam]) return [];
  return EXAMS[state.exam].tasks.map((task, index) => ({
    id: `${state.exam}-${index}`,
    title: task[0],
    duration: task[1],
    reward: task[2]
  }));
}

function renderTasks() {
  const list = $("task-list");
  list.replaceChildren();
  const tasks = getTasks();
  const completed = state.completedTasks[todayKey()] || [];
  let count = 0;

  if (!tasks.length) {
    list.appendChild(el("p", "请先点击右上角“设置”，选择你的考试类型。", "muted"));
    $("task-progress").textContent = "0/0";
    return;
  }

  tasks.forEach((task) => {
    const done = completed.includes(task.id);
    if (done) count++;
    const item = el("div", undefined, `task-item${done ? " completed" : ""}`);
    item.appendChild(el("span", done ? "✓" : "✦", "task-icon"));
    const info = el("div", undefined, "task-info");
    info.appendChild(el("strong", task.title));
    info.appendChild(el("small", `${task.duration} · 完成后获得 ${task.reward} 香火值`));
    const button = el("button", done ? "已完成" : "完成任务", `button ${done ? "button-secondary" : "button-primary"}`);
    button.disabled = done;
    button.addEventListener("click", () => {
      if (!state.completedTasks[todayKey()]) state.completedTasks[todayKey()] = [];
      state.completedTasks[todayKey()].push(task.id);
      state.points += task.reward;
      state.incense += 1;
      updateStreak();
      saveState();
      renderAll();
      showToast(`任务完成，获得 ${task.reward} 点香火值和 1 炷香`);
    });
    item.append(info, button);
    list.appendChild(item);
  });
  $("task-progress").textContent = `${count}/${tasks.length}`;
}

function offerIncense(god) {
  if (state.incense < 1) {
    showToast("香火不足，完成学习任务可以获得香");
    return;
  }
  state.incense -= 1;
  state.points += 5;
  state.selectedGod = god.id;
  saveState();
  renderAll();
  const card = document.querySelector(`[data-god-id="${god.id}"]`);
  if (card) {
    card.classList.add("offering");
    setTimeout(() => card.classList.remove("offering"), 1400);
  }
  showToast(`已向${god.name}上香，获得 5 点香火值`);
}

function renderGods() {
  const list = $("gods-list");
  list.replaceChildren();
  GODS.forEach((god, index) => {
    const card = el("article", undefined, "god-card");
    card.dataset.godId = god.id;
    card.style.setProperty("--god-color", ["rgba(255,214,165,.16)", "rgba(160,196,255,.16)", "rgba(202,255,191,.14)", "rgba(255,198,255,.14)"][index]);
    card.style.setProperty("--god-avatar", ["#ffd6a5", "#a0c4ff", "#caffbf", "#ffc6ff"][index]);
    card.appendChild(el("div", god.icon, "god-avatar"));
    card.appendChild(el("h3", god.name));
    card.appendChild(el("small", `专注：${god.focus}`, "muted"));
    card.appendChild(el("p", god.description));

    const actions = el("div", undefined, "god-actions");
    const select = el("button", state.selectedGod === god.id ? "当前导师" : "选择导师", `button ${state.selectedGod === god.id ? "button-secondary" : "button-primary"}`);
    select.addEventListener("click", () => {
      state.selectedGod = god.id;
      saveState();
      renderAll();
      showToast(`已选择${god.name}`);
    });
    const offer = el("button", "上香 · 1 香", "button offer-button");
    offer.disabled = state.incense < 1;
    offer.addEventListener("click", () => offerIncense(god));
    actions.append(select, offer);
    card.appendChild(actions);
    list.appendChild(card);
  });
}

function renderRecords() {
  const list = $("study-records");
  list.replaceChildren();
  if (!state.records.length) {
    list.appendChild(el("p", "还没有学习记录，完成学习后记下来吧。", "muted"));
    return;
  }
  state.records.slice(0, 5).forEach((record) => {
    const item = el("div", undefined, "record-item");
    item.append(el("strong", record.content), el("small", `${record.date} · ${record.minutes} 分钟`));
    list.appendChild(item);
  });
}

function renderDailyTip() {
  const god = GODS.find((item) => item.id === state.selectedGod);
  $("daily-tip").textContent = god ? god.advice : TIPS[new Date().getDate() % TIPS.length];
}

function renderAll() {
  renderDashboard();
  renderTasks();
  renderGods();
  renderRecords();
  renderDailyTip();
}

function saveStudyRecord(event) {
  event.preventDefault();
  const minutes = Number($("study-duration").value);
  const content = $("study-content").value.trim();
  if (!Number.isFinite(minutes) || minutes < 1 || !content) {
    showToast("请填写有效的学习时长和内容");
    return;
  }
  state.records.unshift({ id: Date.now(), date: todayKey(), minutes, content });
  state.records = state.records.slice(0, 100);
  state.studyMinutes += minutes;
  state.points += Math.min(20, Math.ceil(minutes / 10));
  updateStreak();
  saveState();
  renderAll();
  $("study-form").reset();
  showToast("学习记录已保存，获得香火值");
}

function openSettings() {
  const wrapper = document.createElement("div");
  wrapper.appendChild(el("h2", "设置你的备考计划"));
  const form = el("form", undefined, "modal-form");
  const exam = document.createElement("select");
  exam.required = true;
  [["", "请选择考试"], ["IELTS", "IELTS"], ["TOEFL", "TOEFL"], ["AP", "AP"], ["IB", "IB"]].forEach(([value, text]) => {
    const option = el("option", text);
    option.value = value;
    exam.appendChild(option);
  });
  exam.value = state.exam;
  const target = document.createElement("input");
  target.placeholder = "目标分数 / 科目，例如：IELTS 7.0";
  target.value = state.target;
  const date = document.createElement("input");
  date.type = "date";
  date.value = state.examDate;
  const minutes = document.createElement("input");
  minutes.type = "number";
  minutes.min = "10";
  minutes.max = "600";
  minutes.value = state.dailyMinutes;
  [["考试类型", exam], ["目标分数 / 科目", target], ["考试日期", date], ["每日学习时长", minutes]].forEach(([text, input]) => {
    const label = el("label", text);
    label.appendChild(input);
    form.appendChild(label);
  });
  const submit = el("button", "保存并生成我的任务", "button button-primary");
  submit.type = "submit";
  form.appendChild(submit);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!exam.value) return;
    state.exam = exam.value;
    state.target = target.value.trim();
    state.examDate = date.value;
    state.dailyMinutes = Math.max(10, Math.min(600, Number(minutes.value) || 30));
    saveState();
    closeModal();
    renderAll();
    showToast("备考计划已更新");
  });
  wrapper.appendChild(form);
  openModal(wrapper);
}

function openMistakes() {
  const wrapper = document.createElement("div");
  wrapper.appendChild(el("h2", "错题记录"));
  const form = el("form", undefined, "modal-form");
  const subject = document.createElement("input");
  subject.placeholder = "科目，例如：Reading";
  subject.required = true;
  const question = document.createElement("textarea");
  question.placeholder = "题目或知识点";
  question.required = true;
  const answer = document.createElement("textarea");
  answer.placeholder = "正确答案 / 解析";
  answer.required = true;
  const submit = el("button", "保存错题", "button button-primary");
  submit.type = "submit";
  form.append(subject, question, answer, submit);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    state.mistakes.unshift({ subject: subject.value.trim(), question: question.value.trim(), answer: answer.value.trim() });
    saveState();
    closeModal();
    renderDashboard();
    showToast("错题已保存");
  });
  wrapper.appendChild(form);
  state.mistakes.slice(0, 10).forEach((mistake) => {
    const item = el("div", undefined, "mistake-item");
    item.append(el("strong", mistake.subject), el("small", mistake.question), el("small", `解析：${mistake.answer}`));
    wrapper.appendChild(item);
  });
  openModal(wrapper);
}

function openRewards() {
  const wrapper = document.createElement("div");
  wrapper.appendChild(el("h2", "成长奖励与香火规则"));
  wrapper.appendChild(el("p", "完成任务：获得香火值和 1 炷香。", "muted"));
  wrapper.appendChild(el("p", "每日首次打开：自动领取 3 炷免费香。", "muted"));
  wrapper.appendChild(el("p", "每次上香：消耗 1 炷香，获得 5 点香火值并触发考神动画。", "muted"));
  wrapper.appendChild(el("p", "连续学习 3 天或 7 天：解锁成长奖励。", "muted"));
  wrapper.appendChild(el("p", "香火值和香只用于虚拟学习激励，不代表真实考试分数或结果。", "muted"));
  state.rewards.forEach((reward) => wrapper.appendChild(el("p", `✦ ${reward.title} · ${reward.date}`, "reward-item")));
  openModal(wrapper);
}

function init() {
  const received = claimDailyIncense();
  $("study-form").addEventListener("submit", saveStudyRecord);
  $("open-settings").addEventListener("click", openSettings);
  $("mobile-settings").addEventListener("click", openSettings);
  $("open-mistakes").addEventListener("click", openMistakes);
  $("open-rewards").addEventListener("click", openRewards);
  $("close-modal").addEventListener("click", closeModal);
  $("modal-backdrop").addEventListener("click", (event) => {
    if (event.target.id === "modal-backdrop") closeModal();
  });
  $("hero-action").addEventListener("click", () => {
    if (!state.exam) openSettings();
    else $("tasks-section").scrollIntoView({ behavior: "smooth" });
  });
  renderAll();
  if (received) showToast("今日已领取 3 炷免费香");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
