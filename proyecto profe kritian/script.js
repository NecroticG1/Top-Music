// script.js — Reproductor atractivo con reproducción automática, siguiente/anterior, aleatorio, repetición y barra de progreso

const audio = document.getElementById('main-audio');
const mainSource = document.getElementById('main-source');
const currentTitle = document.getElementById('current-title');
const currentArtist = document.getElementById('current-artist'); // Nuevo elemento para el artista
const currentCover = document.getElementById('current-cover'); // Nuevo elemento para la portada

const playButtons = Array.from(document.querySelectorAll('.btn-play'));
const mainPlayerCard = document.querySelector('.main-player .card-body');

let currentSrc = '';
let currentIndex = -1;
let shuffleMode = false;
let loopMode = false;
let songsData = []; // Para almacenar los datos de las canciones cargadas

// --- CREACIÓN DINÁMICA DE CONTROLES ---

// Contenedor principal de controles (Play/Pause y volumen)
const mainControlsContainer = document.createElement('div');
mainControlsContainer.classList.add('d-flex', 'justify-content-center', 'align-items-center', 'my-3');

// Botón principal de Play/Pause (Mejora UX/UI)
const btnPlayPause = document.createElement('button');
btnPlayPause.innerHTML = '▶️';
btnPlayPause.classList.add('btn', 'btn-lg');
btnPlayPause.setAttribute('aria-label', 'Reproducir/Pausar (Atajo: Barra Espaciadora)');
mainControlsContainer.appendChild(btnPlayPause);

// Contenedor de Controles Adicionales
const extraControlsContainer = document.createElement('div');
extraControlsContainer.classList.add('extra-controls');
extraControlsContainer.setAttribute('role', 'toolbar');
extraControlsContainer.setAttribute('aria-label', 'Controles Secundarios de Reproducción');

// Botón Anterior (A11y: aria-label)
const btnPrev = document.createElement('button');
btnPrev.innerHTML = '⏮️';
btnPrev.classList.add('btn');
btnPrev.setAttribute('aria-label', 'Canción Anterior (Atajo: Flecha Izquierda)');
extraControlsContainer.appendChild(btnPrev);

// Botón Aleatorio (A11y: role="switch" y aria-pressed)
const btnShuffle = document.createElement('button');
btnShuffle.innerHTML = '🔀';
btnShuffle.classList.add('btn');
btnShuffle.setAttribute('aria-label', 'Modo Aleatorio (Atajo: S)');
btnShuffle.setAttribute('aria-pressed', 'false');
extraControlsContainer.appendChild(btnShuffle);

// Botón Siguiente (A11y: aria-label)
const btnNext = document.createElement('button');
btnNext.innerHTML = '⏭️';
btnNext.classList.add('btn');
btnNext.setAttribute('aria-label', 'Siguiente Canción (Atajo: Flecha Derecha)');
extraControlsContainer.appendChild(btnNext);

// Botón Repetir (A11y: role="switch" y aria-pressed)
const btnLoop = document.createElement('button');
btnLoop.innerHTML = '🔁';
btnLoop.classList.add('btn');
btnLoop.setAttribute('aria-label', 'Modo Repetir (Atajo: L)');
btnLoop.setAttribute('aria-pressed', 'false');
extraControlsContainer.appendChild(btnLoop);

// Contenedor de Progreso y Tiempo
const progressContainer = document.createElement('div');
progressContainer.classList.add('progress-container');
progressContainer.setAttribute('role', 'group');
progressContainer.setAttribute('aria-label', 'Progreso de la Canción');

const timeIndicator = document.createElement('span');
timeIndicator.classList.add('time-indicator');
timeIndicator.innerText = '0:00 / 0:00';

