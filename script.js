const firebaseConfig = {
  apiKey: "AIzaSyCAFnj-TYPPoNE2NVmOmo3HbWusG6YrKPw",
  authDomain: "hakka-in-hailu.firebaseapp.com",
  projectId: "hakka-in-hailu",
  storageBucket: "hakka-in-hailu.firebasestorage.app",
  messagingSenderId: "916653002850",
  appId: "1:916653002850:web:f703fbd53f1d43fa43413b",
  measurementId: "G-001MV6H4DW",
  databaseURL: "https://hakka-in-hailu-default-rtdb.firebaseio.com/"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const questions = [
  { question: "ㄅ", options: ["b", "p", "br"], answer: "b" },
  { question: "ㄇ", options: ["n", "d", "m"], answer: "m" },
  { question: "ㄠ", options: ["ai", "ae", "au"], answer: "au" },
  { question: "ㄓ", options: ["z", "zh", "ch"], answer: "zh" },
  { question: "ㄉ", options: ["d", "t", "drr"], answer: "d" }
];

let current = 0;
let score = 0;
let playerName = prompt("請輸入你的名字：") || "訪客";

const questionText = document.getElementById("question-text");
const optionsBox = document.getElementById("options");
const feedbackBox = document.getElementById("feedback");
const nextBtn = document.getElementById("next-btn");
const progress = document.getElementById("current");
const correctSound = document.getElementById("correct-sound");
const wrongSound = document.getElementById("wrong-sound");

function loadQuestion(index) {
  let q = questions[index];
  questionText.textContent = `請選出「${q.question}」對應的拼音`;
  optionsBox.innerHTML = "";
  feedbackBox.textContent = "";
  nextBtn.style.display = "none";

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => checkAnswer(opt, q.answer);
    optionsBox.appendChild(btn);
  });

  progress.textContent = index + 1;
}

function checkAnswer(choice, answer) {
  const buttons = optionsBox.querySelectorAll("button");
  buttons.forEach(btn => (btn.disabled = true));

  if (choice === answer) {
    feedbackBox.textContent = "🎉 太棒了！你答對了！";
    feedbackBox.style.color = "green";
    score++;
    correctSound.play();
  } else {
    feedbackBox.textContent = "😢 再接再厲，你可以的！";
    feedbackBox.style.color = "red";
    wrongSound.play();
  }

  nextBtn.style.display = "inline-block";
}

nextBtn.onclick = () => {
  current++;
  if (current < questions.length) {
    loadQuestion(current);
  } else {
    let percent = Math.round((score / questions.length) * 100);
    feedbackBox.innerHTML = `🎊 完成第一關！你的得分是 ${score}/5（${percent}%）`;
    nextBtn.style.display = "none";

    db.ref(`players/${playerName}/level1`).set({
      score: score,
      percent: percent,
      time: new Date().toISOString()
    });
  }
};

loadQuestion(current);
const firebaseConfig = {
  apiKey: "AIzaSyCAFnj-TYPPoNE2NVmOmo3HbWusG6YrKPw",
  authDomain: "hakka-in-hailu.firebaseapp.com",
  databaseURL: "https://hakka-in-hailu-default-rtdb.firebaseio.com/",
  projectId: "hakka-in-hailu",
  storageBucket: "hakka-in-hailu.appspot.com",
  messagingSenderId: "916653002850",
  appId: "1:916653002850:web:f703fbd53f1d43fa43413b",
  measurementId: "G-001MV6H4DW"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let dragged;

document.querySelectorAll(".draggable").forEach(elem => {
  elem.addEventListener("dragstart", e => {
    dragged = e.target;
  });
});

document.querySelectorAll(".droppable").forEach(drop => {
  drop.addEventListener("dragover", e => {
    e.preventDefault();
  });

  drop.addEventListener("drop", e => {
    e.preventDefault();
    if (!drop.querySelector(".draggable")) {
      drop.appendChild(dragged);
    }
  });
});

document.getElementById("submit-btn").addEventListener("click", () => {
  const drops = document.querySelectorAll(".droppable");
  let score = 0;

  drops.forEach(drop => {
    const answer = drop.getAttribute("data-answer");
    const draggedItem = drop.querySelector(".draggable");
    if (draggedItem && draggedItem.textContent.trim() === answer) {
      drop.classList.add("correct");
      score++;
    } else {
      drop.classList.add("incorrect");
    }
  });

  const feedback = document.getElementById("feedback");
  const playerName = prompt("請輸入你的名字：") || "訪客";
  const percent = Math.round((score / drops.length) * 100);

  if (score === drops.length) {
    feedback.innerHTML = `🎉 完美配對！你真厲害！ (${score}/${drops.length})`;
  } else if (score >= drops.length / 2) {
    feedback.innerHTML = `👍 還不錯唷，再加油！ (${score}/${drops.length})`;
  } else {
    feedback.innerHTML = `😢 沒關係，再試試看！ (${score}/${drops.length})`;
  }

  // 寫入 Firebase
  db.ref(`players/${playerName}/level2`).set({
    score: score,
    total: drops.length,
    percent: percent,
    time: new Date().toISOString()
  });
});
