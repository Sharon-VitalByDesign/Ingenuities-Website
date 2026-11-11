"""Usage: python scripts/import_catalog.py path/to/catalog.xlsx (requires openpyxl)."""
import json, re, sys
from pathlib import Path
import openpyxl
ROOT = Path(__file__).resolve().parents[1]
w = openpyxl.load_workbook(sys.argv[1], data_only=True)
# Read source context as well as product rows; never publish workbook editorial notes.
canonical = 'Public Catalog' in w.sheetnames
if not canonical: assert 'About' in w.sheetnames
sheet = w['Public Catalog'] if canonical else w['Catalog 2025']
headers = [c.value for c in sheet[1]]
registry_path = ROOT / 'scripts/product-identities.json'
registry = json.loads(registry_path.read_text()) if registry_path.exists() else {}
products, review = [], []
# Owner-confirmed photo assignments; original workbook remains unchanged.
image_corrections = json.loads((ROOT/'scripts/image-corrections.json').read_text())
fields = {'Format':'format','Packaging / Pack Size':'packaging','Flavors / Varieties':'varieties','Kosher':'kosher','Individually Wrapped Option':'wrapped','Extended Shelf Life':'shelfLife'}
for cells in sheet.iter_rows(min_row=2, values_only=True):
 r = dict(zip(headers,cells))
 if not r.get('Product') or (not canonical and not r.get('#')): continue
 if canonical and (not r.get('Product ID') or not r.get('Slug')): raise ValueError('Every product needs a Product ID and Slug')
 key = str(r.get('#') or r.get('Product ID'))
 if not canonical and key not in registry:
  slug = re.sub(r'[^a-z0-9]+','-',r['Product'].lower()).strip('-')
  registry[key] = {'id':f'ing-{int(r["#"]):03}', 'slug':slug+'-'+key}
 identity = {'id':r['Product ID'],'slug':r['Slug']} if canonical else registry[key]
 p = {**identity, 'sourceId':key, 'name':r['Product'], 'category':r['Category'], 'image':r['Image URL (for website)'] or '', 'description':r['Description'] or '', 'status':'published', 'featured':False,'sortOrder':len(products)+1}
 for source,target in fields.items():
  if r[source] is not None: p[target] = str(r[source])
 if canonical:
  p.update(status=str(r.get('Status') or 'draft').strip().lower(),featured=str(r.get('Featured') or '').strip().lower()=='yes',sortOrder=r.get('Sort Order') or len(products)+1,homepageOrder=r.get('Homepage Order') or '')
 else:
  if key == '9': p['description'] = ''
  if key in image_corrections: p['image'] = image_corrections[key]
 if r.get('Notes'): review.append(f"- Product {key} — {r['Product']}: {r['Notes']}")
 products.append(p)
assert len({p['slug'] for p in products}) == len(products)
assert len({p['id'] for p in products}) == len(products)
(ROOT/'public/data/catalog.json').write_text(json.dumps(products,indent=2,ensure_ascii=False)+'\n')
registry_path.write_text(json.dumps(registry,indent=2)+'\n')
if not canonical: (ROOT/'private').mkdir(exist_ok=True)
if not canonical: (ROOT/'private/source-review.md').write_text('# Private source review — do not publish\n\nProduct 9 description is withheld because the product name and mixed-nut description contradict each other. Resolve with owners before restoring. Other source wording remains unchanged; no corrections were inferred.\n\n'+'\n'.join(review)+'\n\nThe About tab says categories are editorial groupings, and similar products are distinguished by parenthetical labels. Those distinctions are preserved. Butter Loaf asterisks remain as supplied; verify their meaning with owners. No products have been marked featured; homepage and category previews use catalog order provisionally.\n')
print(f'Imported {len(products)} products; workbook unchanged.')
