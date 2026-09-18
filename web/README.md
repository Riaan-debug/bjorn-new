# Apostellō Coffee

Public website, staff hub, and iPad loyalty kiosk. Built from the brand guidelines, coffee spec, and the old café hub — without Netlify or the previous developer’s keys.

## Surfaces

- `/` — public site (hero film slot, menu, about, gallery placeholders, events, visit)
- `/hub` — staff: loyalty, menu, stock, daily log, enquiries, settings
- `/kiosk` — loyalty kiosk (Add to Home Screen on the iPad)

## Brand

From [Apostellō Brand Guidelines](https://drive.google.com/file/d/1rZjhlcUMomnRTOrhfNng7wcVbbGMg7iK/view):

- Navy `#011b3d` (main)
- Cream `#fffdf5`
- White `#ffffff`
- Blue grey `#50657e`
- Montserrat headings, Open Sans body
- Slogan: *not just served, Sent.*
- Est. 26 · Speciality Coffee

Coffee spec: 60% Guatemala Hills, 40% Brazil Peaberry, 1:2.4, 28–32 seconds, 10-day rest.

Location (from [@apostellocafe](https://www.instagram.com/apostellocafe/)): Olympus | CMV Group, 17 Midas Avenue, Pretoria. Monday–Friday 07:00–16:00. Speciality coffee and smash burgers.

## Run locally

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). First hub visit: create a 4–8 digit staff PIN. That same PIN stamps cards on the kiosk.

## Security

- Staff PIN is hashed (bcrypt). It is never stored in the browser.
- Staff session is an httpOnly, SameSite cookie with a signed expiry.
- Public APIs do not expose customer records.
- Kiosk stamp requires the staff PIN on the server.
- Contact form and login are rate-limited.
- SQLite lives in `data/` (gitignored). Set `SESSION_SECRET` in production.
- No Netlify. No hardcoded third-party keys.

## Media later

Put files in `public/media/`:

- `hero.mp4` + optional `hero-poster.jpg` for the homepage film
- stills referenced from hub menu items as `/media/menu/...` (drag a photo onto the menu editor, or drop files here)

## Hosting

Any Node host (VPS, Railway, Fly, domains.co.za Node). Not a static Netlify dump — the hub and kiosk need the API.

```bash
npm run build
npm start
```

Set `SESSION_SECRET` to a long random string before going live.
