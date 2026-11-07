"use client";

import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import { CASES, MEDIA, SERVICES } from "@/content/site";
import { band, clamp01, damp, listenPointer, mix, pinProgress, pointer, sectionWeights } from "../crystal/track";
import { SHARD_SLOTS_DESK, SHARD_SLOTS_PHONE } from "./slots";

/*
  v9 "Obsidian": the stage. One thick pane of glass stands in a dark room lit by slow columns of royal and sky
  light, and it is a transparent display: the founder's film plays inside it.
  - hero: it stands in the middle, turned a little, the film playing; the mouse tilts it.
  - problem: it cracks from one point and breaks into six shards, one per problem; each shard keeps its piece of the
    (now frozen) film and drifts to its own place beside its problem.
  - services: the shards fly back and the pane is whole again, then it opens into four etched layers, one per
    service; the layer being read slides out and lights up.
  - cases: the layers close, the pane turns to face you and shows the case being read: its three results.
  - cta: the film again.
  The glass is three's own physical transmission (one transmission pass for every pane, shard and layer), so the
  film, the etched layers and the light columns behind are all seen through real refraction and dispersion.
*/

const SCENES = ["hero", "problem", "services", "cases", "cta"] as const;
type SceneName = (typeof SCENES)[number];
type Pose = { fx: number; fy: number; fw: number; rx: number; ry: number; rz: number };
const KEYS = ["fx", "fy", "fw", "rx", "ry", "rz"] as const;

const DESK: Record<SceneName, Pose> = {
  hero: { fx: 0.5, fy: 0.47, fw: 0.4, rx: 0.06, ry: -0.34, rz: 0.02 },
  problem: { fx: 0.66, fy: 0.46, fw: 0.34, rx: 0.12, ry: 0.22, rz: -0.05 },
  services: { fx: 0.66, fy: 0.5, fw: 0.3, rx: -0.38, ry: 0.66, rz: 0.1 },
  cases: { fx: 0.66, fy: 0.45, fw: 0.42, rx: 0.02, ry: -0.2, rz: 0 },
  cta: { fx: 0.68, fy: 0.44, fw: 0.36, rx: 0.06, ry: -0.3, rz: -0.02 },
};
const PHONE: Record<SceneName, Pose> = {
  hero: { fx: 0.5, fy: 0.27, fw: 0.88, rx: 0.06, ry: -0.3, rz: 0.02 },
  problem: { fx: 0.5, fy: 0.25, fw: 0.66, rx: 0.12, ry: 0.22, rz: -0.05 },
  services: { fx: 0.5, fy: 0.25, fw: 0.56, rx: -0.38, ry: 0.66, rz: 0.1 },
  cases: { fx: 0.5, fy: 0.25, fw: 0.9, rx: 0.02, ry: -0.16, rz: 0 },
  cta: { fx: 0.5, fy: 0.24, fw: 0.84, rx: 0.06, ry: 0.3, rz: -0.02 },
};
const blendPose = (a: Pose, b: Pose, t: number): Pose => {
  const out = { ...a };
  for (const k of KEYS) out[k] = mix(a[k], b[k], t);
  return out;
};

/* The pane, in world units at scale 1: the film's 16:9, thick glass. */
const PW = 4;
const PH = 2.25;
const PD = 0.26;
type Pt = [number, number];

/* The break: six cracks from one point of impact, each shard the slice between two cracks. */
const IMPACT: Pt = [0.42, 0.2];
const RAYS = [0.32, 1.22, 2.02, 2.86, 3.92, 5.06];

function edgeHit(p: Pt, a: number): Pt {
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const tx = dx > 0 ? (PW / 2 - p[0]) / dx : dx < 0 ? (-PW / 2 - p[0]) / dx : Infinity;
  const ty = dy > 0 ? (PH / 2 - p[1]) / dy : dy < 0 ? (-PH / 2 - p[1]) / dy : Infinity;
  const t = Math.min(tx, ty);
  return [p[0] + dx * t, p[1] + dy * t];
}

type Shard = { glass: THREE.BufferGeometry; film: THREE.BufferGeometry; centre: Pt };

