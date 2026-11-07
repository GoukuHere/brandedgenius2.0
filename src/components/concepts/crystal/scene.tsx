"use client";

import { Environment, Lightformer, MeshTransmissionMaterial } from "@react-three/drei";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { band, clamp01, damp, listenPointer, mix, pinProgress, pointer, sectionWeights } from "./track";

/*
  v8 "Kristall": the stage. The client's bG monogram, cut from crystal glass with its chrome eye, floats in a cool
  white studio and travels with the reading:
  - hero: large on the right, turning slowly; its eye (the blue pupil) follows the mouse.
  - film: it turns to face you in the middle of the screen, and the founder's film opens out of its eye (the page's
    film frame is clipped to a circle that starts as the eye's black disk and grows until the frame is open).
  - problem: small on the left, and the glass clouds over as each of the six problems is read.
  - services: clear again, on the right; it turns to a new angle for each of the four services and the light
    inside it changes colour with each one.
  - cases: on the left, its eye looking at the result the reader is on.
  - cta: on the right, turning, the light inside at its brightest.
  The glass refracts a painted backdrop of soft royal and sky bands (MeshTransmissionMaterial's own background), so
  the brand's gradient lives inside the crystal while the page itself stays white.
*/

const SCENES = ["hero", "film", "problem", "services", "cases", "cta"] as const;
type SceneName = (typeof SCENES)[number];

type Pose = { fx: number; fy: number; fw: number; rx: number; ry: number; rz: number; frost: number; light: number };

// fx/fy: where the monogram's centre sits on screen (0 to 1); fw: its width as a share of the screen's width.
const DESK: Record<SceneName, Pose> = {
  hero: { fx: 0.72, fy: 0.385, fw: 0.44, rx: 0.1, ry: -0.42, rz: 0.04, frost: 0, light: 0 },
  film: { fx: 0.5, fy: 0.5, fw: 0.42, rx: 0, ry: 0, rz: 0, frost: 0, light: 0 },
  problem: { fx: 0.25, fy: 0.72, fw: 0.27, rx: 0.3, ry: 0.62, rz: -0.14, frost: 0.4, light: 0 },
  services: { fx: 0.71, fy: 0.55, fw: 0.38, rx: 0.08, ry: -0.3, rz: 0.03, frost: 0, light: 1 },
  cases: { fx: 0.24, fy: 0.73, fw: 0.26, rx: 0.02, ry: 0.32, rz: 0, frost: 0, light: 1 },
  cta: { fx: 0.71, fy: 0.45, fw: 0.38, rx: 0.12, ry: -0.42, rz: 0.04, frost: 0, light: 1 },
};
// On phones the crystal sits in the band each section keeps free for it, and leaves the reading sections. Its
// services pose starts with the held stage (not the section's heading), and at the close it rides with the section
// (fy measured from the section's top), so it never sits on the reading.
const PHONE: Record<SceneName, Pose> = {
  hero: { fx: 0.5, fy: 0.29, fw: 0.84, rx: 0.12, ry: -0.36, rz: 0.04, frost: 0, light: 0 },
  film: { fx: 0.5, fy: 0.5, fw: 0.8, rx: 0, ry: 0, rz: 0, frost: 0, light: 0 },
  problem: { fx: 1.45, fy: 0.3, fw: 0.6, rx: 0.3, ry: 0.9, rz: -0.2, frost: 0.4, light: 0 },
  services: { fx: 0.5, fy: 0.25, fw: 0.68, rx: 0.08, ry: -0.3, rz: 0.03, frost: 0, light: 1 },
  cases: { fx: -0.5, fy: 0.3, fw: 0.6, rx: 0, ry: -0.9, rz: 0, frost: 0, light: 1 },
  cta: { fx: 0.5, fy: 0.25, fw: 0.78, rx: 0.12, ry: -0.42, rz: 0.04, frost: 0, light: 1 },
};
const KEYS = Object.keys(DESK.hero) as (keyof Pose)[];
const blendPose = (a: Pose, b: Pose, t: number): Pose => {
  const out = { ...a };
  for (const k of KEYS) out[k] = mix(a[k], b[k], t);
  return out;
};

