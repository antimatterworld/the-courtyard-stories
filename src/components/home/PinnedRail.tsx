import { useState } from "react";
import { ARCHITECTURAL_SETS } from "../../data/content";
import { FallingCardStack, setsAsFallingCards } from "./FallingCardStack";
import { FiveWorldsDetail } from "./FiveWorldsDetail";

export function PinnedRail() {
  const [openId, setOpenId] = useState<string | null>(null);
  const openSet = ARCHITECTURAL_SETS.find((s) => s.id === openId) ?? null;

  return (
    <>
      <FallingCardStack cards={setsAsFallingCards()} onOpen={setOpenId} />
      {openSet ? <FiveWorldsDetail set={openSet} onClose={() => setOpenId(null)} /> : null}
    </>
  );
}