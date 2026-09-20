import os
from PIL import Image

minimaps_dir = 'public/assets/minimaps'
temp_dir = 'temp_maps'

name_map = {
    'blizzardworld': 'blizzard-world',
    'lijiangtower': 'lijiang-tower',
    'lijiang': 'lijiang-tower',
    'route66': 'route-66'
}

for file in os.listdir(temp_dir):
    if 'plain' in file.lower():
        base = file.lower().split('_plain')[0]
        base = base.replace(' ', '')
        
        target_name = None
        for key, val in name_map.items():
            if base == key:
                target_name = val
                break
        
        if target_name:
            src = os.path.join(temp_dir, file)
            dst = os.path.join(minimaps_dir, target_name + '.jpg')
            
            try:
                img = Image.open(src).convert('RGB')
                img.save(dst, quality=92)
                print(f'Processed {file} -> {target_name}.jpg')
                os.remove(src)
            except Exception as e:
                print(f'Failed {file}: {e}')
