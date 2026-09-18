import * as THREE from "three";
import { Scene3D } from "./Scene3D";

/**
 * Builds a procedural vintage hand-crank sewing machine head — the classic Singer-style
 * silhouette: a flat bed, a "C"-shaped column-and-arm cast in black japanned enamel,
 * a brass balance wheel with a crank handle, a silver needle plate, and a spool pin.
 * Reads as brass/dark-metal vintage, a tasteful accent against the site's blue theme.
 */
function buildSewingMachine(): THREE.Object3D {
  const group = new THREE.Group();

  const japanned = new THREE.MeshStandardMaterial({
    color: 0x15171c,
    roughness: 0.32,
    metalness: 0.4,
  });
  const brass = new THREE.MeshStandardMaterial({
    color: 0xb08d4f,
    roughness: 0.28,
    metalness: 0.9,
  });
  const brassBright = new THREE.MeshStandardMaterial({
    color: 0xcaa661,
    roughness: 0.2,
    metalness: 0.95,
  });
  const steel = new THREE.MeshStandardMaterial({
    color: 0xc7ccd4,
    roughness: 0.25,
    metalness: 0.85,
  });

  // --- "C" shaped head (bed -> column -> arm -> needle bar), extruded side profile ---
  const shape = new THREE.Shape();
  shape.moveTo(-1.15, 0);
  shape.lineTo(1.05, 0);
  shape.lineTo(1.05, 0.16);
  shape.lineTo(0.86, 0.16);
  shape.lineTo(0.86, 0.72);
  shape.quadraticCurveTo(0.86, 0.98, 0.6, 1.05);
  shape.lineTo(-0.35, 1.16);
  shape.quadraticCurveTo(-0.7, 1.2, -0.78, 1.0);
  shape.lineTo(-0.78, 0.16);
  shape.lineTo(-1.15, 0.16);
  shape.closePath();

  const extrudeSettings = {
    depth: 0.6,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
    curveSegments: 16,
  };
  const headGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  headGeo.center();
  const head = new THREE.Mesh(headGeo, japanned);
  head.position.y = 0.02;
  group.add(head);

  // Needle bar dropping from the front of the arm down toward the bed.
  const needleBar = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.32, 12), steel);
  needleBar.position.set(0.58, 0.28, 0.31);
  group.add(needleBar);
  const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.006, 0.14, 8), steel);
  needle.position.set(0.58, 0.1, 0.31);
  group.add(needle);

  // Silver needle plate on the bed.
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.012, 24), steel);
  plate.position.set(0.58, 0.155, 0.31);
  group.add(plate);

  // Brass trim strip along the top of the arm (suggests scrollwork/decal banding).
  const trim = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.03, 0.64), brassBright);
  trim.position.set(-0.1, 0.58, 0.02);
  trim.rotation.z = 0.1;
  group.add(trim);
  const trim2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.5), brassBright);
  trim2.position.set(-0.65, 0.32, 0.02);
  group.add(trim2);

  // Spool pin on top of the arm.
  const spoolPin = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.22, 10), steel);
  spoolPin.position.set(-0.3, 1.28, 0.02);
  group.add(spoolPin);
  const spool = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 16), brass);
  spool.position.set(-0.3, 1.22, 0.02);
  group.add(spool);

  // Bed base plate (flat, slightly larger than the head footprint).
  const bed = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.06, 0.95), japanned);
  bed.position.y = -0.03;
  group.add(bed);
  const bedTrim = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.01, 0.95), brass);
  bedTrim.position.y = 0.001;
  group.add(bedTrim);

  // Spoked balance wheel with crank handle, mounted on the right (back) side.
  const wheelGroup = new THREE.Group();
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.045, 12, 32), brass);
  wheelGroup.add(rim);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.09, 16), brassBright);
  hub.rotation.x = Math.PI / 2;
  wheelGroup.add(hub);
  const spokeCount = 5;
  for (let i = 0; i < spokeCount; i++) {
    const angle = (i / spokeCount) * Math.PI * 2;
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.035, 0.03), brass);
    spoke.position.set(Math.cos(angle) * 0.17, Math.sin(angle) * 0.17, 0);
    spoke.rotation.z = angle;
    wheelGroup.add(spoke);
  }
  const crankArm = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.03), brassBright);
  crankArm.position.set(0.22, 0.28, 0.05);
  crankArm.rotation.z = -0.4;
  wheelGroup.add(crankArm);
  const crankHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.12, 10), brassBright);
  crankHandle.position.set(0.36, 0.35, 0.05);
  wheelGroup.add(crankHandle);

  wheelGroup.position.set(0.72, 0.5, 0.34);
  group.add(wheelGroup);

  group.rotation.y = -0.55;
  group.scale.setScalar(1.1);
  group.position.y = -0.55;
  return group;
}

function SewingMachineCanvas({ className }: { className?: string }) {
  return (
    <Scene3D
      buildModel={buildSewingMachine}
      className={className}
      cameraDistance={5.2}
      cameraHeight={0.5}
      rotateSpeed={0.16}
      fov={32}
      fallback={
        <div className="flex h-full w-full items-center justify-center text-6xl" aria-hidden="true">
          🧵
        </div>
      }
    />
  );
}

export default SewingMachineCanvas;
