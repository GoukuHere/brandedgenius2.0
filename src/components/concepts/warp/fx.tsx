"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/*
  Two living elements for concept 5 (Warp), both drawn by the browser, no libraries:
  - LiquidChrome: a WebGL surface of flowing liquid metal (domain-warped noise through a chrome ramp, with a cool
    blue cast in the shadows). The pointer bends the flow. It renders only while on screen and at most 60 frames a
    second; with reduced motion it draws a single still frame.
  - DotMatrix: text on an LED dot grid. When the text changes, each dot fades to its new state after its own small
    delay, so the display re-lights like a real matrix. It draws only while dots are changing.
*/

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const FRAG = `precision highp float;
uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes.y;
  float t=uTime*.07;
  vec2 m=(uMouse-.5)*.9;
  vec2 q=vec2(fbm(uv*1.4+vec2(t,-t)),fbm(uv*1.4+vec2(5.2,1.3)-t));
  vec2 r=vec2(fbm(uv*1.4+2.4*q+vec2(1.7,9.2)+t*1.3+m),fbm(uv*1.4+2.4*q+vec2(8.3,2.8)-t*1.1-m));
  float f=fbm(uv*1.4+2.6*r);
  float b=sin(f*13.+r.x*5.+r.y*3.)*.5+.5;
  float k=smoothstep(.15,.97,b);
  vec3 deep=vec3(.035,.06,.12);
  vec3 steel=vec3(.46,.55,.68);
  vec3 lite=vec3(.93,.96,1.);
  vec3 c=mix(deep,steel,smoothstep(0.,.55,k));
  c=mix(c,lite,smoothstep(.55,1.,k));
  c+=vec3(0.,.09,.26)*(1.-k)*.7;
  c+=pow(clamp((b-.84)/.16,0.,1.),3.)*.55;
  gl_FragColor=vec4(c,1.);
}`;

export function LiquidChrome({ className, still = false }: { className?: string; still?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false, powerPreference: "low-power" });
    if (!gl) return undefined;
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");

    const reduced = still || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const size = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, w, h);
    };
    let raf = 0;
    let visible = false;
    const start = performance.now();
    const draw = (now: number) => {
      raf = 0;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      size();
      gl.uniform1f(uTime, reduced ? 12 : (now - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (visible && !reduced) raf = requestAnimationFrame(draw);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(draw);
    });
    io.observe(canvas);
    const move = (e: PointerEvent) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", move);
    };
  }, [still]);
  return <canvas ref={ref} aria-hidden className={cn("block size-full", className)} />;
}

/*
  ChromeText: a heading whose letters are filled with the same liquid metal. The real text stays in the page
  (transparent, so it can be read, selected and found); a WebGL canvas over it draws each word at the exact place
  the browser laid it out, as a mask for the flowing chrome. Outside the letters the canvas is transparent, so it
  sits on any background, including the moving tunnel.
*/
const TEXT_FRAG = `precision highp float;
uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform sampler2D uText;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 st=gl_FragCoord.xy/uRes;
  float a=texture2D(uText,vec2(st.x,1.-st.y)).a;
  if(a<.004){gl_FragColor=vec4(0.);return;}
  vec2 uv=gl_FragCoord.xy/uRes.y*1.6;
  float t=uTime*.08;
  vec2 m=(uMouse-.5)*.8;
  vec2 q=vec2(fbm(uv+vec2(t,-t)),fbm(uv+vec2(5.2,1.3)-t));
  vec2 r=vec2(fbm(uv+2.2*q+vec2(1.7,9.2)+t*1.3+m),fbm(uv+2.2*q+vec2(8.3,2.8)-t*1.1-m));
  float f=fbm(uv+2.4*r);
  float b=sin(f*12.+r.x*5.+st.y*4.)*.5+.5;
  float k=smoothstep(.12,.98,b);
  vec3 c=mix(vec3(.30,.36,.46),vec3(.80,.86,.94),smoothstep(0.,.5,k));
  c=mix(c,vec3(1.),smoothstep(.55,1.,k));
  c+=vec3(.0,.10,.28)*(1.-k)*.55;
  c+=pow(clamp((b-.86)/.14,0.,1.),3.)*.5;
  gl_FragColor=vec4(c*a,a);
}`;

