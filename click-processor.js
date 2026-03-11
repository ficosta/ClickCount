/**
 * AudioWorklet processor for detecting sharp transient sounds (clicks).
 * Runs in the audio rendering thread for low-latency analysis.
 */
class ClickProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    // Detection parameters (updated via port messages from UI)
    this.absoluteThreshold = 0.03;
    this.relativeThreshold = 3.0;
    this.cooldownMs = 30;
    this.smoothingFactor = 0.995;

    // Internal state
    this.avgEnergy = 0;
    this.cooldownSamples = 0;
    this.levelFrameCounter = 0;

    this.port.onmessage = (e) => {
      const d = e.data;
      if (d.absoluteThreshold !== undefined) this.absoluteThreshold = d.absoluteThreshold;
      if (d.relativeThreshold !== undefined) this.relativeThreshold = d.relativeThreshold;
      if (d.cooldownMs !== undefined) this.cooldownMs = d.cooldownMs;
      if (d.smoothingFactor !== undefined) this.smoothingFactor = d.smoothingFactor;
    };
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0] || input[0].length === 0) return true;

    const samples = input[0];
    const len = samples.length;

    // Compute RMS energy and peak amplitude
    let sumSq = 0;
    let peak = 0;
    for (let i = 0; i < len; i++) {
      const s = Math.abs(samples[i]);
      sumSq += s * s;
      if (s > peak) peak = s;
    }
    const rms = Math.sqrt(sumSq / len);

    // Decrement cooldown
    if (this.cooldownSamples > 0) {
      this.cooldownSamples -= len;
    }

    // Only update ambient energy baseline when NOT in cooldown and NOT clicking
    // This prevents click energy from inflating the baseline and blocking fast clicks
    const isClick =
      peak > this.absoluteThreshold &&
      rms > this.avgEnergy * this.relativeThreshold &&
      this.cooldownSamples <= 0;

    if (isClick) {
      this.port.postMessage({ type: 'click', peak, rms });
      this.cooldownSamples = Math.round((this.cooldownMs / 1000) * sampleRate);
    } else if (this.cooldownSamples <= 0) {
      // Update ambient energy only during quiet periods
      this.avgEnergy = this.smoothingFactor * this.avgEnergy + (1 - this.smoothingFactor) * rms;
    }

    // Send level updates at ~20fps (every ~7 blocks at 128 samples / 44.1kHz)
    this.levelFrameCounter++;
    if (this.levelFrameCounter >= 7) {
      this.levelFrameCounter = 0;
      this.port.postMessage({ type: 'level', rms, peak });
    }

    return true;
  }
}

registerProcessor('click-processor', ClickProcessor);
