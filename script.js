// --- Firebase 配置 ---
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

// 避免重複初始化，雖然單一 script.js 較不常見，但保留是好習慣
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// --- 玩家名稱和遊戲狀態變量 (初始化為空，在遊戲開始時設定) ---
let playerName = '';

// --- 關卡數據 ---
// 第一關題目
const questionsLevel1 = [
  { question: "ㄅ", options: ["b", "p", "br"], answer: "b" },
  { question: "ㄇ", options: ["n", "d", "m"], answer: "m" },
  { question: "ㄠ", options: ["ai", "ae", "au"], answer: "au" },
  { question: "ㄓ", options: ["z", "zh", "ch"], answer: "zh" },
  { question: "ㄉ", options: ["d", "t", "drr"], answer: "d" }
];
let currentQLevel1 = 0; // 第一關當前題數
let scoreLevel1 = 0;    // 第一關分數
const totalQuestionsLevel1 = questionsLevel1.length;

// 第二關題目
const level2Pairs = [
    { term: "恁早", answer: "早安" },
    { term: "敗勢", answer: "對不起" },
    { term: "朝晨頭", answer: "早上" },
    { term: "暗晡", answer: "晚上" },
    { term: "當晝", answer: "中午" },
    { term: "食飽吂", answer: "吃飽了嗎" },
    { term: "有閒來寮", answer: "有空再來" },
];
let matchedCountLevel2 = 0; // 第二關已匹配數量
const totalPairsLevel2 = level2Pairs.length;

// 第三關題目
const questionsLevel3 = [
  {
    audio: '客語第三關音檔/HA-01-002s.mp3',
    questionText: '他才剛哭過，所以眼睛看起來會怎樣?',
    options: ['紅紅', '黃黃', '矇矇'],
    answer: '紅紅',
    correctChinese: '紅紅'
  },
  {
    audio: '客語第三關音檔/HA-01-003s.mp3',
    questionText: '怎樣的天氣最有可能下大雨',
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
    questionText: '他的衣服長長短短的，還挺有趣的！出門去可能會怎樣？)',
    options: ['分人笑', '分人惜', '分人罵'],
    answer: '分人笑',
    correctChinese: '被人笑'
  },
  {
    audio: '客語第三關音檔/HA-01-007s.mp3',
    questionText: '小弟弟整天吃飽睡、睡飽吃，什麼都不肯做，這句話意思是什麼)',
    options: ['當懶尸', '當儘採', '當生趣'],
    answer: '當懶尸',
    correctChinese: '很懶惰'
  }
];
let currentQLevel3 = 0; // 第三關當前題數
let scoreLevel3 = 0;    // 第三關分數
const totalQuestionsLevel3 = questionsLevel3.length;


// --- DOM 元素集中管理 ---
// 關卡容器元素 (用於 showLevel 函數切換顯示)
const playerContainer = document.getElementById('player-name-container');
const level1Container = document.getElementById('level1-container');
const level2Container = document.getElementById('level2-container');
const level3Container = document.getElementById('level3-container');
const gameOverContainer = document.getElementById('game-over-container');


// 玩家名稱輸入與遊戲開始元素
const playerNameInput = document.getElementById('player-name-input');
const startGameBtn = document.getElementById('start-game-btn');


// 第一關元素
const questionTextLevel1 = document.getElementById('question-text');
const optionsBoxLevel1 = document.getElementById('options');
const feedbackBoxLevel1 = document.getElementById('feedback');
const progressLevel1 = document.getElementById('progress'); // 進度條容器
const currentQSpanLevel1 = document.getElementById('current'); // 進度數字
const nextBtnLevel1 = document.getElementById('next-btn-level1'); // 第一關的下一題按鈕


// 第二關元素
const level2Instruction = document.getElementById('level2-instruction');
// 注意：querySelector 用來選擇非 ID 的元素，或者在特定父元素下的元素
const dragContainerLevel2 = document.querySelector('#level2-container .drag-container');
const dropContainerLevel2 = document.querySelector('#level2-container .drop-container');
const feedbackLevel2 = document.getElementById('level2-feedback');
const level2CurrentMatches = document.getElementById('level2-current-matches');
const level2TotalTerms = document.getElementById('level2-total-terms');


