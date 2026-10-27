/**
 * Cyber Glitch Hover Effect
 * Protocolo ZERO BALA - FASE 3.3
 * Micro-glitch RGB shift on buttons/links hover
 */

(function() {
  'use strict';

  const style = document.createElement('style');
  style.textContent = `
    /* Cyber Glitch Hover - Global Effect */
    .cyber-glitch-hover {
      position: relative;
      overflow: visible !important;
    }

    .cyber-glitch-hover::before,
    .cyber-glitch-hover::after {
      content: attr(data-text);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.1s ease;
    }

    .cyber-glitch-hover::before {
      color: #ff2a6d;
      text-shadow: 2px 0 0 #ff2a6d;
      clip-path: polygon(0 0, 100% 0, 100% 40%, 0 40%);
      transform: translate(-2px, 0);
    }

    .cyber-glitch-hover::after {
      color: #05d9e8;
      text-shadow: -2px 0 0 #05d9e8;
      clip-path: polygon(0 60%, 100% 60%, 100% 100%, 0 100%);
      transform: translate(2px, 0);
    }

    .cyber-glitch-hover:hover::before,
    .cyber-glitch-hover:hover::after {
      opacity: 1;
      animation: glitch-shift 0.3s cubic-bezier(0.23, 1, 0.32, 1) forwards;
    }

    .cyber-glitch-hover:hover::before {
      animation-delay: 0s;
    }

    .cyber-glitch-hover:hover::after {
      animation-delay: 0.05s;
    }

    @keyframes glitch-shift {
      0% {
        opacity: 0;
        transform: translate(0, 0);
        clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
      }
      20% {
        opacity: 1;
        transform: translate(var(--glitch-x, 2px), var(--glitch-y, 0));
        clip-path: polygon(0 20%, 100% 20%, 100% 60%, 0 60%);
      }
      40% {
        transform: translate(calc(var(--glitch-x, 2px) * -1), var(--glitch-y, 0));
        clip-path: polygon(0 40%, 100% 40%, 100% 80%, 0 80%);
      }
      60% {
        transform: translate(var(--glitch-x, 2px), calc(var(--glitch-y, 0) * -1));
        clip-path: polygon(0 10%, 100% 10%, 100% 50%, 0 50%);
      }
      80% {
        transform: translate(0, 0);
        clip-path: polygon(0 30%, 100% 30%, 100% 70%, 0 70%);
      }
      100% {
        opacity: 0;
        transform: translate(0, 0);
        clip-path: polygon(0 100%, 100% 100%, 100% 100%, 0 100%);
      }
    }

    /* Apply to magnetic buttons */
    .magnetic-btn {
      --glitch-x: 2px;
      --glitch-y: 0;
    }

    /* Apply to nav links */
    nav a[href^="#"] {
      --glitch-x: 1px;
      --glitch-y: 0;
    }

    /* Apply to project card links */
    .project-card a {
      --glitch-x: 2px;
      --glitch-y: -1px;
    }

    /* Apply to social links */
    a[href*="github"],
    a[href*="whatsapp"],
    a[href*="mailto"] {
      --glitch-x: 1px;
      --glitch-y: 0;
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .cyber-glitch-hover::before,
      .cyber-glitch-hover::after {
        display: none !important;
        animation: none !important;
      }
    }
  `;

  document.head.appendChild(style);

  // Auto-apply cyber-glitch-hover class to interactive elements
  function applyGlitchClass() {
    const selectors = [
      '.magnetic-btn',
      'nav a[href^="#"]',
      '.project-card a',
      'a[href*="github"]',
      'a[href*="whatsapp"]',
      'a[href*="mailto"]',
      '#cli-toggle',
      '#chat-fab',
      '#send-chat',
      '#close-chat'
    ];

    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        if (!el.classList.contains('cyber-glitch-hover')) {
          el.classList.add('cyber-glitch-hover');
          // Set data-text for pseudo-elements
          const text = el.textContent.trim() || el.getAttribute('aria-label') || '';
          if (text) {
            el.setAttribute('data-text', text);
          }
        }
      });
    });
  }

  // Apply on DOM ready and after dynamic content
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyGlitchClass);
  } else {
    applyGlitchClass();
  }

  // Re-apply after a short delay for dynamically added elements
  setTimeout(applyGlitchClass, 1000);
  setTimeout(applyGlitchClass, 3000);

  // Export for manual use
  window.CyberGlitch = {
    apply: applyGlitchClass
  };
})();