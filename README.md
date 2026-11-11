# Ingenuities Website

A static wholesale product catalog for Ingenuities by KL Sweets. HTML, CSS, and JavaScript; no build step, accounts, checkout, or database.

## Editing the catalog

The live source is [Ingenuities Catalog](https://docs.google.com/spreadsheets/d/1bzta0MIJeCkeuSkXWyQSJDFnSWNmg-b-8l_13eczagI/edit), owned by ingenuities.klsweets@gmail.com. Named editors can edit; anyone with the link can read. Formatting does not affect the website. Keep the `Public Catalog` tab and its column headings unchanged. All rows/tabs in this workbook must be suitable for public reading, including drafts; never add confidential notes or credentials.

- Edit names, descriptions, image URLs, categories, varieties, packaging, and attributes in their rows.
- Add a row with a unique Product ID and Slug, Category, Product, Status `published`, numeric Sort Order, and the desired details. No code changes are needed. Use lowercase letters, numbers, and hyphens for IDs/slugs; never change existing identities when renaming a product.
- Set Status to `draft` to hide a row from the website. Drafts remain readable in the public Sheet.
- Set Featured to `yes` and Homepage Order to 1, 2, or 3 for up to three homepage images. They use the same product image URL as cards and details.
- Blank attributes mean unspecified. A blank image uses a photo placeholder. Drive images must allow public viewing.

Saved changes appear on subsequent page loads after Google's caching delay. An unavailable live feed falls back to `public/data/catalog.json` and displays an older-content notice. Refresh the fallback snapshot after significant changes; otherwise it may show older or withdrawn products during an outage. No product-specific description or photo overrides are applied to live rows.

## Preview locally

```sh
cd public
python3 -m http.server 8000
```

Open http://localhost:8000. An HTTP server is needed for ES modules and JSON loading.

## GitHub and Vercel

Import this repository into Vercel. Choose framework **Other**, leave Build Command empty, and set Output Directory to **public**. The included `vercel.json` declares this directory. Do not serve the repository root. Vercel can deploy future code pushes automatically; ordinary product updates need only the Google Sheet. Connect the production domain after verifying the Vercel deployment.

The separate review preview is https://ingenuities-catalog-preview.pastelitem8.chatgpt.site. Its Sites hosting is independent of GitHub/Vercel; updating that preview is a separate publication step.

## Settings and files

- `public/js/config.js`: Google Sheet ID/tab, business contact details, logo.
- `public/js/catalog.js`: loading, validation, Drive URL normalization, snapshot fallback.
- `public/js/app.js`: rendering and interactions; spreadsheet content uses safe DOM text methods.
- `public/assets/styles.css`: shared presentation and colors.
- `public/downloads/Ingenuities-Catalog-Source-of-Truth.xlsx`: reconciled backup from setup time, **not a live copy**. Edit the Google Sheet after setup. Its Editing Guide describes the controls.
- `private/`: local editorial reviews, intentionally excluded from Git and deployment.

## Refresh the snapshot

Install openpyxl (`python -m pip install openpyxl`) and export the live Google Sheet as XLSX, then run:

```sh
python scripts/import_catalog.py '/path/to/export.xlsx'
```

The canonical `Public Catalog` import preserves live IDs/slugs and controls without applying old photo corrections. For the original `Catalog 2025` workbook, the importer uses `scripts/image-corrections.json` and `scripts/product-identities.json`; the workbook remains unchanged. The latter registry preserves original identities after name edits. Original editorial Notes never enter public JSON.

## Checks

`node scripts/check.mjs` validates records, IDs/slugs, blanks, privacy, and URL handling. `node scripts/browser-check.cjs` uses Playwright and `/usr/bin/chromium` (or CHROMIUM_PATH) against the local server. Development-network restrictions can force the actual live feed to fall back locally; fixture tests verify live loading, edits/new rows, homepage synchronization, and failure behavior. Confirm the public feed from the final deployed site as well.

See `LAUNCH_CHECKLIST.md` for remaining owner-review and deployment items.
