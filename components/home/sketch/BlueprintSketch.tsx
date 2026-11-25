"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type { Model } from "./engine";
import { drawFigureLabel, drawFrame, frameAt, layoutsFor, totalDuration, type Layout, type Placement, type View } from "./render";

const FRAME_MS = 1000 / 30;
const DRAG_RAD_PER_PX = 0.008;
const SETTLE_AFTER_MS = 5000;

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

type Sketch = {
  model: Model;
  layout: Layout;
  /** Loop offset (s), so several sketches don't assemble in lockstep. */
  offset: number;
  centres: ([number, number] | null)[];
  hoverPull: number;
  tapPull: boolean;
  focus: number;
  user: { yaw: number; pitch: number; vYaw: number; vPitch: number; lastInput: number };
};

/**
 * Mechanical blueprint sketches looping in the hero background: construction lines and
 * parts sketch in, the parts come together, the product runs, then it comes apart.
 * One model sits right of the headline; three or four form a "drawing sheet" of
 * figures (FIG. 01…), each with its own loop phase.
 *
 * Interactive (unless `interactive={false}`), per sketch:
 *   - follows the cursor with a gentle tilt (fine pointers; all sketches);
 *   - hovering a sketch pulls it apart and lights up its nearest part (a tap toggles
 *     this on touch screens);
 *   - drag to rotate the sketch you grabbed, with inertia, settling back when idle; on
 *     touch only horizontal drags rotate, so vertical swipes still scroll;
 *   - scrolling down past the hero takes them all apart.
 * Pointer listeners sit on the hero <section> (the canvas is behind the copy) and
 * ignore links and buttons, so the CTAs and nav always work.
 *
 * ~30 fps, DPR capped at 2, paused off-screen and in hidden tabs; reduced motion /
 * Save-Data get one still frame and no interaction.
 */
