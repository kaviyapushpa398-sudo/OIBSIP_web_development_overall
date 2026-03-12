/* ═══════════════════════════════════════════════════════
   StudySync — script.js
   All navigation, data, timers, quiz, chat, leaderboard
═══════════════════════════════════════════════════════ */

// ── App State ────────────────────────────────────────────
const state = {
  studentId:   '',
  department:  '',
  course:      '',
  level:       '',
  group:       null,
  syllabus:    null,
  syllabusApproved: false,
  chatMessages: [],
  quizScore:   0,
  testScore:   0,
  resources:   [],
  studyTimerInterval: null,
  testTimerInterval:  null,
  studySeconds: 30 * 60,
  testSeconds:  20 * 60,
};

// ── Course Data ──────────────────────────────────────────
const coursesByDept = {
  cs:    [
    { name: 'Programming',      emoji: '💻', sub: '6 topics' },
    { name: 'Data Structures',  emoji: '🌲', sub: '5 topics' },
    { name: 'Web Development',  emoji: '🌐', sub: '8 topics' },
    { name: 'Database Systems', emoji: '🗄️',  sub: '4 topics' },
    { name: 'AI & ML',          emoji: '🤖', sub: '7 topics' },
    { name: 'Algorithms',       emoji: '⚙️',  sub: '6 topics' },
  ],
  it:    [
    { name: 'Networking',        emoji: '📡', sub: '5 topics' },
    { name: 'Cybersecurity',     emoji: '🔐', sub: '6 topics' },
    { name: 'Cloud Computing',   emoji: '☁️',  sub: '4 topics' },
    { name: 'System Admin',      emoji: '🖥️',  sub: '5 topics' },
  ],
  ece:   [
    { name: 'Digital Circuits',  emoji: '⚡', sub: '6 topics' },
    { name: 'Signal Processing', emoji: '📶', sub: '5 topics' },
    { name: 'Embedded Systems',  emoji: '🔧', sub: '4 topics' },
    { name: 'VLSI Design',       emoji: '🔬', sub: '3 topics' },
  ],
  mech:  [
    { name: 'Thermodynamics',    emoji: '🌡️',  sub: '5 topics' },
    { name: 'Fluid Mechanics',   emoji: '💧', sub: '4 topics' },
    { name: 'Manufacturing',     emoji: '🏭', sub: '6 topics' },
    { name: 'CAD/CAM',           emoji: '📐', sub: '3 topics' },
  ],
  civil: [
    { name: 'Structural Eng.',   emoji: '🏗️',  sub: '5 topics' },
    { name: 'Soil Mechanics',    emoji: '⛏️',  sub: '4 topics' },
    { name: 'Surveying',         emoji: '🗺️',  sub: '3 topics' },
    { name: 'Hydrology',         emoji: '🌊', sub: '4 topics' },
  ],
  math:  [
    { name: 'Calculus',          emoji: '∫',  sub: '6 topics' },
    { name: 'Linear Algebra',    emoji: '🔢', sub: '5 topics' },
    { name: 'Statistics',        emoji: '📊', sub: '4 topics' },
    { name: 'Discrete Math',     emoji: '🔷', sub: '5 topics' },
  ],
};

const deptNames = {
  cs: 'Computer Science', it: 'Information Technology',
  ece: 'Electronics & Communication', mech: 'Mechanical Engineering',
  civil: 'Civil Engineering', math: 'Mathematics',
};

// Simulated members pool
const memberPool = {
  Beginner:     [
    { name: 'Aisha Khan',    id: 'STU2024042' },
    { name: 'Rohan Mehta',   id: 'STU2024018' },
    { name: 'Sara Nair',     id: 'STU2024067' },
  ],
  Intermediate: [
    { name: 'Dev Patel',     id: 'STU2024031' },
    { name: 'Priya Singh',   id: 'STU2024055' },
    { name: 'Arjun Das',     id: 'STU2024029' },
  ],
  Advanced:     [
    { name: 'Kavya Rao',     id: 'STU2024009' },
    { name: 'Nikhil Verma',  id: 'STU2024013' },
    { name: 'Tanvi Joshi',   id: 'STU2024004' },
  ],
};

const groupNames = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'];
const avatarColors = { Beginner: 'av-teal', Intermediate: 'av-gold', Advanced: 'av-coral' };