/* The mark (public/brand/mark.svg): viewBox 208 244 721 454; the eye's centre and radii in its units. */
const MARK = { w: 721, cx: 208 + 721 / 2, cy: 244 + 454 / 2 };
const EYE = { x: 406.22, y: 500.09, disk: 27.2, pupil: 14.17 };
const WIDTH = 4; // the monogram's width in world units at scale 1
const S = WIDTH / MARK.w;
const EYE_LOCAL = new THREE.Vector3((EYE.x - MARK.cx) * S, -(EYE.y - MARK.cy) * S, 0);
const DISK_FRONT = (22 + 3) * S; // the black disk's front face (half its depth plus its bevel)
const PUPIL_TRAVEL = 9.5 * S; // how far the pupil may move inside the disk

type Mono = { glass: THREE.BufferGeometry; ring: THREE.BufferGeometry; disk: THREE.BufferGeometry; pupil: THREE.BufferGeometry };

function useMonogram(): Mono {
  const svg = useLoader(SVGLoader, "/brand/mark.svg");
  return useMemo(() => {
    // Document order: the silver ring, the b-and-G ribbon, the b's top flap, the black disk, the blue pupil.
    const [ring, ribbon, flap, disk, pupil] = svg.paths;
    // Centre the mark, scale it, and flip y (SVG runs downwards); z flips too, so the faces keep their winding.
    const toWorld = new THREE.Matrix4().makeScale(S, -S, -S).multiply(new THREE.Matrix4().makeTranslation(-MARK.cx, -MARK.cy, 0));
    const extrude = (path: (typeof svg.paths)[number], depth: number, bevel: number) => {
      const g = new THREE.ExtrudeGeometry(SVGLoader.createShapes(path), {
        depth,
        curveSegments: 56,
        bevelEnabled: true,
        bevelThickness: bevel,
        bevelSize: bevel * 0.6,
        bevelOffset: -bevel * 0.3,
        bevelSegments: 8,
      });
      g.translate(0, 0, -depth / 2);
      g.applyMatrix4(toWorld);
      return g;
    };
    const glass = mergeGeometries([extrude(ribbon, 64, 10), extrude(flap, 64, 10)]);
    const pupilGeo = extrude(pupil, 50, 3);
    // The pupil is built around its own centre, so it can look around inside the disk.
    pupilGeo.translate(-EYE_LOCAL.x, -EYE_LOCAL.y, 0);
    return { glass, ring: extrude(ring, 40, 5), disk: extrude(disk, 44, 3), pupil: pupilGeo };
  }, [svg]);
}

/* The light the glass refracts: soft bands on a pale ground, repainted as they drift; one palette per moment. */
type Palette = { base: THREE.Color; a: THREE.Color; b: THREE.Color };
const pal = (base: string, a: string, b: string): Palette => ({ base: new THREE.Color(base), a: new THREE.Color(a), b: new THREE.Color(b) });
const HERO_LIGHT = pal("#f2f7fd", "#004ba0", "#3f9cf0");
const FROST_LIGHT = pal("#eef1f5", "#8ea2b8", "#c3cfdc");
const SERVICE_LIGHT = [
  pal("#f0f6fd", "#004ba0", "#2f8be6"),
  pal("#f1f8ff", "#69bff8", "#1f74d6"),
  pal("#eef4fb", "#0a3a80", "#4aa3f0"),
  pal("#f2f8ff", "#1563d6", "#8fd0ff"),
];
const mixPalette = (out: Palette, a: Palette, b: Palette, t: number) => {
  out.base.copy(a.base).lerp(b.base, t);
  out.a.copy(a.a).lerp(b.a, t);
  out.b.copy(a.b).lerp(b.b, t);
};
const css = (c: THREE.Color, alpha: number) => `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${alpha})`;

