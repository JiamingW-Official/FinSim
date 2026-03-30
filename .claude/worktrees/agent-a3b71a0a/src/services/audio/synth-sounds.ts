/**
 * Oscillator-based synthesized sounds — no audio files needed.
 * Each function takes an AudioContext and optional gain level.
 */

export function playBuySound(ctx: AudioContext, volume: number) {
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(volume * 0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  // Two quick tones: 800Hz → 1200Hz
  const osc1 = ctx.createOscillator();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(800, now);
  osc1.connect(gain);
  osc1.start(now);
  osc1.stop(now + 0.08);

  const gain2 = ctx.createGain();
  gain2.connect(ctx.destination);
  gain2.gain.setValueAtTime(volume * 0.35, now + 0.09);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  const osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(1200, now + 0.09);
  osc2.connect(gain2);
  osc2.start(now + 0.09);
  osc2.stop(now + 0.22);
}

export function playSellSound(ctx: AudioContext, volume: number) {
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(volume * 0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  // Filtered noise sweep (simulated with oscillator sweep)
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(1500, now);
  filter.frequency.exponentialRampToValueAtTime(300, now + 0.2);
  filter.Q.setValueAtTime(2, now);

  osc.connect(filter);
  filter.connect(gain);
  osc.start(now);
  osc.stop(now + 0.2);
}

export function playAchievementSound(ctx: AudioContext, volume: number) {
  const now = ctx.currentTime;
  // Major chord: C4(261), E4(329), G4(392)
  const freqs = [261.63, 329.63, 392.0];

  for (const freq of freqs) {
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume * 0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.5);
  }
}

export function playLevelUpSound(ctx: AudioContext, volume: number) {
  const now = ctx.currentTime;
  // Rising arpeggio: C5, E5, G5, C6
  const notes = [523.25, 659.25, 783.99, 1046.5];
  const step = 0.1;

  for (let i = 0; i < notes.length; i++) {
    const t = now + i * step;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(volume * 0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + step + 0.15);

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(notes[i], t);
    osc.connect(gain);
    osc.start(t);
    osc.stop(t + step + 0.15);
  }
}

export function playXPSound(ctx: AudioContext, volume: number) {
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(volume * 0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1400, now);
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + 0.08);
}

export function playOrderFillSound(ctx: AudioContext, volume: number) {
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(volume * 0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1000, now);
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + 0.15);
}

export function playErrorSound(ctx: AudioContext, volume: number) {
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(volume * 0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(150, now);
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + 0.2);
}

export function playClickSound(ctx: AudioContext, volume: number) {
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(volume * 0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(600, now);
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + 0.03);
}

