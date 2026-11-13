/* Cena 3D do topo: a caixa Love in Box abre e a caneca sai de dentro.
   Tudo é modelado por código (sem .glb). A única textura externa é a logo
   oficial, aplicada como arte da caneca sem deformar.
   Unidade: 1 = 10 cm. */
import {
  BackSide, BoxGeometry, BufferAttribute, BufferGeometry, CanvasTexture,
  CatmullRomCurve3, Color, CylinderGeometry, DirectionalLight, DoubleSide, Group, HemisphereLight,
  LatheGeometry, MathUtils, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial,
  NeutralToneMapping, PCFShadowMap, PerspectiveCamera, Path, PlaneGeometry, PMREMGenerator, RepeatWrapping, Scene,
  ShadowMaterial, Shape, ShapeGeometry, SphereGeometry, SRGBColorSpace, TextureLoader,
  TubeGeometry, Vector2, Vector3, WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// Cores da marca (Design System v1.2)
const GOLD = 0xf0b225;
const GOLD_CSS = "#F0B225";
const PAPER = 0xffffff;
const CERAMIC = 0xffffff;

const BOX_W = 1.7, BOX_H = 1.3, LID_W = 1.78, LID_H = 0.3;
const MUG_R = 0.5, MUG_H = 1.2;
const BOX_TURN = 0.72; // caixa em três quartos; a caneca fica de frente

const { clamp, lerp } = MathUtils;
const smooth = (t) => t * t * (3 - 2 * t);
const outBack = (t) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);
const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* ---------------- texturas feitas em canvas ---------------- */

function heartPath(ctx, s) {
  ctx.beginPath();
  ctx.moveTo(0, s * 0.38);
  ctx.bezierCurveTo(-s * 0.95, -s * 0.2, -s * 0.48, -s * 0.98, 0, -s * 0.38);
  ctx.bezierCurveTo(s * 0.48, -s * 0.98, s * 0.95, -s * 0.2, 0, s * 0.38);
  ctx.closePath();
}

// Papel branco com corações dourados (caixa e papel de seda).
function heartsTexture() {
  const size = 512;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = ctx.fillStyle = GOLD_CSS;
  ctx.lineJoin = ctx.lineCap = "round";
  // [x, y, tamanho, giro, preenchido] numa grade 3×3 com folga das bordas
  const marks = [
    [92, 96, 44, -0.25, 0], [262, 70, 26, 0.2, 1], [420, 112, 38, 0.3, 0],
    [170, 232, 24, 0.1, 1], [340, 250, 46, -0.15, 0], [78, 300, 30, 0.35, 0],
    [236, 408, 40, 0.18, 0], [440, 400, 24, -0.3, 1], [96, 446, 20, -0.1, 1],
  ];
  for (const [x, y, s, r, fill] of marks) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(r);
    heartPath(ctx, s);
    if (fill) ctx.fill();
    else { ctx.lineWidth = 5; ctx.stroke(); }
    ctx.restore();
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.wrapS = tex.wrapT = RepeatWrapping;
  return tex;
}

function tiled(tex, rx, ry, ox = 0, oy = 0) {
  const t = tex.clone();
  t.repeat.set(rx, ry);
  t.offset.set(ox, oy);
  t.needsUpdate = true;
  return t;
}

// Sombra de contato macia sob a caixa.
function blobTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  g.addColorStop(0, "rgba(58,35,24,.55)");
  g.addColorStop(0.55, "rgba(58,35,24,.22)");
  g.addColorStop(1, "rgba(58,35,24,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new CanvasTexture(c);
}

/* ---------------- caneca ---------------- */

function arc(points, cx, cy, r, a0, a1, n = 6) {
  for (let i = 0; i <= n; i++) {
    const a = lerp(a0, a1, i / n);
    points.push(new Vector2(cx + Math.cos(a) * r, cy + Math.sin(a) * r));
  }
}

