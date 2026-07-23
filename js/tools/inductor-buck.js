/**
 * Buck电路功率电感计算与选型
 * 基于 TI / MPS 等厂商的 Buck 转换器电感选型公式
 */
registerTool('inductor-buck', () => {
  return `
    <div class="tool-panel active">
      <div class="tool-header">
        <h2>🔌 Buck 电路功率电感计算与选型</h2>
        <p>计算 Buck 降压电路中功率电感的关键参数，辅助电感选型</p>
      </div>
      <div class="tool-body">

        <!-- Buck Circuit Diagram — Standard Topology -->
        <div class="buck-diagram-wrap">
          <svg class="buck-circuit" viewBox="0 0 460 150" xmlns="http://www.w3.org/2000/svg">

            <!-- ===== Input: Vin DC source, left side ===== -->
            <circle cx="20" cy="50" r="3" class="buck-junction"/>
            <text x="20" y="35" text-anchor="middle" class="buck-accent-text" font-size="12" font-weight="700">Vin</text>
            <!-- Vin positive wire → MOSFET -->
            <line x1="23" y1="50" x2="60" y2="50" class="buck-wire"/>

            <!-- MOSFET Q1: NMOS high-side switch, vertical channel -->
            <line x1="60" y1="30" x2="60" y2="70" class="buck-wire"/>
            <!-- Drain horizontal bar -->
            <line x1="52" y1="34" x2="68" y2="34" class="buck-wire"/>
            <!-- Source horizontal bar -->
            <line x1="52" y1="66" x2="68" y2="66" class="buck-wire"/>
            <!-- Gate: horizontal line left, then L-shape down to channel -->
            <line x1="57" y1="50" x2="45" y2="50" class="buck-wire"/>
            <line x1="45" y1="50" x2="45" y2="62" class="buck-wire"/>
            <line x1="41" y1="58" x2="49" y2="58" class="buck-wire"/>
            <line x1="49" y1="55" x2="49" y2="62" class="buck-wire"/>
            <text x="38" y="78" text-anchor="middle" class="buck-label" font-size="9">Q1</text>

            <!-- Wire from MOSFET source to SW node -->
            <line x1="68" y1="50" x2="95" y2="50" class="buck-wire"/>

            <!-- SW node: junction dot + label above -->
            <circle cx="95" cy="50" r="4" class="buck-junction"/>
            <text x="95" y="38" text-anchor="middle" class="buck-label" font-size="11" font-weight="600">SW</text>

            <!-- Diode D1: cathode to SW (top), anode to GND (bottom) -->
            <line x1="95" y1="54" x2="95" y2="78" class="buck-wire"/>
            <!-- Triangle body -->
            <polygon points="95,78 84,86 106,86" class="buck-wire"/>
            <!-- Cathode bar -->
            <line x1="84" y1="86" x2="106" y2="86" class="buck-wire"/>
            <line x1="84" y1="90" x2="106" y2="90" class="buck-wire"/>
            <!-- Anode wire -->
            <line x1="95" y1="90" x2="95" y2="105" class="buck-wire"/>
            <text x="112" y="75" text-anchor="start" class="buck-label" font-size="10">D1</text>

            <!-- Inductor L1: SW → Vout, coil + label above -->
            <line x1="99" y1="50" x2="135" y2="50" class="buck-wire"/>
            <path d="M135,50 Q146,28 157,50 Q168,72 179,50 Q190,28 201,50 Q212,72 223,50" class="buck-wire"/>
            <text x="179" y="35" text-anchor="middle" class="buck-accent-text" font-size="12" font-weight="700">L1</text>
            <line x1="223" y1="50" x2="260" y2="50" class="buck-wire"/>

            <!-- Vout junction + label -->
            <circle cx="275" cy="50" r="4" class="buck-junction"/>
            <text x="275" y="33" text-anchor="middle" class="buck-accent-text" font-size="12" font-weight="700">Vout</text>
            <line x1="279" y1="50" x2="330" y2="50" class="buck-wire"/>

            <!-- Output capacitor Cout: Vout → GND -->
            <line x1="275" y1="54" x2="275" y2="75" class="buck-wire"/>
            <line x1="263" y1="75" x2="287" y2="75" class="buck-wire"/>
            <line x1="263" y1="82" x2="287" y2="82" class="buck-wire"/>
            <line x1="275" y1="82" x2="275" y2="105" class="buck-wire"/>
            <text x="293" y="80" text-anchor="start" class="buck-label" font-size="9">Cout</text>

            <!-- Load resistor RL: Vout → GND -->
            <line x1="330" y1="50" x2="360" y2="50" class="buck-wire"/>
            <rect x="360" y="38" width="14" height="24" rx="2" class="buck-wire"/>
            <line x1="374" y1="50" x2="390" y2="50" class="buck-wire"/>
            <line x1="390" y1="50" x2="390" y2="105" class="buck-wire"/>
            <text x="367" y="78" text-anchor="middle" class="buck-label" font-size="8">RL</text>

            <!-- ===== GND bus ===== -->
            <line x1="30" y1="105" x2="405" y2="105" class="buck-wire"/>

            <!-- Vin negative terminal → GND (dashed, indicating DC source) -->
            <line x1="20" y1="92" x2="20" y2="105" class="buck-wire" stroke-dasharray="4 3"/>
            <circle cx="20" cy="88" r="2" class="buck-switch-fill"/>

            <!-- GND symbols -->
            <line x1="86" y1="105" x2="104" y2="105" class="buck-wire"/>
            <line x1="90" y1="111" x2="100" y2="111" class="buck-wire"/>
            <line x1="93" y1="117" x2="97" y2="117" class="buck-wire"/>

            <line x1="267" y1="105" x2="283" y2="105" class="buck-wire"/>
            <line x1="270" y1="111" x2="280" y2="111" class="buck-wire"/>
            <line x1="273" y1="117" x2="277" y2="117" class="buck-wire"/>

            <line x1="382" y1="105" x2="398" y2="105" class="buck-wire"/>
            <line x1="385" y1="111" x2="395" y2="111" class="buck-wire"/>
            <line x1="388" y1="117" x2="392" y2="117" class="buck-wire"/>

            <text x="415" y="109" text-anchor="start" class="buck-label" font-size="10">GND</text>

            <!-- PWM drive label near gate -->
            <text x="10" y="63" text-anchor="start" class="buck-label" font-size="8">DRV</text>
          </svg>
        </div>

        <!-- Step 1: Input Parameters -->
        <div class="buck-section">
          <div class="buck-section-header">📐 步骤一：电感参数理论计算</div>
          <div class="buck-form">
            <div class="form-group">
              <label class="form-label">输入电压 Vin(max) <span class="buck-hint">最大输入电压</span></label>
              <div class="form-row">
                <input type="number" class="form-input" id="buckVin" value="16" step="any" placeholder="例：16">
                <span class="buck-unit-static">V</span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">输出电压 Vout</label>
              <div class="form-row">
                <input type="number" class="form-input" id="buckVout" value="5" step="any" placeholder="例：5">
                <span class="buck-unit-static">V</span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">输出电流 Io(max) <span class="buck-hint">最大平均输出电流</span></label>
              <div class="form-row">
                <input type="number" class="form-input" id="buckIo" value="0.6" step="any" placeholder="例：0.6">
                <span class="buck-unit-static">A</span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">纹波系数 KIND <span class="buck-hint">一般 0.4~0.6，不超过 1.0</span></label>
              <div class="form-row">
                <input type="number" class="form-input" id="buckKind" value="0.4" step="0.05" min="0.1" max="1.0" placeholder="0.4">
                <span class="buck-unit-static buck-unit-static--dim"></span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">工作频率 fsw</label>
              <div class="form-row">
                <input type="number" class="form-input" id="buckFsw" value="770" step="any" placeholder="例：770">
                <select class="form-select buck-unit-select" id="buckFswUnit">
                  <option value="1e3">Hz</option>
                  <option value="1e6" selected>KHz</option>
                  <option value="1e9">MHz</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Step 1 Results -->
          <div class="buck-results" id="buckStep1Results"></div>

          <!-- Formula reference -->
          <div class="formula-box">
            <span>L<sub>min</sub> = (V<sub>in</sub> − V<sub>out</sub>) × V<sub>out</sub> / (V<sub>in</sub> × f<sub>sw</sub> × KIND × I<sub>o</sub>)</span>
            <span class="buck-formula-sep">|</span>
            <span>I<sub>ripple</sub> = KIND × I<sub>o</sub></span>
            <span class="buck-formula-sep">|</span>
            <span>I<sub>peak</sub> = I<sub>o</sub> + I<sub>ripple</sub> / 2</span>
          </div>
        </div>

        <!-- Step 2: Actual Inductor Selection -->
        <div class="buck-section">
          <div class="buck-section-header">🎯 步骤二：实际电感选型参数</div>
          <div class="buck-select-wrap">
            <div class="form-group buck-select-group">
              <label class="form-label">选取电感量 L</label>
              <div class="form-row">
                <select class="form-select buck-l-select" id="buckLSelect"></select>
                <span class="buck-unit-static">μH</span>
                <input type="number" class="form-input buck-l-custom" id="buckLCustom" value="" step="any" placeholder="自定义值">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">降额系数 <span class="buck-hint">建议 ≥ 0.7，即 70%</span></label>
              <div class="form-row">
                <input type="number" class="form-input" id="buckDerating" value="0.7" step="0.05" min="0.5" max="1.0" placeholder="0.7">
                <span class="buck-unit-static buck-unit-static--dim"></span>
              </div>
            </div>
          </div>

          <!-- Step 2 Results -->
          <div class="buck-results" id="buckStep2Results"></div>
        </div>

        <!-- Step 3: Reference -->
        <div class="buck-section buck-section--tip">
          <div class="buck-section-header">💡 步骤三：选型参考</div>
          <p class="buck-tip-text">
            根据以上计算出的 <strong>电感量 L</strong>、<strong>温升电流 Irms</strong> 和 <strong>饱和电流 Isat</strong>，
            从器件优选库或电感厂商产品目录（如 TDK、Murata、Coilcraft、Würth、Sumida 等）中选择满足以下条件的电感：
          </p>
          <ul class="buck-checklist">
            <li>✅ 标称电感量 ≥ 计算电感量 L</li>
            <li>✅ 温升电流 I<sub>rms</sub> ≥ 需求 I<sub>rms(min)</sub></li>
            <li>✅ 饱和电流 I<sub>sat</sub> ≥ 需求 I<sub>sat(min)</sub></li>
            <li>✅ DCR 越小越好（降低导通损耗，提升效率）</li>
          </ul>
        </div>
      </div>
    </div>
  `;
}, () => {
  // Standard inductor values (E12/E24 style, in uH)
  const STD_VALUES = [
    1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2,
    10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82,
    100, 120, 150, 180, 220, 270, 330, 390, 470, 560, 680, 820,
    1000
  ];

  const vinInput = document.getElementById('buckVin');
  const voutInput = document.getElementById('buckVout');
  const ioInput = document.getElementById('buckIo');
  const kindInput = document.getElementById('buckKind');
  const fswInput = document.getElementById('buckFsw');
  const fswUnit = document.getElementById('buckFswUnit');
  const step1Div = document.getElementById('buckStep1Results');
  const step2Div = document.getElementById('buckStep2Results');
  const lSelect = document.getElementById('buckLSelect');
  const lCustom = document.getElementById('buckLCustom');
  const deratingInput = document.getElementById('buckDerating');

  function getParams() {
    const vin = parseFloat(vinInput.value);
    const vout = parseFloat(voutInput.value);
    const io = parseFloat(ioInput.value);
    const kind = parseFloat(kindInput.value);
    const fswRaw = parseFloat(fswInput.value);
    const fswMul = parseFloat(fswUnit.value);
    const derating = parseFloat(deratingInput.value) || 0.7;

    if (isNaN(vin) || isNaN(vout) || isNaN(io) || isNaN(kind) || isNaN(fswRaw) || vin <= 0 || vout <= 0 || io <= 0 || kind <= 0 || fswRaw <= 0) {
      return null;
    }

    const fswHz = fswRaw * fswMul; // Convert to Hz
    return { vin, vout, io, kind, fswRaw, fswMul, fswHz, derating };
  }

  function buildLSelect(highlightL) {
    const options = [];
    let insertedCustom = false;

    for (const v of STD_VALUES) {
      if (!insertedCustom && highlightL && highlightL > 0 && v >= highlightL && v !== highlightL) {
        // Insert custom value before next larger standard value
        if (!STD_VALUES.includes(highlightL) || v === highlightL) {
          // Only insert custom if the exact value isn't already a standard value
        }
      }
      options.push(v);
    }

    // Build select including a highlighted option
    let html = '';
    let hasSelected = false;

    // Add custom value as first option if it doesn't match a standard value
    if (highlightL && highlightL > 0 && !STD_VALUES.includes(highlightL)) {
      html += `<option value="${highlightL}">🔧 ${fmtNum(highlightL)} μH（计算值）</option>`;
      hasSelected = true;
    }

    for (const v of STD_VALUES) {
      const isSuggested = highlightL && v >= highlightL && !hasSelected;
      if (isSuggested) hasSelected = true;
      const sel = isSuggested ? ' selected' : '';
      html += `<option value="${v}"${sel}>${v} μH${isSuggested ? ' ← 推荐' : ''}</option>`;
    }

    lSelect.innerHTML = html;

    // Set custom input placeholder
    if (highlightL && highlightL > 0) {
      lCustom.placeholder = `自定义（推荐 ≥ ${fmtNum(highlightL)} μH）`;
    }
  }

  function calculate() {
    const p = getParams();
    if (!p) {
      step1Div.innerHTML = '';
      step2Div.innerHTML = '';
      lSelect.innerHTML = '';
      lCustom.placeholder = '自定义值';
      return;
    }

    const { vin, vout, io, kind, fswHz, derating } = p;

    // Step 1 calculations
    const lmin = (vin - vout) * vout * 1e6 / (vin * fswHz * kind * io); // uH
    const iripple = kind * io; // A
    const ipeak = io + iripple / 2; // A
    const duty = (vout / vin) * 100; // Duty cycle %

    // Format values for display
    const lminDisplay = fmtNum(lmin);
    const irippleDisplay = fmtNum(iripple);
    const ipeakDisplay = fmtNum(ipeak);

    step1Div.innerHTML = `
      <div class="buck-result-card buck-result-card--primary">
        <div class="buck-result-row">
          <div class="buck-result-main">
            <div class="buck-result-label">最小电感量 L<sub>min</sub></div>
            <div class="buck-result-value">${lminDisplay} <span class="buck-result-unit">μH</span></div>
          </div>
        </div>
        <div class="buck-result-meta">
          L<sub>min</sub> = (${fmtNum(vin)} − ${fmtNum(vout)}) × ${fmtNum(vout)} × 10<sup>6</sup> / (${fmtNum(vin)} × ${fmtNum(fswHz / 1e3)}K × ${fmtNum(kind)} × ${fmtNum(io)}) = <strong>${lminDisplay} μH</strong>
        </div>
      </div>

      <div class="result-grid">
        <div class="result-item highlight">
          <div class="unit">纹波电流 I<sub>ripple</sub></div>
          <div class="value">${irippleDisplay} A</div>
        </div>
        <div class="result-item">
          <div class="unit">峰值电流 I<sub>peak</sub></div>
          <div class="value">${ipeakDisplay} A</div>
        </div>
        <div class="result-item">
          <div class="unit">占空比 D</div>
          <div class="value">${fmtNum(duty)}%</div>
        </div>
        <div class="result-item">
          <div class="unit">纹波系数 KIND</div>
          <div class="value">${fmtNum(kind)}</div>
        </div>
      </div>
    `;

    // Build inductor selector
    buildLSelect(lmin);

    // Step 2 calculations
    calculateStep2(p, lmin, iripple, ipeak);
  }

  function calculateStep2(p, lmin, irippleTheoretical, ipeakTheoretical) {
    const { vin, vout, io, fswHz, derating } = p;

    // Get selected inductance
    let selectedL = parseFloat(lSelect.value);
    const customVal = parseFloat(lCustom.value);
    if (!isNaN(customVal) && customVal > 0) {
      selectedL = customVal;
    }

    if (isNaN(selectedL) || selectedL <= 0) {
      step2Div.innerHTML = '<div class="buck-warn">请选择或输入有效的电感值</div>';
      return;
    }

    // Check if selected L >= Lmin
    const sufficient = selectedL >= lmin;

    // Actual ripple with selected inductor
    const actualIripple = (vin - vout) * vout * 1e6 / (vin * fswHz * selectedL); // A
    const actualIpeak = io + actualIripple / 2; // A

    // RMS current
    const irms = Math.sqrt(io * io + actualIripple * actualIripple / 12);
    const irmsMin = irms / derating; // With derating

    // Saturation current requirement (using theoretical Ipeak with derating)
    const isatMin = ipeakTheoretical / derating;

    // Duty cycle
    const duty = (vout / vin) * 100;

    const deratingPercent = derating * 100;

    step2Div.innerHTML = `
      <!-- Warning if insufficient -->
      ${!sufficient ? `<div class="buck-warn">⚠️ 选用的电感量 ${fmtNum(selectedL)} μH 小于计算的最小值 ${fmtNum(lmin)} μH，纹波将偏大</div>` : ''}

      <div class="buck-result-card buck-result-card--primary">
        <div class="buck-result-row">
          <div class="buck-result-main">
            <div class="buck-result-label">选定电感量</div>
            <div class="buck-result-value">${fmtNum(selectedL)} <span class="buck-result-unit">μH</span></div>
          </div>
          <div class="buck-result-badge ${sufficient ? 'buck-badge--ok' : 'buck-badge--warn'}">
            ${sufficient ? '✅ 满足要求' : '⚠️ 低于最小值'}
          </div>
        </div>
      </div>

      <div class="result-grid">
        <div class="result-item${sufficient ? '' : ' highlight'}">
          <div class="unit">实际 I<sub>ripple</sub></div>
          <div class="value">${fmtNum(actualIripple)} A</div>
          <div class="buck-sub">理论值: ${fmtNum(irippleTheoretical)} A</div>
        </div>
        <div class="result-item">
          <div class="unit">实际 I<sub>peak</sub></div>
          <div class="value">${fmtNum(actualIpeak)} A</div>
          <div class="buck-sub">理论值: ${fmtNum(ipeakTheoretical)} A</div>
        </div>
        <div class="result-item highlight">
          <div class="unit">需求 I<sub>rms(min)</sub> (${fmtNum(deratingPercent)}% 降额)</div>
          <div class="value">${fmtNum(irmsMin)} A</div>
        </div>
        <div class="result-item highlight">
          <div class="unit">需求 I<sub>sat(min)</sub> (${fmtNum(deratingPercent)}% 降额)</div>
          <div class="value">${fmtNum(isatMin)} A</div>
        </div>
      </div>

      <div class="result-grid" style="margin-top: 10px;">
        <div class="result-item">
          <div class="unit">RMS 电流（未降额）</div>
          <div class="value">${fmtNum(irms)} A</div>
        </div>
        <div class="result-item">
          <div class="unit">占空比 D</div>
          <div class="value">${fmtNum(duty)}%</div>
        </div>
        <div class="result-item">
          <div class="unit">降额系数</div>
          <div class="value">${fmtNum(deratingPercent)}%</div>
        </div>
        <div class="result-item">
          <div class="unit">开关频率</div>
          <div class="value">${fmtNum(fswHz / 1e3)} KHz</div>
        </div>
      </div>
    `;
  }

  // Event listeners
  [vinInput, voutInput, ioInput, kindInput, fswInput, fswUnit].forEach(el => {
    el.addEventListener('input', calculate);
  });
  fswUnit.addEventListener('change', calculate);
  lSelect.addEventListener('change', () => {
    lCustom.value = '';
    const p = getParams();
    if (p) {
      const lmin = (p.vin - p.vout) * p.vout * 1e6 / (p.vin * p.fswHz * p.kind * p.io);
      const iripple = p.kind * p.io;
      const ipeak = p.io + iripple / 2;
      calculateStep2(p, lmin, iripple, ipeak);
    }
  });
  lCustom.addEventListener('input', () => {
    const p = getParams();
    if (p) {
      const lmin = (p.vin - p.vout) * p.vout * 1e6 / (p.vin * p.fswHz * p.kind * p.io);
      const iripple = p.kind * p.io;
      const ipeak = p.io + iripple / 2;
      calculateStep2(p, lmin, iripple, ipeak);
    }
  });
  deratingInput.addEventListener('input', () => {
    const p = getParams();
    if (p) {
      const lmin = (p.vin - p.vout) * p.vout * 1e6 / (p.vin * p.fswHz * p.kind * p.io);
      const iripple = p.kind * p.io;
      const ipeak = p.io + iripple / 2;
      calculateStep2(p, lmin, iripple, ipeak);
    }
  });

  // Initial calculation
  calculate();
});
