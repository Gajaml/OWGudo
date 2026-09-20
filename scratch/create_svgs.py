import os

os.makedirs('public/assets/modes', exist_ok=True)

svgs = {
    'escort': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M6 3v18" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  <path d="M11 5l9 7-9 7V5z" />
</svg>''',
    
    'hybrid': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <circle cx="8" cy="12" r="5" />
  <path d="M13 6.5l8 5.5-8 5.5z" />
</svg>''',

    'control': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 2l3.5 2.5v5L12 12l-3.5-2.5v-5L12 2zM6.5 11l3.5 2.5v5L6.5 21 3 18.5v-5L6.5 11zM17.5 11L21 13.5v5l-3.5 2.5-3.5-2.5v-5l3.5-2.5z" />
</svg>''',

    'push': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M6 6l6 6-6 6V6zM18 6l-6 6 6 6V6z" />
  <path d="M12 3v18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
</svg>''',

    'flashpoint': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <circle cx="12" cy="12" r="3.5" />
  <path d="M12 7 L9 2 h6 Z" />
  <path d="M7.5 14.5 L1 15 l4 5 Z" />
  <path d="M16.5 14.5 L23 15 l-4 5 Z" />
</svg>''',

    'assault': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <circle cx="6" cy="12" r="4.5" />
  <circle cx="18" cy="12" r="4.5" />
  <path d="M6 12h12" stroke="currentColor" stroke-width="2" />
</svg>'''
}

for mode, content in svgs.items():
    content = content.replace('currentColor', '#ffffff')
    with open(f"public/assets/modes/{mode}.svg", "w", encoding="utf-8") as f:
        f.write(content)

print("Created all SVGs.")