function buildMug(logo) {
  const mug = new Group();
  const ceramic = new MeshPhysicalMaterial({ color: CERAMIC, roughness: 0.22, clearcoat: 0.7, clearcoatRoughness: 0.12 });

  // Perfil girado em torno do eixo: fundo, parede de fora, borda arredondada, parede de dentro.
  const R = MUG_R, H = MUG_H, wall = 0.05, half = wall / 2, PI = Math.PI;
  const p = [new Vector2(0, 0), new Vector2(R - 0.08, 0)];
  arc(p, R - 0.045, 0.045, 0.045, -PI / 2, 0);
  p.push(new Vector2(R, 0.12), new Vector2(R, H - half - 0.06));
  arc(p, R - half, H - half, half, 0, PI, 8);
  p.push(new Vector2(R - wall, H - half - 0.06), new Vector2(R - wall, 0.16));
  arc(p, R - wall - 0.05, 0.11, 0.05, 0, -PI / 2);
  p.push(new Vector2(R - wall - 0.1, 0.06), new Vector2(0, 0.06));
  const body = new Mesh(new LatheGeometry(p, 72), ceramic);
  mug.add(body);

  // Alça à direita (regra de fotografia da marca).
  const curve = new CatmullRomCurve3([
    new Vector3(R - 0.04, 0.93, 0), new Vector3(R + 0.16, 0.97, 0), new Vector3(R + 0.36, 0.84, 0),
    new Vector3(R + 0.4, 0.58, 0), new Vector3(R + 0.3, 0.33, 0), new Vector3(R + 0.12, 0.24, 0),
    new Vector3(R - 0.04, 0.27, 0),
  ]);
  const handleGeo = new TubeGeometry(curve, 48, 0.062, 14);
  handleGeo.scale(1, 1, 1.5);
  mug.add(new Mesh(handleGeo, ceramic));

  // Arte: faixa de cilindro colada na frente. Altura = raio × ângulo mantém a proporção 1:1 da logo.
  const artH = 0.74, theta = artH / R;
  const art = new Mesh(
    new CylinderGeometry(R + 0.0015, R + 0.0015, artH, 48, 1, true, -theta / 2, theta),
    new MeshPhysicalMaterial({ map: logo, transparent: true, roughness: 0.25, clearcoat: 0.7, clearcoatRoughness: 0.12, polygonOffset: true, polygonOffsetFactor: -2 })
  );
  art.position.y = H * 0.5 + 0.01;
  mug.add(art);

  mug.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  body.receiveShadow = true;
  return mug;
}

/* ---------------- fita e laço ---------------- */

// Fita: tira de malha ao longo de pontos, com largura e direção lateral por ponto.
function ribbon(points, sides, widths) {
  const n = points.length;
  const pos = new Float32Array(n * 6);
  const index = [];
  for (let i = 0; i < n; i++) {
    const p = points[i], s = sides[i], w = widths[i] / 2;
    pos.set([p.x + s.x * w, p.y + s.y * w, p.z + s.z * w, p.x - s.x * w, p.y - s.y * w, p.z - s.z * w], i * 6);
    if (i < n - 1) index.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2);
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(pos, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}

function buildBow(satin) {
  const bow = new Group();
  const Z = new Vector3(0, 0, 1);

  // Laçada em gota: sai do nó por cima, faz a volta e retorna por baixo.
  const N = 44, pts = [], sides = [], widths = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, s = Math.sin(Math.PI * t);
    pts.push(new Vector3(0.7 * s, 0.14 * Math.sin(2 * Math.PI * t) + 0.22 * s + 0.02, 0));
    sides.push(Z);
    widths.push(0.46 * (0.32 + 0.68 * Math.pow(s, 0.7)));
  }
  const loopGeo = ribbon(pts, sides, widths);
  for (const dir of [1, -1]) {
    const loop = new Mesh(loopGeo, satin);
    loop.scale.x = dir;
    loop.rotation.z = dir * 0.2;
    loop.rotation.y = dir * -0.18;
    bow.add(loop);
  }

  // Pontas da fita deitadas sobre a tampa, abertas para a frente.
  const up = new Vector3(0, 1, 0);
  for (const dir of [1, -1]) {
    const d = new Vector3(dir * 0.5, 0, 0.87).normalize();
    const side = new Vector3().crossVectors(d, up).normalize();
    const tp = [], ts = [], tw = [];
    for (let i = 0; i <= 16; i++) {
      const s = i / 16;
      tp.push(d.clone().multiplyScalar(0.05 + 0.72 * s).setY(0.012 + 0.07 * Math.sin(s * Math.PI) * (1 - s * 0.4)));
      ts.push(side);
      tw.push(0.18 + 0.1 * s);
    }
    bow.add(new Mesh(ribbon(tp, ts, tw), satin));
  }

  const knot = new Mesh(new SphereGeometry(0.105, 24, 16), satin);
  knot.scale.set(1.05, 0.82, 1.15);
  knot.position.y = 0.075;
  bow.add(knot);
  return bow;
}

