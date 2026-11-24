import { useEffect, useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { DoubleSide, NeutralToneMapping, Object3D, PerspectiveCamera, InstancedMesh, Quaternion, Vector3 } from "three";
import desktopTrack from "../story/camera-track.desktop.generated.json";
import mobileTrack from "../story/camera-track.mobile.generated.json";
import { cameraProfile } from "../story/storyboard";
import { getStory, subscribeStory } from "../story/storyStore";
import { debugStats } from "./debugStats";
import { Neighbourhood } from "./Neighbourhood";
import footprints from "./footprints.json";
import { ZONE_01 } from "./zone01";

type Sample = {
  p: number;
  pos: number[];
  fwd: number[];
  quat: number[];
  fov: number;
};

type Box = { c: number[]; s: number[] };

function usable(track: Sample[]) {
  const good = track.filter((sample) => sample.fov > 8 && Math.hypot(...sample.pos) > 2);
  return good.length > 2 ? good : track;
}

const desktop = usable(desktopTrack as Sample[]);
const mobile = usable(mobileTrack as Sample[]);
const boxes = footprints as Box[];

function sampleAt(track: Sample[], p: number) {
  let hi = 1;
  while (hi < track.length && track[hi].p < p) hi += 1;
  const a = track[Math.max(0, hi - 1)];
  const b = track[Math.min(track.length - 1, hi)];
  const span = Math.max(1e-6, b.p - a.p);
  const t = Math.min(1, Math.max(0, (p - a.p) / span));
  const mix = (x: number[], y: number[]) => x.map((v, i) => v + (y[i] - v) * t);
  const qa = new Quaternion().fromArray(a.quat);
  const qb = new Quaternion().fromArray(b.quat);
  if (qa.dot(qb) < 0) qb.set(-qb.x, -qb.y, -qb.z, -qb.w);
  return {
    pos: mix(a.pos, b.pos),
    quat: qa.slerp(qb, t),
    fov: a.fov + (b.fov - a.fov) * t,
  };
}

function FrameDriver() {
  const advance = useThree((state) => state.advance);
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    const publish = () => {
      let meshes = 0;
      scene.traverse((obj) => {
        if (obj.type === "Mesh") meshes += 1;
      });
      const persp = camera as PerspectiveCamera;
      debugStats.pos = persp.position.toArray();
      debugStats.quat = persp.quaternion.toArray();
      debugStats.fov = persp.fov;
      debugStats.canvas = [gl.domElement.width, gl.domElement.height];
      debugStats.meshes = meshes;
      debugStats.calls = gl.info.render.calls;
    };
    advance(0);
    publish();
    return subscribeStory(() => {
      advance(performance.now());
      publish();
    });
  }, [advance, camera, gl, scene]);

  return null;
}

