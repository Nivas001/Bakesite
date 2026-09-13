import * as THREE from "three";

/**
 * Builds and drives the WebGL cake used by the About page scroll story.
 *
 * The cake is assembled entirely from primitives rather than loaded from a
 * model file. The only GLB in this project is 30MB, which is far too heavy for
 * a scroll-triggered showpiece; primitives cost nothing to download and let the
 * five story chapters drive individual parts (sponge, cream, ganache, crown,
 * candles) independently.
 */

export interface CakeScene {
  /**
   * Advances the choreography.
   *
   * @param t       progress through the pinned section, 0 to 1
   * @param elapsed seconds since the scene was created, for idle motion
   * @param focusX  how far right of centre to sit, in world units — used to
   *                clear the copy column on wide layouts
   * @param focusY  how far above centre to sit — used on narrow layouts, where
   *                the copy panel is anchored to the bottom of the stage
   */
  update(t: number, elapsed: number, focusX: number, focusY: number): void;
  render(): void;
  resize(width: number, height: number): void;
  dispose(): void;
}

const PALETTE = {
  sponge: 0x6b3a18,
  cream: 0xf7e7ce,
  creamPink: 0xf6d3d0,
  ganache: 0x2a150c,
  berry: 0xc4123a,
  gold: 0xe8b54a,
  plate: 0xd9c08a,
  flame: 0xffb347,
};

