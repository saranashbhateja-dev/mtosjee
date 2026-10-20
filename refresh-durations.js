'use strict';
// Backend-only YouTube duration refresh. API key is read from the process environment;
// it is never written to app files, localStorage, exports, or Git.
const fs = require('node:fs');
const path = require('node:path');
const ROOT = __dirname;
const KEY = process.env.YOUTUBE_API_KEY;
if (!KEY) {
  console.error('Missing YOUTUBE_API_KEY. In PowerShell run: $env:YOUTUBE_API_KEY="YOUR_KEY"');
  process.exit(1);
}
const seed = JSON.parse(fs.readFileSync(path.join(ROOT, 'tracker.json'), 'utf8'));
const outputPath = path.join(ROOT, 'playlist-durations.json');
const prior = fs.existsSync(outputPath) ? JSON.parse(fs.readFileSync(outputPath, 'utf8')) : { version: 1, playlists: {} };
const results = { version: 1, updatedAt: new Date().toISOString(), playlists: { ...(prior.playlists || {}) } };
const parsePlaylistId = value => { try { const u = new URL(value); return u.searchParams.get('list') || (u.pathname.match(/\/playlist\/([\w-]+)/)||[])[1] || null; } catch { return null; } };
const api = async (resource, params) => {
  const u = new URL(`https://www.googleapis.com/youtube/v3/${resource}`);
  for (const [k,v] of Object.entries({...params,key:KEY})) if (v != null) u.searchParams.set(k,String(v));
  const r = await fetch(u);
  const body = await r.json().catch(()=>({}));
  if (!r.ok) throw new Error(`${resource}: ${r.status} ${body?.error?.message || r.statusText}`);
  return body;
};
const unique = a => [...new Set(a)];
async function playlistVideoIds(playlistId) {
  const ids=[]; let pageToken;
  do {
    const data=await api('playlistItems',{part:'contentDetails',playlistId,maxResults:50,pageToken});
    for(const it of data.items||[]) if(it.contentDetails?.videoId) ids.push(it.contentDetails.videoId);
    pageToken=data.nextPageToken;
  } while(pageToken);
  return unique(ids);
}
function durationSeconds(iso) {
  const m=String(iso||'').match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if(!m)return null;
  return (+m[1]||0)*3600+(+m[2]||0)*60+(+m[3]||0);
}
async function main(){
  const chapters=seed.chapters||[]; let ok=0,failed=0,skipped=0;
  for(let i=0;i<chapters.length;i++){
    const c=chapters[i],playlistId=parsePlaylistId(c.url);
    if(!playlistId){skipped++;console.log(`[${i+1}/${chapters.length}] SKIP ${c.name}: no valid playlist URL`);continue;}
    try{
      const ids=await playlistVideoIds(playlistId);
      const durations=[];
      for(let j=0;j<ids.length;j+=50){
        const data=await api('videos',{part:'contentDetails',id:ids.slice(j,j+50).join(',')});
        for(const v of data.items||[]){const sec=durationSeconds(v.contentDetails?.duration);if(sec>0)durations.push(sec);}
      }
      if(!durations.length)throw new Error('No public video durations returned (playlist may be private/empty)');
      const totalSeconds=durations.reduce((a,b)=>a+b,0);
      results.playlists[c.id]={playlistId,avgSeconds:Math.round(totalSeconds/durations.length),totalSeconds,fetchedCount:durations.length,listedVideoCount:ids.length,fetchedAt:new Date().toISOString()};
      ok++;console.log(`[${i+1}/${chapters.length}] OK ${c.name}: ${durations.length} videos, avg ${Math.round(totalSeconds/durations.length/60)} min, total ${Math.round(totalSeconds/3600*10)/10} h`);
    }catch(e){failed++;console.error(`[${i+1}/${chapters.length}] FAIL ${c.name}: ${e.message}`);}
    // Persist incrementally so a quota/network interruption doesn't lose completed work.
    fs.writeFileSync(outputPath,JSON.stringify(results,null,2));
  }
  fs.writeFileSync(outputPath,JSON.stringify(results,null,2));
  console.log(`\nFinished. ${ok} updated, ${failed} failed, ${skipped} skipped. Results: playlist-durations.json`);
  if(failed)process.exitCode=2;
}
main().catch(e=>{console.error(e);process.exit(1)});
