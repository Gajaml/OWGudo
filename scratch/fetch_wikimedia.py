import urllib.request
import json
import os
import time

files = {
    'flashpoint': 'Flashpoint_map_icon.svg',
    'assault': 'Assault_map_icon.svg'
}

os.makedirs('public/assets/modes', exist_ok=True)
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'}

for mode, file in files.items():
    try:
        api_url = f"https://commons.wikimedia.org/w/api.php?action=query&titles=File:{file}&prop=imageinfo&iiprop=url&format=json"
        req = urllib.request.Request(api_url, headers=headers)
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            pages = data['query']['pages']
            page_id = list(pages.keys())[0]
            if page_id != '-1':
                img_url = pages[page_id]['imageinfo'][0]['url']
                print(f"Downloading {mode} from {img_url}")
                img_req = urllib.request.Request(img_url, headers=headers)
                with urllib.request.urlopen(img_req) as img_resp:
                    with open(f"public/assets/modes/{mode}.svg", "wb") as f:
                        f.write(img_resp.read())
            else:
                print(f"File {file} not found")
        time.sleep(5)
    except Exception as e:
        print(f"Failed to fetch {file}: {e}")
