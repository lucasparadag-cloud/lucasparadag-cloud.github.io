// =========================
// Estado global
// =========================
const state = {
  currentScreen: 'welcome',

  // Mood
  moodData: [],
  selectedMood: null,

  // Comunidad
  communityMessages: [],
  likedMessages: new Set(),

  // Citas
  appointments: [],

  // Memory Game
  memory: {
    cards: [],
    flipped: [],
    locked: false
  },

  // Assistant (chat local)
  assistant: {
    messages: [
      { role: 'bot', text: 'Hola 👋 Soy tu asistente. ¿En qué te ayudo hoy?' }
    ]
  },

  // Relaxation
  relaxation: {
    selectedTrackId: null,
    isPlaying: false
  },

  // Juegos simples
  pairs: {
    targetPairs: [
      { left: 'Sol', right: '☀️' },
      { left: 'Luna', right: '🌙' },
      { left: 'Flor', right: '🌸' },
      { left: 'Corazón', right: '❤️' }
    ],
    selectedLeft: null,
    matched: new Set()
  },

  sequences: {
    level: 1,
    target: [],
    showResult: null // 'ok' | 'fail' | null
  },

  words: {
    pool: ['Calma', 'Alegría', 'Paz', 'Esperanza', 'Amor', 'Respirar', 'Gracias', 'Confianza'],
    picked: [],
    goal: 3,
    done: false
  }
};

// Estado pantalla especialistas
const specialistsState = {
  selectedSpecialist: null,
  showScheduling: false,
  selectedDate: null,
  selectedTime: null,
  showConfirmation: false
};

// DOM refs
const $app = document.getElementById('app');
const $bottomNav = document.getElementById('bottomNav');

// =========================
// Helpers
// =========================
function navigate(screen) {
  state.currentScreen = screen;

  if (screen === 'memory-game') initMemoryGame();
  if (screen === 'pairs-game') initPairs();
  if (screen === 'sequences-game') initSequences();
  if (screen === 'words-game') initWords();

  render();
}

function saveMood(mood) {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const today = days[new Date().getDay()];
  state.moodData.push({ day: today, mood });
  state.moodData = state.moodData.slice(-7);
}

function publishMessage(text) {
  state.communityMessages.unshift({
    id: Date.now(),
    text,
    author: 'Tú',
    likes: 0
  });
}

function likeMessage(messageId) {
  const liked = state.likedMessages.has(messageId);
  if (liked) state.likedMessages.delete(messageId);
  else state.likedMessages.add(messageId);

  state.communityMessages = state.communityMessages.map(m => {
    if (m.id !== messageId) return m;
    return { ...m, likes: m.likes + (liked ? -1 : 1) };
  });

  render();
}

function bookAppointment(appointment) {
  state.appointments.push(appointment);
}

function cancelAppointment(appointmentId) {
  state.appointments = state.appointments.filter(a => a.id !== appointmentId);
  render();
}

function deleteAllData() {
  state.moodData = [];
  state.selectedMood = null;

  state.communityMessages = [];
  state.likedMessages = new Set();

  state.appointments = [];

  specialistsState.selectedSpecialist = null;
  specialistsState.showScheduling = false;
  specialistsState.selectedDate = null;
  specialistsState.selectedTime = null;
  specialistsState.showConfirmation = false;

  state.memory = { cards: [], flipped: [], locked: false };

  state.assistant.messages = [{ role: 'bot', text: 'Datos borrados ✅ ¿En qué te ayudo ahora?' }];

  state.relaxation = { selectedTrackId: null, isPlaying: false };

  initPairs();
  initSequences();
  initWords();

  render();
}

// =========================
// Memory Game (Encuentra las parejas)
// =========================
function initMemoryGame() {
  const icons = ['❤️', '⭐', '☀️', '🌙', '🌸', '☁️'];

  const pairs = icons.flatMap((icon, idx) => ([
    { id: idx * 2, pairId: idx, icon, isFlipped: false, isMatched: false },
    { id: idx * 2 + 1, pairId: idx, icon, isFlipped: false, isMatched: false }
  ]));

  pairs.sort(() => Math.random() - 0.5);

  state.memory.cards = pairs;
  state.memory.flipped = [];
  state.memory.locked = false;
}

function handleMemoryCardClick(index) {
  const mem = state.memory;
  if (mem.locked) return;
  if (mem.flipped.length === 2) return;

  const card = mem.cards[index];
  if (!card || card.isFlipped || card.isMatched) return;

  card.isFlipped = true;
  mem.flipped.push(index);

  if (mem.flipped.length === 2) {
    mem.locked = true;
    const [aIdx, bIdx] = mem.flipped;
    const a = mem.cards[aIdx];
    const b = mem.cards[bIdx];

    if (a.pairId === b.pairId) {
      setTimeout(() => {
        a.isMatched = true;
        b.isMatched = true;
        mem.flipped = [];
        mem.locked = false;
        render();
      }, 450);
    } else {
      setTimeout(() => {
        a.isFlipped = false;
        b.isFlipped = false;
        mem.flipped = [];
        mem.locked = false;
        render();
      }, 850);
    }
  }

  render();
}