export function ChromeText({ as: Tag = "h1", children, className }: { as?: "h1" | "h2"; children: string; className?: string }) {
  const host = useRef<HTMLHeadingElement>(null);
  const ref = useRef<HTMLCanvasElement>(null);
  const words = children.split(/\s+/).filter(Boolean);
  useEffect(() => {
    const canvas = ref.current;
    const el = host.current;
    if (!canvas || !el) return undefined;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    // Without WebGL the heading simply stays as plain text.
    if (!gl) return undefined;
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, TEXT_FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const mask = document.createElement("canvas");

    // Draw each word where the browser placed it, as the mask texture.
    const layout = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const box = el.getBoundingClientRect();
      // Layout size (ignores the 3D stage's scale), so the mask matches the text in its own box.
      const w = el.offsetWidth;
      const hgt = el.offsetHeight;
      const ratio = box.width / (w || 1);
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(hgt * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      mask.width = canvas.width;
      mask.height = canvas.height;
      const c = mask.getContext("2d")!;
      c.clearRect(0, 0, mask.width, mask.height);
      const cs = getComputedStyle(el);
      c.font = `${cs.fontWeight} ${parseFloat(cs.fontSize) * dpr}px ${cs.fontFamily}`;
      c.textBaseline = "alphabetic";
      c.fillStyle = "#fff";
      const ls = parseFloat(cs.letterSpacing) || 0;
      if ("letterSpacing" in c) (c as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${ls * dpr}px`;
      el.querySelectorAll<HTMLSpanElement>("[data-w]").forEach((span) => {
        const r = span.getBoundingClientRect();
        const x = (r.left - box.left) / ratio;
        const y = (r.top - box.top) / ratio;
        const hh = r.height / ratio;
        // The alphabetic baseline sits about 78% down an inline box of this face.
        c.fillText(span.textContent ?? "", x * dpr, (y + hh * 0.78) * dpr);
      });
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask);
      // Only now does the real text step back for the chrome (until then, and without script, it stays visible).
      el.dataset.chromeReady = "1";
    };
    let raf = 0;
    let visible = false;
    const start = performance.now();
    const draw = (now: number) => {
      raf = 0;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, reduced ? 14 : (now - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (visible && !reduced) raf = requestAnimationFrame(draw);
    };
    const relayout = () => {
      layout();
      if (!raf) raf = requestAnimationFrame(draw);
    };
    let cancelled = false;
    document.fonts?.ready.then(() => !cancelled && relayout()).catch(relayout);
    const ro = new ResizeObserver(relayout);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(draw);
    });
    io.observe(el);
    const move = (e: PointerEvent) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", move);
    };
  }, [children]);
  return (
    <Tag ref={host} className={cn("k5-chrome relative", className)}>
      {words.map((w, i) => (
        <span key={i}>
          <span data-w className="whitespace-nowrap">
            {w}
          </span>{" "}
        </span>
      ))}
      <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 size-full" />
    </Tag>
  );
}

type Dot = { v: number; to: number; delay: number };

/**
 * Text on an LED dot grid. `rows` is the matrix height in dots; the pitch follows the element's height, so the
 * text is drawn as large as the box allows. The font comes from the element's own CSS font-family.
 */
export function DotMatrix({ text, rows = 11, className, color = "105,191,248", align = "left" }: { text: string; rows?: number; className?: string; color?: string; align?: "left" | "center" }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const state = useRef<{ dots: Dot[]; cols: number; pitch: number; t0: number }>({ dots: [], cols: 0, pitch: 6, t0: 0 });
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let cancelled = false;

    const layout = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const pitch = h / rows;
      const cols = Math.max(1, Math.floor(w / pitch));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // The text at matrix resolution: one pixel per dot.
      const off = document.createElement("canvas");
      off.width = cols;
      off.height = rows;
      const o = off.getContext("2d")!;
      const family = getComputedStyle(canvas).fontFamily;
      let size = rows * 0.96;
      o.font = `700 ${size}px ${family}`;
      const measured = o.measureText(text).width;
      if (measured > cols - 2) size *= (cols - 2) / measured;
      o.font = `700 ${size}px ${family}`;
      o.textBaseline = "middle";
      o.fillStyle = "#fff";
      const x = align === "center" ? (cols - o.measureText(text).width) / 2 : 1;
      o.fillText(text, x, rows / 2 + 0.5);
      const data = o.getImageData(0, 0, cols, rows).data;
      const prev = state.current;
      const dots: Dot[] = [];
      for (let i = 0; i < cols * rows; i++) {
        const on = data[i * 4 + 3] > 128 ? 1 : 0;
        const old = prev.cols === cols ? prev.dots[i]?.v ?? 0 : 0;
        dots.push({ v: reduced ? on : old, to: on, delay: Math.random() * 520 });
      }
      state.current = { dots, cols, pitch, t0: performance.now() };
    };

    const paint = (now: number) => {
      raf = 0;
      const { dots, cols, pitch, t0 } = state.current;
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      let busy = false;
      const r = pitch * 0.36;
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        if (now - t0 > d.delay && d.v !== d.to) {
          d.v += (d.to - d.v) * 0.22;
          if (Math.abs(d.to - d.v) < 0.02) d.v = d.to;
          else busy = true;
        } else if (d.v !== d.to) busy = true;
        const cx = (i % cols) * pitch + pitch / 2;
        const cy = Math.floor(i / cols) * pitch + pitch / 2;
        if (d.v > 0.04) {
          ctx.fillStyle = `rgba(${color},${0.16 * d.v})`;
          ctx.beginPath();
          ctx.arc(cx, cy, r * 2.1, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = d.v > 0.04 ? `rgba(${color},${0.25 + 0.75 * d.v})` : "rgba(140,160,190,0.10)";
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (busy && !cancelled) raf = requestAnimationFrame(paint);
    };

    const run = () => {
      layout();
      if (!raf) raf = requestAnimationFrame(paint);
    };
    document.fonts?.ready.then(() => !cancelled && run()).catch(run);
    const ro = new ResizeObserver(() => run());
    ro.observe(canvas);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [text, rows, color, align]);
  return <canvas ref={ref} role="img" aria-label={text} className={cn("block w-full", className)} />;
}