// ── Quiz Questions ───────────────────────────────────────
const quizBank = [
  {
    q: 'Which data structure uses LIFO order?',
    options: ['Queue', 'Stack', 'Tree', 'Graph'],
    answer: 1, explain: 'A Stack uses Last-In-First-Out (LIFO) ordering.',
  },
  {
    q: 'What does HTML stand for?',
    options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Model Link', 'Home Tool Markup Language'],
    answer: 0, explain: 'HTML = HyperText Markup Language, the foundation of web pages.',
  },
  {
    q: 'Which sorting algorithm has best-case O(n) complexity?',
    options: ['Merge Sort', 'Quick Sort', 'Insertion Sort', 'Bubble Sort'],
    answer: 2, explain: 'Insertion Sort has O(n) best-case when the array is nearly sorted.',
  },
  {
    q: 'What is a primary key in a database?',
    options: ['A key that encrypts data', 'A unique identifier for table rows', 'The first column of a table', 'A key used for joins'],
    answer: 1, explain: 'A primary key uniquely identifies each row in a database table.',
  },
  {
    q: 'Which protocol is used to send emails?',
    options: ['HTTP', 'FTP', 'SMTP', 'TCP'],
    answer: 2, explain: 'SMTP (Simple Mail Transfer Protocol) is used for sending emails.',
  },
];

// Monthly test bank (harder)
const testBank = [
  { q: 'Time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], answer: 1, explain: 'Binary search divides search space in half each time: O(log n).' },
  { q: 'Which OSI layer handles IP addressing?', options: ['Data Link', 'Transport', 'Network', 'Physical'], answer: 2, explain: 'The Network layer (Layer 3) handles IP addressing and routing.' },
  { q: 'What is polymorphism in OOP?', options: ['Multiple inheritance', 'One interface, multiple implementations', 'Code reuse via classes', 'Hiding data'], answer: 1, explain: 'Polymorphism lets one interface work with different underlying data types.' },
  { q: 'Which is a NoSQL database?', options: ['MySQL', 'PostgreSQL', 'MongoDB', 'SQLite'], answer: 2, explain: 'MongoDB is a document-oriented NoSQL database.' },
  { q: 'What does DNS stand for?', options: ['Data Network System', 'Domain Name System', 'Dynamic Node Service', 'Direct Name Server'], answer: 1, explain: 'DNS = Domain Name System, which translates domain names to IP addresses.' },
  { q: 'Which keyword starts a function in Python?', options: ['function', 'def', 'func', 'void'], answer: 1, explain: 'Python uses the "def" keyword to define a function.' },
];

// Drag & Drop game data
const dragData = {
  categories: ['Frontend', 'Backend'],
  items: [
    { label: 'HTML', correct: 'Frontend' },
    { label: 'Node.js', correct: 'Backend' },
    { label: 'CSS', correct: 'Frontend' },
    { label: 'Django', correct: 'Backend' },
    { label: 'React', correct: 'Frontend' },
    { label: 'Flask', correct: 'Backend' },
  ],
};

// Leaderboard data
const leaderboardData = [
  { rank:1, dept:'Computer Science',           group:'Alpha Squad',   members:'Kavya R., Dev P., Aisha K.',     score:2840 },
  { rank:2, dept:'Information Technology',     group:'Cyber Wolves',  members:'Nikhil V., Priya S., Rohan M.', score:2710 },
  { rank:3, dept:'Electronics & Comm.',        group:'Circuit Kings', members:'Tanvi J., Arjun D., Sara N.',   score:2590 },
  { rank:4, dept:'Mechanical Eng.',            group:'Iron Fist',     members:'Rahul B., Sneha P., Kiran T.',  score:2440 },
  { rank:5, dept:'Mathematics',                group:'Pi Squad',      members:'Ananya M., Vivek K., Zara S.',  score:2310 },
];

// Challenges
const challenges = [
  { diff: 'Hard',   title: 'Binary Tree Traversal',     desc: 'Implement inorder, preorder, and postorder traversal without recursion.' },
  { diff: 'Medium', title: 'REST API Design',            desc: 'Design a RESTful API for a library management system with CRUD operations.' },
  { diff: 'Hard',   title: 'Dynamic Programming — Knapsack', desc: 'Solve 0/1 Knapsack using bottom-up DP with memoisation.' },
];

const defaultResources = [
  { author: 'Kavya R.', initial: 'K', time: '2h ago', title: 'Big-O Cheat Sheet', body: 'Compiled all time & space complexities for common algorithms. Link: github.com/kavya/bigO-cheatsheet' },
  { author: 'Nikhil V.', initial: 'N', time: '5h ago', title: 'React Hooks Deep Dive', body: 'Notes from the React official docs with live examples for useState, useEffect, useCallback, and custom hooks.' },
];

// ── Navigation ───────────────────────────────────────────
function goTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(pageId);
  if (target) target.classList.add('active');
}

