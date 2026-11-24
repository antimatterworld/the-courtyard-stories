import { useLayoutEffect, useRef } from "react";
import { InstancedMesh, Object3D } from "three";

/**
 * Original stand-ins for the saved Kapashera pin: a farm lane behind a college,
 * compound plots, trees, and street objects around the courtyard. Not a map capture.
 */

type Spot = { x: number; y: number; z: number; sx: number; sy: number; sz: number; ry: number };

function outsideCourt(x: number, z: number) {
  return !(z > 22 && Math.abs(x) < 20) && Math.hypot(x, z) > 46;
}

function farmHouses(): Spot[] {
  const spots: Spot[] = [];
  for (let i = 0; i < 36; i += 1) {
    const angle = (i / 36) * Math.PI * 2 + 0.35;
    const radius = 62 + (i % 4) * 8;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    if (!outsideCourt(x, z)) continue;
    const height = 3.4 + (i % 5) * 1.15;
    spots.push({
      x,
      y: height / 2,
      z,
      sx: 7 + (i % 3) * 2.2,
      sy: height,
      sz: 6 + (i % 4) * 1.6,
      ry: angle + Math.PI / 2,
    });
  }
  return spots;
}

function roadTrees(): Spot[] {
  const spots: Spot[] = [];
  for (let i = 0; i < 28; i += 1) {
    const z = 34 + i * 2.15;
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (7.2 + (i % 3) * 0.4);
    spots.push({ x, y: 2.1, z, sx: 1, sy: 1, sz: 1, ry: 0 });
  }
  for (let i = 0; i < 22; i += 1) {
    const x = -78 + i * 7.2;
    const z = -58 + (i % 2) * 3;
    spots.push({ x, y: 2.4, z, sx: 1.15, sy: 1.15, sz: 1.15, ry: 0 });
  }
  return spots;
}

function lamps(): Spot[] {
  const spots: Spot[] = [];
  for (let i = 0; i < 10; i += 1) {
    const z = 36 + i * 5.2;
    spots.push({ x: i % 2 === 0 ? -4.6 : 4.6, y: 2.3, z, sx: 1, sy: 1, sz: 1, ry: 0 });
  }
  return spots;
}

const HOUSES = farmHouses();
const TREES = roadTrees();
const LAMPS = lamps();

function place(mesh: InstancedMesh | null, spots: Spot[], scaleY = 1) {
  if (!mesh) return;
  const dummy = new Object3D();
  spots.forEach((spot, index) => {
    dummy.position.set(spot.x, spot.y * scaleY, spot.z);
    dummy.rotation.set(0, spot.ry, 0);
    dummy.scale.set(spot.sx, spot.sy, spot.sz);
    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
}

export function Neighbourhood() {
  const houses = useRef<InstancedMesh>(null);
  const roofs = useRef<InstancedMesh>(null);
  const trees = useRef<InstancedMesh>(null);
  const lamps = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    place(houses.current, HOUSES);
    place(
      roofs.current,
      HOUSES.map((spot) => ({ ...spot, y: spot.sy + 0.18, sy: 0.35 })),
    );
    place(trees.current, TREES);
    place(lamps.current, LAMPS);
  }, []);

  return (
    <group name="kapashera-lane">
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 58]} receiveShadow>
        <planeGeometry args={[9, 52]} />
        <meshStandardMaterial color="#cbb89a" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 58]}>
        <planeGeometry args={[0.18, 46]} />
        <meshStandardMaterial color="#f4efe4" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-20, 0.03, -62]} receiveShadow>
        <planeGeometry args={[120, 8]} />
        <meshStandardMaterial color="#c3b08f" roughness={1} />
      </mesh>

      <mesh position={[-8, 0.55, -62]}>
        <boxGeometry args={[90, 1.1, 0.35]} />
        <meshStandardMaterial color="#e7d7bc" roughness={1} />
      </mesh>
      <mesh position={[0, 6.5, -78]} castShadow>
        <boxGeometry args={[46, 13, 16]} />
        <meshStandardMaterial color="#f3efe6" roughness={0.9} />
      </mesh>
      <mesh position={[0, 8.2, -70.2]}>
        <boxGeometry args={[40, 2.2, 0.4]} />
        <meshStandardMaterial color="#1f4f86" roughness={0.6} />
      </mesh>
      <mesh position={[18, 16.5, -78]} castShadow>
        <boxGeometry args={[4.2, 8, 4.2]} />
        <meshStandardMaterial color="#efe8dc" roughness={0.9} />
      </mesh>

      <mesh position={[68, 7.5, -24]} castShadow>
        <cylinderGeometry args={[3.2, 3.4, 3.2, 16]} />
        <meshStandardMaterial color="#d5dbe2" roughness={0.7} />
      </mesh>
      <mesh position={[68, 4.2, -24]}>
        <cylinderGeometry args={[0.35, 0.45, 8, 8]} />
        <meshStandardMaterial color="#8d93a0" roughness={0.8} />
      </mesh>

      <instancedMesh ref={houses} args={[undefined, undefined, HOUSES.length]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#efe2cc" roughness={0.92} />
      </instancedMesh>
      <instancedMesh ref={roofs} args={[undefined, undefined, HOUSES.length]}>
        <boxGeometry args={[1.08, 1, 1.08]} />
        <meshStandardMaterial color="#8d4e3b" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={trees} args={[undefined, undefined, TREES.length]} castShadow>
        <sphereGeometry args={[1.15, 8, 6]} />
        <meshStandardMaterial color="#3c6a46" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={lamps} args={[undefined, undefined, LAMPS.length]}>
        <cylinderGeometry args={[0.08, 0.1, 4.6, 6]} />
        <meshStandardMaterial color="#5c5348" roughness={0.8} />
      </instancedMesh>
    </group>
  );
}
