/**
 * LED 限流电阻计算器
 * R = (Vs - Vf) / If
 * 并推荐最接近的标准电阻值
 */
const E12_VALUES = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];

// Common LED forward voltages
const LED_PRESETS = [
  { name: '红色 LED', vf: 2.0, color: '#ff4444' },
  { name: '绿色 LED', vf: 2.2, color: '#44ff44' },
  { name: '蓝色 LED', vf: 3.2, color: '#4488ff' },
  { name: '白色 LED', vf: 3.2, color: '#ffffff' },
  { name: '黄色 LED', vf: 2.1, color: '#ffff44' },
  { name: '红外 LED', vf: 1.4, color: '#cc4444' },
  { name: '紫外 LED', vf: 3.6, color: '#aa44ff' },
];

function findClosestResistor(target) {
  if (target <= 0) return [];
  // Find closest E12 values
  const decades = [];
  let decade = 1;
  while (decade <= 10000000) {
    E12_VALUES.forEach(v => {
      const r = v * decade;
      if (r >= target * 0.5 && r <= target * 2) {
        decades.push(r);
      }
    });
    decade *= 10;
  }
  decades.sort((a, b) => Math.abs(a - target) - Math.abs(b - target));
  return decades.slice(0, 5);
}

registerTool('led', () => {
  return `
    <div class="tool-panel active">
      <div class="tool-header">
        <h2>💡 LED 限流电阻计算</h2>
        <p>根据电源电压和LED参数，计算所需的串联限流电阻</p>
      </div>
      <div class="tool-body">
        <div class="form-group">
          <label class="form-label">LED 预设（可选）</label>
          <div style="display:flex;gap:8px;flex-wrap:wrap;" id="ledPresets">
            ${LED_PRESETS.map((p, i) => `
              <button class="btn btn-secondary led-preset-btn" data-index="${i}" style="font-size:0.8rem;padding:6px 12px;">
                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};margin-right:4px;"></span>
                ${p.name}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="form-row" style="flex-wrap:wrap;">
          <div class="form-group" style="flex:1;min-width:180px;">
            <label class="form-label">电源电压 Vs（V）</label>
            <input type="number" class="form-input" id="ledVs" value="5" step="any" placeholder="如 5V, 3.3V, 12V">
          </div>
          <div class="form-group" style="flex:1;min-width:180px;">
            <label class="form-label">LED 正向压降 Vf（V）</label>
            <input type="number" class="form-input" id="ledVf" value="2.0" step="any" placeholder="如 2.0V">
          </div>
          <div class="form-group" style="flex:1;min-width:180px;">
            <label class="form-label">LED 工作电流 If（mA）</label>
            <input type="number" class="form-input" id="ledIf" value="20" step="any" placeholder="通常 5-30mA">
          </div>
        </div>

        <div id="ledResult" style="margin-top:16px;"></div>

        <div class="formula-box" style="margin-top:12px;">
          📐 公式：R = (Vs − Vf) / If &nbsp;&nbsp; Pr = (Vs − Vf) × If（电阻功耗）
        </div>
      </div>
    </div>
  `;
}, () => {
  const vsInput = document.getElementById('ledVs');
  const vfInput = document.getElementById('ledVf');
  const ifInput = document.getElementById('ledIf');
  const resultDiv = document.getElementById('ledResult');
  const presetBtns = document.querySelectorAll('.led-preset-btn');

  function calculate() {
    const vs = parseFloat(vsInput.value);
    const vf = parseFloat(vfInput.value);
    const If_mA = parseFloat(ifInput.value);

    if (isNaN(vs) || isNaN(vf) || isNaN(If_mA) || If_mA <= 0) {
      resultDiv.innerHTML = `
        <div class="result-box" style="border-color: var(--text-muted);">
          <span style="color: var(--text-muted);">请填写所有参数</span>
        </div>
      `;
      return;
    }

    if (vf >= vs) {
      resultDiv.innerHTML = `
        <div class="result-box" style="border-color: var(--red);">
          <span style="color: var(--red);">⚠️ LED正向压降 (${vf}V) 不能大于等于电源电压 (${vs}V)</span>
        </div>
      `;
      return;
    }

    const If_A = If_mA / 1000;
    const R = (vs - vf) / If_A;
    const Pr = (vs - vf) * If_A; // Power dissipated by resistor

    const closest = findClosestResistor(R);

    let html = `
      <div class="result-box">
        <div class="result-label">计算结果</div>
        <div class="result-value">
          所需电阻：${fmtNum(R)} Ω
        </div>
      </div>
      <div class="result-grid">
        <div class="result-item highlight">
          <div class="unit">电阻值 R</div>
          <div class="value">${fmtNum(R)} Ω</div>
        </div>
        <div class="result-item">
          <div class="unit">电阻功耗 Pr</div>
          <div class="value">${fmtNum(Pr * 1000)} mW</div>
        </div>
        <div class="result-item">
          <div class="unit">LED 功耗</div>
          <div class="value">${fmtNum(vf * If_A * 1000)} mW</div>
        </div>
        <div class="result-item">
          <div class="unit">总功耗</div>
          <div class="value">${fmtNum(vs * If_A * 1000)} mW</div>
        </div>
      </div>
    `;

    if (closest.length > 0) {
      html += `
        <div class="formula-box" style="margin-top:12px;">
          📌 推荐标准电阻（E12系列，最接近的5个）：<br>
          <strong style="color:var(--green);">${closest.map(r => fmtNum(r) + ' Ω').join(' &nbsp;|&nbsp; ')}</strong>
        </div>
      `;
    }

    // Safety check
    const powerRating = Pr * 2; // 2x safety margin
    if (powerRating > 0.25) {
      html += `
        <div class="formula-box" style="margin-top:8px; color: var(--orange);">
          ⚠️ 建议使用 ${powerRating > 1 ? fmtNum(powerRating) + ' W' : fmtNum(powerRating * 1000) + ' mW'} 以上功率等级的电阻（2倍安全裕量）
        </div>
      `;
    }

    resultDiv.innerHTML = html;
  }

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = LED_PRESETS[parseInt(btn.dataset.index)];
      vfInput.value = preset.vf;
      calculate();
    });
  });

  vsInput.addEventListener('input', calculate);
  vfInput.addEventListener('input', calculate);
  ifInput.addEventListener('input', calculate);
  calculate();
});