function makeShards(): Shard[] {
  const corners: Pt[] = [
    [PW / 2, PH / 2],
    [-PW / 2, PH / 2],
    [-PW / 2, -PH / 2],
    [PW / 2, -PH / 2],
  ];
  const angle = (q: Pt) => {
    const a = Math.atan2(q[1] - IMPACT[1], q[0] - IMPACT[0]);
    return a < 0 ? a + Math.PI * 2 : a;
  };
  return RAYS.map((a0, i) => {
    const a1 = i === RAYS.length - 1 ? RAYS[0] + Math.PI * 2 : RAYS[i + 1];
    const between = corners
      .map((c) => ({ c, a: angle(c) < a0 ? angle(c) + Math.PI * 2 : angle(c) }))
      .filter((x) => x.a > a0 && x.a < a1)
      .sort((x, y) => x.a - y.a)
      .map((x) => x.c);
    const poly: Pt[] = [IMPACT, edgeHit(IMPACT, a0), ...between, edgeHit(IMPACT, a1)];
    const centre: Pt = [poly.reduce((s, p) => s + p[0], 0) / poly.length, poly.reduce((s, p) => s + p[1], 0) / poly.length];
    const shape = new THREE.Shape(poly.map(([x, y]) => new THREE.Vector2(x - centre[0], y - centre[1])));
    const glass = new THREE.ExtrudeGeometry(shape, {
      depth: PD,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelOffset: -0.01,
      bevelSegments: 2,
    });
    glass.translate(0, 0, -PD / 2);
    // The film piece: the same outline, flat, inside the shard, mapped to its part of the frame.
    const film = new THREE.ShapeGeometry(shape);
    const pos = film.attributes.position;
    const uv = new Float32Array(pos.count * 2);
    for (let k = 0; k < pos.count; k++) {
      uv[k * 2] = (pos.getX(k) + centre[0] + PW / 2) / PW;
      uv[k * 2 + 1] = (pos.getY(k) + centre[1] + PH / 2) / PH;
    }
    film.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    film.scale(0.985, 0.985, 1);
    return { glass, film, centre };
  });
}

