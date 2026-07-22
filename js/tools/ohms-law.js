/**
 * 欧姆定律计算器
 * V = I × R, P = V × I
 * 输入任意两个值，自动计算其余两个
 */
registerTool('ohms-law', () => {
  return `
    <div class="tool-panel active">
      <div class="tool-header">
        <h2>⚡ 欧姆定律计算器</h2>
        <p>输入任意两个参数（电压 / 电流 / 电阻 / 功率），自动计算其余值</p>
      </div>
      <div class="tool-body">

        <!-- Circuit Diagram -->
        <div class="ohms-diagram-wrap">
          <svg class="ohms-circuit" viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg">
            <!-- Top wire -->
            <line x1="40" y1="40" x2="180" y2="40" stroke-width="2.5" class="ohms-wire"/>
            <!-- Right wire -->
            <line x1="260" y1="40" x2="260" y2="130" stroke-width="2.5" class="ohms-wire"/>
            <!-- Bottom wire -->
            <line x1="40" y1="130" x2="260" y2="130" stroke-width="2.5" class="ohms-wire"/>
            <!-- Left wire (top half) -->
            <line x1="40" y1="40" x2="40" y2="60" stroke-width="2.5" class="ohms-wire"/>
            <!-- Left wire (bottom half) -->
            <line x1="40" y1="110" x2="40" y2="130" stroke-width="2.5" class="ohms-wire"/>

            <!-- Battery symbol (left) -->
            <line x1="40" y1="60" x2="55" y2="60" stroke-width="2.5" class="ohms-wire"/>
            <line x1="25" y1="68" x2="55" y2="68" stroke-width="2.5" class="ohms-wire"/>
            <line x1="32" y1="76" x2="55" y2="76" stroke-width="2.5" class="ohms-wire"/>
            <line x1="25" y1="84" x2="55" y2="84" stroke-width="2.5" class="ohms-wire"/>
            <line x1="40" y1="92" x2="55" y2="92" stroke-width="2.5" class="ohms-wire"/>
            <line x1="40" y1="60" x2="40" y2="92" stroke-width="2.5" class="ohms-wire"/>

            <!-- Battery polarity -->
            <text x="12" y="56" class="ohms-label" font-size="13" font-weight="700">+</text>
            <text x="12" y="96" class="ohms-label" font-size="13" font-weight="700">−</text>

            <!-- Resistor R (right side, vertical) -->
            <rect x="250" y="65" width="20" height="50" rx="3" fill="none" stroke-width="2.5" class="ohms-resistor"/>

            <!-- Current arrow (top wire) -->
            <line x1="160" y1="40" x2="185" y2="40" stroke-width="2" class="ohms-accent-wire"/>
            <polygon points="185,34 195,40 185,46" class="ohms-accent-fill"/>
            <text x="170" y="32" text-anchor="middle" class="ohms-accent-text" font-size="13" font-weight="700">I</text>

            <!-- Labels -->
            <text x="40" y="30" text-anchor="middle" class="ohms-label" font-size="14" font-weight="700">V</text>
            <text x="272" y="92" text-anchor="middle" class="ohms-label" font-size="14" font-weight="700">R</text>

            <!-- Voltage arrow (across battery) -->
            <line x1="72" y1="60" x2="72" y2="108" stroke-width="1.5" stroke-dasharray="4,3" class="ohms-dash"/>
            <polygon points="72,60 67,70 77,70" class="ohms-dash"/>
            <polygon points="72,108 67,98 77,98" class="ohms-dash"/>
          </svg>
        </div>

        <!-- Input Form -->
        <div class="ohms-form">
          <div class="ohms-input-group">
            <label class="form-label">电压 V</label>
            <div class="form-row">
              <input type="number" class="form-input" id="ohmsV" placeholder="例：5" step="any">
              <select class="form-select ohms-unit-select" id="ohmsVU">
                <option value="1">V</option>
                <option value="1e-3">mV</option>
                <option value="1e3">kV</option>
              </select>
            </div>
          </div>
          <div class="ohms-input-group">
            <label class="form-label">电流 I</label>
            <div class="form-row">
              <input type="number" class="form-input" id="ohmsI" placeholder="例：0.02" step="any">
              <select class="form-select ohms-unit-select" id="ohmsIU">
                <option value="1">A</option>
                <option value="1e-3" selected>mA</option>
                <option value="1e-6">µA</option>
              </select>
            </div>
          </div>
          <div class="ohms-input-group">
            <label class="form-label">电阻 R</label>
            <div class="form-row">
              <input type="number" class="form-input" id="ohmsR" placeholder="例：1000" step="any">
              <select class="form-select ohms-unit-select" id="ohmsRU">
                <option value="1">Ω</option>
                <option value="1e3" selected>kΩ</option>
                <option value="1e6">MΩ</option>
              </select>
            </div>
          </div>
          <div class="ohms-input-group">
            <label class="form-label">功率 P</label>
            <div class="form-row">
              <input type="number" class="form-input" id="ohmsP" placeholder="例：0.25" step="any">
              <select class="form-select ohms-unit-select" id="ohmsPU">
                <option value="1">W</option>
                <option value="1e-3">mW</option>
                <option value="1e3">kW</option>
              </select>
            </div>
          </div>
        </div>

        <button class="btn btn-secondary" id="ohmsClear" style="margin-bottom:12px;">✕ 清除</button>

        <!-- Results -->
        <div id="ohmsResult"></div>

        <!-- Formula reference -->
        <div class="ohms-formula-grid">
          <div class="ohms-formula-card">
            <div class="ohms-formula-card-title">V</div>
            <div class="ohms-formula-card-eq">I × R</div>
            <div class="ohms-formula-card-eq">P / I</div>
            <div class="ohms-formula-card-eq">√(P × R)</div>
          </div>
          <div class="ohms-formula-card">
            <div class="ohms-formula-card-title">I</div>
            <div class="ohms-formula-card-eq">V / R</div>
            <div class="ohms-formula-card-eq">P / V</div>
            <div class="ohms-formula-card-eq">√(P / R)</div>
          </div>
          <div class="ohms-formula-card">
            <div class="ohms-formula-card-title">R</div>
            <div class="ohms-formula-card-eq">V / I</div>
            <div class="ohms-formula-card-eq">V² / P</div>
            <div class="ohms-formula-card-eq">P / I²</div>
          </div>
          <div class="ohms-formula-card">
            <div class="ohms-formula-card-title">P</div>
            <div class="ohms-formula-card-eq">V × I</div>
            <div class="ohms-formula-card-eq">I² × R</div>
            <div class="ohms-formula-card-eq">V² / R</div>
          </div>
        </div>
      </div>
    </div>
  `;
}, () => {
  const fields = {
    V: { input: document.getElementById('ohmsV'), unit: document.getElementById('ohmsVU') },
    I: { input: document.getElementById('ohmsI'), unit: document.getElementById('ohmsIU') },
    R: { input: document.getElementById('ohmsR'), unit: document.getElementById('ohmsRU') },
    P: { input: document.getElementById('ohmsP'), unit: document.getElementById('ohmsPU') },
  };
  const resultDiv = document.getElementById('ohmsResult');

  function read(key) {
    const f = fields[key];
    const v = parseFloat(f.input.value);
    return isNaN(v) || v < 0 ? null : v * parseFloat(f.unit.value);
  }

  function calc() {
    const V = read('V'), I = read('I'), R = read('R'), P = read('P');
    const filled = [V, I, R, P].filter(v => v !== null).length;

    if (filled < 2) {
      resultDiv.innerHTML = '';
      return;
    }

    let rV = V, rI = I, rR = R, rP = P;
    let formulaUsed = '';

    try {
      if (rV !== null && rI !== null)        { rR = rV / rI;      rP = rV * rI;      formulaUsed = 'V, I → R=V/I, P=V×I'; }
      else if (rV !== null && rR !== null)   { rI = rV / rR;      rP = rV * rV / rR; formulaUsed = 'V, R → I=V/R, P=V²/R'; }
      else if (rV !== null && rP !== null)   { rI = rP / rV;      rR = rV * rV / rP; formulaUsed = 'V, P → I=P/V, R=V²/P'; }
      else if (rI !== null && rR !== null)   { rV = rI * rR;      rP = rI * rI * rR; formulaUsed = 'I, R → V=I×R, P=I²×R'; }
      else if (rI !== null && rP !== null)   { rV = rP / rI;      rR = rP / (rI * rI); formulaUsed = 'I, P → V=P/I, R=P/I²'; }
      else if (rR !== null && rP !== null)   { rV = Math.sqrt(rP * rR); rI = Math.sqrt(rP / rR); formulaUsed = 'R, P → V=√(P×R), I=√(P/R)'; }
    } catch (e) {
      resultDiv.innerHTML = `
        <div class="result-box" style="border-color: var(--red);">
          <span style="color: var(--red);">计算出错，请检查输入值是否合理</span>
        </div>`;
      return;
    }

    if (!isFinite(rV) || !isFinite(rI) || !isFinite(rR) || !isFinite(rP) || rV < 0 || rI < 0 || rR < 0 || rP < 0) {
      resultDiv.innerHTML = `
        <div class="result-box" style="border-color: var(--red);">
          <span style="color: var(--red);">计算出错，请检查输入值是否合理</span>
        </div>`;
      return;
    }

    const given = {
      V: V !== null,
      I: I !== null,
      R: R !== null,
      P: P !== null,
    };

    resultDiv.innerHTML = `
      <div class="result-grid">
        <div class="result-item${given.V ? '' : ' highlight'}">
          <div class="unit">电压</div>
          <div class="value">${fmtNum(rV)} V</div>
          <div class="ohms-result-sub">${given.V ? '已输入' : '已算出'}</div>
        </div>
        <div class="result-item${given.I ? '' : ' highlight'}">
          <div class="unit">电流</div>
          <div class="value">${fmtNum(rI)} A</div>
          <div class="ohms-result-sub">${given.I ? '已输入' : '已算出'}${rI < 1 ? ' = ' + fmtNum(rI * 1000) + ' mA' : ''}</div>
        </div>
        <div class="result-item${given.R ? '' : ' highlight'}">
          <div class="unit">电阻</div>
          <div class="value">${fmtNum(rR)} Ω</div>
          <div class="ohms-result-sub">${given.R ? '已输入' : '已算出'}</div>
        </div>
        <div class="result-item${given.P ? '' : ' highlight'}">
          <div class="unit">功率</div>
          <div class="value">${fmtNum(rP)} W</div>
          <div class="ohms-result-sub">${given.P ? '已输入' : '已算出'}${rP < 1 ? ' = ' + fmtNum(rP * 1000) + ' mW' : ''}</div>
        </div>
      </div>
      <div class="formula-box">
        计算方式：${formulaUsed}
      </div>
    `;
  }

  // Bind events
  Object.keys(fields).forEach(k => {
    fields[k].input.addEventListener('input', calc);
    fields[k].unit.addEventListener('change', calc);
  });

  document.getElementById('ohmsClear').addEventListener('click', () => {
    Object.values(fields).forEach(f => { f.input.value = ''; });
    resultDiv.innerHTML = '';
  });
});
