/**
 * 分压计算器
 * Vout = Vin × R2 / (R1 + R2)
 */
registerTool('voltage-divider', () => {
  return `
    <div class="tool-panel active">
      <div class="tool-header">
        <h2>🔻 分压计算器</h2>
        <p>计算电阻分压电路的输出电压 — 输入任意两个值自动计算</p>
      </div>
      <div class="tool-body">

        <!-- Circuit Diagram -->
        <div class="vd-diagram-wrap">
          <svg class="vd-circuit" viewBox="0 0 280 170" xmlns="http://www.w3.org/2000/svg">
            <!-- Resistor R1 shape -->
            <rect x="70" y="25" width="60" height="18" rx="3" fill="none" stroke-width="2" class="vd-resistor"/>
            <text x="100" y="62" text-anchor="middle" class="vd-label" font-size="12">R1</text>

            <!-- Resistor R2 shape -->
            <rect x="175" y="90" width="18" height="60" rx="3" fill="none" stroke-width="2" class="vd-resistor"/>
            <text x="210" y="125" text-anchor="start" class="vd-label" font-size="12">R2</text>

            <!-- Top wire: Vin node → R1 → junction -->
            <line x1="20" y1="34" x2="70" y2="34" stroke-width="2" class="vd-wire"/>
            <line x1="130" y1="34" x2="175" y2="34" stroke-width="2" class="vd-wire"/>

            <!-- Vertical wire: junction → R2 → GND -->
            <line x1="175" y1="34" x2="175" y2="90" stroke-width="2" class="vd-wire"/>
            <line x1="175" y1="150" x2="175" y2="160" stroke-width="2" class="vd-wire"/>

            <!-- Vout horizontal output line -->
            <line x1="175" y1="34" x2="230" y2="34" stroke-width="2" class="vd-wire"/>

            <!-- Junction dot -->
            <circle cx="175" cy="34" r="4" class="vd-junction"/>

            <!-- Ground symbol -->
            <line x1="160" y1="160" x2="190" y2="160" stroke-width="2" class="vd-wire"/>
            <line x1="164" y1="165" x2="186" y2="165" stroke-width="2" class="vd-wire"/>
            <line x1="169" y1="170" x2="181" y2="170" stroke-width="2" class="vd-wire"/>

            <!-- Vin label -->
            <text x="40" y="18" text-anchor="middle" class="vd-param" font-size="13" font-weight="600">Vin</text>
            <!-- Vout label -->
            <text x="210" y="24" text-anchor="middle" class="vd-accent-text" font-size="13" font-weight="600">Vout</text>
            <!-- GND label -->
            <text x="150" y="160" text-anchor="end" class="vd-label" font-size="11">GND</text>
          </svg>
        </div>

        <!-- Input Form -->
        <div class="vd-form">
          <div class="vd-input-group">
            <label class="form-label">输入电压 Vin</label>
            <div class="form-row">
              <input type="number" class="form-input" id="vdVin" value="5" step="any" placeholder="例：5">
              <span class="vd-unit-static">V</span>
            </div>
          </div>
          <div class="vd-input-group">
            <label class="form-label">电阻 R1</label>
            <div class="form-row">
              <input type="number" class="form-input" id="vdR1" value="10" step="any" placeholder="例：10">
              <select class="form-select vd-unit-select" id="vdR1Unit">
                <option value="1">Ω</option>
                <option value="1e3" selected>kΩ</option>
                <option value="1e6">MΩ</option>
              </select>
            </div>
          </div>
          <div class="vd-input-group">
            <label class="form-label">电阻 R2</label>
            <div class="form-row">
              <input type="number" class="form-input" id="vdR2" value="10" step="any" placeholder="例：10">
              <select class="form-select vd-unit-select" id="vdR2Unit">
                <option value="1">Ω</option>
                <option value="1e3" selected>kΩ</option>
                <option value="1e6">MΩ</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Result -->
        <div class="vd-results" id="vdResult"></div>

        <!-- Formula reference -->
        <div class="formula-box">
          Vout = Vin × <span class="vd-formula-highlight">R2</span> / (<span class="vd-formula-highlight">R1</span> + R2)
        </div>
      </div>
    </div>
  `;
}, () => {
  const vinInput = document.getElementById('vdVin');
  const r1Input = document.getElementById('vdR1');
  const r2Input = document.getElementById('vdR2');
  const r1Unit = document.getElementById('vdR1Unit');
  const r2Unit = document.getElementById('vdR2Unit');
  const resultDiv = document.getElementById('vdResult');

  function calculate() {
    const vin = parseFloat(vinInput.value);
    const r1_raw = parseFloat(r1Input.value);
    const r2_raw = parseFloat(r2Input.value);

    if (isNaN(vin) || isNaN(r1_raw) || isNaN(r2_raw) || r1_raw <= 0 || r2_raw <= 0) {
      resultDiv.innerHTML = '';
      return;
    }

    const R1 = r1_raw * parseFloat(r1Unit.value);
    const R2 = r2_raw * parseFloat(r2Unit.value);
    const totalR = R1 + R2;
    const Vout = vin * R2 / totalR;
    const I = vin / totalR;
    const ratio = R2 / totalR;
    const ratioPercent = ratio * 100;

    // Power calculations
    const pTotal = vin * I;
    const pR1 = I * I * R1;
    const pR2 = I * I * R2;

    resultDiv.innerHTML = `
      <div class="vd-result-primary">
        <div class="vd-vout-label">输出电压</div>
        <div class="vd-vout-value">${fmtNum(Vout)} <span class="vd-vout-unit">V</span></div>
        <div class="vd-vout-eq">= ${fmtNum(vin)}V × ${fmtNum(R2)}Ω / (${fmtNum(R1)}Ω + ${fmtNum(R2)}Ω)</div>
      </div>

      <div class="result-grid">
        <div class="result-item">
          <div class="unit">分压比</div>
          <div class="value">${fmtNum(ratioPercent)}%</div>
        </div>
        <div class="result-item">
          <div class="unit">回路电流</div>
          <div class="value">${fmtNum(I * 1000)} mA</div>
        </div>
        <div class="result-item">
          <div class="unit">总电阻</div>
          <div class="value">${fmtNum(totalR)} Ω</div>
        </div>
        <div class="result-item">
          <div class="unit">总功耗</div>
          <div class="value">${fmtNum(pTotal * 1000)} mW</div>
        </div>
      </div>

      <!-- Ratio bar -->
      <div class="vd-ratio-bar-wrap">
        <div class="vd-ratio-labels">
          <span>R1 ${fmtNum(100 - ratioPercent)}%</span>
          <span>R2 ${fmtNum(ratioPercent)}%</span>
        </div>
        <div class="vd-ratio-bar">
          <div class="vd-ratio-r2" style="width:${ratioPercent}%"></div>
        </div>
        <div class="vd-ratio-labels vd-ratio-labels-bottom">
          <span>${fmtNum(R1)} Ω</span>
          <span>${fmtNum(R2)} Ω</span>
        </div>
      </div>
    `;
  }

  vinInput.addEventListener('input', calculate);
  r1Input.addEventListener('input', calculate);
  r2Input.addEventListener('input', calculate);
  r1Unit.addEventListener('change', calculate);
  r2Unit.addEventListener('change', calculate);
  calculate();
});
