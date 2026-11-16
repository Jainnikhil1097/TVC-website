"use client";

import { useEffect, useRef } from "react";
import type { Model } from "./engine";
import { drawFrame, frameAt, type Layout, type View } from "./render";

const FRAME_MS = 1000 / 30;
const DRAG_RAD_PER_PX = 0.008;
const SETTLE_AFTER_MS = 5000;

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

/**
 * A mechanical blueprint sketch looping in the background: construction lines and
 * parts sketch in, the parts come together, the product runs, then it comes apart.
 *
 * Interactive (unless `interactive={false}`):
 *   - follows the cursor with a gentle tilt (fine pointers);
 *   - hovering the drawing pulls it apart and lights up the nearest part (a tap
 *     toggles this on touch screens);
 *   - drag to rotate, with inertia, settling back to the designed view when idle;
 *     on touch only horizontal drags rotate, so vertical swipes still scroll;
 *   - scrolling down past the hero takes the product apart.
 * Pointer listeners sit on the hero <section> (the canvas is behind the copy) and
 * ignore links and buttons, so the CTAs and nav always work.
 *
 * Same performance rules as the hero's other motion: ~30 fps, DPR capped at 2, paused
 * off-screen and in hidden tabs; reduced motion / Save-Data get one still frame and
 * no interaction.
 */
