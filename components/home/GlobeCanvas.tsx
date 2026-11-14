"use client";
/* eslint-disable react-hooks/immutability -- three.js objects (instanced meshes, materials)
   are created once and then mutated imperatively each frame inside useFrame, as R3F intends. */

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { asset } from "@/lib/base-path";

/*
 * "Transition sweep": a small, matte, tiled world turned toward India. A thin
 * scanning band orbits it; as the band crosses India, India's tiles rise and turn
 * teal, and little solar arrays and wind turbines grow out of the land, then stay.
 */

const DEG = Math.PI / 180;
// The camera looks at this point, so India (≈22°N 80°E) sits a little up-right of
// centre and its turbines are seen at an angle rather than straight down.
const VIEW_LAT = 12;
const VIEW_LON = 72;
// Where the dive ends: India's visual centre, facing the camera.
const INDIA_LAT = 22.5;
const INDIA_LON = 82.5;
const DIVE_ZOOM = 1.8; // India then fills most of the stage (the camera sits at z = 3.4)

// Sweep timing: the band's longitude moves east at a steady rate, starting west of India.
const SWEEP_START_LON = 52;
const SWEEP_DEG_PER_S = 13;
const SWEEP_DELAY = 0.9; // s after the globe appears
const TILE_RISE_S = 0.7;
const ASSET_GROW_S = 0.9;

const H_WORLD = 0.005;
const H_INDIA = 0.009;
const H_INDIA_ON = 0.022;
// Asset counts (halved-ish on phones). The posters in scripts/build-globe-points.mjs replay
// the same seeded picks with the desktop counts, so keep the two in sync.
const TURBINES = 14;
const SOLAR = 28;
const ASSET_SIZE = 1.5; // the models below are authored at 1×
const HUB = new THREE.Vector3(0, 0.071, -0.0045); // rotor hub, in a turbine's local frame

// Brand Book palette: navy ocean, cool Mist/Cloud land, India lit in Transition Aqua.
const CLAY = new THREE.Color("#dbe2ea");
const INDIA_IDLE = new THREE.Color("#e2e8ef");
const INDIA_ON = new THREE.Color("#06e8d3");

export type GlobeState = {
  /** Set by the hero: 0 at rest → 1 once the next section has covered it. */
  covered: number;
  /** "Explore portfolio" dive start, in performance.now() seconds (0 = not diving). */
  diveAt: number;
  /** Dive length in seconds (owned by the hero, which also times the navigation). */
  diveS: number;
};

type Points = { positions: Float32Array; india: Float32Array; globeCount: number; indiaCount: number };

async function loadPoints(decimate: number): Promise<Points> {
  const res = await fetch(asset("/globe/points.bin"));
  const buf = await res.arrayBuffer();
  const view = new DataView(buf);
  const globeTotal = view.getUint32(0, true);
  const indiaCount = view.getUint32(4, true);
  const coords = new Int16Array(buf, 8, (globeTotal + indiaCount) * 2);
  const globeCount = Math.ceil(globeTotal / decimate);
  const positions = new Float32Array(globeCount * 3);
  const india = new Float32Array(indiaCount * 3);
  const put = (out: Float32Array, n: number, i: number) => {
    const lat = (coords[i * 2] / 100) * DEG;
    const lon = (coords[i * 2 + 1] / 100) * DEG;
    out[n * 3] = Math.cos(lat) * Math.sin(lon);
    out[n * 3 + 1] = Math.sin(lat);
    out[n * 3 + 2] = Math.cos(lat) * Math.cos(lon);
  };
  let n = 0;
  for (let i = 0; i < globeTotal; i += decimate) put(positions, n++, i);
  for (let i = 0; i < indiaCount; i++) put(india, i, globeTotal + i);
  return { positions, india, globeCount, indiaCount };
}

