
import urllib.request
import re
import gdown
import os

url = 'https://statbanana.com/images'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    scripts = re.findall(r'<script.*?src=[\'\"]([^\'\"]+)[\'\"].*?>', html)
    drive_ids = set()
    for s in scripts:
        if 'app.' not in s: continue
        s_url = s if s.startswith('http') else 'https://statbanana.com/' + s.lstrip('/')
        s_req = urllib.request.Request(s_url, headers={'User-Agent': 'Mozilla/5.0'})
        s_content = urllib.request.urlopen(s_req).read().decode('utf-8')
        links = re.findall(r'https://drive\.google\.com/open\?id=([a-zA-Z0-9_-]+)', s_content)
        for link in links:
            drive_ids.add(link)
    
    os.makedirs('temp_maps', exist_ok=True)
    
    for count, file_id in enumerate(list(drive_ids)):
        url = f'https://drive.google.com/uc?id={file_id}'
        # Using gdown to download metadata first
        # since it's tricky, we will just download the file, and if the name doesn't contain 'plain', delete it.
        try:
            filename = gdown.download(url, output='temp_maps/', quiet=True)
            if filename:
                base = os.path.basename(filename).lower()
                if 'plain' not in base:
                    os.remove(filename)
                else:
                    print(f'Kept: {base}')
        except Exception as e:
            pass
except Exception as e:
    print('Error:', e)

