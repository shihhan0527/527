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

// 第一關的元素
const questionText = document.getElementById("question-text");
const optionsBox = document.getElementById("options");
const feedbackBox = document.getElementById("feedback"); // 第一關的 feedback
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

// 隨機打亂陣列的函數
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 初始化第二關
function initLevel2() {
  const terms = Array.from(document.querySelectorAll('.draggable'));
  const dragContainer = document.querySelector('.drag-container');
  const drops = Array.from(document.querySelectorAll('.droppable'));

  // 第二關的元素
  const level2Instruction = document.getElementById("level2-instruction");
  const feedbackLevel2 = document.getElementById("level2-feedback");
  const level2CurrentMatches = document.getElementById("level2-current-matches");
  const level2TotalTerms = document.getElementById("level2-total-terms");

  // 初始化時顯示說明文字
  level2Instruction.style.display = 'block';
  feedbackLevel2.style.display = 'none'; // 隱藏 feedback
  level2TotalTerms.textContent = terms.length; // 設定總題目數量

  // 打亂 draggable 順序
  const shuffledTerms = shuffle(terms);
  dragContainer.innerHTML = '';
  shuffledTerms.forEach(term => dragContainer.appendChild(term));

  let selectedTerm = null;
  let matchedCount = 0; // 新增已配對計數

  // 更新進度條的函數
  const updateLevel2Progress = () => {
    level2CurrentMatches.textContent = matchedCount;
  };

  // 點擊題目
  terms.forEach(term => {
    term.removeEventListener('click', handleTermClick); // 移除舊的事件監聽器
    term.addEventListener('click', handleTermClick);
  });

  function handleTermClick() {
    level2Instruction.style.display = 'none'; // 隱藏說明文字
    feedbackLevel2.style.display = 'block'; // 顯示 feedback
    // 取消所有題目的選取狀態
    terms.forEach(t => t.classList.remove('selected'));
    // 設定目前選取
    selectedTerm = this;
    selectedTerm.classList.add('selected');
    feedbackLevel2.textContent = ''; // 清除提示訊息
  }

  // 點擊答案
  drops.forEach(drop => {
    drop.removeEventListener('click', handleDropClick); // 移除舊的事件監聽器
    drop.addEventListener('click', handleDropClick);
  });

  function handleDropClick() {
    level2Instruction.style.display = 'none'; // 隱藏說明文字
    feedbackLevel2.style.display = 'block'; // 顯示 feedback

    if (!selectedTerm) {
      feedbackLevel2.textContent = '請先選擇一個客語詞語！';
      feedbackLevel2.style.color = 'orange';
      return;
    }

    const answer = this.getAttribute('data-answer');
    if (selectedTerm.textContent.trim() === answer) {
      this.classList.add('correct');
      selectedTerm.classList.add('matched');
      selectedTerm.style.pointerEvents = 'none';
      this.style.pointerEvents = 'none';
      selectedTerm.classList.remove('selected');
      selectedTerm = null;
      feedbackLevel2.textContent = '配對成功！當慶(很厲害!)🎉';
      feedbackLevel2.style.color = 'green';
      matchedCount++; // 增加已配對計數
      updateLevel2Progress(); // 更新進度條

      // 檢查是否所有都已配對
      const allMatched = terms.every(term => term.classList.contains('matched'));
      if (allMatched) {
        feedbackLevel2.innerHTML = '恭喜你！第二關全部配對成功！做得當好🎊';
        db.ref(`players/${playerName}/level2`).set({
            time: new Date().toISOString(),
            status: "completed"
        });
      }

    } else {
      this.classList.add('incorrect');
      feedbackLevel2.textContent = '你答錯了！還可惜喔!😢';
      feedbackLevel2.style.color = 'red';
      setTimeout(() => {
        this.classList.remove('incorrect');
        feedbackLevel2.textContent = '';
      }, 1000);
    }
  }

  updateLevel2Progress(); // 初始化進度條
}

// 確保在 DOM 完全加載後才執行 initLevel2
document.addEventListener('DOMContentLoaded', () => {
    // 檢查是否存在第二關的元素，避免第一關頁面載入時報錯
    if (document.querySelector('.drag-container') && document.querySelector('.drop-container')) {
        initLevel2();
    }
});
// ... (您現有的第一關和第二關的 JavaScript 程式碼) ...