/* ---------------- caixa, tampa e papel de seda ---------------- */

function frame(outer, inner) {
  const s = new Shape();
  const o = outer / 2, i = inner / 2;
  s.moveTo(-o, -o); s.lineTo(o, -o); s.lineTo(o, o); s.lineTo(-o, o); s.closePath();
  const hole = new Path();
  hole.moveTo(-i, -i); hole.lineTo(-i, i); hole.lineTo(i, i); hole.lineTo(i, -i); hole.closePath();
  s.holes.push(hole);
  return new ShapeGeometry(s);
}

function buildBox(hearts) {
  const paper = (map) => new MeshStandardMaterial({ color: PAPER, map, roughness: 0.82 });
  const plain = new MeshStandardMaterial({ color: PAPER, roughness: 0.9 });
  const inside = new MeshStandardMaterial({ color: PAPER, roughness: 0.9, side: BackSide });
  const hidden = new MeshBasicMaterial({ visible: false });
  const satin = new MeshPhysicalMaterial({
    color: GOLD, roughness: 0.44, sheen: 0.5, sheenColor: new Color(0xffd45e), sheenRoughness: 0.4, side: DoubleSide,
  });
  const BAND = 0.22, EPS = 0.003;

  // --- base ---
  const base = new Group();
  const sideMat = paper(tiled(hearts, 1.3, 1));
  const shell = new Mesh(new BoxGeometry(BOX_W, BOX_H, BOX_W), [sideMat, sideMat, hidden, plain, sideMat, sideMat]);
  shell.position.y = BOX_H / 2;
  const inW = BOX_W - 0.06, inH = BOX_H - 0.03;
  const well = new Mesh(new BoxGeometry(inW, inH, inW), [inside, inside, hidden, inside, inside, inside]);
  well.position.y = 0.03 + inH / 2;
  const rim = new Mesh(frame(BOX_W, inW).rotateX(-Math.PI / 2), plain);
  rim.position.y = BOX_H;
  base.add(shell, well, rim);
  for (let k = 0; k < 4; k++) {
    const band = new Mesh(new PlaneGeometry(BAND, BOX_H), satin);
    band.position.set(Math.sin((k * Math.PI) / 2) * (BOX_W / 2 + EPS), BOX_H / 2, Math.cos((k * Math.PI) / 2) * (BOX_W / 2 + EPS));
    band.rotation.y = (k * Math.PI) / 2;
    base.add(band);
  }

  // --- tampa (origem no centro dela) ---
  const lid = new Group();
  const lidSide = paper(tiled(hearts, 1.35, 0.23, 0.2, 0.32));
  const lidTop = paper(tiled(hearts, 1.35, 1.35, 0.4, 0.1));
  const lidShell = new Mesh(new BoxGeometry(LID_W, LID_H, LID_W), [lidSide, lidSide, lidTop, hidden, lidSide, lidSide]);
  const lidIn = LID_W - 0.05;
  const lidWell = new Mesh(new BoxGeometry(lidIn, LID_H - 0.025, lidIn), [inside, inside, inside, hidden, inside, inside]);
  lidWell.position.y = -0.0125;
  const lidRim = new Mesh(frame(LID_W, lidIn).rotateX(Math.PI / 2), plain);
  lidRim.position.y = -LID_H / 2;
  lid.add(lidShell, lidWell, lidRim);
  for (let k = 0; k < 2; k++) {
    const top = new Mesh(new PlaneGeometry(BAND, LID_W + EPS * 2).rotateX(-Math.PI / 2), satin);
    top.position.y = LID_H / 2 + EPS;
    top.rotation.y = (k * Math.PI) / 2;
    lid.add(top);
  }
  for (let k = 0; k < 4; k++) {
    const band = new Mesh(new PlaneGeometry(BAND, LID_H), satin);
    band.position.set(Math.sin((k * Math.PI) / 2) * (LID_W / 2 + EPS), 0, Math.cos((k * Math.PI) / 2) * (LID_W / 2 + EPS));
    band.rotation.y = (k * Math.PI) / 2;
    lid.add(band);
  }
  const bow = buildBow(satin);
  bow.position.y = LID_H / 2 + EPS;
  bow.rotation.y = -BOX_TURN; // laço de frente para a câmera
  lid.add(bow);

  // --- papel de seda: folhas amassadas presas no fundo, abrindo para fora ---
  const tissue = new Group();
  const tissueMat = new MeshStandardMaterial({ color: 0xffffff, map: tiled(hearts, 0.8, 1.25, 0.1, 0.2), roughness: 1, side: DoubleSide, emissive: 0xffffff, emissiveIntensity: 0.12 });
  for (let i = 0; i < 6; i++) {
    const h = 1.72 + ((i * 37) % 5) * 0.08, w = 1.05;
    const geo = new PlaneGeometry(w, h, 12, 16);
    geo.translate(0, h / 2, 0);
    const pos = geo.attributes.position;
    for (let v = 0; v < pos.count; v++) {
      const x = pos.getX(v), y = pos.getY(v), k = i * 1.7;
      const crumple = 0.05 * Math.sin(x * 4.2 + k) * Math.cos(y * 3.1 + k * 2) + 0.02 * Math.sin((x - y) * 7 + k * 3);
      const v01 = Math.max(0, y / h);
      const curl = 0.2 * Math.pow(v01, 2.4); // a ponta dobra para fora
      const peak = 1 - 0.42 * Math.pow(Math.abs(x) / (w / 2), 1.3) * v01; // topo em bico
      pos.setZ(v, crumple + curl);
      pos.setY(v, y * peak);
    }
    geo.computeVertexNormals();
    const sheet = new Mesh(geo, tissueMat);
    const a = (i / 6) * Math.PI * 2 + 0.35;
    sheet.position.set(Math.sin(a) * 0.3, 0.04, Math.cos(a) * 0.3);
    sheet.rotation.order = "YXZ";
    sheet.rotation.set(0.22 + (i % 2) * 0.05, a, ((i % 3) - 1) * 0.22);
    tissue.add(sheet);
  }

  for (const g of [base, lid, tissue]) g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return { base, lid, tissue };
}

