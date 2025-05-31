// Firebase 配置 (來自 script.js)
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

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

let playerName = "訪客"; // 預設玩家名稱，會由輸入框更新
let currentLevel = 0; // 0: 玩家輸入, 1: 第一關, 2: 第二關, 3: 第三關, 4: 遊戲結束

// --- DOM 元素集中管理 ---
const playerNameContainer = document.getElementById('player-name-container');
const playerNameInput = document.getElementById('player-name-input');
const startGameBtn = document.getElementById('start-game-btn');
const level1Container = document.getElementById('level1-container');
const level2Container = document.getElementById('level2-container');
const level3Container = document.getElementById('level3-container');
const gameOverContainer = document.getElementById('game-over-container');
const finalScoreMessage = document.getElementById('final-score-message');
const restartGameBtn = document.getElementById('restart-game-btn');

// 第一關元素
const questionTextLevel1 = document.getElementById("question-text");
const optionsBoxLevel1 = document.getElementById("options");
const feedbackBoxLevel1 = document.getElementById("feedback");
const nextBtnLevel1 = document.getElementById("next-btn-level1");
const progressLevel1 = document.getElementById("current");

// 第二關元素
const level2Instruction = document.getElementById("level2-instruction");
const feedbackLevel2 = document.getElementById("level2-feedback");
const level2CurrentMatches = document.getElementById("level2-current-matches");
const level2TotalTerms = document.getElementById("level2-total-terms");
const dragContainerLevel2 = document.querySelector('.drag-container');
const dropContainerLevel2 = document.querySelector('.drop-container');


// 第三關元素
const questionAudio = document.getElementById("question-audio");
const playAudioBtn = document.getElementById("play-audio-btn");
const questionTextLevel3 = document.getElementById("question-text-level3");
const optionsLevel3Box = document.getElementById("options-level3");
const revealOptionsBtn = document.getElementById("reveal-options-btn");
const feedbackLevel3 = document.getElementById("feedback-level3");
const currentLevel3Span = document.getElementById("current-level3");
const nextBtnLevel3 = document.getElementById("next-btn-level3");

// 全局音效 (所有關卡共用)
const correctSound = document.getElementById("correct-sound");
const wrongSound = document.getElementById("wrong-sound");

// --- 關卡數據 ---

// 第一關題目 (來自 script1.js)
const questionsLevel1 = [
  { question: "ㄅ", options: ["b", "p", "br"], answer: "b" },
  { question: "ㄇ", options: ["n", "d", "m"], answer: "m" },
  { question: "ㄠ", options: ["ai", "ae", "au"], answer: "au" },
  { question: "ㄓ", options: ["z", "zh", "ch"], answer: "zh" },
  { question: "ㄉ", options: ["d", "t", "drr"], answer: "d" }
];
let currentQLevel1 = 0;
let scoreLevel1 = 0;

// 第二關題目 (根據您的 HTML 內容來定義，因為 script2.js 是動態生成)
const level2Pairs = [
    { term: "恁早", answer: "早安" },
    { term: "敗勢", answer: "對不起" },
    { term: "朝晨頭", answer: "早上" },
    { term: "暗晡", answer: "晚上" },
    { term: "當晝", answer: "中午" },
    { term: "食飽吂", answer: "吃飽了嗎" },
    { term: "有閒來寮", answer: "有空再來" },
    { term: "承蒙你", answer: "謝謝" },
 
];
let matchedCountLevel2 = 0;

// 第三關題目 (來自 script3.js)
const questionsLevel3 = [
  {
    audio: '客語第三關音檔/HA-01-002s.mp3',
    questionText: '佢正噭啊過，所以目珠看起來仰般？',
    options: ['紅紅', '黃黃', '矇矇'],
    answer: '紅紅',
    correctChinese: '紅紅'
  },
  {
    audio: '客語第三關音檔/HA-01-003s.mp3',
    questionText: '麼个天時最有可能會做（發）大水？',
    options: ['出日頭', '發風搓', '落水毛仔'],
    answer: '發風搓',
    correctChinese: '刮颱風'
  },
  {
    audio: '客語第三關音檔/HA-01-004s.mp3',
    questionText: '空氣毋好，在外背最好愛戴麼个？',
    options: ['禁指', '時錶', '封嘴仔'],
    answer: '封嘴仔',
    correctChinese: '口罩'
  },
  {
    audio: '客語第三關音檔/HA-01-005s.mp3',
    questionText: '佢著个衫褲長長短短，還生趣哦！出門去可能會仰般？',
    options: ['分人笑', '分人笑', '分人罵'], // 注意：這裡題目給的選項有重複，假設第一個為正確答案
    answer: '分人笑',
    correctChinese: '被人笑'
  },
  {
    audio: '客語第三關音檔/HA-01-007s.mp3',
    questionText: '阿德牯歸日仔食飽尞、尞飽食，麼个就毋肯做。意思係講佢仰般﹖',
    options: ['當懶尸', '當儘採', '當生趣'],
    answer: '當懶尸',
    correctChinese: '很懶惰'
  }
];
let currentQLevel3 = 0;
let scoreLevel3 = 0;

