# Launch checklist

- [x] Original logo extracted from supplied ZIP, preserved unchanged as assets/logo.png and configured with proportional sizing.
- [x] Configure owner-confirmed email (ingenuities.klsweets@gmail.com) and phone (914-763-8100). Email and tap-to-call links are active; no form backend is implied.
- [ ] Add address or hours only if supplied and intended for public display.
- [ ] Resolve private/source-review.md with Karen and Marc, especially product 9’s contradictory nut description, Bella Bar flavor count, Susie’s truncated Coco flavor, and Butter Loaf asterisks. Keep disputed descriptions withheld until reviewed.
- [x] Apply owner-confirmed photo reassignments; see private/photo-review.md.
- [ ] Obtain the correct photo for Crispy Chocolate Chip Cookie; it currently uses a photo-coming-soon placeholder. No Nut Brownie photo has now been identified and restored.
- [ ] Review homepage still-life selections (Chocolate Chunk Brownie, Chewy Chocolate Chip Cookie, Quarter Sheet Blondie) and category order. Hero photos fill shaped frames; catalog photos remain uncropped.
- [x] Connect owner-created Public Catalog Sheet with stable IDs/slugs, Status, Featured, Sort Order and Homepage Order. Verify all 59 public records against snapshot; confirm owner/editor/public-reader permissions.
- [ ] Verify unauthenticated Google feed from Vercel; this development environment blocks direct requests to docs.google.com. Actual Sheet records and loading/edit/new-product behavior were verified through the connector and browser fixtures.
- [ ] Verify every Drive image and folder permits public unauthenticated access. Drive was blocked by this development environment's outbound policy, so actual photography could not be visually verified here; supplied URLs remain intact and graceful fallbacks are tested.
- [ ] Verify image quality, full product visibility, original logo, keyboard behavior, mobile and desktop in the deployed preview.
- [ ] Refresh JSON snapshot when updating live content; assess whether stale fallback is appropriate for withdrawn products.
- [ ] Set Vercel output directory to public; check private/source-review.md returns 404 in deployment.
- [ ] After owner approval, connect intended domain and configure DNS. No production deployment or DNS change was performed during initial build.
