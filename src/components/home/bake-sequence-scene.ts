import * as THREE from "three";

/**
 * Builds and drives the WebGL bake sequence used by the homepage.
 *
 * One continuous shot: an empty mixing bowl takes flour, then water, is whisked
 * to batter, bakes and rises under glowing oven elements, is frosted in pink
 * buttercream, gains berries, and finishes as a bento cake with lettering
 * piped across the top.
 *
 * Everything is assembled from primitives, as in the About page cake scene —
 * the only model file in this project is 30MB, far too heavy for a section a
 * visitor scrolls past. Primitives cost nothing to download and let each beat
 * of the sequence drive its own parts.
 */

export interface BakeScene {
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
  bowl: 0xf3e5d0,
  bowlRim: 0xe0cbb0,
  worktop: 0xd9c3a6,
  flour: 0xfdf6ea,
  water: 0xbfe0ef,
  batter: 0xf0d79a,
  sponge: 0xc98a4b,
  spongeRaw: 0xf0d79a,
  tin: 0xb9b3a8,
  whisk: 0xc9ccd2,
  frosting: 0xf7c9d3,
  frostingLight: 0xffe9ef,
  berry: 0xc4123a,
  element: 0xff6a1f,
  gold: 0xe8b54a,
};

/** Eases a 0-to-1 window out of the overall progress, for one beat. */
function beat(t: number, start: number, end: number): number {
  if (t <= start) return 0;
  if (t >= end) return 1;
  const x = (t - start) / (end - start);
  return x * x * (3 - 2 * x); // smoothstep
}