/* Per-frame scratch state lives outside the component (there is one stage per page), so the frame loop can update
   it freely. The backdrop canvas is made on first use, in the browser. */
type Backdrop = { ctx: CanvasRenderingContext2D; texture: THREE.CanvasTexture };
let backdropCache: Backdrop | null = null;
function getBackdrop(): Backdrop {
  if (!backdropCache) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    backdropCache = { ctx: canvas.getContext("2d")!, texture };
  }
  return backdropCache;
}
const scratch = {
  light: pal("#fff", "#fff", "#fff"),
  target: pal("#fff", "#fff", "#fff"),
  a: new THREE.Vector3(),
  b: new THREE.Vector3(),
  clip: "",
  frame: 0,
  look: { x: 0, y: 0 },
};

const BANDS = [
  { at: 0.0, w: 30, tone: "a" },
  { at: 0.19, w: 7, tone: "b" },
  { at: 0.43, w: 46, tone: "b" },
  { at: 0.66, w: 11, tone: "a" },
  { at: 0.83, w: 20, tone: "b" },
] as const;
const LINES = [0.07, 0.11, 0.31, 0.36, 0.555, 0.6, 0.79, 0.9];

function paintBackdrop(ctx: CanvasRenderingContext2D, t: number, p: Palette) {
  const W = 256;
  ctx.fillStyle = css(p.base, 1);
  ctx.fillRect(0, 0, W, W);
  ctx.save();
  ctx.translate(W / 2, W / 2);
  ctx.rotate(-0.62);
  for (const band of BANDS) {
    const x = (((band.at + t * 0.012) % 1) - 0.5) * W * 2;
    const c = band.tone === "a" ? p.a : p.b;
    const g = ctx.createLinearGradient(x - band.w, 0, x + band.w, 0);
    g.addColorStop(0, css(c, 0));
    g.addColorStop(0.5, css(c, 0.92));
    g.addColorStop(1, css(c, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - band.w, -W, band.w * 2, W * 2);
  }
  // Fine lines across the light, like the rulings of a light table: the glass bends them, which is how glass reads.
  for (const at of LINES) {
    const x = (((at + t * 0.012) % 1) - 0.5) * W * 2;
    ctx.fillStyle = css(p.a, 0.55);
    ctx.fillRect(x - 0.6, -W, 1.2, W * 2);
  }
  // One thin white streak, the studio's light passing through.
  const sx = (((0.62 + t * 0.02) % 1) - 0.5) * W * 2;
  const s = ctx.createLinearGradient(sx - 10, 0, sx + 10, 0);
  s.addColorStop(0, "rgba(255,255,255,0)");
  s.addColorStop(0.5, "rgba(255,255,255,0.95)");
  s.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = s;
  ctx.fillRect(sx - 10, -W, 20, W * 2);
  ctx.restore();
}

/** The transmission material's own uniforms, set every frame (drei exposes them as properties). */
type GlassMaterial = THREE.MeshPhysicalMaterial & { distortion: number; chromaticAberration: number; anisotropicBlur: number; temporalDistortion: number };

/* The ring's face in the logo's own silver (its gradient: grey, white, grey, white, grey across the ring). The
   extruded caps take their UVs from the mark's own coordinates, so the stripes are placed by the ring's x span. */
function silverStripes() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 4;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 256, 0);
  [
    ["#8e9196", 0],
    ["#ffffff", 0.25],
    ["#8e9196", 0.5],
    ["#ffffff", 0.76],
    ["#8e9196", 1],
  ].forEach(([c, o]) => g.addColorStop(o as number, c as string));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 4);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const x0 = 325.03;
  const x1 = 486.41;
  tex.repeat.set(1 / (x1 - x0), 1);
  tex.offset.set(-x0 / (x1 - x0), 0);
  return tex;
}