// ── Login ────────────────────────────────────────────────
function goToCourseSelect() {
  const sid  = document.getElementById('student-id').value.trim();
  const dept = document.getElementById('department').value;
  if (!sid) { showToast('⚠️ Please enter your Student ID'); return; }
  if (!dept) { showToast('⚠️ Please select your department'); return; }

  state.studentId  = sid;
  state.department = dept;

  // Update avatar initials
  const initial = sid.charAt(0).toUpperCase();
  ['user-avatar', 'user-avatar2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = initial;
  });

  // Populate courses
  document.getElementById('display-dept').textContent = deptNames[dept] || dept;
  buildCourseGrid(dept);
  goTo('page-course');
}

function buildCourseGrid(dept) {
  const courses = coursesByDept[dept] || [];
  const grid = document.getElementById('course-grid');
  grid.innerHTML = courses.map(c => `
    <div class="course-card" onclick="selectCourse('${c.name}')">
      <span class="course-emoji">${c.emoji}</span>
      <div class="course-name">${c.name}</div>
      <div class="course-sub">${c.sub}</div>
    </div>
  `).join('');
}

function selectCourse(name) {
  state.course = name;
  document.getElementById('display-course').textContent = name;
  goTo('page-level');
}

// ── Level Selection & Group Creation ─────────────────────
function selectLevel(level) {
  state.level = level;
  createGroup();
  buildGroupPage();
  startStudyTimer();
  goTo('page-group');
  showToast(`🎉 Joined as ${level} learner!`);
}

function createGroup() {
  const gName = groupNames[Math.floor(Math.random() * groupNames.length)];

  // Build 3-member group: one per level
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const members = levels.map(lvl => {
    const pool = memberPool[lvl];
    const picked = pool[Math.floor(Math.random() * pool.length)];
    return { ...picked, level: lvl, isYou: lvl === state.level };
  });

  // Mark the "you" member with the user's actual ID
  const youMember = members.find(m => m.isYou);
  if (youMember) { youMember.name = 'You'; youMember.id = state.studentId; }

  state.group = { name: gName, members, course: state.course, dept: deptNames[state.department] };
}

function buildGroupPage() {
  const g = state.group;
  document.getElementById('group-name-display').textContent  = `Group ${g.name}`;
  document.getElementById('group-course-display').textContent = `${g.course} · ${g.dept}`;

  // Members
  const list = document.getElementById('members-list');
  list.innerHTML = g.members.map(m => {
    const av   = avatarColors[m.level] || 'av-purple';
    const role = m.isYou ? 'role-you' : (m.level === 'Advanced' ? 'role-adv' : m.level === 'Intermediate' ? 'role-int' : 'role-beg');
    const badge= m.isYou ? 'YOU' : m.level;
    const init = m.name.charAt(0).toUpperCase();
    const mentor = m.level === 'Advanced' ? ' 🎓' : '';
    return `
      <div class="member-card">
        <div class="member-avatar ${av}">${init}</div>
        <div class="member-info">
          <div class="member-name">${m.name}${mentor}</div>
          <div class="member-id">${m.id}</div>
        </div>
        <span class="member-role-badge ${role}">${badge}</span>
      </div>`;
  }).join('');

  // Syllabus form visibility
  const isAdvanced = state.level === 'Advanced';
  document.getElementById('syllabus-lock').style.display    = isAdvanced ? 'none' : 'flex';
  document.getElementById('syllabus-form').style.display    = isAdvanced ? 'block' : 'none';
  document.getElementById('syllabus-submitted').style.display = 'none';

  // Teaching rotation
  buildRotation();

  // Seed chat
  seedChat();
}