/* ---------------- cena ---------------- */

export async function createGiftScene(stage, { onReady, onFrame } = {}) {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping; // preserva as cores da marca
  renderer.toneMappingExposure = 1.14;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  stage.prepend(canvas);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  pmrem.dispose();

  // Luz quente e suave, nunca azulada.
  scene.add(new HemisphereLight(0xfff8ee, 0xf0c4b4, 1.05));
  const key = new DirectionalLight(0xfff0dc, 2.3);
  key.position.set(-3.2, 7, 4.5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.radius = 5;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  Object.assign(key.shadow.camera, { left: -3.6, right: 3.6, top: 4.2, bottom: -3, near: 1, far: 18 });
  scene.add(key);

  const camera = new PerspectiveCamera(26, 1, 0.1, 50);
  const TARGET = new Vector3(-0.05, 1.72, 0);
  const FIT_RADIUS = 2.55; // cabe a tampa à esquerda, a mascote no meio e a caneca à direita

  const logo = await new TextureLoader().loadAsync("/assets/img/marca/logo-768.webp");
  logo.colorSpace = SRGBColorSpace;
  logo.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const hearts = heartsTexture();
  hearts.anisotropy = 4;

  const rig = new Group(); // tudo: inclina de leve com o mouse
  scene.add(rig);
  const boxGroup = new Group();
  boxGroup.rotation.y = BOX_TURN;
  const { base, lid, tissue } = buildBox(hearts);
  boxGroup.add(base, tissue);
  const lidPivot = new Group(); // tampa: posição no mundo do rig, girada como a caixa
  lidPivot.add(lid);
  const mug = buildMug(logo);
  const mugPivot = new Group();
  mugPivot.add(mug);
  rig.add(boxGroup, lidPivot, mugPivot);

  const ground = new Mesh(new PlaneGeometry(14, 14).rotateX(-Math.PI / 2), new ShadowMaterial({ color: 0x3a2318, opacity: 0.2 }));
  ground.receiveShadow = true;
  const blob = new Mesh(
    new PlaneGeometry(3.6, 3.6).rotateX(-Math.PI / 2),
    new MeshBasicMaterial({ map: blobTexture(), transparent: true, depthWrite: false, opacity: 0.7 })
  );
  blob.position.y = 0.004;
  scene.add(ground, blob);

  /* ----- estado ----- */
  const s = {
    intro: 0, introOn: false, scrollClose: 0, open: 0, time: 0,
    px: 0, py: 0, tx: 0, ty: 0,
    spin: 0, spinVel: 0, dragging: false, lastX: 0, idle: 0, hold: false,
    running: false, visible: false, last: 0, frames: 0, slow: 0,
  };

  // Posiciona tudo para um valor de abertura (0 fechada → 1 aberta).
  function pose(open, t) {
    const lidT = smooth(clamp(open / 0.72, 0, 1));
    const mugT = clamp((open - 0.22) / 0.78, 0, 1);
    const rise = outBack(mugT);
    const float = Math.sin(t * 1.15) * open;
    const float2 = Math.sin(t * 0.9 + 1.3) * open;

    lidPivot.position.set(lerp(0, -1.72, lidT), lerp(BOX_H - LID_H / 2 + 0.02, 2.42, lidT) + Math.sin(Math.PI * lidT) * 0.28 + float2 * 0.035, lerp(0, -0.55, lidT));
    lidPivot.rotation.set(lerp(0, -0.2, lidT), BOX_TURN + lerp(0, 0.25, lidT), lerp(0, 0.46, lidT) + float2 * 0.012);

    const side = smooth(clamp((mugT - 0.3) / 0.7, 0, 1)); // primeiro sobe, depois vai para o lado
    mugPivot.position.set(lerp(0, 1.62, side), lerp(0.05, 0.95, rise) + Math.sin(Math.PI * mugT) * 1.45 + float * 0.04, lerp(0, 0.5, side));
    mugPivot.rotation.set(lerp(0, 0.06, mugT), 0, lerp(0, -0.13, smooth(mugT)) + float * 0.012);
    mugPivot.scale.setScalar(lerp(0.9, 0.74, smooth(mugT)));
    mug.rotation.y = s.spin * smooth(mugT);

    tissue.scale.setScalar(lerp(0.62, 1, smooth(clamp(open / 0.6, 0, 1))));
  }

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const vFov = MathUtils.degToRad(camera.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
    const dist = FIT_RADIUS / Math.sin(Math.min(vFov, hFov) / 2);
    const elev = 0.3; // câmera um pouco acima, para ver dentro da caixa
    camera.position.set(TARGET.x, TARGET.y + Math.sin(elev) * dist, Math.cos(elev) * dist);
    camera.lookAt(TARGET);
    camera.updateProjectionMatrix();
  }

  function readScroll() {
    const r = stage.getBoundingClientRect();
    // fecha a caixa enquanto o palco sai pelo topo da tela
    s.scrollClose = smooth(clamp((-r.top - r.height * 0.08) / (r.height * 0.62), 0, 1));
  }

  function frame(now) {
    const dt = Math.min((now - s.last) / 1000, 0.05);
    s.last = now;
    s.time += dt;

    if (s.introOn && s.intro < 1) s.intro = Math.min(1, s.intro + dt / 2.3);
    const target = inOut(s.intro) * (1 - (s.hold ? 0 : s.scrollClose)); // com a mascote dentro, a caixa não fecha
    s.open = s.intro < 1 ? target : s.open + (target - s.open) * (1 - Math.exp(-dt * 7));

    s.px += (s.tx - s.px) * (1 - Math.exp(-dt * 4));
    s.py += (s.ty - s.py) * (1 - Math.exp(-dt * 4));
    rig.rotation.y = s.px * 0.2;
    rig.rotation.x = s.py * 0.07;

    if (!s.dragging) {
      s.spin += s.spinVel * dt;
      s.spinVel *= Math.exp(-dt * 2.6);
      s.idle += dt;
      if (s.idle > 1.6) { // volta devagar a mostrar a arte de frente
        const home = Math.round(s.spin / (Math.PI * 2)) * Math.PI * 2;
        s.spin += (home - s.spin) * (1 - Math.exp(-dt * 2.2));
      }
    }

    pose(s.open, s.time);
    onFrame?.(dt, s);
    renderer.render(scene, camera);

    // Aparelho engasgando: baixa a resolução uma vez em vez de travar.
    if (s.intro >= 1 && s.frames < 90) {
      s.frames++;
      if (dt > 0.03) s.slow++;
      if (s.frames === 90 && s.slow > 40 && dpr > 1) {
        dpr = Math.max(1, dpr - 0.75);
        renderer.setPixelRatio(dpr);
        resize();
      }
    }
  }

  function setRunning() {
    const run = s.visible && !document.hidden;
    if (run === s.running) return;
    s.running = run;
    if (run) { s.last = performance.now(); renderer.setAnimationLoop(frame); }
    else renderer.setAnimationLoop(null);
  }

  /* ----- interação ----- */
  const onMove = (e) => {
    if (e.pointerType !== "mouse") return;
    s.tx = (e.clientX / window.innerWidth) * 2 - 1;
    s.ty = (e.clientY / window.innerHeight) * 2 - 1;
  };
  const onDown = (e) => {
    s.dragging = true; s.lastX = e.clientX; s.lastT = performance.now(); s.spinVel = 0; s.idle = 0;
    canvas.classList.add("is-drag");
    try { canvas.setPointerCapture(e.pointerId); } catch {}
    stage.dispatchEvent(new CustomEvent("lib:drag"));
  };
  const onDrag = (e) => {
    if (!s.dragging) return;
    const dx = e.clientX - s.lastX;
    s.lastX = e.clientX;
    const d = (dx / Math.max(stage.clientWidth, 1)) * 5;
    s.spin += d;
    const now = performance.now();
    const elapsed = Math.max((now - s.lastT) / 1000, 1 / 120);
    s.lastT = now;
    s.spinVel = clamp(lerp(s.spinVel, d / elapsed, 0.5), -7, 7); // inércia contida
  };
  const onUp = () => { s.dragging = false; s.idle = 0; canvas.classList.remove("is-drag"); };
  const onVis = () => setRunning();
  const onScroll = () => readScroll();

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVis);
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onDrag);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  const io = new IntersectionObserver(([entry]) => { s.visible = entry.isIntersecting; setRunning(); });
  io.observe(stage);

  let lost = false;
  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); lost = true; destroy(); stage.dispatchEvent(new CustomEvent("lib:lost")); });

  function destroy() {
    renderer.setAnimationLoop(null);
    ro.disconnect(); io.disconnect();
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("visibilitychange", onVis);
    scene.traverse((o) => {
      if (!o.isMesh) return;
      o.geometry.dispose();
      for (const m of [].concat(o.material)) { m.map?.dispose(); m.dispose(); }
    });
    scene.environment?.dispose();
    if (!lost) renderer.dispose();
    canvas.remove();
  }

  /* ----- primeira imagem ----- */
  resize();
  readScroll();
  pose(0, 0);
  renderer.compile(scene, camera);
  renderer.render(scene, camera);
  canvas.classList.add("is-ready");
  s.visible = true;
  setRunning();
  setTimeout(() => { s.introOn = true; }, 350); // abre depois que o canvas apareceu
  onReady?.();

  const api = { destroy, scene, camera, hold(v) { s.hold = v; }, get open() { return s.open; } };
  if (import.meta.env.DEV) {
    // Gera a imagem estática do topo a partir da própria cena (caixa aberta, parada).
    api.snapshot = async (w = 1500, h = 1650) => {
      renderer.setAnimationLoop(null);
      renderer.setPixelRatio(1);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const vFov = MathUtils.degToRad(camera.fov), hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
      const dist = FIT_RADIUS / Math.sin(Math.min(vFov, hFov) / 2);
      camera.position.set(TARGET.x, TARGET.y + Math.sin(0.3) * dist, Math.cos(0.3) * dist);
      camera.lookAt(TARGET);
      camera.updateProjectionMatrix();
      rig.rotation.set(0, 0, 0);
      s.spin = 0;
      pose(1, 0);
      renderer.render(scene, camera);
      const blobPng = await new Promise((r) => canvas.toBlob(r, "image/png"));
      const res = await fetch("/__poster", { method: "POST", body: blobPng });
      renderer.setPixelRatio(dpr);
      resize();
      s.running = false;
      setRunning();
      return res.ok ? blobPng.size : -1;
    };
    api.state = s;
  }
  return api;
}