// 第三關元素
const playAudioBtn = document.getElementById('play-audio-btn');
const questionTextLevel3 = document.getElementById('question-text-level3');
const optionsLevel3Box = document.getElementById('options-level3');
const revealOptionsBtn = document.getElementById('reveal-options-btn');
const feedbackLevel3 = document.getElementById('feedback-level3');
const currentLevel3Span = document.getElementById('current-level3');
const nextBtnLevel3 = document.getElementById('next-btn-level3');


// 遊戲結束畫面元素
const finalScoreMessage = document.getElementById('final-score-message');
const personalAccuracyDisplay = document.getElementById('personal-accuracy');
const leaderboardDisplay = document.getElementById('leaderboard');
const restartGameBtn = document.getElementById('restart-game-btn');


// 音效元素
const correctSound = document.getElementById('correct-sound');
const wrongSound = document.getElementById('wrong-sound');
const questionAudio = document.getElementById('question-audio');


// --- 關卡管理函數 ---
function showLevel(level) {
    // 隱藏所有關卡容器
    playerContainer.style.display = 'none';
    level1Container.style.display = 'none';
    level2Container.style.display = 'none';
    level3Container.style.display = 'none';
    gameOverContainer.style.display = 'none';

    // 顯示指定關卡
    if (level === 0) { // 玩家名稱輸入介面
        playerContainer.style.display = 'flex'; // 使用 flex 確保內容居中
    } else if (level === 1) { // 第一關
        level1Container.style.display = 'flex';
        loadQuestionLevel1(currentQLevel1); // 確保在顯示關卡時載入第一道題
    } else if (level === 2) { // 第二關
        level2Container.style.display = 'flex';
        initLevel2(); // 初始化第二關
    } else if (level === 3) { // 第三關
        level3Container.style.display = 'flex';
        loadQuestionLevel3(currentQLevel3); // 載入第三關題目
    } else if (level === 4) { // 遊戲結束
        gameOverContainer.style.display = 'flex';
        displayFinalScore(); // 顯示最終分數和排行榜
    }
}


// --- 玩家名稱和遊戲開始 ---
startGameBtn.onclick = () => {
  playerName = playerNameInput.value.trim();
  if (playerName === "") {
    playerName = "訪客"; // 如果玩家沒有輸入，預設為訪客
  }
  // 將玩家名字存儲到 localStorage，以便下次訪問時自動填入
  localStorage.setItem('playerName', playerName);
  showLevel(1); // 顯示第一關
  // 更新Firebase中的玩家狀態，標記開始遊戲
  db.ref(`players/${playerName}`).update({
      lastPlayed: firebase.database.ServerValue.TIMESTAMP,
      status: "started"
  });
};

restartGameBtn.onclick = () => {
    // 重置所有關卡分數和進度
    currentQLevel1 = 0;
    scoreLevel1 = 0;
    matchedCountLevel2 = 0;
    currentQLevel3 = 0;
    scoreLevel3 = 0;
    playerNameInput.value = ''; // 清空玩家名字輸入框
    showLevel(0); // 返回玩家名稱輸入介面
};


// --- 第一關邏輯 ---
function loadQuestionLevel1(index) {
  let q = questionsLevel1[index];
  questionTextLevel1.textContent = `請選出「${q.question}」對應的拼音`;
  optionsBoxLevel1.innerHTML = ""; // 清空之前的選項
  feedbackBoxLevel1.textContent = ""; // 清空回饋訊息
  nextBtnLevel1.style.display = "none"; // 隱藏下一題按鈕

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => checkAnswerLevel1(opt, q.answer);
    optionsBoxLevel1.appendChild(btn);
  });

  currentQSpanLevel1.textContent = index + 1; // 更新進度數字
}

