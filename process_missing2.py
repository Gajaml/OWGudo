import os
from PIL import Image

minimaps_dir = 'public/assets/minimaps'
temp_dir = 'temp_missing'

name_map = {
    'blizzardworld': 'blizzard-world',
    'lijiangtower': 'lijiang-tower',
    'lijiang': 'lijiang-tower',
    'route66': 'route-66'
}

for file in os.listdir(temp_dir):
    base = file.lower()
    
    # Extract root name (blizzardworld, lijiangtower, route66)
    root = base.split('_')[0].replace(' ', '')
    if root == 'route' and '66' in base:
        root = 'route66'
        
    target_name = None
    for key, val in name_map.items():
        if root == key:
            target_name = val
            break
            
    if target_name:
        src = os.path.join(temp_dir, file)
        dst = os.path.join(minimaps_dir, target_name + '.jpg')
        
        # We might have both _anno and _map, let's just pick one. _anno is usually high res.
        if 'anno' in file.lower() or 'plain' in file.lower():
            try:
                img = Image.open(src).convert('RGB')
                img.save(dst, quality=92)
                print(f'Processed {file} -> {target_name}.jpg')
            except Exception as e:
                print(f'Failed {file}: {e}')
