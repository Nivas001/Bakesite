import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  Sparkles,
  RotateCw,
  Maximize2,
  Minimize2,
  Layers,
  Flame,
  Info,
  Check,
  ChevronRight,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CakeModelItem {
  id: string;
  name: string;
  tag: string;
  badge: string;
  status: "available" | "coming_soon";
  modelUrl?: string;
  thumbnail: string;
  calories: string;
  protein: string;
  sugar: string;
  butter: string;
  description: string;
}

export const BAKERY_3D_MODELS: CakeModelItem[] = [
  {
    id: "choco-cake",
    name: "Belgian Dark Chocolate & Caramel Cake",
    tag: "Studio 3D Masterpiece",
    badge: "Interactive 3D GLB Model",
    status: "available",
    modelUrl: "/models/choco-cake.glb",
    thumbnail: "/about/cake-3d-front.jpg",
    calories: "185 kcal",
    protein: "14g",
    sugar: "0g Refined",
    butter: "84% French",
    description:
      "A 3-tier celebration cake rendered in full 3D. Features 70% dark Belgian cocoa sponge, hand-piped salted caramel swirls, slow-dripping couverture ganache, and edible 24K gold-dusted truffle spheres.",
  },
  {
    id: "birthday-cake",
    name: "Royal Celebration Birthday Cake",
    tag: "Celebration 3D Masterpiece",
    badge: "Interactive 3D FBX Model",
    status: "available",
    modelUrl: "/models/birthday-cake/3d-casual-life-birthday-cake.fbx",
    thumbnail: "/illustration/open-gift-box-with-candy-cane-and-christmas-ornament-holiday-celebration-and-party.png",
    calories: "175 kcal",
    protein: "12g",
    sugar: "Organic Monkfruit",
    butter: "Pure Dairy Butter",
    description:
      "Festive celebration birthday cake rendered in 3D. Layered with vanilla bean sponge, strawberry glaze rosettes, and edible sugar pearls.",
  },
  {
    id: "sourdough-boule",
    name: "36-Hour Wild Sourdough Boule",
    tag: "Ancient Grains",
    badge: "3D Model Coming Soon",
    status: "coming_soon",
    thumbnail: "/hero/hero-3d-cookie.jpg",
    calories: "140 kcal",
    protein: "8g",
    sugar: "0g Added",
    butter: "100% Vegan",
    description:
      "Stone-milled unbleached organic flour fermented for 36 hours. Blistered blister-ear crust and open custard-like wild crumb alveoli.",
  },
  {
    id: "mango-cheesecake",
    name: "Alphonso Mango Glaze Cheesecake",
    tag: "Summer Harvest",
    badge: "3D Model Coming Soon",
    status: "coming_soon",
    thumbnail: "/hero/hero-3d-mango-cheesecake.jpg",
    calories: "195 kcal",
    protein: "11g",
    sugar: "Monkfruit Sweetened",
    butter: "Grass-fed Cream",
    description:
      "Velvety cold-set Philadelphia cream cheese base topped with sun-ripened Ratnagiri Alphonso mango reduction and almond flour crust.",
  },
  {
    id: "strawberry-donut",
    name: "Pink Glazed Brioche Donut",
    tag: "Morning Dawn Bake",
    badge: "3D Model Coming Soon",
    status: "coming_soon",
    thumbnail: "/hero/hero-3d-donut-sprinkles.jpg",
    calories: "165 kcal",
    protein: "9g",
    sugar: "0g Refined",
    butter: "French Brioche",
    description:
      "Slow-proofed brioche dough fried in cold-pressed coconut oil, finished with real strawberry puree glaze and natural crunchy nonpareils.",
  },
];

/**
 * Safely renders mixed alphanumeric text so numbers/symbols use clean Inter font
 * and letters use the custom Blogh display font without broken tofu characters.
 */
export function SafeBloghText({ text, className = "" }: { text: string; className?: string }) {
  // Split on numbers, 3D, %, °, &, and special digits
  const parts = text.split(/(\d+[°%kK\w-]*|3D|&)/g);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (!part) return null;
        if (/^(\d|3D|&)/.test(part)) {
          return (
            <span key={i} className="font-sans font-black tracking-normal">
              {part}
            </span>
          );
        }
        return (
          <span key={i} className="font-blogh">
            {part}
          </span>
        );
      })}
    </span>
  );
}