/** A 0→1→0 window, for things that appear and then leave again. */
function pulse(t: number, start: number, peak: number, end: number): number {
  return t < peak ? beat(t, start, peak) : 1 - beat(t, peak, end);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Deterministic pseudo-randomness, so the scatter is identical every load. */
function rand(seed: number): number {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Draws the piped inscription onto a canvas so it can be mapped onto the cake.
 *
 * Real geometry for handwriting would mean a font loader and a text geometry
 * pass; a texture reads identically at this scale and costs one draw call.
 */
function makeInscriptionTexture(message: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const stack = '"Caveat", "Segoe Script", "Brush Script MT", cursive';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Which face this actually resolves to depends on the machine, and the
    // widths vary a lot between them. Measure at a reference size and scale to
    // fit, rather than trusting one hard-coded size not to run off the edge.
    const target = canvas.width * 0.82;
    ctx.font = `italic 700 92px ${stack}`;
    const measured = ctx.measureText(message).width;
    const size = measured > 0 ? Math.min(92, Math.floor((92 * target) / measured)) : 92;
    ctx.font = `italic 700 ${size}px ${stack}`;

    // A soft dark halo under the stroke, so the lettering still reads where it
    // crosses the lighter part of the buttercream.
    ctx.shadowColor = "rgba(120, 30, 60, 0.45)";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#8E2247";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

export function createBakeScene(canvas: HTMLCanvasElement, quality: "high" | "low"): BakeScene {
  const segments = quality === "high" ? 56 : 26;
  const grainCount = quality === "high" ? 46 : 22;
  const berryCount = quality === "high" ? 11 : 7;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: quality === "high",
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality === "high" ? 2 : 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = quality === "high";
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);

  // ---------------------------------------------------------------- lighting
  const ambient = new THREE.AmbientLight(0xffe7c4, 0.62);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffd9a8, 2.9);
  key.position.set(4, 7, 5);
  key.castShadow = renderer.shadowMap.enabled;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 24;
  key.shadow.bias = -0.0012;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xffc2d1, 1.1);
  fill.position.set(-5, 2.5, 3);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xfff6ec, 2.1);
  rim.position.set(-2, 4, -6);
  scene.add(rim);

  /** Warms and brightens only while the cake is in the oven. */
  const ovenLight = new THREE.PointLight(0xff7a24, 0, 14, 2);
  ovenLight.position.set(0, 0.4, 1.6);
  scene.add(ovenLight);

  // --------------------------------------------------------------- materials
  const track: Array<THREE.BufferGeometry | THREE.Material | THREE.Texture> = [];
  const keep = <T extends THREE.BufferGeometry | THREE.Material | THREE.Texture>(x: T): T => {
    track.push(x);
    return x;
  };

  const bowlMat = keep(
    new THREE.MeshStandardMaterial({
      color: PALETTE.bowl,
      roughness: 0.42,
      metalness: 0.04,
      side: THREE.DoubleSide,
      transparent: true,
    }),
  );
  const worktopMat = keep(
    new THREE.MeshStandardMaterial({ color: PALETTE.worktop, roughness: 0.94, metalness: 0 }),
  );
  const flourMat = keep(
    new THREE.MeshStandardMaterial({
      color: PALETTE.flour,
      roughness: 1,
      metalness: 0,
      transparent: true,
    }),
  );
  const waterMat = keep(
    new THREE.MeshStandardMaterial({
      color: PALETTE.water,
      roughness: 0.12,
      metalness: 0.1,
      transparent: true,
      opacity: 0.72,
    }),
  );
  const batterMat = keep(
    new THREE.MeshStandardMaterial({
      color: PALETTE.batter,
      roughness: 0.66,
      metalness: 0,
      transparent: true,
    }),
  );
  const whiskMat = keep(
    new THREE.MeshStandardMaterial({
      color: PALETTE.whisk,
      roughness: 0.22,
      metalness: 0.92,
      transparent: true,
    }),
  );
  const tinMat = keep(
    new THREE.MeshStandardMaterial({
      color: PALETTE.tin,
      roughness: 0.34,
      metalness: 0.85,
      transparent: true,
      side: THREE.DoubleSide,
    }),
  );
  const spongeMat = keep(
    new THREE.MeshStandardMaterial({
      color: PALETTE.spongeRaw,
      roughness: 0.88,
      metalness: 0.02,
      transparent: true,
    }),
  );
  const frostingMat = keep(
    new THREE.MeshStandardMaterial({
      color: PALETTE.frosting,
      roughness: 0.62,
      metalness: 0,
      transparent: true,
    }),
  );
  const frostingLightMat = keep(
    new THREE.MeshStandardMaterial({
      color: PALETTE.frostingLight,
      roughness: 0.58,
      metalness: 0,
      transparent: true,
    }),
  );
  const berryMat = keep(
    new THREE.MeshStandardMaterial({
      color: PALETTE.berry,
      roughness: 0.34,
      metalness: 0.04,
      transparent: true,
    }),
  );
  const goldMat = keep(
    new THREE.MeshStandardMaterial({
      color: PALETTE.gold,
      roughness: 0.18,
      metalness: 1,
      transparent: true,
    }),
  );
  const elementMat = keep(
    new THREE.MeshStandardMaterial({
      color: PALETTE.element,
      emissive: new THREE.Color(PALETTE.element),
      emissiveIntensity: 3.4,
      roughness: 1,
      transparent: true,
    }),
  );

  const inscriptionTex = keep(makeInscriptionTexture("Happy Birthday"));
  const inscriptionMat = keep(
    new THREE.MeshBasicMaterial({
      map: inscriptionTex,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    }),
  );

  // ------------------------------------------------------------------- build
  const root = new THREE.Group();
  scene.add(root);

  // Worktop the whole sequence happens on.
  // Sized to read as the board the bowl stands on, not as a platter. At the
  // radius this started at it filled most of the lower frame and the bowl read
  // as an ornament sitting on a beige disc.
  const worktop = new THREE.Mesh(
    keep(new THREE.CylinderGeometry(2.05, 2.2, 0.14, segments)),
    worktopMat,
  );
  worktop.position.y = -1.58;
  worktop.receiveShadow = renderer.shadowMap.enabled;
  root.add(worktop);

  // ---- The bowl -----------------------------------------------------------
  // A lathe profile rather than a hemisphere, so it has a proper flared rim and
  // a foot it can stand on.
  const bowlProfile: THREE.Vector2[] = [];
  for (let i = 0; i <= 14; i += 1) {
    const u = i / 14;
    // Quarter-ellipse flaring out toward the rim.
    const radius = 0.42 + Math.sin(u * Math.PI * 0.5) * 1.28;
    const y = -1.02 + u * 1.16;
    bowlProfile.push(new THREE.Vector2(radius, y));
  }
  bowlProfile.push(new THREE.Vector2(1.78, 0.2));

  const bowl = new THREE.Mesh(keep(new THREE.LatheGeometry(bowlProfile, segments)), bowlMat);
  bowl.castShadow = renderer.shadowMap.enabled;
  bowl.receiveShadow = renderer.shadowMap.enabled;
  root.add(bowl);

  const bowlFoot = new THREE.Mesh(
    keep(new THREE.CylinderGeometry(0.52, 0.62, 0.16, segments)),
    keep(
      new THREE.MeshStandardMaterial({ color: PALETTE.bowlRim, roughness: 0.5, transparent: true }),
    ),
  );
  bowlFoot.position.y = -1.44;
  root.add(bowlFoot);

  const bowlGroup = new THREE.Group();
  bowlGroup.add(bowl, bowlFoot);
  root.add(bowlGroup);

  // ---- Falling flour ------------------------------------------------------
  const flourStream = new THREE.Group();
  const grainGeo = keep(new THREE.SphereGeometry(0.055, 6, 5));
  for (let i = 0; i < grainCount; i += 1) {
    const grain = new THREE.Mesh(grainGeo, flourMat);
    grain.userData["phase"] = rand(i + 1);
    grain.userData["radius"] = rand(i + 7) * 0.5;
    grain.userData["angle"] = rand(i + 13) * Math.PI * 2;
    flourStream.add(grain);
  }
  root.add(flourStream);

  // The mound of flour that builds up inside the bowl.
  const flourMound = new THREE.Mesh(keep(new THREE.SphereGeometry(0.92, segments, 18)), flourMat);
  flourMound.position.y = -0.62;
  flourMound.scale.set(1, 0.52, 1);
  flourMound.castShadow = renderer.shadowMap.enabled;
  root.add(flourMound);

  // ---- Water pour ---------------------------------------------------------
  const waterStream = new THREE.Mesh(
    keep(new THREE.CylinderGeometry(0.075, 0.11, 2.6, 14, 1, true)),
    waterMat,
  );
  waterStream.position.y = 1.5;
  root.add(waterStream);

  // ---- Batter in the bowl -------------------------------------------------
  const batter = new THREE.Mesh(
    keep(new THREE.CylinderGeometry(1.3, 1.02, 0.42, segments)),
    batterMat,
  );
  batter.position.y = -0.58;
  root.add(batter);

  // ---- The whisk ----------------------------------------------------------
  const whisk = new THREE.Group();
  const handle = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.1, 0.13, 1.25, 14)), whiskMat);
  handle.position.y = 1.15;
  whisk.add(handle);
  const wireGeo = keep(new THREE.TorusGeometry(0.34, 0.028, 7, 22, Math.PI));
  for (let i = 0; i < 6; i += 1) {
    const wire = new THREE.Mesh(wireGeo, whiskMat);
    wire.rotation.z = Math.PI; // open end upward
    wire.rotation.y = (i / 6) * Math.PI;
    wire.position.y = 0.42;
    wire.scale.set(1, 1.5, 1);
    whisk.add(wire);
  }
  root.add(whisk);

  // ---- Baking tin ---------------------------------------------------------
  const tin = new THREE.Mesh(
    keep(new THREE.CylinderGeometry(1.24, 1.14, 0.62, segments, 1, true)),
    tinMat,
  );
  tin.position.y = -0.94;
  tin.castShadow = renderer.shadowMap.enabled;
  root.add(tin);

  // ---- The cake itself ----------------------------------------------------
  const cakeGroup = new THREE.Group();
  root.add(cakeGroup);

  const sponge = new THREE.Mesh(
    keep(new THREE.CylinderGeometry(1.12, 1.1, 1, segments)),
    spongeMat,
  );
  sponge.castShadow = renderer.shadowMap.enabled;
  sponge.receiveShadow = renderer.shadowMap.enabled;
  cakeGroup.add(sponge);

  // ---- Frosting -----------------------------------------------------------
  const frostingGroup = new THREE.Group();
  cakeGroup.add(frostingGroup);

  // The coat around the sides.
  const coat = new THREE.Mesh(
    keep(new THREE.CylinderGeometry(1.17, 1.15, 1.02, segments)),
    frostingMat,
  );
  frostingGroup.add(coat);

  // A flat top the lettering sits on.
  const frostingTop = new THREE.Mesh(
    keep(new THREE.CylinderGeometry(1.17, 1.17, 0.09, segments)),
    frostingLightMat,
  );
  frostingGroup.add(frostingTop);

  // Piped rosettes around the top edge.
  const rosettes = new THREE.Group();
  const rosetteGeo = keep(new THREE.SphereGeometry(0.15, 12, 10));
  const rosetteCount = quality === "high" ? 14 : 9;
  for (let i = 0; i < rosetteCount; i += 1) {
    const angle = (i / rosetteCount) * Math.PI * 2;
    const rosette = new THREE.Mesh(rosetteGeo, frostingLightMat);
    rosette.position.set(Math.cos(angle) * 1.02, 0, Math.sin(angle) * 1.02);
    rosette.scale.set(1, 0.78, 1);
    rosette.userData["index"] = i;
    rosettes.add(rosette);
  }
  frostingGroup.add(rosettes);

  // ---- Berries ------------------------------------------------------------
  const berries = new THREE.Group();
  const berryGeo = keep(new THREE.SphereGeometry(0.15, 12, 10));
  const leafGeo = keep(new THREE.SphereGeometry(0.16, 8, 6));
  for (let i = 0; i < berryCount; i += 1) {
    const angle = rand(i + 21) * Math.PI * 2;
    // Kept to an outer ring. Scattered across the whole top they sat straight
    // over the inscription and hid it.
    const radius = 0.68 + rand(i + 31) * 0.3;
    const berry = new THREE.Mesh(
      i % 4 === 3 ? leafGeo : berryGeo,
      i % 4 === 3 ? goldMat : berryMat,
    );
    berry.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    berry.scale.setScalar(0.8 + rand(i + 41) * 0.5);
    berry.userData["index"] = i;
    berries.add(berry);
  }
  cakeGroup.add(berries);

  // ---- Piped inscription --------------------------------------------------
  // The lettering leans toward the viewer rather than lying dead flat: the
  // camera only looks down on the cake by about 15 degrees, and at that angle a
  // flat plane foreshortens into an unreadable smear.
  const inscription = new THREE.Mesh(keep(new THREE.PlaneGeometry(1.62, 0.81)), inscriptionMat);
  inscription.rotation.x = -Math.PI / 2 + 0.62;
  inscription.position.z = 0.1;
  // Its own pivot, so it can be held facing front while the cake turns.
  const inscriptionPivot = new THREE.Group();
  inscriptionPivot.add(inscription);
  cakeGroup.add(inscriptionPivot);

  // ---- Oven elements ------------------------------------------------------
  // Two glowing bars rather than a modelled oven box: they read unmistakably as
  // "in the oven" from any camera angle, and nothing has to slide through a
  // door that would need its own hinge and clearance choreography.
  const ovenElements = new THREE.Group();
  const barGeo = keep(new THREE.TorusGeometry(1.5, 0.05, 8, 40));
  for (let i = 0; i < 2; i += 1) {
    const bar = new THREE.Mesh(barGeo, elementMat);
    bar.rotation.x = Math.PI / 2;
    bar.position.y = i === 0 ? 1.55 : -1.35;
    ovenElements.add(bar);
  }
  root.add(ovenElements);

  // Heat haze: a ring of motes rising off the cake while it bakes.
  const heatGroup = new THREE.Group();
  const heatGeo = keep(new THREE.SphereGeometry(0.05, 6, 5));
  const heatMat = keep(
    new THREE.MeshBasicMaterial({ color: 0xffb066, transparent: true, opacity: 0 }),
  );
  const heatCount = quality === "high" ? 26 : 12;
  for (let i = 0; i < heatCount; i += 1) {
    const mote = new THREE.Mesh(heatGeo, heatMat);
    mote.userData["phase"] = rand(i + 53);
    mote.userData["angle"] = rand(i + 61) * Math.PI * 2;
    mote.userData["radius"] = 0.3 + rand(i + 71) * 0.95;
    heatGroup.add(mote);
  }
  root.add(heatGroup);

  // Soft contact shadow catcher.
  if (renderer.shadowMap.enabled) {
    const catcher = new THREE.Mesh(
      keep(new THREE.PlaneGeometry(16, 16)),
      keep(new THREE.ShadowMaterial({ opacity: 0.24 })),
    );
    catcher.rotation.x = -Math.PI / 2;
    catcher.position.y = -1.5;
    catcher.receiveShadow = true;
    scene.add(catcher);
  }

  // ------------------------------------------------------------ choreography
  let smoothedFocusX = 0;
  let smoothedFocusY = 0;

  const spongeColour = new THREE.Color();
  const rawColour = new THREE.Color(PALETTE.spongeRaw);
  const bakedColour = new THREE.Color(PALETTE.sponge);

  function update(t: number, elapsed: number, focusX: number, focusY: number) {
    // Six beats, overlapping slightly so nothing pops into existence.
    const bFlour = beat(t, 0.1, 0.3); // flour pours in
    const bWater = pulse(t, 0.28, 0.38, 0.46); // water pours, then stops
    const bMix = beat(t, 0.3, 0.5); // whisk works it to batter
    const bBake = beat(t, 0.5, 0.7); // into the oven, rises
    const bFrost = beat(t, 0.68, 0.86); // buttercream and berries
    const bPipe = beat(t, 0.86, 1); // lettering piped on

    // ---- bowl: present until the tin takes over -------------------------
    const bowlOut = beat(t, 0.5, 0.6);
    bowlMat.opacity = 1 - bowlOut;
    bowlFoot.visible = bowlOut < 0.99;
    bowlGroup.visible = bowlOut < 0.99;
    bowlGroup.scale.setScalar(lerp(1, 0.86, bowlOut));
    bowlGroup.position.y = lerp(0, -0.5, bowlOut);

    // ---- falling flour ---------------------------------------------------
    const pouring = pulse(t, 0.1, 0.2, 0.3);
    flourStream.visible = pouring > 0.02;
    flourMat.opacity = Math.max(bFlour, pouring);
    flourStream.children.forEach((grain, i) => {
      const phase = (grain.userData["phase"] as number) ?? 0;
      // Each grain loops top-to-bowl on its own offset, so the stream is
      // continuous rather than a single falling clump.
      const fall = (elapsed * 1.05 + phase) % 1;
      const angle = (grain.userData["angle"] as number) ?? 0;
      const radius = ((grain.userData["radius"] as number) ?? 0) * (0.35 + fall * 0.5);
      grain.position.set(
        Math.cos(angle) * radius,
        lerp(2.5, -0.45, fall),
        Math.sin(angle) * radius,
      );
      grain.scale.setScalar(pouring * (1 - fall * 0.35));
      grain.visible = i / grainCount < pouring * 1.3;
    });

    // ---- mound of flour --------------------------------------------------
    // Grows as it pours, then collapses into batter as the whisk works.
    const moundSize = bFlour * (1 - bMix);
    flourMound.visible = moundSize > 0.02;
    flourMound.scale.set(moundSize, moundSize * 0.52, moundSize);
    flourMound.position.y = -0.62 + moundSize * 0.12;

    // ---- water -----------------------------------------------------------
    waterStream.visible = bWater > 0.02;
    waterMat.opacity = bWater * 0.72;
    waterStream.scale.y = lerp(0.2, 1, bWater);
    waterStream.position.y = 1.5 - (1 - bWater) * 0.3;

    // ---- batter ----------------------------------------------------------
    // Appears under the whisk and stays until the tin takes over.
    const batterIn = bMix * (1 - beat(t, 0.5, 0.58));
    batter.visible = batterIn > 0.02;
    batterMat.opacity = batterIn;
    batter.scale.set(lerp(0.5, 1, bMix), lerp(0.4, 1, bMix), lerp(0.5, 1, bMix));
    // A slow wobble while it is being beaten.
    batter.rotation.y = elapsed * 1.6 * bMix;
    batter.position.y = -0.58 + Math.sin(elapsed * 7) * 0.02 * bMix * (1 - bBake);

    // ---- whisk -----------------------------------------------------------
    const whiskIn = pulse(t, 0.3, 0.42, 0.54);
    whisk.visible = whiskIn > 0.02;
    whiskMat.opacity = whiskIn;
    whisk.position.y = lerp(2.2, -0.35, whiskIn);
    whisk.rotation.y = elapsed * 7.5;
    // Beats around the bowl rather than spinning on the spot.
    whisk.position.x = Math.cos(elapsed * 4.5) * 0.3 * whiskIn;
    whisk.position.z = Math.sin(elapsed * 4.5) * 0.3 * whiskIn;

    // ---- tin -------------------------------------------------------------
    const tinIn = beat(t, 0.52, 0.62) * (1 - beat(t, 0.72, 0.8));
    tin.visible = tinIn > 0.02;
    tinMat.opacity = tinIn;
    tin.scale.setScalar(lerp(0.8, 1, beat(t, 0.52, 0.62)));

    // ---- the cake --------------------------------------------------------
    const cakeIn = beat(t, 0.52, 0.64);
    cakeGroup.visible = cakeIn > 0.02;
    spongeMat.opacity = cakeIn;

    // Rises in the oven: low batter puck grows to a domed sponge.
    const risen = lerp(0.34, 1.05, bBake);
    sponge.scale.set(lerp(0.96, 1, bBake), risen, lerp(0.96, 1, bBake));
    sponge.position.y = -0.92 + (risen * 1) / 2;
    // and browns as it goes.
    spongeColour.copy(rawColour).lerp(bakedColour, bBake);
    spongeMat.color.copy(spongeColour);

    const cakeTopY = sponge.position.y + risen / 2;

    // ---- oven elements ---------------------------------------------------
    const ovenOn = pulse(t, 0.5, 0.6, 0.72);
    ovenElements.visible = ovenOn > 0.02;
    elementMat.opacity = ovenOn;
    elementMat.emissiveIntensity = 2.2 + ovenOn * 2.4 + Math.sin(elapsed * 3) * 0.3;
    ovenLight.intensity = ovenOn * 7;
    // The room dims and warms while the oven is on.
    ambient.intensity = lerp(0.62, 0.4, ovenOn);
    key.intensity = lerp(2.9, 1.5, ovenOn);

    heatMat.opacity = ovenOn * 0.55;
    heatGroup.visible = ovenOn > 0.02;
    heatGroup.children.forEach((mote) => {
      const phase = (mote.userData["phase"] as number) ?? 0;
      const rise = (elapsed * 0.45 + phase) % 1;
      const angle = (mote.userData["angle"] as number) ?? 0;
      const radius = (mote.userData["radius"] as number) ?? 0.5;
      mote.position.set(
        Math.cos(angle + rise * 1.4) * radius,
        lerp(cakeTopY - 0.2, cakeTopY + 2.1, rise),
        Math.sin(angle + rise * 1.4) * radius,
      );
      mote.scale.setScalar((1 - rise) * 0.9);
    });

    // ---- frosting --------------------------------------------------------
    frostingGroup.visible = bFrost > 0.02;
    frostingMat.opacity = bFrost;
    frostingLightMat.opacity = bFrost;

    // The coat sweeps up around the sides.
    const coatH = risen * 1.02 * bFrost;
    coat.scale.set(1, Math.max(0.001, bFrost), 1);
    coat.position.y = sponge.position.y + (coatH - risen * 1.02) / 2;
    coat.visible = bFrost > 0.02;

    frostingTop.position.y = cakeTopY + 0.04;
    frostingTop.scale.setScalar(Math.max(0.001, beat(bFrost, 0.25, 0.75)));

    rosettes.position.y = cakeTopY + 0.08;
    rosettes.children.forEach((rosette) => {
      const index = (rosette.userData["index"] as number) ?? 0;
      // Piped one after another around the rim.
      const local = beat(
        bFrost,
        0.3 + (index / rosetteCount) * 0.45,
        0.55 + (index / rosetteCount) * 0.45,
      );
      rosette.scale.set(local, local * 0.78, local);
      rosette.visible = local > 0.02;
    });

    // ---- berries ---------------------------------------------------------
    berryMat.opacity = bFrost;
    goldMat.opacity = bFrost;
    berries.position.y = cakeTopY + 0.16;
    berries.children.forEach((berry) => {
      const index = (berry.userData["index"] as number) ?? 0;
      const local = beat(bFrost, 0.55 + (index % 5) * 0.06, 0.85 + (index % 5) * 0.06);
      // Drop in from above and settle.
      berry.position.y = lerp(1.8, 0, local);
      const size = 0.8 + rand(index + 41) * 0.5;
      berry.scale.setScalar(local * size);
      berry.visible = local > 0.02;
    });

    // ---- inscription -----------------------------------------------------
    inscriptionPivot.visible = bPipe > 0.02;
    inscriptionMat.opacity = bPipe;
    inscriptionPivot.position.y = cakeTopY + 0.13;
    inscriptionPivot.scale.setScalar(lerp(0.82, 1, bPipe));
    // Cancels the turntable so the writing always faces the camera. Without
    // this the cake finishes 200-odd degrees round and the name is on the far
    // side of the bake.
    inscriptionPivot.rotation.y = -root.rotation.y;

    // ---- staging ---------------------------------------------------------
    // Exactly one full turn across the sequence, so the cake finishes facing
    // the camera the same way it started. The idle drift fades out over the
    // last beat so the finished bake settles instead of creeping.
    root.rotation.y = t * Math.PI * 2 + elapsed * 0.07 * (1 - bPipe);

    smoothedFocusX += (focusX - smoothedFocusX) * 0.08;
    smoothedFocusY += (focusY - smoothedFocusY) * 0.08;
    root.position.x = smoothedFocusX;
    root.position.y = smoothedFocusY + Math.sin(elapsed * 0.6) * 0.035;

    // Camera pushes in for the mixing detail, then pulls back for the finish.
    const dolly = beat(t, 0, 1);
    const closeUp = pulse(t, 0.12, 0.4, 0.66);
    // Far enough back that the bowl and the board both sit inside the frame
    // with air around them; the close-up only leans in for the mixing beat.
    camera.position.set(
      Math.sin(t * 0.7) * 0.5,
      lerp(1.9, 3.1, dolly) - closeUp * 0.45,
      lerp(9.4, 10.6, dolly) - closeUp * 1.3,
    );
    camera.lookAt(0, lerp(-0.45, 0.2, dolly), 0);
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