/** Deterministic PRNG, so asset placement is identical on every load. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const backOut = (x: number) => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2);

const UP = new THREE.Vector3(0, 1, 0);
/** Rotation-only frame on the sphere at unit position n: columns east, up (= n), north. */
function surfaceBasis(n: THREE.Vector3, out: THREE.Matrix4) {
  const east = new THREE.Vector3().crossVectors(UP, n);
  if (east.lengthSq() < 1e-8) east.set(1, 0, 0);
  east.normalize();
  const north = new THREE.Vector3().crossVectors(east, n).negate();
  return out.makeBasis(east, n, north);
}

/** Seconds after the sweep starts at which the band reaches the point (x, z). */
const reachTime = (x: number, z: number) => (Math.atan2(x, z) / DEG - SWEEP_START_LON) / SWEEP_DEG_PER_S;

/** Keep assets off the Andaman & Nicobar and Lakshadweep islands (too small to carry them). */
function offMainland(p: THREE.Vector3) {
  const lat = Math.asin(p.y) / DEG;
  const lon = Math.atan2(p.x, p.z) / DEG;
  return (lat < 20 && lon > 91) || (lat < 13 && lon < 74.5);
}

type Asset = { pos: THREE.Vector3; basis: THREE.Matrix4; at: number; phase: number };

function pickAssets(india: Float32Array, count: number, minSepDeg: number, rand: () => number, taken: THREE.Vector3[]) {
  const n = india.length / 3;
  const out: Asset[] = [];
  const minDot = Math.cos(minSepDeg * DEG);
  for (let tries = 0; tries < count * 40 && out.length < count; tries++) {
    const i = Math.floor(rand() * n);
    const pos = new THREE.Vector3(india[i * 3], india[i * 3 + 1], india[i * 3 + 2]);
    if (offMainland(pos) || taken.some((p) => p.dot(pos) > minDot)) continue;
    taken.push(pos);
    out.push({
      pos,
      basis: surfaceBasis(pos, new THREE.Matrix4()),
      at: reachTime(pos.x, pos.z) + 0.15 + rand() * 0.25,
      phase: rand() * Math.PI * 2,
    });
  }
  return out;
}