/** Eases a 0-to-1 window out of the overall progress, for one chapter beat. */
function beat(t: number, start: number, end: number): number {
  if (t <= start) return 0;
  if (t >= end) return 1;
  const x = (t - start) / (end - start);
  return x * x * (3 - 2 * x); // smoothstep
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

interface Tier {
  group: THREE.Group;
  sponge: THREE.Mesh;
  cream: THREE.Mesh;
  ganacheRing: THREE.Mesh;
  drips: THREE.Group;
  restY: number;
}

export function createCakeScene(canvas: HTMLCanvasElement, quality: "high" | "low"): CakeScene {
  const segments = quality === "high" ? 64 : 28;
  const dripCount = quality === "high" ? 18 : 10;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: quality === "high",
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality === "high" ? 2 : 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = quality === "high";
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);

  // ---------------------------------------------------------------- lighting
  // Kept deliberately low: a bright ambient washes the cocoa tones out to a flat
  // grey-mauve, so most of the light comes from the key and rim instead.
  scene.add(new THREE.AmbientLight(0xffe7c4, 0.55));

  const key = new THREE.DirectionalLight(0xffd9a8, 3.1);
  key.position.set(4, 7, 5);
  key.castShadow = renderer.shadowMap.enabled;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 24;
  key.shadow.bias = -0.0012;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xffc2d1, 1.25);
  fill.position.set(-5, 2.5, 3);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xfff6ec, 2.4);
  rim.position.set(-2, 4, -6);
  scene.add(rim);

  // --------------------------------------------------------------- materials
  const track: Array<THREE.BufferGeometry | THREE.Material> = [];
  const keep = <T extends THREE.BufferGeometry | THREE.Material>(x: T): T => {
    track.push(x);
    return x;
  };

  const spongeMat = keep(
    new THREE.MeshStandardMaterial({ color: PALETTE.sponge, roughness: 0.92, metalness: 0.02 }),
  );
  const creamMat = keep(
    new THREE.MeshStandardMaterial({ color: PALETTE.cream, roughness: 0.72, metalness: 0 }),
  );
  const creamPinkMat = keep(
    new THREE.MeshStandardMaterial({ color: PALETTE.creamPink, roughness: 0.68, metalness: 0 }),
  );
  const ganacheMat = keep(
    new THREE.MeshStandardMaterial({ color: PALETTE.ganache, roughness: 0.22, metalness: 0.12 }),
  );
  const berryMat = keep(
    new THREE.MeshStandardMaterial({ color: PALETTE.berry, roughness: 0.36, metalness: 0.05 }),
  );
  const goldMat = keep(
    new THREE.MeshStandardMaterial({ color: PALETTE.gold, roughness: 0.18, metalness: 1 }),
  );
  const plateMat = keep(
    new THREE.MeshStandardMaterial({ color: PALETTE.plate, roughness: 0.3, metalness: 0.85 }),
  );
  const flameMat = keep(
    new THREE.MeshStandardMaterial({
      color: PALETTE.flame,
      emissive: new THREE.Color(PALETTE.flame),
      emissiveIntensity: 2.6,
      roughness: 1,
    }),
  );

  // ------------------------------------------------------------------- build
  const root = new THREE.Group();
  scene.add(root);

  const plate = new THREE.Mesh(
    keep(new THREE.CylinderGeometry(2.25, 2.35, 0.09, segments)),
    plateMat,
  );
  plate.position.y = -1.5;
  plate.receiveShadow = renderer.shadowMap.enabled;
  root.add(plate);

  const stem = new THREE.Mesh(
    keep(new THREE.CylinderGeometry(0.34, 0.6, 0.55, segments)),
    plateMat,
  );
  stem.position.y = -1.82;
  root.add(stem);

  const TIER_SPECS = [
    { radius: 1.58, height: 0.62, y: -1.1, cream: creamMat },
    { radius: 1.14, height: 0.56, y: -0.32, cream: creamPinkMat },
    { radius: 0.74, height: 0.5, y: 0.4, cream: creamMat },
  ];

  const tiers: Tier[] = TIER_SPECS.map((spec) => {
    const group = new THREE.Group();
    group.position.y = spec.y;

    const sponge = new THREE.Mesh(
      keep(new THREE.CylinderGeometry(spec.radius, spec.radius * 1.01, spec.height, segments)),
      spongeMat,
    );
    sponge.castShadow = renderer.shadowMap.enabled;
    sponge.receiveShadow = renderer.shadowMap.enabled;
    group.add(sponge);

    // Cream fillet that expands out from the centre between the sponge layers.
    const cream = new THREE.Mesh(
      keep(new THREE.CylinderGeometry(spec.radius * 1.03, spec.radius * 1.03, 0.14, segments)),
      spec.cream,
    );
    cream.position.y = spec.height / 2 + 0.07;
    cream.castShadow = renderer.shadowMap.enabled;
    group.add(cream);

    // Ganache collar sitting on the top edge of the tier.
    const ganacheRing = new THREE.Mesh(
      keep(new THREE.TorusGeometry(spec.radius * 1.02, 0.075, 12, segments)),
      ganacheMat,
    );
    ganacheRing.rotation.x = Math.PI / 2;
    ganacheRing.position.y = spec.height / 2 + 0.14;
    group.add(ganacheRing);

    // Individual drips hanging off that collar.
    const drips = new THREE.Group();
    drips.position.y = spec.height / 2 + 0.12;
    for (let i = 0; i < dripCount; i += 1) {
      const angle = (i / dripCount) * Math.PI * 2;
      // Deterministic pseudo-randomness: a hand-poured look that stays
      // identical between renders. Real ganache falls in a few long runs
      // between many short ones, so length and girth both vary a lot.
      const n1 = Math.sin(i * 12.9898) * 0.5 + 0.5;
      const n2 = Math.sin(i * 39.3467 + 1.7) * 0.5 + 0.5;
      const len = 0.07 + n1 * n1 * 0.32;
      const girth = 0.032 + n2 * 0.022;
      const drip = new THREE.Mesh(keep(new THREE.CapsuleGeometry(girth, len, 4, 8)), ganacheMat);
      drip.position.set(
        Math.cos(angle) * spec.radius * 1.02,
        -len / 2,
        Math.sin(angle) * spec.radius * 1.02,
      );
      drip.userData["len"] = len;
      drips.add(drip);
    }
    group.add(drips);

    root.add(group);
    return { group, sponge, cream, ganacheRing, drips, restY: spec.y };
  });

  // ----------------------------------------------------------------- topping
  const crown = new THREE.Group();
  crown.position.y = 0.72;
  root.add(crown);

  const berryGeo = keep(new THREE.IcosahedronGeometry(0.11, quality === "high" ? 2 : 1));
  const truffleGeo = keep(new THREE.IcosahedronGeometry(0.15, quality === "high" ? 2 : 1));
  const flakeGeo = keep(new THREE.TetrahedronGeometry(0.055));

  const crownPieces: THREE.Mesh[] = [];
  const CROWN_COUNT = quality === "high" ? 16 : 9;
  for (let i = 0; i < CROWN_COUNT; i += 1) {
    const angle = (i / CROWN_COUNT) * Math.PI * 2;
    const radius = 0.2 + (i % 3) * 0.16;
    const kind = i % 3;
    const mesh = new THREE.Mesh(
      kind === 0 ? truffleGeo : kind === 1 ? berryGeo : flakeGeo,
      kind === 0 ? ganacheMat : kind === 1 ? berryMat : goldMat,
    );
    mesh.position.set(Math.cos(angle) * radius, 0.06 + (i % 2) * 0.09, Math.sin(angle) * radius);
    mesh.castShadow = renderer.shadowMap.enabled;
    mesh.userData["restY"] = mesh.position.y;
    crown.add(mesh);
    crownPieces.push(mesh);
  }

  // ----------------------------------------------------------------- candles
  const candles = new THREE.Group();
  candles.position.y = 0.72;
  root.add(candles);

  const flames: THREE.Mesh[] = [];
  const CANDLE_COUNT = 5;
  const candleGeo = keep(new THREE.CylinderGeometry(0.035, 0.035, 0.42, 10));
  const flameGeo = keep(new THREE.ConeGeometry(0.055, 0.16, 8));
  for (let i = 0; i < CANDLE_COUNT; i += 1) {
    const angle = (i / CANDLE_COUNT) * Math.PI * 2 + 0.4;
    const x = Math.cos(angle) * 0.42;
    const z = Math.sin(angle) * 0.42;

    const stick = new THREE.Mesh(candleGeo, i % 2 === 0 ? creamPinkMat : creamMat);
    stick.position.set(x, 0.28, z);
    stick.castShadow = renderer.shadowMap.enabled;
    candles.add(stick);

    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(x, 0.56, z);
    candles.add(flame);
    flames.push(flame);
  }

  // Warm point light that comes up with the candles.
  const candleGlow = new THREE.PointLight(0xffb347, 0, 4.5, 2);
  candleGlow.position.set(0, 1.4, 0);
  root.add(candleGlow);

  // --------------------------------------------------------- floating motes
  const moteCount = quality === "high" ? 140 : 60;
  const motePositions = new Float32Array(moteCount * 3);
  for (let i = 0; i < moteCount; i += 1) {
    motePositions[i * 3] = (Math.random() - 0.5) * 9;
    motePositions[i * 3 + 1] = (Math.random() - 0.5) * 7;
    motePositions[i * 3 + 2] = (Math.random() - 0.5) * 6;
  }
  const moteGeo = keep(new THREE.BufferGeometry());
  moteGeo.setAttribute("position", new THREE.BufferAttribute(motePositions, 3));
  const moteMat = keep(
    new THREE.PointsMaterial({
      color: 0xffe2b8,
      size: 0.045,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  const motes = new THREE.Points(moteGeo, moteMat);
  scene.add(motes);

  // Soft contact shadow catcher.
  if (renderer.shadowMap.enabled) {
    const catcher = new THREE.Mesh(
      keep(new THREE.PlaneGeometry(14, 14)),
      keep(new THREE.ShadowMaterial({ opacity: 0.26 })),
    );
    catcher.rotation.x = -Math.PI / 2;
    catcher.position.y = -1.56;
    catcher.receiveShadow = true;
    scene.add(catcher);
  }

  // ------------------------------------------------------------ choreography
  let smoothedFocusX = 0;
  let smoothedFocusY = 0;

  function update(t: number, elapsed: number, focusX: number, focusY: number) {
    // Chapter beats overlap slightly so nothing pops into existence.
    const bSponge = beat(t, 0.0, 0.22);
    const bCream = beat(t, 0.18, 0.42);
    const bGanache = beat(t, 0.38, 0.63);
    const bCrown = beat(t, 0.58, 0.82);
    const bCandles = beat(t, 0.78, 0.97);

    tiers.forEach((tier, i) => {
      // Tiers rise into place and stack, bottom first.
      const local = beat(bSponge, i * 0.22, 0.5 + i * 0.22);
      tier.group.position.y = lerp(tier.restY - 3.4, tier.restY, local);
      tier.sponge.scale.setScalar(lerp(0.72, 1, local));

      tier.cream.scale.set(bCream, 1, bCream);
      tier.cream.visible = bCream > 0.01;

      tier.ganacheRing.scale.set(bGanache, bGanache, 1);
      tier.ganacheRing.visible = bGanache > 0.01;

      // Each drip extends downward on its own stagger.
      tier.drips.children.forEach((drip, j) => {
        const stagger = beat(bGanache, (j % 6) * 0.06, 0.45 + (j % 6) * 0.06);
        drip.scale.y = Math.max(0.001, stagger);
        const len = (drip.userData["len"] as number) ?? 0.3;
        drip.position.y = (-len / 2) * stagger;
        drip.visible = stagger > 0.02;
      });
    });

    // Crown pieces drop in.
    crownPieces.forEach((piece, i) => {
      const local = beat(bCrown, (i % 5) * 0.08, 0.45 + (i % 5) * 0.08);
      const restY = (piece.userData["restY"] as number) ?? 0.1;
      piece.position.y = lerp(restY + 2.2, restY, local);
      piece.scale.setScalar(local);
      piece.rotation.y = elapsed * 0.4 + i;
      piece.visible = local > 0.02;
    });

    // Candles rise, then the flames catch and flicker.
    candles.scale.setScalar(Math.max(0.001, bCandles));
    candles.visible = bCandles > 0.02;
    candleGlow.intensity = bCandles * 4.2;
    flames.forEach((flame, i) => {
      const flicker = 0.82 + Math.sin(elapsed * 9 + i * 2.1) * 0.14;
      flame.scale.set(flicker, 0.85 + flicker * 0.3, flicker);
    });

    root.rotation.y = t * Math.PI * 1.35 + elapsed * 0.08;
    root.position.y = smoothedFocusY + Math.sin(elapsed * 0.6) * 0.04;

    // Slide toward the requested side rather than snapping, so a resize across
    // the breakpoint reads as a move rather than a jump.
    //
    // Only the cake moves. Offsetting the camera by the same amount as well
    // would keep the cake centred in frame and cancel the whole effect.
    smoothedFocusX += (focusX - smoothedFocusX) * 0.08;
    smoothedFocusY += (focusY - smoothedFocusY) * 0.08;
    root.position.x = smoothedFocusX;

    // Camera pulls back and lifts as the cake completes.
    const dolly = beat(t, 0, 1);
    // Far enough back that the offset cake still clears the right edge at the
    // start of the sequence, where the camera is closest.
    camera.position.set(Math.sin(t * 0.6) * 0.6, lerp(-0.1, 1.7, dolly), lerp(7.7, 9.4, dolly));
    camera.lookAt(0, lerp(-0.55, 0.1, dolly), 0);

    motes.rotation.y = elapsed * 0.03;
    moteMat.opacity = 0.25 + bCandles * 0.5;
  }

  function render() {
    renderer.render(scene, camera);
  }

  function resize(width: number, height: number) {
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
  }

  function dispose() {
    for (const item of track) item.dispose();
    renderer.dispose();
  }

  return { update, render, resize, dispose };
}
