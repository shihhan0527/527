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