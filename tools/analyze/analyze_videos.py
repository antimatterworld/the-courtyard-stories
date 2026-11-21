#!/usr/bin/env python3
"""
Phase A — video inventory, keyframes, dominant colours, camera heuristics.
Sources: repo public/assets/real/*.mp4 and optional Business Profile folder.
Writes: src/world/scene-manifest.json, tools/analyze/REPORT.md, public/assets/world/<set>/kf_*.webp
"""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from sklearn.cluster import KMeans

ROOT = Path(__file__).resolve().parents[2]
PUBLIC_REAL = ROOT / "public" / "assets" / "real"
OUT_MANIFEST = ROOT / "src" / "world" / "scene-manifest.json"
OUT_REPORT = Path(__file__).resolve().parent / "REPORT.md"
WORLD_ASSETS = ROOT / "public" / "assets" / "world"
BUSINESS_PROFILE = Path(r"C:\Users\shyam\Downloads\Business Profile")

SET_MAP = {
    "flythrough-02-haveli": "royal-haveli",
    "flythrough-03-colonnade": "mughal-colonnade",
    "flythrough-04-mediterranean": "chefchaouen-suite",
    "portfolio-thatched-tower": "rustic-village",
    "flythrough-05-nightgala": "night-gala",
    "flythrough-01-aerial": "prologue",
}

CHAPTER_DEFAULTS = {
    "prologue": {"fog": "#0A0F1F", "accent": "#FF9F1C"},
    "royal-haveli": {"fog": "#1C1308", "accent": "#E0A44A"},
    "mughal-colonnade": {"fog": "#1F0F0B", "accent": "#E2704F"},
    "chefchaouen-suite": {"fog": "#07142E", "accent": "#4E86E8"},
    "rustic-village": {"fog": "#14110A", "accent": "#B8975F"},
    "night-gala": {"fog": "#120C1A", "accent": "#E8B84B"},
    "epilogue": {"fog": "#0A0F1F", "accent": "#FF9F1C"},
}


def find_ffprobe() -> str | None:
    for name in ("ffprobe", "ffprobe.exe"):
        p = shutil.which(name)
        if p:
            return p
    return None


def ffprobe_meta(path: Path) -> dict:
    ffprobe = find_ffprobe()
    if not ffprobe:
        cap = cv2.VideoCapture(str(path))
        if not cap.isOpened():
            return {}
        fps = cap.get(cv2.CAP_PROP_FPS) or 24
        frames = cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0
        w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 0)
        h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0)
        cap.release()
        return {
            "duration_s": round(frames / fps, 2) if fps else 0,
            "width": w,
            "height": h,
            "fps": round(fps, 2),
            "codec": "opencv",
        }
    cmd = [
        ffprobe,
        "-v",
        "quiet",
        "-print_format",
        "json",
        "-show_format",
        "-show_streams",
        str(path),
    ]
    raw = subprocess.check_output(cmd, text=True)
    data = json.loads(raw)
    vs = next((s for s in data.get("streams", []) if s.get("codec_type") == "video"), {})
    fmt = data.get("format", {})
    return {
        "duration_s": float(fmt.get("duration", 0) or 0),
        "width": int(vs.get("width", 0) or 0),
        "height": int(vs.get("height", 0) or 0),
        "fps": eval_fraction(vs.get("r_frame_rate", "24/1")),
        "codec": vs.get("codec_name", "?"),
        "has_audio": any(s.get("codec_type") == "audio" for s in data.get("streams", [])),
    }


def eval_fraction(s: str) -> float:
    if "/" in s:
        a, b = s.split("/", 1)
        try:
            return round(float(a) / float(b), 2)
        except ZeroDivisionError:
            return 24.0
    return float(s)


def rgb_to_hex(rgb: np.ndarray) -> str:
    r, g, b = (np.clip(rgb, 0, 255)).astype(int)
    return f"#{r:02x}{g:02x}{b:02x}"


