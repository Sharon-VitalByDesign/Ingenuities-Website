import { config } from './config.js';
const clean = v => String(v ?? '').trim();
export function imageUrl(value) {
  try {
    const u = new URL(clean(value));
    if (u.protocol !== 'https:') return '';
    if (u.hostname === 'drive.google.com') {
      const id = u.pathname.match(/\/file\/d\/([\w-]+)/)?.[1] || u.searchParams.get('id');
      return id && /^[\w-]+$/.test(id) ? `https://drive.google.com/thumbnail?id=${id}&sz=w1000` : '';
    }
    return u.href;
  } catch { return ''; }
}
export function normalize(rows, live = false) {
  const seenIds = new Set(), seenSlugs = new Set();
  return rows.map((r,i) => {
    const p = live ? {
      id:clean(r['Product ID']),slug:clean(r.Slug),name:clean(r.Product), category:clean(r.Category),
      description:clean(r.Description),image:clean(r['Image URL (for website)']),status:clean(r.Status).toLowerCase(),featured:clean(r.Featured).toLowerCase()==='yes',sortOrder:Number(r['Sort Order'] || i+1),homepageOrder:Number(r['Homepage Order'] || 999),
      format:clean(r.Format),packaging:clean(r['Packaging / Pack Size']),varieties:clean(r['Flavors / Varieties']),kosher:clean(r.Kosher),wrapped:clean(r['Individually Wrapped Option']),shelfLife:clean(r['Extended Shelf Life'])
    } : {...r};
    p.image=imageUrl(p.image);
    return p;
  }).filter(p => {
    if(p.status!=='published'||!p.name||!p.category||!/^[-\w]+$/.test(p.id)||!/^[-a-z0-9]+$/.test(p.slug)||seenIds.has(p.id)||seenSlugs.has(p.slug)) return false;
    seenIds.add(p.id);seenSlugs.add(p.slug);return true;
  }).sort((a,b)=>(Number.isFinite(a.sortOrder)?a.sortOrder:999)-(Number.isFinite(b.sortOrder)?b.sortOrder:999));
}
async function jsonFetch(url) {
 const controller=new AbortController(), timeout=setTimeout(()=>controller.abort(),8000);
 try { const response=await fetch(url,{signal:controller.signal,cache:'no-store'});if(!response.ok)throw Error('Catalog unavailable');return await response.text(); } finally {clearTimeout(timeout);}
}
// Google's callback transport also works where cross-origin fetch is unavailable.
function sheetCallback(endpoint) {
 return new Promise((resolve,reject)=>{
  const name='ingenuitiesSheet_'+Date.now()+'_'+Math.random().toString(36).slice(2);
  const script=document.createElement('script');
  const cleanup=()=>{clearTimeout(timeout);script.remove();delete window[name];};
  const timeout=setTimeout(()=>{cleanup();reject(Error('Sheet request timed out'));},8000);
  window[name]=payload=>{cleanup();resolve(payload);};
  script.onerror=()=>{cleanup();reject(Error('Sheet unavailable'));};
  script.src=endpoint+'&tqx='+encodeURIComponent('out:json;responseHandler:'+name);
  document.head.append(script);
 });
}
export async function loadCatalog() {
  if(config.sheetId) {
    try {
      if(!/^[\w-]+$/.test(config.sheetId))throw Error('Invalid Sheet ID');
      const endpoint=`https://docs.google.com/spreadsheets/d/${config.sheetId}/gviz/tq?headers=1&sheet=${encodeURIComponent(config.sheetName)}&_=${Date.now()}`;
      let payload;
      try { const raw=await jsonFetch(endpoint+'&tqx=out:json'); payload=JSON.parse(raw.slice(raw.indexOf('{'),raw.lastIndexOf('}')+1)); }
      catch { payload=await sheetCallback(endpoint); }
      if(!payload.table)throw Error('Invalid feed');
      const headers=payload.table.cols.map(c=>clean(c.label));
      if(!['Product ID','Slug','Status','Product'].every(h=>headers.includes(h)))throw Error('Missing public columns');
      const rows=payload.table.rows.map(r=>Object.fromEntries(headers.map((h,i)=>[h,r.c[i]?.v??''])));
      const products=normalize(rows,true);
      if(rows.length && !products.length && rows.some(r=>clean(r.Status).toLowerCase()==='published'))throw Error('Invalid published rows');
      return {products, fallback:false};
    } catch(e) { console.warn('Live catalog unavailable; using preview snapshot.'); }
  }
  const products=normalize(JSON.parse(await jsonFetch('data/catalog.json')));
  return {products, fallback:!!config.sheetId};
}
