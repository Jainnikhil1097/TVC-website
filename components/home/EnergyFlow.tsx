"use client";

import { useEffect, useRef } from "react";
import { buildLines, flowY, mix, rgb, seededRandom, smoothstep, spectrumAt, SPECTRUM, type FlowLine, type RGB } from "./flow-geometry";

// Brand colours (globals.css): Signal Teal, Transition Aqua; lines sit on black.
const BLACK = "0, 0, 0";
const WHITE = "255, 255, 255";
const TEAL = "14, 213, 194";
const AQUA = "6, 232, 211"; // Brand "Transition Aqua"

const HOT_WARM: RGB = [255, 233, 210];
const HOT_CLEAN: RGB = [201, 255, 249];

const FRAME_MS = 1000 / 30; // ~30 fps is plenty for slow motion and halves the work
const POINTER_RADIUS = 150;
const POINTER_PUSH = 34;

type Tone = "light" | "dark";
type Pulse = { line: number; p: number; speed: number };
export type FlowState = { width: number; height: number; tone: Tone; lines: FlowLine[]; pulses: Pulse[]; neonLines: number[] };
export type FlowPointer = { x: number; y: number };

/** Lines and pulses for a canvas of this size (deterministic, so every visit matches). */
export function buildFlow(width: number, height: number, tone: Tone): FlowState {
  const mobile = width < 768;
  const dark = tone === "dark";
  // The original line count: 64 on desktop, 32 on phones.
  const count = mobile ? 32 : 64;
  const rand = seededRandom(7);
  // On black the plain lines are only texture; the neon carries the picture.
  const lines = buildLines(count, dark, dark ? 4 : 7, rand);
  const neonLines = lines.flatMap((l, i) => (l.neon ? [i] : []));
  const pulses = Array.from({ length: dark ? (mobile ? 7 : 14) : mobile ? 5 : 10 }, (_, i) => ({
    line: neonLines[i % neonLines.length] ?? i,
    p: rand(),
    speed: 0.05 + rand() * 0.06,
  }));
  return { width, height, tone, lines, pulses, neonLines };
}

/** y of a line at horizontal position u (0..1) and time t (seconds). */
function yAt(s: FlowState, l: FlowLine, u: number, t: number, pointer: FlowPointer | null) {
  let y = flowY(l, u, t, s.height);
  if (pointer) {
    const dx = u * s.width - pointer.x;
    const dy = y - pointer.y;
    const f = Math.exp(-(dx * dx + dy * dy) / (POINTER_RADIUS * POINTER_RADIUS));
    y += Math.sign(dy || 1) * f * POINTER_PUSH;
  }
  return y;
}

function trace(ctx: CanvasRenderingContext2D, pts: [number, number][]) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
}

/**
 * Draws one frame. On black ("dark"), neon lines are three stacked fine strokes — a soft
 * halo, a glow and a bright core — in the fossil → clean spectrum, added together
 * ("lighter") so they brighten where they cross. No shadowBlur (too costly per frame).
 */
