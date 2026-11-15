"use client";
/* eslint-disable react-hooks/immutability -- three.js objects (materials, groups) are
   created once and then mutated imperatively each frame inside useFrame, as R3F intends. */

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges, Line, PresentationControls } from "@react-three/drei";
import * as THREE from "three";
import { MODELS, type Model, type Part, type Vec3 } from "./models";
import type { ModelKey } from "./registry";

/*
 * The hero's engineering drawings: each model is drawn as a CAD-style hidden-line
 * render (navy solids, aqua edges) and plays one cycle — assemble, hold, explode,
 * label its parts, dissolve — then asks the hero for the next model.
 */

const AQUA = "#06e8d3";
const MINT = "#83f4e9";
const FILL = "#0d2347";
const FOV = 30;

// Timeline (seconds).
const ASSEMBLE = 1.2;
const EXPLODE_AT = 2.0;
const EXPLODE_FOR = 1.1;
const LABELS_IN = 3.0;
const LABELS_OUT = 6.2;
const DISSOLVE_AT = 6.5;
const DISSOLVE_FOR = 0.6;
export const CYCLE_S = DISSOLVE_AT + DISSOLVE_FOR;
const LAUNCH_FOR = 0.65;

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const add = (a: Vec3, b: Vec3, k = 1): Vec3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];

type PartRefs = { group: THREE.Group | null; edges: THREE.Mesh | null; leader: THREE.Mesh | null };

/** Where a part's leader line starts (anchor) and ends (tip), in the part's own space. */
function leader(part: Part) {
  const anchor = part.labelAt ?? [0, 0, 0];
  const dir = new THREE.Vector3(...(part.labelDir ?? [1, 1, 0])).normalize();
  const tip: Vec3 = [anchor[0] + dir.x * 0.42, anchor[1] + dir.y * 0.42, anchor[2] + dir.z * 0.42];
  return { anchor, tip, left: dir.x < 0 };
}

function PartView({ part, geometry, fill, ghost, refs }: { part: Part; geometry: THREE.BufferGeometry; fill: THREE.Material; ghost: THREE.Material; refs: PartRefs }) {
  const { anchor, tip } = leader(part);
  return (
    <group ref={(g) => void (refs.group = g)} position={part.at ?? [0, 0, 0]}>
      <mesh geometry={geometry} material={part.ghost ? ghost : fill} />
      <Edges
        ref={(e) => void (refs.edges = e)}
        geometry={geometry}
        threshold={15}
        lineWidth={1.25}
        color={AQUA}
        transparent
        opacity={part.ghost ? 0.35 : 1}
      />
      {part.label && (
        <Line
          ref={(l) => void (refs.leader = l as unknown as THREE.Mesh)}
          points={[anchor, tip]}
          color={MINT}
          lineWidth={1}
          transparent
          opacity={0}
        />
      )}
    </group>
  );
}