function checkAnswerLevel1(choice, answer) {
  const buttons = optionsBoxLevel1.querySelectorAll("button");
  buttons.forEach(btn => (btn.disabled = true)); // 禁用所有按鈕防止重複點擊

  if (choice === answer) {
    feedbackBoxLevel1.textContent = "🎉 係拉！就是這樣啦！";
    feedbackBoxLevel1.style.color = "green";
    scoreLevel1++;
    correctSound.play(); // 播放答對音效
  } else {
    feedbackBoxLevel1.textContent = "不可能-`д´-！怎麼會錯咧？只能下一題囉";
    feedbackBoxLevel1.style.color = "red";
    wrongSound.play(); // 播放答錯音效
  }

  nextBtnLevel1.style.display = "inline-block"; // 顯示下一題按鈕
}

nextBtnLevel1.onclick = () => {
  currentQLevel1++;
  if (currentQLevel1 < questionsLevel1.length) {
    loadQuestionLevel1(currentQLevel1);
  } else {
    let percent = Math.round((scoreLevel1 / totalQuestionsLevel1) * 100);
    feedbackBoxLevel1.innerHTML = `你是不是偷練？那麼厲害~你的第一關得分是 ${scoreLevel1}/${totalQuestionsLevel1}（${percent}%）`;
    feedbackBoxLevel1.style.color = "#00796b";
    nextBtnLevel1.style.display = "none";

    // 將第一關分數和總題數存入 Firebase
    db.ref(`players/${playerName}/level1`).set({
      score: scoreLevel1,
      totalQuestions: totalQuestionsLevel1,
      percent: percent,
      time: new Date().toISOString()
    });
    // 跳轉到第二關
    setTimeout(() => {
        showLevel(2);
    }, 2000);
  }
};


// --- 第二關邏輯 (配對) ---
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function initLevel2() {
  dragContainerLevel2.innerHTML = ''; // 清空拖曳區
  dropContainerLevel2.innerHTML = ''; // 清空放置區

  level2Instruction.style.display = 'block'; // 顯示說明
  feedbackLevel2.style.display = 'none'; // 隱藏回饋
  matchedCountLevel2 = 0; // 重置匹配數
  level2TotalTerms.textContent = totalPairsLevel2; // 顯示總配對數
  level2CurrentMatches.textContent = matchedCountLevel2; // 顯示當前匹配數

  const termsToShuffle = []; // 儲存客語詞語的 div 元素
  const dropsToShuffle = [];  // 儲存中文答案的 div 元素

  level2Pairs.forEach(pair => {
    // 創建客語詞語 draggable
    const termDiv = document.createElement('div');
    termDiv.classList.add('draggable');
    termDiv.textContent = pair.term;
    termDiv.setAttribute('data-term', pair.term); // 儲存原始客語詞語，用於配對判斷
    termsToShuffle.push(termDiv);

    // 創建中文答案 droppable
    const dropDiv = document.createElement('div');
    dropDiv.classList.add('droppable');
    dropDiv.textContent = pair.answer;
    dropDiv.setAttribute('data-answer', pair.term); // 儲存對應的客語詞語，用於配對判斷
    dropsToShuffle.push(dropDiv);
  });

  // 打亂並添加到 DOM
  shuffle(termsToShuffle).forEach(term => dragContainerLevel2.appendChild(term));
  shuffle(dropsToShuffle).forEach(drop => dropContainerLevel2.appendChild(drop));

  let selectedTerm = null; // 當前選中的客語詞語

  // 為所有 draggable 元素添加點擊事件
  dragContainerLevel2.querySelectorAll('.draggable').forEach(term => {
    term.addEventListener('click', handleTermClickLevel2);
  });

  function handleTermClickLevel2() {
    level2Instruction.style.display = 'none'; // 點擊後隱藏說明
    feedbackLevel2.style.display = 'block'; // 顯示回饋區
    dragContainerLevel2.querySelectorAll('.draggable').forEach(t => t.classList.remove('selected')); // 移除所有選取狀態
    selectedTerm = this; // 設定當前選取的詞語
    selectedTerm.classList.add('selected'); // 添加選取狀態
    feedbackLevel2.textContent = ''; // 清空回饋訊息
  }

  // 為所有 droppable 元素添加點擊事件
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

    const answerTerm = this.getAttribute('data-answer'); // 獲取此中文答案對應的客語詞語
    if (selectedTerm.getAttribute('data-term') === answerTerm) { // 判斷是否配對成功
      this.classList.add('correct'); // 中文答案變綠
      selectedTerm.classList.add('matched'); // 客語詞語變灰
      selectedTerm.style.pointerEvents = 'none'; // 禁用已匹配的客語詞語
      this.style.pointerEvents = 'none'; // 禁用已匹配的中文答案
      selectedTerm.classList.remove('selected'); // 移除選取狀態
      selectedTerm = null; // 清空選取的詞語
      feedbackLevel2.textContent = '🎉配對成功！當慶 ヾ(*´∇`)ﾉ🎉';
      feedbackLevel2.style.color = 'green';
      matchedCountLevel2++; // 增加匹配數
      updateLevel2Progress(); // 更新進度顯示

      // 檢查是否所有詞語都已匹配
      const allMatched = Array.from(dragContainerLevel2.querySelectorAll('.draggable'))
                             .every(term => term.classList.contains('matched'));
      if (allMatched) {
        feedbackLevel2.innerHTML = '恭喜你！第二關全部配對成功（⌒▽⌒）！做得當好🎊';
        // 儲存第二關完成狀態和匹配數量
        db.ref(`players/${playerName}/level2`).set({
            matchedCount: matchedCountLevel2,
            totalPairs: totalPairsLevel2,
            time: new Date().toISOString(),
            status: "completed"
        });
        // 跳轉到第三關
        setTimeout(() => {
            showLevel(3);
        }, 2000);
      }
    } else {
      this.classList.add('incorrect'); // 答錯的中文答案變紅
      feedbackLevel2.textContent = '慘了芭比Q了!還衰過喔ლ(｀∀´ლ)，再試試看吧';
      feedbackLevel2.style.color = 'red';
      wrongSound.play(); // 播放答錯音效
      setTimeout(() => {
        this.classList.remove('incorrect'); // 移除錯誤樣式
        feedbackLevel2.textContent = ''; // 清空回饋訊息
      }, 1000);
    }
  }

  const updateLevel2Progress = () => {
    level2CurrentMatches.textContent = matchedCountLevel2; // 更新進度數字
  };
  updateLevel2Progress(); // 初始化時更新一次進度
}


