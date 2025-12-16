// -------------------- STATE --------------------
const state = {
  currentScreen: 'welcome',

  moodData: [],                 // [{day:'Lun', mood:3}, ...] últimos 7

  communityMessages: [],        // [{id,text,author,likes}, ...]
  likedMessages: new Set(),     // Set de ids (likes)

  // Citas como OBJETOS:
  // { id, specialistId, specialistName, date, time, specialty }
  appointments: [],

  // Perfil (persistencia simple en memoria)
  profileData: {
    name: 'María González',
    age: '68',
    favoriteGames: 'Memoria, Parejas'
  }
};

// -------------------- UI/LOCAL STATE (Profile) --------------------
const profileUI = {
  isEditing: false,
  showDeleteConfirmation: false,
  editData: { ...state.profileData }
};

// -------------------- GAME: SEQUENCES --------------------
const seq = {
  sequence: [],
  user: [],
  playing: false,
  turn: false,
  score: 0,
  round: 1,
  active: null,
  over: false
};

const COLORS = ['#4A90E2', '#7ED321', '#F5A623', '#9B59B6', '#E74C3C'];
const NAMES  = ['Azul', 'Verde', 'Naranja', 'Morado', 'Rojo'];

const rand = () => Math.floor(Math.random() * COLORS.length);
const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function playSequence() {
  seq.playing = true;
  seq.turn = false;
  render();

  for (const i of seq.sequence) {
    await wait(400);
    seq.active = i; render();
    await wait(450);
    seq.active = null; render();
  }

  seq.playing = false;
  seq.turn = true;
  render();
}

function startSequence() {
  Object.assign(seq, {
    sequence: [rand()],
    user: [],
    score: 0,
    round: 1,
    active: null,
    over: false,
    playing: false,
    turn: false
  });
  playSequence();
}

function clickColor(i) {
  if (!seq.turn || seq.playing) return;

  seq.user.push(i);
  seq.active = i;
  render();
  setTimeout(() => { seq.active = null; render(); }, 200);

  if (i !== seq.sequence[seq.user.length - 1]) {
    seq.over = true;
    seq.turn = false;
    render();
    return;
  }

  if (seq.user.length === seq.sequence.length) {
    seq.score += 10 * seq.round;
    seq.round += 1;
    seq.user = [];
    seq.sequence.push(rand());
    setTimeout(() => playSequence(), 700);
  }
}

// -------------------- GAME: PAIRS --------------------
const pairsGame = {
  items: [],
  selected: [],
  score: 0,
  attempts: 0,
  complete: false
};