const progressBar = document.createElement('input');
progressBar.type = 'range';
progressBar.min = 0;
progressBar.max = 100;
progressBar.value = 0;
progressBar.classList.add('progress-bar');
progressBar.setAttribute('role', 'slider');
progressBar.setAttribute('aria-valuemin', '0');
progressBar.setAttribute('aria-valuemax', '100');
progressBar.setAttribute('aria-valuenow', '0');
progressBar.setAttribute('aria-label', 'Posición de reproducción');
progressContainer.append(progressBar, timeIndicator);


// Contenedor de Volumen
const volumeContainer = document.createElement('div');
volumeContainer.classList.add('volume-container');
volumeContainer.setAttribute('role', 'group');
volumeContainer.setAttribute('aria-label', 'Control de Volumen');

const volumeIconLow = document.createElement('span');
volumeIconLow.innerHTML = '🔇'; // Ícono de volumen bajo
const volumeSlider = document.createElement('input');
volumeSlider.type = 'range';
volumeSlider.id = 'volume-slider';
volumeSlider.min = 0;
volumeSlider.max = 100;
volumeSlider.value = 100;
volumeSlider.classList.add('form-range');
volumeSlider.setAttribute('aria-valuemin', '0');
volumeSlider.setAttribute('aria-valuemax', '100');
volumeSlider.setAttribute('aria-valuenow', '100');
volumeSlider.setAttribute('aria-label', 'Ajustar Volumen');
const volumeIconHigh = document.createElement('span');
volumeIconHigh.innerHTML = '🔊'; // Ícono de volumen alto

volumeContainer.append(volumeIconLow, volumeSlider, volumeIconHigh);


// Insertar todos los controles en el DOM
mainPlayerCard.appendChild(mainControlsContainer); // Para el botón principal de Play/Pause
mainPlayerCard.appendChild(extraControlsContainer);
mainPlayerCard.appendChild(progressContainer);
mainPlayerCard.appendChild(volumeContainer);


// --- LÓGICA DEL REPRODUCTOR ---

// Almacenar datos de las canciones desde los botones del HTML
playButtons.forEach((button, index) => {
  songsData.push({
    title: button.getAttribute('data-title'),
    artist: button.getAttribute('data-artist'),
    src: button.getAttribute('data-src'),
    cover: button.getAttribute('data-cover')
  });
});

// Inicializar el volumen al valor del slider (100% por defecto)
audio.volume = volumeSlider.value / 100;
updateVolumeIcon();

// Función para actualizar el estado del botón Play/Pause
function updatePlayPauseButton() {
  if (audio.paused) {
    btnPlayPause.innerHTML = '▶️';
    btnPlayPause.setAttribute('aria-label', 'Reproducir (Atajo: Barra Espaciadora)');
  } else {
    btnPlayPause.innerHTML = '⏸️';
    btnPlayPause.setAttribute('aria-label', 'Pausar (Atajo: Barra Espaciadora)');
  }
}

// Función para actualizar los estados de los botones de modo (Feedback Visual y A11y)
function updateModeButtons() {
  btnShuffle.classList.toggle('active', shuffleMode);
  btnShuffle.setAttribute('aria-pressed', shuffleMode ? 'true' : 'false');
  btnShuffle.setAttribute('aria-label', shuffleMode ? 'Modo Aleatorio ACTIVADO (Atajo: S)' : 'Modo Aleatorio DESACTIVADO (Atajo: S)');
  
  btnLoop.classList.toggle('active', loopMode);
  btnLoop.setAttribute('aria-pressed', loopMode ? 'true' : 'false');
  btnLoop.setAttribute('aria-label', loopMode ? 'Modo Repetir ACTIVADO (Atajo: L)' : 'Modo Repetir DESACTIVADO (Atajo: L)');
}

// Función para actualizar el ícono de volumen (Mejora UX)
function updateVolumeIcon() {
  if (audio.volume === 0) {
    volumeIconLow.innerHTML = ' mute ';
  } else if (audio.volume < 0.5) {
    volumeIconLow.innerHTML = ' 🔈 ';
  } else {
    volumeIconLow.innerHTML = ' 🔊 ';
  }
}