export function BlueprintSketch({
  model,
  runOnly = false,
  interactive = true,
  className,
}: {
  model: Model;
  runOnly?: boolean;
  interactive?: boolean;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const still =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const host = canvas.closest<HTMLElement>("section") ?? canvas;

    let width = 0;
    let height = 0;
    let layout: Layout = { cx: 0, cy: 0, scale: 1, px: 1, r: 0 };
    let raf = 0;
    let last = 0;
    let time = 0;
    let visible = true;
    let centres: ([number, number] | null)[] = [];

    // Interaction state (targets, and eased values actually drawn).
    const pointer = { x: 0, y: 0, inside: false, onSection: false };
    const tilt = { yaw: 0, pitch: 0 };
    const drag = { active: false, pending: false, startX: 0, startY: 0, lastX: 0, lastY: 0, vYaw: 0, vPitch: 0, touch: false };
    const user = { yaw: 0, pitch: 0, lastInput: 0 };
    let hoverPull = 0;
    let tapPull = false;
    let scrollPull = 0;
    let focus = -1;

    const view = (): View => ({
      yaw: user.yaw + tilt.yaw,
      pitch: user.pitch + tilt.pitch,
      pull: Math.max(hoverPull, scrollPull),
      focus,
    });

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      if (still) {
        drawFrame(ctx, model, layout, frameAt(model, 0, true));
        return;
      }
      centres = drawFrame(ctx, model, layout, frameAt(model, time, runOnly), interactive ? view() : undefined);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Desktop: right of the headline. Phones: the top half, above the copy.
      const desktop = width >= 1024;
      const fit = desktop ? Math.min(width * 0.5, height * 0.72) : Math.min(width * 0.92, height * 0.44);
      layout = {
        cx: desktop ? width * 0.68 : width * 0.5,
        cy: desktop ? height * 0.5 : height * 0.3,
        scale: fit / model.size,
        px: Math.max(0.55, Math.min(1, fit / 560)),
        r: fit * 0.62,
      };
      draw();
    };

    /** Ease the interaction values towards their targets once per frame. */
    const stepInteraction = (now: number) => {
      // Tilt toward the cursor while it's over the hero (not while dragging).
      const tx = pointer.onSection && finePointer && !drag.active ? clamp((pointer.x - layout.cx) / (layout.r * 2), -1, 1) : 0;
      const ty = pointer.onSection && finePointer && !drag.active ? clamp((pointer.y - layout.cy) / (layout.r * 2), -1, 1) : 0;
      tilt.yaw += (tx * 0.28 - tilt.yaw) * 0.08;
      tilt.pitch += (ty * 0.16 - tilt.pitch) * 0.08;

      // Drag inertia, then drift back to the designed view after a pause.
      if (!drag.active) {
        user.yaw += drag.vYaw;
        user.pitch = clamp(user.pitch + drag.vPitch, -0.6, 0.6);
        drag.vYaw *= 0.92;
        drag.vPitch *= 0.92;
        if (now - user.lastInput > SETTLE_AFTER_MS) {
          user.yaw *= 0.97;
          user.pitch *= 0.97;
        }
      }

      const wantPull = (pointer.inside && finePointer) || tapPull ? 0.7 : 0;
      hoverPull += (wantPull - hoverPull) * 0.07;
      const s = clamp(window.scrollY / (0.9 * window.innerHeight), 0, 1);
      scrollPull += (easeInOut(s) - scrollPull) * 0.15;

      // Part nearest the pointer, within the drawing.
      focus = -1;
      if (pointer.inside && finePointer) {
        let best = Infinity;
        centres.forEach((c, i) => {
          if (!c) return;
          const d = (c[0] - pointer.x) ** 2 + (c[1] - pointer.y) ** 2;
          if (d < best) {
            best = d;
            focus = i;
          }
        });
        if (best > (layout.r * 0.45) ** 2) focus = -1;
      }
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
    const inZone = (x: number, y: number) => (x - layout.cx) ** 2 + (y - layout.cy) ** 2 <= layout.r ** 2;
    const isControl = (e: Event) => e.target instanceof Element && Boolean(e.target.closest("a, button, input, textarea, select"));
    const setCursor = () => {
      host.style.cursor = drag.active ? "grabbing" : pointer.inside && finePointer ? "grab" : "";
    };

    const onMove = (e: PointerEvent) => {
      const [x, y] = local(e);
      pointer.x = x;
      pointer.y = y;
      pointer.onSection = true;
      pointer.inside = inZone(x, y) && !isControl(e);
      if (drag.pending || drag.active) {
        const dx = x - drag.lastX;
        const dy = y - drag.lastY;
        if (drag.pending) {
          const mx = x - drag.startX;
          const my = y - drag.startY;
          if (Math.hypot(mx, my) > 4) {
            // On touch, only a mostly-horizontal drag rotates; vertical swipes scroll.
            if (drag.touch && Math.abs(my) > Math.abs(mx)) {
              drag.pending = false;
            } else {
              drag.pending = false;
              drag.active = true;
              host.setPointerCapture?.(e.pointerId);
            }
          }
        }
        if (drag.active) {
          drag.vYaw = dx * DRAG_RAD_PER_PX;
          drag.vPitch = dy * DRAG_RAD_PER_PX * 0.6;
          user.yaw += drag.vYaw;
          user.pitch = clamp(user.pitch + drag.vPitch, -0.6, 0.6);
          user.lastInput = performance.now();
        }
        drag.lastX = x;
        drag.lastY = y;
      }
      setCursor();
    };
    const onDown = (e: PointerEvent) => {
      if (isControl(e) || (e.pointerType === "mouse" && e.button !== 0)) return;
      const [x, y] = local(e);
      if (!inZone(x, y)) return;
      drag.pending = true;
      drag.touch = e.pointerType !== "mouse";
      drag.startX = drag.lastX = x;
      drag.startY = drag.lastY = y;
      drag.vYaw = drag.vPitch = 0;
      if (!drag.touch) e.preventDefault(); // no text selection while dragging
    };
    const onUp = (e: PointerEvent) => {
      // A press without movement is a tap: on touch it toggles the pull-apart.
      if (drag.pending && drag.touch) tapPull = !tapPull;
      if (drag.active) user.lastInput = performance.now();
      drag.pending = false;
      drag.active = false;
      host.releasePointerCapture?.(e.pointerId);
      setCursor();
    };
    const onLeave = () => {
      pointer.onSection = false;
      pointer.inside = false;
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
  }, [model, runOnly, interactive]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`block h-full w-full opacity-0 transition-opacity duration-700 data-[ready]:opacity-100 ${className ?? ""}`}
    />
  );
}