function CameraRig({
  flyTo,
  returnTick,
  onArrived,
}: {
  flyTo: { current: (id: string) => void };
  returnTick: number;
  onArrived: (id: string) => void;
}) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const advance = useThree((state) => state.advance);
  const onArrivedRef = useRef(onArrived);
  onArrivedRef.current = onArrived;
  const flyHome = useRef<() => void>(() => {});

  useEffect(() => {
    camera.near = 0.5;
    camera.far = 700;
    let raf = 0;
    let flying = false;

    const applyScroll = (p: number) => {
      if (flying) return;
      const sample = sampleAt(cameraProfile() === "mobile" ? mobile : desktop, p);
      camera.position.set(sample.pos[0], sample.pos[1], sample.pos[2]);
      camera.quaternion.copy(sample.quat);
      camera.up.set(0, 1, 0);
      camera.fov = sample.fov;
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
    };

    const glide = (
      toPos: Vector3,
      toQuat: Quaternion,
      toFov: number,
      ms: number,
      done: () => void,
    ) => {
      flying = true;
      const fromPos = camera.position.clone();
      const fromQuat = camera.quaternion.clone();
      const fromFov = camera.fov > 8 ? camera.fov : 32;
      const started = performance.now();
      const step = (now: number) => {
        const raw = Math.min(1, (now - started) / ms);
        const eased = raw < 0.5 ? 2 * raw * raw : 1 - (-2 * raw + 2) ** 2 / 2;
        camera.position.lerpVectors(fromPos, toPos, eased);
        camera.quaternion.slerpQuaternions(fromQuat, toQuat, eased);
        camera.up.set(0, 1, 0);
        camera.fov = fromFov + (toFov - fromFov) * eased;
        camera.updateProjectionMatrix();
        advance(now);
        if (raw < 1) raf = requestAnimationFrame(step);
        else done();
      };
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(step);
    };

    const poseFor = (id: string) => {
      const marker = ZONE_MARKERS.find((item) => item.id === id);
      const eye = new Vector3();
      const look = new Vector3();
      if (!marker || id === "royal-haveli") {
        eye.set(0, 3.6, 46);
        look.set(0, 4.4, 27.2);
      } else {
        const [x, , z] = marker.position;
        const span = Math.hypot(x, z) || 1;
        const stand = Math.max(9, span - 20);
        eye.set((x / span) * stand, 6.4, (z / span) * stand);
        look.set(x * 0.94, 3.1, z * 0.94);
      }
      const rig = new PerspectiveCamera(32, 1, 0.5, 700);
      rig.position.copy(eye);
      rig.up.set(0, 1, 0);
      rig.lookAt(look);
      return { eye, quat: rig.quaternion.clone() };
    };

    flyTo.current = (id: string) => {
      const pose = poseFor(id);
      glide(pose.eye, pose.quat, 32, 1700, () => onArrivedRef.current(id));
    };

    flyHome.current = () => {
      const sample = sampleAt(cameraProfile() === "mobile" ? mobile : desktop, getStory().p);
      glide(new Vector3(...sample.pos), sample.quat.clone(), sample.fov, 1100, () => {
        flying = false;
        applyScroll(getStory().p);
      });
    };

    applyScroll(0);
    const onResize = () => applyScroll(getStory().p);
    window.addEventListener("resize", onResize);
    const stop = subscribeStory(({ p }) => applyScroll(p));
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      stop();
      flyTo.current = () => {};
    };
  }, [advance, camera, flyTo]);

  useEffect(() => {
    if (!returnTick) return;
    flyHome.current();
  }, [returnTick]);

  return null;
}

type Zone = "mughal" | "chefchaouen" | "thatch" | "gala";
type Role = "skip" | "court" | "path" | "gate" | "terrace" | "rail" | "house";

/** West arc is the colonnade, south is Chefchaouen, south-east is thatch, east is the gala. */
function zoneAt(x: number, z: number): Zone {
  let deg = (Math.atan2(z, x) * 180) / Math.PI;
  if (deg > 140) deg -= 360;
  if (deg < -130) return "mughal";
  if (deg < -70) return "chefchaouen";
  if (deg < -18) return "thatch";
  return "gala";
}

const SET_BY_ZONE = {
  mughal: "mughal-colonnade",
  chefchaouen: "chefchaouen-suite",
  thatch: "rustic-village",
  gala: "night-gala",
} as const;

const MARKER_NAMES: Record<string, string> = {
  "royal-haveli": "Royal Haveli",
  "mughal-colonnade": "Mughal Colonnade",
  "chefchaouen-suite": "Chefchaouen",
  "rustic-village": "Thatched Lookout",
  "night-gala": "Night Gala",
};

const SHORT_NAMES: Record<string, string> = {
  "royal-haveli": "Haveli",
  "mughal-colonnade": "Mughal",
  "chefchaouen-suite": "Chefchaouen",
  "rustic-village": "Thatch",
  "night-gala": "Gala",
};

function roleOf(box: Box): Role {
  const [w, h, d] = box.s;
  const [x, y, z] = box.c;
  const minH = Math.min(w, d);
  const maxH = Math.max(w, d);
  const r = Math.hypot(x, z);
  if (r < 0.05 && y === 0 && maxH <= 2.1 && h <= 2.1) return "skip";
  if (h > 6 && minH < 3.5 && maxH > 12) return "gate";
  if (h < 0.7 && maxH > 10 && minH < 1) return "rail";
  if (h < 0.2 && maxH > 8) return "path";
  if (h < 2 && maxH > 16) return "terrace";
  if (r < 4 && h < 2) return "court";
  if (h > 2.5 && maxH > 5) return "house";
  return "skip";
}