def analyse_colors(frames_bgr: list[np.ndarray]) -> dict:
    if not frames_bgr:
        return {"dominant": [], "shadow": "#0A0F1F", "mid": "#1a2338", "highlight": "#FFD58A", "kelvin": 3200}
    sample = np.concatenate([cv2.resize(f, (200, 112)) for f in frames_bgr[:12]])
    lab = cv2.cvtColor(sample, cv2.COLOR_BGR2LAB).reshape(-1, 3).astype(np.float32)
    km = KMeans(n_clusters=6, n_init=4, random_state=42).fit(lab[::4])
    centers_bgr = []
    for c in km.cluster_centers_:
        patch = np.uint8([[c]]).astype(np.uint8)
        bgr = cv2.cvtColor(patch, cv2.COLOR_LAB2BGR)[0][0]
        centers_bgr.append(bgr)
    centers_bgr.sort(key=lambda x: float(np.dot(x, [0.114, 0.587, 0.299])))
    hexes = [rgb_to_hex(c[::-1]) for c in centers_bgr]
    shadow = hexes[0]
    mid = hexes[len(hexes) // 2]
    highlight = hexes[-1]
    warmth = float(np.mean([c[2] - c[0] for c in centers_bgr]))
    kelvin = int(3200 + warmth * 80)
    return {
        "dominant": hexes,
        "shadow": shadow,
        "mid": mid,
        "highlight": highlight,
        "kelvin": kelvin,
    }


def motion_class(frames_gray: list[np.ndarray]) -> str:
    if len(frames_gray) < 2:
        return "static"
    mags = []
    for a, b in zip(frames_gray[:-1], frames_gray[1:]):
        flow = cv2.calcOpticalFlowFarneback(a, b, None, 0.5, 3, 15, 3, 5, 1.2, 0)
        mag = np.mean(np.sqrt(flow[..., 0] ** 2 + flow[..., 1] ** 2))
        mags.append(mag)
    avg = float(np.mean(mags))
    if avg < 0.35:
        return "static"
    if avg < 0.9:
        return "dolly-in"
    if avg < 1.6:
        return "pan"
    return "crane-drone-rise"


def extract_samples(video: Path, every_s: float = 2.0, max_frames: int = 24) -> tuple[list[np.ndarray], list[np.ndarray]]:
    cap = cv2.VideoCapture(str(video))
    if not cap.isOpened():
        return [], []
    fps = cap.get(cv2.CAP_PROP_FPS) or 24
    step = max(int(fps * every_s), 1)
    bgr_list: list[np.ndarray] = []
    gray_list: list[np.ndarray] = []
    idx = 0
    taken = 0
    while taken < max_frames:
        ok, frame = cap.read()
        if not ok:
            break
        if idx % step == 0:
            bgr_list.append(frame)
            gray_list.append(cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY))
            taken += 1
        idx += 1
    cap.release()
    return bgr_list, gray_list


def save_keyframe_webp(frame_bgr: np.ndarray, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    img = Image.fromarray(rgb)
    w, h = img.size
    scale = min(1600 / w, 1600 / h, 1.0)
    if scale < 1:
        img = img.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)
    img.save(dest, "WEBP", quality=82, method=4)


def infer_set_id(name: str) -> str | None:
    base = Path(name).stem.lower()
    for key, sid in SET_MAP.items():
        if key in base:
            return sid
    return None


def collect_videos() -> dict[str, Path]:
    found: dict[str, Path] = {}
    for pattern in ("*.mp4", "*.MP4"):
        for p in PUBLIC_REAL.glob(pattern):
            sid = infer_set_id(p.name)
            if sid and sid not in found:
                found[sid] = p
    if BUSINESS_PROFILE.exists():
        for p in BUSINESS_PROFILE.rglob("*.MP4"):
            if "_compressed" in p.name.lower():
                continue
            if p.stat().st_size > 400_000_000:
                continue
            sid = None
            low = p.name.lower()
            if "haveli" in low or "0025" in low:
                sid = "royal-haveli"
            if sid and sid not in found:
                found[sid] = p
    return found


def build_camera_path(motion: str) -> list[dict]:
    presets = {
        "static": [
            {"t": 0, "pos": [0, 2, 14], "look": [0, 1.5, 0], "fov": 48},
            {"t": 1, "pos": [0, 2.2, 13], "look": [0, 1.5, 0], "fov": 46},
        ],
        "dolly-in": [
            {"t": 0, "pos": [0, 2, 16], "look": [0, 1.8, 0], "fov": 50},
            {"t": 1, "pos": [0, 2.5, 8], "look": [0, 2, 0], "fov": 42},
        ],
        "pan": [
            {"t": 0, "pos": [-8, 2, 6], "look": [2, 2, 0], "fov": 48},
            {"t": 1, "pos": [8, 2, 6], "look": [-2, 2, 0], "fov": 48},
        ],
        "crane-drone-rise": [
            {"t": 0, "pos": [0, 2, 14], "look": [0, 1.5, 0], "fov": 52},
            {"t": 1, "pos": [0, 9, 16], "look": [0, 0, 0], "fov": 55},
        ],
    }
    return presets.get(motion, presets["dolly-in"])