function buildRotation() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const topics = ['Introduction & Overview', 'Core Concepts', 'Practical Applications', 'Problem Solving', 'Review & Assessment'];
  const g = state.group;
  const list = document.getElementById('rotation-list');
  list.innerHTML = days.map((day, i) => {
    const member = g.members[i % g.members.length];
    const av   = avatarColors[member.level] || 'av-purple';
    const init = member.name.charAt(0).toUpperCase();
    return `
      <div class="rotation-item">
        <span class="rotation-day">${day}</span>
        <div class="member-avatar ${av}" style="width:32px;height:32px;font-size:12px;flex-shrink:0">${init}</div>
        <div>
          <div class="rotation-name">${member.name}</div>
          <div class="rotation-topic">${topics[i]}</div>
        </div>
      </div>`;
  }).join('');
}

function seedChat() {
  const g = state.group;
  const adv = g.members.find(m => m.level === 'Advanced');
  const beg = g.members.find(m => m.level === 'Beginner');
  state.chatMessages = [
    { from: adv.name, text: `Hey team! Ready to start our ${g.course} session? 🚀`, isMe: adv.isYou, level: adv.level },
    { from: beg.name, text: 'Super excited! Can we go over the basics first?', isMe: beg.isYou, level: beg.level },
    { from: adv.name, text: 'Absolutely! I\'ll share notes after our session.', isMe: adv.isYou, level: adv.level },
  ];
  renderChat();
}

// ── Chat ─────────────────────────────────────────────────
function renderChat() {
  const win = document.getElementById('chat-window');
  win.innerHTML = state.chatMessages.map(msg => {
    const av  = avatarColors[msg.level] || 'av-purple';
    const init= msg.from.charAt(0).toUpperCase();
    return `
      <div class="chat-bubble-wrap ${msg.isMe ? 'me' : ''}">
        <div class="bubble-avatar ${av}">${init}</div>
        <div>
          <div class="chat-bubble">${msg.text}</div>
          <div class="chat-meta">${msg.isMe ? 'You' : msg.from}</div>
        </div>
      </div>`;
  }).join('');
  win.scrollTop = win.scrollHeight;
}

function sendMessage() {
  const input = document.getElementById('chat-input');
  const txt   = input.value.trim();
  if (!txt) return;
  state.chatMessages.push({ from: 'You', text: txt, isMe: true, level: state.level });
  input.value = '';
  renderChat();
  // Auto-reply
  setTimeout(() => {
    const g   = state.group;
    const bot = g.members.find(m => !m.isYou);
    if (bot) {
      const replies = ['Good point!', 'I see what you mean 🤔', 'Let\'s dig deeper into that.', 'Great question!', 'Can you elaborate on that?'];
      state.chatMessages.push({
        from: bot.name, text: replies[Math.floor(Math.random() * replies.length)],
        isMe: false, level: bot.level
      });
      renderChat();
    }
  }, 1000 + Math.random() * 800);
}

function chatEnter(e) { if (e.key === 'Enter') sendMessage(); }

// ── Tab Switching ─────────────────────────────────────────
function switchTab(name, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(`tab-${name}`).classList.add('active');
}

// ── Syllabus ─────────────────────────────────────────────
function submitSyllabus() {
  const w1 = document.getElementById('week1').value.trim();
  const w2 = document.getElementById('week2').value.trim();
  const w3 = document.getElementById('week3').value.trim();
  if (!w1 || !w2 || !w3) { showToast('⚠️ Fill in all 3 weeks!'); return; }

  state.syllabus = { w1, w2, w3, group: state.group.name, dept: deptNames[state.department], course: state.course };
  document.getElementById('syllabus-form').style.display = 'none';
  document.getElementById('syllabus-submitted').style.display = 'block';
  buildAdminSyllabus();
  showToast('✅ Syllabus sent to Admin!');
}