function setIdFor(box: Box) {
  const role = roleOf(box);
  if (role === "gate") return "royal-haveli";
  if (role === "house") return SET_BY_ZONE[zoneAt(box.c[0], box.c[2])];
  return null;
}

const ZONE_MARKERS = (() => {
  const acc = new Map<string, { x: number; z: number; top: number; n: number }>();
  const add = (id: string, x: number, z: number, top: number) => {
    const cur = acc.get(id) ?? { x: 0, z: 0, top: 0, n: 0 };
    cur.x += x;
    cur.z += z;
    cur.top = Math.max(cur.top, top);
    cur.n += 1;
    acc.set(id, cur);
  };
  for (const box of boxes) {
    const id = setIdFor(box);
    if (!id) continue;
    const role = roleOf(box);
    const top = role === "gate" ? box.c[1] + box.s[1] / 2 : box.s[1];
    add(id, box.c[0], box.c[2], top);
  }
  return [...acc.entries()].map(([id, spot]) => ({
    id,
    name: MARKER_NAMES[id] ?? id,
    short: SHORT_NAMES[id] ?? id,
    position: [spot.x / spot.n, spot.top + 1.8, spot.z / spot.n] as [number, number, number],
  }));
})();

function Solid({
  args,
  position = [0, 0, 0],
  color,
  emissive,
}: {
  args: [number, number, number];
  position?: [number, number, number];
  color: string;
  emissive?: string;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial
        color={color}
        roughness={0.86}
        emissive={emissive ?? "#000000"}
        emissiveIntensity={emissive ? 0.85 : 0}
      />
    </mesh>
  );
}

function Gate({ box }: { box: Box }) {
  const [w, h, d] = box.s;
  const lintel = h * 0.14;
  const pierH = h - lintel;
  const pierY = -h / 2 + pierH / 2;
  const slots = [0, 1, 2, 4, 5, 6];
  return (
    <group position={box.c as [number, number, number]}>
      {slots.map((i) => (
        <Solid
          key={i}
          position={[-w / 2 + w * ((i + 0.5) / 7), pierY, 0]}
          args={[w * 0.065, pierH, d * 0.82]}
          color="#e2b34a"
        />
      ))}
      <Solid position={[0, h / 2 - lintel / 2, 0]} args={[w, lintel, d]} color="#e2b34a" />
      <Solid position={[0, h / 2 - lintel - h * 0.035, 0]} args={[w * 0.98, h * 0.045, d * 1.02]} color="#a33b32" />
      {Array.from({ length: 11 }, (_, i) => (
        <Solid
          key={`merlon-${i}`}
          position={[-w * 0.42 + i * (w * 0.084), h / 2 + h * 0.025, 0]}
          args={[w * 0.035, h * 0.05, d * 0.7]}
          color="#a33b32"
        />
      ))}
      <mesh position={[0, -h * 0.02, d * 0.15]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[w * 0.11, h * 0.012, 8, 20, Math.PI]} />
        <meshStandardMaterial color="#f4e2b0" roughness={0.45} />
      </mesh>
      <Solid position={[0, -h * 0.16, d * 0.08]} args={[w * 0.16, h * 0.36, 0.12]} color="#4a241c" />
    </group>
  );
}

function Rail({ box }: { box: Box }) {
  const [w, h, d] = box.s;
  const alongZ = d > w;
  const span = alongZ ? d : w;
  const thick = alongZ ? w : d;
  const pierH = Math.max(0.2, box.c[1] - h / 2);
  return (
    <group position={box.c as [number, number, number]}>
      <Solid args={[w, h, d]} color="#f4efe6" />
      {Array.from({ length: 5 }, (_, i) => {
        const t = -span / 2 + (span / 4) * i;
        const pos: [number, number, number] = alongZ ? [0, -h / 2 - pierH / 2, t] : [t, -h / 2 - pierH / 2, 0];
        return <Solid key={i} position={pos} args={[thick * 0.72, pierH, thick * 0.72]} color="#f4efe6" />;
      })}
    </group>
  );
}