type Dom = { sections: HTMLElement[]; film: HTMLElement | null; steps: HTMLElement | null; problems: HTMLElement[]; rows: HTMLElement[] };

function Crystal({ reduced }: { reduced: boolean }) {
  const mono = useMonogram();
  const group = useRef<THREE.Group>(null);
  const pupil = useRef<THREE.Mesh>(null);
  const glass = useRef<GlassMaterial | null>(null);
  const frostShell = useRef<THREE.MeshStandardMaterial>(null);
  const { camera, size } = useThree();
  const dom = useRef<Dom | null>(null);
  const cur = useRef<Pose>({ ...DESK.hero });

  const materials = useMemo(
    () => ({
      chrome: new THREE.MeshStandardMaterial({ map: silverStripes(), metalness: 0.35, roughness: 0.3 }),
      ink: new THREE.MeshPhysicalMaterial({ color: "#05080e", roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05 }),
      iris: new THREE.MeshPhysicalMaterial({
        color: "#1167dc",
        emissive: "#0b58cf",
        emissiveIntensity: 0.5,
        roughness: 0.16,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
      }),
    }),
    [],
  );

  useEffect(() => {
    listenPointer();
    const q = (s: string) => [...document.querySelectorAll<HTMLElement>(s)];
    dom.current = {
      sections: SCENES.map((name) => document.querySelector<HTMLElement>(`[data-k8="${name}"]`)).filter((el): el is HTMLElement => !!el),
      film: document.querySelector<HTMLElement>("[data-k8-film]"),
      steps: document.querySelector<HTMLElement>("[data-k8-steps]"),
      problems: q("[data-k8-problem]"),
      rows: q("[data-k8-row]"),
    };
  }, []);

  useFrame((state, dt) => {
    const d = dom.current;
    const g = group.current;
    if (!d || !g || d.sections.length !== SCENES.length) return;
    const vh = window.innerHeight;
    const phone = size.width < 768;
    const table = phone ? PHONE : DESK;
    const t = reduced ? 0 : state.clock.elapsedTime;

    // Moments that change inside a section.
    const passed = d.problems.filter((el) => el.getBoundingClientRect().top + el.offsetHeight / 2 < vh * 0.62).length;
    const problem = { ...table.problem, frost: 0.22 + (0.78 * passed) / Math.max(1, d.problems.length) };
    const step = d.steps ? pinProgress(d.steps, vh) * 3.999 : 0;
    const k = Math.floor(step);
    const within = band(0.55, 1, step - k); // turn to the next service's angle at the end of each step
    const turn = (n: number) => [-0.3, 0.34, -0.12, 0.36][Math.min(3, n)];
    const tilt = (n: number) => [0.08, -0.12, 0.18, 0.02][Math.min(3, n)];
    const services = { ...table.services, ry: mix(turn(k), turn(k + 1), within), rx: mix(tilt(k), tilt(k + 1), within) };
    const film = pinProgress(d.sections[1], vh);
    const open = band(0.06, 0.62, film);

    // Blend the poses section by section.
    const w = sectionWeights(d.sections, vh);
    // On phones the services heading has the screen to itself; the crystal comes in as the held stage pins.
    if (phone && d.steps) w[3] = band(0.2 * vh, -0.04 * vh, d.steps.getBoundingClientRect().top);
    let target: Pose = table.hero;
    const close = phone ? { ...table.cta, fy: d.sections[5].getBoundingClientRect().top / vh + table.cta.fy } : table.cta;
    const poses: Pose[] = [table.hero, table.film, problem, services, table.cases, close];
    for (let i = 1; i < poses.length; i++) target = blendPose(target, poses[i], w[i]);
    // While the film opens out of the eye, the crystal leans in towards you.
    target = { ...target, fw: target.fw * (1 + 0.5 * open * w[1] * (1 - w[2])) };

    // Ease the pose; the idle turn and the mouse ride on top.
    const c = cur.current;
    const kk = reduced ? 30 : 3.2;
    for (const key of KEYS) c[key] = damp(c[key], target[key], key === "frost" ? 2.4 : kk, dt);
    pointer.x = damp(pointer.x, pointer.tx, 3, dt);
    pointer.y = damp(pointer.y, pointer.ty, 3, dt);
    const calm = 1 - w[1] * (1 - w[2]); // the film moment holds the crystal still and frontal
    const vw = state.viewport.width;
    const vhw = state.viewport.height;
    const scale = (c.fw * vw) / WIDTH;
    g.position.set((c.fx - 0.5) * vw, (0.5 - c.fy) * vhw + Math.sin(t * 0.7) * 0.05 * calm, 0);
    g.rotation.set(c.rx + (pointer.y * 0.14 + Math.sin(t * 0.33) * 0.05) * calm, c.ry + (pointer.x * 0.26 + Math.sin(t * 0.21) * 0.12) * calm, c.rz);
    g.scale.setScalar(scale);
    g.updateMatrixWorld();

    // The glass: crystal clear, or clouded while the problems are read.
    const m = glass.current;
    if (m) {
      m.distortion = c.frost * 0.9;
      m.temporalDistortion = c.frost * 0.3;
      m.anisotropicBlur = 0.04 + c.frost * 1.4;
      m.chromaticAberration = 0.07 * (1 - c.frost * 0.6);
    }
    if (frostShell.current) frostShell.current.opacity = c.frost * 0.62;

    // The light inside: the hero's royal and sky, grey while clouded, one palette per service.
    const svc = SERVICE_LIGHT[k];
    const next = SERVICE_LIGHT[Math.min(3, k + 1)];
    mixPalette(scratch.target, svc, next, within);
    mixPalette(scratch.light, HERO_LIGHT, scratch.target, clamp01(c.light));
    mixPalette(scratch.light, scratch.light, FROST_LIGHT, clamp01(c.frost * 1.6));
    scratch.frame += 1;
    if (scratch.frame % 2 === 0 || reduced) {
      const bd = getBackdrop();
      paintBackdrop(bd.ctx, t, scratch.light);
      bd.texture.needsUpdate = true;
    }

    // The eye looks at the mouse, or at the result being read.
    let lx = pointer.x;
    let ly = pointer.y;
    if (w[4] > 0.5 && w[5] < 0.5 && d.rows.length) {
      const mid = vh * 0.5;
      let best = d.rows[0];
      for (const r of d.rows)
        if (Math.abs(r.getBoundingClientRect().top + r.offsetHeight / 2 - mid) < Math.abs(best.getBoundingClientRect().top + best.offsetHeight / 2 - mid))
          best = r;
      const rb = best.getBoundingClientRect();
      lx = clamp01((rb.left + rb.width * 0.3) / size.width) * 2 - 1;
      ly = clamp01((rb.top + rb.height / 2) / vh) * 2 - 1;
    }
    scratch.look.x = damp(scratch.look.x, lx * (1 - w[1] * (1 - w[2])), 5, dt);
    scratch.look.y = damp(scratch.look.y, ly * (1 - w[1] * (1 - w[2])), 5, dt);
    if (pupil.current) {
      const len = Math.hypot(scratch.look.x, scratch.look.y);
      const f = len > 1 ? 1 / len : 1;
      pupil.current.position.set(EYE_LOCAL.x + scratch.look.x * f * PUPIL_TRAVEL, EYE_LOCAL.y - scratch.look.y * f * PUPIL_TRAVEL, 0);
    }

    // The film opens out of the eye: a circle the size of the black disk, around the disk, growing to open the frame.
    if (d.film) {
      const toPx = (v: THREE.Vector3) => {
        v.project(camera);
        return [((v.x + 1) / 2) * size.width, ((1 - v.y) / 2) * size.height];
      };
      const [ex, ey] = toPx(scratch.a.set(EYE_LOCAL.x, EYE_LOCAL.y, DISK_FRONT).applyMatrix4(g.matrixWorld));
      const [rx, ry] = toPx(scratch.b.set(EYE_LOCAL.x + EYE.disk * S, EYE_LOCAL.y, DISK_FRONT).applyMatrix4(g.matrixWorld));
      const diskPx = Math.hypot(rx - ex, ry - ey);
      const r = d.film.getBoundingClientRect();
      const cx = ex - r.left;
      const cy = ey - r.top;
      const far = Math.max(Math.hypot(cx, cy), Math.hypot(r.width - cx, cy), Math.hypot(cx, r.height - cy), Math.hypot(r.width - cx, r.height - cy));
      const radius = open >= 0.999 ? far + 2 : mix(diskPx * 0.98, far + 2, open);
      const clip = `circle(${radius.toFixed(1)}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px)`;
      if (clip !== scratch.clip) {
        scratch.clip = clip;
        d.film.style.clipPath = clip;
      }
    }
  });

  return (
    <group ref={group}>
      <mesh geometry={mono.glass}>
        <MeshTransmissionMaterial
          ref={(m: unknown) => {
            glass.current = m as GlassMaterial | null;
          }}
          background={getBackdrop().texture}
          backside
          backsideThickness={0.3}
          thickness={0.62}
          samples={size.width < 768 ? 4 : 6}
          resolution={size.width < 768 ? 512 : 1024}
          backsideResolution={size.width < 768 ? 256 : 512}
          roughness={0}
          ior={1.5}
          chromaticAberration={0.07}
          anisotropicBlur={0.04}
          distortion={0}
          distortionScale={0.35}
          temporalDistortion={0}
          color="#ffffff"
          attenuationColor="#eaf4ff"
          attenuationDistance={5}
          clearcoat={1}
          clearcoatRoughness={0.04}
        />
      </mesh>
      <mesh geometry={mono.glass} scale={1.004} renderOrder={2}>
        <meshStandardMaterial ref={frostShell} color="#ffffff" roughness={1} metalness={0} transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh geometry={mono.ring} material={materials.chrome} />
      <mesh geometry={mono.disk} material={materials.ink} />
      <mesh ref={pupil} geometry={mono.pupil} material={materials.iris} position={[EYE_LOCAL.x, EYE_LOCAL.y, 0]} />
    </group>
  );
}

