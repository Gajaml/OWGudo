import urllib.request
import json
import os

req = urllib.request.Request('https://overfast-api.tekrop.fr/maps', headers={'User-Agent': 'Mozilla/5.0'})
response = urllib.request.urlopen(req)
maps_data = json.loads(response.read().decode('utf-8'))
    
public_dir = os.path.join(os.getcwd(), 'public', 'assets', 'maps')
os.makedirs(public_dir, exist_ok=True)

target_maps = ['samoa', 'kings-row', 'ilios']
for m in maps_data:
    if m['key'] in target_maps:
        try:
            img_req = urllib.request.Request(m['screenshot'], headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(img_req) as img_resp, open(os.path.join(public_dir, f"{m['key']}.jpg"), 'wb') as f:
                f.write(img_resp.read())
            print(f"Downloaded {m['key']}")
        except Exception as e:
            print(f"Failed {m['key']}: {e}")
