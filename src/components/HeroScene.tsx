import { useEffect, useRef, useState } from "react";
import type { Mesh, Material, Object3D } from "three";

/* ————————————————————————————————————————————
   3D interactive hero — an aperture assembly drifting in
   studio light, built from the camera/film craft itself:
   a lens barrel, six rotating iris blades, a floating
   dust field and a slow film strip orbit.

   Performance contract:
   · `three` is imported dynamically ONLY when the device
     can actually run WebGL — the ~130 kB (gz) chunk is
     skipped on the other pages and every fallback device
   · Low-poly geometry only (standard materials, no shaders)
   · devicePixelRatio clamped (2 desktop, 1.5 mobile)
   · Pauses when tab hidden; full cleanup on unmount
   · Graceful static fallback: no WebGL, prefers-reduced-motion,
     or deviceMemory < 2GB → poster image, zero layout shift
   ———————————————————————————————————————————————— */

type Palette = {
  bg: number;
  key: number;
  rim: number;
  fill: number;
  blade: number;
  barrel: number;
  dust: number;
  strip: number;
};

const LIGHT: Palette = {
  bg: 0xf4efe7,
  key: 0xfff1dd,
  rim: 0xd9a05b,
  fill: 0xbfc8d6,
  blade: 0x8c6838,
  barrel: 0x2b241d,
  dust: 0xc9a878,
  strip: 0x1e1a15,
};

const DARK: Palette = {
  bg: 0x141210,
  key: 0xffb877,
  rim: 0x5a4326,
  fill: 0x3d4a5c,
  blade: 0xd2a56a,
  barrel: 0x242019,
  dust: 0xd2a56a,
  strip: 0x0d0b09,
};