/* A studio of soft boxes for the reflections: a broad top light, two side strips, a blue bounce from below, and two
   dark panels so the chrome reads as metal rather than white. */
function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={["#3a4453"]} />
      <Lightformer form="rect" intensity={3.2} position={[0, 6, 1]} rotation-x={Math.PI / 2} scale={[14, 4, 1]} />
      <Lightformer form="rect" intensity={2.4} position={[-7, 1, 2]} rotation-y={Math.PI / 2} scale={[9, 1.6, 1]} />
      <Lightformer form="rect" intensity={2} position={[7, -0.5, 2]} rotation-y={-Math.PI / 2} scale={[9, 1, 1]} />
      <Lightformer form="rect" intensity={1.4} color="#69bff8" position={[0, -6, 3]} rotation-x={-Math.PI / 2} scale={[12, 3, 1]} />
      <Lightformer form="rect" intensity={5} position={[2, 2, 9]} scale={[3, 0.35, 1]} />
      <Lightformer form="rect" intensity={1} color="#0a1424" position={[-5, -2, -6]} scale={[7, 7, 1]} />
      <Lightformer form="rect" intensity={1} color="#0a1424" position={[6, 3, -7]} scale={[5, 9, 1]} />
    </Environment>
  );
}

export function CrystalStage({ reduced }: { reduced: boolean }) {
  return (
    <div aria-hidden className="k8-stage">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 14], fov: 30, near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        frameloop="always"
      >
        <color attach="background" args={["#f3f6fa"]} />
        <Suspense fallback={null}>
          <Crystal reduced={reduced} />
          <Studio />
        </Suspense>
      </Canvas>
    </div>
  );
}
