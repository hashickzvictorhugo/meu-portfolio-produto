/**
 * Ambient Sound Button - Pink Noise Generator
 * Protocolo ZERO BALA - FASE 3.1
 * Web Audio API procedural pink noise
 */

(() => {
  'use strict';

  let audioContext = null;
  let noiseBuffer = null;
  let noiseSource = null;
  let gainNode = null;
  let isPlaying = false;
  const VOLUME = 0.12;

  /**
   * Generate pink noise buffer using Web Audio API
   */
  function generatePinkNoise() {
    const bufferSize = 44100 * 2; // 2 seconds at 44.1kHz
    noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Paul Kellet's pink noise algorithm
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104851;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11; // Normalize
      b6 = white * 0.115926;
    }
  }

  /**
   * Initialize Audio Context
   */
  async function initAudio() {
    if (audioContext) return;

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    generatePinkNoise();

    gainNode = audioContext.createGain();
    gainNode.gain.value = VOLUME;
    gainNode.connect(audioContext.destination);
  }

  /**
   * Start pink noise playback
   */
  function startNoise() {
    if (!audioContext) return;
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    noiseSource.connect(gainNode);
    noiseSource.start(0);
    isPlaying = true;
  }

  /**
   * Stop pink noise playback
   */
  function stopNoise() {
    if (noiseSource) {
      noiseSource.stop(0);
      noiseSource.disconnect();
      noiseSource = null;
    }
    isPlaying = false;
  }

  /**
   * Toggle playback
   */
  async function toggleNoise() {
    await initAudio();
    if (isPlaying) {
      stopNoise();
    } else {
      startNoise();
    }
    updateButtonUI();
  }

  /**
   * Create and inject the sound button
   */
  function createSoundButton() {
    const button = document.createElement('button');
    button.id = 'ambient-sound-btn';
    button.setAttribute('aria-label', 'Ativar som ambiente (Pink Noise)');
    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '0');
    button.innerHTML = `
      <svg id="sound-icon-off" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <line x1="23" y1="9" x2="17" y2="15"></line>
        <line x1="17" y1="9" x2="23" y2="15"></line>
      </svg>
      <svg id="sound-icon-on" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: block;">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      </svg>
    `;

    // Glassmorphism + Neon styles
    Object.assign(button.style, {
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: '10000',
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      background: 'rgba(10, 10, 12, 0.6)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 42, 109, 0.3)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
      overflow: 'hidden'
    });

    // Pulse animation for active state
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse-neon {
        0%, 100% { box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 0 20px rgba(255, 42, 109, 0.3); }
        50% { box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 0 40px rgba(255, 42, 109, 0.6), 0 0 60px rgba(5, 217, 232, 0.3); }
      }
      #ambient-sound-btn.active { animation: pulse-neon 2s ease-in-out infinite; border-color: rgba(255, 42, 109, 0.8); }
      #ambient-sound-btn:hover { transform: scale(1.1); border-color: rgba(255, 42, 109, 0.6); }
      #ambient-sound-btn:focus-visible { outline: 2px solid #ff2a6d; outline-offset: 3px; }
      @media (prefers-reduced-motion: reduce) {
        #ambient-sound-btn.active { animation: none; }
        #ambient-sound-btn:hover { transform: none; }
      }
    `;
    document.head.appendChild(style);

    button.addEventListener('click', toggleNoise);
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleNoise();
      }
    });

    document.body.appendChild(button);
    updateButtonUI();

    function updateButtonUI() {
      const onIcon = button.querySelector('#sound-icon-on');
      const offIcon = button.querySelector('#sound-icon-off');
      if (isPlaying) {
        onIcon.style.display = 'block';
        offIcon.style.display = 'none';
        button.classList.add('active');
        button.setAttribute('aria-label', 'Desativar som ambiente');
      } else {
        onIcon.style.display = 'none';
        offIcon.style.display = 'block';
        button.classList.remove('active');
        button.setAttribute('aria-label', 'Ativar som ambiente (Pink Noise)');
      }
    }
  }

  // Initialize when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createSoundButton);
  } else {
    createSoundButton();
  }
})();