function CourtPiece({ box }: { box: Box }) {
  const [w, h] = box.s;
  const pos = box.c as [number, number, number];
  if (w > 4) {
    return (
      <group position={pos}>
        <mesh receiveShadow>
          <cylinderGeometry args={[w / 2, w / 2, h, 48]} />
          <meshStandardMaterial color="#f4eadc" roughness={1} />
        </mesh>
        <mesh position={[0, h * 0.55, 0]}>
          <cylinderGeometry args={[w * 0.22, w * 0.22, h * 0.35, 32]} />
          <meshStandardMaterial color="#1c2430" roughness={0.55} />
        </mesh>
        {[0, 45, 90, 135].map((deg) => (
          <mesh key={deg} position={[0, h * 0.62, 0]} rotation={[0, (deg * Math.PI) / 180, 0]}>
            <boxGeometry args={[w * 0.86, h * 0.2, w * 0.045]} />
            <meshStandardMaterial color="#e2b34a" roughness={0.7} />
          </mesh>
        ))}
      </group>
    );
  }
  if (h < 0.25) {
    return (
      <mesh position={pos}>
        <cylinderGeometry args={[w / 2, w / 2, h, 24]} />
        <meshStandardMaterial color="#f7f1e6" roughness={0.45} />
      </mesh>
    );
  }
  if (w < 0.6) {
    return (
      <mesh position={pos} castShadow>
        <cylinderGeometry args={[Math.max(w, 0.2) / 2, Math.max(w, 0.2) / 2, h, 12]} />
        <meshStandardMaterial color="#f7f1e6" roughness={0.4} />
      </mesh>
    );
  }
  return (
    <mesh position={pos} castShadow>
      <sphereGeometry args={[w / 2, 16, 12]} />
      <meshStandardMaterial color="#d4a017" metalness={0.35} roughness={0.32} />
    </mesh>
  );
}

function Chefchaouen({ w, h, d }: { w: number; h: number; d: number }) {
  const arches = Math.max(3, Math.min(5, Math.floor(w / 2.2)));
  const bay = w * 0.72;
  return (
    <group>
      <Solid position={[-w * 0.08, -h * 0.08, -d * 0.06]} args={[w * 0.7, h * 0.72, d * 0.72]} color="#1a6cb0" />
      <Solid position={[w * 0.3, -h * 0.08, -d * 0.04]} args={[w * 0.26, h * 0.72, d * 0.7]} color="#e07a2f" />
      <Solid position={[0, h * 0.34, 0]} args={[w * 0.98, h * 0.08, d * 0.96]} color="#f4f1ea" />
      <Solid position={[0, h * 0.42, d * 0.12]} args={[w * 0.9, h * 0.05, d * 0.08]} color="#f7f3ea" />
      <Solid position={[0, -h * 0.46, d * 0.42]} args={[w * 0.96, h * 0.04, d * 0.22]} color="#d8efe8" />
      {Array.from({ length: arches }, (_, i) => {
        const x = -bay / 2 + (bay / arches) * (i + 0.5);
        const aw = bay / arches * 0.72;
        const pier = h * 0.46;
        const radius = aw * 0.46;
        return (
          <group key={i} position={[x, -h * 0.02, d * 0.34]}>
            <Solid position={[-aw * 0.38, -h * 0.08, 0]} args={[aw * 0.16, pier, aw * 0.22]} color="#f7f3ea" />
            <Solid position={[aw * 0.38, -h * 0.08, 0]} args={[aw * 0.16, pier, aw * 0.22]} color="#f7f3ea" />
            <mesh position={[0, -h * 0.08 + pier * 0.42, 0]} rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[radius, Math.max(aw * 0.07, 0.05), 8, 20, Math.PI]} />
              <meshStandardMaterial color="#f7f3ea" roughness={0.4} />
            </mesh>
            <Solid position={[0, -h * 0.12, -aw * 0.08]} args={[aw * 0.52, pier * 0.78, 0.06]} color="#10283f" />
            {Array.from({ length: 3 }, (_, row) =>
              Array.from({ length: 3 }, (_, col) => (
                <mesh key={`${row}-${col}`} position={[-aw * 0.16 + col * aw * 0.16, -h * 0.22 + row * pier * 0.22, aw * 0.02]}>
                  <boxGeometry args={[aw * 0.05, pier * 0.08, 0.04]} />
                  <meshStandardMaterial color="#f4f1ea" roughness={0.35} />
                </mesh>
              )),
            )}
          </group>
        );
      })}
      <Solid position={[w * 0.3, h * 0.08, d * 0.3]} args={[w * 0.1, h * 0.22, 0.08]} color="#f7f3ea" />
      <Solid position={[w * 0.3, -h * 0.16, d * 0.3]} args={[w * 0.12, h * 0.28, 0.08]} color="#8d3d1c" />
    </group>
  );
}

