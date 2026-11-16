"use client";

import { useEffect, useRef } from "react";

// Brand colours (globals.css): Deep Navy, Signal Teal, Transition Aqua.
const NAVY = "10, 30, 63";
const WHITE = "255, 255, 255";
const TEAL = "14, 213, 194";
const AQUA = "6, 232, 211";

const FRAME_MS = 1000 / 30; // ~30 fps is plenty for slow motion and halves the work
const POINTER_RADIUS = 150;
const POINTER_PUSH = 34;

type Line = { y0: number; phase: number; alpha: number; teal: boolean };
type Pulse = { line: number; p: number; speed: number };

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Abstract "energy flow" for the home hero: streamlines run left to right, loose and
 * wavy at the left and drawing into an ordered bundle at the right (the transition),
 * with bright pulses travelling along a few of them. Plain Canvas 2D, no libraries.
 *
 * Cheap by design: ~30 fps, DPR capped at 2, paused off-screen and in hidden tabs.
 * Reduced motion and Save-Data get a single still frame. Purely decorative.
 */
export function EnergyFlow({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const still =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    // On navy the base lines are faint white and the teal lines a touch brighter.
    const baseRgb = tone === "dark" ? WHITE : NAVY;
    const tealAlpha = tone === "dark" ? 0.5 : 0.42;

    let width = 0;
    let height = 0;
    let lines: Line[] = [];
    let pulses: Pulse[] = [];
    let raf = 0;
    let last = 0;
    let visible = true;
    let time = 0;
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

    const build = () => {
      const count = width < 768 ? 32 : 64;
      // Deterministic pseudo-random, so every visit (and every resize) looks the same.
      let seed = 7;
      const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
      lines = Array.from({ length: count }, (_, i) => ({
        y0: 0.04 + (0.92 * i) / (count - 1),
        phase: rand() * Math.PI * 2,
        alpha: 0.05 + rand() * 0.07,
        teal: i % 7 === 3,
      }));
      const tealLines = lines.flatMap((l, i) => (l.teal ? [i] : []));
      pulses = Array.from({ length: width < 768 ? 5 : 10 }, (_, i) => ({
        line: tealLines[i % tealLines.length] ?? i,
        p: rand(),
        speed: 0.05 + rand() * 0.06,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
      draw();
    };

    /** y of line `l` at horizontal position u (0..1) and time t (seconds). */
    const yAt = (l: Line, u: number, t: number) => {
      const converge = smoothstep(0.1, 1, u);
      const centre = 0.5;
      const base = centre + (l.y0 - centre) * (1 - 0.62 * converge);
      const amp = 0.055 * (1 - 0.72 * converge);
      const wave =
        Math.sin(u * 6.2 + t * 0.32 + l.phase) * 0.62 + Math.sin(u * 11.5 - t * 0.21 + l.phase * 1.7) * 0.38;
      let y = (base + amp * wave) * height;
      if (pointer.x > -1000) {
        const dx = u * width - pointer.x;
        const dy = y - pointer.y;
        const f = Math.exp(-(dx * dx + dy * dy) / (POINTER_RADIUS * POINTER_RADIUS));
        y += Math.sign(dy || 1) * f * POINTER_PUSH;
      }
      return y;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const steps = Math.max(24, Math.round(width / 18));

      for (const l of lines) {
        ctx.beginPath();
        for (let s = 0; s <= steps; s++) {
          const u = s / steps;
          const y = yAt(l, u, time);
          if (s === 0) ctx.moveTo(0, y);
          else ctx.lineTo(u * width, y);
        }
        ctx.lineWidth = l.teal ? 1.25 : 1;
        ctx.strokeStyle = l.teal ? `rgba(${TEAL}, ${tealAlpha})` : `rgba(${baseRgb}, ${l.alpha})`;
        ctx.stroke();
      }

      // Pulses: a short bright segment with a fading tail.
      for (const pulse of pulses) {
        const l = lines[pulse.line];
        if (!l) continue;
        const head = pulse.p;
        const tail = Math.max(0, head - 0.07);
        const x0 = tail * width;
        const x1 = head * width;
        const grad = ctx.createLinearGradient(x0, 0, x1, 0);
        grad.addColorStop(0, `rgba(${TEAL}, 0)`);
        grad.addColorStop(1, `rgba(${AQUA}, 0.95)`);
        ctx.beginPath();
        const segs = 10;
        for (let s = 0; s <= segs; s++) {
          const u = tail + ((head - tail) * s) / segs;
          const y = yAt(l, u, time);
          if (s === 0) ctx.moveTo(u * width, y);
          else ctx.lineTo(u * width, y);
        }
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = grad;
        ctx.stroke();
      }
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < FRAME_MS) return;
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      time += dt;
      for (const pulse of pulses) {
        pulse.p += pulse.speed * dt;
        if (pulse.p > 1.07) {
          pulse.p = 0;
          pulse.line = Math.floor(Math.random() * lines.length);
        }
      }
      // Ease the pointer so the lines part smoothly rather than snapping.
      pointer.x += (pointer.tx - pointer.x) * 0.12;
      pointer.y += (pointer.ty - pointer.y) * 0.12;
      draw();
    };

    const start = () => {
      if (still || raf || !visible || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = e.clientX - rect.left;
      pointer.ty = e.clientY - rect.top;
      if (pointer.x < -1000) {
        pointer.x = pointer.tx;
        pointer.y = pointer.ty;
      }
    };
    const onPointerLeave = () => {
      pointer.tx = pointer.ty = pointer.x = pointer.y = -9999;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const viewObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    viewObserver.observe(canvas);
    document.addEventListener("visibilitychange", onVisibility);
    // The canvas sits behind the copy, so listen on its section rather than the canvas.
    const host = canvas.closest("section") ?? window;
    if (finePointer && !still) {
      host.addEventListener("pointermove", onPointerMove as EventListener, { passive: true });
      host.addEventListener("pointerleave", onPointerLeave);
    }

    resize();
    canvas.dataset.ready = "";
    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      viewObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      host.removeEventListener("pointermove", onPointerMove as EventListener);
      host.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [tone]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`block h-full w-full opacity-0 transition-opacity duration-1000 data-[ready]:opacity-100 ${className ?? ""}`}
    />
  );
}