// --- 關卡管理函數 ---
function showLevel(level) {
  // 隱藏所有關卡容器
  document.querySelectorAll('.game-level').forEach(container => {
    container.style.display = 'none';
  });

  // 顯示目標關卡容器
  if (level === 0) {
    playerNameContainer.style.display = 'block';
  } else if (level === 1) {
    level1Container.style.display = 'block';
    loadQuestionLevel1(currentQLevel1); // 載入第一關
  } else if (level === 2) {
    level2Container.style.display = 'block';
    initLevel2(); // 初始化第二關
  } else if (level === 3) {
    level3Container.style.display = 'block';
    loadQuestionLevel3(currentQLevel3); // 載入第三關
  } else if (level === 4) {
    gameOverContainer.style.display = 'block';
    displayFinalScore(); // 顯示最終分數
  }
}

// --- 玩家名稱和遊戲開始 ---
startGameBtn.onclick = () => {
  const name = playerNameInput.value.trim();
  if (name) {
    playerName = name;
    showLevel(1); // 開始第一關
  } else {
    alert("請輸入你的名字！");
  }
};

restartGameBtn.onclick = () => {
    // 重置所有關卡狀態
    currentQLevel1 = 0;
    scoreLevel1 = 0;
    matchedCountLevel2 = 0;
    currentQLevel3 = 0;
    scoreLevel3 = 0;
    playerName = "訪客"; // 重置玩家名稱

    // 重新顯示玩家名稱輸入
    playerNameInput.value = '';
    showLevel(0);
};


// --- 第一關邏輯 (來自 script1.js，並修正 nextBtn ID) ---
function loadQuestionLevel1(index) {
  let q = questionsLevel1[index];
  questionTextLevel1.textContent = `請選出「${q.question}」對應的拼音`;
  optionsBoxLevel1.innerHTML = "";
  feedbackBoxLevel1.textContent = "";
  nextBtnLevel1.style.display = "none";

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => checkAnswerLevel1(opt, q.answer);
    optionsBoxLevel1.appendChild(btn);
  });

  progressLevel1.textContent = index + 1;
}

function checkAnswerLevel1(choice, answer) {
  const buttons = optionsBoxLevel1.querySelectorAll("button");
  buttons.forEach(btn => (btn.disabled = true));

  if (choice === answer) {
    feedbackBoxLevel1.textContent = "🎉 太棒了！你答對了！";
    feedbackBoxLevel1.style.color = "green";
    scoreLevel1++;
    correctSound.play();
  } else {
    feedbackBoxLevel1.textContent = "😢 再接再厲，你可以的！";
    feedbackBoxLevel1.style.color = "red";
    wrongSound.play();
  }

  nextBtnLevel1.style.display = "inline-block";
}

nextBtnLevel1.onclick = () => {
  currentQLevel1++;
  if (currentQLevel1 < questionsLevel1.length) {
    loadQuestionLevel1(currentQLevel1);
  } else {
    let percent = Math.round((scoreLevel1 / questionsLevel1.length) * 100);
    feedbackBoxLevel1.innerHTML = `🎊 完成第一關！你的得分是 ${scoreLevel1}/5（${percent}%）`;
    feedbackBoxLevel1.style.color = "#00796b"; // 統一風格
    nextBtnLevel1.style.display = "none";

    db.ref(`players/${playerName}/level1`).set({
      score: scoreLevel1,
      percent: percent,
      time: new Date().toISOString()
    });
    // 跳轉到第二關
    setTimeout(() => {
        showLevel(2);
    }, 2000); // 稍作延遲以便玩家看清楚成績
  }
};