// ── Study Timer ───────────────────────────────────────────
function startStudyTimer() {
  clearInterval(state.studyTimerInterval);
  state.studySeconds = 30 * 60;
  state.studyTimerInterval = setInterval(() => {
    state.studySeconds--;
    document.getElementById('study-timer').textContent = formatTime(state.studySeconds);
    if (state.studySeconds <= 0) {
      clearInterval(state.studyTimerInterval);
      document.getElementById('study-timer').textContent = 'Done!';
      showToast('🎉 Study session complete! Take the quiz now.');
    }
  }, 1000);
}

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ── Admin Panel ───────────────────────────────────────────
function buildAdminSyllabus() {
  const list = document.getElementById('admin-syllabus-list');
  if (!state.syllabus) {
    list.innerHTML = '<div class="empty-state">No syllabi submitted yet.</div>';
    return;
  }
  const s = state.syllabus;
  list.innerHTML = `
    <div class="syllabus-review-card">
      <div class="syllabus-header">
        <div>
          <div class="syllabus-group">Group ${s.group}</div>
          <div class="syllabus-dept">${s.dept} · ${s.course}</div>
        </div>
        <span style="font-size:18px">📋</span>
      </div>
      <div class="syllabus-body">
        <div>📅 Week 1: <strong>${s.w1}</strong></div>
        <div>📅 Week 2: <strong>${s.w2}</strong></div>
        <div>📅 Week 3: <strong>${s.w3}</strong></div>
      </div>
      ${state.syllabusApproved
        ? '<div class="approved-tag">✅ Approved</div>'
        : `<button class="approve-btn" onclick="approveSyllabus()">✓ Approve Study Plan</button>`}
    </div>`;

  // Dept stats
  const stats = document.getElementById('dept-stats');
  const depts = Object.entries(deptNames);
  const colors= ['#00d4aa','#ff6b6b','#ffd166','#a78bfa','#60a5fa','#34d399'];
  stats.innerHTML = depts.map(([,name], i) => `
    <div class="dept-stat-row">
      <div class="dept-dot" style="background:${colors[i]}"></div>
      <span class="dept-stat-name">${name}</span>
      <span class="dept-stat-val">${Math.floor(Math.random()*15)+5} groups</span>
    </div>`).join('');
}

function approveSyllabus() {
  state.syllabusApproved = true;
  buildAdminSyllabus();
  showToast('✅ Syllabus approved!');
}

// ── Quiz ──────────────────────────────────────────────────
let currentQ = 0;

function initQuiz() {
  currentQ = 0;
  state.quizScore = 0;
  document.getElementById('quiz-score-pill').textContent = '0 pts';
  document.getElementById('quiz-result').style.display   = 'none';
  document.getElementById('dragdrop-game').style.display = 'none';
  document.getElementById('quiz-area').style.display     = 'block';
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const area = document.getElementById('quiz-area');
  if (currentQ >= quizBank.length) {
    showQuizResult();
    return;
  }
  const q = quizBank[currentQ];
  const pct = (currentQ / quizBank.length) * 100;
  document.getElementById('quiz-fill').style.width = pct + '%';

  area.innerHTML = `
    <div class="quiz-card">
      <div class="quiz-qno">Question ${currentQ + 1} of ${quizBank.length}</div>
      <div class="quiz-q">${q.q}</div>
      <div class="quiz-options">
        ${q.options.map((opt, i) =>
          `<button class="quiz-option" onclick="answerQ(${i}, this)">${opt}</button>`
        ).join('')}
      </div>
      <div class="quiz-feedback" id="qfb"></div>
    </div>`;
}

function answerQ(idx, btn) {
  const q  = quizBank[currentQ];
  const fb = document.getElementById('qfb');
  const btns = document.querySelectorAll('.quiz-option');

  btns.forEach(b => b.classList.add('disabled'));

  if (idx === q.answer) {
    btn.classList.add('correct');
    state.quizScore += 200;
    document.getElementById('quiz-score-pill').textContent = state.quizScore + ' pts';
    fb.textContent = '✅ Correct! ' + q.explain;
    fb.className   = 'quiz-feedback show ok';
  } else {
    btn.classList.add('wrong');
    btns[q.answer].classList.add('correct');
    fb.textContent = '❌ Not quite. ' + q.explain;
    fb.className   = 'quiz-feedback show bad';
  }

  setTimeout(() => {
    currentQ++;
    renderQuizQuestion();
  }, 1600);
}

function showQuizResult() {
  document.getElementById('quiz-fill').style.width = '100%';
  document.getElementById('quiz-area').style.display = 'none';
  document.getElementById('quiz-result').style.display = 'block';
  document.getElementById('result-score-text').textContent =
    `You scored ${state.quizScore} / ${quizBank.length * 200} pts. Well done!`;

  // Show drag game below
  setTimeout(() => {
    document.getElementById('dragdrop-game').style.display = 'block';
    initDragGame();
  }, 300);
}