export function BlueprintSketch({
  models,
  runOnly = false,
  interactive = true,
  placement = "side",
  dim = 1,
  className,
}: {
  models: Model[];
  runOnly?: boolean;
  interactive?: boolean;
  /** "side": right of the headline. "background": behind the whole hero. */
  placement?: Placement;
  /** Overall strength (0–1); lower it when the drawing sits behind text. */
  dim?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !models.length) return;

    const still =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const host = canvas.closest<HTMLElement>("section") ?? canvas;
    const multi = models.length > 1;

    let width = 0;
    let height = 0;
    let raf = 0;
    let last = 0;
    let time = 0;
    let visible = true;

    const sketches: Sketch[] = models.map((model, i) => ({
      model,
      layout: { cx: 0, cy: 0, scale: 1, px: 1, r: 0, fit: 0 },
      offset: (i * totalDuration(model)) / models.length,
      centres: [],
      hoverPull: 0,
      tapPull: false,
      focus: -1,
      user: { yaw: 0, pitch: 0, vYaw: 0, vPitch: 0, lastInput: 0 },
    }));

    const pointer = { x: 0, y: 0, onSection: false, over: -1 };
    const tilt = { yaw: 0, pitch: 0 };
    const drag = { target: -1, active: false, pending: false, startX: 0, startY: 0, lastX: 0, lastY: 0, touch: false };
    let scrollPull = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      sketches.forEach((s, i) => {
        if (still) {
          drawFrame(ctx, s.model, s.layout, frameAt(s.model, 0, true), undefined, multi);
        } else {
          const view: View | undefined = interactive
            ? { yaw: s.user.yaw + tilt.yaw, pitch: s.user.pitch + tilt.pitch, pull: Math.max(s.hoverPull, scrollPull), focus: s.focus }
            : undefined;
          s.centres = drawFrame(ctx, s.model, s.layout, frameAt(s.model, time + s.offset, runOnly), view, multi);
        }
        if (multi) drawFigureLabel(ctx, s.layout, i + 1, 1);
      });
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const layouts = layoutsFor(sketches.length, width, height, placement);
      sketches.forEach((s, i) => (s.layout = { ...layouts[i], scale: layouts[i].fit / s.model.size }));
      draw();
    };

    /** Ease the interaction values towards their targets once per frame. */
    const stepInteraction = (now: number) => {
      // Tilt toward the cursor while it's over the hero (not while dragging).
      const ref = sketches.length === 1 ? sketches[0].layout : { cx: width * 0.72, cy: height * 0.5, r: Math.min(width, height) * 0.3 };
      const on = pointer.onSection && finePointer && !drag.active;
      const tx = on ? clamp((pointer.x - ref.cx) / (ref.r * 2), -1, 1) : 0;
      const ty = on ? clamp((pointer.y - ref.cy) / (ref.r * 2), -1, 1) : 0;
      tilt.yaw += (tx * 0.28 - tilt.yaw) * 0.08;
      tilt.pitch += (ty * 0.16 - tilt.pitch) * 0.08;

      const sp = clamp(window.scrollY / (0.9 * window.innerHeight), 0, 1);
      scrollPull += (easeInOut(sp) - scrollPull) * 0.15;

      sketches.forEach((s, i) => {
        const u = s.user;
        if (!(drag.active && drag.target === i)) {
          u.yaw += u.vYaw;
          u.pitch = clamp(u.pitch + u.vPitch, -0.6, 0.6);
          u.vYaw *= 0.92;
          u.vPitch *= 0.92;
          if (now - u.lastInput > SETTLE_AFTER_MS) {
            u.yaw *= 0.97;
            u.pitch *= 0.97;
          }
        }
        const hovered = pointer.over === i && finePointer;
        s.hoverPull += ((hovered || s.tapPull ? 0.7 : 0) - s.hoverPull) * 0.07;

        // Part nearest the pointer, within this sketch.
        s.focus = -1;
        if (hovered) {
          let best = Infinity;
          s.centres.forEach((c, k) => {
            if (!c) return;
            const d = (c[0] - pointer.x) ** 2 + (c[1] - pointer.y) ** 2;
            if (d < best) {
              best = d;
              s.focus = k;
            }
          });
          if (best > (s.layout.r * 0.45) ** 2) s.focus = -1;
        }
      });
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < FRAME_MS) return;
      time += last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      if (interactive) stepInteraction(now);
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
    const onVisibility = () => (document.hidden ? stop() : start());

    // ─── Pointer input ───────────────────────────────────────────────────────
    const local = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top] as const;
    };
    /** Index of the sketch whose zone contains (x, y), nearest first; -1 if none. */
    const sketchAt = (x: number, y: number) => {
      let hit = -1;
      let best = Infinity;
      sketches.forEach((s, i) => {
        const d = (x - s.layout.cx) ** 2 + (y - s.layout.cy) ** 2;
        if (d <= s.layout.r ** 2 && d < best) {
          best = d;
          hit = i;
        }
      });
      return hit;
    };
    const isControl = (e: Event) => e.target instanceof Element && Boolean(e.target.closest("a, button, input, textarea, select"));
    const setCursor = () => {
      host.style.cursor = drag.active ? "grabbing" : pointer.over >= 0 && finePointer ? "grab" : "";
    };

    const onMove = (e: PointerEvent) => {
      const [x, y] = local(e);
      pointer.x = x;
      pointer.y = y;
      pointer.onSection = true;
      pointer.over = isControl(e) ? -1 : sketchAt(x, y);
      if (drag.pending || drag.active) {
        const dx = x - drag.lastX;
        const dy = y - drag.lastY;
        if (drag.pending) {
          const mx = x - drag.startX;
          const my = y - drag.startY;
          if (Math.hypot(mx, my) > 4) {
            drag.pending = false;
            // On touch, only a mostly-horizontal drag rotates; vertical swipes scroll.
            if (!(drag.touch && Math.abs(my) > Math.abs(mx))) {
              drag.active = true;
              host.setPointerCapture?.(e.pointerId);
            }
          }
        }
        if (drag.active) {
          const u = sketches[drag.target].user;
          u.vYaw = dx * DRAG_RAD_PER_PX;
          u.vPitch = dy * DRAG_RAD_PER_PX * 0.6;
          u.yaw += u.vYaw;
          u.pitch = clamp(u.pitch + u.vPitch, -0.6, 0.6);
          u.lastInput = performance.now();
        }
        drag.lastX = x;
        drag.lastY = y;
      }
      setCursor();
    };
    const onDown = (e: PointerEvent) => {
      if (isControl(e) || (e.pointerType === "mouse" && e.button !== 0)) return;
      const [x, y] = local(e);
      const hit = sketchAt(x, y);
      if (hit < 0) return;
      drag.target = hit;
      drag.pending = true;
      drag.touch = e.pointerType !== "mouse";
      drag.startX = drag.lastX = x;
      drag.startY = drag.lastY = y;
      sketches[hit].user.vYaw = sketches[hit].user.vPitch = 0;
      if (!drag.touch) e.preventDefault(); // no text selection while dragging
    };
    const onUp = (e: PointerEvent) => {
      // A press without movement is a tap: on touch it toggles that sketch's pull-apart.
      if (drag.pending && drag.touch && drag.target >= 0) sketches[drag.target].tapPull = !sketches[drag.target].tapPull;
      if (drag.active && drag.target >= 0) sketches[drag.target].user.lastInput = performance.now();
      drag.pending = false;
      drag.active = false;
      host.releasePointerCapture?.(e.pointerId);
      setCursor();
    };
    const onLeave = () => {
      pointer.onSection = false;
      pointer.over = -1;
      setCursor();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const viewObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    viewObserver.observe(canvas);
    document.addEventListener("visibilitychange", onVisibility);

    const prevTouchAction = host.style.touchAction;
    if (interactive && !still) {
      host.style.touchAction = "pan-y";
      host.addEventListener("pointermove", onMove, { passive: true });
      host.addEventListener("pointerdown", onDown);
      host.addEventListener("pointerup", onUp);
      host.addEventListener("pointercancel", onUp);
      host.addEventListener("pointerleave", onLeave);
    }

    resize();
    canvas.dataset.ready = "";
    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      viewObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointerup", onUp);
      host.removeEventListener("pointercancel", onUp);
      host.removeEventListener("pointerleave", onLeave);
      host.style.touchAction = prevTouchAction;
      host.style.cursor = "";
    };
  }, [models, runOnly, interactive, placement]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ "--sketch-dim": dim } as CSSProperties}
      className={`block h-full w-full opacity-0 transition-opacity duration-700 data-[ready]:opacity-[var(--sketch-dim)] ${className ?? ""}`}
    />
  );
}
