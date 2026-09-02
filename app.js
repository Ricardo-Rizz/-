```javascript
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
  {
    id: "ielts",
    name: "雅思导师",
    icon: "口",
    focus: "口语与写作",
    description: "帮助你练习表达，把想法说得更清楚。",
    advice: "今天试着用英语完整表达一个观点。"
  },
  {
    id: "toefl",
    name: "托福导师",
    icon: "听",
    focus: "听力与时间管理",
    description: "帮助你建立高效、稳定的考试节奏。",
    advice: "设定 25 分钟专注时间，不被手机打断。"
  },
  {
    id: "ap",
    name: "AP 导师",
    icon: "知",
    focus: "知识点与刷题",
    description: "帮助你拆解知识点，找到错题原因。",
    advice: "今天整理一道错题，并写下错误原因。"
  },
  {
    id: "ib",
    name: "IB 导师",
    icon: "路",
    focus: "IA、EE 与长期规划",
    description: "陪你把长期项目拆成今天能完成的一小步。",
    advice: "今天推进 IA 或 EE 项目至少 15 分钟。"
  }
];

const TIPS = [
  "先完成一个最小任务，今天就已经开始变好了。",
  "不要等状态完美，先学习 10 分钟。",
  "错题不是失败记录，而是下一次提分线索。",
  "稳定完成小目标，比偶尔熬夜更有效。",
  "把今天的任务做完，明天会更轻松。"
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
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...defaultState(), ...(saved || {}) };
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function todayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function escapeDate(value) {
  return String(value || "");
}

function $(id) {
  return document.getElementById(id);
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2400);
}

function openModal(content) {
  $("modal-content").replaceChildren();
  $("modal-content").appendChild(content);
  $("modal-backdrop").classList.remove("hidden");
}

function closeModal() {
  $("modal-backdrop").classList.add("hidden");
}

function createElement(tag, text, className = "") {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

function renderAll() {
  renderDashboard();
  renderTasks();
  renderGods();
  renderRecords();
  renderDailyTip();
}

function renderDashboard() {
  $("top-incense").textContent = state.incense;
  $("top-points").textContent = state.points;
  $("side-points").textContent = state.points;
  $("streak").textContent = state.streak;
  $("study-minutes").textContent = state.studyMinutes;

  if (!state.exam) {
    $("exam-type").textContent = "未设置";
    $("target-score").textContent = "请先设置目标";
    $("days-left").textContent = "—";
    $("profile-summary").textContent = "还没有设置备考计划";
    return;
  }

  $("exam-type").textContent = state.exam;
  $("target-score").textContent =
    state.target ? `目标：${state.target}` : "尚未设置目标";

  $("profile-summary").textContent =
    `${state.exam} · 每日 ${state.dailyMinutes} 分钟`;

  if (!state.examDate) {
    $("days-left").textContent = "—";
  } else {
    const today = new Date();
    const examDate = new Date(`${state.examDate}T00:00:00`);
    const days = Math.ceil((examDate - today) / 86400000);
    $("days-left").textContent = Math.max(0, days);
  }
}

function getTasks() {
  if (!state.exam || !EXAMS[state.exam]) {
    return [];
  }

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
  const completedToday = state.completedTasks[todayKey()] || [];
  let completedCount = 0;

  if (!tasks.length) {
    const empty = createElement(
      "p",
      "请先点击右上角“设置”，选择你的考试类型。",
      "muted"
    );
    list.appendChild(empty);
    $("task-progress").textContent = "0/0";
    return;
  }

  tasks.forEach((task) => {
    const completed = completedToday.includes(task.id);

    if (completed) {
      completedCount++;
    }

    const item = createElement(
      "div",
      undefined,
      `task-item${completed ? " completed" : ""}`
    );

    const icon = createElement(
      "span",
      completed ? "✓" : "✦",
      "task-icon"
    );

    const info = createElement("div", undefined, "task-info");
    info.appendChild(createElement("strong", task.title));
    info.appendChild(
      createElement(
        "small",
        `${task.duration} · 完成后获得 ${task.reward} 香火值`
      )
    );

    const button = createElement(
      "button",
      completed ? "已完成" : "完成任务",
      `button ${completed ? "button-secondary" : "button-primary"}`
    );

    button.disabled = completed;
    button.addEventListener("click", () => completeTask(task));

    item.append(icon, info, button);
    list.appendChild(item);
  });

  $("task-progress").textContent = `${completedCount}/${tasks.length}`;
}

function completeTask(task) {
  const key = todayKey();

  if (!state.completedTasks[key]) {
    state.completedTasks[key] = [];
  }

  if (state.completedTasks[key].includes(task.id)) {
    return;
  }

  state.completedTasks[key].push(task.id);
  state.points += task.reward;
  state.incense += 1;

  updateStreak();

  saveState();
  renderAll();

  showToast(`任务完成，获得 ${task.reward} 香火值和 1 炷香`);
}

function updateStreak() {
  const today = todayKey();

  if (state.lastStudyDate === today) {
    return;
  }

  if (!state.lastStudyDate) {
    state.streak = 1;
  } else {
    const previous = new Date(`${state.lastStudyDate}T00:00:00`);
    const current = new Date(`${today}T00:00:00`);
    const days = Math.round((current - previous) / 86400000);

    state.streak = days === 1 ? state.streak + 1 : 1;
  }

  state.lastStudyDate = today;

  if (state.streak === 3) {
    claimReward("streak-3", "连续学习 3 天徽章");
  }

  if (state.streak === 7) {
    claimReward("streak-7", "连续学习 7 天资料兑换资格");
  }
}

function claimReward(key, title) {
  if (state.rewards.some((reward) => reward.key === key)) {
    return false;
  }

  state.rewards.push({
    key,
    title,
    date: todayKey()
  });

  return true;
}

function renderGods() {
  const list = $("gods-list");
  list.replaceChildren();

  GODS.forEach((god, index) => {
    const card = createElement("article", undefined, "god-card");

    card.style.setProperty(
      "--god-color",
      [
        "rgba(255, 214, 165, .16)",
        "rgba(160, 196, 255, .16)",
        "rgba(202, 255, 191, .14)",
        "rgba(255, 198, 255, .14)"
      ][index]
    );

    card.style.setProperty(
      "--god-avatar",
      [
        "#ffd6a5",
        "#a0c4ff",
        "#caffbf",
        "#ffc6ff"
      ][index]
    );

    const avatar = createElement("div", god.icon, "god-avatar");
    const title = createElement("h3", god.name);
    const focus = createElement("small", `专注：${god.focus}`, "muted");
    const desc = createElement("p", god.description);

    const button = createElement(
      "button",
      state.selectedGod === god.id ? "当前导师" : "选择导师",
      `button ${state.selectedGod === god.id ? "button-secondary" : "button-primary"}`
    );

    button.addEventListener("click", () => {
      state.selectedGod = god.id;
      saveState();
      renderGods();
      $("daily-tip").textContent = god.advice;
      showToast(`已选择${god.name}`);
    });

    card.append(avatar, title, focus, desc, button);
    list.appendChild(card);
  });
}

function renderDailyTip() {
  const god = GODS.find((item) => item.id === state.selectedGod);
  $("daily-tip").textContent =
    god ? god.advice : TIPS[new Date().getDate() % TIPS.length];
}

function renderRecords() {
  const list = $("study-records");
  list.replaceChildren();

  if (!state.records.length) {
    list.appendChild(
      createElement("p", "还没有学习记录，完成学习后记下来吧。", "muted")
    );
    return;
  }

  state.records.slice(0, 5).forEach((record) => {
    const item = createElement("div", undefined, "record-item");
    item.appendChild(createElement("strong", record.content));
    item.appendChild(
      createElement("small", `${record.date} · ${record.minutes} 分钟`)
    );
    list.appendChild(item);
  });
}

function saveStudyRecord(event) {
  event.preventDefault();

  const minutes = Number($("study-duration").value);
  const content = $("study-content").value.trim();

  if (!Number.isFinite(minutes) || minutes < 1 || !content) {
    showToast("请填写有效的学习时长和内容");
    return;
  }

  state.records.unshift({
    id: Date.now(),
    date: todayKey(),
    minutes,
    content
  });

  state.records = state.records.slice(0, 100);
  state.studyMinutes += minutes;
  updateStreak();

  saveState();
  renderAll();

  $("study-form").reset();
  showToast("学习记录已保存");
}

function openSettings() {
  const wrapper = document.createElement("div");

  wrapper.appendChild(createElement("h2", "设置你的备考计划"));

  const form = createElement("form", undefined, "modal-form");

  const examLabel = createElement("label", "考试类型");
  const examSelect = document.createElement("select");
  examSelect.id = "setting-exam";
  examSelect.required = true;

  [
    ["", "请选择考试"],
    ["IELTS", "IELTS"],
    ["TOEFL", "TOEFL"],
    ["AP", "AP"],
    ["IB", "IB"]
  ].forEach(([value, text]) => {
    const option = createElement("option", text);
    option.value = value;
    examSelect.appendChild(option);
  });

  examSelect.value = state.exam;
  examLabel.appendChild(examSelect);

  const targetLabel = createElement("label", "目标分数 / 科目");
  const targetInput = document.createElement("input");
  targetInput.id = "setting-target";
  targetInput.type = "text";
  targetInput.maxLength = 30;
  targetInput.placeholder = "例如：IELTS 7.0";
  targetInput.value = state.target;
  targetLabel.appendChild(targetInput);

  const dateLabel = createElement("label", "考试日期");
  const dateInput = document.createElement("input");
  dateInput.id = "setting-date";
  dateInput.type = "date";
  dateInput.value = escapeDate(state.examDate);
  dateLabel.appendChild(dateInput);

  const minutesLabel = createElement("label", "每日学习时长");
  const minutesInput = document.createElement("input");
  minutesInput.id = "setting-minutes";
  minutesInput.type = "number";
  minutesInput.min = "10";
  minutesInput.max = "600";
  minutesInput.value = state.dailyMinutes;
  minutesLabel.appendChild(minutesInput);

  const submit = createElement(
    "button",
    "保存并生成我的任务",
    "button button-primary"
  );
  submit.type = "submit";

  form.append(examLabel, targetLabel, dateLabel, minutesLabel, submit);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    state.exam = examSelect.value;
    state.target = targetInput.value.trim();
    state.examDate = dateInput.value;
    state.dailyMinutes = Math.max(
      10,
      Math.min(600, Number(minutesInput.value) || 30)
    );

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
  wrapper.appendChild(createElement("h2", "错题记录"));

  const form = createElement("form", undefined, "modal-form");

  const subject = document.createElement("input");
  subject.placeholder = "科目，例如：Reading";
  subject.maxLength = 30;
  subject.required = true;

  const question = document.createElement("textarea");
  question.placeholder = "题目或知识点";
  question.maxLength = 500;
  question.required = true;

  const answer = document.createElement("textarea");
  answer.placeholder = "正确答案 / 解析";
  answer.maxLength = 500;
  answer.required = true;

  const submit = createElement("button", "保存错题", "button button-primary");
  submit.type = "submit";

  form.append(subject, question, answer, submit);

  const list = createElement("div");

  state.mistakes.slice(0, 10).forEach((mistake) => {
    const item = createElement("div", undefined, "mistake-item");
    item.appendChild(createElement("strong", mistake.subject));
    item.appendChild(createElement("small", mistake.question));
    item.appendChild(createElement("small", `解析：${mistake.answer}`));
    list.appendChild(item);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    state.mistakes.unshift({
      id: Date.now(),
      subject: subject.value.trim(),
      question: question.value.trim(),
      answer: answer.value.trim()
    });

    saveState();
    $("mistake-count").textContent = state.mistakes.length;
    closeModal();
    showToast("错题已保存");
  });

  wrapper.append(form, list);
  openModal(wrapper);
}

function openRewards() {
  const wrapper = document.createElement("div");
  wrapper.appendChild(createElement("h2", "成长奖励"));

  if (!state.rewards.length) {
    wrapper.appendChild(
      createElement(
        "p",
        "连续学习 3 天可获得第一个成长徽章。",
        "muted"
      )
    );
  } else {
    state.rewards.forEach((reward) => {
      const item = createElement("div", undefined, "reward-item");
      item.appendChild(createElement("strong", `✦ ${reward.title}`));
      item.appendChild(createElement("small", `获得日期：${reward.date}`));
      wrapper.appendChild(item);
    });
  }

  const note = createElement(
    "p",
    "未来可以使用香火值兑换学习资料和个人装饰。",
    "muted"
  );

  wrapper.appendChild(note);
  openModal(wrapper);
}

function init() {
  $("study-form").addEventListener("submit", saveStudyRecord);
  $("open-settings").addEventListener("click", openSettings);
  $("mobile-settings").addEventListener("click", openSettings);
  $("open-mistakes").addEventListener("click", openMistakes);
  $("open-rewards").addEventListener("click", openRewards);
  $("close-modal").addEventListener("click", closeModal);

  $("modal-backdrop").addEventListener("click", (event) => {
    if (event.target.id === "modal-backdrop") {
      closeModal();
    }
  });

  $("hero-action").addEventListener("click", () => {
    if (!state.exam) {
      openSettings();
    } else {
      $("tasks-section").scrollIntoView({ behavior: "smooth" });
    }
  });

  $("mistake-count").textContent = state.mistakes.length;

  renderAll();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
```