// ── Drag & Drop ───────────────────────────────────────────
function initDragGame() {
  const board = document.getElementById('drag-board');
  const dd    = dragData;

  // Pool of draggable chips above zones
  const poolHtml = `<div class="drag-items-pool" id="drag-pool">
    ${dd.items.map((item, i) =>
      `<div class="drag-chip" draggable="true" id="chip-${i}"
         ondragstart="dragStart(event, ${i})">${item.label}</div>`
    ).join('')}
  </div>`;

  document.getElementById('dragdrop-game').insertAdjacentHTML('afterbegin', poolHtml);

  board.innerHTML = dd.categories.map(cat => `
    <div class="drag-zone" id="zone-${cat}"
         ondragover="dragOver(event)"
         ondragleave="dragLeave(event)"
         ondrop="dropChip(event, '${cat}')">
      <div class="drag-zone-label">${cat}</div>
    </div>`).join('');
}

function dragStart(e, idx) {
  e.dataTransfer.setData('chipIdx', idx);
}
function dragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('dragover');
}
function dragLeave(e) {
  e.currentTarget.classList.remove('dragover');
}
function dropChip(e, category) {
  e.preventDefault();
  e.currentTarget.classList.remove('dragover');
  const idx  = parseInt(e.dataTransfer.getData('chipIdx'));
  const chip = document.getElementById(`chip-${idx}`);
  if (chip) { e.currentTarget.appendChild(chip); chip.setAttribute('data-dropped', category); }
}
function checkDrag() {
  const chips = document.querySelectorAll('.drag-chip[data-dropped]');
  let correct = 0;
  chips.forEach(chip => {
    const idx  = parseInt(chip.id.split('-')[1]);
    const item = dragData.items[idx];
    if (chip.getAttribute('data-dropped') === item.correct) { correct++; chip.style.borderColor = 'var(--teal)'; }
    else chip.style.borderColor = 'var(--coral)';
  });
  const res = document.getElementById('drag-result');
  res.textContent = `${correct}/${dragData.items.length} correct!`;
  res.className   = `drag-result ${correct >= dragData.items.length * 0.6 ? 'ok' : 'bad'}`;
  showToast(correct === dragData.items.length ? '🏆 Perfect match!' : `${correct}/${dragData.items.length} matches — keep practising!`);
}

// ── Monthly Test ──────────────────────────────────────────
let testQ = 0;

function initTest() {
  testQ = 0;
  state.testScore = 0;
  document.getElementById('test-dept-label').textContent =
    (deptNames[state.department] || 'Computer Science') + ' Department';
  document.getElementById('test-result').style.display = 'none';
  document.getElementById('test-area').style.display   = 'block';
  startTestTimer();
  renderTestQuestion();
}

function renderTestQuestion() {
  const area = document.getElementById('test-area');
  if (testQ >= testBank.length) {
    showTestResult();
    return;
  }
  const q = testBank[testQ];
  area.innerHTML = `
    <div class="quiz-card">
      <div class="quiz-qno">Q${testQ + 1} of ${testBank.length} — Monthly Assessment</div>
      <div class="quiz-q">${q.q}</div>
      <div class="quiz-options">
        ${q.options.map((opt, i) =>
          `<button class="quiz-option" onclick="answerTest(${i}, this)">${opt}</button>`
        ).join('')}
      </div>
      <div class="quiz-feedback" id="tfb"></div>
    </div>`;
}

function answerTest(idx, btn) {
  const q    = testBank[testQ];
  const fb   = document.getElementById('tfb');
  const btns = document.querySelectorAll('#test-area .quiz-option');
  btns.forEach(b => b.classList.add('disabled'));
  if (idx === q.answer) {
    btn.classList.add('correct');
    state.testScore += 100;
    fb.textContent = '✅ ' + q.explain;
    fb.className   = 'quiz-feedback show ok';
  } else {
    btn.classList.add('wrong');
    btns[q.answer].classList.add('correct');
    fb.textContent = '❌ ' + q.explain;
    fb.className   = 'quiz-feedback show bad';
  }
  setTimeout(() => { testQ++; renderTestQuestion(); }, 1500);
}

function showTestResult() {
  clearInterval(state.testTimerInterval);
  document.getElementById('test-area').style.display   = 'none';
  document.getElementById('test-result').style.display = 'block';
  document.getElementById('test-score-text').textContent =
    `Score: ${state.testScore} / ${testBank.length * 100} pts`;
  buildLeaderboard();
}

