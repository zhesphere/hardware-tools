/**
 * 欧姆定律计算器
 * V = I × R, P = V × I, P = I² × R, P = V² / R
 * 输入任意两个值，计算其余两个
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
            <label class="form-label">电压 V（伏特）</label>
            <div class="form-row">
              <input type="number" class="form-input ohms-input" id="ohmsVoltage" placeholder="电压" step="any">
              <select class="form-select ohms-unit" id="ohmsVoltageUnit" style="width:90px;">
                <option value="1">V</option>
                <option value="1e-3">mV</option>
                <option value="1e3">kV</option>
              </select>
            </div>
          </div>
          <div class="form-group" style="flex:1;min-width:180px;">
            <label class="form-label">电流 I（安培）</label>
            <div class="form-row">
              <input type="number" class="form-input ohms-input" id="ohmsCurrent" placeholder="电流" step="any">
              <select class="form-select ohms-unit" id="ohmsCurrentUnit" style="width:90px;">
                <option value="1">A</option>
                <option value="1e-3">mA</option>
                <option value="1e-6">µA</option>
              </select>
            </div>
          </div>
          <div class="form-group" style="flex:1;min-width:180px;">
            <label class="form-label">电阻 R（欧姆）</label>
            <div class="form-row">
              <input type="number" class="form-input ohms-input" id="ohmsResistance" placeholder="电阻" step="any">
              <select class="form-select ohms-unit" id="ohmsResistanceUnit" style="width:90px;">
                <option value="1">Ω</option>
                <option value="1e-3">mΩ</option>
                <option value="1e3">kΩ</option>
                <option value="1e6">MΩ</option>
              </select>
            </div>
          </div>
          <div class="form-group" style="flex:1;min-width:180px;">
            <label class="form-label">功率 P（瓦特）</label>
            <div class="form-row">
              <input type="number" class="form-input ohms-input" id="ohmsPower" placeholder="功率" step="any">
              <select class="form-select ohms-unit" id="ohmsPowerUnit" style="width:90px;">
                <option value="1">W</option>
                <option value="1e-3">mW</option>
                <option value="1e3">kW</option>
              </select>
            </div>
          </div>
        </div>

        <button class="btn btn-secondary" id="ohmsClear" style="margin-top:8px;">清除全部</button>

        <div id="ohmsResult" style="margin-top:16px;"></div>

        <div class="formula-box" style="margin-top:12px;">
          📐 公式：V = I × R &nbsp;|&nbsp; P = V × I &nbsp;|&nbsp; P = I² × R &nbsp;|&nbsp; P = V² / R
        </div>
      </div>
    </div>
  `;
}, () => {
  const inputs = {
    voltage: document.getElementById('ohmsVoltage'),
    current: document.getElementById('ohmsCurrent'),
    resistance: document.getElementById('ohmsResistance'),
    power: document.getElementById('ohmsPower'),
  };
  const unitSelects = {
    voltage: document.getElementById('ohmsVoltageUnit'),
    current: document.getElementById('ohmsCurrentUnit'),
    resistance: document.getElementById('ohmsResistanceUnit'),
    power: document.getElementById('ohmsPowerUnit'),
  };
  const resultDiv = document.getElementById('ohmsResult');
  const clearBtn = document.getElementById('ohmsClear');

  let lastEdited = null;

  function getValues() {
    const v = parseFloat(inputs.voltage.value);
    const i = parseFloat(inputs.current.value);
    const r = parseFloat(inputs.resistance.value);
    const p = parseFloat(inputs.power.value);

    const vScale = parseFloat(unitSelects.voltage.value);
    const iScale = parseFloat(unitSelects.current.value);
    const rScale = parseFloat(unitSelects.resistance.value);
    const pScale = parseFloat(unitSelects.power.value);

    return {
      V: isNaN(v) ? null : v * vScale,
      I: isNaN(i) ? null : i * iScale,
      R: isNaN(r) ? null : r * rScale,
      P: isNaN(p) ? null : p * pScale,
    };
  }

  function countInputs() {
    let count = 0;
    Object.values(inputs).forEach(el => { if (el.value.trim() !== '') count++; });
    return count;
  }

  function calculate() {
    if (calculating) return;
    const vals = getValues();
    const filled = countInputs();

    if (filled < 2) {
      resultDiv.innerHTML = `
        <div class="result-box" style="border-color: var(--text-muted);">
          <span style="color: var(--text-muted);">请输入至少两个参数进行计算</span>
        </div>
      `;
      return;
    }

    let V = vals.V, I = vals.I, R = vals.R, P = vals.P;

    // Solve using whichever two are known
    try {
      if (V !== null && I !== null) {
        R = V / I;
        P = V * I;
      } else if (V !== null && R !== null) {
        I = V / R;
        P = V * V / R;
      } else if (V !== null && P !== null) {
        I = P / V;
        R = V * V / P;
      } else if (I !== null && R !== null) {
        V = I * R;
        P = I * I * R;
      } else if (I !== null && P !== null) {
        V = P / I;
        R = P / (I * I);
      } else if (R !== null && P !== null) {
        V = Math.sqrt(P * R);
        I = Math.sqrt(P / R);
      }
    } catch (e) {
      resultDiv.innerHTML = `
        <div class="result-box" style="border-color: var(--red);">
          <span style="color: var(--red);">计算出错，请检查输入值</span>
        </div>
      `;
      return;
    }

    // Update non-edited fields (prevent recursive triggers)
    calculating = true;
    if (lastEdited !== 'voltage' && V !== null) inputs.voltage.value = fmtNum(V);
    if (lastEdited !== 'current' && I !== null) inputs.current.value = fmtNum(I);
    if (lastEdited !== 'resistance' && R !== null) inputs.resistance.value = fmtNum(R);
    if (lastEdited !== 'power' && P !== null) inputs.power.value = fmtNum(P);
    calculating = false;

    resultDiv.innerHTML = `
      <div class="result-grid">
        <div class="result-item highlight">
          <div class="unit">电压 V</div>
          <div class="value">${fmtNum(V)} V</div>
        </div>
        <div class="result-item highlight">
          <div class="unit">电流 I</div>
          <div class="value">${fmtNum(I)} A</div>
        </div>
        <div class="result-item highlight">
          <div class="unit">电阻 R</div>
          <div class="value">${fmtNum(R)} Ω</div>
        </div>
        <div class="result-item highlight">
          <div class="unit">功率 P</div>
          <div class="value">${fmtNum(P)} W</div>
        </div>
      </div>
    `;
  }

  // Track which field was last edited
  Object.keys(inputs).forEach(key => {
    inputs[key].addEventListener('focus', () => { lastEdited = key; });
    inputs[key].addEventListener('input', calculate);
    unitSelects[key].addEventListener('change', calculate);
  });

  clearBtn.addEventListener('click', () => {
    Object.values(inputs).forEach(el => { el.value = ''; });
    resultDiv.innerHTML = '';
  });

  calculate();
});
