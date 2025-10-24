const audio = document.getElementById('main-audio');
const mainSource = document.getElementById('main-source');
const currentTitle = document.getElementById('current-title');
const currentArtist = document.getElementById('current-artist'); 
const currentCover = document.getElementById('current-cover'); 

const playButtons = Array.from(document.querySelectorAll('.btn-play'));
const mainPlayerCard = document.querySelector('.main-player .card-body');

let currentSrc = '';
let currentIndex = -1;
let shuffleMode = false;
let loopMode = false;
let songsData = []; 

const mainControlsContainer = document.createElement('div');
mainControlsContainer.classList.add('d-flex', 'justify-content-center', 'align-items-center', 'my-3');


const btnPlayPause = document.createElement('button');
btnPlayPause.innerHTML = '▶️';
btnPlayPause.classList.add('btn', 'btn-lg');
btnPlayPause.setAttribute('aria-label', 'Reproducir/Pausar (Atajo: Barra Espaciadora)');
mainControlsContainer.appendChild(btnPlayPause);

const extraControlsContainer = document.createElement('div');
extraControlsContainer.classList.add('extra-controls');
extraControlsContainer.setAttribute('role', 'toolbar');
extraControlsContainer.setAttribute('aria-label', 'Controles Secundarios de Reproducción');

const btnPrev = document.createElement('button');
btnPrev.innerHTML = '⏮️';
btnPrev.classList.add('btn');
btnPrev.setAttribute('aria-label', 'Canción Anterior (Atajo: Flecha Izquierda)');
extraControlsContainer.appendChild(btnPrev);

const btnShuffle = document.createElement('button');
btnShuffle.innerHTML = '🔀';
btnShuffle.classList.add('btn');
btnShuffle.setAttribute('aria-label', 'Modo Aleatorio (Atajo: S)');
btnShuffle.setAttribute('aria-pressed', 'false');
extraControlsContainer.appendChild(btnShuffle);

const btnNext = document.createElement('button');
btnNext.innerHTML = '⏭️';
btnNext.classList.add('btn');
btnNext.setAttribute('aria-label', 'Siguiente Canción (Atajo: Flecha Derecha)');
extraControlsContainer.appendChild(btnNext);

const btnLoop = document.createElement('button');
btnLoop.innerHTML = '🔁';
btnLoop.classList.add('btn');
btnLoop.setAttribute('aria-label', 'Modo Repetir (Atajo: L)');
btnLoop.setAttribute('aria-pressed', 'false');
extraControlsContainer.appendChild(btnLoop);

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

const volumeContainer = document.createElement('div');
volumeContainer.classList.add('volume-container');
volumeContainer.setAttribute('role', 'group');
volumeContainer.setAttribute('aria-label', 'Control de Volumen');

const volumeIconLow = document.createElement('span');
volumeIconLow.innerHTML = '🔇';
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
volumeIconHigh.innerHTML = '🔊'; 

volumeContainer.append(volumeIconLow, volumeSlider, volumeIconHigh);

mainPlayerCard.appendChild(mainControlsContainer);
mainPlayerCard.appendChild(extraControlsContainer);
mainPlayerCard.appendChild(progressContainer);
mainPlayerCard.appendChild(volumeContainer);

playButtons.forEach((button, index) => {
  songsData.push({
    title: button.getAttribute('data-title'),
    artist: button.getAttribute('data-artist'),
    src: button.getAttribute('data-src'),
    cover: button.getAttribute('data-cover')
  });
});

audio.volume = volumeSlider.value / 100;
updateVolumeIcon();

function updatePlayPauseButton() {
  if (audio.paused) {
    btnPlayPause.innerHTML = '▶️';
    btnPlayPause.setAttribute('aria-label', 'Reproducir (Atajo: Barra Espaciadora)');
  } else {
    btnPlayPause.innerHTML = '⏸️';
    btnPlayPause.setAttribute('aria-label', 'Pausar (Atajo: Barra Espaciadora)');
  }
}

function updateModeButtons() {
  btnShuffle.classList.toggle('active', shuffleMode);
  btnShuffle.setAttribute('aria-pressed', shuffleMode ? 'true' : 'false');
  btnShuffle.setAttribute('aria-label', shuffleMode ? 'Modo Aleatorio ACTIVADO (Atajo: S)' : 'Modo Aleatorio DESACTIVADO (Atajo: S)');
  
  btnLoop.classList.toggle('active', loopMode);
  btnLoop.setAttribute('aria-pressed', loopMode ? 'true' : 'false');
  btnLoop.setAttribute('aria-label', loopMode ? 'Modo Repetir ACTIVADO (Atajo: L)' : 'Modo Repetir DESACTIVADO (Atajo: L)');
}

function updateVolumeIcon() {
  if (audio.volume === 0) {
    volumeIconLow.innerHTML = ' mute ';
  } else if (audio.volume < 0.5) {
    volumeIconLow.innerHTML = ' 🔈 ';
  } else {
    volumeIconLow.innerHTML = ' 🔊 ';
  }
}

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
    
    audio.play().catch(e => {
        console.error("Error de reproducción en loadAndPlay:", e);
    });
}

playButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    const song = songsData[index];
    loadAndPlay(song.src, song.title, song.artist, song.cover, index);
  });
});

audio.addEventListener('ended', () => {
  if (loopMode) {

    audio.play(); 
  } else if (shuffleMode) {
    playRandomSong();
  } else {
    playNextSong(); 
  }
});

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

progressBar.addEventListener('input', () => {
  const time = (progressBar.value * audio.duration) / 100;
  audio.currentTime = time;
});


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

function playPrevSong() {
  if (songsData.length === 0) return;

  let prevIndex = (currentIndex - 1 + songsData.length) % songsData.length;
  const prevSong = songsData[prevIndex];
  loadAndPlay(prevSong.src, prevSong.title, prevSong.artist, prevSong.cover, prevIndex);
}

function playRandomSong() {
  if (songsData.length === 0) return;
  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * songsData.length);
  } while (randomIndex === currentIndex && songsData.length > 1);

  const randomSong = songsData[randomIndex];
  loadAndPlay(randomSong.src, randomSong.title, randomSong.artist, randomSong.cover, randomIndex);
}

btnPlayPause.type = 'button';
btnPlayPause.style.zIndex = '1000';

function togglePlayPause() {
    if (!audio.src) return; 

    if (audio.paused) {
        audio.play().catch(err => console.error('[ERROR] Reproducir:', err));
    } else {
        audio.pause();
    }
}

function updatePlayPauseButton() {
    if (audio.paused) {
        btnPlayPause.innerHTML = '▶️';
        btnPlayPause.setAttribute('aria-label', 'Reproducir (Barra Espaciadora)');
    } else {
        btnPlayPause.innerHTML = '⏸️';
        btnPlayPause.setAttribute('aria-label', 'Pausar (Barra Espaciadora)');
    }
}

btnPlayPause.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlayPause();
});

window.addEventListener('keydown', (e) => {
 
    if (['INPUT','TEXTAREA','RANGE'].includes(document.activeElement.tagName)) return;

    if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
    }
});

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

window.addEventListener('keydown', (e) => {
  if (document.activeElement && ['INPUT','TEXTAREA', 'RANGE'].includes(document.activeElement.tagName)) return;

if (e.code === 'Space') {
    e.preventDefault();
    if (audio.paused) {
        audio.play().catch(error => {});
    } else {
        audio.pause();
    }
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