"use client";

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { asset } from "@/lib/base-path";

// India's centroid (approx). The globe is oriented so this faces the camera.
const INDIA_LAT = 22;
const INDIA_LON = 80;
// Where to aim at the end of the zoom so India's full outline (incl. the
// northeast) is centred on screen — measured by projecting India's dots.
const INDIA_FRAME_LON = 82.5;
const INDIA_FRAME_LAT = 22.5;
const DEG = Math.PI / 180;

// Zoom gain by screen aspect (width / height) that fits India to ~85% of the
// limiting side; measured, then interpolated. Beyond square, height limits it.
const ZOOM_BY_ASPECT: [number, number][] = [
  [0.4, 0.22],
  [0.46, 0.34],
  [0.56, 0.5],
  [0.69, 0.69],
  [0.8, 0.81],
  [1, 0.9],
];
function zoomGainFor(aspect: number) {
  if (aspect <= ZOOM_BY_ASPECT[0][0]) return ZOOM_BY_ASPECT[0][1];
  for (let i = 1; i < ZOOM_BY_ASPECT.length; i++) {
    const [a1, g1] = ZOOM_BY_ASPECT[i];
    if (aspect <= a1) {
      const [a0, g0] = ZOOM_BY_ASPECT[i - 1];
      return g0 + ((aspect - a0) / (a1 - a0)) * (g1 - g0);
    }
  }
  return ZOOM_BY_ASPECT[ZOOM_BY_ASPECT.length - 1][1];
}

export type GlobeState = {
  /** 0 → hero, 0.5 → globe beside the About text, 1 → zoomed into India. */
  progress: number;
  /** Horizontal offset of the "about" framing in world units (smaller on narrow screens). */
  sideOffset: number;
};

type Points = { positions: Float32Array; india: Float32Array; seeds: Float32Array };

async function loadPoints(decimate: number): Promise<Points> {
  const res = await fetch(asset("/globe/points.bin"));
  const buf = await res.arrayBuffer();
  const view = new DataView(buf);
  const globeCount = view.getUint32(0, true);
  const indiaCount = view.getUint32(4, true);
  const coords = new Int16Array(buf, 8, (globeCount + indiaCount) * 2);

  const keptGlobe = Math.ceil(globeCount / decimate);
  const total = keptGlobe + indiaCount;
  const positions = new Float32Array(total * 3);
  const india = new Float32Array(total);
  const seeds = new Float32Array(total);

  let n = 0;
  const push = (i: number, isIndia: boolean) => {
    const lat = (coords[i * 2] / 100) * DEG;
    const lon = (coords[i * 2 + 1] / 100) * DEG;
    positions[n * 3] = Math.cos(lat) * Math.sin(lon);
    positions[n * 3 + 1] = Math.sin(lat);
    positions[n * 3 + 2] = Math.cos(lat) * Math.cos(lon);
    india[n] = isIndia ? 1 : 0;
    seeds[n] = Math.random();
    n++;
  };
  for (let i = 0; i < globeCount; i += decimate) push(i, false);
  for (let i = globeCount; i < globeCount + indiaCount; i++) push(i, true);
  return { positions, india, seeds };
}

const dotVertex = /* glsl */ `
  attribute float aIndia;
  attribute float aSeed;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uTime;
  uniform float uGlow;
  varying float vFacing;
  varying float vIndia;
  varying float vTwinkle;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec3 n = normalize(mat3(modelMatrix) * position);
    vec3 toCam = normalize(cameraPosition - world.xyz);
    vFacing = dot(n, toCam);
    vIndia = aIndia;
    vTwinkle = 0.75 + 0.25 * sin(uTime * (0.6 + aSeed) + aSeed * 40.0);
    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    float size = uSize * (1.0 + aIndia * (0.15 + 0.35 * uGlow));
    gl_PointSize = size * uPixelRatio * (3.2 / -mv.z);
  }
`;

