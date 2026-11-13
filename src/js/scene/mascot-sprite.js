/* Mascote dentro da caixa 3D do topo.
   Ela é um plano com a textura do PNG, sempre de frente para a câmera, com a
   base dentro da caixa: a parede da frente esconde a cintura, então os gestos
   de cintura para cima funcionam aqui. Este módulo também diz à página onde
   ela está na tela, para o botão/balão e para a passagem 3D → página. */
import { LinearFilter, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace, TextureLoader, Vector3 } from "three";
import { gsap } from "gsap";
import { MOTION as M } from "../mascot/motion-tokens.js";
import { SETS, setOf, url } from "../mascot/poses.js";

const HEAD = 1.0;    // largura da cabeça, em unidades da cena (1 = 10 cm)
const UP = 1.4;      // altura da base (cintura) quando ela está para fora
const SUNK = -0.45;  // escondida dentro da caixa
const OPEN_ENOUGH = 0.82;

export function createMascotSprite(api, stage, slot) {
  const { scene, camera } = api;
  const loader = new TextureLoader(), textures = new Map();
  const texture = (name) => {
    if (!textures.has(name)) {
      textures.set(name, loader.loadAsync(url(name)).then((t) => {
        t.colorSpace = SRGBColorSpace; t.generateMipmaps = false; t.minFilter = LinearFilter;
        return t;
      }));
    }
    return textures.get(name);
  };

  const geo = new PlaneGeometry(1, 1);
  geo.translate(0, 0.5, 0); // pivô na base
  const mat = new MeshBasicMaterial({ transparent: true, alphaTest: 0.02, depthWrite: false, toneMapped: false });
  const mesh = new Mesh(geo, mat);
  mesh.visible = false;
  mesh.renderOrder = 5;
  scene.add(mesh);

  const st = { y: SUNK, sx: 1, sy: 1, rot: 0, w: 1.3, h: 1.6 };
  let token = 0;

  async function setPose(name) {
    const t = await texture(name);
    const s = SETS[setOf(name)];
    mat.map = t; mat.needsUpdate = true;
    st.w = (s.w / s.head) * HEAD; st.h = (s.h / s.head) * HEAD;
  }

  // chamado a cada quadro pela cena
  function update() {
    if (!mesh.visible) return;
    mesh.position.set(0, st.y, 0);
    mesh.quaternion.copy(camera.quaternion);
    mesh.rotateZ(st.rot);
    mesh.scale.set(st.w * st.sx, st.h * st.sy, 1);
  }

  // onde ela está na tela (base e tamanho da cabeça), em px do palco
  const v = new Vector3();
  function project(y) {
    v.set(0, y, 0).project(camera);
    return { x: ((v.x + 1) / 2) * stage.clientWidth, y: ((1 - v.y) / 2) * stage.clientHeight };
  }
  function measure() {
    const a = project(UP), b = project(UP + st.h);
    return { x: a.x, y: a.y, head: ((a.y - b.y) / st.h) * HEAD };
  }
  function layout() { const m = measure(); gsap.set(slot, { x: Math.round(m.x), y: Math.round(m.y) }); }

  const waitOpen = (mine) => new Promise((resolve) => {
    const tick = () => { if (mine !== token || api.open >= OPEN_ENOUGH) { gsap.ticker.remove(tick); resolve(); } };
    gsap.ticker.add(tick);
  });

  return {
    update, layout,
    head: () => measure().head,
    anchorRect() { const r = stage.getBoundingClientRect(), m = measure(); return { left: r.left + m.x, top: r.top + m.y, bottom: r.top + m.y, width: 0, height: 0 }; },

    // A tampa abre e ela sobe de dentro da caixa.
    async enter(pose) {
      const mine = ++token;
      api.hold(true);                       // a caixa não fecha com ela dentro
      await setPose(pose);
      await waitOpen(mine);
      if (mine !== token) return;
      layout();
      gsap.killTweensOf(st);
      Object.assign(st, { y: SUNK, sx: 1, sy: 1, rot: 0 });
      mesh.visible = true;
      await gsap.to(st, { y: UP, duration: 0.7, ease: "back.out(1.5)" });
    },
    // Amassa e some no mesmo quadro em que a imagem da página assume.
    async leave() {
      ++token;
      gsap.killTweensOf(st);
      if (mesh.visible) await gsap.to(st, { sx: M.pop.squash[0], sy: M.pop.squash[1], duration: M.pop.in, ease: "power2.in" });
      mesh.visible = false;
      api.hold(false);
    },
    async pop(name) {
      const mine = token;
      await texture(name);
      await gsap.to(st, { sx: M.pop.squash[0], sy: M.pop.squash[1], duration: M.pop.in, ease: "power2.in" });
      if (mine !== token) return;
      await setPose(name);
      gsap.timeline()
        .to(st, { sx: M.pop.stretch[0], sy: M.pop.stretch[1], duration: M.pop.out, ease: "power2.out" })
        .to(st, { sx: 1, sy: 1, duration: M.pop.settle, ease: "elastic.out(1,0.5)" });
    },
    hop() {
      gsap.timeline()
        .to(st, { y: UP - 0.08, duration: 0.1, ease: "power2.in" })
        .to(st, { y: UP + 0.1, duration: 0.2, ease: "power2.out" })
        .to(st, { y: UP, duration: 0.45, ease: "bounce.out" });
    },
    wave() {
      gsap.timeline()
        .to(st, { rot: 0.07, duration: 0.18, ease: "sine.inOut" })
        .to(st, { rot: -0.06, duration: 0.22, yoyo: true, repeat: 3, ease: "sine.inOut" })
        .to(st, { rot: 0, duration: 0.2, ease: "sine.inOut" });
    },
    destroy() { ++token; gsap.killTweensOf(st); scene.remove(mesh); geo.dispose(); mat.dispose(); textures.forEach((p) => p.then((t) => t.dispose())); },
  };
}