function Mughal({ w, h, d }: { w: number; h: number; d: number }) {
  const arches = Math.max(3, Math.min(5, Math.floor(w / 2.1)));
  const bay = w * 0.78;
  return (
    <group>
      <Solid position={[0, -h * 0.08, -d * 0.08]} args={[w * 0.9, h * 0.7, d * 0.7]} color="#c46a45" />
      <Solid position={[0, h * 0.32, 0]} args={[w * 0.98, h * 0.1, d * 0.92]} color="#8d4332" />
      <Solid position={[0, -h * 0.46, d * 0.4]} args={[w * 0.96, h * 0.045, d * 0.2]} color="#e7d3b0" />
      {Array.from({ length: arches }, (_, i) => {
        const x = -bay / 2 + (bay / arches) * (i + 0.5);
        const aw = (bay / arches) * 0.7;
        const pier = h * 0.48;
        return (
          <group key={i} position={[x, -h * 0.04, d * 0.32]}>
            <Solid position={[-aw * 0.36, -h * 0.06, 0]} args={[aw * 0.18, pier, aw * 0.22]} color="#f3e6cf" />
            <Solid position={[aw * 0.36, -h * 0.06, 0]} args={[aw * 0.18, pier, aw * 0.22]} color="#f3e6cf" />
            <mesh position={[0, -h * 0.06 + pier * 0.4, 0]} rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[aw * 0.4, Math.max(aw * 0.07, 0.05), 8, 18, Math.PI]} />
              <meshStandardMaterial color="#f3e6cf" roughness={0.42} />
            </mesh>
            <Solid position={[0, -h * 0.1, -aw * 0.06]} args={[aw * 0.48, pier * 0.72, 0.05]} color="#6e2c28" />
            <Solid position={[0, h * 0.18, aw * 0.08]} args={[0.12, 0.12, 0.12]} color="#e7c56a" emissive="#e7c56a" />
          </group>
        );
      })}
    </group>
  );
}

function Thatch({ w, h, d }: { w: number; h: number; d: number }) {
  return (
    <group>
      <Solid position={[0, -h * 0.18, 0]} args={[w * 0.78, h * 0.46, d * 0.72]} color="#e4c98a" />
      <Solid position={[0, h * 0.08, 0]} args={[w * 0.96, h * 0.12, d * 0.96]} color="#c4a15a" />
      <Solid position={[0, h * 0.22, 0]} args={[w * 0.72, h * 0.12, d * 0.72]} color="#a88448" />
      <Solid position={[0, h * 0.34, 0]} args={[w * 0.46, h * 0.1, d * 0.46]} color="#8c6a38" />
      <Solid position={[0, h * 0.16, d * 0.28]} args={[w * 0.7, h * 0.04, d * 0.08]} color="#6e4b32" />
      {[-0.28, 0.28].map((side) => (
        <Solid key={side} position={[w * side, -h * 0.05, d * 0.32]} args={[w * 0.06, h * 0.55, d * 0.08]} color="#6e4b32" />
      ))}
      <Solid position={[0, -h * 0.22, d * 0.34]} args={[w * 0.22, h * 0.32, 0.08]} color="#4a3024" />
      <Solid position={[-w * 0.22, -h * 0.38, d * 0.36]} args={[w * 0.08, h * 0.08, w * 0.08]} color="#a15a32" />
      <Solid position={[w * 0.24, -h * 0.36, d * 0.34]} args={[w * 0.1, h * 0.1, w * 0.1]} color="#8d4a2b" />
    </group>
  );
}