function World({ points, state, small }: { points: Points; state: MutableRefObject<GlobeState>; small: boolean }) {
  const outer = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const band = useRef<THREE.Mesh>(null);
  const head = useRef<THREE.Group>(null);
  const clock = useRef({ start: -1, done: false });

  // Tile sizes follow each lattice's spacing (world ≈ 1° apart, India ≈ 0.42°).
  // ~29% of the Fibonacci samples are land, so the lattice spacing comes from the total.
  const worldR = Math.sqrt((4 * Math.PI) / (points.globeCount / 0.29)) * 0.68;
  const indiaR = 0.42 * DEG * 0.6;

  const geo = useMemo(() => {
    const hex = new THREE.CylinderGeometry(1, 1, 1, 6, 1);
    hex.translate(0, 0.5, 0);

    const tower = new THREE.CylinderGeometry(0.0012, 0.0022, 0.07, 6, 1);
    tower.translate(0, 0.035, 0);
    const nacelle = new THREE.BoxGeometry(0.004, 0.0035, 0.008);
    nacelle.translate(0, 0.071, 0);
    const towerGeo = mergeGeometries([tower.toNonIndexed(), nacelle.toNonIndexed()])!;

    // Three blades in the east–up plane, turning about the local north axis.
    const blades = [0, 1, 2].map((k) => {
      const b = new THREE.BoxGeometry(0.0032, 0.025, 0.0008);
      b.translate(0, 0.0125, 0);
      b.rotateZ((k * 2 * Math.PI) / 3);
      return b;
    });
    const rotorGeo = mergeGeometries(blades)!;

    const panel = new THREE.BoxGeometry(0.014, 0.0012, 0.009);
    panel.rotateX(-28 * DEG);
    panel.translate(0, 0.006, 0);
    const post = new THREE.CylinderGeometry(0.0006, 0.0006, 0.006, 4);
    post.translate(0, 0.003, 0);
    const panelGeo = mergeGeometries([panel.toNonIndexed(), post.toNonIndexed()])!;

    return { hex, towerGeo, rotorGeo, panelGeo };
  }, []);

  const mats = useMemo(
    () => ({
      ocean: new THREE.MeshStandardMaterial({ color: "#163b6e", roughness: 0.7 }),
      land: new THREE.MeshStandardMaterial({ color: CLAY, roughness: 0.92 }),
      india: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.75 }),
      turbine: new THREE.MeshStandardMaterial({ color: "#f5f7fa", roughness: 0.5 }),
      panel: new THREE.MeshStandardMaterial({ color: "#1c3f73", roughness: 0.35 }),
      band: new THREE.MeshBasicMaterial({
        color: "#06e8d3",
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    }),
    []
  );

  const glow = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(220,255,251,1)");
    grd.addColorStop(0.25, "rgba(6,232,211,0.55)");
    grd.addColorStop(1, "rgba(6,232,211,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    const map = new THREE.CanvasTexture(c);
    return new THREE.SpriteMaterial({ map, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
  }, []);

  const assets = useMemo(() => {
    const rand = mulberry32(2047);
    const taken: THREE.Vector3[] = [];
    const turbines = pickAssets(points.india, small ? 10 : TURBINES, 2.6, rand, taken);
    const solar = pickAssets(points.india, small ? 16 : SOLAR, 1.5, rand, taken);
    return { turbines, solar };
  }, [points, small]);

  // India tile activation times, in seconds after the sweep starts.
  const indiaAt = useMemo(() => {
    const out = new Float32Array(points.indiaCount);
    for (let i = 0; i < points.indiaCount; i++) out[i] = reachTime(points.india[i * 3], points.india[i * 3 + 2]);
    return out;
  }, [points]);
  const indiaDone = useMemo(() => new Uint8Array(points.indiaCount), [points]);

  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), s: new THREE.Matrix4(), v: new THREE.Vector3(), c: new THREE.Color() }), []);

  // Static world tiles: built once.
  const worldMesh = useMemo(() => {
    const { m, s, v } = tmp;
    const mesh = new THREE.InstancedMesh(geo.hex, mats.land, points.globeCount);
    for (let i = 0; i < points.globeCount; i++) {
      v.set(points.positions[i * 3], points.positions[i * 3 + 1], points.positions[i * 3 + 2]);
      surfaceBasis(v, m).multiply(s.makeScale(worldR, H_WORLD, worldR));
      m.setPosition(v.multiplyScalar(0.998));
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
  }, [geo, mats, points, worldR, tmp]);

  function writeIndiaTile(mesh: THREE.InstancedMesh, i: number, k: number) {
    const { m, s, v, c } = tmp;
    v.set(points.india[i * 3], points.india[i * 3 + 1], points.india[i * 3 + 2]);
    surfaceBasis(v, m).multiply(s.makeScale(indiaR, H_INDIA + (H_INDIA_ON - H_INDIA) * k, indiaR));
    m.setPosition(v.multiplyScalar(0.998));
    mesh.setMatrixAt(i, m);
    mesh.setColorAt(i, c.copy(INDIA_IDLE).lerp(INDIA_ON, k));
  }

  /** translate(onto raised India) · basis · [hub offset · spin] · scale */
  function writeAsset(mesh: THREE.InstancedMesh, i: number, a: Asset, scale: number, spinAngle?: number) {
    const { m, s, v } = tmp;
    m.makeTranslation(v.copy(a.pos).multiplyScalar(0.998 + H_INDIA_ON - 0.001)).multiply(a.basis);
    if (spinAngle !== undefined) {
      m.multiply(s.makeTranslation(v.copy(HUB).multiplyScalar(scale * ASSET_SIZE)));
      m.multiply(s.makeRotationZ(spinAngle));
    }
    const k = scale * ASSET_SIZE;
    m.multiply(s.makeScale(k, k, k));
    mesh.setMatrixAt(i, m);
  }

  // India tiles (coloured per instance) and the asset meshes, in their pre-sweep state.
  // Built eagerly so instance colours exist before the material first compiles.
  const meshes = useMemo(() => {
    const india = new THREE.InstancedMesh(geo.hex, mats.india, points.indiaCount);
    for (let i = 0; i < points.indiaCount; i++) writeIndiaTile(india, i, 0);
    const towers = new THREE.InstancedMesh(geo.towerGeo, mats.turbine, assets.turbines.length);
    const rotors = new THREE.InstancedMesh(geo.rotorGeo, mats.turbine, assets.turbines.length);
    const panels = new THREE.InstancedMesh(geo.panelGeo, mats.panel, assets.solar.length);
    assets.turbines.forEach((a, i) => {
      writeAsset(towers, i, a, 0.0001);
      writeAsset(rotors, i, a, 0.0001, 0);
    });
    assets.solar.forEach((a, i) => writeAsset(panels, i, a, 0.0001));
    for (const mesh of [india, towers, rotors, panels]) mesh.frustumCulled = false;
    return { india, towers, rotors, panels };
    // writeIndiaTile/writeAsset only read memoised values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo, mats, points, assets]);

  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((x) => x.dispose());
      glow.map?.dispose();
      glow.dispose();
      worldMesh.dispose();
      Object.values(meshes).forEach((x) => x.dispose());
    },
    [geo, mats, glow, worldMesh, meshes]
  );

  useFrame(({ clock: c }) => {
    const now = c.getElapsedTime();
    if (clock.current.start < 0) clock.current.start = now;
    const t = now - clock.current.start; // since the globe appeared
    const ts = t - SWEEP_DELAY; // since the sweep started

    // Intro: the globe settles in (scale and a small turn) over the first second.
    const intro = easeOut(clamp01(t / 1.1));
    // Dive: turn to India and zoom in (driven by the hero's "Explore portfolio").
    const { diveAt, diveS } = state.current;
    const dive = diveAt ? easeInOut(clamp01((performance.now() / 1000 - diveAt) / diveS)) : 0;
    if (outer.current) {
      outer.current.scale.setScalar((0.94 + 0.06 * intro) * lerp(1, DIVE_ZOOM, dive));
      outer.current.rotation.x = lerp(VIEW_LAT, INDIA_LAT, dive) * DEG;
    }
    if (spin.current) {
      const rest = -VIEW_LON * DEG + Math.sin(now / 9) * 0.12 - (1 - intro) * 0.25;
      spin.current.rotation.y = lerp(rest, -INDIA_LON * DEG, dive);
    }

    // Band: a meridian ring whose longitude advances steadily, and keeps orbiting.
    const bandLon = (SWEEP_START_LON + Math.max(ts, 0) * SWEEP_DEG_PER_S) * DEG;
    if (band.current) {
      band.current.rotation.y = bandLon - Math.PI / 2;
      mats.band.opacity = 0.8 * clamp01(ts / 0.4 + 1) * (1 - state.current.covered) * (1 - dive);
    }
    if (head.current) {
      const lat = 21 * DEG;
      head.current.position
        .set(Math.cos(lat) * Math.sin(bandLon), Math.sin(lat), Math.cos(lat) * Math.cos(bandLon))
        .multiplyScalar(1.035);
      head.current.visible = ts > -0.4 && dive < 0.6;
    }

    const ro = meshes.rotors;
    if (clock.current.done) {
      // After the first pass only the rotors move.
      {
        assets.turbines.forEach((a, i) => writeAsset(ro, i, a, 1, now * 2.2 + a.phase));
        ro.instanceMatrix.needsUpdate = true;
      }
      return;
    }

    // Diving early? Run the rest of the sweep quickly so India is lit on arrival.
    const tsA = ts + dive * 6;

    // First pass: raise and colour India's tiles as the band reaches them.
    let pending = tsA < 0;
    const im = meshes.india;
    if (tsA >= 0) {
      let touched = false;
      for (let i = 0; i < points.indiaCount; i++) {
        if (indiaDone[i]) continue;
        const dt = tsA - indiaAt[i];
        if (dt < 0) {
          pending = true;
          continue;
        }
        // Always finish a tile, even if frames were skipped (slow device, paused off-screen).
        const k = clamp01(dt / TILE_RISE_S);
        writeIndiaTile(im, i, easeOut(k));
        touched = true;
        if (k < 1) pending = true;
        else indiaDone[i] = 1;
      }
      if (touched) {
        im.instanceMatrix.needsUpdate = true;
        im.instanceColor!.needsUpdate = true;
      }
    }

    // Assets grow in with a little overshoot.
    const grow = (a: Asset) => {
      const k = clamp01((tsA - a.at) / ASSET_GROW_S);
      if (k < 1) pending = true;
      return Math.max(backOut(k), 0.0001);
    };
    const tw = meshes.towers;
    const pa = meshes.panels;
    {
      assets.turbines.forEach((a, i) => {
        const g = grow(a);
        writeAsset(tw, i, a, g);
        writeAsset(ro, i, a, g, now * 2.2 + a.phase);
      });
      tw.instanceMatrix.needsUpdate = true;
      ro.instanceMatrix.needsUpdate = true;
    }
    {
      assets.solar.forEach((a, i) => writeAsset(pa, i, a, grow(a)));
      pa.instanceMatrix.needsUpdate = true;
    }
    if (!pending) clock.current.done = true;
  });

  return (
    <>
      <ambientLight intensity={0.45} />
      <hemisphereLight args={["#ffffff", "#1d3a66", 0.7]} />
      <directionalLight position={[-3, 3.5, 4]} intensity={2.4} color="#fff6ea" />
      <directionalLight position={[3.5, -1.5, -2]} intensity={0.9} color="#06e8d3" />
      <group ref={outer}>
        <group ref={spin}>
          <mesh material={mats.ocean}>
            <sphereGeometry args={[1, 64, 64]} />
          </mesh>
          <primitive object={worldMesh} />
          <primitive object={meshes.india} />
          <primitive object={meshes.towers} />
          <primitive object={meshes.rotors} />
          <primitive object={meshes.panels} />
          <mesh ref={band} material={mats.band}>
            <torusGeometry args={[1.035, 0.0022, 6, 180]} />
          </mesh>
          <group ref={head}>
            <sprite material={glow} scale={0.12} />
            <mesh>
              <sphereGeometry args={[0.008, 12, 12]} />
              <meshBasicMaterial color="#e9fffb" />
            </mesh>
          </group>
        </group>
      </group>
    </>
  );
}

/** The tiled globe, framed to fill its (square) parent: the sphere spans ≈85% of the box. */
export default function GlobeCanvas({
  state,
  onReady,
}: {
  state: MutableRefObject<GlobeState>;
  onReady?: () => void;
}) {
  const [points, setPoints] = useState<Points | null>(null);
  const [active, setActive] = useState(true);
  const wrapper = useRef<HTMLDivElement>(null);
  const coarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  useEffect(() => {
    let cancelled = false;
    loadPoints(coarse ? 2 : 1).then((p) => !cancelled && setPoints(p));
    return () => {
      cancelled = true;
    };
  }, [coarse]);

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

  return (
    <div ref={wrapper} className="absolute inset-0">
      {points && (
        <Canvas
          frameloop={active ? "always" : "never"}
          dpr={[1, coarse ? 1.5 : 2]}
          camera={{ position: [0, 0, 3.4], fov: 40, near: 0.1, far: 20 }}
          flat
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          onCreated={() => onReady?.()}
          aria-hidden
        >
          <World points={points} state={state} small={coarse} />
        </Canvas>
      )}
    </div>
  );
}
