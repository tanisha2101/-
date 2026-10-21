const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const audio = $('#pujoAudio');
const soundToggle = $('#soundToggle');
const soundLabel = $('#soundLabel');
const photoModal = $('#photoModal');
const modalImage = $('#modalImage');
const modalCaption = $('#modalCaption');

// Create the fairy lights and falling shiuli without extra image assets.
const lights = $('#fairyLights');
for (let i = 0; i < 34; i++) {
  const bulb = document.createElement('span');
  bulb.className = 'bulb';
  bulb.style.animationDelay = `${-(Math.random() * 2.5).toFixed(2)}s`;
  lights.appendChild(bulb);
}

const shiuliField = $('#shiuliField');
let flowerTimer;
function dropShiuli() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const flower = document.createElement('span');
  flower.className = 'shiuli';
  flower.textContent = Math.random() > .5 ? '✿' : '❀';
  flower.style.left = `${Math.random() * 100}%`;
  flower.style.setProperty('--drift', `${Math.round(Math.random() * 180 - 90)}px`);
  flower.style.animationDuration = `${Math.random() * 5 + 7}s`;
  flower.style.opacity = `${Math.random() * .45 + .35}`;
  flower.style.fontSize = `${Math.random() * 9 + 12}px`;
  shiuliField.appendChild(flower);
  window.setTimeout(() => flower.remove(), 13000);
}
for (let i = 0; i < 9; i++) window.setTimeout(dropShiuli, i * 500);
flowerTimer = window.setInterval(dropShiuli, 1250);

// Reveal photos and text as they enter the viewport.
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
$$('.reveal').forEach(el => revealObserver.observe(el));

// Scroll into evening, then night; return to warm daylight near the top.
const sceneObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const scene = entry.target.dataset.scene;
      document.body.classList.toggle('night-mode', scene === 'night' || scene === 'midnight');
    }
  });
}, { threshold: 0.38 });
$$('[data-scene]').forEach(el => sceneObserver.observe(el));

async function toggleAudio() {
  if (audio.paused) {
    try {
      await audio.play();
      soundLabel.textContent = 'Pause the dhaak';
      soundToggle.setAttribute('aria-label', 'Pause Pujo audio');
    } catch (error) {
      soundLabel.textContent = 'Tap to play audio';
    }
  } else {
    audio.pause();
    soundLabel.textContent = 'Play the dhaak';
    soundToggle.setAttribute('aria-label', 'Play Pujo audio');
  }
}
soundToggle.addEventListener('click', toggleAudio);
audio.addEventListener('play', () => {
  soundLabel.textContent = 'Pause the dhaak';
  soundToggle.setAttribute('aria-label', 'Pause Pujo audio');
});
audio.addEventListener('pause', () => {
  soundLabel.textContent = 'Play the dhaak';
  soundToggle.setAttribute('aria-label', 'Play Pujo audio');
});

// Click-to-open Polaroids.
$$('.memory-photo').forEach(button => {
  button.addEventListener('click', () => {
    const file = button.dataset.image;
    const image = button.querySelector('img');
    modalImage.src = `${file}`;
    modalImage.alt = image?.alt || button.dataset.caption || 'Pujo memory';
    modalCaption.textContent = button.dataset.caption || button.querySelector('span')?.textContent || 'A little moment, kept forever.';
    if (typeof photoModal.showModal === 'function') photoModal.showModal();
    else photoModal.setAttribute('open', '');
  });
});
$('#modalClose').addEventListener('click', () => photoModal.close());
photoModal.addEventListener('click', event => {
  if (event.target === photoModal) photoModal.close();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && photoModal.open) photoModal.close();
});

// The hidden letter opens in place.
const letterButton = $('#letterButton');
const loveLetter = $('#loveLetter');
letterButton.addEventListener('click', () => {
  const isOpen = letterButton.getAttribute('aria-expanded') === 'true';
  letterButton.setAttribute('aria-expanded', String(!isOpen));
  letterButton.classList.toggle('open', !isOpen);
  loveLetter.hidden = isOpen;
  letterButton.querySelector('.envelope-label').textContent = isOpen ? 'Open when you miss us' : 'A letter, just for you';
  if (!isOpen) setTimeout(() => loveLetter.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
});

// Replay means restart the experience: top of page, warm opening, letter closed, audio restarted if it was playing.
$('#replayButton').addEventListener('click', async () => {
  const wasPlaying = !audio.paused;
  audio.pause();
  try { audio.currentTime = 0; } catch (_) {}
  letterButton.setAttribute('aria-expanded', 'false');
  letterButton.classList.remove('open');
  letterButton.querySelector('.envelope-label').textContent = 'Open when you miss us';
  loveLetter.hidden = true;
  document.body.classList.remove('night-mode');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (wasPlaying) {
    try { await audio.play(); } catch (_) {}
  }
});
