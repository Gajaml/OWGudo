import urllib.request
import json
import os
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

def main():
    print("Fetching hero data from Overfast API...")
    api_url = 'https://overfast-api.tekrop.fr/heroes?locale=ko-kr'
    req = urllib.request.Request(api_url, headers={'User-Agent': 'Mozilla/5.0'})
    
    try:
        response = urllib.request.urlopen(req)
        heroes_data = json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print('Failed to fetch data:', e)
        return

    public_dir = os.path.join(os.getcwd(), 'public', 'assets', 'heroes')
    os.makedirs(public_dir, exist_ok=True)

    hero_map = {
        'tank': [],
        'damage': [],
        'support': []
    }

    print(f"Found {len(heroes_data)} heroes. Downloading portraits...")

    for hero in heroes_data:
        key = hero['key']
        name = hero['name']
        role = hero['role']
        portrait_url = hero['portrait']

        # Download portrait
        filepath = os.path.join(public_dir, f"{key}.png")
        if not os.path.exists(filepath):
            try:
                img_req = urllib.request.Request(portrait_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(img_req) as img_resp, open(filepath, 'wb') as f:
                    f.write(img_resp.read())
                print(f"  [+] Downloaded: {name} ({key}.png)")
            except Exception as e:
                print(f"  [-] Failed to download {name}: {e}")
        else:
            print(f"  [*] Already exists: {name} ({key}.png)")

        # Add to map
        if role in hero_map:
            hero_map[role].append({
                'key': key,
                'name': name,
                'portrait': f"/assets/heroes/{key}.png"
            })

    # Write JS file
    js_content = "export const OW_HEROES_DATA = " + json.dumps(hero_map, ensure_ascii=False, indent=2) + ";\n"
    js_path = os.path.join(os.getcwd(), 'src', 'heroData.js')
    
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f"\nSaved JS mapping to {js_path}")
    print("Done!")

if __name__ == "__main__":
    main()