function resetMemoryGame() {
  initMemoryGame();
  render();
}

// =========================
// Juego Pares (simple)
// =========================
function initPairs() {
  state.pairs.selectedLeft = null;
  state.pairs.matched = new Set();
}

function handlePairLeft(i) {
  state.pairs.selectedLeft = i;
  render();
}

function handlePairRight(i) {
  const left = state.pairs.selectedLeft;
  if (left == null) return;

  if (left === i) state.pairs.matched.add(i);
  state.pairs.selectedLeft = null;
  render();
}

// =========================
// Juego Secuencias (simple)
// =========================
function initSequences() {
  const level = state.sequences.level;
  const start = 2 + (level - 1);
  const step = 2;
  state.sequences.target = [start, start + step, start + step * 2, null, start + step * 4];
  state.sequences.showResult = null;
}

function pickSequence(value) {
  const seq = state.sequences.target;
  const correct = seq[2] + 2;
  state.sequences.showResult = (Number(value) === correct) ? 'ok' : 'fail';
  render();
}

function nextSequence() {
  state.sequences.level += 1;
  initSequences();
  render();
}

// =========================
// Juego Palabras (simple)
// =========================
function initWords() {
  state.words.picked = [];
  state.words.done = false;
  state.words.goal = 3;
}

function toggleWord(word) {
  if (state.words.done) return;
  const idx = state.words.picked.indexOf(word);
  if (idx >= 0) state.words.picked.splice(idx, 1);
  else state.words.picked.push(word);

  if (state.words.picked.length >= state.words.goal) state.words.done = true;
  render();
}

// =========================
// Assistant (chat local)
// =========================
function assistantReply(userText) {
  const t = userText.toLowerCase();

  if (t.includes('hola')) return 'Hola 😊 ¿Cómo te sientes hoy?';
  if (t.includes('ans') || t.includes('ansiedad')) return 'Respiremos juntos: inhala 4s, sostiene 2s, exhala 6s. ¿Quieres que te guíe 1 minuto?';
  if (t.includes('triste') || t.includes('pena')) return 'Lo siento. ¿Quieres contarme qué pasó? También podemos hacer un juego o relajación.';
  if (t.includes('juego')) return 'Puedes ir a Juegos 🎮 y probar Memoria, Pares, Secuencias o Palabras.';
  if (t.includes('cita') || t.includes('especialista')) return 'En Especialistas puedes agendar una cita. ¿Quieres que te guíe?';
  if (t.includes('gracias')) return 'De nada 💙 Estoy contigo.';

  return 'Te leo. ¿Prefieres hablar de cómo te sientes, hacer un juego, o relajarte con música?';
}

// =========================
// Screens
// =========================
function WelcomeScreen() {
  return `
    <section class="welcome">
      <div class="welcome-container">
        <div class="welcome-block">
          <div class="welcome-logo-wrap">
            <img src="logo.png" alt="Nirvana Logo" class="welcome-logo" />
          </div>
          <h1 class="welcome-title">Nirvana</h1>
          <p class="welcome-subtitle">Bienestar emocional para adultos mayores</p>
        </div>

        <button class="welcome-button" id="startBtn" type="button">
          Comenzar
        </button>
      </div>
    </section>
  `;
}

function HomeScreen() {
  return `
    <section class="screen">
      <h1>Inicio</h1>
      <p>Accesos rápidos:</p>

      <div class="row">
        <button class="btn quick-btn" data-go="mood">Estado de ánimo</button>
        <button class="btn quick-btn" data-go="mood-history">Historial ánimo</button>
        <button class="btn quick-btn" data-go="assistant">Asistente</button>
        <button class="btn quick-btn" data-go="relaxation">Relajación</button>
        <button class="btn quick-btn" data-go="specialists">Especialistas</button>
      </div>
    </section>
  `;
}

function GamesScreen() {
  return `
    <section class="screen">
      <h1>Juegos</h1>
      <p>Elige uno:</p>
      <div class="row">
        <button class="btn" data-go="memory-game">Memoria</button>
        <button class="btn" data-go="pairs-game">Pares</button>
        <button class="btn" data-go="sequences-game">Secuencias</button>
        <button class="btn" data-go="words-game">Palabras</button>
      </div>
    </section>
  `;
}

