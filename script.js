const matchesContainer = document.getElementById('matches');
const streamBox = document.getElementById('streamBox');
const video = document.getElementById('videoPlayer');
const status = document.getElementById('status');
const playerInfo = document.getElementById('playerInfo');
const closeBtn = document.getElementById('closeBtn');

function setStatus(msg) { status.textContent = msg; }

fetch('nana.json')
  .then(res => res.json())
  .then(data => {
    renderMatches(data.matches);
    setStatus('Prêt');
  })
  .catch(() => setStatus('Erreur de chargement du JSON'));

function renderMatches(matches) {
  matchesContainer.innerHTML = '';
  matches.forEach((m, i) => {
    const card = document.createElement('div');
    card.className = `card ${m.color || 'color-a'}`;
    card.innerHTML = `
      <div class="title">${m.title}</div>
      <div class="meta">${m.date} — ${m.venue}</div>
      <div class="input-wrap">
        <input type="text" value="${m.stream_url || ''}" placeholder="Lien du flux (.m3u8 ou .mp4)" />
        <button class="player-btn">Jouer</button>
      </div>
    `;
    const btn = card.querySelector('button');
    const input = card.querySelector('input');
    btn.addEventListener('click', () => {
      const url = input.value.trim();
      if (!url) return setStatus('Aucun lien fourni pour ' + m.title);
      playLink(url, m.title);
    });
    matchesContainer.appendChild(card);
  });
}

async function playLink(url, label) {
  streamBox.style.display = 'block';
  playerInfo.textContent = label;
  setStatus('Chargement...');

  const type = url.includes('.m3u8') ? 'hls' : 'mp4';

  if (type === 'hls' && Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
    hls.on(Hls.Events.ERROR, () => setStatus('Erreur de lecture HLS'));
    setStatus('Lecture HLS en cours...');
  } else {
    video.src = url;
    await video.play().catch(() => {});
    setStatus('Lecture directe en cours...');
  }
}

closeBtn.addEventListener('click', () => {
  video.pause();
  video.removeAttribute('src');
  video.load();
  streamBox.style.display = 'none';
  setStatus('Prêt');
});
