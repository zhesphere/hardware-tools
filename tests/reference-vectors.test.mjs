import assert from 'node:assert/strict';
import test from 'node:test';

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
  const supplyVoltage = 5;
  const forwardVoltage = 2;
  const current = 0.02;

  closeTo((supplyVoltage - forwardVoltage) / current, 150);
  closeTo((supplyVoltage - forwardVoltage) * current, 0.06);
});

test('unloaded voltage divider reference vector', () => {
  const vin = 5;
  const r1 = 10e3;
  const r2 = 10e3;
  const vout = vin * r2 / (r1 + r2);

  closeTo(vout, 2.5);
  closeTo(vin / (r1 + r2), 0.00025);
});

test('Buck reference vector uses Hz, not a scaled display unit', () => {
  const vin = 16;
  const vout = 5;
  const outputCurrent = 0.6;
  const rippleRatio = 0.4;
  const switchingFrequencyHz = 770e3;
  const rippleCurrent = rippleRatio * outputCurrent;
  const inductanceHenries = (vin - vout) * vout /
    (vin * switchingFrequencyHz * rippleCurrent);

  closeTo(inductanceHenries * 1e6, 18.601190476190478);
  closeTo(outputCurrent + rippleCurrent / 2, 0.72);
});

test('crystal load capacitance reference vectors', () => {
  const loadCapacitance = 12.5;
  const strayCapacitance = 4;
  const c1 = 2 * (loadCapacitance - strayCapacitance);
  const c2 = c1;

  closeTo(c1, 17);
  closeTo((c1 * c2) / (c1 + c2) + strayCapacitance, loadCapacitance);
});

test.todo('connect golden vectors to the extracted browser calculation core');
test.todo('add a browser integration case for the current Buck frequency-unit defect before fixing it');