function MemoryGameScreen() {
  const cards = state.memory.cards;
  const allMatched = cards.length && cards.every(c => c.isMatched);

  const grid = cards.map((c, idx) => {
    const faceUp = c.isFlipped || c.isMatched;
    return `
      <button
        class="mem-card ${faceUp ? 'flipped' : ''} ${c.isMatched ? 'matched' : ''}"
        data-mem-card="${idx}"
        type="button"
        ${c.isMatched ? 'disabled' : ''}
      >
        <span class="mem-icon">${faceUp ? c.icon : ''}</span>
      </button>
    `;
  }).join('');

  return `
    <section class="screen">
      <div class="topbar">
        <button class="back-btn" data-go="games" type="button">←</button>
        <h2 class="title-center">Memoria</h2>
        <div class="spacer"></div>
      </div>

      ${allMatched ? `
        <div class="hero green" style="text-align:center">
          <h3>¡Muy bien! 🎉</h3>
          <p>Completaste todas las parejas.</p>
          <button class="btn" id="memResetBtn" type="button">Jugar de nuevo</button>
        </div>
      ` : `
        <div class="mem-grid">
          ${grid}
        </div>

        <div class="row" style="margin-top:14px">
          <button class="btn gray full" id="memResetBtn" type="button">Reiniciar</button>
        </div>
      `}
    </section>
  `;
}

function PairsGameScreen() {
  const items = state.pairs.targetPairs;

  const leftHTML = items.map((p, i) => {
    const done = state.pairs.matched.has(i);
    const active = state.pairs.selectedLeft === i;
    return `
      <button class="word-chip ${active ? 'active' : ''}" data-pair-left="${i}" type="button" ${done ? 'disabled' : ''}>
        ${escapeHtml(p.left)} ${done ? '✅' : ''}
      </button>
    `;
  }).join('');

  const rightsHTML = items
    .map((p, i) => ({ i, right: p.right }))
    .sort(() => Math.random() - 0.5)
    .map(x => {
      const done = state.pairs.matched.has(x.i);
      return `
        <button class="word-chip" data-pair-right="${x.i}" type="button" ${done ? 'disabled' : ''}>
          ${escapeHtml(x.right)}
        </button>
      `;
    }).join('');

  const allDone = state.pairs.matched.size === items.length;

  return `
    <section class="screen">
      <div class="topbar">
        <button class="back-btn" data-go="games" type="button">←</button>
        <h2 class="title-center">Pares</h2>
        <div class="spacer"></div>
      </div>

      <div class="hero blue" style="text-align:center">
        <h3>Une palabra con su símbolo</h3>
        <p>Primero toca una palabra, luego toca su símbolo.</p>
      </div>

      ${allDone ? `
        <div class="hero green" style="text-align:center">
          <h3>¡Excelente! 🎉</h3>
          <p>Completaste todos los pares.</p>
          <button class="btn full" id="pairsResetBtn" type="button">Jugar de nuevo</button>
        </div>
      ` : ''}

      <div class="card">
        <h3>Palabras</h3>
        <div class="word-grid">${leftHTML}</div>
      </div>

      <div class="card">
        <h3>Símbolos</h3>
        <div class="word-grid">${rightsHTML}</div>
      </div>
    </section>
  `;
}

function SequencesGameScreen() {
  const seq = state.sequences.target;
  const missingAnswer = seq[2] + 2;

  const options = [missingAnswer, missingAnswer + 2, missingAnswer - 2, missingAnswer + 4]
    .sort(() => Math.random() - 0.5);

  const seqHtml = seq.map(n => `<div class="seq-item">${n == null ? '❓' : n}</div>`).join('');

  const optsHtml = options.map(n => `
    <button class="btn full" data-seq-pick="${n}" type="button">${n}</button>
  `).join('');

  return `
    <section class="screen">
      <div class="topbar">
        <button class="back-btn" data-go="games" type="button">←</button>
        <h2 class="title-center">Secuencias</h2>
        <div class="spacer"></div>
      </div>

      <div class="hero blue" style="text-align:center">
        <h3>Completa la secuencia</h3>
        <p>Elige el número que falta.</p>
      </div>

      <div class="card">
        <div class="sequence">${seqHtml}</div>
      </div>

      ${state.sequences.showResult === 'ok' ? `
        <div class="hero green" style="text-align:center">
          <h3>¡Correcto! ✅</h3>
          <button class="btn full" id="seqNextBtn" type="button">Siguiente</button>
        </div>
      ` : state.sequences.showResult === 'fail' ? `
        <div class="hero red" style="text-align:center">
          <h3>Ups 😅</h3>
          <p>Intenta de nuevo.</p>
          <button class="btn full" id="seqRetryBtn" type="button">Reintentar</button>
        </div>
      ` : `
        <div class="row">${optsHtml}</div>
      `}
    </section>
  `;
}

