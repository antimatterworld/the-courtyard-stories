export const FRAME_COUNT = 96;

export const getFramePath = (index: number): string => {
  const clamped = Math.min(Math.max(index, 0), FRAME_COUNT - 1);
  return `/frames/frame_${String(clamped + 1).padStart(3, "0")}.webp`;
};