// ... (之前的代碼保持不變，例如 Firebase 配置、關卡數據、DOM 元素獲取等) ...

// --- 第三關邏輯 ---
function loadQuestionLevel3(index) {
  const q = questionsLevel3[index];

  // 確保 DOM 元素存在，否則會導致 TypeError
  if (!questionAudio || !playAudioBtn || !questionTextLevel3 || !optionsLevel3Box || !revealOptionsBtn || !feedbackLevel3 || !currentLevel3Span || !nextBtnLevel3) {
    console.error("第三關的部分 DOM 元素未找到，無法載入題目。");
    return;
  }

  questionAudio.src = q.audio; // 設定音源
  playAudioBtn.classList.remove('playing'); // 確保播放按鈕是暫停狀態圖示
  questionTextLevel3.textContent = q.questionText; // 設置題目文字
  questionTextLevel3.classList.add('hidden-text'); // 初始隱藏
  questionTextLevel3.classList.remove('visible-text'); // 移除可見 class
  optionsLevel3Box.innerHTML = ''; // 清空選項
  feedbackLevel3.textContent = ''; // 清空回饋
  revealOptionsBtn.style.display = 'none'; // 隱藏顯示客語詞彙按鈕
  nextBtnLevel3.style.display = 'none'; // 隱藏下一題按鈕

  // 打亂選項並創建按鈕
// 這裡進行修正：直接使用原始選項順序，不進行打亂
  // 之前: const shuffledOptions = shuffle([...q.options]);
  const orderedOptions = q.options; // 直接使用原始順序

  orderedOptions.forEach(option => { // 將 shuffledOptions 改為 orderedOptions
    const btn = document.createElement('button');
    btn.textContent = option;
    btn.setAttribute('data-original-text', option); // 儲存原始文字以供判斷
    btn.onclick = () => checkAnswerLevel3(option, q.answer, q.correctChinese);
    optionsLevel3Box.appendChild(btn);
  });

  currentLevel3Span.textContent = index + 1; // 更新進度數字
}