function WordsGameScreen() {
  const pool = state.words.pool;
  const picked = new Set(state.words.picked);

  const chips = pool.map(w => `
    <button class="word-chip ${picked.has(w) ? 'active' : ''}" data-word="${escapeHtml(w)}" type="button" ${state.words.done ? 'disabled' : ''}>
      ${escapeHtml(w)}
    </button>
  `).join('');

  return `
    <section class="screen">
      <div class="topbar">
        <button class="back-btn" data-go="games" type="button">←</button>
        <h2 class="title-center">Palabras</h2>
        <div class="spacer"></div>
      </div>

      <div class="hero blue" style="text-align:center">
        <h3>Elige ${state.words.goal} palabras</h3>
        <p>Selecciona palabras que te hagan sentir bien.</p>
      </div>

      ${state.words.done ? `
        <div class="hero green" style="text-align:center">
          <h3>¡Listo! 🌟</h3>
          <p>Elegiste: <b>${escapeHtml(state.words.picked.join(', '))}</b></p>
          <button class="btn full" id="wordsResetBtn" type="button">Jugar de nuevo</button>
        </div>
      ` : `
        <div class="card">
          <h3>Palabras</h3>
          <div class="grid2">${chips}</div>
        </div>
      `}
    </section>
  `;
}

function MoodScreen() {
  const moods = [
    { value: 5, emoji: '😊', label: 'Muy bien', color: '#7ED321' },
    { value: 4, emoji: '🙂', label: 'Bien',     color: '#A8E063' },
    { value: 3, emoji: '😐', label: 'Neutral',  color: '#FFD93D' },
    { value: 2, emoji: '😟', label: 'Mal',      color: '#FFA726' },
    { value: 1, emoji: '😢', label: 'Muy mal',  color: '#FF6B6B' }
  ];

  const selected = state.selectedMood ?? null;

  const cardsHTML = moods.map(m => {
    const isActive = selected === m.value;
    return `
      <button class="mood-card ${isActive ? 'active' : ''}" data-mood-select="${m.value}" type="button">
        <div class="mood-row">
          <div class="mood-emoji" style="background:${m.color}30">${m.emoji}</div>
          <div class="mood-label"><h3>${m.label}</h3></div>
        </div>
      </button>
    `;
  }).join('');

  return `
    <section class="screen">
      <h1 style="text-align:center;margin-bottom:16px;">¿Cómo te sientes hoy?</h1>

      <div class="mood-list">${cardsHTML}</div>

      <button class="btn full ${selected ? '' : 'outline'}" id="moodRegisterBtn" type="button">
        Registrar estado
      </button>
    </section>
  `;
}

function MoodHistoryScreen() {
  const data = state.moodData.length ? state.moodData : [
    { day: 'Lun', mood: 3 }, { day: 'Mar', mood: 4 }, { day: 'Mié', mood: 3 },
    { day: 'Jue', mood: 5 }, { day: 'Vie', mood: 4 }, { day: 'Sáb', mood: 4 }, { day: 'Dom', mood: 5 }
  ];

  const bars = data.map(d => {
    const h = Math.max(12, (d.mood / 5) * 200);
    return `
      <div class="bar-wrap">
        <div class="bar" style="height:${h}px"></div>
        <div class="bar-label">${d.day}</div>
      </div>
    `;
  }).join('');

  return `
    <section class="screen">
      <h1 style="text-align:center">Tu progreso emocional</h1>
      <div class="card">
        <h3 style="text-align:center;margin-bottom:10px;">Últimos 7 días</h3>
        <div class="chart">${bars}</div>
      </div>

      <button class="btn outline full" data-go="home" type="button">Volver</button>
    </section>
  `;
}

