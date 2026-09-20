import urllib.request
import json
import os
import re

# Read map IDs from src/mapsData.js
with open('src/mapsData.js', 'r', encoding='utf-8') as f:
    content = f.read()
    
map_ids = re.findall(r"id:\s*'([^']+)'", content)
map_ids = [m for m in map_ids if m != 'divider']

req = urllib.request.Request('https://overfast-api.tekrop.fr/maps', headers={'User-Agent': 'Mozilla/5.0'})
response = urllib.request.urlopen(req)
maps_data = json.loads(response.read().decode('utf-8'))

public_dir = os.path.join(os.getcwd(), 'public', 'assets', 'maps')
os.makedirs(public_dir, exist_ok=True)

# Create a mapping from map key to screenshot
api_map_dict = { m['key']: m['screenshot'] for m in maps_data }

for map_id in map_ids:
    if map_id in api_map_dict:
        img_path = os.path.join(public_dir, f"{map_id}.jpg")
        if not os.path.exists(img_path):
            try:
                img_req = urllib.request.Request(api_map_dict[map_id], headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(img_req) as img_resp, open(img_path, 'wb') as f:
                    f.write(img_resp.read())
                print(f"Downloaded {map_id}")
            except Exception as e:
                print(f"Failed {map_id}: {e}")
    else:
        print(f"Map {map_id} not found in API")
