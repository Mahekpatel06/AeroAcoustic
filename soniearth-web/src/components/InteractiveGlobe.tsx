"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { RotateCcw, Play, Pause, ZoomIn, ZoomOut, Sparkles } from "lucide-react";

interface InteractiveGlobeProps {
  currentMode: "annual" | "change" | "regional";
  currentYear?: number;
  textureMode?: "annual" | "change" | "sos";
  isPlaying?: boolean;
}

export const InteractiveGlobe: React.FC<InteractiveGlobeProps> = ({
  currentMode,
  currentYear = 2012,
  isPlaying = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const textureLoaderRef = useRef<THREE.TextureLoader | null>(null);
  const cachedTexturesRef = useRef<Record<string, THREE.Texture>>({});

  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [activeTextureType, setActiveTextureType] = useState<"annual" | "change">(
    currentMode === "change" ? "change" : "annual"
  );

  // Drag interaction refs
  const isDraggingRef = useRef<boolean>(false);
  const previousPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const velocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraDistanceRef = useRef<number>(2.4);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Sync mode changes to activeTextureType
  useEffect(() => {
    if (currentMode === "change") {
      setActiveTextureType("change");
    } else if (currentMode === "annual") {
      setActiveTextureType("annual");
    }
  }, [currentMode]);

  // Apply texture from URL with robust caching
  const applyTexture = useCallback((url: string) => {
    if (!materialRef.current || !textureLoaderRef.current) return;

    if (cachedTexturesRef.current[url]) {
      materialRef.current.map = cachedTexturesRef.current[url];
      materialRef.current.needsUpdate = true;
      return;
    }

    textureLoaderRef.current.load(url, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      cachedTexturesRef.current[url] = tex;
      if (materialRef.current) {
        materialRef.current.map = tex;
        materialRef.current.needsUpdate = true;
      }
    });
  }, []);

  // Initialize Three.js scene once on mount
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 460;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = cameraDistanceRef.current;
    cameraRef.current = camera;

    // 2. High-Performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    rendererRef.current = renderer;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 3. Texture Loader & Geometry
    const textureLoader = new THREE.TextureLoader();
    textureLoaderRef.current = textureLoader;

    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });
    materialRef.current = material;

    const sphere = new THREE.Mesh(geometry, material);
    sphere.rotation.y = -Math.PI / 2; // Center view on Europe / South Asia / Africa
    scene.add(sphere);
    sphereRef.current = sphere;

    // Atmospheric Glow Halo in Laser Mint
    const atmosGeo = new THREE.SphereGeometry(1.025, 64, 64);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x00f59b),
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide,
    });
    const atmos = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmos);

    // Background Stars
    const starGeo = new THREE.BufferGeometry();
    const starCount = 500;
    const starCoords = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starCoords[i] = (Math.random() - 0.5) * 50;
      starCoords[i + 1] = (Math.random() - 0.5) * 50;
      starCoords[i + 2] = -5 - Math.random() * 25;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starCoords, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.08,
      transparent: true,
      opacity: 0.7,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // Load Initial Texture
    const initUrl =
      currentMode === "change"
        ? "/datasets/night-lights/globe_change_2k.jpg"
        : `/datasets/night-lights/annual/year_${currentYear}.jpg`;
    applyTexture(initUrl);

    // 4. Safe Animation Loop (Never stalls, NaN protected)
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (sphereRef.current) {
        if (!isDraggingRef.current && autoRotate) {
          sphereRef.current.rotation.y += 0.0016;
        } else if (!isDraggingRef.current) {
          // Inertia damping
          const vx = velocityRef.current.x;
          const vy = velocityRef.current.y;
          if (Number.isFinite(vx) && Number.isFinite(vy)) {
            sphereRef.current.rotation.y += vy;
            sphereRef.current.rotation.x += vx;
            velocityRef.current.x *= 0.90;
            velocityRef.current.y *= 0.90;
          } else {
            velocityRef.current = { x: 0, y: 0 };
          }
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // 5. Container ResizeObserver for instant glitch-free resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = newW / newH;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // 6. Global Pointer Safety Listeners (Prevents drag from ever sticking)
    const handleGlobalPointerUp = () => {
      isDraggingRef.current = false;
    };
    window.addEventListener("pointerup", handleGlobalPointerUp);
    window.addEventListener("pointercancel", handleGlobalPointerUp);
    window.addEventListener("mouseup", handleGlobalPointerUp);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener("pointerup", handleGlobalPointerUp);
      window.removeEventListener("pointercancel", handleGlobalPointerUp);
      window.removeEventListener("mouseup", handleGlobalPointerUp);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      atmosGeo.dispose();
      atmosMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      if (container) {
        container.innerHTML = "";
      }
    };
  }, []);

  // Dynamic Texture Update
  useEffect(() => {
    let targetUrl = `/datasets/night-lights/annual/year_${currentYear}.jpg`;
    if (activeTextureType === "change" || currentMode === "change") {
      targetUrl = "/datasets/night-lights/globe_change_2k.jpg";
    }
    applyTexture(targetUrl);
  }, [currentYear, currentMode, activeTextureType, applyTexture]);

  // Robust Pointer Events with PointerCapture
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch { }
    isDraggingRef.current = true;
    previousPositionRef.current = { x: e.clientX, y: e.clientY };
    velocityRef.current = { x: 0, y: 0 };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !sphereRef.current) return;

    const deltaX = e.clientX - previousPositionRef.current.x;
    const deltaY = e.clientY - previousPositionRef.current.y;

    // Safety clamp delta to prevent erratic jumps
    const safeDeltaX = Math.max(-60, Math.min(60, deltaX));
    const safeDeltaY = Math.max(-60, Math.min(60, deltaY));

    const rotSpeed = 0.005;
    sphereRef.current.rotation.y += safeDeltaX * rotSpeed;
    sphereRef.current.rotation.x += safeDeltaY * rotSpeed;

    // Clamp vertical tilt to prevent gimbal lock
    const maxTilt = Math.PI / 2.3;
    sphereRef.current.rotation.x = Math.max(-maxTilt, Math.min(maxTilt, sphereRef.current.rotation.x));

    velocityRef.current = {
      x: safeDeltaY * rotSpeed * 0.35,
      y: safeDeltaX * rotSpeed * 0.35,
    };

    previousPositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch { }
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!cameraRef.current) return;
    cameraDistanceRef.current += e.deltaY * 0.0018;
    cameraDistanceRef.current = Math.max(1.4, Math.min(4.2, cameraDistanceRef.current));
    cameraRef.current.position.z = cameraDistanceRef.current;
  };

  const handleZoom = (delta: number) => {
    if (!cameraRef.current) return;
    cameraDistanceRef.current += delta;
    cameraDistanceRef.current = Math.max(1.4, Math.min(4.2, cameraDistanceRef.current));
    cameraRef.current.position.z = cameraDistanceRef.current;
  };

  const handleResetAngle = () => {
    if (!sphereRef.current) return;
    sphereRef.current.rotation.x = 0;
    sphereRef.current.rotation.y = -Math.PI / 2;
    velocityRef.current = { x: 0, y: 0 };
    if (cameraRef.current) {
      cameraDistanceRef.current = 2.4;
      cameraRef.current.position.z = 2.4;
    }
  };

  return (
    <div className="relative w-full h-full select-none touch-none">
      {/* Three.js Canvas Container with Pointer Capture */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
      />

      {/* Floating 3D Globe HUD Controls */}
      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 z-20">
        <span className="font-mono text-[11px] font-bold text-emerald-400 bg-[#06080A]/90 px-2.5 py-1 rounded-lg border border-emerald-500/30 backdrop-blur-md flex items-center gap-1.5 shadow-xl">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Interactive 3D Sphere (NASA SVS #5475)
        </span>

        {/* Mode A: Clean Annual Indicator (No Decadal Change option) */}
        {currentMode === "annual" && (
          <span className="font-mono text-[10px] font-bold text-emerald-300 bg-emerald-950/85 px-2.5 py-1 rounded-lg border border-emerald-500/50 shadow-xl flex items-center gap-1">
            Annual Evolution • Year {currentYear}
          </span>
        )}

        {/* Mode B: Clean Decadal Change Indicator (No Annual option) */}
        {currentMode === "change" && (
          <span className="font-mono text-[10px] font-bold text-emerald-300 bg-emerald-950/85 px-2.5 py-1 rounded-lg border border-emerald-500/50 shadow-xl flex items-center gap-1">
            Decadal Change
          </span>
        )}

        {/* Mode C: Both Options Available to Compare Together */}
        {currentMode === "regional" && (
          <div className="flex items-center bg-[#06080A]/90 backdrop-blur-md rounded-lg border border-emerald-500/30 p-0.5 text-[10px] font-mono shadow-xl">
            <button
              onClick={() => setActiveTextureType("annual")}
              className={`px-2.5 py-1 rounded-md transition-all ${activeTextureType === "annual"
                  ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-bold shadow-[0_0_8px_rgba(0,245,155,0.4)]"
                  : "text-slate-400 hover:text-slate-200"
                }`}
            >
              Annual Baseline
            </button>
            <button
              onClick={() => setActiveTextureType("change")}
              className={`px-2.5 py-1 rounded-md transition-all ${activeTextureType === "change"
                  ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-bold shadow-[0_0_8px_rgba(0,245,155,0.4)]"
                  : "text-slate-400 hover:text-slate-200"
                }`}
            >
              Decadal Change
            </button>
          </div>
        )}
      </div>

      {/* Right Controls: Auto-spin, Reset, Zoom */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20 bg-[#06080A]/90 backdrop-blur-md p-1 rounded-xl border border-emerald-500/25 shadow-xl">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1 border transition-all ${autoRotate
              ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(0,245,155,0.2)]"
              : "bg-black/60 text-slate-400 border-emerald-500/20 hover:text-slate-200"
            }`}
          title="Toggle Auto-Spin Rotation"
        >
          {autoRotate ? <Pause className="w-3 h-3 text-emerald-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
          <span>{autoRotate ? "Spin: ON" : "Spin: OFF"}</span>
        </button>

        <button
          onClick={() => handleZoom(-0.3)}
          className="p-1 hover:bg-emerald-950/60 rounded text-slate-300 hover:text-emerald-300"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleZoom(0.3)}
          className="p-1 hover:bg-emerald-950/60 rounded text-slate-300 hover:text-emerald-300"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleResetAngle}
          className="p-1 hover:bg-emerald-950/60 rounded text-slate-400 hover:text-emerald-400"
          title="Reset Globe Orientation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none bg-[#06080A]/90 backdrop-blur-sm px-3.5 py-1 rounded-full text-[10px] font-mono text-slate-300 border border-emerald-500/30 z-20 flex items-center gap-1.5 shadow-xl">
        <span className="text-emerald-400">✦</span>
        <span>Click & drag to rotate freely • Scroll to zoom</span>
      </div>
    </div>
  );
};
