import { Canvas } from "@react-three/fiber";
import { GreyVillage } from "./GreyVillage";

export function StoryCanvas({
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
  return (
    <Canvas
      className="story-canvas"
      frameloop="never"
      gl={{ antialias: true, alpha: false }}
      shadows
      camera={{ fov: 32, near: 0.5, far: 700, position: [0, 2.3, 54.25] }}
      dpr={[1, 1.5]}
      aria-hidden
    >
      <GreyVillage
        showWorldBounds={showWorldBounds}
        portal={portal}
        flyTo={flyTo}
        returnTick={returnTick}
        onArrived={onArrived}
        activeId={activeId}
      />
    </Canvas>
  );
}