export function canRun3D(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (mem !== undefined && mem < 2) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function HeroScene({ poster }: { poster?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [use3d, setUse3d] = useState<boolean | null>(null);

  useEffect(() => setUse3d(canRun3D()), []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || use3d !== true) return;

    let disposed = false;
    let dispose: (() => void) | null = null;

    void (async () => {
      const THREE = await import("three");
      if (disposed || !mount.isConnected) return;

      const isDark = () => document.documentElement.getAttribute("data-theme") === "dark";
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, mount.clientWidth / mount.clientHeight, 0.1, 60);
      camera.position.set(0, 0, 11);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      mount.appendChild(renderer.domElement);
      renderer.domElement.classList.add("canvas-fade");

      /* — lights — */
      const keyLight = new THREE.DirectionalLight(LIGHT.key, 2.4);
      keyLight.position.set(6, 8, 6);
      const rimLight = new THREE.DirectionalLight(LIGHT.rim, 1.6);
      rimLight.position.set(-7, 3, -4);
      const fillLight = new THREE.AmbientLight(LIGHT.fill, 0.55);
      scene.add(keyLight, rimLight, fillLight);

      /* — aspect-aware composition: the lens floats top-right on wide
           screens, top-center on narrow — always clear of the headline — */
      const wide = mount.clientWidth / mount.clientHeight >= 1.15;
      const apX = wide ? 3.1 : 0.7;
      const apY = wide ? 1.55 : 2.35;
      const apScale = wide ? 0.55 : 0.4;

      /* — aperture assembly: open lens tube + iris pie-slice blades
           + glowing sensor core (a camera lens, not a disc) — */
      const aperture = new THREE.Group();

      const barrelMat = new THREE.MeshStandardMaterial({
        color: LIGHT.barrel,
        metalness: 0.55,
        roughness: 0.35,
      });
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.1, 1.3, 48, 1, true), barrelMat);
      tube.rotation.x = Math.PI / 2;
      aperture.add(tube);

      const rimMat = new THREE.MeshStandardMaterial({
        color: LIGHT.blade,
        metalness: 0.6,
        roughness: 0.3,
      });
      const rimFront = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.09, 16, 64), rimMat);
      rimFront.position.z = 0.65;
      aperture.add(rimFront);
      const rimBack = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.07, 16, 64), rimMat);
      rimBack.position.z = -0.65;
      aperture.add(rimBack);

      /* iris: six overlapping circular pie-slices, like shutter blades */
      const bladeMat = new THREE.MeshStandardMaterial({
        color: LIGHT.blade,
        metalness: 0.4,
        roughness: 0.45,
        side: THREE.DoubleSide,
        emissive: LIGHT.blade,
        emissiveIntensity: 0.12,
      });
      const bladeGeo = new THREE.CircleGeometry(1.55, 32, 0.26, Math.PI * 1.1);
      const iris = new THREE.Group();
      iris.position.z = -0.4;
      aperture.add(iris);
      const blades: Mesh[] = [];
      for (let i = 0; i < 6; i++) {
        const b = new THREE.Mesh(bladeGeo, bladeMat);
        b.rotation.z = (i * Math.PI) / 3;
        iris.add(b);
        blades.push(b);
      }

      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x0d0c0a,
        emissive: 0xd2a56a,
        emissiveIntensity: 1.3,
        metalness: 0.9,
        roughness: 0.1,
      });
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 32), coreMat);
      core.position.z = -0.55;
      aperture.add(core);

      scene.add(aperture);
      aperture.position.set(apX, apY, 0);
      aperture.scale.setScalar(apScale);
      aperture.rotation.set(-0.32, -0.5, 0.08);

      /* — film strip: an orbiting open torus with sprocket bumps, far
           top-right on wide, top-center on narrow — */
      const stripMat = new THREE.MeshStandardMaterial({
        color: LIGHT.strip,
        roughness: 0.7,
        metalness: 0.1,
      });
      const strip = new THREE.Mesh(new THREE.TorusGeometry(5.4, 0.16, 10, 96, Math.PI * 1.25), stripMat);
      strip.rotation.set(Math.PI / 2.6, 0.3, 0);
      strip.position.set(wide ? 5.6 : 1.4, wide ? 3.2 : 4.0, -4);
      strip.scale.setScalar(wide ? 0.5 : 0.42);
      scene.add(strip);

      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 1.25;
        const r = 5.4;
        const hole = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.1), rimMat);
        hole.position.set(Math.cos(a) * r, Math.sin(a) * r * -0.3 + 0.1, Math.sin(a) * r);
        strip.add(hole);
      }

      /* — dust field — */
      const dustCount = window.innerWidth < 768 ? 140 : 340;
      const dustPos = new Float32Array(dustCount * 3);
      for (let i = 0; i < dustCount; i++) {
        dustPos[i * 3] = (Math.random() - 0.5) * 22;
        dustPos[i * 3 + 1] = (Math.random() - 0.5) * 14;
        dustPos[i * 3 + 2] = (Math.random() - 0.5) * 14;
      }
      const dustGeo = new THREE.BufferGeometry();
      dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
      const dustMat = new THREE.PointsMaterial({
        color: LIGHT.dust,
        size: 0.045,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      });
      const dust = new THREE.Points(dustGeo, dustMat);
      scene.add(dust);

      /* — interaction state — */
      const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
      const onPointer = (e: PointerEvent) => {
        pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
        pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener("pointermove", onPointer, { passive: true });

      let scrollT = 0;
      const onScroll = () => {
        scrollT = Math.min(1, window.scrollY / (window.innerHeight * 0.9));
      };
      window.addEventListener("scroll", onScroll, { passive: true });

      /* — theme sync (re-tint materials when toggled) — */
      const applyPalette = () => {
        const p = isDark() ? DARK : LIGHT;
        keyLight.color.setHex(p.key);
        rimLight.color.setHex(p.rim);
        fillLight.color.setHex(p.fill);
        fillLight.intensity = isDark() ? 0.35 : 0.55;
        barrelMat.color.setHex(p.barrel);
        bladeMat.color.setHex(p.blade);
        stripMat.color.setHex(p.strip);
        dustMat.color.setHex(p.dust);
        scene.background = null;
        const fog = new THREE.Fog(0x000000, 18, 40);
        fog.color.setHex(p.bg);
        scene.fog = fog;
      };
      applyPalette();
      const themeObserver = new MutationObserver(applyPalette);
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

      /* — loop — */
      let raf = 0;
      let running = true;
      let last = performance.now();

      const tick = (now: number) => {
        if (!running) return;
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;

        pointer.x += (pointer.tx - pointer.x) * 0.04;
        pointer.y += (pointer.ty - pointer.y) * 0.04;

        const t = now * 0.0001;
        aperture.rotation.y = -0.5 + Math.sin(t) * 0.22 + pointer.x * 0.45;
        aperture.rotation.x = -0.32 + Math.cos(t * 0.7) * 0.08 + pointer.y * 0.3;
        aperture.position.y = apY + Math.sin(t * 1.3) * 0.16 - scrollT * 1.4;

        // iris breathing: the six blades rotate in unison, opening
        // and closing like a camera's shutter
        const open = 0.5 + Math.sin(t * 2.2) * 0.28;
        iris.rotation.z = open;
        core.scale.setScalar(0.85 + open * 0.3);;

        strip.rotation.z += dt * 0.12;
        dust.rotation.y += dt * 0.02;

        camera.position.x = pointer.x * 0.8;
        camera.position.y = -pointer.y * 0.55;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };

      const onVisibility = () => {
        running = document.visibilityState === "visible";
        if (running) {
          last = performance.now();
          raf = requestAnimationFrame(tick);
        } else {
          cancelAnimationFrame(raf);
        }
      };
      document.addEventListener("visibilitychange", onVisibility);
      raf = requestAnimationFrame(tick);

      /* — resize — */
      const onResize = () => {
        const w = mount.clientWidth;
        const h = mount.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      const ro = new ResizeObserver(onResize);
      ro.observe(mount);

      dispose = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        themeObserver.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("pointermove", onPointer);
        window.removeEventListener("scroll", onScroll);
        scene.traverse((o: Object3D) => {
          if (o instanceof THREE.Mesh || o instanceof THREE.Points) {
            o.geometry.dispose();
            const m = o.material as Material | Material[];
            if (Array.isArray(m)) m.forEach((x) => x.dispose());
            else m.dispose();
          }
        });
        renderer.dispose();
        if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      };
    })();

    return () => {
      disposed = true;
      dispose?.();
    };
  }, [use3d]);

  if (use3d === false) {
    return (
      <div
        className="hero-fallback"
        aria-hidden="true"
        style={poster ? { backgroundImage: `url(${poster})` } : undefined}
      />
    );
  }

  return (
    <div className="hero-canvas-wrap" aria-hidden="true">
      <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />
    </div>
  );
}