const initialPairs = [
  { id: 1, text: '🍎', matchId: 1, matched: false },
  { id: 2, text: 'Manzana', matchId: 1, matched: false },
  { id: 3, text: '🌞', matchId: 2, matched: false },
  { id: 4, text: 'Sol', matchId: 2, matched: false },
  { id: 5, text: '🌺', matchId: 3, matched: false },
  { id: 6, text: 'Flor', matchId: 3, matched: false },
  { id: 7, text: '🐶', matchId: 4, matched: false },
  { id: 8, text: 'Perro', matchId: 4, matched: false },
  { id: 9, text: '⭐', matchId: 5, matched: false },
  { id: 10, text: 'Estrella', matchId: 5, matched: false },
  { id: 11, text: '🌊', matchId: 6, matched: false },
  { id: 12, text: 'Agua', matchId: 6, matched: false }
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function resetPairsGame() {
  pairsGame.items = shuffle(initialPairs.map(x => ({ ...x, matched: false })));
  pairsGame.selected = [];
  pairsGame.score = 0;
  pairsGame.attempts = 0;
  pairsGame.complete = false;
  render();
}

function handlePairClick(id) {
  if (pairsGame.complete) return;
  if (pairsGame.selected.length === 2) return;
  if (pairsGame.selected.includes(id)) return;

  const clicked = pairsGame.items.find(p => p.id === id);
  if (!clicked || clicked.matched) return;

  pairsGame.selected.push(id);
  render();

  if (pairsGame.selected.length === 2) {
    pairsGame.attempts += 1;

    const [aId, bId] = pairsGame.selected;
    const a = pairsGame.items.find(p => p.id === aId);
    const b = pairsGame.items.find(p => p.id === bId);

    if (a && b && a.matchId === b.matchId) {
      setTimeout(() => {
        pairsGame.items = pairsGame.items.map(p => {
          if (p.id === aId || p.id === bId) return { ...p, matched: true };
          return p;
        });
        pairsGame.score += 10;
        pairsGame.selected = [];

        const allMatched = pairsGame.items.every(p => p.matched);
        if (allMatched) pairsGame.complete = true;

        render();
      }, 450);
    } else {
      setTimeout(() => {
        pairsGame.selected = [];
        render();
      }, 900);
    }
  }
}

// -------------------- COMMUNITY --------------------
function getCommunityDisplayMessages() {
  const defaultMessages = [
    { id: 1, text: 'Hoy me siento mejor', author: 'María', likes: 12 },
    { id: 2, text: 'Les deseo un buen día', author: 'Carlos', likes: 8 },
    { id: 3, text: 'Jugué memoria y me relajé', author: 'Ana', likes: 15 },
    { id: 4, text: 'Comparto buenas energías', author: 'Pedro', likes: 10 }
  ];
  return state.communityMessages.length > 0 ? state.communityMessages : defaultMessages;
}

function toggleLikeMessage(messageId) {
  const liked = state.likedMessages.has(messageId);
  if (liked) state.likedMessages.delete(messageId);
  else state.likedMessages.add(messageId);

  // Solo actualiza likes si el mensaje está en communityMessages (mensajes del usuario)
  state.communityMessages = state.communityMessages.map(m => {
    if (m.id !== messageId) return m;
    return { ...m, likes: m.likes + (liked ? -1 : 1) };
  });

  render();
}

// -------------------- MOOD --------------------
function saveMood(mood) {
  const days = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const today = days[new Date().getDay()];
  state.moodData.push({ day: today, mood });
  state.moodData = state.moodData.slice(-7);
  render();
}

// -------------------- APPOINTMENTS --------------------
function addAppointment(appointmentObj) {
  state.appointments.push(appointmentObj);
  render();
}

function cancelAppointment(appointmentId) {
  state.appointments = state.appointments.filter(a => a.id !== appointmentId);
  render();
}

// -------------------- DELETE ALL DATA --------------------
function deleteAllData() {
  state.moodData = [];
  state.communityMessages = [];
  state.likedMessages = new Set();
  state.appointments = [];
  render();
}

// -------------------- HELPERS --------------------
function escapeHtml(str) {
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'","&#039;");
}

// -------------------- DOM --------------------
const $app = document.getElementById('app');
const $bottomNav = document.getElementById('bottomNav');

function navigate(screen) {
  state.currentScreen = screen;
  render();
}

// =======================================================
//                      SCREENS
// =======================================================
function WelcomeScreen() {
  return `
    <section class="welcome">
      <div class="welcome-container">
        <img src="logo.png" class="welcome-logo" alt="Nirvana Logo" />
        <h1 class="welcome-title">Nirvana</h1>
        <p class="welcome-subtitle">Bienestar emocional para adultos mayores</p>
        <button id="startBtn" class="welcome-button">Comenzar</button>
      </div>
    </section>
  `;
}

function HomeScreen() {
  return `
    <section class="screen">
      <h1 style="margin-bottom:10px;">Inicio</h1>
      <div class="row">
        <button class="btn secondary" data-go="mood">Estado de ánimo</button>
        <button class="btn secondary" data-go="mood-history">Historial</button>
        <button class="btn secondary" data-go="assistant">Asistente</button>
        <button class="btn secondary" data-go="specialists">Especialistas</button>
      </div>
    </section>
  `;
}

function GamesScreen() {
  return `
    <section class="screen">
      <h1 style="margin-bottom:10px;">Juegos</h1>

      <button class="btn" data-go="sequences-game">Juego de Secuencias</button>
      <div style="height:10px;"></div>
      <button class="btn" data-go="pairs-game">Juego de Parejas</button>

      <div style="height:16px;"></div>
      <button class="btn secondary" data-go="home">Volver</button>
    </section>
  `;
}

function SequencesGameScreen() {
  if (seq.over) {
    return `
      <section class="screen">
        <div class="topbar">
          <button class="btn-back" data-go="games">←</button>
          <h2>Secuencias</h2>
          <div style="width:40px"></div>
        </div>

        <div class="card">
          <h2 style="margin-bottom:8px;">🏆 Juego terminado</h2>
          <p>Puntos: <b>${seq.score}</b></p>
          <p>Nivel: <b>${seq.round}</b></p>
          <button id="restartSeq" class="btn" style="margin-top:12px;">Jugar de nuevo</button>
        </div>
      </section>
    `;
  }

  if (seq.sequence.length === 0) {
    return `
      <section class="screen">
        <div class="topbar">
          <button class="btn-back" data-go="games">←</button>
          <h2>Secuencias</h2>
          <div style="width:40px"></div>
        </div>

        <div class="card">
          <h3>¿Cómo jugar?</h3>
          <p>Observa la secuencia de colores y repítela en el mismo orden.</p>
          <button id="startSeq" class="btn" style="margin-top:12px;">Comenzar juego</button>
        </div>
      </section>
    `;
  }

  const statusText = seq.playing
    ? '👀 Observa la secuencia...'
    : seq.turn
    ? '👆 ¡Tu turno! Repite la secuencia'
    : '⏳ Preparando...';

  return `
    <section class="screen">
      <div class="topbar">
        <button class="btn-back" data-go="games">←</button>
        <h2>Secuencias</h2>
        <div style="width:40px"></div>
      </div>

      <div class="card">
        <p style="margin:0;"><b>Puntos:</b> ${seq.score} | <b>Nivel:</b> ${seq.round} | <b>Secuencia:</b> ${seq.sequence.length}</p>
      </div>

      <div class="card">
        <p style="margin:0;">${statusText}</p>
      </div>

      <div class="grid-colors">
        ${COLORS.map((c, i) => `
          <button
            class="color-btn ${seq.active === i ? 'active' : ''}"
            style="background:${c}"
            data-color="${i}"
            ${(!seq.turn || seq.playing) ? 'disabled' : ''}
          >
            ${NAMES[i]}
          </button>
        `).join('')}
      </div>
    </section>
  `;
}

function PairsGameScreen() {
  if (!pairsGame.items || pairsGame.items.length === 0) {
    resetPairsGame();
  }

  return `
    <section class="screen">
      <div class="topbar">
        <button class="btn-back" data-go="games">←</button>
        <h2>Juego de Parejas</h2>
        <div style="width:40px"></div>
      </div>

      <div class="card">
        <div style="display:flex;justify-content:space-around;text-align:center;">
          <div>
            <div style="color:#666;">Puntos</div>
            <div style="font-weight:700;color:#4A90E2;">${pairsGame.score}</div>
          </div>
          <div>
            <div style="color:#666;">Intentos</div>
            <div style="font-weight:700;color:#7ED321;">${pairsGame.attempts}</div>
          </div>
        </div>
      </div>

      ${
        pairsGame.complete
          ? `
            <div class="card" style="text-align:center;">
              <div style="font-size:54px;margin-bottom:8px;">🏆</div>
              <h2 style="margin:0 0 10px 0;">¡Felicitaciones!</h2>
              <p style="margin:0 0 6px 0;">Puntuación: <b>${pairsGame.score}</b></p>
              <p style="margin:0;">Intentos: <b>${pairsGame.attempts}</b></p>

              <button id="pairsPlayAgain" class="btn" style="margin-top:14px;">Jugar de nuevo</button>
            </div>
          `
          : `
            <div class="pairs-grid">
              ${pairsGame.items.map(item => {
                const isSelected = pairsGame.selected.includes(item.id);
                const isMatched = item.matched;

                const cls = isMatched
                  ? 'pair-card matched'
                  : isSelected
                  ? 'pair-card selected'
                  : 'pair-card';

                return `
                  <button class="${cls}" data-pair="${item.id}" ${isMatched ? 'disabled' : ''}>
                    ${escapeHtml(item.text)}
                  </button>
                `;
              }).join('')}
            </div>
          `
      }

      <div style="margin-top:14px;">
        <button id="pairsReset" class="btn secondary" style="width:100%;">Reiniciar juego</button>
      </div>
    </section>
  `;
}

function MoodScreen() {
  return `
    <section class="screen">
      <h1>Estado de ánimo</h1>
      <p>Selecciona tu ánimo (1 a 5):</p>

      <div class="row">
        ${[1,2,3,4,5].map(n => `
          <button class="btn secondary" data-mood="${n}">${n}</button>
        `).join('')}
      </div>

      <div style="height:10px;"></div>
      <button class="btn secondary" data-go="home">Volver</button>
    </section>
  `;
}

function MoodHistoryScreen() {
  const data = state.moodData.length > 0
    ? state.moodData
    : [
        { day: 'Lun', mood: 3 },
        { day: 'Mar', mood: 4 },
        { day: 'Mié', mood: 3 },
        { day: 'Jue', mood: 5 },
        { day: 'Vie', mood: 4 },
        { day: 'Sáb', mood: 4 },
        { day: 'Dom', mood: 5 }
      ];

  return `
    <section class="screen">
      <h2 style="text-align:center;margin-bottom:16px;">Tu progreso emocional</h2>

      <div class="card">
        <h3 style="text-align:center;margin-bottom:20px;">Últimos 7 días</h3>

        <div class="mood-chart">
          ${data.map(d => `
            <div class="mood-bar">
              <div class="mood-bar-fill" style="height:${d.mood * 20}%;" title="Estado: ${d.mood}/5"></div>
              <span>${d.day}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card mood-feedback">
        <div class="emoji">😊</div>
        <div>
          <p style="margin:0;"><b>¡Vas muy bien!</b></p>
          <p style="margin:0;color:#666;">Sigue así</p>
        </div>
      </div>

      <button class="btn secondary" data-go="home">Volver</button>
    </section>
  `;
}

function CommunityScreen() {
  const displayMessages = getCommunityDisplayMessages();

  return `
    <section class="screen">
      <h1 style="text-align:center;margin-bottom:16px;">Comunidad</h1>

      <div class="stack">
        ${displayMessages.map(m => {
          const isLiked = state.likedMessages.has(m.id);
          return `
            <div class="card msg-card">
              <p style="margin:0 0 12px 0;font-size:16px;">${escapeHtml(m.text)}</p>
              <div class="msg-row">
                <span class="msg-author">— ${escapeHtml(m.author)}</span>

                <button class="like-btn" data-like="${m.id}">
                  <span class="heart ${isLiked ? 'liked' : ''}">♥</span>
                  <span class="like-count">${m.likes}</span>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <button class="btn" data-go="create-message">Enviar saludo</button>
    </section>
  `;
}

function CreateMessageScreen() {
  return `
    <section class="screen">
      <h1>Enviar saludo</h1>
      <textarea id="msgText" placeholder="Escribe un saludo..." style="width:100%;height:120px;border-radius:12px;padding:12px;"></textarea>

      <div style="display:flex;gap:10px;margin-top:10px;">
        <button class="btn" id="publishBtn">Publicar</button>
        <button class="btn secondary" data-go="community">Cancelar</button>
      </div>
    </section>
  `;
}

function SpecialistsScreen() {
  return `
    <section class="screen">
      <h1>Especialistas</h1>

      <div class="card">
        <p><b>Dra. María Carmen López</b></p>
        <p style="color:#666;margin-top:6px;">Psicóloga Clínica especializada en adultos mayores</p>
        <p style="color:#666;margin-top:6px;">Disponible: Hoy</p>
        <button class="btn" id="bookDemo">Agendar cita</button>
      </div>

      <button class="btn secondary" data-go="home">Volver</button>
    </section>
  `;
}

function AssistantScreen() {
  return `
    <section class="screen">
      <h1>Asistente</h1>
      <div class="card">
        <p>Acá luego puedes integrar respuestas emocionales.</p>
      </div>
      <button class="btn secondary" data-go="home">Volver</button>
    </section>
  `;
}

// ✅ NUEVO PERFIL (con edición + borrar datos + citas + cancelar)
function ProfileScreen() {
  const p = state.profileData;

  const isEditing = profileUI.isEditing;
  const showDelete = profileUI.showDeleteConfirmation;

  const edit = profileUI.editData;

  const appointmentsHTML = (state.appointments && state.appointments.length > 0)
    ? `
      <div class="card profile-card">
        <h3 style="margin-top:0;">📅 Mis Citas Programadas</h3>
        <div class="stack">
          ${state.appointments.map(a => `
            <div class="apt-card">
              <div class="apt-top">
                <div class="apt-doctor">👨‍⚕️</div>
                <div class="apt-info">
                  <div class="apt-name">${escapeHtml(a.specialistName)}</div>
                  <div class="apt-sub">${escapeHtml(a.specialty || '')}</div>
                </div>
              </div>

              <div class="apt-details">
                <div>📅 ${escapeHtml(a.date)}</div>
                <div>🕒 ${escapeHtml(a.time)}</div>
              </div>

              <button class="btn secondary danger" data-cancel-apt="${a.id}">Cancelar Cita</button>
            </div>
          `).join('')}
        </div>
      </div>
    `
    : '';

  return `
    <section class="screen">
      <h2 style="text-align:center;margin-bottom:16px;">Mi Perfil</h2>

      <div class="card profile-card">
        <div class="profile-header">
          <div class="profile-avatar">
            <img src="logo.png" alt="Nirvana Logo" />
          </div>
          <div class="profile-welcome">
            <h3 style="margin:0 0 6px 0;">Bienvenido</h3>
            <div style="color:#666;">Miembro desde 2024</div>
          </div>
        </div>

        <div class="profile-fields">
          <div class="pf-field">
            <div class="pf-label">Nombre</div>
            ${
              isEditing
              ? `<input id="pfName" class="pf-input" type="text" value="${escapeHtml(edit.name)}" placeholder="Ingresa tu nombre" />`
              : `<div class="pf-value">${escapeHtml(p.name)}</div>`
            }
          </div>

          <div class="pf-field">
            <div class="pf-label">Edad</div>
            ${
              isEditing
              ? `<input id="pfAge" class="pf-input" type="number" value="${escapeHtml(edit.age)}" placeholder="Ingresa tu edad" />`
              : `<div class="pf-value">${p.age ? escapeHtml(p.age) + ' años' : 'No especificado'}</div>`
            }
          </div>

          <div class="pf-field">
            <div class="pf-label">Juegos favoritos</div>
            ${
              isEditing
              ? `<input id="pfFav" class="pf-input" type="text" value="${escapeHtml(edit.favoriteGames)}" placeholder="Ej: Memoria, Parejas" />`
              : `<div class="pf-value">${escapeHtml(p.favoriteGames)}</div>`
            }
          </div>
        </div>
      </div>

      ${
        isEditing
        ? `
          <div class="stack" style="margin-top:12px;">
            <button class="btn" id="pfSaveBtn">✔ Guardar cambios</button>
            <button class="btn secondary" id="pfCancelBtn">✖ Cancelar</button>
          </div>
        `
        : `
          <button class="btn secondary" id="pfEditBtn" style="width:100%;margin-top:12px;">
            ⚙ Editar perfil
          </button>
        `
      }

      ${appointmentsHTML}

      <div class="card profile-danger">
        <h3 style="margin-top:0;color:#c0392b;">🗑 Privacidad y Datos</h3>
        <p style="color:#666;">
          Puedes eliminar todos tus datos personales en cualquier momento. Esta acción no se puede deshacer.
        </p>
        <button class="btn secondary danger" id="pfDeleteBtn">🗑 Eliminar mis datos</button>
      </div>

      ${
        showDelete
        ? `
          <div class="modal-backdrop">
            <div class="modal">
              <div class="modal-icon">⚠️</div>
              <h3 style="margin:0 0 10px 0;color:#c0392b;">¿Eliminar todos los datos?</h3>
              <p style="margin:0 0 10px 0;color:#666;text-align:center;">
                Esta acción eliminará tu información personal, historial de ánimo, mensajes y citas.
              </p>
              <p style="margin:0 0 14px 0;color:#c0392b;text-align:center;">
                Esta acción no se puede deshacer.
              </p>

              <div class="stack">
                <button class="btn danger-solid" id="pfConfirmDeleteBtn">🗑 Sí, eliminar todo</button>
                <button class="btn secondary" id="pfCloseDeleteBtn">✖ Cancelar</button>
              </div>
            </div>
          </div>
        `
        : ''
      }
    </section>
  `;
}

// -------------------- BOTTOM NAV HELP --------------------
function getBottomNavScreen() {
  const s = state.currentScreen;
  if (['home','games','community','profile'].includes(s)) return s;
  if (['sequences-game','pairs-game'].includes(s)) return 'games';
  if (s.startsWith('mood')) return 'home';
  if (s === 'create-message') return 'community';
  return 'home';
}

// -------------------- RENDER --------------------
function render() {
  $bottomNav.classList.toggle('hidden', state.currentScreen === 'welcome');

  const active = getBottomNavScreen();
  [...$bottomNav.querySelectorAll('.nav-btn')].forEach(btn => {
    btn.classList.toggle('active', btn.dataset.screen === active);
  });

  let html = '';
  switch (state.currentScreen) {
    case 'welcome': html = WelcomeScreen(); break;
    case 'home': html = HomeScreen(); break;
    case 'games': html = GamesScreen(); break;

    case 'sequences-game': html = SequencesGameScreen(); break;
    case 'pairs-game': html = PairsGameScreen(); break;

    case 'mood': html = MoodScreen(); break;
    case 'mood-history': html = MoodHistoryScreen(); break;

    case 'community': html = CommunityScreen(); break;
    case 'create-message': html = CreateMessageScreen(); break;

    case 'assistant': html = AssistantScreen(); break;
    case 'specialists': html = SpecialistsScreen(); break;

    case 'profile': html = ProfileScreen(); break;

    default: html = HomeScreen();
  }

  $app.innerHTML = html;
  wireEvents();
}

// -------------------- EVENTS --------------------
function wireEvents() {
  // navegación genérica
  document.querySelectorAll('[data-go]').forEach(el => {
    el.onclick = () => navigate(el.dataset.go);
  });

  // Welcome
  const startBtn = document.getElementById('startBtn');
  if (startBtn) startBtn.onclick = () => navigate('home');

  // Mood
  document.querySelectorAll('[data-mood]').forEach(btn => {
    btn.onclick = () => saveMood(Number(btn.dataset.mood));
  });

  // Sequences
  const startSeqBtn = document.getElementById('startSeq');
  if (startSeqBtn) startSeqBtn.onclick = startSequence;

  const restartSeqBtn = document.getElementById('restartSeq');
  if (restartSeqBtn) restartSeqBtn.onclick = startSequence;

  document.querySelectorAll('[data-color]').forEach(btn => {
    btn.onclick = () => clickColor(Number(btn.dataset.color));
  });

  // Pairs
  const pairsReset = document.getElementById('pairsReset');
  if (pairsReset) pairsReset.onclick = resetPairsGame;

  const pairsPlayAgain = document.getElementById('pairsPlayAgain');
  if (pairsPlayAgain) pairsPlayAgain.onclick = resetPairsGame;

  document.querySelectorAll('[data-pair]').forEach(btn => {
    btn.onclick = () => handlePairClick(Number(btn.dataset.pair));
  });

  // Comunidad likes
  document.querySelectorAll('[data-like]').forEach(btn => {
    btn.onclick = () => toggleLikeMessage(Number(btn.dataset.like));
  });

  // Publicar mensaje
  const publishBtn = document.getElementById('publishBtn');
  if (publishBtn) {
    publishBtn.onclick = () => {
      const text = (document.getElementById('msgText').value || '').trim();
      if (!text) return;

      state.communityMessages.unshift({
        id: Date.now(),
        text,
        author: 'Tú',
        likes: 0
      });

      navigate('community');
    };
  }

  // Agendar cita demo (ahora como OBJETO)
  const bookDemo = document.getElementById('bookDemo');
  if (bookDemo) {
    bookDemo.onclick = () => {
      addAppointment({
        id: Date.now(),
        specialistId: 1,
        specialistName: 'Dra. María Carmen López',
        specialty: 'Psicóloga Clínica especializada en adultos mayores',
        date: new Date().toLocaleDateString('es-CL', { weekday:'long', day:'numeric', month:'long', year:'numeric' }),
        time: '10:00'
      });
      navigate('profile');
    };
  }

  // ---------------- PROFILE EVENTS ----------------
  const pfEditBtn = document.getElementById('pfEditBtn');
  if (pfEditBtn) {
    pfEditBtn.onclick = () => {
      profileUI.editData = { ...state.profileData };
      profileUI.isEditing = true;
      render();
    };
  }

  const pfSaveBtn = document.getElementById('pfSaveBtn');
  if (pfSaveBtn) {
    pfSaveBtn.onclick = () => {
      const name = document.getElementById('pfName')?.value ?? '';
      const age = document.getElementById('pfAge')?.value ?? '';
      const fav = document.getElementById('pfFav')?.value ?? '';

      state.profileData = {
        name: name.trim() || 'Usuario',
        age: String(age).trim(),
        favoriteGames: fav.trim() || 'Ninguno'
      };

      profileUI.isEditing = false;
      render();
    };
  }

  const pfCancelBtn = document.getElementById('pfCancelBtn');
  if (pfCancelBtn) {
    pfCancelBtn.onclick = () => {
      profileUI.editData = { ...state.profileData };
      profileUI.isEditing = false;
      render();
    };
  }

  const pfDeleteBtn = document.getElementById('pfDeleteBtn');
  if (pfDeleteBtn) {
    pfDeleteBtn.onclick = () => {
      profileUI.showDeleteConfirmation = true;
      render();
    };
  }

  const pfCloseDeleteBtn = document.getElementById('pfCloseDeleteBtn');
  if (pfCloseDeleteBtn) {
    pfCloseDeleteBtn.onclick = () => {
      profileUI.showDeleteConfirmation = false;
      render();
    };
  }

  const pfConfirmDeleteBtn = document.getElementById('pfConfirmDeleteBtn');
  if (pfConfirmDeleteBtn) {
    pfConfirmDeleteBtn.onclick = () => {
      // resetea perfil
      state.profileData = { name:'Usuario', age:'', favoriteGames:'Ninguno' };
      profileUI.editData = { ...state.profileData };
      profileUI.isEditing = false;
      profileUI.showDeleteConfirmation = false;

      // borra datos de app
      deleteAllData();

      // vuelve a render
      render();
    };
  }

  // cancelar cita desde perfil
  document.querySelectorAll('[data-cancel-apt]').forEach(btn => {
    btn.onclick = () => cancelAppointment(Number(btn.dataset.cancelApt));
  });
}

// Bottom nav
$bottomNav.onclick = (e) => {
  const btn = e.target.closest('[data-screen]');
  if (!btn) return;
  navigate(btn.dataset.screen);
};

// INIT
render();
