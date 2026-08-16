(function (root) {
  const finite = (value) => Number.isFinite(value);

  function calculateBuck({ vin, vout, io, rippleRatio, fswHz, derating }) {
    if (![vin, vout, io, rippleRatio, fswHz, derating].every(finite) ||
        vin <= 0 || vout <= 0 || vout >= vin || io <= 0 ||
        rippleRatio <= 0 || rippleRatio > 1 || fswHz <= 0 || derating <= 0 || derating > 1) {
      return { valid: false, message: '请确认 Vin > Vout > 0、频率/电流为正，纹波系数为 (0, 1]，降额系数为 (0, 1]。' };
    }
    const ripple = rippleRatio * io;
    const lminUh = (vin - vout) * vout * 1e6 / (vin * fswHz * ripple);
    return { valid: true, ripple, lminUh, peak: io + ripple / 2, duty: vout / vin };
  }

  function calculateLed({ vs, vf, currentMa }) {
    if (![vs, vf, currentMa].every(finite) || vs <= 0 || vf <= 0 || currentMa <= 0 || vf >= vs) {
      return { valid: false, message: '请确认电源、电压降和电流均为正，且 Vf 小于 Vs。' };
    }
    const currentA = currentMa / 1000;
    const resistance = (vs - vf) / currentA;
    return { valid: true, currentA, resistance, resistorPower: (vs - vf) * currentA, ledPower: vf * currentA };
  }

  function calculateDivider({ vin, r1, r2, load }) {
    if (![vin, r1, r2].every(finite) || vin < 0 || r1 <= 0 || r2 <= 0 || (load !== undefined && (!finite(load) || load <= 0))) {
      return { valid: false, message: '请填写有效的非负 Vin 和正电阻值。' };
    }
    const lower = load ? (r2 * load) / (r2 + load) : r2;
    const total = r1 + lower;
    const current = vin / total;
    return { valid: true, lower, total, current, vout: vin * lower / total };
  }

  root.HardwareToolsCore = { calculateBuck, calculateLed, calculateDivider };
})(globalThis);
