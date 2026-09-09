let ctx: AudioContext | null = null;

/** Toca um chime curto de 2 notas — aviso de "sua vez". Sem arquivo, via Web Audio. */
export function playTurnChime() {
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    ctx = ctx ?? new Ctor();
    if (ctx.state === "suspended") void ctx.resume();

    const now = ctx.currentTime;
    const notes = [783.99, 1174.66]; // Sol5 → Ré6
    notes.forEach((freq, i) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const t = now + i * 0.15;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.6);
    });
  } catch {
    /* ambiente sem áudio */
  }
}