/* The screen inside the glass: the film, or a drawn page (the results), crossfaded; opaque, so the glass sees it. */
function makeScreenMaterial(film: THREE.Texture, page: THREE.Texture) {
  return new THREE.ShaderMaterial({
    uniforms: { film: { value: film }, page: { value: page }, mixv: { value: 0 }, dim: { value: 1 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader:
      "uniform sampler2D film; uniform sampler2D page; uniform float mixv; uniform float dim; varying vec2 vUv;" +
      "void main(){ vec3 a = texture2D(film, vUv).rgb; vec3 b = texture2D(page, vUv).rgb; gl_FragColor = vec4(mix(a, b, mixv) * dim, 1.0);" +
      "\n#include <colorspace_fragment>\n}",
  });
}

/* Drawn pages: the four etched layers and the results display. Text uses the page's own Hubot Sans. */
const fontFamily = () => {
  const el = document.querySelector(".k9");
  return (el && getComputedStyle(el).getPropertyValue("--font-hubot").trim()) || "sans-serif";
};

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const words = text.replace(/­/g, "").split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > max && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function paintGround(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#071733");
  g.addColorStop(0.55, "#04101f");
  g.addColorStop(1, "#020610");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function paintLayer(ctx: CanvasRenderingContext2D, i: number, family: string) {
  const W = 1024;
  const H = 576;
  paintGround(ctx, W, H);
  ctx.strokeStyle = "rgba(105,191,248,0.55)";
  ctx.lineWidth = 3;
  ctx.strokeRect(36, 36, W - 72, H - 72);
  ctx.fillStyle = "#69bff8";
  ctx.font = `500 34px ${family}`;
  ctx.fillText(String(i + 1).padStart(2, "0"), 76, 112);
  ctx.fillStyle = "#eef3f8";
  ctx.font = `600 66px ${family}`;
  ctx.fontStretch = "expanded";
  const lines = wrap(ctx, SERVICES.items[i].title, W - 160);
  lines.forEach((l, k) => ctx.fillText(l, 76, H - 92 - (lines.length - 1 - k) * 78));
  ctx.fontStretch = "normal";
}

function paintCase(ctx: CanvasRenderingContext2D, i: number, family: string) {
  const W = 1600;
  const H = 900;
  const c = CASES.items[i];
  paintGround(ctx, W, H);
  ctx.fillStyle = "#69bff8";
  ctx.font = `500 34px ${family}`;
  ctx.fillText(c.name, 96, 132);
  ctx.fillStyle = "rgba(238,243,248,0.55)";
  ctx.font = `400 30px ${family}`;
  ctx.fillText(c.tagline, 96, 182);
  c.metrics.forEach((m, k) => {
    const x = 96 + k * 480;
    const g = ctx.createLinearGradient(0, 430, 0, 600);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(1, "#8fd0ff");
    ctx.fillStyle = g;
    ctx.font = `600 132px ${family}`;
    ctx.fontStretch = "expanded";
    ctx.fillText(m.value, x - 6, 590);
    ctx.fontStretch = "normal";
    ctx.fillStyle = "rgba(238,243,248,0.62)";
    ctx.font = `400 28px ${family}`;
    wrap(ctx, m.label, 400).forEach((l, n) => ctx.fillText(l, x, 664 + n * 40));
  });
  ctx.fillStyle = "rgba(105,191,248,0.4)";
  ctx.fillRect(96, 760, W - 192, 2);
  ctx.fillStyle = "rgba(238,243,248,0.4)";
  ctx.font = `500 26px ${family}`;
  ctx.fillText(`${String(i + 1).padStart(2, "0")} / ${String(CASES.items.length).padStart(2, "0")}`, 96, 816);
}

/* Shared state, made once in the browser (one stage per page). */
type Media = {
  video: HTMLVideoElement;
  film: THREE.VideoTexture;
  page: { ctx: CanvasRenderingContext2D; tex: THREE.CanvasTexture; shown: number };
  layers: { ctx: CanvasRenderingContext2D; tex: THREE.CanvasTexture }[];
};
let media: Media | null = null;
const canvasTex = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { ctx: c.getContext("2d")!, tex };
};
function getMedia(): Media {
  if (media) return media;
  const video = document.createElement("video");
  video.src = MEDIA.heroVideo;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = "auto";
  video.setAttribute("aria-hidden", "true");
  video.style.cssText = "position:fixed;left:-9999px;top:0;width:2px;height:2px;opacity:0";
  document.body.appendChild(video);
  const film = new THREE.VideoTexture(video);
  film.colorSpace = THREE.SRGBColorSpace;
  const page = { ...canvasTex(1600, 900), shown: -1 };
  const layers = SERVICES.items.map(() => canvasTex(1024, 576));
  media = { video, film, page, layers };
  return media;
}

/* The room's back wall: its own black with slow columns of royal and sky light, drawn in one opaque shader so
   the glass refracts it (transmission only sees opaque things) and its edges melt into the black exactly. */
const WALL_FRAGMENT = [
  "uniform float time; uniform vec3 base; uniform vec3 royal; uniform vec3 sky; varying vec2 vUv;",
  "float column(float x, float seed, float speed, float width) {",
  "  float c = fract(seed + time * speed) * 1.6 - 0.3;",
  "  float d = (x - c) / width;",
  "  return exp(-d * d);",
  "}",
  "void main() {",
  "  float x = vUv.x;",
  "  float fall = smoothstep(0.0, 0.55, vUv.y) * smoothstep(1.0, 0.45, vUv.y);",
  "  vec3 light = royal * 0.44 * column(x, 0.12, 0.006, 0.07)",
  "             + sky * 0.32 * column(x, 0.46, -0.0045, 0.022)",
  "             + royal * 0.42 * column(x, 0.71, 0.004, 0.11)",
  "             + sky * 0.22 * column(x, 0.9, -0.007, 0.035);",
  "  gl_FragColor = vec4(base + light * (0.35 + 0.65 * fall), 1.0);",
  "  #include <colorspace_fragment>",
  "}",
].join("\n");

function makeWall() {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      base: { value: new THREE.Color("#04070c") },
      royal: { value: new THREE.Color("#0b4fb3") },
      sky: { value: new THREE.Color("#5fb6f2") },
    },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: WALL_FRAGMENT,
  });
}