export function drawFlow(ctx: CanvasRenderingContext2D, s: FlowState, time: number, pointer: FlowPointer | null) {
  const dark = s.tone === "dark";
  ctx.clearRect(0, 0, s.width, s.height);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const steps = Math.max(24, Math.round(s.width / 18));
  const path = (l: FlowLine, from = 0, to = 1, n = steps): [number, number][] =>
    Array.from({ length: n + 1 }, (_, k) => {
      const u = from + ((to - from) * k) / n;
      return [u * s.width, yAt(s, l, u, time, pointer)];
    });

  // Texture lines first (normal blending).
  for (const l of s.lines) {
    if (l.neon && dark) continue;
    trace(ctx, path(l));
    ctx.lineWidth = l.neon ? 1.25 : 1;
    ctx.strokeStyle = l.neon ? `rgba(${TEAL}, 0.42)` : `rgba(${dark ? WHITE : BLACK}, ${l.alpha})`;
    ctx.stroke();
  }

  if (dark) {
    ctx.globalCompositeOperation = "lighter";
    // One spectrum gradient per pass, shared by every line; breathing via globalAlpha.
    const passes = ([[3.2, 0.08], [1.4, 0.22], [0.75, 0.95]] as const).map(([w, a]) => {
      const g = ctx.createLinearGradient(0, 0, s.width, 0);
      for (const [stop, c] of SPECTRUM) g.addColorStop(stop, `rgba(${rgb(c)}, ${a})`);
      return { w, g };
    });
    for (const l of s.lines) {
      if (!l.neon) continue;
      const pts = path(l);
      // Each line breathes slowly on its own phase (75–100% intensity).
      ctx.globalAlpha = 0.75 + 0.25 * (0.5 + 0.5 * Math.sin(time * 0.6 + l.phase * 3));
      for (const { w, g } of passes) {
        trace(ctx, pts);
        ctx.lineWidth = w;
        ctx.strokeStyle = g;
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  // Pulses: a hot packet with a fading tail, coloured by where it is (warm → clean).
  for (const pulse of s.pulses) {
    const l = s.lines[pulse.line];
    if (!l) continue;
    const head = pulse.p;
    const tail = Math.max(0, head - 0.07);
    const pts = path(l, tail, head, 10);
    const here: RGB = dark ? spectrumAt(Math.min(1, head)) : [6, 232, 211];
    const grad = ctx.createLinearGradient(tail * s.width, 0, head * s.width, 0);
    grad.addColorStop(0, `rgba(${dark ? rgb(spectrumAt(tail)) : TEAL}, 0)`);
    grad.addColorStop(1, `rgba(${dark ? rgb(here) : AQUA}, 0.95)`);
    if (dark) {
      trace(ctx, pts);
      ctx.lineWidth = 6;
      ctx.strokeStyle = `rgba(${rgb(here)}, 0.22)`;
      ctx.stroke();
    }
    trace(ctx, pts);
    ctx.lineWidth = dark ? 1.8 : 2;
    ctx.strokeStyle = grad;
    ctx.stroke();
    if (dark) {
      trace(ctx, path(l, tail + (head - tail) * 0.72, head, 4));
      ctx.lineWidth = 1.1;
      ctx.strokeStyle = `rgba(${rgb(mix(HOT_WARM, HOT_CLEAN, smoothstep(0.2, 0.65, head)))}, 1)`;
      ctx.stroke();
    }
  }
  ctx.globalCompositeOperation = "source-over";
}

/**
 * Abstract "energy flow" for the home hero: streamlines run left to right, loose and
 * wavy at the left and drawing into an ordered bundle at the right (the transition),
 * with hot pulses travelling along the neon lines. On black the neon shifts from warm
 * amber (left) to Transition Aqua (right). Plain Canvas 2D, no libraries.
 *
 * Cheap by design: ~30 fps, DPR capped at 2, paused off-screen and in hidden tabs.
 * Reduced motion and Save-Data get a single still frame. Purely decorative.
 */
export function EnergyFlow({ className, tone = "light" }: { className?: string; tone?: Tone }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const still =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    let state = buildFlow(0, 0, tone);
    let raf = 0;
    let last = 0;
    let visible = true;
    let time = 0;
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

    const draw = () => drawFlow(ctx, state, time, pointer.x > -1000 ? pointer : null);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      state = buildFlow(rect.width, rect.height, tone);
      draw();
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < FRAME_MS) return;
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      time += dt;
      for (const pulse of state.pulses) {
        pulse.p += pulse.speed * dt;
        if (pulse.p > 1.07) {
          pulse.p = 0;
          // Pulses ride the neon lines.
          const pool = state.neonLines.length ? state.neonLines : state.lines.map((_, i) => i);
          pulse.line = pool[Math.floor(Math.random() * pool.length)];
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