function CommunityScreen() {
  const defaultMessages = [
    { id: 1, text: 'Hoy me siento mejor', author: 'María', likes: 12 },
    { id: 2, text: 'Les deseo un buen día', author: 'Carlos', likes: 8 },
    { id: 3, text: 'Jugué memoria y me relajé', author: 'Ana', likes: 15 },
    { id: 4, text: 'Comparto buenas energías', author: 'Pedro', likes: 10 }
  ];

  const messages = state.communityMessages.length ? state.communityMessages : defaultMessages;

  const list = messages.map(m => {
    const isLiked = state.likedMessages.has(m.id);
    return `
      <div class="card">
        <p style="font-size:18px;margin-bottom:10px;">${escapeHtml(m.text)}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span class="msg-author">— ${escapeHtml(m.author)}</span>
          <button class="like-btn" data-like="${m.id}" type="button">
            <span style="font-size:22px">${isLiked ? '❤️' : '🤍'}</span>
            <span style="font-weight:900;color:#666">${m.likes}</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  return `
    <section class="screen">
      <h1 style="text-align:center;margin-bottom:16px;">Comunidad</h1>

      ${list}

      <button class="btn secondary full" data-go="create-message" type="button">
        Enviar saludo
      </button>
    </section>
  `;
}

function CreateMessageScreen() {
  return `
    <section class="screen">
      <h1>Enviar saludo</h1>
      <textarea id="msgText" placeholder="Escribe algo..."></textarea>
      <div class="row" style="margin-top:10px">
        <button class="btn" id="publishBtn" type="button">Publicar</button>
        <button class="btn outline" data-go="community" type="button">Cancelar</button>
      </div>
    </section>
  `;
}

function AssistantScreen() {
  const log = state.assistant.messages.map(m => `
    <div class="bubble ${m.role === 'user' ? 'user' : 'bot'}">
      ${escapeHtml(m.text)}
    </div>
  `).join('');

  return `
    <section class="screen">
      <div class="topbar">
        <button class="back-btn" data-go="home" type="button">←</button>
        <h2 class="title-center">Asistente</h2>
        <div class="spacer"></div>
      </div>

      <div class="chat">
        <div class="chat-log" id="chatLog">${log}</div>

        <div class="chat-input">
          <input id="chatText" placeholder="Escribe aquí..." />
          <button class="btn" id="chatSendBtn" type="button">Enviar</button>
        </div>

        <button class="btn outline full" data-go="home" type="button">Volver</button>
      </div>
    </section>
  `;
}

// ✅ RELAJACIÓN (con YouTube iframe)
function RelaxationMusicScreen() {
  const tracks = [
    { id:'rain',       title:'Lluvia suave',        emoji:'☁️', color:'#4A90E2', videoId:'Gnykob42-sk' },
    { id:'ocean',      title:'Olas del mar',        emoji:'🌊', color:'#5BA3D0', videoId:'lFQY0sH1U_c' },
    { id:'forest',     title:'Sonidos del bosque',  emoji:'🌬️', color:'#7ED321', videoId:'DUmn3fwBgww' },
    { id:'meditation', title:'Meditación guiada',   emoji:'🎵', color:'#9B59B6', videoId:'IShkpOm63gg' }
  ];

  const { selectedTrackId, isPlaying } = state.relaxation;
  const selected = tracks.find(t => t.id === selectedTrackId) || null;

  const listHTML = tracks.map(t => {
    const isSelected = t.id === selectedTrackId;
    return `
      <button
        class="relax-track ${isSelected ? 'active' : ''}"
        data-relax-select="${t.id}"
        type="button"
      >
        <div class="relax-left" style="background:${t.color}30">
          <div class="relax-emoji">${t.emoji}</div>
        </div>
        <div class="relax-info">
          <h3>${escapeHtml(t.title)}</h3>
          ${isSelected && isPlaying ? `<p class="relax-playing">▶ Reproduciendo...</p>` : ``}
        </div>
      </button>
    `;
  }).join('');

  const playerHTML = selected ? `
    <div class="relax-player hero blue">
      <div style="text-align:center;margin-bottom:10px">
        <div style="font-size:56px">${selected.emoji}</div>
        <h3 style="color:#fff;margin:6px 0 0">${escapeHtml(selected.title)}</h3>
      </div>

      <div class="relax-iframe-wrap">
        <iframe
          width="100%"
          height="200"
          src="https://www.youtube.com/embed/${selected.videoId}?autoplay=${isPlaying ? '1' : '0'}&controls=1&modestbranding=1&rel=0"
          title="${escapeHtml(selected.title)}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>

      <div class="relax-controls">
        <button class="relax-playbtn" id="relaxToggleBtn" type="button" aria-label="Play/Pause">
          ${isPlaying ? '⏸️' : '▶️'}
        </button>
      </div>

      <div class="relax-hint">
        <p>Usa los controles del video para ajustar el volumen</p>
      </div>
    </div>
  ` : `
    <div class="card" style="text-align:center">
      <div style="font-size:64px;opacity:.6;margin-bottom:8px">🎧</div>
      <p style="color:#777;font-weight:800">Selecciona una música para comenzar</p>
    </div>
  `;

  return `
    <section class="screen">
      <div class="topbar">
        <button class="back-btn" data-go="home" type="button">←</button>
        <h2 class="title-center">Relajación</h2>
        <div class="spacer"></div>
      </div>

      <h1 style="text-align:center;margin-bottom:14px">Música de Relajación</h1>

      <div class="relax-list">
        ${listHTML}
      </div>

      ${playerHTML}
    </section>
  `;
}

function SpecialistsScreen() {
  const specialists = [
    { id: 1, name: 'Dra. María Carmen López', specialty: 'Psicóloga Clínica especializada en adultos mayores', experience: '15 años de experiencia', rating: 4.9, available: true,  photo: '👩‍⚕️' },
    { id: 2, name: 'Dr. Roberto Martínez',      specialty: 'Terapeuta de ansiedad y estrés',               experience: '12 años de experiencia', rating: 4.8, available: true,  photo: '👨‍⚕️' },
    { id: 3, name: 'Dra. Ana Fernández',        specialty: 'Psicóloga Geriátrica',                         experience: '20 años de experiencia', rating: 5.0, available: false, photo: '👩‍⚕️' },
    { id: 4, name: 'Dr. Carlos Sánchez',        specialty: 'Terapeuta cognitivo-conductual',              experience: '10 años de experiencia', rating: 4.7, available: true,  photo: '👨‍⚕️' },
  ];

  const availableTimes = ['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00'];

  function getAvailableDates() {
    const dates = [];
    const today = new Date();
    let daysChecked = 0;
    while (dates.length < 7 && daysChecked < 14) {
      const d = new Date(today);
      d.setDate(today.getDate() + daysChecked);
      const day = d.getDay();
      if (day !== 0 && day !== 6) {
        const short = d.toLocaleDateString('es-CL', { weekday:'short', day:'numeric', month:'short' });
        const full  = d.toLocaleDateString('es-CL', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
        dates.push({ short, full });
      }
      daysChecked++;
    }
    return dates;
  }

  // Confirmación
  if (specialistsState.showConfirmation && specialistsState.selectedSpecialist && specialistsState.selectedDate && specialistsState.selectedTime) {
    const s = specialistsState.selectedSpecialist;
    return `
      <section class="screen">
        <div class="hero green" style="text-align:center">
          <div style="font-size:48px">✅</div>
          <h3>¡Cita Agendada!</h3>
          <p>Tu cita ha sido confirmada exitosamente</p>
        </div>

        <div class="card">
          <h3 style="text-align:center">Detalles de la Cita</h3>
          <p><b>${escapeHtml(s.name)}</b></p>
          <p>${escapeHtml(s.specialty)}</p>
          <p>📅 ${escapeHtml(specialistsState.selectedDate)}</p>
          <p>🕒 ${escapeHtml(specialistsState.selectedTime)}</p>
        </div>

        <div class="row">
          <button class="btn full" id="spGoProfileBtn" type="button">Ver mis Citas en Perfil</button>
          <button class="btn outline full" data-go="assistant" type="button">Volver al Asistente</button>
          <button class="btn gray full" id="spBackBtn" type="button">Volver</button>
        </div>
      </section>
    `;
  }

  // Agendar
  if (specialistsState.showScheduling && specialistsState.selectedSpecialist) {
    const dates = getAvailableDates();

    const datesHTML = dates.map(d => {
      const active = specialistsState.selectedDate === d.full;
      return `
        <button class="pick ${active ? 'active-blue' : ''}" data-pick-date="${escapeHtml(d.full)}" type="button">
          ${escapeHtml(d.short)}
        </button>
      `;
    }).join('');

    const timesHTML = availableTimes.map(t => {
      const active = specialistsState.selectedTime === t;
      return `
        <button class="pick ${active ? 'active-green' : ''}" data-pick-time="${t}" type="button">
          ${t}
        </button>
      `;
    }).join('');

    return `
      <section class="screen">
        <div class="topbar">
          <button class="back-btn" id="spBackBtn" type="button">←</button>
          <h2 class="title-center">Agendar Cita</h2>
          <div class="spacer"></div>
        </div>

        <div class="card">
          <h3>📅 Selecciona una Fecha</h3>
          <div class="grid2">${datesHTML}</div>
        </div>

        ${specialistsState.selectedDate ? `
          <div class="card">
            <h3>🕒 Selecciona una Hora</h3>
            <div class="grid2">${timesHTML}</div>
          </div>
        ` : ''}

        <button
          class="btn full ${(!specialistsState.selectedDate || !specialistsState.selectedTime) ? 'gray' : ''}"
          id="spConfirmBtn"
          type="button"
          ${(!specialistsState.selectedDate || !specialistsState.selectedTime) ? 'disabled' : ''}
        >
          ✅ Confirmar Cita
        </button>
      </section>
    `;
  }

  // Lista
  const listHTML = specialists.map(s => `
    <div class="card">
      <div style="display:flex;gap:12px">
        <div style="font-size:44px">${s.photo}</div>
        <div style="flex:1">
          <h3 style="margin:0 0 6px">${escapeHtml(s.name)}</h3>
          <p style="margin:0 0 6px;color:#666">${escapeHtml(s.specialty)}</p>
          <small>${escapeHtml(s.experience)}</small>
          <div style="margin-top:8px;font-weight:900">⭐ ${s.rating.toFixed(1)}</div>
        </div>
      </div>

      ${s.available
        ? `<button class="btn full" data-request="${s.id}" type="button">📅 Agendar Cita</button>`
        : `<button class="btn full gray" disabled type="button">No disponible</button>`
      }
    </div>
  `).join('');

  return `
    <section class="screen">
      <div class="topbar">
        <button class="back-btn" data-go="assistant" type="button">←</button>
        <h2 class="title-center">Especialistas</h2>
        <div class="spacer"></div>
      </div>

      <div class="hero blue" style="text-align:center">
        <h3>Apoyo Profesional</h3>
        <p>Conecta con especialistas certificados</p>
      </div>

      ${listHTML}

      <div id="spData" data-json='${JSON.stringify(specialists)}' style="display:none"></div>
    </section>
  `;
}

function ProfileScreen() {
  const apts = state.appointments.length
    ? state.appointments.map(a => `
        <div class="card">
          <p><b>${escapeHtml(a.name)}</b></p>
          <p>${escapeHtml(a.date)}</p>
          <button class="btn outline full" data-cancel="${a.id}" type="button">Cancelar</button>
        </div>
      `).join('')
    : `<p>No tienes citas.</p>`;

  return `
    <section class="screen">
      <h1 style="text-align:center">Perfil</h1>

      <div class="card">
        <h3>Citas</h3>
        ${apts}
      </div>

      <button class="btn outline full" id="deleteAllBtn" type="button">
        Borrar datos
      </button>
    </section>
  `;
}

// =========================
// Render + eventos
// =========================
function getBottomNavScreen() {
  const s = state.currentScreen;
  if (['home', 'games', 'community', 'profile'].includes(s)) return s;
  if (['memory-game', 'pairs-game', 'sequences-game', 'words-game'].includes(s)) return 'games';
  if (s.startsWith('mood')) return 'home';
  if (s === 'create-message') return 'community';
  return 'home';
}

function render() {
  const showBottomNav = state.currentScreen !== 'welcome';
  $bottomNav.classList.toggle('hidden', !showBottomNav);

  const active = getBottomNavScreen();
  [...$bottomNav.querySelectorAll('.nav-btn')].forEach(btn => {
    btn.classList.toggle('active', btn.dataset.screen === active);
  });

  let html = '';
  switch (state.currentScreen) {
    case 'welcome': html = WelcomeScreen(); break;
    case 'home': html = HomeScreen(); break;
    case 'games': html = GamesScreen(); break;

    case 'memory-game': html = MemoryGameScreen(); break;
    case 'pairs-game': html = PairsGameScreen(); break;
    case 'sequences-game': html = SequencesGameScreen(); break;
    case 'words-game': html = WordsGameScreen(); break;

    case 'mood': html = MoodScreen(); break;
    case 'mood-history': html = MoodHistoryScreen(); break;

    case 'community': html = CommunityScreen(); break;
    case 'create-message': html = CreateMessageScreen(); break;

    case 'assistant': html = AssistantScreen(); break;
    case 'relaxation': html = RelaxationMusicScreen(); break;

    case 'specialists': html = SpecialistsScreen(); break;
    case 'profile': html = ProfileScreen(); break;

    default: html = HomeScreen();
  }

  $app.innerHTML = html;
  wireScreenEvents();
}

function wireScreenEvents() {
  // navegación genérica por data-go
  $app.querySelectorAll('[data-go]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.go));
  });

  // Welcome
  const startBtn = document.getElementById('startBtn');
  if (startBtn) startBtn.addEventListener('click', () => navigate('home'));

  // Mood select
  $app.querySelectorAll('[data-mood-select]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedMood = Number(btn.dataset.moodSelect);
      render();
    });
  });

  // Mood register
  const moodRegisterBtn = document.getElementById('moodRegisterBtn');
  if (moodRegisterBtn) {
    moodRegisterBtn.addEventListener('click', () => {
      if (state.selectedMood == null) return;
      saveMood(state.selectedMood);
      state.selectedMood = null;
      navigate('mood-history');
    });
  }

  // Publish community msg
  const publishBtn = document.getElementById('publishBtn');
  if (publishBtn) {
    publishBtn.addEventListener('click', () => {
      const text = (document.getElementById('msgText').value || '').trim();
      if (!text) return;
      publishMessage(text);
      navigate('community');
    });
  }

  // Like
  $app.querySelectorAll('[data-like]').forEach(btn => {
    btn.addEventListener('click', () => likeMessage(Number(btn.dataset.like)));
  });

  // Cancel appointments
  $app.querySelectorAll('[data-cancel]').forEach(btn => {
    btn.addEventListener('click', () => cancelAppointment(Number(btn.dataset.cancel)));
  });

  // Delete all
  const deleteAllBtn = document.getElementById('deleteAllBtn');
  if (deleteAllBtn) deleteAllBtn.addEventListener('click', deleteAllData);

  // Specialists events
  const spGoProfileBtn = document.getElementById('spGoProfileBtn');
  if (spGoProfileBtn) spGoProfileBtn.addEventListener('click', () => navigate('profile'));

  const spBackBtn = document.getElementById('spBackBtn');
  if (spBackBtn) spBackBtn.addEventListener('click', () => {
    specialistsState.showScheduling = false;
    specialistsState.showConfirmation = false;
    specialistsState.selectedSpecialist = null;
    specialistsState.selectedDate = null;
    specialistsState.selectedTime = null;
    render();
  });

  // pedir agendar desde lista
  $app.querySelectorAll('[data-request]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dataEl = document.getElementById('spData');
      const specialists = dataEl ? JSON.parse(dataEl.dataset.json) : [];
      const id = Number(btn.dataset.request);
      const found = specialists.find(x => x.id === id);
      if (!found) return;

      specialistsState.selectedSpecialist = found;
      specialistsState.showScheduling = true;
      specialistsState.showConfirmation = false;
      specialistsState.selectedDate = null;
      specialistsState.selectedTime = null;
      render();
    });
  });

  // seleccionar fecha
  $app.querySelectorAll('[data-pick-date]').forEach(btn => {
    btn.addEventListener('click', () => {
      specialistsState.selectedDate = btn.dataset.pickDate;
      specialistsState.selectedTime = null;
      render();
    });
  });

  // seleccionar hora
  $app.querySelectorAll('[data-pick-time]').forEach(btn => {
    btn.addEventListener('click', () => {
      specialistsState.selectedTime = btn.dataset.pickTime;
      render();
    });
  });

  // confirmar cita
  const spConfirmBtn = document.getElementById('spConfirmBtn');
  if (spConfirmBtn) {
    spConfirmBtn.addEventListener('click', () => {
      if (!specialistsState.selectedSpecialist) return;
      if (!specialistsState.selectedDate || !specialistsState.selectedTime) return;

      bookAppointment({
        id: Date.now(),
        name: specialistsState.selectedSpecialist.name,
        date: `${specialistsState.selectedDate} — ${specialistsState.selectedTime}`
      });

      specialistsState.showConfirmation = true;
      render();
    });
  }

  // Memory game events
  $app.querySelectorAll('[data-mem-card]').forEach(btn => {
    btn.addEventListener('click', () => handleMemoryCardClick(Number(btn.dataset.memCard)));
  });

  const memResetBtn = document.getElementById('memResetBtn');
  if (memResetBtn) memResetBtn.addEventListener('click', resetMemoryGame);

  // Pairs game events
  $app.querySelectorAll('[data-pair-left]').forEach(btn => {
    btn.addEventListener('click', () => handlePairLeft(Number(btn.dataset.pairLeft)));
  });
  $app.querySelectorAll('[data-pair-right]').forEach(btn => {
    btn.addEventListener('click', () => handlePairRight(Number(btn.dataset.pairRight)));
  });
  const pairsResetBtn = document.getElementById('pairsResetBtn');
  if (pairsResetBtn) pairsResetBtn.addEventListener('click', () => { initPairs(); render(); });

  // Sequences events
  $app.querySelectorAll('[data-seq-pick]').forEach(btn => {
    btn.addEventListener('click', () => pickSequence(btn.dataset.seqPick));
  });
  const seqNextBtn = document.getElementById('seqNextBtn');
  if (seqNextBtn) seqNextBtn.addEventListener('click', nextSequence);
  const seqRetryBtn = document.getElementById('seqRetryBtn');
  if (seqRetryBtn) seqRetryBtn.addEventListener('click', () => { initSequences(); render(); });

  // Words events
  $app.querySelectorAll('[data-word]').forEach(btn => {
    btn.addEventListener('click', () => toggleWord(btn.dataset.word));
  });
  const wordsResetBtn = document.getElementById('wordsResetBtn');
  if (wordsResetBtn) wordsResetBtn.addEventListener('click', () => { initWords(); render(); });

  // Assistant events
  const chatSendBtn = document.getElementById('chatSendBtn');
  if (chatSendBtn) {
    const send = () => {
      const input = document.getElementById('chatText');
      const text = (input?.value || '').trim();
      if (!text) return;

      state.assistant.messages.push({ role: 'user', text });
      state.assistant.messages.push({ role: 'bot', text: assistantReply(text) });

      render();

      const log = document.getElementById('chatLog');
      if (log) log.scrollTop = log.scrollHeight;
    };

    chatSendBtn.addEventListener('click', send);

    const chatText = document.getElementById('chatText');
    if (chatText) {
      chatText.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') send();
      });

      const log = document.getElementById('chatLog');
      if (log) log.scrollTop = log.scrollHeight;
    }
  }

  // Relaxation: seleccionar pista
  $app.querySelectorAll('[data-relax-select]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.relaxation.selectedTrackId = btn.dataset.relaxSelect;
      state.relaxation.isPlaying = true;
      render();
    });
  });

  // Relaxation: play/pause
  const relaxToggleBtn = document.getElementById('relaxToggleBtn');
  if (relaxToggleBtn) {
    relaxToggleBtn.addEventListener('click', () => {
      state.relaxation.isPlaying = !state.relaxation.isPlaying;
      render();
    });
  }
}

// Bottom nav click
$bottomNav.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-screen]');
  if (!btn) return;
  navigate(btn.dataset.screen);
});

// Utils
function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// Inicial
initPairs();
initSequences();
initWords();
render();