/* Everything the stage draws with, made once (there is one stage per page), so the frame loop can update it. */
type Kit = {
  media: Media;
  shards: Shard[];
  screen: THREE.ShaderMaterial;
  wall: THREE.ShaderMaterial;
  glass: THREE.MeshPhysicalMaterial;
  layerGlass: THREE.MeshPhysicalMaterial;
  layerMats: THREE.MeshBasicMaterial[];
};
let kit: Kit | null = null;
function getKit(): Kit {
  if (kit) return kit;
  const m = getMedia();
  const glass = new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    transmission: 1,
    thickness: 0.45,
    roughness: 0.035,
    ior: 1.5,
    dispersion: 0.6,
    attenuationColor: new THREE.Color("#a9d8ff"),
    attenuationDistance: 2.4,
    specularIntensity: 1,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    envMapIntensity: 1.5,
  });
  const layerGlass = glass.clone();
  layerGlass.thickness = 0.12;
  kit = {
    media: m,
    shards: makeShards(),
    screen: makeScreenMaterial(m.film, m.page.tex),
    wall: makeWall(),
    glass,
    layerGlass,
    layerMats: m.layers.map((l) => new THREE.MeshBasicMaterial({ map: l.tex, toneMapped: false })),
  };
  return kit;
}

const scratch = {
  q: new THREE.Quaternion(),
  q2: new THREE.Quaternion(),
  e: new THREE.Euler(),
  v: new THREE.Vector3(),
  playing: false,
};

type Dom = { sections: HTMLElement[] };

