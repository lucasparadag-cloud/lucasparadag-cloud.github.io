// --- Estado (equivalente a useState) ---
const state = {
  currentScreen: 'welcome',
  moodData: [],
  communityMessages: [],
  likedMessages: new Set(),
  appointments: []
};

// ✅ Estado pantalla especialistas (FALTABA)
const specialistsState = {
  selectedSpecialist: null,
  showScheduling: false,
  selectedDate: null,
  selectedTime: null,
  showConfirmation: false
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
    <section class="welcome">
      <div class="welcome-container">

        <div class="welcome-block">
          <div class="welcome-logo-wrap">
            <img
              src="logo.png"
              alt="Nirvana Logo"
              class="welcome-logo"
            />
          </div>

          <h1 class="welcome-title">Nirvana</h1>
          <p class="welcome-subtitle">Bienestar emocional para adultos mayores</p>
        </div>

        <button class="welcome-button" id="startBtn">
          Comenzar
        </button>

      </div>
    </section>
  `;
}

// ✅ HomeScreen (te faltaba en lo que pegaste)
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

  // --- VISTA 1: Confirmación ---
  if (specialistsState.showConfirmation && specialistsState.selectedSpecialist && specialistsState.selectedDate && specialistsState.selectedTime) {
    const s = specialistsState.selectedSpecialist;

    return `
      <section class="screen sp">
        <div class="sp-topbar">
          <button class="sp-back" id="spBackBtn">←</button>
          <h2>Cita Confirmada</h2>
          <div class="sp-spacer"></div>
        </div>

        <div class="sp-hero green">
          <div class="sp-hero-icon">✅</div>
          <h3>¡Cita Agendada!</h3>
          <p>Tu cita ha sido confirmada exitosamente</p>
        </div>

        <div class="sp-card">
          <h3 class="sp-center">Detalles de la Cita</h3>

          <div class="sp-split">
            <div class="sp-photo">${s.photo}</div>
            <div>
              <p class="sp-name">${escapeHtml(s.name)}</p>
              <p class="sp-muted">${escapeHtml(s.specialty)}</p>
            </div>
          </div>

          <div class="sp-info">
            <div class="sp-info-row">
              <span class="sp-info-ico">📅</span>
              <div>
                <div class="sp-small">Fecha</div>
                <div>${escapeHtml(specialistsState.selectedDate)}</div>
              </div>
            </div>
            <div class="sp-info-row">
              <span class="sp-info-ico">🕒</span>
              <div>
                <div class="sp-small">Hora</div>
                <div>${escapeHtml(specialistsState.selectedTime)}</div>
              </div>
            </div>
          </div>

          <div class="sp-reminder">
            <h3 class="sp-center">Recordatorio</h3>
            <p>✉️ Te enviaremos un recordatorio por correo</p>
            <p>📞 Y te llamaremos 1 día antes de tu cita</p>
          </div>
        </div>

        <div class="sp-actions">
          <button class="btn" id="spGoProfileBtn">Ver mis Citas en Perfil</button>
          <button class="btn secondary" id="spGoAssistantBtn">Volver al Asistente</button>
        </div>
      </section>
    `;
  }

  // --- VISTA 2: Agendar ---
  if (specialistsState.showScheduling && specialistsState.selectedSpecialist) {
    const s = specialistsState.selectedSpecialist;
    const dates = getAvailableDates();

    const datesHTML = dates.map(d => {
      const active = specialistsState.selectedDate === d.full;
      return `
        <button class="sp-pick ${active ? 'active-blue' : ''}" data-pick-date="${escapeHtml(d.full)}">
          <div class="sp-pick-text">${escapeHtml(d.short)}</div>
        </button>
      `;
    }).join('');

    const timesHTML = availableTimes.map(t => {
      const active = specialistsState.selectedTime === t;
      return `
        <button class="sp-pick ${active ? 'active-green' : ''}" data-pick-time="${t}">
          <div class="sp-pick-text">${t}</div>
        </button>
      `;
    }).join('');

    const summaryHTML = (specialistsState.selectedDate && specialistsState.selectedTime) ? `
      <div class="sp-hero blue">
        <h3 class="sp-center">Resumen de tu Cita</h3>
        <p class="sp-center">📅 ${escapeHtml(specialistsState.selectedDate)}</p>
        <p class="sp-center">🕐 ${escapeHtml(specialistsState.selectedTime)}</p>
        <p class="sp-center">con ${escapeHtml(s.name)}</p>
      </div>
    ` : '';

    return `
      <section class="screen sp">
        <div class="sp-topbar">
          <button class="sp-back" id="spBackBtn">←</button>
          <h2>Agendar Cita</h2>
          <div class="sp-spacer"></div>
        </div>

        <div class="sp-card">
          <div class="sp-split">
            <div class="sp-photo">${s.photo}</div>
            <div>
              <p class="sp-name">${escapeHtml(s.name)}</p>
              <p class="sp-muted">${escapeHtml(s.specialty)}</p>
            </div>
          </div>
        </div>

        <div class="sp-card">
          <h3>📅 Selecciona una Fecha</h3>
          <div class="sp-grid2">
            ${datesHTML}
          </div>
        </div>

        ${specialistsState.selectedDate ? `
          <div class="sp-card">
            <h3>🕒 Selecciona una Hora</h3>
            <div class="sp-grid2">
              ${timesHTML}
            </div>
          </div>
        ` : ''}

        ${summaryHTML}

        <button class="btn sp-confirm ${(!specialistsState.selectedDate || !specialistsState.selectedTime) ? 'disabled' : ''}" id="spConfirmBtn">
          ✅ Confirmar Cita
        </button>
      </section>
    `;
  }

  // --- VISTA 3: Lista de especialistas ---
  const listHTML = specialists.map(s => `
    <div class="sp-card">
      <div class="sp-split">
        <div class="sp-photo">${s.photo}</div>
        <div class="sp-flex">
          <h3 class="sp-name">${escapeHtml(s.name)}</h3>
          <p class="sp-muted">${escapeHtml(s.specialty)}</p>
          <p class="sp-muted2">${escapeHtml(s.experience)}</p>
          <div class="sp-rating">⭐ <span>${s.rating.toFixed(1)}</span></div>
        </div>
      </div>

      ${
        s.available
        ? `<button class="btn" data-request="${s.id}">📅 Agendar Cita</button>`
        : `<button class="btn gray" disabled>No disponible</button>`
      }
    </div>
  `).join('');

  return `
    <section class="screen sp">
      <div class="sp-topbar">
        <button class="sp-back" id="spGoAssistantBtn">←</button>
        <h2>Especialistas</h2>
        <div class="sp-spacer"></div>
      </div>

      <div class="sp-hero blue">
        <h3>Apoyo Profesional</h3>
        <p>Conecta con especialistas certificados en salud mental para adultos mayores</p>
      </div>

      <div class="sp-stack">
        ${listHTML}
      </div>

      <div id="spData" data-json='${escapeAttr(JSON.stringify(specialists))}' style="display:none"></div>
    </section>
  `;

  function escapeHtml(str){
    return String(str)
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'",'&#039;');
  }

  function escapeAttr(str){
    return String(str).replaceAll("'", "&apos;").replaceAll('"', "&quot;");
  }
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

  // cancelar citas
  $app.querySelectorAll('[data-cancel]').forEach(btn => {
    btn.addEventListener('click', () => cancelAppointment(Number(btn.dataset.cancel)));
  });

  // ✅ Specialists events (FALTABA)
  const spGoAssistantBtn = document.getElementById('spGoAssistantBtn');
  if (spGoAssistantBtn) spGoAssistantBtn.addEventListener('click', () => navigate('assistant'));

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
}

// --- Bottom nav click ---
$bottomNav.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-screen]');
  if (!btn) return;
  navigate(btn.dataset.screen);
});

// Inicial
render();