function Gala({ w, h, d }: { w: number; h: number; d: number }) {
  const lamps = Math.max(5, Math.min(8, Math.floor(w / 1.2)));
  return (
    <group>
      <Solid position={[0, -h * 0.08, -d * 0.06]} args={[w * 0.88, h * 0.68, d * 0.74]} color="#d08a62" />
      <Solid position={[0, h * 0.3, 0]} args={[w * 0.96, h * 0.08, d * 0.9]} color="#7a3a32" />
      <Solid position={[0, -h * 0.1, d * 0.32]} args={[w * 0.2, h * 0.42, 0.08]} color="#6a2434" />
      <mesh position={[0, h * 0.02, d * 0.34]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[w * 0.12, Math.max(h * 0.012, 0.05), 8, 18, Math.PI]} />
        <meshStandardMaterial color="#f3e6cf" roughness={0.4} />
      </mesh>
      <Solid position={[0, -h * 0.46, d * 0.4]} args={[w * 0.9, h * 0.04, d * 0.16]} color="#2a2428" />
      {Array.from({ length: lamps }, (_, i) => (
        <Solid
          key={i}
          position={[-w * 0.4 + (i * w * 0.8) / Math.max(1, lamps - 1), h * 0.4, d * 0.1]}
          args={[0.16, 0.16, 0.16]}
          color="#f6e27a"
          emissive="#f6e27a"
        />
      ))}
    </group>
  );
}

function House({ box }: { box: Box }) {
  const [w, h, d] = box.s;
  const zone = zoneAt(box.c[0], box.c[2]);
  const yaw = Math.atan2(-box.c[0], -box.c[2]);
  return (
    <group position={[box.c[0], h / 2, box.c[2]]} rotation={[0, yaw, 0]}>
      {zone === "mughal" ? <Mughal w={w} h={h} d={d} /> : null}
      {zone === "chefchaouen" ? <Chefchaouen w={w} h={h} d={d} /> : null}
      {zone === "thatch" ? <Thatch w={w} h={h} d={d} /> : null}
      {zone === "gala" ? <Gala w={w} h={h} d={d} /> : null}
    </group>
  );
}

function Footprint({ box, onPick }: { box: Box; onPick: (id: string) => void }) {
  const role = roleOf(box);
  if (role === "skip") return null;
  const id = setIdFor(box);
  let body: ReactNode = null;
  if (role === "gate") body = <Gate box={box} />;
  else if (role === "rail") body = <Rail box={box} />;
  else if (role === "court") body = <CourtPiece box={box} />;
  else if (role === "path") body = <Solid position={box.c as [number, number, number]} args={box.s as [number, number, number]} color="#efe2cc" />;
  else if (role === "terrace") {
    const [w, h, d] = box.s;
    body = (
      <group position={box.c as [number, number, number]}>
        <Solid args={[w, h * 0.45, d]} position={[0, -h * 0.2, 0]} color="#eadcc6" />
        <Solid args={[w * 0.94, h * 0.4, d * 0.94]} position={[0, h * 0.18, 0]} color="#f6eee0" />
      </group>
    );
  } else body = <House box={box} />;
  if (!id) return body;
  return (
    <group
      onClick={(event) => {
        event.stopPropagation();
        onPick(id);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      {body}
    </group>
  );
}

type TreeSpot = { x: number; z: number; scale: number };

function treeRing(count: number, radius: number, skipNearGate: boolean): TreeSpot[] {
  const spots: TreeSpot[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + 0.17;
    const r = radius + (i % 4) * 0.65;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    if (skipNearGate && z > 22 && Math.abs(x) < 16) continue;
    if (!skipNearGate && z > 1.5) continue;
    spots.push({ x, z, scale: 0.85 + (i % 5) * 0.12 });
  }
  return spots;
}

const CYPRESSES = treeRing(36, 40, true);
const COURTYARD_TREES = treeRing(18, 16, false);

function Grove({ spots, crown, count }: { spots: TreeSpot[]; crown: "cypress" | "round"; count: number }) {
  const trunks = useRef<InstancedMesh>(null);
  const crowns = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const dummy = new Object3D();
    for (let i = 0; i < count; i++) {
      const spot = spots[i];
      const s = spot?.scale ?? 1;
      dummy.position.set(spot?.x ?? 0, 0.45 * s, spot?.z ?? 0);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      trunks.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(spot?.x ?? 0, crown === "cypress" ? 1.7 * s : 1.25 * s, spot?.z ?? 0);
      dummy.updateMatrix();
      crowns.current?.setMatrixAt(i, dummy.matrix);
    }
    if (trunks.current) trunks.current.instanceMatrix.needsUpdate = true;
    if (crowns.current) crowns.current.instanceMatrix.needsUpdate = true;
  }, [count, crown, spots]);
  return (
    <>
      <instancedMesh ref={trunks} args={[undefined, undefined, count]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.9, 6]} />
        <meshStandardMaterial color="#6b4a32" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={crowns} args={[undefined, undefined, count]} castShadow>
        {crown === "cypress" ? <coneGeometry args={[0.38, 2.1, 7]} /> : <sphereGeometry args={[0.55, 8, 6]} />}
        <meshStandardMaterial color={crown === "cypress" ? "#2f6a45" : "#c6a24a"} roughness={0.9} />
      </instancedMesh>
    </>
  );
}