function Stage({ reduced }: { reduced: boolean }) {
  const k = getKit();
  const { size } = useThree();
  const pane = useRef<THREE.Group>(null);
  const paneBody = useRef<THREE.Group>(null);
  const shardRefs = useRef<(THREE.Group | null)[]>([]);
  const layerRefs = useRef<(THREE.Group | null)[]>([]);
  const dom = useRef<Dom | null>(null);
  const cur = useRef<Pose>({ ...DESK.hero });
  const shards = k.shards;

  useEffect(() => {
    listenPointer();
    dom.current = {
      sections: SCENES.map((n) => document.querySelector<HTMLElement>(`[data-k9="${n}"]`)).filter((el): el is HTMLElement => !!el),
    };
    // Draw the etched layers once the page's font is in.
    const family = fontFamily();
    const draw = () => {
      const media = getKit().media;
      media.layers.forEach((l, i) => {
        paintLayer(l.ctx, i, family);
        l.tex.needsUpdate = true;
      });
      media.page.shown = -1;
    };
    draw();
    document.fonts
      .load(`600 66px ${family}`)
      .then(draw)
      .catch(() => {});
    // With reduced motion the film stands as its last frame (the founder with both robots), not a black screen.
    if (reduced) {
      const video = getKit().media.video;
      const still = () => {
        video.currentTime = Math.max(0, (video.duration || 8) - 0.4);
      };
      if (video.readyState >= 1) still();
      else video.addEventListener("loadedmetadata", still, { once: true });
    }
    const onVis = () => {
      if (document.hidden) getKit().media.video.pause();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      getKit().media.video.pause();
      scratch.playing = false;
    };
  }, [reduced]);

  useFrame((state, dt) => {
    const d = dom.current;
    const g = pane.current;
    const kit = getKit();
    const media = kit.media;
    if (!d || !g || d.sections.length !== SCENES.length) return;
    const vh = window.innerHeight;
    const phone = size.width < 768;
    const table = phone ? PHONE : DESK;
    const t = reduced ? 0 : state.clock.elapsedTime;
    const vw = state.viewport.width;
    const vhw = state.viewport.height;

    const w = sectionWeights(d.sections, vh);
    const raw = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return -r.top / Math.max(1, r.height - vh);
    };
    const pProblem = raw(d.sections[1]);
    const pServices = raw(d.sections[2]);
    const pCases = pinProgress(d.sections[3], vh);

    // The pose, blended section by section; at the close (phones) it rides with the section.
    const close = phone ? { ...table.cta, fy: d.sections[4].getBoundingClientRect().top / vh + table.cta.fy } : table.cta;
    const poses = [table.hero, table.problem, table.services, table.cases, close];
    let target = poses[0];
    for (let i = 1; i < poses.length; i++) target = blendPose(target, poses[i], w[i]);
    const c = cur.current;
    for (const k of KEYS) c[k] = damp(c[k], target[k], reduced ? 30 : 3, dt);
    pointer.x = damp(pointer.x, pointer.tx, 3, dt);
    pointer.y = damp(pointer.y, pointer.ty, 3, dt);
    const scale = (c.fw * vw) / PW;
    g.position.set((c.fx - 0.5) * vw, (0.5 - c.fy) * vhw + Math.sin(t * 0.6) * 0.04, 0);
    g.rotation.set(c.rx + pointer.y * 0.12 + Math.sin(t * 0.3) * 0.03, c.ry + pointer.x * 0.24 + Math.sin(t * 0.21) * 0.06, c.rz);
    g.scale.setScalar(scale);
    g.updateMatrixWorld();

    // The break: the shards leave as the problem stage pins and come home as the services arrive.
    const broken = band(-0.14, 0.1, pProblem) * (1 - w[2]);
    const open = band(-0.04, 0.12, pServices) * (1 - w[3]);
    const shardsOn = broken > 0.002;
    const layersOn = open > 0.002 && !shardsOn;
    if (paneBody.current) paneBody.current.visible = !shardsOn && !layersOn;

    const slots = phone ? SHARD_SLOTS_PHONE : SHARD_SLOTS_DESK;
    g.getWorldQuaternion(scratch.q);
    shardRefs.current.forEach((s, i) => {
      if (!s) return;
      s.visible = shardsOn;
      if (!shardsOn) return;
      const home = scratch.v.set(shards[i].centre[0], shards[i].centre[1], 0).applyMatrix4(g.matrixWorld);
      const slot = slots[i];
      const away = smoothStagger(broken, i);
      s.position.set(
        mix(home.x, (slot.fx - 0.5) * vw + Math.sin(t * 0.5 + i) * 0.05, away),
        mix(home.y, (0.5 - slot.fy) * vhw + Math.cos(t * 0.45 + i * 1.7) * 0.05, away),
        mix(home.z, 0.6 + (i % 3) * 0.2, away),
      );
      scratch.e.set(Math.sin(t * 0.32 + i) * 0.5 + 0.3, Math.cos(t * 0.27 + i * 2.1) * 0.6, i * 0.5 + Math.sin(t * 0.2 + i) * 0.25);
      scratch.q2.setFromEuler(scratch.e);
      s.quaternion.copy(scratch.q).slerp(scratch.q2, away);
      s.scale.setScalar(scale * mix(1, phone ? 0.56 : 0.54, away));
    });

    // The four layers: fanned out along the pane's depth, the one being read slid out and lit.
    const step = Math.min(3, Math.floor(clamp01(pServices) * 4));
    layerRefs.current.forEach((l, i) => {
      if (!l) return;
      l.visible = layersOn;
      if (!layersOn) return;
      const on = i === step ? 1 : 0;
      const lift = damp(l.userData.lift ?? 0, on, 6, dt);
      l.userData.lift = lift;
      const z = (1.5 - i) * 0.62;
      l.position.set(lift * 0.55 * open, lift * 0.18 * open, mix(z, 1.9, lift) * open);
      kit.layerMats[i].color.setScalar(0.32 + lift * 0.68);
    });

    // The screen inside the pane: the film, the results page while the cases are read, the film again at the end.
    const showPage = w[3] * (1 - w[4]);
    kit.screen.uniforms.mixv.value = showPage;
    kit.screen.uniforms.dim.value = 1 - broken * 0.25;
    kit.wall.uniforms.time.value = t;
    const caseIndex = Math.min(CASES.items.length - 1, Math.floor(pCases * CASES.items.length));
    if (caseIndex !== media.page.shown) {
      paintCase(media.page.ctx, caseIndex, fontFamily());
      media.page.tex.needsUpdate = true;
      media.page.shown = caseIndex;
    }
    // The film plays while it is seen whole; it holds its frame while the pane is broken.
    const wantPlay = !reduced && !document.hidden && broken < 0.05 && showPage < 0.95 && !layersOn;
    if (wantPlay !== scratch.playing) {
      scratch.playing = wantPlay;
      if (wantPlay) media.video.play().catch(() => {});
      else media.video.pause();
    }
  });

  return (
    <>
      <mesh material={k.wall} position={[0, 0, -8]} scale={[46, 26, 1]}>
        <planeGeometry />
      </mesh>
      <group ref={pane}>
        <group ref={paneBody}>
          <RoundedBox args={[PW, PH, PD]} radius={0.06} smoothness={5} material={k.glass} />
          <mesh material={k.screen}>
            <planeGeometry args={[PW * 0.968, PH * 0.955]} />
          </mesh>
        </group>
        {SERVICES.items.map((item, i) => (
          <group
            key={item.id}
            ref={(el) => {
              layerRefs.current[i] = el;
            }}
            visible={false}
          >
            <RoundedBox args={[PW, PH, 0.07]} radius={0.03} smoothness={3} material={k.layerGlass} />
            <mesh material={k.layerMats[i]}>
              <planeGeometry args={[PW * 0.97, PH * 0.96]} />
            </mesh>
          </group>
        ))}
      </group>
      {shards.map((s, i) => (
        <group
          key={i}
          ref={(el) => {
            shardRefs.current[i] = el;
          }}
          visible={false}
        >
          <mesh geometry={s.glass} material={k.glass} />
          <mesh geometry={s.film} material={k.screen} />
        </group>
      ))}
    </>
  );
}

