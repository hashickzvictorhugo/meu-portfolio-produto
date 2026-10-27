/**
 * Security Utility - XSS Protection & Sanitization
 * Protocolo ZERO BALA - Blindagem Militar
 * Injetado no index.html para obliterar vetores de XSS
 */

(() => {
  'use strict';

  /**
   * Escape HTML entities to prevent XSS
   * @param {string} str - Input string
   * @returns {string} - Escaped string
   */
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, ''')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Sanitize HTML string - allow only safe tags
   * @param {string} html - HTML string
   * @returns {string} - Sanitized HTML
   */
  function sanitizeHtml(html) {
    if (typeof html !== 'string') return '';
    const allowedTags = ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'span', 'code', 'pre'];
    const allowedAttrs = ['href', 'target', 'rel', 'class', 'id'];

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Remove disallowed elements
    doc.querySelectorAll('*').forEach(el => {
      if (!allowedTags.includes(el.tagName.toLowerCase())) {
        el.replaceWith(...el.childNodes);
        return;
      }

      // Remove disallowed attributes
      [...el.attributes].forEach(attr => {
        if (!allowedAttrs.includes(attr.name.toLowerCase())) {
          el.removeAttribute(attr.name);
        }
      });

      // Sanitize href attributes
      if (el.hasAttribute('href')) {
        const href = el.getAttribute('href');
        if (href && !href.match(/^https?:\/\//) && !href.match(/^mailto:/) && !href.match(/^tel:/)) {
          el.removeAttribute('href');
        } else if (href && href.match(/^https?:\/\//)) {
          el.setAttribute('rel', 'noopener noreferrer');
          el.setAttribute('target', '_blank');
        }
      }
    });

    return doc.body.innerHTML;
  }

  /**
   * Safe textContent setter - prevents XSS via innerHTML
   * @param {Element} element - Target element
   * @param {string} text - Text content
   */
  function safeSetText(element, text) {
    if (element && typeof text === 'string') {
      element.textContent = text;
    }
  }

  /**
   * Safe HTML setter with sanitization
   * @param {Element} element - Target element
   * @param {string} html - HTML string
   */
  function safeSetHtml(element, html) {
    if (element && typeof html === 'string') {
      element.innerHTML = sanitizeHtml(html);
    }
  }

  /**
   * Validate and sanitize URL
   * @param {string} url - URL to validate
   * @returns {string|null} - Valid URL or null
   */
  function sanitizeUrl(url) {
    if (typeof url !== 'string') return null;
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
        return null;
      }
      return parsed.toString();
    } catch {
      return null;
    }
  }

  /**
   * Sanitize LocalStorage/SessionStorage data
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @returns {boolean} - Success
   */
  function safeStorageSet(key, value) {
    try {
      const sanitized = typeof value === 'string' ? escapeHtml(value) : JSON.stringify(value);
      localStorage.setItem(key, sanitized);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Safe LocalStorage/SessionStorage getter
   * @param {string} key - Storage key
   * @returns {any} - Parsed value or null
   */
  function safeStorageGet(key) {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      // Try parse as JSON, fallback to string
      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    } catch {
      return null;
    }
  }

  /**
   * Create trusted HTML from template (for known-safe templates only)
   * @param {string} template - Template string
   * @param {Object} data - Data object
   * @returns {string} - Safe HTML
   */
  function renderTemplate(template, data) {
    if (typeof template !== 'string' || !data) return '';

    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = data[key];
      return typeof value === 'string' ? escapeHtml(value) : '';
    });
  }

  /**
   * Input sanitization for form fields
   * @param {HTMLInputElement|HTMLTextAreaElement} input - Input element
   */
  function sanitizeInput(input) {
    if (!input) return;
    const sanitized = escapeHtml(input.value);
    if (input.value !== sanitized) {
      input.value = sanitized;
    }
  }

  /**
   * Attach sanitization to all form inputs
   */
  function protectForms() {
    document.querySelectorAll('input[type="text"], input[type="email"], input[type="url"], textarea').forEach(input => {
      input.addEventListener('blur', () => sanitizeInput(input));
      input.addEventListener('input', () => sanitizeInput(input));
    });
  }

  /**
   * Content Security Policy violation reporter
   */
  function initCspReporter() {
    document.addEventListener('securitypolicyviolation', (e) => {
      console.warn('[CSP Violation]', {
        directive: e.violatedDirective,
        blockedURI: e.blockedURI,
        lineNumber: e.lineNumber,
        sourceFile: e.sourceFile
      });
    });
  }

  /**
   * Initialize all protections
   */
  function init() {
    protectForms();
    initCspReporter();

    // Expose safe APIs globally
    window.VHSecurity = {
      escapeHtml,
      sanitizeHtml,
      safeSetText,
      safeSetHtml,
      sanitizeUrl,
      safeStorageSet,
      safeStorageGet,
      renderTemplate
    };

    console.log('[VHSecurity] Blindagem ativa - XSS protection initialized');
  }

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();