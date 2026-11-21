/**
 * Floating Expandable Pill Navigation Bar - JavaScript Component
 * Modular, dependency-free, accessible (WAI-ARIA Tablist Pattern).
 */

class FloatingPillNav {
  /**
   * @param {string|HTMLElement} container - Selector or element for the navigation container
   * @param {Object} options - Configuration options
   * @param {string|number} [options.defaultTab] - ID or index of tab to activate on init
   * @param {Function} [options.onTabChange] - Callback invoked when active tab changes
   * @param {boolean} [options.autoSwitchPanels=true] - Automatically toggle panel visibility via aria-controls
   * @param {string} [options.panelActiveClass='active'] - Class added to the active content panel
   */
  constructor(container = '.floating-pill-nav', options = {}) {
    this.nav = typeof container === 'string' ? document.querySelector(container) : container;

    if (!this.nav) {
      console.warn('FloatingPillNav: Container element not found.');
      return;
    }

    this.options = {
      autoSwitchPanels: true,
      panelActiveClass: 'active',
      ...options
    };

    this.tabs = Array.from(this.nav.querySelectorAll('.nav-tab'));
    this.activeIndex = -1;
    this.listeners = new Map();

    this._bindEvents();
    this._initActiveTab();
  }

  /**
   * Set up keyboard navigation and click events
   * @private
   */
  _bindEvents() {
    this._handleTabClick = (e) => {
      const tab = e.target.closest('.nav-tab');
      if (!tab || !this.tabs.includes(tab)) return;
      e.preventDefault();
      this.setActiveTab(tab);
    };

    this._handleKeyDown = (e) => {
      const currentTab = document.activeElement;
      const currentIndex = this.tabs.indexOf(currentTab);
      if (currentIndex === -1) return;

      let nextIndex = -1;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          nextIndex = (currentIndex + 1) % this.tabs.length;
          break;

        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          nextIndex = (currentIndex - 1 + this.tabs.length) % this.tabs.length;
          break;

        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;

        case 'End':
          e.preventDefault();
          nextIndex = this.tabs.length - 1;
          break;

        case 'Enter':
        case ' ':
          e.preventDefault();
          this.setActiveTab(currentTab);
          return;

        default:
          return;
      }

      if (nextIndex !== -1) {
        const targetTab = this.tabs[nextIndex];
        targetTab.focus();
        this.setActiveTab(targetTab);
      }
    };

    this.nav.addEventListener('click', this._handleTabClick);
    this.nav.addEventListener('keydown', this._handleKeyDown);
  }

  /**
   * Determine and activate the initial tab
   * @private
   */
  _initActiveTab() {
    let initialTab = null;

    if (this.options.defaultTab !== undefined) {
      if (typeof this.options.defaultTab === 'number') {
        initialTab = this.tabs[this.options.defaultTab];
      } else {
        initialTab = this.tabs.find(
          t => t.id === this.options.defaultTab || t.dataset.target === this.options.defaultTab
        );
      }
    }

    if (!initialTab) {
      initialTab = this.tabs.find(t => t.classList.contains('active')) || this.tabs[0];
    }

    if (initialTab) {
      this.setActiveTab(initialTab, false);
    }
  }

  /**
   * Activate a specific tab by element, ID, or index
   * @param {HTMLElement|string|number} target
   * @param {boolean} [triggerCallback=true]
   */
  setActiveTab(target, triggerCallback = true) {
    let tabElement = null;

    if (typeof target === 'number') {
      tabElement = this.tabs[target];
    } else if (typeof target === 'string') {
      tabElement = this.tabs.find(t => t.id === target || t.dataset.target === target);
    } else if (target instanceof HTMLElement) {
      tabElement = target;
    }

    if (!tabElement || !this.tabs.includes(tabElement)) return;

    const newIndex = this.tabs.indexOf(tabElement);
    const isSameTab = newIndex === this.activeIndex;

    // Update ARIA attributes and classes on all tabs
    this.tabs.forEach((tab, index) => {
      const isActive = index === newIndex;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    this.activeIndex = newIndex;

    const tabId = tabElement.id || tabElement.dataset.target || `tab-${newIndex}`;
    const labelEl = tabElement.querySelector('.nav-label');
    const labelText = labelEl ? labelEl.textContent.trim() : tabElement.getAttribute('aria-label') || '';
    const panelId = tabElement.getAttribute('aria-controls');
    const panelElement = panelId ? document.getElementById(panelId) : null;

    // Handle Content Panel Switching (if enabled)
    if (this.options.autoSwitchPanels) {
      this._switchPanels(panelElement);
    }

    const eventPayload = {
      id: tabId,
      index: newIndex,
      label: labelText,
      tabElement,
      panelElement
    };

    if (triggerCallback && !isSameTab) {
      // 1. Invoke options callback if defined
      if (typeof this.options.onTabChange === 'function') {
        this.options.onTabChange(eventPayload);
      }

      // 2. Dispatch custom event on the navigation DOM element
      const customEvent = new CustomEvent('pillnav:change', {
        bubbles: true,
        cancelable: true,
        detail: eventPayload
      });
      this.nav.dispatchEvent(customEvent);

      // 3. Emit registered internal listeners
      this._emit('change', eventPayload);
    }
  }

  /**
   * Switch active content panel with aria-hidden toggle
   * @private
   */
  _switchPanels(activePanel) {
    this.tabs.forEach(tab => {
      const panelId = tab.getAttribute('aria-controls');
      if (!panelId) return;
      const panel = document.getElementById(panelId);
      if (!panel) return;

      const isCurrent = panel === activePanel;
      if (isCurrent) {
        panel.removeAttribute('hidden');
        panel.classList.add(this.options.panelActiveClass);
      } else {
        panel.setAttribute('hidden', '');
        panel.classList.remove(this.options.panelActiveClass);
      }
    });
  }

  /**
   * Returns current active tab information
   * @returns {Object}
   */
  getActiveTab() {
    const tabElement = this.tabs[this.activeIndex];
    if (!tabElement) return null;

    const labelEl = tabElement.querySelector('.nav-label');
    return {
      index: this.activeIndex,
      id: tabElement.id || tabElement.dataset.target,
      label: labelEl ? labelEl.textContent.trim() : '',
      tabElement
    };
  }

  /**
   * Event listener subscription helper
   * @param {string} eventName
   * @param {Function} callback
   */
  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);
    return () => this.off(eventName, callback);
  }

  /**
   * Event listener unsubscription helper
   * @param {string} eventName
   * @param {Function} callback
   */
  off(eventName, callback) {
    const handlers = this.listeners.get(eventName);
    if (!handlers) return;
    this.listeners.set(eventName, handlers.filter(cb => cb !== callback));
  }

  /**
   * Internal event emitter
   * @private
   */
  _emit(eventName, data) {
    const handlers = this.listeners.get(eventName);
    if (handlers) {
      handlers.forEach(fn => fn(data));
    }
  }

  /**
   * Destroy instance and remove event listeners
   */
  destroy() {
    this.nav.removeEventListener('click', this._handleTabClick);
    this.nav.removeEventListener('keydown', this._handleKeyDown);
    this.listeners.clear();
  }
}

// Global exposure & auto-initialization for declarative usage
if (typeof window !== 'undefined') {
  window.FloatingPillNav = FloatingPillNav;

  // Auto-initialize if element with [data-pill-nav] exists
  document.addEventListener('DOMContentLoaded', () => {
    const autoNav = document.querySelector('[data-pill-nav]');
    if (autoNav && !autoNav.__pillNavInstance) {
      autoNav.__pillNavInstance = new FloatingPillNav(autoNav);
    }
  });
}
