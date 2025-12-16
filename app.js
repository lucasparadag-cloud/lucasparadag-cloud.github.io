// -------------------- STATE --------------------
const state = {
  currentScreen: 'welcome',
  moodData: [],                 // [{day:'Lun', mood:3}, ...] últimos 7
  communityMessages: [],        // [{id,text,author,likes}, ...]
  likedMessages: new Set(),     // Set de ids
  appointments: []              // strings o objetos simples
};

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

const $app = document.getElementById('app');
const $bottomNav = document.getElementById('bottomNav');

// -------------------- NAV --------------------
function navigate(screen) {
  state.currentScreen = screen;
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

// -------------------- APPOINTMENTS --------------------
function bookAppointment(text) {
  state.appointments.push(text);
  render();
}

// -------------------- SEQUENCES GAME --------------------
const rand = () => Math.floor(Math.random() * COLORS.length);
const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function playSequence() {
  seq.playing = true;
  seq.turn = false;
  render();

  for (const i of seq.sequence) {
    await wait(400);
    seq.active = i; render();
    await wait(500);
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

  // Validación
  if (i !== seq.sequence[seq.user.length - 1]) {
    seq.over = true;
    seq.turn = false;
    render();
    return;
  }

  // Completó secuencia
  if (seq.user.length === seq.sequence.length) {
    seq.score += 10 * seq.round;
    seq.round += 1;
    seq.user = [];
    seq.sequence.push(rand());

    setTimeout(() => {
      playSequence();
    }, 700);
  }
}

// -------------------- SCREENS --------------------
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
      <button class="btn secondary" data-go="home">Volver</button>
    </section>
  `;
}

function SequencesGameScreen() {
  // Game Over
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

  // Intro
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
        <p><b>Puntos:</b> ${seq.score} | <b>Nivel:</b> ${seq.round} | <b>Secuencia:</b> ${seq.sequence.length}</p>
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
        <p><b>Psicóloga Demo</b></p>
        <p style="color:#666;margin-top:6px;">Especialidad: Adultos mayores</p>
        <button class="btn" id="book">Agendar cita</button>
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
        <p>Acá luego puedes integrar respuestas tipo “me siento triste”, etc.</p>
      </div>
      <button class="btn secondary" data-go="home">Volver</button>
    </section>
  `;
}

function ProfileScreen() {
  return `
    <section class="screen">
      <h1>Perfil</h1>

      <div class="card">
        <h3 style="margin-top:0;">Mis citas</h3>
        ${
          state.appointments.length
            ? state.appointments.map(a => `<div class="card" style="margin:10px 0;">${escapeHtml(a)}</div>`).join('')
            : `<p style="color:#666;">No tienes citas aún.</p>`
        }
      </div>
    </section>
  `;
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

// -------------------- RENDER --------------------
function getBottomNavScreen() {
  const s = state.currentScreen;
  if (['home','games','community','profile'].includes(s)) return s;
  if (['sequences-game'].includes(s)) return 'games';
  if (s.startsWith('mood')) return 'home';
  if (s === 'create-message') return 'community';
  return 'home';
}

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

  // Secuencias
  const startSeqBtn = document.getElementById('startSeq');
  if (startSeqBtn) startSeqBtn.onclick = startSequence;

  const restartSeqBtn = document.getElementById('restartSeq');
  if (restartSeqBtn) restartSeqBtn.onclick = startSequence;

  document.querySelectorAll('[data-color]').forEach(btn => {
    btn.onclick = () => clickColor(Number(btn.dataset.color));
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

  // Agendar cita demo
  const bookBtn = document.getElementById('book');
  if (bookBtn) {
    bookBtn.onclick = () => {
      bookAppointment(`Cita agendada — ${new Date().toLocaleString('es-CL')}`);
      navigate('profile');
    };
  }
}

// Bottom nav click
$bottomNav.onclick = (e) => {
  const btn = e.target.closest('[data-screen]');
  if (!btn) return;
  navigate(btn.dataset.screen);
};

// INIT
render();
