import { Innertube, UniversalCache } from 'youtubei.js';
const yt = await Innertube.create({ cache: new UniversalCache(false), generate_session_locally: true });
const r = await yt.music.search('Sepatu Tulus', { type: 'song' });
const shelf = r.contents?.[0];
const item = shelf?.contents?.[0];
console.log('artist obj:', JSON.stringify(item.artists?.[0]));
console.log('author:', JSON.stringify(item.author));
console.log('keys with id/channel:', Object.keys(item).filter(k => /id|channel|author|artist/i.test(k)));
process.exit(0);