// 第三關的題目資料
const questionsLevel3 = [
  {
    audio: '客語第三關音檔/HA-01-002s.mp3',
    questionText: '佢正噭啊過，所以目珠看起來仰般？',
    options: ['紅紅', '黃黃', '矇矇'],
    answer: '紅紅',
    correctChinese: '紅紅' // 第一題正確答案為紅紅
  },
  {
    audio: '客語第三關音檔/HA-01-003s.mp3',
    questionText: '麼个天時最有可能會做（發）大水？',
    options: ['出日頭', '發風搓', '落水毛仔'],
    answer: '發風搓', // 第二題正確答案為發風搓
    correctChinese: '刮颱風'
  },
  {
    audio: '客語第三關音檔/HA-01-004s.mp3',
    questionText: '空氣毋好，在外背最好愛戴麼个？',
    options: ['禁指', '時錶', '封嘴仔'],
    answer: '封嘴仔', // 第三題正確答案為封嘴仔
    correctChinese: '口罩'
  },
  {
    audio: '客語第三關音檔/HA-01-005s.mp3',
    questionText: '佢著个衫褲長長短短，還生趣哦！出門去可能會仰般？',
    options: ['分人笑', '分人笑', '分人罵'], // 注意：這裡題目給的選項有重複，實際應用時請確保選項唯一且只有一個正確答案
    answer: '分人笑', // 第四題正確答案為分人笑
    correctChinese: '被人笑'
  },
  {
    audio: '客語第三關音檔/HA-01-007s.mp3',
    questionText: '阿德牯歸日仔食飽尞、尞飽食，麼个就毋肯做。意思係講佢仰般﹖',
    options: ['當懶尸', '當儘採', '當生趣'],
    answer: '當懶尸', // 第五題正確答案為當懶尸
    correctChinese: '很懶惰'
  }
];

let currentLevel3 = 0;
let scoreLevel3 = 0;

// 第三關的 DOM 元素
const questionAudio = document.getElementById("question-audio");
const playAudioBtn = document.getElementById("play-audio-btn");
const questionTextLevel3 = document.getElementById("question-text-level3");
const optionsLevel3Box = document.getElementById("options-level3");
const revealOptionsBtn = document.getElementById("reveal-options-btn");
const feedbackLevel3 = document.getElementById("feedback-level3");
const currentLevel3Span = document.getElementById("current-level3");
const nextBtnLevel3 = document.getElementById("next-btn-level3");
const correctSoundLevel3 = document.getElementById("correct-sound-level3");
const wrongSoundLevel3 = document.getElementById("wrong-sound-level3");

// 載入第三關題目
function loadQuestionLevel3(index) {
  if (!questionAudio || !playAudioBtn || !questionTextLevel3 || !optionsLevel3Box || !revealOptionsBtn || !feedbackLevel3 || !currentLevel3Span || !nextBtnLevel3 || !correctSoundLevel3 || !wrongSoundLevel3) {
    console.warn("第三關的部分 DOM 元素未找到，可能不在當前頁面。");
    return; // 如果元素不存在，則不執行後續邏輯
  }

  let q = questionsLevel3[index];
  questionAudio.src = q.audio;
  questionTextLevel3.textContent = q.questionText;
  questionTextLevel3.classList.remove('visible-text'); // 隱藏題目文字
  questionTextLevel3.classList.add('hidden-text');
  optionsLevel3Box.innerHTML = ""; // 清空舊選項
  feedbackLevel3.textContent = "請先播放音檔。";
  feedbackLevel3.style.color = "#00796b";
  nextBtnLevel3.style.display = "none";
  revealOptionsBtn.style.display = "none"; // 預設隱藏顯示詞彙按鈕
  playAudioBtn.classList.remove('playing'); // 移除播放中狀態

  // 初始化選項按鈕
  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = "點擊顯示"; // 預設顯示"點擊顯示"
    btn.setAttribute("data-original-text", opt); // 儲存原始詞彙
    btn.onclick = () => checkAnswerLevel3(opt, q.answer, q.correctChinese, btn); // 傳遞 correctChinese
    btn.disabled = true; // 預設禁用選項按鈕
    optionsLevel3Box.appendChild(btn);
  });

  currentLevel3Span.textContent = index + 1;
}

