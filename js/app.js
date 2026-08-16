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
      this.attachResultCopy(main);
    } else {
      main.innerHTML = `<div class="tool-panel active"><p>工具开发中...</p></div>`;
    }
  },

  attachResultCopy(main) {
    const panel = main.querySelector('.tool-panel');
    const body = main.querySelector('.tool-body');
    const title = main.querySelector('.tool-header h2')?.textContent || '硬件工程师工具箱';
    if (!panel || !body) return;

    const actions = document.createElement('div');
    actions.className = 'result-actions';
    actions.innerHTML = '<button type="button" class="btn btn-secondary result-copy-btn">复制当前计算</button><span class="result-copy-status" aria-live="polite"></span>';
    panel.querySelector('.tool-header').after(actions);
    const status = actions.querySelector('.result-copy-status');

    actions.querySelector('.result-copy-btn').addEventListener('click', async () => {
      const text = `${title}\n\n${body.innerText}\n\n说明：结果仅供工程初算，请结合器件规格书与实测确认。`;
      try {
        if (navigator.clipboard?.writeText && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          const area = document.createElement('textarea');
          area.value = text;
          area.style.position = 'fixed';
          area.style.opacity = '0';
          document.body.appendChild(area);
          area.select();
          if (!document.execCommand('copy')) throw new Error('copy failed');
          area.remove();
        }
        status.textContent = '已复制';
      } catch (error) {
        status.textContent = '复制失败，请手动选择结果';
      }
    });

    const guide = document.createElement('div');
    guide.className = 'tool-guide';
    guide.innerHTML = '<span><b>1</b>填写已知条件</span><span><b>2</b>核对假设与结果</span><span><b>3</b>复制计算记录</span>';
    body.prepend(guide);
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
function fmtNum(n, significantDigits = 4) {
  if (n === 0) return '0';
  if (Math.abs(n) < 1e-12 || Math.abs(n) >= 1e12) return n.toExponential(significantDigits - 1);
  // Display precision is deliberately limited: it is not a measurement uncertainty.
  const s = parseFloat(n.toPrecision(significantDigits)).toString();
  return s;
}

document.addEventListener('DOMContentLoaded', () => App.init());
