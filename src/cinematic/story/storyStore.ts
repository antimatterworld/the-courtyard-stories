export type StorySnapshot = {
  p: number;
  chapterIndex: number;
  direction: 1 | -1 | 0;
};

type Listener = (snap: StorySnapshot) => void;

let snap: StorySnapshot = { p: 0, chapterIndex: 0, direction: 0 };
const listeners = new Set<Listener>();

export function getStory() {
  return snap;
}

export function setStory(next: StorySnapshot) {
  snap = next;
  listeners.forEach((fn) => fn(snap));
}

export function subscribeStory(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
