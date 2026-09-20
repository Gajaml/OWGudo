const https = require('https');
const fs = require('fs');

async function getWikiMediaUrl(filename) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${filename}&prop=imageinfo&iiprop=url&format=json`;
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'NodeJS/OWGudo Fetcher' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const pageId = Object.keys(pages)[0];
          resolve(pages[pageId].imageinfo[0].url);
        } catch(e) { resolve(null); }
      });
    });
  });
}

async function run() {
  const files = {
    'escort': 'Escort_map_icon.svg',
    'hybrid': 'Hybrid_map_icon.svg',
    'control': 'Control_map_icon.svg',
    'push': 'Push_map_icon.svg',
    'flashpoint': 'Flashpoint_map_icon.svg',
    'assault': 'Assault_map_icon.svg'
  };

  for (const [mode, file] of Object.entries(files)) {
    console.log(`Fetching URL for ${file}...`);
    const url = await getWikiMediaUrl(file);
    if (url) {
      console.log(`Downloading ${url}...`);
      await new Promise((resolve) => {
        const dest = fs.createWriteStream(`public/assets/modes/${mode}.svg`);
        https.get(url, { headers: { 'User-Agent': 'NodeJS/OWGudo Fetcher' } }, (res) => {
          res.pipe(dest);
          dest.on('finish', () => dest.close(resolve));
        });
      });
    } else {
      console.log(`Could not find ${file} on Wikimedia Commons.`);
    }
  }
}
run();
