import {config} from './config.js';
import {loadCatalog} from './catalog.js';
const $=s=>document.querySelector(s), page=document.body.dataset.page;
function el(tag,text,cls){const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;}
function link(text,href,cls){const a=el('a',text,cls);a.href=href;return a;}
$('.menu-toggle').addEventListener('click',()=>{const open=$('.menu-toggle').getAttribute('aria-expanded')!=='true';$('.menu-toggle').setAttribute('aria-expanded',String(open));$('nav').classList.toggle('open',open);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('nav').classList.contains('open')){$('nav').classList.remove('open');$('.menu-toggle').setAttribute('aria-expanded','false');$('.menu-toggle').focus();}});
if(config.logo){const image=el('img');image.src=config.logo;image.alt=config.businessName;image.addEventListener('error',()=>{image.replaceWith(document.createTextNode(config.businessName));});$('.brand').replaceChildren(image,el('span','by KL Sweets'));const footerLogo=el('img');footerLogo.src=config.logo;footerLogo.alt=config.businessName;footerLogo.loading='lazy';footerLogo.addEventListener('error',()=>footerLogo.replaceWith(document.createTextNode(config.businessName)));$('.footer-brand').replaceChildren(footerLogo);}
function visual(p){const box=el('figure',null,'visual'),fallback=el('div',null,'image-fallback');fallback.append(el('span','✦','ornament'),el('strong',p.name),el('small',p.image?'INGENUITIES COLLECTION':'PHOTO COMING SOON'));box.append(fallback);if(p.image){const img=el('img');img.alt=p.name;img.loading='lazy';img.addEventListener('load',()=>{fallback.hidden=true;});img.addEventListener('error',()=>img.remove());img.src=p.image;box.append(img);}return box;}
function card(p){const a=link('',`product.html?product=${encodeURIComponent(p.slug)}`,'card');a.append(visual(p),el('p',p.category,'category-label'),el('h3',p.name),el('p',p.packaging||''),el('span','Explore product ›','card-link'));return a;}
function contact(){const name=new URLSearchParams(location.search).get('product')||'';if(name)$('#inquiry-product').textContent=`Your inquiry: ${name}`;const target=$('#contact-info');if(config.email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email)){target.append(el('h3','Contact Karen & Marc'),link(config.email,`mailto:${config.email}?subject=${encodeURIComponent(name?'Product inquiry: '+name:'Wholesale inquiry')}`,'text-link'));}else{target.append(el('h3','Contact details coming soon'),el('p','This website is a preview. Verified contact information for Karen and Marc will appear here before launch.'),el('p','In the meantime, please use your existing Ingenuities contact to discuss products and wholesale inquiries.'));}if(config.phone){const phone=el('p');phone.append(link(config.phone,'tel:'+config.phone.replace(/[^+0-9]/g,''),'text-link'));target.append(phone);}if(config.address)target.append(el('p',config.address));if(config.hours)target.append(el('p',config.hours));}
if(page==='contact')contact();
if(['index','products','product'].includes(page)){
 try{
  const {products,fallback}=await loadCatalog();
  if(fallback)$('#catalog-notice').textContent='The live collection is temporarily unavailable. Showing a saved catalog snapshot, which may be older than the current collection.';
  const categories=[...new Set(products.map(p=>p.category))];
  if(page==='index'){
   const hero=$('#hero-image');hero.replaceChildren();
   const selections=products.filter(p=>p.featured).sort((a,b)=>(Number(a.homepageOrder)||999)-(Number(b.homepageOrder)||999)).slice(0,3);
   for(const p of selections){const a=link('',`product.html?product=${encodeURIComponent(p.slug)}`,'hero-product');a.setAttribute('aria-label','Explore '+p.name);a.dataset.productId=p.id;const image=visual(p);const missing=image.querySelector('.image-fallback');missing.replaceChildren(el('span','✦','ornament'),el('small','Photo unavailable'));const img=image.querySelector('img');if(img){img.loading='eager';img.decoding='async';}a.append(image);hero.append(a);}
   if(!selections.length)hero.append(el('p','Our collection is being updated.'));
   $('#categories').replaceChildren();
   for(const category of categories){const p=products.find(p=>p.category===category),a=link('',`products.html?category=${encodeURIComponent(category)}`,'category-card');a.append(visual(p),el('h3',category+' ›'),el('p',`${products.filter(p=>p.category===category).length} products in the collection`));$('#categories').append(a);}
  }
  if(page==='products'){
   const search=$('#search'),category=$('#category');
   for(const c of categories){const o=el('option',c);o.value=c;category.append(o);}
   function read(){const params=new URLSearchParams(location.search);search.value=params.get('search')||'';category.value=categories.includes(params.get('category'))?params.get('category'):'';}
   function render(update=true){const q=search.value.trim().toLowerCase(),c=category.value;const matches=products.filter(p=>(!c||p.category===c)&&(!q||[p.name,p.description,p.varieties].join(' ').toLowerCase().includes(q)));$('#results').textContent=`${matches.length} ${matches.length===1?'product':'products'}${c?' · '+c:''}`;$('#products').replaceChildren(...matches.map(card));if(!matches.length){const empty=el('div',null,'empty');empty.append(el('h2','No sweet matches just yet.'),el('p','Try another search or reset your filters to explore the whole collection.'));$('#products').append(empty);}if(update){const params=new URLSearchParams();if(search.value)params.set('search',search.value);if(c)params.set('category',c);history.replaceState(null,'','products.html'+(params.size?'?'+params:''));}try{sessionStorage.setItem('catalogReturn',location.search);}catch{}}
   search.addEventListener('input',()=>render());category.addEventListener('change',()=>render());$('#reset').addEventListener('click',()=>{search.value='';category.value='';render();search.focus();});window.addEventListener('popstate',()=>{read();render(false);});read();render(false);search.disabled=false;category.disabled=false;$('#reset').disabled=false;
  }
  if(page==='product'){
   const p=products.find(p=>p.slug===new URLSearchParams(location.search).get('product')),root=$('#detail');root.replaceChildren();let back='products.html';try{const saved=sessionStorage.getItem('catalogReturn');if(saved&&saved.startsWith('?'))back+=saved;}catch{}root.append(link('← Back to products',back,'text-link'));
   if(!p){document.title='Product unavailable | Ingenuities';root.append(el('h1','Product unavailable'),el('p','This product may have moved or is no longer published. Explore the current collection.'));}
   else{document.title=p.name+' | Ingenuities';const layout=el('div',null,'detail-layout'),copy=el('div');copy.append(el('p',p.category,'eyebrow'),el('h1',p.name));if(p.description)copy.append(el('p',p.description));const dl=el('dl');for(const [key,label]of Object.entries({varieties:'Flavors / varieties',packaging:'Packaging / pack size',format:'Format',kosher:'Kosher',wrapped:'Individually wrapped option',shelfLife:'Extended shelf life'})){if(p[key]){const row=el('div');row.append(el('dt',label),el('dd',p[key]));dl.append(row);}}copy.append(dl,link('Inquire about this product ›',`contact.html?product=${encodeURIComponent(p.name)}`,'button'));layout.append(visual(p),copy);root.append(layout);}
  }
 }catch(error){const root=$('#products')||$('#detail')||$('#categories');root.replaceChildren(el('p','We couldn’t load the collection. Please try again in a moment.','empty'));if($('#results'))$('#results').textContent='Catalog unavailable';if($('#hero-image'))$('#hero-image').append(el('p','Our collection will be back soon.'));}
}