function ModelView({
  model,
  onCycle,
  launch,
  reduced,
  labelEls,
}: {
  /** The label elements (plain DOM over the canvas, one per part), positioned here each frame. */
  labelEls: RefObject<(HTMLDivElement | null)[]>;
  model: Model;
  onCycle: () => void;
  launch: boolean;
  reduced: boolean;
}) {
  const root = useRef<THREE.Group>(null);
  const { camera, size } = useThree();
  const start = useRef<number | null>(null);
  const launchAt = useRef<number | null>(null);
  const cycled = useRef(false);

  const geometries = useMemo(() => model.parts.map((p) => p.geometry()), [model]);
  const materials = useMemo(
    () => ({
      fill: new THREE.MeshBasicMaterial({
        color: FILL,
        transparent: true,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      }),
      ghost: new THREE.MeshBasicMaterial({ color: AQUA, transparent: true, opacity: 0.07, depthWrite: false }),
    }),
    []
  );
  const refs = useMemo(() => model.parts.map((): PartRefs => ({ group: null, edges: null, leader: null })), [model]);
  const tips = useMemo(() => model.parts.map(leader), [model]);
  const v = useMemo(() => new THREE.Vector3(), []);

  // Centre the exploded assembly on the origin.
  const centre = useMemo(() => {
    const bb = new THREE.Box3();
    geometries.forEach((g, i) => {
      g.computeBoundingBox();
      const p = model.parts[i];
      const off = new THREE.Vector3(...add(p.at ?? [0, 0, 0], p.explode));
      bb.union(g.boundingBox!.clone().translate(off));
    });
    return bb.getCenter(new THREE.Vector3());
  }, [geometries, model]);

  useEffect(() => {
    start.current = null;
    cycled.current = false;
  }, [model]);
  useEffect(() => {
    if (launch && launchAt.current === null) launchAt.current = -1; // stamped on the next frame
  }, [launch]);
  useEffect(
    () => () => {
      geometries.forEach((g) => g.dispose());
      materials.fill.dispose();
      materials.ghost.dispose();
    },
    [geometries, materials]
  );

  useFrame(({ clock }) => {
    const now = clock.elapsedTime;
    if (start.current === null) start.current = now;
    if (launchAt.current === -1) launchAt.current = now;
    // Reduced motion: hold the labelled, exploded view.
    const t = reduced ? LABELS_IN + 1 : now - start.current;

    let explode: number;
    if (t < ASSEMBLE) explode = 1.6 * (1 - easeOut(t / ASSEMBLE));
    else if (t < EXPLODE_AT) explode = 0;
    else explode = easeInOut(clamp01((t - EXPLODE_AT) / EXPLODE_FOR));
    const dissolve = reduced ? 0 : clamp01((t - DISSOLVE_AT) / DISSOLVE_FOR);
    explode += dissolve * 0.35;
    let opacity = clamp01(t / 0.5) * (1 - dissolve);
    // Narrow stages (phones) show no part labels, so no leader lines either.
    const narrow = size.width < 640;
    let labels = narrow ? 0 : clamp01((t - LABELS_IN) / 0.5) - (reduced ? 0 : clamp01((t - LABELS_OUT) / 0.35));

    // "Explore portfolio": fly fully apart and fade.
    if (launchAt.current !== null && launchAt.current >= 0) {
      const k = easeInOut(clamp01((now - launchAt.current) / LAUNCH_FOR));
      explode += k * 1.4;
      opacity *= 1 - k;
      labels *= 1 - k;
    }

    model.parts.forEach((p, i) => {
      const r = refs[i];
      if (r.group) r.group.position.set(...add(p.at ?? [0, 0, 0], p.explode, explode));
      const em = r.edges?.material as THREE.Material & { opacity: number } | undefined;
      if (em) em.opacity = opacity * (p.ghost ? 0.35 : 1);
      const lm = r.leader?.material as THREE.Material & { opacity: number } | undefined;
      if (lm) lm.opacity = labels * opacity * 0.9;
    });
    materials.fill.opacity = opacity;
    materials.ghost.opacity = 0.07 * opacity;

    if (root.current) {
      root.current.rotation.set(model.tilt, model.turn + (reduced ? 0 : Math.sin(now * 0.3) * 0.32), 0);
      root.current.position.set(-centre.x, -centre.y, -centre.z);
    }

    // Frame the exploded model for the stage's shape (smoothly, as models change).
    const tan = Math.tan(((FOV / 2) * Math.PI) / 180) * 2;
    const aspect = size.width / Math.max(size.height, 1);
    // Generous margin: the tilt, turn and perspective make the drawing wider on screen than its extents.
    // Without labels (narrow stages) the drawing can fill more of its space.
    const want = Math.max(model.fit[0] / (tan * aspect), model.fit[1] / tan) * (narrow ? 1.18 : 1.55);
    camera.position.z += (want - camera.position.z) * 0.08;
    // Desktop: sit the drawing a little high, clear of the company card that overlaps the
    // stage's lower right. (Phones/tablets have the card below the stage instead.)
    camera.position.y = window.innerWidth >= 1024 ? -0.065 * camera.position.z : 0;

    // Labels: plain DOM over the canvas, pinned to each leader's tip.
    camera.updateMatrixWorld();
    const labelOpacity = (labels * opacity).toFixed(2);
    model.parts.forEach((p, i) => {
      const el = labelEls.current?.[i];
      const g = refs[i].group;
      if (!el || !g || !p.label) return;
      if (el.style.opacity !== labelOpacity) el.style.opacity = labelOpacity;
      if (labels * opacity <= 0.001) return;
      g.updateWorldMatrix(true, false);
      v.set(...tips[i].tip);
      g.localToWorld(v).project(camera);
      const x = ((v.x + 1) / 2) * size.width;
      const y = ((1 - v.y) / 2) * size.height;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(${tips[i].left ? "calc(-100% - 6px)" : "6px"}, -50%)`;
    });

    if (!reduced && !cycled.current && t > CYCLE_S && launchAt.current === null) {
      cycled.current = true;
      onCycle();
    }
  });

  return (
    <group>
      <group ref={root}>
        {model.parts.map((p, i) => (
          <PartView key={i} part={p} geometry={geometries[i]} fill={materials.fill} ghost={materials.ghost} refs={refs[i]} />
        ))}
      </group>
    </group>
  );
}

export default function EngineeringCanvas({
  keys,
  index,
  onCycle,
  launch,
  onReady,
}: {
  /** Which models to show, in order (from the hero's company list). */
  keys: ModelKey[];
  index: number;
  onCycle: () => void;
  launch: boolean;
  onReady?: () => void;
}) {
  const [active, setActive] = useState(true);
  const wrapper = useRef<HTMLDivElement>(null);
  const labelEls = useRef<(HTMLDivElement | null)[]>([]);
  const coarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const model = MODELS[keys[index % keys.length]];

  // Pause rendering when the canvas is off-screen or the tab is hidden.
  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    let visible = true;
    const update = () => setActive(visible && document.visibilityState === "visible");
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  const scene = (
    <ModelView key={model.key} model={model} onCycle={onCycle} launch={launch} reduced={reduced} labelEls={labelEls} />
  );

  return (
    <div ref={wrapper} className="absolute inset-0">
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, coarse ? 1.5 : 2]}
        camera={{ position: [0, 0, 9], fov: FOV, near: 0.1, far: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={() => onReady?.()}
        aria-hidden
      >
        {coarse ? (
          scene
        ) : (
          <PresentationControls global={false} cursor snap speed={1.2} polar={[-0.25, 0.35]} azimuth={[-0.9, 0.9]}>
            {scene}
          </PresentationControls>
        )}
      </Canvas>
      {/* Part labels, positioned by ModelView each frame (hidden on phones) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden max-sm:hidden">
        {model.parts.map((p, i) =>
          p.label ? (
            <div
              key={`${model.key}-${i}`}
              ref={(el) => void (labelEls.current[i] = el)}
              className="hud absolute top-0 left-0 whitespace-nowrap text-teal-soft"
              style={{ opacity: 0 }}
            >
              {p.label}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
