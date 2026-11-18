#!/usr/bin/env python3
import requests, bs4, re, json, gdown, os, subprocess, itertools, warnings

url = 'https://drive.google.com/drive/folders/1p4OwJ2DoozHCauobQnrtDNYu07dFT3MM?hl=en'
headers = {'User-Agent': 'Mozilla/5.0'}
res = requests.get(url, headers=headers)
folder_soup = bs4.BeautifulSoup(res.text, features='html.parser')
for script in folder_soup.select('script'):
    inner = script.decode_contents()
    if '_DRIVE_ivd' in inner:
        regex_iter = re.compile(r"'((?:[^'\\]|\\.)*)'").finditer(inner)
        encoded_data = next(itertools.islice(regex_iter, 1, None)).group(1)
        break

with warnings.catch_warnings():
    warnings.filterwarnings('ignore', category=DeprecationWarning)
    decoded = encoded_data.encode('utf-8').decode('unicode_escape')
folder_arr = json.loads(decoded)
folder_contents = folder_arr[0]

raw_dir = '/Users/yasirkhan/The-Courtyard-Stories/drive_raw'
os.makedirs(raw_dir, exist_ok=True)

print(f'Starting sync of all {len(folder_contents)} files...')
for idx, e in enumerate(folder_contents):
    fid = e[0]
    name = e[2]
    # Keep standard clean filename
    if name.startswith('DJI_'):
        parts = name.split('_')
        # name is like DJI_20260315163442_0015_D.MP4
        clean_name = f'DJI_{parts[-2]}_D.MP4'
    else:
        clean_name = name

    target = os.path.join(raw_dir, clean_name)
    preview = os.path.join(raw_dir, f'preview_{clean_name}.jpg')
    
    if not os.path.exists(target):
        print(f'[{idx+1}/{len(folder_contents)}] Downloading {clean_name} ({name})...')
        try:
            gdown.download(f'https://drive.google.com/uc?id={fid}', target, quiet=True)
        except Exception as err:
            print(f'Error downloading {clean_name}: {err}')
            continue
    
    if os.path.exists(target) and not os.path.exists(preview):
        cmd = ['ffmpeg', '-y', '-ss', '00:00:03', '-i', target, '-frames:v', '1', preview]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print(f'[{idx+1}/{len(folder_contents)}] Extracted frame for {clean_name}')

print('ALL FILES SYNCED SUCCESSFULLY!')
