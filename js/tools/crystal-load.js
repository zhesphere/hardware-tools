/**
 * 晶体负载电容计算器
 * 基于 Pierce 振荡器电路，计算晶振外部负载电容
 *
 * 公式:
 *   CL  = (C1 × C2) / (C1 + C2) + Cstray
 *   C1 = C2 = 2 × (CL - Cstray)   (对称设计)
 */
registerTool('crystal-load', () => {
  return `
    <div class="tool-panel active">
      <div class="tool-header">
        <h2>💎 晶体负载电容计算</h2>
        <p>计算晶振 Pierce 振荡器的外部负载电容 C1 / C2</p>
      </div>
      <div class="tool-body">

        <!-- Circuit Diagram: reference image -->
        <div class="crystal-diagram-wrap">
          <img src="负载电容计算.jpg" alt="晶体负载电容计算参考图" class="crystal-ref-img">
        </div>

        <!-- Mode Switch -->
        <div class="crystal-mode-tabs">
          <button class="crystal-mode-btn active" data-mode="calc-caps">🧮 根据 CL 计算 C1 / C2</button>
          <button class="crystal-mode-btn" data-mode="calc-cl">🔍 根据 C1 / C2 计算 CL</button>
        </div>

        <!-- Mode 1: Calculate C1/C2 from CL -->
        <div class="crystal-panel active" id="crystalPanelCaps">
          <div class="crystal-form">
            <div class="form-group">
              <label class="form-label">晶振负载电容 CL <span class="crystal-hint">晶振规格书参数</span></label>
              <div class="form-row">
                <input type="number" class="form-input" id="crysCL" value="12.5" step="any" placeholder="例：12.5">
                <span class="crystal-unit-static">pF</span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">杂散电容 Cstray <span class="crystal-hint">PCB走线+IC引脚，一般 3~5pF</span></label>
              <div class="form-row">
                <input type="number" class="form-input" id="crysCstray" value="4" step="any" placeholder="例：4">
                <span class="crystal-unit-static">pF</span>
              </div>
            </div>
          </div>

          <!-- Result for mode 1 -->
          <div class="crystal-result" id="crystalResultCaps"></div>

          <!-- Formula -->
          <div class="formula-box">
            对称设计: C1 = C2 = 2 × (CL − Cstray)
            <span class="buck-formula-sep">|</span>
            CL = (C1 × C2) / (C1 + C2) + Cstray
          </div>
        </div>

        <!-- Mode 2: Calculate CL from C1/C2 -->
        <div class="crystal-panel" id="crystalPanelCL">
          <div class="crystal-form">
            <div class="form-group">
              <label class="form-label">电容 C1</label>
              <div class="form-row">
                <input type="number" class="form-input" id="crysC1" value="18" step="any" placeholder="例：18">
                <span class="crystal-unit-static">pF</span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">电容 C2</label>
              <div class="form-row">
                <input type="number" class="form-input" id="crysC2" value="18" step="any" placeholder="例：18">
                <span class="crystal-unit-static">pF</span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">杂散电容 Cstray <span class="crystal-hint">PCB走线+IC引脚，一般 3~5pF</span></label>
              <div class="form-row">
                <input type="number" class="form-input" id="crysCstray2" value="4" step="any" placeholder="例：4">
                <span class="crystal-unit-static">pF</span>
              </div>
            </div>
          </div>

          <!-- Result for mode 2 -->
          <div class="crystal-result" id="crystalResultCL"></div>

          <!-- Formula -->
          <div class="formula-box">
            CL = (C1 × C2) / (C1 + C2) + Cstray
          </div>
        </div>

        <!-- Reference: common CL values -->
        <div class="crystal-section--tip">
          <div class="crystal-section-header">💡 常见晶振负载电容参考值</div>
          <div class="result-grid" style="margin-top:8px">
            <div class="result-item">
              <div class="unit">低频晶振 32.768 KHz</div>
              <div class="value">6 ~ 12.5 pF</div>
            </div>
            <div class="result-item">
              <div class="unit">常用 MHz 晶振</div>
              <div class="value">12 ~ 20 pF</div>
            </div>
            <div class="result-item">
              <div class="unit">PCB 杂散电容</div>
              <div class="value">3 ~ 5 pF</div>
            </div>
            <div class="result-item">
              <div class="unit">IC 输入引脚电容</div>
              <div class="value">1 ~ 3 pF</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}, () => {
  // Mode switching
  const modeButtons = document.querySelectorAll('.crystal-mode-btn');
  const panelCaps = document.getElementById('crystalPanelCaps');
  const panelCL = document.getElementById('crystalPanelCL');
  let currentMode = 'calc-caps';

  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      currentMode = btn.dataset.mode;
      modeButtons.forEach(b => b.classList.toggle('active', b.dataset.mode === currentMode));
      panelCaps.classList.toggle('active', currentMode === 'calc-caps');
      panelCL.classList.toggle('active', currentMode === 'calc-cl');
      if (currentMode === 'calc-caps') calculateCaps();
      else calculateCL();
    });
  });

  // --- Mode 1: Calculate C1/C2 from CL ---
  const clInput = document.getElementById('crysCL');
  const cstrayInput = document.getElementById('crysCstray');
  const resultCaps = document.getElementById('crystalResultCaps');

  function calculateCaps() {
    const cl = parseFloat(clInput.value);
    const cstray = parseFloat(cstrayInput.value);

    if (isNaN(cl) || isNaN(cstray) || cl <= 0 || cstray < 0) {
      resultCaps.innerHTML = '';
      return;
    }

    if (cstray >= cl) {
      resultCaps.innerHTML = `
        <div class="buck-warn">⚠️ Cstray (${fmtNum(cstray)} pF) 必须小于 CL (${fmtNum(cl)} pF)，请检查输入</div>
      `;
      return;
    }

    const cEach = 2 * (cl - cstray);  // C1 = C2 = 2*(CL-Cstray)
    const clCheck = (cEach * cEach) / (cEach + cEach) + cstray;  // verify

    // Common standard capacitor values for reference
    const stdValues = [5, 6, 8, 10, 12, 15, 18, 20, 22, 27, 30, 33, 39, 47];
    let nearest = stdValues[0];
    for (const v of stdValues) {
      if (Math.abs(v - cEach) < Math.abs(nearest - cEach)) nearest = v;
    }

    resultCaps.innerHTML = `
      <div class="crystal-result-card crystal-result-card--primary">
        <div class="buck-result-row">
          <div class="buck-result-main">
            <div class="buck-result-label">C1 = C2（对称设计）</div>
            <div class="buck-result-value">${fmtNum(cEach)} <span class="buck-result-unit">pF</span></div>
          </div>
          <div class="crystal-badge">≈ 取标准值 ${nearest} pF</div>
        </div>
        <div class="buck-result-meta">
          C1 = C2 = 2 × (${fmtNum(cl)} − ${fmtNum(cstray)}) = <strong>${fmtNum(cEach)} pF</strong>
          &nbsp;→&nbsp; 最接近标准值: <strong>${nearest} pF</strong>
        </div>
      </div>

      <div class="result-grid">
        <div class="result-item highlight">
          <div class="unit">晶体规格 CL</div>
          <div class="value">${fmtNum(cl)} pF</div>
        </div>
        <div class="result-item">
          <div class="unit">杂散电容 Cstray</div>
          <div class="value">${fmtNum(cstray)} pF</div>
        </div>
        <div class="result-item">
          <div class="unit">C1 + C2 总电容</div>
          <div class="value">${fmtNum(cEach * 2)} pF</div>
        </div>
        <div class="result-item">
          <div class="unit">验证 CL（反算）</div>
          <div class="value">${fmtNum(clCheck)} pF</div>
        </div>
      </div>
    `;
  }

  // --- Mode 2: Calculate CL from C1/C2 ---
  const c1Input = document.getElementById('crysC1');
  const c2Input = document.getElementById('crysC2');
  const cstray2Input = document.getElementById('crysCstray2');
  const resultCL = document.getElementById('crystalResultCL');

  function calculateCL() {
    const c1 = parseFloat(c1Input.value);
    const c2 = parseFloat(c2Input.value);
    const cstray = parseFloat(cstray2Input.value);

    if (isNaN(c1) || isNaN(c2) || isNaN(cstray) || c1 <= 0 || c2 <= 0 || cstray < 0) {
      resultCL.innerHTML = '';
      return;
    }

    const cSeries = (c1 * c2) / (c1 + c2);  // C1 || C2 series
    const cl = cSeries + cstray;
    const cEachEquiv = 2 * (cl - cstray);   // equivalent C1=C2 if symmetric

    resultCL.innerHTML = `
      <div class="crystal-result-card crystal-result-card--primary">
        <div class="buck-result-row">
          <div class="buck-result-main">
            <div class="buck-result-label">实际负载电容 CL</div>
            <div class="buck-result-value">${fmtNum(cl)} <span class="buck-result-unit">pF</span></div>
          </div>
          <div class="crystal-badge">${c1 === c2 ? '✅ 对称' : '⚡ 非对称'}</div>
        </div>
        <div class="buck-result-meta">
          CL = (${fmtNum(c1)} × ${fmtNum(c2)}) / (${fmtNum(c1)} + ${fmtNum(c2)}) + ${fmtNum(cstray)}
          = <strong>${fmtNum(cSeries)}</strong> + ${fmtNum(cstray)}
          = <strong>${fmtNum(cl)} pF</strong>
        </div>
      </div>

      <div class="result-grid">
        <div class="result-item">
          <div class="unit">串联值 C1‖C2</div>
          <div class="value">${fmtNum(cSeries)} pF</div>
        </div>
        <div class="result-item">
          <div class="unit">杂散电容 Cstray</div>
          <div class="value">${fmtNum(cstray)} pF</div>
        </div>
        <div class="result-item highlight">
          <div class="unit">最终 CL</div>
          <div class="value">${fmtNum(cl)} pF</div>
        </div>
        <div class="result-item">
          <div class="unit">等效对称 C1=C2</div>
          <div class="value">${fmtNum(cEachEquiv)} pF</div>
        </div>
      </div>
    `;
  }

  // Event listeners
  clInput.addEventListener('input', () => { if (currentMode === 'calc-caps') calculateCaps(); });
  cstrayInput.addEventListener('input', () => { if (currentMode === 'calc-caps') calculateCaps(); });
  c1Input.addEventListener('input', () => { if (currentMode === 'calc-cl') calculateCL(); });
  c2Input.addEventListener('input', () => { if (currentMode === 'calc-cl') calculateCL(); });
  cstray2Input.addEventListener('input', () => { if (currentMode === 'calc-cl') calculateCL(); });

  // Initial calculation
  calculateCaps();
});