const dotFragment = /* glsl */ `
  uniform float uGlow;
  varying float vFacing;
  varying float vIndia;
  varying float vTwinkle;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float edge = smoothstep(0.5, 0.22, d);
    // Fade dots toward the limb and hide the far side.
    float facing = smoothstep(-0.05, 0.35, vFacing);
    vec3 land = vec3(0.78, 0.82, 0.88);
    vec3 teal = vec3(0.055, 0.835, 0.761);
    vec3 col = mix(land, teal, vIndia);
    float alpha = mix(0.42, 0.95 * mix(1.0, vTwinkle, uGlow), vIndia) * edge * facing;
    // Warm "city lights" core on India as we zoom in.
    col = mix(col, vec3(0.75, 1.0, 0.95), vIndia * uGlow * (1.0 - d * 2.0) * 0.6);
    gl_FragColor = vec4(col, alpha);
  }
`;

const atmosphereVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vNormal = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - world.xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const atmosphereFragment = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float rim = pow(1.0 - max(dot(vNormal, vView), 0.0), 3.0);
    gl_FragColor = vec4(0.055, 0.835, 0.761, rim * 0.55);
  }
`;

function smooth(t: number) {
  const x = Math.min(Math.max(t, 0), 1);
  return x * x * (3 - 2 * x);
}

function Globe({ points, state }: { points: Points; state: MutableRefObject<GlobeState> }) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const dots = useRef<THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>>(null);
  const { camera, size, gl } = useThree();

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(points.positions, 3));
    g.setAttribute("aIndia", new THREE.BufferAttribute(points.india, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(points.seeds, 1));
    return g;
  }, [points]);

  const dotMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: dotVertex,
        fragmentShader: dotFragment,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uSize: { value: 2.2 },
          uPixelRatio: { value: gl.getPixelRatio() },
          uTime: { value: 0 },
          uGlow: { value: 0 },
        },
      }),
    [gl]
  );

  const atmosphereMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: atmosphereVertex,
        fragmentShader: atmosphereFragment,
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useEffect(
    () => () => {
      geometry.dispose();
      dotMaterial.dispose();
      atmosphereMaterial.dispose();
    },
    [geometry, dotMaterial, atmosphereMaterial]
  );

  useFrame((_, delta) => {
    const g = group.current;
    const s = spin.current;
    if (!g || !s) return;
    const p = state.current.progress;
    const toSide = smooth(p / 0.5); // hero → beside text
    const toIndia = smooth((p - 0.5) / 0.5); // beside text → zoom into India

    const aspect = size.width / size.height;
    const heroScale = aspect < 1 ? 1.05 : 1.35;

    // Position: rise from the bottom to the centre, then zoom.
    const x = THREE.MathUtils.lerp(0, state.current.sideOffset, toSide) * (1 - toIndia);
    const y = THREE.MathUtils.lerp(-1.55 * heroScale, 0, toSide);
    g.position.set(x, y, 0);
    // Zoom so the whole of India ends up filling ~85% of the screen's limiting
    // side, whatever its shape (gentle on portrait phones, deeper on wide screens).
    g.scale.setScalar(THREE.MathUtils.lerp(heroScale, 1, toSide) * (1 + toIndia * zoomGainFor(aspect)));

    // Gentle drift in the hero (visible on phones too, ~±12° over ~45s); during the
    // zoom it settles on India's visual centre so the country sits mid-screen.
    const drift = Math.sin(performance.now() / 7000) * 0.22 * (1 - toIndia);
    s.rotation.y = -THREE.MathUtils.lerp(INDIA_LON, INDIA_FRAME_LON, toIndia) * DEG + drift;
    g.rotation.x =
      THREE.MathUtils.lerp(INDIA_LAT * (0.35 + 0.65 * toSide), INDIA_FRAME_LAT, toIndia) * DEG;

    const uniforms = dots.current?.material.uniforms;
    if (uniforms) {
      uniforms.uTime.value += delta;
      uniforms.uGlow.value = toIndia;
    }
    camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={group}>
      <group ref={spin}>
        {/* Dark core hides the far hemisphere's dots. */}
        <mesh>
          <sphereGeometry args={[0.985, 48, 48]} />
          <meshBasicMaterial color="#0a0e14" />
        </mesh>
        <points ref={dots} geometry={geometry} material={dotMaterial} />
      </group>
      <mesh scale={1.12} material={atmosphereMaterial}>
        <sphereGeometry args={[1, 48, 48]} />
      </mesh>
    </group>
  );
}

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
          gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
          onCreated={() => onReady?.()}
          aria-hidden
        >
          <Globe points={points} state={state} />
        </Canvas>
      )}
    </div>
  );
}
