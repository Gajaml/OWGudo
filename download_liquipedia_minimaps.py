import urllib.request
import json
import gzip
import os
import time

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) OWGudoTool/1.0',
    'Accept-Encoding': 'gzip'
}

def api_call(url):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read()
            if resp.info().get('Content-Encoding') == 'gzip':
                data = gzip.decompress(content).decode('utf-8')
            else:
                data = content.decode('utf-8')
            return json.loads(data)
    except Exception as e:
        print(f"Error calling {url}: {e}")
        return None

def main():
    public_dir = os.path.join(os.getcwd(), 'public', 'assets', 'minimaps')
    os.makedirs(public_dir, exist_ok=True)
    
    print("Fetching maps list...")
    cat_url = "https://liquipedia.net/overwatch/api.php?action=query&list=categorymembers&cmtitle=Category:Maps&cmlimit=100&format=json"
    cat_data = api_call(cat_url)
    if not cat_data:
        return

    maps = [m['title'] for m in cat_data['query']['categorymembers']]
    print(f"Found {len(maps)} maps. Starting analysis...")
    
    downloaded_count = 0

    for map_name in maps:
        # Avoid rate limits
        time.sleep(0.5)
        
        # Clean URL
        safe_name = urllib.parse.quote(map_name)
        img_query = f"https://liquipedia.net/overwatch/api.php?action=query&prop=images&titles={safe_name}&format=json"
        
        img_data = api_call(img_query)
        if not img_data or 'query' not in img_data:
            continue
            
        pages = img_data['query']['pages']
        topdown_file = None
        for page_id in pages:
            images = pages[page_id].get('images', [])
            for img in images:
                title_lower = img['title'].lower()
                if 'top down' in title_lower or 'topdown' in title_lower or 'top_down' in title_lower or 'minimap' in title_lower or 'layout' in title_lower:
                    topdown_file = img['title']
                    break
            if topdown_file:
                break
        
        if topdown_file:
            safe_file = urllib.parse.quote(topdown_file)
            file_url_query = f"https://liquipedia.net/overwatch/api.php?action=query&prop=imageinfo&iiprop=url&titles={safe_file}&format=json"
            
            file_data = api_call(file_url_query)
            if file_data and 'query' in file_data:
                fpages = file_data['query']['pages']
                for fpage_id in fpages:
                    if 'imageinfo' in fpages[fpage_id]:
                        img_url = fpages[fpage_id]['imageinfo'][0]['url']
                        
                        # Generate safe filename
                        ext = img_url.split('.')[-1].lower()
                        filename = map_name.lower().replace(' ', '-').replace("'", "") + f".{ext}"
                        filepath = os.path.join(public_dir, filename)
                        
                        try:
                            img_req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
                            with urllib.request.urlopen(img_req) as img_resp, open(filepath, 'wb') as f:
                                f.write(img_resp.read())
                            print(f"[{map_name}] Downloaded: {filename}")
                            downloaded_count += 1
                        except Exception as e:
                            print(f"[{map_name}] Failed to download {img_url}: {e}")
            time.sleep(0.5)
        else:
            print(f"[{map_name}] No top-down map found.")

    print(f"Finished! Total {downloaded_count} minimaps downloaded.")

if __name__ == '__main__':
    main()
