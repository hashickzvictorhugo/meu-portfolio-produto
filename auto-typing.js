/**
 * Auto Typing Animation for Secondary Headers
 * Protocolo ZERO BALA - FASE 3.4
 * Terminal-style typing effect on h2, h3 elements
 */

(() => {
  'use strict';

  const TYPING_SPEED = 50; // ms per character
  const DELETING_SPEED = 30;
  const PAUSE_BEFORE_DELETE = 2000;
  const PAUSE_BEFORE_TYPE = 500;

  class AutoTyper {
    constructor(element, texts, options = {}) {
      this.element = element;
      this.texts = Array.isArray(texts) ? texts : [texts];
      this.options = {
        speed: options.speed || TYPING_SPEED,
        deleteSpeed: options.deleteSpeed || DELETING_SPEED,
        pauseBeforeDelete: options.pauseBeforeDelete || PAUSE_BEFORE_DELETE,
        pauseBeforeType: options.pauseBeforeType || PAUSE_BEFORE_TYPE,
        cursor: options.cursor !== false,
        cursorChar: options.cursorChar || '|',
        cursorClass: options.cursorClass || 'typing-cursor',
        loop: options.loop !== false,
        onComplete: options.onComplete || null
      };

      this.currentTextIndex = 0;
      this.currentCharIndex = 0;
      this.isDeleting = false;
      this.isPaused = false;
      this.cursorElement = null;
      this.animationId = null;

      this.init();
    }

    init() {
      // Store original text
      this.originalText = this.element.textContent.trim();

      // Create cursor element
      if (this.options.cursor) {
        this.cursorElement = document.createElement('span');
        this.cursorElement.className = this.options.cursorClass;
        this.cursorElement.textContent = this.options.cursorChar;
        this.cursorElement.style.cssText = `
          border-right: 2px solid currentColor;
          animation: blink 0.7s infinite;
          margin-left: 2px;
        `;

        // Add blink animation if not exists
        if (!document.getElementById('typing-cursor-style')) {
          const style = document.createElement('style');
          style.id = 'typing-cursor-style';
          style.textContent = `
            @keyframes blink {
              0%, 100% { border-color: transparent; }
              50% { border-color: currentColor; }
            }
            @media (prefers-reduced-motion: reduce) {
              .typing-cursor { animation: none; border-color: currentColor; }
            }
          `;
          document.head.appendChild(style);
        }
      }

      // Clear element and start
      this.element.textContent = '';
      if (this.cursorElement) {
        this.element.appendChild(this.cursorElement);
      }

      this.type();
    }

    type() {
      if (this.isPaused) return;

      const currentText = this.texts[this.currentTextIndex];

      if (!this.isDeleting) {
        // Typing forward
        this.currentCharIndex++;
        this.element.textContent = currentText.substring(0, this.currentCharIndex);
        if (this.cursorElement) {
          this.element.appendChild(this.cursorElement);
        }

        if (this.currentCharIndex === currentText.length) {
          // Finished typing this text
          if (this.options.loop && this.texts.length > 1) {
            this.isPaused = true;
            setTimeout(() => {
              this.isDeleting = true;
              this.isPaused = false;
              this.delete();
            }, this.options.pauseBeforeDelete);
          } else if (this.options.onComplete) {
            this.options.onComplete();
          }
        } else {
          // Continue typing
          this.animationId = setTimeout(() => this.type(), this.options.speed);
        }
      } else {
        // Deleting
        this.delete();
      }
    }

    delete() {
      if (this.isPaused) return;

      const currentText = this.texts[this.currentTextIndex];

      this.currentCharIndex--;
      this.element.textContent = currentText.substring(0, this.currentCharIndex);
      if (this.cursorElement) {
        this.element.appendChild(this.cursorElement);
      }

      if (this.currentCharIndex === 0) {
        // Finished deleting
        this.isDeleting = false;
        this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length;
        this.isPaused = true;
        setTimeout(() => {
          this.isPaused = false;
          this.type();
        }, this.options.pauseBeforeType);
      } else {
        // Continue deleting
        this.animationId = setTimeout(() => this.delete(), this.options.deleteSpeed);
      }
    }

    pause() {
      this.isPaused = true;
      if (this.animationId) {
        clearTimeout(this.animationId);
      }
    }

    resume() {
      this.isPaused = false;
      if (!this.isDeleting) {
        this.type();
      } else {
        this.delete();
      }
    }

    destroy() {
      this.pause();
      this.element.textContent = this.originalText;
    }
  }

  // Auto-initialize on secondary headers
  function initAutoTyping() {
    // Target secondary headers (h2, h3) that don't already have typing
    const headers = document.querySelectorAll('h2, h3');

    headers.forEach((header, index) => {
      // Skip if already processed or has typewriter class
      if (header.classList.contains('auto-typing') || header.querySelector('.typing-cursor')) {
        return;
      }

      // Skip the main hero h1 (already has typewriter)
      if (header.id === 'typewriter' || header.closest('section')?.id === 'hero') {
        return;
      }

      const originalText = header.textContent.trim();
      if (!originalText || originalText.length < 3) return;

      // Mark as processed
      header.classList.add('auto-typing');

      // Create variation texts for cycling
      const variations = generateVariations(originalText);

      // Start typing after a staggered delay
      setTimeout(() => {
        new AutoTyper(header, variations, {
          speed: TYPING_SPEED + index * 10,
          loop: true
        });
      }, index * 800 + 500);
    });
  }

  function generateVariations(text) {
    // Create subtle variations for cycling effect
    const variations = [text];

    // Add terminal-style prefix variations
    if (text.length > 10) {
      variations.push(`> ${text}`);
      variations.push(`$ ${text}`);
      variations.push(`${text} _`);
    }

    return variations;
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutoTyping);
  } else {
    initAutoTyping();
  }

  // Re-scan for dynamically added headers
  const observer = new MutationObserver((mutations) => {
    let shouldRescan = false;
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'H2' || node.tagName === 'H3' || node.querySelector('h2, h3')) {
              shouldRescan = true;
            }
          }
        });
      }
    });
    if (shouldRescan) {
      setTimeout(initAutoTyping, 100);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Export
  window.AutoTyper = AutoTyper;
})();