function ZoneLabels({
  portal,
  onPick,
  activeId,
}: {
  portal: HTMLElement;
  onPick: (id: string) => void;
  activeId: string | null;
}) {
  const portalRef = useRef(portal);
  portalRef.current = portal;
  return (
    <>
      {ZONE_MARKERS.map((marker) => (
        <Html
          key={marker.id}
          position={marker.position}
          center
          portal={portalRef as RefObject<HTMLElement>}
          zIndexRange={[1, 0]}
          wrapperClass="zone-label-wrap"
        >
          <button
            type="button"
            className={activeId === marker.id ? "zone-label is-on" : "zone-label"}
            aria-label={marker.name}
            onClick={(event) => {
              event.stopPropagation();
              onPick(marker.id);
            }}
          >
            <span className="zone-label-full">{marker.name}</span>
            <span className="zone-label-short">{marker.short}</span>
          </button>
        </Html>
      ))}
    </>
  );
}

function GreyBoxes({ showWorldBounds, onPick }: { showWorldBounds: boolean; onPick: (id: string) => void }) {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[33, 72]} />
        <meshStandardMaterial color="#f3e6d2" roughness={1} />
      </mesh>
      {boxes.map((box, index) => (
        <Footprint key={index} box={box} onPick={onPick} />
      ))}
      <Grove spots={CYPRESSES} crown="cypress" count={CYPRESSES.length} />
      <Grove spots={COURTYARD_TREES} crown="round" count={COURTYARD_TREES.length} />
      {showWorldBounds ? (
        <mesh position={ZONE_01.center}>
          <boxGeometry args={ZONE_01.size} />
          <meshBasicMaterial color="#1c120c" wireframe />
        </mesh>
      ) : null}
    </>
  );
}

export function GreyVillage({
  showWorldBounds,
  portal,
  flyTo,
  returnTick,
  onArrived,
  activeId,
}: {
  showWorldBounds: boolean;
  portal: HTMLElement | null;
  flyTo: { current: (id: string) => void };
  returnTick: number;
  onArrived: (id: string) => void;
  activeId: string | null;
}) {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    gl.toneMapping = NeutralToneMapping;
    gl.toneMappingExposure = 1;
  }, [gl]);

  return (
    <>
      <color attach="background" args={["#e8d8c3"]} />
      <fog attach="fog" args={["#e8d8c3", 70, 330]} />
      <hemisphereLight args={["#fff6ea", "#e8d8c3", 1]} />
      <directionalLight
        position={[-34, 60, 42]}
        intensity={3.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={8}
        shadow-camera-far={160}
        shadow-camera-left={-55}
        shadow-camera-right={55}
        shadow-camera-top={55}
        shadow-camera-bottom={-55}
      />
      {/* OBSERVED desktop/layout.json depth-2 group at [0,0,0], size [640, 0, 640]. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[640, 640]} />
        <meshStandardMaterial color="#e6d3b8" roughness={1} side={DoubleSide} />
      </mesh>
      <Neighbourhood />
      <GreyBoxes showWorldBounds={showWorldBounds} onPick={(id) => flyTo.current(id)} />
      <CameraRig flyTo={flyTo} returnTick={returnTick} onArrived={onArrived} />
      {portal ? <ZoneLabels portal={portal} onPick={(id) => flyTo.current(id)} activeId={activeId} /> : null}
      <FrameDriver />
    </>
  );
}