export function playCorrectSound(ctx: AudioContext, volume: number) {
  const now = ctx.currentTime;
  // Ascending chime: C5 → E5
  const notes = [523.25, 659.25];
  for (let i = 0; i < notes.length; i++) {
    const t = now + i * 0.1;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(volume * 0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(notes[i], t);
    osc.connect(gain);
    osc.start(t);
    osc.stop(t + 0.15);
  }
}

export function playWrongSound(ctx: AudioContext, volume: number) {
  playErrorSound(ctx, volume);
}

export function playLessonCompleteSound(ctx: AudioContext, volume: number) {
  const now = ctx.currentTime;
  // 3-note fanfare: C5 → E5 → G5
  const notes = [523.25, 659.25, 783.99];
  for (let i = 0; i < notes.length; i++) {
    const t = now + i * 0.15;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(volume * 0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(notes[i], t);
    osc.connect(gain);
    osc.start(t);
    osc.stop(t + 0.25);
  }
}

export function playComboSound(ctx: AudioContext, volume: number, comboLevel: number) {
  const now = ctx.currentTime;
  // Escalating pitch based on combo level
  const baseFreq = 600 + comboLevel * 100;

  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(volume * 0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(baseFreq, now);
  osc.frequency.linearRampToValueAtTime(baseFreq * 1.5, now + 0.15);
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + 0.25);
}

export function playCardFlipSound(ctx: AudioContext, volume: number) {
  const now = ctx.currentTime;
  // Short white-noise-like swoosh using high-frequency oscillator
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(volume * 0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(3000, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);

  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.setValueAtTime(2000, now);

  osc.connect(filter);
  filter.connect(gain);
  osc.start(now);
  osc.stop(now + 0.06);
}

export function playStreakSound(ctx: AudioContext, volume: number) {
  const now = ctx.currentTime;
  // Fast 3-note ascending arpeggio
  const notes = [659.25, 830.61, 1046.5]; // E5, Ab5, C6
  const step = 0.06;

  for (let i = 0; i < notes.length; i++) {
    const t = now + i * step;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(volume * 0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + step + 0.08);

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(notes[i], t);
    osc.connect(gain);
    osc.start(t);
    osc.stop(t + step + 0.08);
  }
}

export function playQuestCompleteSound(ctx: AudioContext, volume: number) {
  const now = ctx.currentTime;
  // Bright ascending: D5 → F#5 → A5 → D6
  const notes = [587.33, 739.99, 880.0, 1174.66];
  const step = 0.08;

  for (let i = 0; i < notes.length; i++) {
    const t = now + i * step;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(volume * 0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + step + 0.12);

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(notes[i], t);
    osc.connect(gain);
    osc.start(t);
    osc.stop(t + step + 0.12);
  }
}

export function playArenaWinSound(ctx: AudioContext, volume: number) {
  const now = ctx.currentTime;
  // Victory fanfare: G4 → B4 → D5 → G5
  const notes = [392.0, 493.88, 587.33, 783.99];
  const step = 0.12;

  for (let i = 0; i < notes.length; i++) {
    const t = now + i * step;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(volume * 0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(notes[i], t);
    osc.connect(gain);
    osc.start(t);
    osc.stop(t + 0.3);
  }
}

export function playArenaLoseSound(ctx: AudioContext, volume: number) {
  const now = ctx.currentTime;
  // Descending minor: Eb4 → C4 → Ab3
  const notes = [311.13, 261.63, 207.65];
  const step = 0.15;

  for (let i = 0; i < notes.length; i++) {
    const t = now + i * step;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(volume * 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(notes[i], t);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(600, t);

    osc.connect(filter);
    filter.connect(gain);
    osc.start(t);
    osc.stop(t + 0.25);
  }
}

export function playMatchFoundSound(ctx: AudioContext, volume: number) {
  const now = ctx.currentTime;
  // Alert: two quick ascending tones
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(volume * 0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  const osc = ctx.createOscillator();
  osc.type = "square";
  osc.frequency.setValueAtTime(880, now);
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + 0.06);

  const gain2 = ctx.createGain();
  gain2.connect(ctx.destination);
  gain2.gain.setValueAtTime(volume * 0.3, now + 0.08);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  const osc2 = ctx.createOscillator();
  osc2.type = "square";
  osc2.frequency.setValueAtTime(1320, now + 0.08);
  osc2.connect(gain2);
  osc2.start(now + 0.08);
  osc2.stop(now + 0.2);
}

export function playSeasonClaimSound(ctx: AudioContext, volume: number) {
  const now = ctx.currentTime;
  // Golden coin-like: high sine with reverb-like tail
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(volume * 0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(2637, now); // E7
  osc.frequency.exponentialRampToValueAtTime(2093, now + 0.15); // C7
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + 0.4);

  // Shimmer harmonic
  const gain2 = ctx.createGain();
  gain2.connect(ctx.destination);
  gain2.gain.setValueAtTime(volume * 0.15, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  const osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(5274, now);
  osc2.connect(gain2);
  osc2.start(now);
  osc2.stop(now + 0.35);
}

export function playClaimSound(ctx: AudioContext, volume: number) {
  const now = ctx.currentTime;
  // Metallic ping — high sine with quick decay
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(volume * 0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(2200, now);
  osc.frequency.exponentialRampToValueAtTime(1800, now + 0.1);
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + 0.3);

  // Second harmonic for metallic character
  const gain2 = ctx.createGain();
  gain2.connect(ctx.destination);
  gain2.gain.setValueAtTime(volume * 0.15, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  const osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(4400, now);
  osc2.connect(gain2);
  osc2.start(now);
  osc2.stop(now + 0.2);
}