// --- 第二關邏輯 (來自 script2.js，並修正 DOM 元素獲取和進度更新) ---
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function initLevel2() {
  dragContainerLevel2.innerHTML = ''; // 清空舊內容
  dropContainerLevel2.innerHTML = ''; // 清空舊內容

  level2Instruction.style.display = 'block';
  feedbackLevel2.style.display = 'none';
  matchedCountLevel2 = 0; // 重置第二關計數
  level2TotalTerms.textContent = level2Pairs.length; // 更新總數

  const termsToShuffle = [];
  const dropsToShuffle = [];

  level2Pairs.forEach(pair => {
    // 創建 draggable element
    const termDiv = document.createElement('div');
    termDiv.classList.add('draggable');
    termDiv.textContent = pair.term;
    termDiv.setAttribute('data-term', pair.term); // 用於識別
    termsToShuffle.push(termDiv);

    // 創建 droppable element
    const dropDiv = document.createElement('div');
    dropDiv.classList.add('droppable');
    dropDiv.textContent = pair.answer;
    dropDiv.setAttribute('data-answer', pair.term); // 答案是客語詞彙
    dropsToShuffle.push(dropDiv);
  });

  // 打亂 draggable 順序並添加到容器
  const shuffledTerms = shuffle(termsToShuffle);
  shuffledTerms.forEach(term => dragContainerLevel2.appendChild(term));

  // 打亂 droppable 順序並添加到容器
  const shuffledDrops = shuffle(dropsToShuffle);
  shuffledDrops.forEach(drop => dropContainerLevel2.appendChild(drop));

  let selectedTerm = null;

  // 點擊題目
  dragContainerLevel2.querySelectorAll('.draggable').forEach(term => {
    term.addEventListener('click', handleTermClickLevel2);
  });

  function handleTermClickLevel2() {
    level2Instruction.style.display = 'none';
    feedbackLevel2.style.display = 'block';
    dragContainerLevel2.querySelectorAll('.draggable').forEach(t => t.classList.remove('selected'));
    selectedTerm = this;
    selectedTerm.classList.add('selected');
    feedbackLevel2.textContent = '';
  }

  // 點擊答案
  dropContainerLevel2.querySelectorAll('.droppable').forEach(drop => {
    drop.addEventListener('click', handleDropClickLevel2);
  });

  function handleDropClickLevel2() {
    level2Instruction.style.display = 'none';
    feedbackLevel2.style.display = 'block';

    if (!selectedTerm) {
      feedbackLevel2.textContent = '請先選擇一個客語詞語！';
      feedbackLevel2.style.color = 'orange';
      return;
    }

    const answer = this.getAttribute('data-answer'); // 答案是客語詞彙
    if (selectedTerm.textContent.trim() === answer) {
      this.classList.add('correct');
      selectedTerm.classList.add('matched');
      selectedTerm.style.pointerEvents = 'none';
      this.style.pointerEvents = 'none';
      selectedTerm.classList.remove('selected');
      selectedTerm = null;
      feedbackLevel2.textContent = '配對成功！當慶(很厲害!)🎉';
      feedbackLevel2.style.color = 'green';
      matchedCountLevel2++;
      updateLevel2Progress();

      const allMatched = Array.from(dragContainerLevel2.querySelectorAll('.draggable')).every(term => term.classList.contains('matched'));
      if (allMatched) {
        feedbackLevel2.innerHTML = '恭喜你！第二關全部配對成功！做得當好🎊';
        // 儲存第二關完成狀態
        db.ref(`players/${playerName}/level2`).set({
            time: new Date().toISOString(),
            status: "completed"
        });
        // 跳轉到第三關
        setTimeout(() => {
            showLevel(3);
        }, 2000);
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

  const updateLevel2Progress = () => {
    level2CurrentMatches.textContent = matchedCountLevel2;
  };
  updateLevel2Progress(); // 初始化進度
}


// --- 第三關邏輯 (來自 script3.js) ---
function loadQuestionLevel3(index) {
  let q = questionsLevel3[index];
  questionAudio.src = q.audio;
  questionTextLevel3.textContent = q.questionText;
  questionTextLevel3.classList.remove('visible-text');
  questionTextLevel3.classList.add('hidden-text');
  optionsLevel3Box.innerHTML = "";
  feedbackLevel3.textContent = "請先播放音檔。";
  feedbackLevel3.style.color = "#00796b";
  nextBtnLevel3.style.display = "none";
  revealOptionsBtn.style.display = "none";
  playAudioBtn.classList.remove('playing');

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = "點擊顯示";
    btn.setAttribute("data-original-text", opt);
    btn.onclick = () => checkAnswerLevel3(opt, q.answer, q.correctChinese, btn);
    btn.disabled = true;
    optionsLevel3Box.appendChild(btn);
  });

  currentLevel3Span.textContent = index + 1;
}

// 在第三關的邏輯中
playAudioBtn.onclick = () => {
  questionAudio.play();
  playAudioBtn.classList.add('playing');
  feedbackLevel3.textContent = "音檔播放中...";
  feedbackLevel3.style.color = "#00796b";

  questionAudio.onended = () => {
    playAudioBtn.classList.remove('playing');
    // feedbackLevel3.textContent = "音檔播放完畢，請等待顯示詞彙。"; // 這行訊息現在可以省略或更改
    feedbackLevel3.textContent = "音檔播放完畢，請點擊「顯示客語詞彙」按鈕。"; // 新的提示

    // 直接顯示「顯示客語詞彙」按鈕，移除 5 秒延遲
    revealOptionsBtn.style.display = "inline-block";
    // 立即更新提示訊息
    feedbackLevel3.textContent = "點擊「顯示客語詞彙」按鈕。";
    feedbackLevel3.style.color = "#00796b";
  };
};

revealOptionsBtn.onclick = () => {
  questionTextLevel3.classList.remove('hidden-text');
  questionTextLevel3.classList.add('visible-text');
  revealOptionsBtn.style.display = "none";
  feedbackLevel3.textContent = "請選擇正確的客語詞彙。";
  feedbackLevel3.style.color = "#00796b";
  const optionButtons = optionsLevel3Box.querySelectorAll("button");
  optionButtons.forEach(btn => {
    btn.disabled = false;
    btn.textContent = btn.getAttribute("data-original-text");
  });
};

function checkAnswerLevel3(choice, answer, correctChinese, clickedButton) {
  const buttons = optionsLevel3Box.querySelectorAll("button");
  buttons.forEach(btn => (btn.disabled = true));

  if (choice === answer) {
    feedbackLevel3.textContent = `🎉 太棒了！你答對了！`;
    feedbackLevel3.style.color = "green";
    scoreLevel3++;
    correctSound.play(); // 使用共用的 correctSound
    clickedButton.classList.add('correct-answer');

    const chineseMeaning = document.createElement('div');
    chineseMeaning.textContent = `(${correctChinese})`;
    chineseMeaning.style.fontSize = "0.9em";
    chineseMeaning.style.marginTop = "5px";
    chineseMeaning.style.color = "#388e3c";
    clickedButton.appendChild(chineseMeaning);

  } else {
    feedbackLevel3.innerHTML = `😢 再接再厲，你可以的！正確答案是「${answer}」`;
    feedbackLevel3.style.color = "red";
    wrongSound.play(); // 使用共用的 wrongSound
    clickedButton.classList.add('wrong-answer');

    buttons.forEach(btn => {
      if (btn.getAttribute("data-original-text") === answer) {
        btn.classList.add('correct-answer');
        const chineseMeaning = document.createElement('div');
        chineseMeaning.textContent = `(${correctChinese})`;
        chineseMeaning.style.fontSize = "0.9em";
        chineseMeaning.style.marginTop = "5px";
        chineseMeaning.style.color = "#388e3c";
        btn.appendChild(chineseMeaning);
      }
    });
  }

  nextBtnLevel3.style.display = "inline-block";
}

nextBtnLevel3.onclick = () => {
  currentQLevel3++;
  if (currentQLevel3 < questionsLevel3.length) {
    loadQuestionLevel3(currentQLevel3);
  } else {
    let percent = Math.round((scoreLevel3 / questionsLevel3.length) * 100);
    feedbackLevel3.innerHTML = `🎊 完成第三關！你的得分是 ${scoreLevel3}/5（${percent}%）`;
    feedbackLevel3.style.color = "#00796b";
    nextBtnLevel3.style.display = "none";

    db.ref(`players/${playerName}/level3`).set({
      score: scoreLevel3,
      percent: percent,
      time: new Date().toISOString()
    });
    // 跳轉到遊戲結束畫面
    setTimeout(() => {
        showLevel(4);
    }, 2000);
  }
};

// --- 遊戲結束邏輯 ---
function displayFinalScore() {
    // 您可以從 Firebase 讀取所有關卡的成績，或者在全局變量中累計。
    // 這裡我們假設您會追蹤每關分數。
    const totalScore = scoreLevel1 + matchedCountLevel2 + scoreLevel3; // 第二關的計分方式需確認
    finalScoreMessage.textContent = `${playerName}，你真棒！總分是：${totalScore}`;

    // 如果想讀取 Firebase 數據，可以在這裡查詢
    db.ref(`players/${playerName}`).once('value', (snapshot) => {
        const playerData = snapshot.val();
        if (playerData) {
            let totalOverallScore = 0;
            if (playerData.level1) totalOverallScore += playerData.level1.score;
            // 第二關的得分方式需要您定義，例如全部配對成功算 5 分
            if (playerData.level2 && playerData.level2.status === "completed") totalOverallScore += level2Pairs.length;
            if (playerData.level3) totalOverallScore += playerData.level3.score;

            finalScoreMessage.textContent = `${playerName}，恭喜你完成所有挑戰！你的總得分是：${totalOverallScore}！`;
        }
    });
}


// 初始載入：顯示玩家名稱輸入介面
document.addEventListener('DOMContentLoaded', () => {
    showLevel(0);
});