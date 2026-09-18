import * as THREE from "three";
import { Scene3D } from "./Scene3D";

/**
 * Builds a procedural terracotta "gullak" — the traditional Indian hand-thrown clay
 * money pot: a bulbous lathe-turned body, a narrowed neck, a domed lid with a raised
 * coin-slot bar, potter's-wheel ridge rings, and a footed base. Warm clay tones are a
 * deliberate warm accent against the site's blue theme.
 */
function buildPot(): THREE.Object3D {
  const group = new THREE.Group();

  const clay = new THREE.MeshStandardMaterial({
    color: 0xa04a30,
    roughness: 0.88,
    metalness: 0.02,
  });
  const clayDark = new THREE.MeshStandardMaterial({
    color: 0x7c3a24,
    roughness: 0.92,
    metalness: 0.02,
  });
  const clayLid = new THREE.MeshStandardMaterial({
    color: 0xb5593a,
    roughness: 0.85,
    metalness: 0.02,
  });
  const slotMat = new THREE.MeshStandardMaterial({
    color: 0x2a1710,
    roughness: 0.6,
    metalness: 0.1,
  });

  // Lathe profile of the pot body: (radius, height) pairs, bottom to top.
  const profile: [number, number][] = [
    [0.0, 0.0],
    [0.42, 0.02],
    [0.58, 0.08],
    [0.66, 0.22],
    [0.74, 0.42],
    [0.78, 0.6],
    [0.74, 0.78],
    [0.62, 0.98],
    [0.46, 1.16],
    [0.34, 1.3],
    [0.3, 1.4],
    [0.32, 1.46],
    [0.29, 1.5],
  ];
  const points = profile.map(([r, y]) => new THREE.Vector2(r, y));
  const bodyGeo = new THREE.LatheGeometry(points, 48);
  const body = new THREE.Mesh(bodyGeo, clay);
  body.position.y = -0.75;
  group.add(body);

  // Potter's-wheel ridge rings around the belly.
  const ringHeights = [0.28, 0.5, 0.7, 0.9];
  ringHeights.forEach((h, i) => {
    const t = h / 1.5;
    const r = 0.6 + 0.18 * Math.sin(t * Math.PI);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 40), clayDark);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = h - 0.75;
    ring.scale.setScalar(1 + i * 0.001);
    group.add(ring);
  });

  // Footed base ring.
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.5, 0.06, 32), clayDark);
  foot.position.y = -0.75 + 0.02;
  group.add(foot);

  // Domed lid sitting on the neck opening.
  const lid = new THREE.Mesh(new THREE.SphereGeometry(0.33, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.2), clayLid);
  lid.position.y = -0.75 + 1.49;
  group.add(lid);

  // Small lid rim collar.
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.05, 32), clayDark);
  collar.position.y = -0.75 + 1.47;
  group.add(collar);

  // Raised coin-slot bar on top of the lid.
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.045), slotMat);
  slot.position.y = -0.75 + 1.6;
  group.add(slot);
  const slotBase = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.02, 20), clayLid);
  slotBase.position.y = -0.75 + 1.585;
  group.add(slotBase);

  group.rotation.y = 0.5;
  group.position.y = -0.15;
  return group;
}

function PotCanvas({ className }: { className?: string }) {
  return (
    <Scene3D
      buildModel={buildPot}
      className={className}
      cameraDistance={4.4}
      cameraHeight={0.3}
      rotateSpeed={0.22}
      fallback={
        <div className="flex h-full w-full items-center justify-center text-6xl" aria-hidden="true">
          🏺
        </div>
      }
    />
  );
}

export default PotCanvas;