// Función para cargar y reproducir una canción
function loadAndPlay(src, title, artist, cover, index) {
    if (currentSrc !== src) {
        mainSource.src = src;
        audio.load();
        currentSrc = src;
        currentIndex = index;
        currentTitle.innerText = title;
        currentArtist.innerText = artist;
        currentCover.src = cover;
    }
    
    // Llama a play()...
    audio.play().catch(e => {
        console.error("Error de reproducción en loadAndPlay:", e);
    });
    
    // ...PERO ELIMINA LA LLAMADA MANUAL A updatePlayPauseButton() de aquí:
    // updatePlayPauseButton(); // <-- COMENTAR O ELIMINAR ESTA LÍNEA
}


// Inicializar botones y añadir event listeners a las tarjetas de canciones
playButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    const song = songsData[index];
    loadAndPlay(song.src, song.title, song.artist, song.cover, index);
  });
});

// Reproducción automática y lógica de modos
audio.addEventListener('ended', () => {
  if (loopMode) {
    // Si loopMode está activo, el atributo audio.loop lo gestiona.
    audio.play(); 
  } else if (shuffleMode) {
    playRandomSong();
  } else {
    playNextSong(); 
  }
});

// Manejo de la barra de progreso (timeupdate)
audio.addEventListener('timeupdate', () => {
  const value = (audio.currentTime / audio.duration) * 100;
  progressBar.value = isNaN(value) ? 0 : value;
  progressBar.setAttribute('aria-valuenow', progressBar.value);
  
  const currentMin = Math.floor(audio.currentTime / 60);
  const currentSec = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
  
  const durationMin = Math.floor(audio.duration / 60);
  const durationSec = Math.floor(audio.duration % 60).toString().padStart(2, '0');

  timeIndicator.innerText = `${currentMin}:${currentSec} / ${isNaN(audio.duration) ? '0:00' : durationMin + ':' + durationSec}`;
});

// Permitir saltar a una posición en la barra de progreso
progressBar.addEventListener('input', () => {
  const time = (progressBar.value * audio.duration) / 100;
  audio.currentTime = time;
});


// Función para reproducir la siguiente canción
function playNextSong() {
  if (songsData.length === 0) return;

  if (shuffleMode) {
    playRandomSong();
    return;
  }

  let nextIndex = (currentIndex + 1) % songsData.length;
  const nextSong = songsData[nextIndex];
  loadAndPlay(nextSong.src, nextSong.title, nextSong.artist, nextSong.cover, nextIndex);
}

// Función para reproducir la canción anterior
function playPrevSong() {
  if (songsData.length === 0) return;

  let prevIndex = (currentIndex - 1 + songsData.length) % songsData.length;
  const prevSong = songsData[prevIndex];
  loadAndPlay(prevSong.src, prevSong.title, prevSong.artist, prevSong.cover, prevIndex);
}

// Función para reproducir una canción al azar
function playRandomSong() {
  if (songsData.length === 0) return;
  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * songsData.length);
  } while (randomIndex === currentIndex && songsData.length > 1);

  const randomSong = songsData[randomIndex];
  loadAndPlay(randomSong.src, randomSong.title, randomSong.artist, randomSong.cover, randomIndex);
}

// Eventos de los botones de control
btnPlayPause.type = 'button';
btnPlayPause.style.zIndex = '1000';

// Función que alterna reproducir/pausar (la usamos en varios handlers)
function togglePlayPause() {
    if (!audio.src) return; // No hay audio cargado → no hace nada

    if (audio.paused) {
        audio.play().catch(err => console.error('[ERROR] Reproducir:', err));
    } else {
        audio.pause();
    }
}


// Actualizar el botón principal Play/Pause según el estado del audio
function updatePlayPauseButton() {
    if (audio.paused) {
        btnPlayPause.innerHTML = '▶️';
        btnPlayPause.setAttribute('aria-label', 'Reproducir (Barra Espaciadora)');
    } else {
        btnPlayPause.innerHTML = '⏸️';
        btnPlayPause.setAttribute('aria-label', 'Pausar (Barra Espaciadora)');
    }
}

