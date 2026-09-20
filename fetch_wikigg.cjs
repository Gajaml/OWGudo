const https = require('https');
const fs = require('fs');

async function getWikiGgUrl(filename) {
  return new Promise((resolve) => {
    https.get(`https://overwatch.wiki.gg/api.php?action=query&titles=File:${filename}&prop=imageinfo&iiprop=url&format=json`, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
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
    }).on('error', () => resolve(null));
  });
}

async function run() {
  const modes = {
    'escort': 'Icon_Escort.png',
    'hybrid': 'Icon_Hybrid.png',
    'control': 'Icon_Control.png',
    'push': 'Icon_Push.png',
    'flashpoint': 'Icon_Flashpoint.png',
    'assault': 'Icon_Assault.png'
  };

  for (const [mode, file] of Object.entries(modes)) {
    console.log(`Fetching URL for ${file}...`);
    const url = await getWikiGgUrl(file);
    if (url) {
      console.log(`Downloading ${url}...`);
      await new Promise((resolve) => {
        const dest = fs.createWriteStream(`public/assets/modes/${mode}.png`);
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
          res.pipe(dest);
          dest.on('finish', () => dest.close(resolve));
        });
      });
    } else {
      console.log(`Could not find ${file} on wiki.gg.`);
    }
  }
}
run();
