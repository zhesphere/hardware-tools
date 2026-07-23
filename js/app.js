/**
 * 硬件工程师工具箱 - 主应用
 * 管理工具切换和全局状态
 */

/* ===== Theme Management ===== */
const Theme = {
  KEY: 'hw-tools-theme',

  init() {
    const saved = localStorage.getItem(this.KEY);
    if (saved) {
      this.apply(saved);
    } else {
      // Follow system preference on first visit
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.apply(prefersDark ? 'dark' : 'light');
    }
    this.bindToggle();

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.KEY)) {
        this.apply(e.matches ? 'dark' : 'light');
      }
    });
  },

  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
      btn.title = theme === 'dark' ? '切换到浅色主题' : '切换到深色主题';
    }
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(this.KEY, next);
    this.apply(next);
  },

  bindToggle() {
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.addEventListener('click', () => this.toggle());
    }
  }
};

const App = {
  TOOL_KEY: 'hw-tools-current-tool',
  currentTool: 'unit-converter',

  init() {
    Theme.init();
    // Restore last-used tool from localStorage
    const saved = localStorage.getItem(this.TOOL_KEY);
    if (saved && ToolRegistry[saved]) {
      this.currentTool = saved;
    }
    this.bindNavigation();
    this.loadTool(this.currentTool);
    // Sync nav active button to restored tool
    document.querySelectorAll('.tool-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tool === this.currentTool);
    });
  },

  bindNavigation() {
    const buttons = document.querySelectorAll('.tool-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tool = btn.dataset.tool;
        this.switchTool(tool);
      });
    });
  },

  switchTool(tool) {
    this.currentTool = tool;
    localStorage.setItem(this.TOOL_KEY, tool);

    // Update nav buttons
    document.querySelectorAll('.tool-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tool === tool);
    });

    // Load tool content
    this.loadTool(tool);

    // On mobile, scroll nav button into view
    const activeBtn = document.querySelector(`.tool-btn[data-tool="${tool}"]`);
    if (activeBtn && window.innerWidth <= 768) {
      activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }
  },

  loadTool(tool) {
    const main = document.getElementById('mainContent');
    const fn = ToolRegistry[tool];
    if (fn) {
      main.innerHTML = fn();
      // Re-initialize tool-specific logic
      if (ToolInit[tool]) {
        ToolInit[tool]();
      }
    } else {
      main.innerHTML = `<div class="tool-panel active"><p>工具开发中...</p></div>`;
    }
  }
};

// Tool registry: each key maps to a function that returns HTML
const ToolRegistry = {};

// Tool init registry: each key maps to a function that sets up event listeners
const ToolInit = {};

// Helper to register a tool
function registerTool(name, renderFn, initFn) {
  ToolRegistry[name] = renderFn;
  if (initFn) ToolInit[name] = initFn;
}

// Helper: generate unit result grid
function renderUnitGrid(results, highlightUnit) {
  return `
    <div class="result-grid">
      ${results.map(r => `
        <div class="result-item${r.unit === highlightUnit ? ' highlight' : ''}">
          <div class="unit">${r.unit}</div>
          <div class="value">${r.value}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// Helper: format number for display
function fmtNum(n) {
  if (n === 0) return '0';
  if (Math.abs(n) < 1e-12 || Math.abs(n) >= 1e12) return n.toExponential(4);
  // Show up to 6 significant digits, trim trailing zeros
  const s = parseFloat(n.toPrecision(6)).toString();
  return s;
}

document.addEventListener('DOMContentLoaded', () => App.init());