function startTestTimer() {
  clearInterval(state.testTimerInterval);
  state.testSeconds = 20 * 60;
  state.testTimerInterval = setInterval(() => {
    state.testSeconds--;
    const el = document.getElementById('test-timer');
    if (el) el.textContent = formatTime(state.testSeconds);
    if (state.testSeconds <= 0) {
      clearInterval(state.testTimerInterval);
      showTestResult();
    }
  }, 1000);
}

// ── Leaderboard ───────────────────────────────────────────
function buildLeaderboard() {
  // Inject current user's group into leaderboard
  const myScore = state.quizScore + state.testScore + Math.floor(Math.random() * 300);
  const myEntry = {
    rank:0, dept: deptNames[state.department] || 'Computer Science',
    group: `Group ${state.group?.name || 'Alpha'}`,
    members: `You + 2 members`, score: myScore
  };

  const sortedData = [...leaderboardData];
  // Re-rank including user
  sortedData.push({ ...myEntry, rank: 6 });
  sortedData.sort((a, b) => b.score - a.score);
  sortedData.forEach((e, i) => e.rank = i + 1);

  const lb = document.getElementById('leaderboard-list');
  lb.innerHTML = sortedData.slice(0, 5).map(e => {
    const rankClass = e.rank <= 3 ? `r${e.rank}` : '';
    const medal = e.rank === 1 ? '🥇' : e.rank === 2 ? '🥈' : e.rank === 3 ? '🥉' : `#${e.rank}`;
    return `
      <div class="lb-entry">
        <div class="lb-rank ${rankClass}">${medal}</div>
        <div style="flex:1">
          <div class="lb-dept">${e.dept}</div>
          <div class="lb-group">${e.group}</div>
          <div class="lb-members">${e.members}</div>
        </div>
        <div class="lb-score">${e.score.toLocaleString()}</div>
      </div>`;
  }).join('');

  // My rank card
  const myRank = sortedData.find(e => e.group.includes(state.group?.name || 'Alpha'));
  const card   = document.getElementById('my-rank-card');
  if (myRank) {
    card.innerHTML = `
      <div class="my-rank-pos">#${myRank.rank}</div>
      <div class="my-rank-info">
        <h3>${myRank.group}</h3>
        <p>${myRank.dept} · ${myRank.score.toLocaleString()} pts</p>
      </div>`;
  }
}

// ── Advanced Section ──────────────────────────────────────
function buildAdvanced() {
  const cList = document.getElementById('challenges-list');
  cList.innerHTML = challenges.map(c => `
    <div class="challenge-card">
      <div class="challenge-diff">${c.diff}</div>
      <div class="challenge-title">${c.title}</div>
      <div class="challenge-desc">${c.desc}</div>
    </div>`).join('');

  renderResources();
}

function renderResources() {
  const rList = document.getElementById('resources-list');
  const all   = [...defaultResources, ...state.resources];
  rList.innerHTML = all.map(r => `
    <div class="resource-card">
      <div class="resource-meta">
        <div class="resource-author-dot">${r.initial || r.author.charAt(0)}</div>
        <span class="resource-author">${r.author}</span>
        <span class="resource-time">${r.time}</span>
      </div>
      <div class="resource-title">${r.title}</div>
      <div class="resource-body">${r.body}</div>
    </div>`).join('');
}

function shareResource() {
  const title = document.getElementById('resource-title').value.trim();
  const body  = document.getElementById('resource-body').value.trim();
  if (!title || !body) { showToast('⚠️ Fill in title and content'); return; }
  state.resources.push({
    author: state.studentId || 'You', initial: (state.studentId || 'Y').charAt(0).toUpperCase(),
    time: 'just now', title, body
  });
  document.getElementById('resource-title').value = '';
  document.getElementById('resource-body').value  = '';
  renderResources();
  showToast('🚀 Resource shared with the community!');
}

// ── Toast Notification ────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── Page-specific Init Hooks ──────────────────────────────
// Observe page activation to trigger initialisation
const pageObserver = new MutationObserver(mutations => {
  mutations.forEach(m => {
    if (m.target.classList.contains('active')) {
      const id = m.target.id;
      if (id === 'page-quiz')        initQuiz();
      if (id === 'page-test')        initTest();
      if (id === 'page-leaderboard') buildLeaderboard();
      if (id === 'page-advanced')    buildAdvanced();
      if (id === 'page-admin')       buildAdminSyllabus();
    }
  });
});

document.querySelectorAll('.page').forEach(page => {
  pageObserver.observe(page, { attributes: true, attributeFilter: ['class'] });
});