// ------------------------
// LISTENERS
// ------------------------

// Click en el botón Play/Pause
btnPlayPause.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlayPause();
});

// Barra espaciadora para reproducir/pausar
window.addEventListener('keydown', (e) => {
    // Evitar que afecte a inputs, sliders, textarea
    if (['INPUT','TEXTAREA','RANGE'].includes(document.activeElement.tagName)) return;

    if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
    }
});

// Actualizar botón cuando cambie el estado del audio
audio.addEventListener('play', updatePlayPauseButton);
audio.addEventListener('pause', updatePlayPauseButton);

// Inicializar estado del botón al cargar la página
updatePlayPauseButton();
// Eventos para actualizar los botones al reproducir/pausar
audio.addEventListener('play', updatePlayPauseButton);
audio.addEventListener('pause', updatePlayPauseButton);

btnPrev.addEventListener('click', playPrevSong);
btnNext.addEventListener('click', playNextSong);

btnShuffle.addEventListener('click', () => {
  shuffleMode = !shuffleMode;
  updateModeButtons();
});

btnLoop.addEventListener('click', () => {
  loopMode = !loopMode;
  audio.loop = loopMode; // Aquí se aplica el loop real en el elemento <audio>
  updateModeButtons();
});


// Control del Slider de Volumen
volumeSlider.addEventListener('input', () => {
  audio.volume = volumeSlider.value / 100;
  volumeSlider.setAttribute('aria-valuenow', volumeSlider.value);
  updateVolumeIcon();
});


// Atajos de teclado (mejoras de A11y y UX)
window.addEventListener('keydown', (e) => {
  if (document.activeElement && ['INPUT','TEXTAREA', 'RANGE'].includes(document.activeElement.tagName)) return;

  // Atajos de teclado (Línea 313 en adelante)
if (e.code === 'Space') {
    e.preventDefault();
    if (audio.paused) {
        audio.play().catch(error => { /* ... */ });
    } else {
        audio.pause();
    }
    // ¡NO PONER updatePlayPauseButton() AQUÍ TAMPOCO!
    // updatePlayPauseButton(); // COMENTAR O ELIMINAR ESTA LÍNEA
}
  if (e.code === 'ArrowRight') {
    e.preventDefault();
    playNextSong();
  }
  if (e.code === 'ArrowLeft') {
    e.preventDefault();
    playPrevSong();
  }
  if (e.code === 'KeyS') {
    e.preventDefault();
    shuffleMode = !shuffleMode;
    updateModeButtons();
  }
  if (e.code === 'KeyL') {
    e.preventDefault();
    loopMode = !loopMode;
    audio.loop = loopMode;
    updateModeButtons();
  }
  // Control de volumen con Flecha Arriba/Abajo
  if (e.code === 'ArrowUp') {
    e.preventDefault();
    if (audio.volume < 1.0) {
      audio.volume = Math.min(1.0, audio.volume + 0.1);
      volumeSlider.value = Math.round(audio.volume * 100);
      volumeSlider.setAttribute('aria-valuenow', volumeSlider.value);
      updateVolumeIcon();
    }
  }
  if (e.code === 'ArrowDown') {
    e.preventDefault();
    if (audio.volume > 0.0) {
      audio.volume = Math.max(0.0, audio.volume - 0.1);
      volumeSlider.value = Math.round(audio.volume * 100);
      volumeSlider.setAttribute('aria-valuenow', volumeSlider.value);
      updateVolumeIcon();
    }
  }
});

// Inicializar estado de los botones
updateModeButtons();
updatePlayPauseButton();

// Asegurar que la portada y artista por defecto se muestren al inicio
currentCover.src = 'img/default-cover.jpg';
currentTitle.innerText = 'Selecciona una canción';
currentArtist.innerText = 'Artista desconocido';