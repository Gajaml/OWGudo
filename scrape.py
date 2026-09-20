
import urllib.request
import re

url = 'https://statbanana.com/images'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    scripts = re.findall(r'<script.*?src=[\'\"]([^\'\"]+)[\'\"].*?>', html)
    print('Found scripts:', scripts)
    for s in scripts:
        s_url = s if s.startswith('http') else 'https://statbanana.com/' + s.lstrip('/')
        s_req = urllib.request.Request(s_url, headers={'User-Agent': 'Mozilla/5.0'})
        s_content = urllib.request.urlopen(s_req).read().decode('utf-8')
        links = re.findall(r'https://drive\.google\.com[^\s\'\">]+', s_content)
        if links:
            print(f'Found {len(links)} drive links in {s_url}')
            for link in set(links):
                print(link)
except Exception as e:
    print('Error:', e)