playAudioBtn.onclick = () => {
  if (questionAudio.paused) {
    questionAudio.play();
    playAudioBtn.classList.add('playing');
  } else {
    questionAudio.pause();
    playAudioBtn.classList.remove('playing');
  }
};

// 音訊播放結束後，顯示客語詞彙按鈕
questionAudio.onended = () => {
  revealOptionsBtn.style.display = 'inline-block';
  playAudioBtn.classList.remove('playing');
};

revealOptionsBtn.onclick = () => {
  questionTextLevel3.classList.remove('hidden-text');
  questionTextLevel3.classList.add('visible-text');
  revealOptionsBtn.style.display = 'none'; // 顯示後隱藏按鈕
};

function checkAnswerLevel3(choice, answer, correctChinese) {
  const buttons = optionsLevel3Box.querySelectorAll('button');
  buttons.forEach(btn => (btn.disabled = true)); // 禁用所有選項按鈕

  const clickedButton = Array.from(buttons).find(btn => btn.getAttribute('data-original-text') === choice);

  if (choice === answer) {
    feedbackLevel3.innerHTML = '🎉 哇嗚！簡直『客語神人』(≧∇≦)/！';
    feedbackLevel3.style.color = 'green';
    scoreLevel3++;
    correctSound.play(); // 播放答對音效
    clickedButton.classList.add('correct-answer');

    // 顯示中文解釋
    const chineseMeaning = document.createElement('div');
    chineseMeaning.textContent = `(${correctChinese})`;
    chineseMeaning.style.fontSize = "0.9em";
    chineseMeaning.style.marginTop = "5px";
    chineseMeaning.style.color = "#388e3c"; // 綠色
    clickedButton.appendChild(chineseMeaning);
  } else {
    feedbackLevel3.innerHTML = ` 再接再厲，你可以的 (~￣▽￣)~！正確答案是「${answer}」`;
    feedbackLevel3.style.color = 'red';
    wrongSound.play(); // 播放答錯音效
    clickedButton.classList.add('wrong-answer');

    // 顯示正確答案的中文解釋
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
  nextBtnLevel3.style.display = "inline-block"; // 顯示下一題按鈕
}

nextBtnLevel3.onclick = () => {
  currentQLevel3++;
  if (currentQLevel3 < questionsLevel3.length) {
    loadQuestionLevel3(currentQLevel3);
  } else {
    let percent = Math.round((scoreLevel3 / totalQuestionsLevel3) * 100);
    feedbackLevel3.innerHTML = `🎊 完成第三關(╯✧∇✧)╯！你的得分是 ${scoreLevel3}/${totalQuestionsLevel3}（${percent}%）`;
    feedbackLevel3.style.color = "#00796b";
    nextBtnLevel3.style.display = "none";

    // 將第三關分數和總題數存入 Firebase
    db.ref(`players/${playerName}/level3`).set({
      score: scoreLevel3,
      totalQuestions: totalQuestionsLevel3,
      percent: percent,
      time: new Date().toISOString()
    });
    // 跳轉到遊戲結束畫面
    setTimeout(() => {
        showLevel(4); // 顯示遊戲結束畫面
    }, 2000);
  }
};


// --- 遊戲結束邏輯 ---
async function displayFinalScore() {
    // 顯示個人成績
    let totalCorrect = scoreLevel1 + matchedCountLevel2 + scoreLevel3;
    let totalPossible = totalQuestionsLevel1 + totalPairsLevel2 + totalQuestionsLevel3;
    let overallAccuracy = (totalCorrect / totalPossible * 100).toFixed(2);

    finalScoreMessage.textContent = `${playerName}有點厲害喔~你的總得分是：${totalCorrect}/${totalPossible}！`;
    personalAccuracyDisplay.textContent = `你的總答對率是(￣▽￣)~：${overallAccuracy}%`;

    // 更新當前玩家的總分和最近完成時間到 Firebase
    db.ref(`players/${playerName}`).update({
        overallScore: totalCorrect,
        overallAccuracy: parseFloat(overallAccuracy),
        lastPlayed: firebase.database.ServerValue.TIMESTAMP
    });

    // 獲取並顯示排行榜
    leaderboardDisplay.innerHTML = '<p>載入排行榜中...</p>'; // 顯示載入提示

    // 從 Firebase 獲取玩家數據，按總分降序排序，限制前 10 名
    db.ref('players').orderByChild('overallScore').limitToLast(10).once('value', (snapshot) => {
        const playersData = snapshot.val();
        let leaderboardHtml = `<table>
                                <thead>
                                    <tr>
                                        <th>排名</th>
                                        <th>玩家</th>
                                        <th>總得分</th>
                                        <th>答對率</th>
                                    </tr>
                                </thead>
                                <tbody>`;
        let players = [];
        for (let key in playersData) {
            const player = playersData[key];
            // 確保玩家有完成遊戲的數據才納入排行榜
            if (player.overallScore !== undefined && player.overallAccuracy !== undefined) {
                players.push({
                    name: key,
                    score: player.overallScore,
                    accuracy: player.overallAccuracy
                });
            }
        }

        // 根據總得分降序排序 (Firebase orderByChild 默認是升序，所以要反轉)
        players.sort((a, b) => b.score - a.score);

        if (players.length > 0) {
            players.forEach((player, index) => {
                leaderboardHtml += `<tr>
                                        <td>${index + 1}</td>
                                        <td>${player.name}</td>
                                        <td>${player.score}</td>
                                        <td>${player.accuracy}%</td>
                                    </tr>`;
            });
        } else {
            leaderboardHtml += `<tr><td colspan="4">目前還沒有玩家完成遊戲，快來挑戰！</td></tr>`;
        }

        leaderboardHtml += `</tbody></table>`;
        leaderboardDisplay.innerHTML = leaderboardHtml;

    }, (error) => {
        console.error("Error fetching leaderboard:", error);
        leaderboardDisplay.innerHTML = '<p>載入排行榜失敗。</p>';
    });
}


// --- 初始載入：顯示玩家名稱輸入介面 ---
document.addEventListener('DOMContentLoaded', () => {
    const savedPlayerName = localStorage.getItem('playerName');
    if (savedPlayerName) {
        playerNameInput.value = savedPlayerName; // 如果有儲存的名字，自動填入
    }
    showLevel(0); // 顯示玩家名稱輸入介面
});
// ... (之前的 Firebase 配置、關卡數據、DOM 元素獲取等保持不變) ...

/// --- 玩家名稱和遊戲開始 ---
startGameBtn.onclick = () => {
  playerName = playerNameInput.value.trim();
  if (playerName === "") {
    playerName = "勇者少年仔"; // 如果玩家沒有輸入，預設為故事中的「勇者少年仔」
  }
  // 將玩家名字存儲到 localStorage，以便下次訪問時自動填入
  localStorage.setItem('playerName', playerName);
  showLevel(1); // 顯示第一關
  // 更新Firebase中的玩家狀態，標記開始遊戲
  db.ref(`players/${playerName}`).update({
      lastPlayed: firebase.database.ServerValue.TIMESTAMP,
      status: "started"
  });
};
restartGameBtn.onclick = () => {
    // 重置所有關卡分數和進度
    currentQLevel1 = 0;
    scoreLevel1 = 0;
    matchedCountLevel2 = 0;
    currentQLevel3 = 0;
    scoreLevel3 = 0;
    playerNameInput.value = ''; // 清空玩家名字輸入框
    // 重設提示為「你的勇者名字」
    playerNameInput.placeholder = "你的勇者名字";
    showLevel(0); // 返回玩家名稱輸入介面
};

// ... (第一關、第二關、第三關、遊戲結束邏輯保持不變) ...

// --- 初始載入：顯示玩家名稱輸入介面 ---
document.addEventListener('DOMContentLoaded', () => {
    const savedPlayerName = localStorage.getItem('playerName');
    if (savedPlayerName) {
        playerNameInput.value = savedPlayerName; // 如果有儲存的名字，自動填入
    }
    // 設置 placeholder 文本
    playerNameInput.placeholder = "你的勇者名字";
    showLevel(0); // 顯示玩家名稱輸入介面
});

 