def main() -> int:
    videos = collect_videos()
    if not videos:
        print("No mapped videos found in public/assets/real", file=sys.stderr)
        return 1

    sets_out = []
    report_lines = ["# Phase A — Video analysis report", ""]

    for sid in [
        "prologue",
        "royal-haveli",
        "mughal-colonnade",
        "chefchaouen-suite",
        "rustic-village",
        "night-gala",
        "epilogue",
    ]:
        if sid == "epilogue":
            defs = CHAPTER_DEFAULTS[sid]
            sets_out.append(
                {
                    "id": sid,
                    "sourceVideos": [],
                    "palette": {
                        "dominant": [defs["fog"], defs["accent"]],
                        "shadow": defs["fog"],
                        "mid": defs["fog"],
                        "highlight": defs["accent"],
                        "kelvin": 3000,
                    },
                    "light": {"fog": defs["fog"], "fogDensity": 0.035, "accent": defs["accent"]},
                    "cameraPath": build_camera_path("static"),
                    "keyframes": [],
                }
            )
            continue

        path = videos.get(sid)
        if not path:
            defs = CHAPTER_DEFAULTS[sid]
            sets_out.append(
                {
                    "id": sid,
                    "sourceVideos": [],
                    "palette": {
                        "dominant": [defs["fog"], defs["accent"]],
                        "shadow": defs["fog"],
                        "mid": defs["fog"],
                        "highlight": defs["accent"],
                        "kelvin": 3200,
                    },
                    "light": {"fog": defs["fog"], "fogDensity": 0.03, "accent": defs["accent"]},
                    "cameraPath": build_camera_path("dolly-in"),
                    "keyframes": [],
                }
            )
            report_lines.append(f"## {sid}\n\nMissing video — kept chapter defaults.\n")
            continue

        meta = ffprobe_meta(path)
        bgr, gray = extract_samples(path)
        palette = analyse_colors(bgr)
        motion = motion_class(gray)
        defs = CHAPTER_DEFAULTS[sid]
        fog = palette.get("shadow", defs["fog"])
        accent = palette.get("highlight", defs["accent"])
        if sid == "chefchaouen-suite":
            accent = palette["dominant"][2] if len(palette["dominant"]) > 2 else defs["accent"]

        key_urls: list[str] = []
        set_dir = WORLD_ASSETS / sid.replace("_", "-")
        for i, frame in enumerate(bgr[:8]):
            fname = set_dir / f"kf_{i + 1:03d}.webp"
            save_keyframe_webp(frame, fname)
            key_urls.append(f"/assets/world/{sid}/{fname.name}")

        rel_src = str(path.relative_to(ROOT)) if path.is_relative_to(ROOT) else str(path)

        sets_out.append(
            {
                "id": sid,
                "sourceVideos": [rel_src.replace("\\", "/")],
                "palette": palette,
                "architecture": {"motion": motion},
                "light": {"fog": fog, "fogDensity": 0.032, "accent": accent},
                "cameraPath": build_camera_path(motion),
                "keyframes": key_urls,
            }
        )

        report_lines.extend(
            [
                f"## {sid}",
                f"- **File:** `{path.name}` ({meta.get('width', '?')}×{meta.get('height', '?')}, {meta.get('duration_s', '?')}s, {meta.get('fps', '?')} fps)",
                f"- **Codec:** {meta.get('codec', '?')} · audio: {meta.get('has_audio', '?')}",
                f"- **Motion (optical flow):** {motion}",
                f"- **Palette:** {', '.join(palette.get('dominant', []))}",
                f"- **Suggested fog / accent:** {fog} / {accent}",
                f"- **Keyframes:** {len(key_urls)} webp → `public/assets/world/{sid}/`",
                "",
            ]
        )

    manifest = {"sets": sets_out}
    OUT_MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    OUT_MANIFEST.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    OUT_REPORT.write_text("\n".join(report_lines), encoding="utf-8")
    print(f"Wrote {OUT_MANIFEST}")
    print(f"Wrote {OUT_REPORT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())