// 播放音檔功能
playAudioBtn.onclick = () => {
  questionAudio.play();
  playAudioBtn.classList.add('playing'); // 標示播放中狀態
  feedbackLevel3.textContent = "音檔播放中...";
  feedbackLevel3.style.color = "#00796b";

  questionAudio.onended = () => {
    playAudioBtn.classList.remove('playing'); // 移除播放中狀態
    feedbackLevel3.textContent = "音檔播放完畢，請等待顯示詞彙。";
    feedbackLevel3.style.color = "#00796b";

    // 等待5秒後顯示「顯示客語詞彙」按鈕
    setTimeout(() => {
      revealOptionsBtn.style.display = "inline-block";
      feedbackLevel3.textContent = "點擊「顯示客語詞彙」按鈕。";
      feedbackLevel3.style.color = "#00796b";
    }, 5000);
  };
};

// 顯示客語詞彙功能
revealOptionsBtn.onclick = () => {
  questionTextLevel3.classList.remove('hidden-text'); // 顯示題目文字
  questionTextLevel3.classList.add('visible-text');
  revealOptionsBtn.style.display = "none"; // 隱藏顯示詞彙按鈕
  feedbackLevel3.textContent = "請選擇正確的客語詞彙。";
  feedbackLevel3.style.color = "#00796b";

  // 啟用選項按鈕並顯示原始詞彙
  const optionButtons = optionsLevel3Box.querySelectorAll("button");
  optionButtons.forEach(btn => {
    btn.disabled = false;
    btn.textContent = btn.getAttribute("data-original-text");
  });
};


// 檢查答案
function checkAnswerLevel3(choice, answer, correctChinese, clickedButton) {
  const buttons = optionsLevel3Box.querySelectorAll("button");
  buttons.forEach(btn => (btn.disabled = true)); // 禁用所有選項

  if (choice === answer) {
    feedbackLevel3.textContent = `🎉 太棒了！你答對了！`;
    feedbackLevel3.style.color = "green";
    scoreLevel3++;
    correctSoundLevel3.play();
    clickedButton.classList.add('correct-answer');

    // 顯示中文詞語
    const chineseMeaning = document.createElement('div');
    chineseMeaning.textContent = `(${correctChinese})`;
    chineseMeaning.style.fontSize = "0.9em";
    chineseMeaning.style.marginTop = "5px";
    chineseMeaning.style.color = "#388e3c"; // 深綠色
    clickedButton.appendChild(chineseMeaning);

  } else {
    feedbackLevel3.innerHTML = `😢 再接再厲，你可以的！正確答案是「${answer}」`;
    feedbackLevel3.style.color = "red";
    wrongSoundLevel3.play();
    clickedButton.classList.add('wrong-answer');
    
    // 找出正確答案並標記
    buttons.forEach(btn => {
      if (btn.getAttribute("data-original-text") === answer) {
        btn.classList.add('correct-answer');
        // 在正確答案按鈕下方顯示中文詞語
        const chineseMeaning = document.createElement('div');
        chineseMeaning.textContent = `(${correctChinese})`;
        chineseMeaning.style.fontSize = "0.9em";
        chineseMeaning.style.marginTop = "5px";
        chineseMeaning.style.color = "#388e3c"; // 深綠色
        btn.appendChild(chineseMeaning);
      }
    });
  }

  nextBtnLevel3.style.display = "inline-block"; // 顯示下一題按鈕
}

// 下一題
nextBtnLevel3.onclick = () => {
  currentLevel3++;
  if (currentLevel3 < questionsLevel3.length) {
    loadQuestionLevel3(currentLevel3);
  } else {
    let percent = Math.round((scoreLevel3 / questionsLevel3.length) * 100);
    feedbackLevel3.innerHTML = `🎊 完成第三關！你的得分是 ${scoreLevel3}/5（${percent}%）`;
    feedbackLevel3.style.color = "#00796b";
    nextBtnLevel3.style.display = "none";

    // 將第三關分數存入 Firebase
    db.ref(`players/${playerName}/level3`).set({
      score: scoreLevel3,
      percent: percent,
      time: new Date().toISOString()
    });
  }
};

// 頁面載入時初始化第三關（僅當第三關元素存在時）
document.addEventListener('DOMContentLoaded', () => {
    // 檢查第三關的容器是否存在
    if (document.getElementById('game-container-level3')) {
        loadQuestionLevel3(currentLevel3);
    }
});