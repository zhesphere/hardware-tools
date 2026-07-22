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
        <p>输入电压、电流、电阻、功率中的任意两个值，自动计算其余参数</p>
      </div>
      <div class="tool-body">
        <div class="ohms-triangle">
          <div class="triangle-grid">
            <div class="tri-v">V</div>
            <div class="tri-i" style="grid-column:1;">I</div>
            <div class="tri-r" style="grid-column:3;">R</div>
          </div>
        </div>
        <p style="text-align:center;color:var(--text-muted);font-size:0.85rem;margin-bottom:16px;">
          V = I × R &nbsp;|&nbsp; I = V / R &nbsp;|&nbsp; R = V / I
        </p>

        <div class="form-row" style="flex-wrap:wrap;">
          <div class="form-group" style="flex:1;min-width:180px;">
            <label class="form-label">电压 V</label>
            <div class="form-row">
              <input type="number" class="form-input" id="ohmsV" placeholder="电压" step="any">
              <select class="form-select" id="ohmsVU" style="width:80px;">
                <option value="1">V</option>
                <option value="1e-3">mV</option>
                <option value="1e3">kV</option>
              </select>
            </div>
          </div>
          <div class="form-group" style="flex:1;min-width:180px;">
            <label class="form-label">电流 I</label>
            <div class="form-row">
              <input type="number" class="form-input" id="ohmsI" placeholder="电流" step="any">
              <select class="form-select" id="ohmsIU" style="width:80px;">
                <option value="1">A</option>
                <option value="1e-3">mA</option>
                <option value="1e-6">µA</option>
              </select>
            </div>
          </div>
          <div class="form-group" style="flex:1;min-width:180px;">
            <label class="form-label">电阻 R</label>
            <div class="form-row">
              <input type="number" class="form-input" id="ohmsR" placeholder="电阻" step="any">
              <select class="form-select" id="ohmsRU" style="width:80px;">
                <option value="1">Ω</option>
                <option value="1e-3">mΩ</option>
                <option value="1e3">kΩ</option>
                <option value="1e6">MΩ</option>
              </select>
            </div>
          </div>
          <div class="form-group" style="flex:1;min-width:180px;">
            <label class="form-label">功率 P</label>
            <div class="form-row">
              <input type="number" class="form-input" id="ohmsP" placeholder="功率" step="any">
              <select class="form-select" id="ohmsPU" style="width:80px;">
                <option value="1">W</option>
                <option value="1e-3">mW</option>
                <option value="1e3">kW</option>
              </select>
            </div>
          </div>
        </div>

        <button class="btn btn-secondary" id="ohmsClear" style="margin-top:8px;">清除全部</button>

        <div id="ohmsResult" style="margin-top:16px;">
          <div class="result-box" style="border-color: var(--text-muted);">
            <span style="color: var(--text-muted);">请输入任意两个参数，自动计算其余</span>
          </div>
        </div>

        <div class="formula-box" style="margin-top:12px;">
          📐 V = I×R &nbsp;|&nbsp; P = V×I &nbsp;|&nbsp; P = I²×R &nbsp;|&nbsp; P = V²/R
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
    return isNaN(v) ? null : v * parseFloat(f.unit.value);
  }

  function countFilled() {
    return Object.values(fields).filter(f => f.input.value.trim() !== '').length;
  }

  function calc() {
    const V = read('V'), I = read('I'), R = read('R'), P = read('P');
    const filled = [V, I, R, P].filter(v => v !== null).length;

    if (filled < 2) {
      resultDiv.innerHTML = `
        <div class="result-box" style="border-color: var(--text-muted);">
          <span style="color: var(--text-muted);">请输入至少两个参数进行计算</span>
        </div>`;
      return;
    }

    // Solve for all four values
    let rV = V, rI = I, rR = R, rP = P;

    try {
      if (rV !== null && rI !== null)        { rR = rV / rI;      rP = rV * rI; }
      else if (rV !== null && rR !== null)   { rI = rV / rR;      rP = rV * rV / rR; }
      else if (rV !== null && rP !== null)   { rI = rP / rV;      rR = rV * rV / rP; }
      else if (rI !== null && rR !== null)   { rV = rI * rR;      rP = rI * rI * rR; }
      else if (rI !== null && rP !== null)   { rV = rP / rI;      rR = rP / (rI * rI); }
      else if (rR !== null && rP !== null)   { rV = Math.sqrt(rP * rR); rI = Math.sqrt(rP / rR); }
    } catch (e) {
      resultDiv.innerHTML = `
        <div class="result-box" style="border-color: var(--red);">
          <span style="color: var(--red);">计算出错，请检查输入值是否合理</span>
        </div>`;
      return;
    }

    resultDiv.innerHTML = `
      <div class="result-grid">
        <div class="result-item${V !== null ? '' : ' highlight'}">
          <div class="unit">电压 V</div>
          <div class="value">${fmtNum(rV)} V</div>
        </div>
        <div class="result-item${I !== null ? '' : ' highlight'}">
          <div class="unit">电流 I</div>
          <div class="value">${fmtNum(rI)} A</div>
        </div>
        <div class="result-item${R !== null ? '' : ' highlight'}">
          <div class="unit">电阻 R</div>
          <div class="value">${fmtNum(rR)} Ω</div>
        </div>
        <div class="result-item${P !== null ? '' : ' highlight'}">
          <div class="unit">功率 P</div>
          <div class="value">${fmtNum(rP)} W</div>
        </div>
      </div>`;
  }

  // Bind events
  Object.keys(fields).forEach(k => {
    fields[k].input.addEventListener('input', calc);
    fields[k].unit.addEventListener('change', calc);
  });

  document.getElementById('ohmsClear').addEventListener('click', () => {
    Object.values(fields).forEach(f => { f.input.value = ''; });
    resultDiv.innerHTML = `
      <div class="result-box" style="border-color: var(--text-muted);">
        <span style="color: var(--text-muted);">请输入任意两个参数，自动计算其余</span>
      </div>`;
  });

  calc();
});