export function Cake3dModelViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedModel, setSelectedModel] = useState<CakeModelItem>(BAKERY_3D_MODELS[0]!);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [lightingPreset, setLightingPreset] = useState<"warm" | "neutral" | "dramatic">("warm");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Object3D | null>(null);
  const lightsGroupRef = useRef<THREE.Group | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x150d08);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 3.8);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.replaceChildren(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.6;
    controls.minDistance = 1.8;
    controls.maxDistance = 6.5;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Don't go below ground
    controls.target.set(0, 0.4, 0);

    // 5. Studio Lighting Rig
    const lightsGroup = new THREE.Group();
    lightsGroupRef.current = lightsGroup;
    scene.add(lightsGroup);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xfff3e0, 1.3);
    lightsGroup.add(ambientLight);

    // Key Light (warm gold)
    const keyLight = new THREE.DirectionalLight(0xffd59e, 3.0);
    keyLight.position.set(4, 5, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0001;
    lightsGroup.add(keyLight);

    // Fill Light (soft rose)
    const fillLight = new THREE.DirectionalLight(0xffc2d1, 1.5);
    fillLight.position.set(-4, 3, -2);
    lightsGroup.add(fillLight);

    // Rim Light (back-top glow)
    const rimLight = new THREE.DirectionalLight(0xffeedd, 2.2);
    rimLight.position.set(0, 6, -4);
    lightsGroup.add(rimLight);

    // 6. Turntable Pedestal Base & Soft Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(10, 10);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.45 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.01;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Turntable Pedestal Cylinder
    const pedestalGeo = new THREE.CylinderGeometry(1.4, 1.5, 0.08, 64);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x22140d,
      roughness: 0.4,
      metalness: 0.2,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.04;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Gold Trim Ring
    const ringGeo = new THREE.TorusGeometry(1.42, 0.02, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xdfa037, roughness: 0.2, metalness: 0.8 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0;
    scene.add(ring);

    // 7. Load 3D Model (GLTF/GLB or FBX)
    if (selectedModel.modelUrl) {
      setLoading(true);
      setLoadError(null);

      const onModelLoaded = (model: THREE.Group | THREE.Object3D) => {
        // Remove old model if present
        if (modelGroupRef.current) {
          scene.remove(modelGroupRef.current);
        }

        modelGroupRef.current = model;

        // Auto-center and normalize size
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Scale to fit nicely inside ~1.6 units
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetScale = 1.6 / (maxDim || 1);
        model.scale.setScalar(targetScale);

        // Center model on pedestal
        model.position.x = -center.x * targetScale;
        model.position.y = -box.min.y * targetScale; // Sit on pedestal top
        model.position.z = -center.z * targetScale;

        // Enable shadow casting on all meshes
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.material) {
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach((m) => {
                  if ("wireframe" in m) (m as any).wireframe = wireframe;
                });
              } else {
                if ("wireframe" in mesh.material) (mesh.material as any).wireframe = wireframe;
              }
            }
          }
        });

        scene.add(model);
        setLoading(false);
        controls.reset();
      };

      const onProgress = (xhr: ProgressEvent<EventTarget>) => {
        if (xhr.total > 0) {
          setLoadingProgress(Math.round((xhr.loaded / xhr.total) * 100));
        }
      };

      const onError = (err: unknown) => {
        console.error("Error loading 3D cake model:", err);
        setLoading(false);
        setLoadError("Failed to render 3D model. Please refresh.");
      };

      if (selectedModel.modelUrl.endsWith(".fbx")) {
        const fbxLoader = new FBXLoader();
        fbxLoader.load(
          selectedModel.modelUrl,
          (fbx) => {
            // Load and apply diffuse texture if in birthday-cake directory
            const textureLoader = new THREE.TextureLoader();
            const baseColor = textureLoader.load("/models/birthday-cake/birthday_cake_base_color.jpg");
            const roughness = textureLoader.load("/models/birthday-cake/birthday_cake_roughness.jpg");
            const metallic = textureLoader.load("/models/birthday-cake/birthday_cake_metallic.jpg");

            fbx.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.material = new THREE.MeshStandardMaterial({
                  map: baseColor,
                  roughnessMap: roughness,
                  metalnessMap: metallic,
                  roughness: 0.5,
                  metalness: 0.2,
                });
              }
            });
            onModelLoaded(fbx);
          },
          onProgress,
          onError
        );
      } else {
        const gltfLoader = new GLTFLoader();
        gltfLoader.load(
          selectedModel.modelUrl,
          (gltf) => onModelLoaded(gltf.scene),
          onProgress,
          onError
        );
      }
    }

    // 8. Animation & Render Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      controls.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [selectedModel.modelUrl, wireframe]);

  // Handle dynamic auto-rotate toggle
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Handle lighting preset updates
  useEffect(() => {
    if (!lightsGroupRef.current || !sceneRef.current) return;
    const lights = lightsGroupRef.current;
    if (lightingPreset === "warm") {
      sceneRef.current.background = new THREE.Color(0x150d08);
      lights.children.forEach((l) => {
        if (l instanceof THREE.AmbientLight) l.color.setHex(0xfff3e0);
        if (l instanceof THREE.DirectionalLight && l.position.x > 0) l.color.setHex(0xffd59e);
      });
    } else if (lightingPreset === "neutral") {
      sceneRef.current.background = new THREE.Color(0x111114);
      lights.children.forEach((l) => {
        if (l instanceof THREE.AmbientLight) l.color.setHex(0xffffff);
        if (l instanceof THREE.DirectionalLight && l.position.x > 0) l.color.setHex(0xffffff);
      });
    } else if (lightingPreset === "dramatic") {
      sceneRef.current.background = new THREE.Color(0x0a0407);
      lights.children.forEach((l) => {
        if (l instanceof THREE.AmbientLight) l.color.setHex(0xffaacc);
        if (l instanceof THREE.DirectionalLight && l.position.x > 0) l.color.setHex(0xff7799);
      });
    }
  }, [lightingPreset]);

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div id="3d-cake-studio" className="w-full scroll-mt-24">
      {/* Outer Studio Bento Box with High-End Curved Border and Warm Cocoa Gradients */}
      <div className="relative rounded-[3rem] sm:rounded-[3.5rem] border-[4px] border-[#3D2214] bg-gradient-to-b from-[#1C0F08] via-[#28150B] to-[#120804] text-white p-6 sm:p-10 lg:p-12 shadow-[0_30px_70px_rgba(0,0,0,0.85)] ring-1 ring-amber-500/20 overflow-hidden group">
        
        {/* Glowing Background Radial Highlights */}
        <div className="absolute -top-32 -left-32 size-[32rem] rounded-full bg-amber-500/20 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 size-[32rem] rounded-full bg-rose-500/15 blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[40rem] rounded-full bg-amber-600/5 blur-[120px] pointer-events-none" />

        {/* 1. Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-white/10 pb-6 sm:pb-8 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 border-2 border-amber-400/40 px-4 py-1.5 text-xs text-amber-300 mb-3 shadow-[0_0_15px_rgba(251,191,36,0.2)]">
              <Sparkles className="size-3.5 text-amber-400" />
              <SafeBloghText text="Real-Time WebGL 3D Studio" className="uppercase tracking-wider font-bold" />
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl text-white uppercase tracking-tight leading-tight drop-shadow-md">
              <SafeBloghText text="3D Cake Model Atelier" className="font-bold" />
            </h2>
            
            <p className="font-sans text-xs sm:text-sm text-zinc-300 mt-2 max-w-2xl leading-relaxed">
              Interactive 360° GLB model showroom. Drag to orbit freely, zoom in on caramel swirls, and examine every handcrafted pastry layer in real-time WebGL.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2.5 self-start lg:self-auto bg-black/60 backdrop-blur-xl px-5 py-2.5 rounded-full border-2 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <Compass className="size-4 text-amber-400 animate-spin" style={{ animationDuration: "12s" }} />
            <SafeBloghText text="360° Free Drag · Orbit & Pinch Zoom" className="text-xs uppercase tracking-wider text-amber-200 font-bold" />
          </div>
        </div>

        {/* 2. Main Studio Canvas & Interactive Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch mt-8 relative z-10">
          
          {/* Left / Center 3D WebGL Canvas Area with Ultra-Modern Rounded Border (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center relative min-h-[420px] sm:min-h-[480px] lg:min-h-[540px] rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden border-[3.5px] border-amber-500/30 bg-gradient-to-b from-black/85 via-[#180E08]/90 to-black shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_0_80px_rgba(217,119,6,0.15)] ring-2 ring-white/10">
            
            {/* Real Three.js Canvas Mount */}
            <div
              ref={containerRef}
              className="size-full absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
            />

            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-[#180E08]/90 backdrop-blur-md flex flex-col items-center justify-center gap-3.5 z-30 pointer-events-none">
                <div className="size-14 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
                <p className="text-base font-bold text-amber-300 drop-shadow-md">
                  <SafeBloghText text={`Loading 3D Cake Model… ${loadingProgress > 0 ? `${loadingProgress}%` : ""}`} className="uppercase tracking-wider font-bold" />
                </p>
                <p className="font-sans text-xs text-zinc-400">
                  Rendering 3D Meshes, Chocolate Shading & Studio Rig
                </p>
              </div>
            )}

            {/* Error Overlay */}
            {loadError && (
              <div className="absolute inset-0 bg-[#180E08]/95 flex flex-col items-center justify-center gap-3 z-30 p-6 text-center">
                <Info className="size-9 text-amber-400" />
                <p className="font-sans text-sm text-white">{loadError}</p>
                <Button size="sm" onClick={() => window.location.reload()} className="mt-2 rounded-full font-sans uppercase font-bold tracking-wider">
                  Retry Loading
                </Button>
              </div>
            )}

            {/* Top Interactive Overlay Controls */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
              <div className="pointer-events-auto flex items-center gap-2 bg-black/75 backdrop-blur-xl px-4 py-2 rounded-full border-2 border-white/20 text-xs text-amber-200 shadow-xl">
                <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                <SafeBloghText text="360° Drag & Pinch Zoom" className="uppercase tracking-wider font-bold" />
              </div>

              {/* Viewport Control Actions */}
              <div className="pointer-events-auto flex items-center gap-1.5 bg-black/75 backdrop-blur-xl p-1.5 rounded-full border-2 border-white/20 shadow-xl">
                <button
                  type="button"
                  title="Toggle Auto-Spin Turntable"
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`p-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    autoRotate
                      ? "bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.6)] scale-105"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <RotateCw className={`size-4 ${autoRotate ? "animate-spin" : ""}`} />
                </button>
                <button
                  type="button"
                  title="Reset Camera View"
                  onClick={resetCamera}
                  className="p-2 rounded-full text-xs font-bold text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <Compass className="size-4" />
                </button>
                <button
                  type="button"
                  title="Toggle Wireframe Mesh"
                  onClick={() => setWireframe(!wireframe)}
                  className={`p-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    wireframe
                      ? "bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.6)] scale-105"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Layers className="size-4" />
                </button>
                <button
                  type="button"
                  title="Toggle Fullscreen"
                  onClick={toggleFullscreen}
                  className="p-2 rounded-full text-xs font-bold text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                </button>
              </div>
            </div>

            {/* Bottom Lighting Presets Toolbar */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
              <div className="pointer-events-auto flex items-center gap-1.5 bg-black/75 backdrop-blur-xl p-1.5 rounded-full border-2 border-white/20 shadow-xl">
                <span className="px-3 text-zinc-400 text-xs uppercase font-blogh tracking-wider">Lighting:</span>
                {(["warm", "neutral", "dramatic"] as const).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setLightingPreset(preset)}
                    className={`px-3 py-1 rounded-full uppercase text-xs font-blogh tracking-wider transition-all cursor-pointer ${
                      lightingPreset === preset
                        ? "bg-amber-400 text-black font-black shadow-[0_0_12px_rgba(251,191,36,0.5)] scale-105"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <span className="text-xs text-amber-300/80 font-sans uppercase font-bold tracking-wider hidden sm:inline-block pointer-events-none px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                WebGL 2.0 · Three.js PBR
              </span>
            </div>

          </div>

          {/* Right Spec Sheet & Model Library (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
            
            {/* Active Model Description Card */}
            <div className="space-y-4 bg-white/5 border-[3px] border-amber-500/30 rounded-[2.5rem] p-6 sm:p-7 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 text-amber-300 border-2 border-amber-400/40 px-3.5 py-1 text-xs">
                  <SafeBloghText text={selectedModel.tag} className="uppercase tracking-wider font-bold" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/30 px-3 py-0.5 rounded-full">
                  <Check className="size-3.5" />
                  <SafeBloghText text="Live 3D Mesh" />
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl text-white uppercase leading-tight tracking-tight drop-shadow-sm">
                <SafeBloghText text={selectedModel.name} className="font-bold" />
              </h3>

              <p className="font-sans text-xs sm:text-sm text-zinc-300 leading-relaxed opacity-95">
                {selectedModel.description}
              </p>

              {/* 4 Macro Specs Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <div className="rounded-2xl bg-black/40 border border-white/15 p-3 text-center">
                  <p className="text-[10px] uppercase font-blogh tracking-wider text-zinc-400">Calories / Slice</p>
                  <p className="font-sans font-black text-xl text-amber-300 mt-1 tracking-tight">
                    {selectedModel.calories}
                  </p>
                </div>
                <div className="rounded-2xl bg-black/40 border border-white/15 p-3 text-center">
                  <p className="text-[10px] uppercase font-blogh tracking-wider text-zinc-400">Clean Protein</p>
                  <p className="font-sans font-black text-xl text-rose-300 mt-1 tracking-tight">
                    {selectedModel.protein}
                  </p>
                </div>
                <div className="rounded-2xl bg-black/40 border border-white/15 p-3 text-center">
                  <p className="text-[10px] uppercase font-blogh tracking-wider text-zinc-400">Refined Sugars</p>
                  <p className="font-sans font-black text-xl text-emerald-300 mt-1 tracking-tight">
                    {selectedModel.sugar}
                  </p>
                </div>
                <div className="rounded-2xl bg-black/40 border border-white/15 p-3 text-center">
                  <p className="text-[10px] uppercase font-blogh tracking-wider text-zinc-400">Dairy Butter</p>
                  <p className="font-sans font-black text-xl text-amber-200 mt-1 tracking-tight">
                    {selectedModel.butter}
                  </p>
                </div>
              </div>
            </div>

            {/* Model Library Selector (More 3D models to come) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs uppercase tracking-wider text-amber-300 flex items-center gap-1.5 font-bold">
                  <Flame className="size-4 text-amber-400" />
                  <SafeBloghText text="3D Model Library (Upcoming Bakes)" />
                </span>
                <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">
                  <SafeBloghText text={`${BAKERY_3D_MODELS.length} Models`} />
                </span>
              </div>

              <div className="space-y-2.5">
                {BAKERY_3D_MODELS.map((item) => {
                  const isCurrent = selectedModel.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={item.status === "coming_soon"}
                      onClick={() => setSelectedModel(item)}
                      className={`w-full rounded-[1.5rem] p-3 border-2 transition-all flex items-center justify-between gap-3 text-left ${
                        isCurrent
                          ? "bg-amber-400 text-black border-amber-300 shadow-[0_10px_25px_rgba(251,191,36,0.3)] scale-[1.01]"
                          : item.status === "coming_soon"
                          ? "bg-white/5 border-white/10 text-zinc-400 opacity-70 cursor-not-allowed"
                          : "bg-white/5 border-white/10 text-white hover:bg-white/10 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="size-11 rounded-2xl overflow-hidden shrink-0 border-2 border-white/20 bg-black/50 shadow-md">
                          <img src={item.thumbnail} alt={item.name} className="size-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm uppercase tracking-tight truncate font-bold">
                            <SafeBloghText text={item.name} />
                          </p>
                          <p className={`text-[10.5px] uppercase tracking-wider truncate mt-0.5 font-bold ${isCurrent ? "text-black/80" : "text-zinc-400"}`}>
                            <SafeBloghText text={item.badge} />
                          </p>
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="shrink-0 size-7 rounded-full bg-black text-amber-300 flex items-center justify-center shadow-sm">
                          <Check className="size-4" />
                        </span>
                      ) : (
                        <ChevronRight className="size-4 shrink-0 text-zinc-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Cake3dModelViewer;