/** Each shard leaves a little after the one before, so the break runs outward from the impact. */
function smoothStagger(v: number, i: number) {
  const start = i * 0.06;
  return band(start, start + 0.64, v);
}

/* The room for the reflections. A flat pane mirrors whatever it faces, so the lights are thin strips: they read on
   the glass as fine lines of light along its faces and edges, never as panels. */
function Room() {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={["#05080e"]} />
      <Lightformer form="rect" intensity={3} position={[0, 5, 2]} rotation-x={Math.PI / 2} scale={[10, 0.25, 1]} />
      <Lightformer form="rect" intensity={2.2} color="#69bff8" position={[-6, 0, 1]} rotation-y={Math.PI / 2} scale={[8, 0.12, 1]} />
      <Lightformer form="rect" intensity={2} color="#2f7fe0" position={[6, 1, 0]} rotation-y={-Math.PI / 2} scale={[8, 0.16, 1]} />
      <Lightformer form="rect" intensity={2.6} position={[0, 2.4, 8]} scale={[16, 0.05, 1]} />
      <Lightformer form="rect" intensity={1.2} color="#004ba0" position={[0, -5, 3]} rotation-x={-Math.PI / 2} scale={[12, 0.5, 1]} />
    </Environment>
  );
}

export function ObsidianStage({ reduced }: { reduced: boolean }) {
  const phone = typeof window !== "undefined" && window.innerWidth < 768;
  return (
    <div aria-hidden className="k9-stage">
      <Canvas
        dpr={phone ? [1, 1.5] : [1, 1.75]}
        camera={{ position: [0, 0, 14], fov: 30, near: 0.1, far: 80 }}
        gl={{ antialias: !phone, alpha: false, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#04070c"]} />
        <Suspense fallback={null}>
          <Stage reduced={reduced} />
          <Room />
        </Suspense>
        {!phone && (
          <EffectComposer multisampling={4}>
            <Bloom intensity={0.55} luminanceThreshold={0.62} luminanceSmoothing={0.2} mipmapBlur />
            <Noise opacity={0.035} />
            <Vignette darkness={0.55} offset={0.25} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
