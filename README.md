# Arhat Shah — Parallax Portfolio

A responsive, dependency-light portfolio built with plain HTML, CSS and JavaScript.

## Run locally

Open `index.html` directly, or serve the folder with a small local server:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Personalize before publishing

1. Replace `hello@arhatshah.com` in `index.html` with your real email.
2. Replace the `#` social links in the footer.
3. Update project names, descriptions and years.
4. Add real project URLs to each circular project link.
5. Change the meta description and domain details if needed.

## Performance notes

- Native `requestAnimationFrame` and `IntersectionObserver`; no animation library required.
- Mobile layout disables the heavy horizontal pinned section and uses a normal vertical project flow.
- `prefers-reduced-motion` is supported.
- Project previews are CSS illustrations, so there are no large image downloads.
