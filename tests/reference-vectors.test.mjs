import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../js/core/calculations.js', import.meta.url), 'utf8');
const context = { globalThis: {} };
vm.runInNewContext(source, context);
const { calculateBuck, calculateLed, calculateDivider } = context.globalThis.HardwareToolsCore;

// These are independent golden vectors, not DOM tests. In P0 phase 2 they will
// be connected to the extracted calculation core so that UI changes cannot
// silently change engineering results.
const closeTo = (actual, expected, relativeTolerance = 1e-12) => {
  assert.ok(
    Math.abs(actual - expected) <= Math.max(1, Math.abs(expected)) * relativeTolerance,
    `expected ${expected}, received ${actual}`,
  );
};

test('unit conversion reference values use SI base units', () => {
  closeTo(4.7 * 1e3, 4700);
  closeTo(100 * 1e-9, 1e-7);
  closeTo(770 * 1e3, 770000);
});

test('Ohm law reference vectors', () => {
  const voltage = 5;
  const current = 0.02;
  const resistance = voltage / current;
  const power = voltage * current;

  closeTo(resistance, 250);
  closeTo(power, 0.1);
  closeTo(Math.sqrt(power * resistance), voltage);
  closeTo(Math.sqrt(power / resistance), current);
});

test('LED reference vector reports theoretical resistor and power', () => {
  const result = calculateLed({ vs: 5, vf: 2, currentMa: 20 });
  assert.equal(result.valid, true);
  closeTo(result.resistance, 150);
  closeTo(result.resistorPower, 0.06);
  assert.equal(calculateLed({ vs: 3, vf: 3.2, currentMa: 20 }).valid, false);
});

test('unloaded voltage divider reference vector', () => {
  const result = calculateDivider({ vin: 5, r1: 10e3, r2: 10e3 });
  assert.equal(result.valid, true);
  closeTo(result.vout, 2.5);
  closeTo(result.current, 0.00025);
  const loaded = calculateDivider({ vin: 5, r1: 10e3, r2: 10e3, load: 10e3 });
  closeTo(loaded.lower, 5e3);
  closeTo(loaded.vout, 5 / 3);
});

test('Buck reference vector uses Hz, not a scaled display unit', () => {
  const result = calculateBuck({ vin: 16, vout: 5, io: 0.6, rippleRatio: 0.4, fswHz: 770e3, derating: 0.7 });
  assert.equal(result.valid, true);
  closeTo(result.lminUh, 18.601190476190478);
  closeTo(result.peak, 0.72);
  assert.equal(calculateBuck({ vin: 5, vout: 5, io: 1, rippleRatio: 0.4, fswHz: 1e6, derating: 0.7 }).valid, false);
});

test('crystal load capacitance reference vectors', () => {
  const loadCapacitance = 12.5;
  const strayCapacitance = 4;
  const c1 = 2 * (loadCapacitance - strayCapacitance);
  const c2 = c1;

  closeTo(c1, 17);
  closeTo((c1 * c2) / (c1 + c2) + strayCapacitance, loadCapacitance);
});

test('Buck UI uses correct display-unit multipliers', async () => {
  const buckSource = await readFile(new URL('../js/tools/inductor-buck.js', import.meta.url), 'utf8');
  assert.match(buckSource, /option value="1"[^>]*>Hz/);
  assert.match(buckSource, /option value="1e3" selected>kHz/);
});

test('unit converter does not turn invalid input into a valid zero', async () => {
  const converterSource = await readFile(new URL('../js/tools/unit-converter.js', import.meta.url), 'utf8');
  assert.match(converterSource, /Number\.isFinite\(value\)/);
  assert.doesNotMatch(converterSource, /parseFloat\(valueInput\.value\) \|\| 0/);
});
