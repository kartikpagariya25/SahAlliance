import { useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";

/** Feature-detects WebGL without throwing. */
export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      (window as unknown as { WebGLRenderingContext?: unknown }).WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export interface Scene3DProps {
  /** Builds and returns the root Object3D to auto-rotate. Called once per mount. */
  buildModel: () => THREE.Object3D;
  className?: string;
  /** Rendered instead of the canvas when WebGL isn't available. */
  fallback: ReactNode;
  /** Radians per second of ambient auto-rotation. */
  rotateSpeed?: number;
  cameraDistance?: number;
  cameraHeight?: number;
  fov?: number;
}

/**
 * Mounts a small, self-contained Three.js scene into a div via a ref + effect.
 * Transparent background, gentle auto-rotate, full dispose on unmount (safe under
 * React StrictMode's dev double-mount). Falls back to static content with no WebGL.
 */
export function Scene3D({
  buildModel,
  className,
  fallback,
  rotateSpeed = 0.18,
  cameraDistance = 6,
  cameraHeight = 1,
  fov = 35,
}: Scene3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [supported] = useState(isWebGLAvailable);

  useEffect(() => {
    if (!supported || !mountRef.current) return;
    const mount = mountRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);
    camera.position.set(0, cameraHeight, cameraDistance);
    camera.lookAt(0, cameraHeight * 0.4, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xf4f8ff, 0x1a2540, 1.0);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xfff6ea, 1.6);
    key.position.set(3, 5, 4);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xbcd0ff, 0.55);
    fill.position.set(-4, 2, -3);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0x9fc0ff, 0.5);
    rim.position.set(0, 3, -5);
    scene.add(rim);

    const model = buildModel();
    scene.add(model);

    let frameId = 0;
    let lastTime = performance.now();
    let disposed = false;

    const animate = (time: number) => {
      if (disposed) return;
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      model.rotation.y += rotateSpeed * delta;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    const resize = () => {
      const { clientWidth, clientHeight } = mount;
      if (clientWidth === 0 || clientHeight === 0) return;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    frameId = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => m.dispose());
        }
      });

      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supported]);

  if (!supported) {
    return <div className={className}>{fallback}</div>;
  }

  return <div ref={mountRef} className={className} />;
}
