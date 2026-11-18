#!/usr/bin/env python3
import os, subprocess, shutil

RAW = '/Users/yasirkhan/The-Courtyard-Stories/drive_raw'
OUT_REAL = '/Users/yasirkhan/The-Courtyard-Stories/public/assets/real'
os.makedirs(OUT_REAL, exist_ok=True)

# Helper function to extract and convert frame to webp
def extract_webp(input_vid, timestamp, out_name, quality=88):
    tmp_jpg = os.path.join(OUT_REAL, f'_tmp_{out_name}.jpg')
    out_webp = os.path.join(OUT_REAL, f'{out_name}.webp')
    
    # Extract pristine full-resolution frame
    cmd1 = ['ffmpeg', '-y', '-ss', timestamp, '-i', input_vid, '-frames:v', '1', '-q:v', '1', tmp_jpg]
    subprocess.run(cmd1, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    # Convert to webp with cwebp (or sips/ffmpeg fallback)
    cmd2 = ['cwebp', '-q', str(quality), tmp_jpg, '-o', out_webp]
    res = subprocess.run(cmd2, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if res.returncode != 0:
        # Fallback with ffmpeg
        subprocess.run(['ffmpeg', '-y', '-i', tmp_jpg, '-q:v', '88', out_webp], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    if os.path.exists(tmp_jpg):
        os.remove(tmp_jpg)
    print(f'Created image: {out_webp} ({os.path.getsize(out_webp)/1024:.1f} KB)')

# Helper function to encode video loop with hardware acceleration and +faststart
def encode_video_loop(input_vid, start_time, duration, out_name, bitrate='4000k', width=1920, height=1080):
    out_mp4 = os.path.join(OUT_REAL, f'{out_name}.mp4')
    scale_filter = f'scale={width}:{height}'
    
    cmd = [
        'ffmpeg', '-y',
        '-hwaccel', 'videotoolbox',
        '-ss', start_time,
        '-t', str(duration),
        '-i', input_vid,
        '-vf', scale_filter,
        '-c:v', 'h264_videotoolbox',
        '-b:v', bitrate,
        '-an',
        '-movflags', '+faststart',
        out_mp4
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f'Created video: {out_mp4} ({os.path.getsize(out_mp4)/(1024*1024):.2f} MB)')

print('1. Encoding Hero Ambient Drone Video & Poster...')
# Hero: DJI_0025 (sweeping high aerial over courtyard)
encode_video_loop(os.path.join(RAW, 'DJI_0025_D.MP4'), '00:00:02', 10, 'hero-drone-loop', bitrate='4200k')
extract_webp(os.path.join(RAW, 'DJI_0025_D.MP4'), '00:00:04', 'hero-drone-poster')

print('2. Encoding Scrollytelling Drone Stages...')
# Stage 1: High Aerial Estate Sweep (DJI_0021)
encode_video_loop(os.path.join(RAW, 'DJI_0021_D.MP4'), '00:00:02', 8, 'flythrough-01-aerial', bitrate='3800k')
extract_webp(os.path.join(RAW, 'DJI_0021_D.MP4'), '00:00:04', 'flythrough-01-aerial')

# Stage 2: Royal Haveli & Courtyard Descent (DJI_0020)
encode_video_loop(os.path.join(RAW, 'DJI_0020_D.MP4'), '00:00:01', 8, 'flythrough-02-haveli', bitrate='3800k')
extract_webp(os.path.join(RAW, 'DJI_0020_D.MP4'), '00:00:04', 'flythrough-02-haveli')

# Stage 3: Mughal Colonnade Pavilion (DJI_0045)
encode_video_loop(os.path.join(RAW, 'DJI_0045_D.MP4'), '00:00:02', 8, 'flythrough-03-colonnade', bitrate='3800k')
extract_webp(os.path.join(RAW, 'DJI_0045_D.MP4'), '00:00:04', 'flythrough-03-colonnade')

# Stage 4: Chefchaouen Moroccan / Santorini Arches (DJI_0060)
encode_video_loop(os.path.join(RAW, 'DJI_0060_D.MP4'), '00:00:01', 8, 'flythrough-04-mediterranean', bitrate='3800k')
extract_webp(os.path.join(RAW, 'DJI_0060_D.MP4'), '00:00:03', 'flythrough-04-mediterranean')

# Stage 5: Night Gala Celebration under string lights (4.mp4)
encode_video_loop(os.path.join(RAW, '4.mp4'), '00:00:01', 8, 'flythrough-05-nightgala', bitrate='3200k', width=1080, height=1920)
extract_webp(os.path.join(RAW, '4.mp4'), '00:00:03', 'flythrough-05-nightgala')

print('3. Encoding Services Reels & Stills...')
# Fashion: Grand Haveli Staircase (DJI_0017)
encode_video_loop(os.path.join(RAW, 'DJI_0017_D.MP4'), '00:00:01', 8, 'fashion-reel', bitrate='3600k')
extract_webp(os.path.join(RAW, 'DJI_0017_D.MP4'), '00:00:03', 'fashion-still')

# Commercial: Full Estate Panoramic (DJI_0050)
encode_video_loop(os.path.join(RAW, 'DJI_0050_D.MP4'), '00:00:01', 8, 'commercial-reel', bitrate='3600k')
extract_webp(os.path.join(RAW, 'DJI_0050_D.MP4'), '00:00:03', 'commercial-still')

# Studio Space & Architecture: Birds-eye cane & courtyard (DJI_0035)
encode_video_loop(os.path.join(RAW, 'DJI_0035_D.MP4'), '00:00:01', 8, 'studio-reel', bitrate='3600k')
extract_webp(os.path.join(RAW, 'DJI_0035_D.MP4'), '00:00:03', 'studio-still')

# Events & Gala: Luxury evening party (5.mp4)
encode_video_loop(os.path.join(RAW, '5.mp4'), '00:00:02', 8, 'events-reel', bitrate='3200k', width=1080, height=1920)
extract_webp(os.path.join(RAW, '5.mp4'), '00:00:05', 'events-still')

print('4. Encoding Portfolio Items...')
# 1. Haveli Staircase & Jharokhas (DJI_0017)
encode_video_loop(os.path.join(RAW, 'DJI_0017_D.MP4'), '00:00:04', 6, 'portfolio-haveli-staircase', bitrate='3400k')
extract_webp(os.path.join(RAW, 'DJI_0017_D.MP4'), '00:00:04', 'portfolio-haveli-staircase')

# 2. Night Courtyard Diwali Banquet (4.mp4)
encode_video_loop(os.path.join(RAW, '4.mp4'), '00:00:02', 6, 'portfolio-night-banquet', bitrate='3000k', width=1080, height=1920)
extract_webp(os.path.join(RAW, '4.mp4'), '00:00:03', 'portfolio-night-banquet')

# 3. Terracotta Jali Colonnade (DJI_0045)
encode_video_loop(os.path.join(RAW, 'DJI_0045_D.MP4'), '00:00:01', 6, 'portfolio-terracotta-jali', bitrate='3400k')
extract_webp(os.path.join(RAW, 'DJI_0045_D.MP4'), '00:00:03', 'portfolio-terracotta-jali')

# 4. Chefchaouen Moroccan Suite (DJI_0060)
encode_video_loop(os.path.join(RAW, 'DJI_0060_D.MP4'), '00:00:02', 6, 'portfolio-blue-arches', bitrate='3400k')
extract_webp(os.path.join(RAW, 'DJI_0060_D.MP4'), '00:00:03', 'portfolio-blue-arches')

# 5. Birds-Eye Geometric Cane Layout (DJI_0035)
encode_video_loop(os.path.join(RAW, 'DJI_0035_D.MP4'), '00:00:02', 6, 'portfolio-birdseye-cane', bitrate='3400k')
extract_webp(os.path.join(RAW, 'DJI_0035_D.MP4'), '00:00:04', 'portfolio-birdseye-cane')

# 6. Thatched Village Tower (DJI_0040)
encode_video_loop(os.path.join(RAW, 'DJI_0040_D.MP4'), '00:00:01', 6, 'portfolio-thatched-tower', bitrate='3400k')
extract_webp(os.path.join(RAW, 'DJI_0040_D.MP4'), '00:00:03', 'portfolio-thatched-tower')

# 7. Brass Lantern Arch Entrance (DJI_0055)
encode_video_loop(os.path.join(RAW, 'DJI_0055_D.MP4'), '00:00:01', 6, 'portfolio-brass-lanterns', bitrate='3400k')
extract_webp(os.path.join(RAW, 'DJI_0055_D.MP4'), '00:00:03', 'portfolio-brass-lanterns')

# 8. Royal Celebration & VIP Gathering (5.mp4)
encode_video_loop(os.path.join(RAW, '5.mp4'), '00:00:08', 6, 'portfolio-festive-gathering', bitrate='3000k', width=1080, height=1920)
extract_webp(os.path.join(RAW, '5.mp4'), '00:00:09', 'portfolio-festive-gathering')

print('5. Creating Studio Spaces & Amenities Images...')
extract_webp(os.path.join(RAW, 'DJI_0015_D.MP4'), '00:00:03', 'space-haveli-facade')
extract_webp(os.path.join(RAW, 'DJI_0019_D.MP4'), '00:00:03', 'space-haveli-wings')
extract_webp(os.path.join(RAW, 'DJI_0028_D.MP4'), '00:00:03', 'space-courtyard-detail')
extract_webp(os.path.join(RAW, 'DJI_0034_D.MP4'), '00:00:03', 'space-charpai-patio')
extract_webp(os.path.join(RAW, 'DJI_0041_D.MP4'), '00:00:03', 'space-village-tower')
extract_webp(os.path.join(RAW, 'DJI_0050_D.MP4'), '00:00:03', 'space-panoramic-estate')

print('6. Creating OpenGraph Image...')
og_jpg = os.path.join('/Users/yasirkhan/The-Courtyard-Stories/public/assets/og', 'og-courtyard.jpg')
os.makedirs(os.path.dirname(og_jpg), exist_ok=True)
subprocess.run(['ffmpeg', '-y', '-ss', '00:00:03', '-i', os.path.join(RAW, 'DJI_0025_D.MP4'), '-vf', 'scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630', '-frames:v', '1', '-q:v', '2', og_jpg], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
print(f'Created OG: {og_jpg} ({os.path.getsize(og_jpg)/1024:.1f} KB)')

print('ALL REAL ASSETS PROCESSED AND OPTIMIZED!')
