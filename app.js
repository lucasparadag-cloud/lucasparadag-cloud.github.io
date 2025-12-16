// --- Estado (equivalente a useState) ---
const state = {
  currentScreen: 'welcome',
  moodData: [],
  communityMessages: [],
  likedMessages: new Set(),
  appointments: []
};

// --- Helpers ---
const $app = document.getElementById('app');
const $bottomNav = document.getElementById('bottomNav');

function navigate(screen) {
  state.currentScreen = screen;
  render();
}

function saveMood(mood) {
  const days = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const today = days[new Date().getDay()];
  state.moodData.push({ day: today, mood });
  state.moodData = state.moodData.slice(-7);
  render();
}

function publishMessage(text) {
  state.communityMessages.unshift({
    id: Date.now(),
    text,
    author: 'Tú',
    likes: 0
  });
  render();
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

function deleteAllData() {
  state.moodData = [];
  state.communityMessages = [];
  state.likedMessages = new Set();
  state.appointments = [];
  render();
}

function bookAppointment(appointment) {
  state.appointments.push(appointment);
  render();
}

function cancelAppointment(appointmentId) {
  state.appointments = state.appointments.filter(a => a.id !== appointmentId);
  render();
}

// --- Pantallas (equivalente a componentes React) ---
function WelcomeScreen() {
  return `
    <section class="screen">
      <h1>Bienvenido 👋</h1>
      <p>Esta es tu app en HTML + JS (sin React).</p>
      <button class="btn" id="startBtn">Comenzar</button>
    </section>
  `;
}

function HomeScreen() {
  return `
    <section class="screen">
      <h1>Inicio</h1>
      <p>Accesos rápidos:</p>

      <div class="row">
        <button class="btn secondary" data-go="mood">Estado de ánimo</button>
        <button class="btn secondary" data-go="mood-history">Historial ánimo</button>
        <button class="btn secondary" data-go="assistant">Asistente</button>
        <button class="btn secondary" data-go="relaxation">Relajación</button>
        <button class="btn secondary" data-go="specialists">Especialistas</button>
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
        <button class="btn secondary" data-go="memory-game">Memoria</button>
        <button class="btn secondary" data-go="pairs-game">Pares</button>
        <button class="btn secondary" data-go="sequences-game">Secuencias</button>
        <button class="btn secondary" data-go="words-game">Palabras</button>
      </div>
    </section>
  `;
}

function SimpleGame(title) {
  return `
    <section class="screen">
      <h1>${title}</h1>
      <p>Placeholder del juego (acá metes tu lógica real).</p>
      <button class="btn secondary" data-go="games">Volver a juegos</button>
    </section>
  `;
}

function MoodScreen() {
  return `
    <section class="screen">
      <h1>Estado de ánimo</h1>
      <p>Selecciona un valor (1 a 5):</p>
      <div class="row">
        ${[1,2,3,4,5].map(n => `<button class="btn secondary" data-mood="${n}">${n}</button>`).join('')}
      </div>
      <div class="card">
        <small>Se guardan los últimos 7 registros.</small>
      </div>
    </section>
  `;
}

function MoodHistoryScreen() {
  const items = state.moodData.length
    ? state.moodData.map(x => `<li>${x.day}: ${x.mood}</li>`).join('')
    : `<li>No hay datos aún.</li>`;

  return `
    <section class="screen">
      <h1>Historial ánimo</h1>
      <div class="card">
        <ul>${items}</ul>
      </div>
      <button class="btn secondary" data-go="home">Volver</button>
    </section>
  `;
}

function CommunityScreen() {
  const list = state.communityMessages.length
    ? state.communityMessages.map(m => {
        const liked = state.likedMessages.has(m.id);
        return `
          <div class="card">
            <p><b>${m.author}</b>: ${m.text}</p>
            <div class="row">
              <button class="btn secondary" data-like="${m.id}">
                ${liked ? '💙' : '🤍'} Like (${m.likes})
              </button>
            </div>
          </div>
        `;
      }).join('')
    : `<p>No hay mensajes aún.</p>`;

  return `
    <section class="screen">
      <h1>Comunidad</h1>
      <div class="row">
        <button class="btn" data-go="create-message">Crear mensaje</button>
      </div>
      ${list}
    </section>
  `;
}

function CreateMessageScreen() {
  return `
    <section class="screen">
      <h1>Crear mensaje</h1>
      <textarea id="msgText" placeholder="Escribe algo..."></textarea>
      <div class="row" style="margin-top:10px">
        <button class="btn" id="publishBtn">Publicar</button>
        <button class="btn secondary" data-go="community">Cancelar</button>
      </div>
    </section>
  `;
}

function AssistantScreen() {
  return `
    <section class="screen">
      <h1>Asistente</h1>
      <p>Placeholder (aquí después conectas IA o FAQ).</p>
      <button class="btn secondary" data-go="home">Volver</button>
    </section>
  `;
}

function RelaxationMusicScreen() {
  return `
    <section class="screen">
      <h1>Relajación</h1>
      <p>Placeholder de música/sonidos.</p>
      <button class="btn secondary" data-go="home">Volver</button>
    </section>
  `;
}

function SpecialistsScreen() {
  return `
    <section class="screen">
      <h1>Especialistas</h1>
      <p>Reserva una cita de prueba:</p>
      <div class="row">
        <button class="btn" id="bookAptBtn">Reservar cita</button>
        <button class="btn secondary" data-go="profile">Ver perfil</button>
      </div>
      <small>Esto es demo: crea una cita ficticia.</small>
    </section>
  `;
}

function ProfileScreen() {
  const apts = state.appointments.length
    ? state.appointments.map(a => `
        <div class="card">
          <p><b>${a.name}</b> — ${a.date}</p>
          <button class="btn secondary" data-cancel="${a.id}">Cancelar</button>
        </div>
      `).join('')
    : `<p>No tienes citas.</p>`;

  return `
    <section class="screen">
      <h1>Perfil</h1>
      <div class="row">
        <button class="btn secondary" id="deleteAllBtn">Borrar datos</button>
      </div>

      <h2 style="margin-top:16px;font-size:16px">Citas</h2>
      ${apts}
    </section>
  `;
}

// --- Render (equivalente a renderScreen + BottomNav logic) ---
function getBottomNavScreen() {
  const s = state.currentScreen;
  if (['home','games','community','profile'].includes(s)) return s;
  if (['memory-game','pairs-game','sequences-game','words-game'].includes(s)) return 'games';
  if (s.startsWith('mood')) return 'home';
  if (s === 'create-message') return 'community';
  return 'home';
}

function render() {
  // mostrar/ocultar bottom nav
  const showBottomNav = state.currentScreen !== 'welcome';
  $bottomNav.classList.toggle('hidden', !showBottomNav);

  // activar tab actual
  const active = getBottomNavScreen();
  [...$bottomNav.querySelectorAll('.nav-btn')].forEach(btn => {
    btn.classList.toggle('active', btn.dataset.screen === active);
  });

  // pantalla
  let html = '';
  switch (state.currentScreen) {
    case 'welcome': html = WelcomeScreen(); break;
    case 'home': html = HomeScreen(); break;
    case 'games': html = GamesScreen(); break;
    case 'memory-game': html = SimpleGame('Juego de Memoria'); break;
    case 'pairs-game': html = SimpleGame('Juego de Pares'); break;
    case 'sequences-game': html = SimpleGame('Juego de Secuencias'); break;
    case 'words-game': html = SimpleGame('Juego de Palabras'); break;
    case 'mood': html = MoodScreen(); break;
    case 'mood-history': html = MoodHistoryScreen(); break;
    case 'community': html = CommunityScreen(); break;
    case 'create-message': html = CreateMessageScreen(); break;
    case 'assistant': html = AssistantScreen(); break;
    case 'profile': html = ProfileScreen(); break;
    case 'relaxation': html = RelaxationMusicScreen(); break;
    case 'specialists': html = SpecialistsScreen(); break;
    default: html = HomeScreen();
  }

  $app.innerHTML = html;

  // eventos de la pantalla actual
  wireScreenEvents();
}

function wireScreenEvents() {
  // navegación genérica por data-go
  $app.querySelectorAll('[data-go]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.go));
  });

  // welcome
  const startBtn = document.getElementById('startBtn');
  if (startBtn) startBtn.addEventListener('click', () => navigate('home'));

  // mood
  $app.querySelectorAll('[data-mood]').forEach(btn => {
    btn.addEventListener('click', () => saveMood(Number(btn.dataset.mood)));
  });

  // create message
  const publishBtn = document.getElementById('publishBtn');
  if (publishBtn) {
    publishBtn.addEventListener('click', () => {
      const text = (document.getElementById('msgText').value || '').trim();
      if (!text) return;
      publishMessage(text);
      navigate('community');
    });
  }

  // likes
  $app.querySelectorAll('[data-like]').forEach(btn => {
    btn.addEventListener('click', () => likeMessage(Number(btn.dataset.like)));
  });

  // delete all
  const deleteAllBtn = document.getElementById('deleteAllBtn');
  if (deleteAllBtn) deleteAllBtn.addEventListener('click', deleteAllData);

  // specialists -> reservar cita demo
  const bookAptBtn = document.getElementById('bookAptBtn');
  if (bookAptBtn) {
    bookAptBtn.addEventListener('click', () => {
      bookAppointment({
        id: Date.now(),
        name: 'Psicóloga Demo',
        date: new Date().toLocaleString('es-CL')
      });
      navigate('profile');
    });
  }

  // cancelar citas
  $app.querySelectorAll('[data-cancel]').forEach(btn => {
    btn.addEventListener('click', () => cancelAppointment(Number(btn.dataset.cancel)));
  });
}

// --- Bottom nav click ---
$bottomNav.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-screen]');
  if (!btn) return;
  navigate(btn.dataset.screen);
});

// Inicial
render();
