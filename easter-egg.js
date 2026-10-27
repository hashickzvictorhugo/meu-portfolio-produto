/**
 * Matrix Digital Rain Easter Egg
 * Protocolo ZERO BALA - FASE 3.2
 * Keylogger benigno para "matrix" -> Canvas Matrix Rain
 */

(() => {
  'use strict';

  const SEQUENCE = 'matrix';
  let buffer = '';
  let isActive = false;
  let canvas = null;
  let ctx = null;
  let animationId = null;
  let columns = [];
  const FONT_SIZE = 16;
  const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  function initMatrix() {
    canvas = document.createElement('canvas');
    canvas.id = 'matrix-rain';
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9998;
      pointer-events: none;
      opacity: 0;
      transition: opacity 1s ease-in-out;
    `;
    document.body.appendChild(canvas);

    ctx = canvas.getContext('2d');
    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);

    // Initialize columns
    const cols = Math.floor(canvas.width / FONT_SIZE);
    columns = Array(cols).fill(0).map(() => ({
      y: Math.random() * -canvas.height,
      speed: 1 + Math.random() * 3,
      chars: Array(Math.floor(5 + Math.random() * 15)).fill(0).map(() => randomChar()),
      opacity: 0.1 + Math.random() * 0.9
    }));

    animateMatrix();
  }

  function resizeCanvas() {
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }

  function randomChar() {
    return CHARS[Math.floor(Math.random() * CHARS.length)];
  }

  function animateMatrix() {
    if (!isActive) return;

    // Semi-transparent black for trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${FONT_SIZE}px 'JetBrains Mono', 'Fira Code', monospace`;

    columns.forEach((col, i) => {
      const x = i * FONT_SIZE;

      // Draw characters
      col.chars.forEach((char, j) => {
        const y = col.y + j * FONT_SIZE;

        if (y > 0 && y < canvas.height) {
          // Green gradient
          const alpha = col.opacity * (1 - j / col.chars.length);
          ctx.fillStyle = `rgba(0, 255, 70, ${alpha})`;

          // Bright head character
          if (j === 0) {
            ctx.fillStyle = `rgba(180, 255, 180, ${alpha + 0.3})`;
          }

          ctx.fillText(char, x, y);
        }
      });

      // Move column down
      col.y += col.speed;

      // Reset column when off screen
      if (col.y > canvas.height + col.chars.length * FONT_SIZE) {
        col.y = Math.random() * -canvas.height;
        col.speed = 1 + Math.random() * 3;
        col.chars = Array(Math.floor(5 + Math.random() * 15)).fill(0).map(() => randomChar());
        col.opacity = 0.1 + Math.random() * 0.9;
      }
    });

    animationId = requestAnimationFrame(animateMatrix);
  }

  function startMatrix() {
    if (isActive) return;
    isActive = true;
    canvas.style.opacity = '1';
    animateMatrix();
  }

  function stopMatrix() {
    isActive = false;
    canvas.style.opacity = '0';
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  function handleKeydown(e) {
    // Ignore if typing in input/textarea
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      return;
    }

    const key = e.key.toLowerCase();
    if (key.length === 1) {
      buffer += key;
      if (buffer.length > SEQUENCE.length) {
        buffer = buffer.slice(-SEQUENCE.length);
      }

      if (buffer === SEQUENCE) {
        if (!canvas) {
          initMatrix();
        }
        startMatrix();
        buffer = '';
      }
    }
  }

  function handleKeyup(e) {
    // Escape key to deactivate
    if (e.key === 'Escape' && isActive) {
      stopMatrix();
    }
  }

  // Global keylogger for "matrix"
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('keyup', handleKeyup);

  // Expose for manual control
  window.MatrixEasterEgg = {
    activate: startMatrix,
    deactivate: stopMatrix,
    isActive: () => isActive
  };

  console.log('[MatrixEasterEgg] Digite "matrix" em qualquer lugar para ativar');
})();