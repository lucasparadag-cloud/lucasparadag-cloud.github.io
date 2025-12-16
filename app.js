// -------------------- STATE --------------------
const state = {
  currentScreen: 'welcome',
  communityMessages: [],
  appointments: []
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

const COLORS = ['#4A90E2','#7ED321','#F5A623','#9B59B6','#E74C3C'];
const NAMES = ['Azul','Verde','Naranja','Morado','Rojo'];

const $app = document.getElementById('app');
const $bottomNav = document.getElementById('bottomNav');

// -------------------- NAV --------------------
function navigate(screen){
  state.currentScreen = screen;
  render();
}

// -------------------- SCREENS --------------------
function WelcomeScreen(){
  return `
    <section class="welcome">
      <div class="welcome-container">
        <img src="logo.png" class="welcome-logo">
        <h1>Nirvana</h1>
        <p>Bienestar emocional para adultos mayores</p>
        <button id="startBtn" class="welcome-button">Comenzar</button>
      </div>
    </section>
  `;
}

function HomeScreen(){
  return `
    <section class="screen">
      <h1>Inicio</h1>
      <div class="row">
        <button class="btn secondary" data-go="assistant">Asistente</button>
        <button class="btn secondary" data-go="games">Juegos</button>
        <button class="btn secondary" data-go="community">Comunidad</button>
        <button class="btn secondary" data-go="specialists">Especialistas</button>
      </div>
    </section>
  `;
}

function GamesScreen(){
  return `
    <section class="screen">
      <h1>Juegos</h1>
      <button class="btn" data-go="sequences-game">Juego de Secuencias</button>
    </section>
  `;
}

function SequencesGameScreen(){
  if(seq.over){
    return `
      <section class="screen">
        <div class="topbar">
          <button class="btn-back" data-go="games">←</button>
          <h2>Juego terminado</h2>
        </div>
        <div class="card">
          <p>Puntos: <b>${seq.score}</b></p>
          <p>Nivel: <b>${seq.round}</b></p>
          <button id="restartSeq" class="btn">Jugar de nuevo</button>
        </div>
      </section>
    `;
  }

  if(seq.sequence.length === 0){
    return `
      <section class="screen">
        <div class="topbar">
          <button class="btn-back" data-go="games">←</button>
          <h2>Secuencias</h2>
        </div>
        <div class="card">
          <p>Observa la secuencia y repítela.</p>
          <button id="startSeq" class="btn">Comenzar</button>
        </div>
      </section>
    `;
  }

  return `
    <section class="screen">
      <div class="topbar">
        <button class="btn-back" data-go="games">←</button>
        <h2>Secuencias</h2>
      </div>

      <div class="card">
        <p>Puntos: ${seq.score} | Nivel: ${seq.round}</p>
      </div>

      <div class="grid-colors">
        ${COLORS.map((c,i)=>`
          <button
            class="color-btn ${seq.active===i?'active':''}"
            style="background:${c}"
            data-color="${i}">
            ${NAMES[i]}
          </button>
        `).join('')}
      </div>
    </section>
  `;
}

function CommunityScreen(){
  return `
    <section class="screen">
      <h1>Comunidad</h1>
      <textarea id="msg"></textarea>
      <button id="sendMsg" class="btn">Publicar</button>
      ${state.communityMessages.map(m=>`
        <div class="card">${m}</div>
      `).join('')}
    </section>
  `;
}

function SpecialistsScreen(){
  return `
    <section class="screen">
      <h1>Especialistas</h1>
      <div class="card">
        <p>Psicóloga Demo</p>
        <button class="btn" id="book">Agendar cita</button>
      </div>
    </section>
  `;
}

function ProfileScreen(){
  return `
    <section class="screen">
      <h1>Perfil</h1>
      ${state.appointments.map(a=>`
        <div class="card">${a}</div>
      `).join('')}
    </section>
  `;
}

// -------------------- LOGIC SEQUENCES --------------------
async function playSequence(){
  seq.playing=true; seq.turn=false;
  for(const i of seq.sequence){
    await wait(400);
    seq.active=i; render();
    await wait(500);
    seq.active=null; render();
  }
  seq.playing=false; seq.turn=true;
}

function startSequence(){
  Object.assign(seq,{
    sequence:[rand()],
    user:[],
    score:0,
    round:1,
    over:false
  });
  playSequence();
}

function clickColor(i){
  if(!seq.turn) return;
  seq.user.push(i);

  if(i !== seq.sequence[seq.user.length-1]){
    seq.over=true; render(); return;
  }

  if(seq.user.length === seq.sequence.length){
    seq.score += 10;
    seq.round++;
    seq.user=[];
    seq.sequence.push(rand());
    playSequence();
  }
}

const rand = ()=>Math.floor(Math.random()*5);
const wait = ms=>new Promise(r=>setTimeout(r,ms));

// -------------------- RENDER --------------------
function render(){
  $bottomNav.classList.toggle('hidden', state.currentScreen==='welcome');

  let html='';
  switch(state.currentScreen){
    case 'welcome': html=WelcomeScreen(); break;
    case 'home': html=HomeScreen(); break;
    case 'games': html=GamesScreen(); break;
    case 'sequences-game': html=SequencesGameScreen(); break;
    case 'community': html=CommunityScreen(); break;
    case 'specialists': html=SpecialistsScreen(); break;
    case 'profile': html=ProfileScreen(); break;
  }

  $app.innerHTML = html;
  wireEvents();
}

function wireEvents(){
  document.querySelectorAll('[data-go]').forEach(b=>{
    b.onclick=()=>navigate(b.dataset.go);
  });

  const startBtn=document.getElementById('startBtn');
  if(startBtn) startBtn.onclick=()=>navigate('home');

  const s=document.getElementById('startSeq');
  if(s) s.onclick=startSequence;

  const r=document.getElementById('restartSeq');
  if(r) r.onclick=startSequence;

  document.querySelectorAll('[data-color]').forEach(b=>{
    b.onclick=()=>clickColor(+b.dataset.color);
  });

  const send=document.getElementById('sendMsg');
  if(send) send.onclick=()=>{
    const t=document.getElementById('msg').value;
    if(t) state.communityMessages.unshift(t);
    render();
  };

  const book=document.getElementById('book');
  if(book) book.onclick=()=>{
    state.appointments.push('Cita agendada');
    navigate('profile');
  };
}

$bottomNav.onclick=e=>{
  const b=e.target.closest('[data-screen]');
  if(b) navigate(b.dataset.screen);
};

render();
