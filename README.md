# LifeKit

LifeKit is a set of 61 free everyday tools. Each one runs in the visitor's browser: PDF and image files are processed on their device and never uploaded.

| Category | Tools |
| --- | --- |
| PDF & Documents | PDF Merger, Splitter, Compressor, PDF to Word, Word to PDF, PDF to PowerPoint, Images to PDF, PDF to Images, Rotate & Organize, Sign PDF, Page Numbers, Watermark |
| Images | Image Compressor, Converter, Resizer, Crop & Rotate, Compress to KB, Image to Text (OCR), Color Picker |
| Generators | QR Code, Password, Barcode, Random Number, Spin the Wheel |
| Calculators & converters | Calculator, Scientific, Discount, Tip, BMI, Calorie, Loan/EMI, SIP, Compound Interest, GST, GPA, CGPA to %, Date, Percentage, Age, Unit Converter, Word Counter, Time Zone |
| Time & Timers | Timer, Stopwatch, Alarm Clock, Pomodoro |
| Text & Writing | Text Formatter, Text to Speech, Speech to Text, Notepad, To-Do List, Text Compare, Lorem Ipsum, Typing Test |
| Audio & Video | Screen Recorder, Voice Recorder |
| Developer | JSON Formatter, Base64/URL Encoder, Hash Generator, UUID Generator |
| Files | File Size Calculator |

The site also has a home page, a searchable tools directory, About and Contact pages, and Privacy, Terms and Cookie policy pages. It supports light and dark themes and works at phone width.

## Tech stack

React 19, TypeScript, Vite, Tailwind CSS v4, React Router and Lucide icons.

| Library | Used for |
| --- | --- |
| `pdf-lib` | Merging, splitting and rebuilding PDFs |
| `pdfjs-dist` | Rendering PDF pages (thumbnails, image-based compression) |
| `qrcode` | QR code generation (PNG and SVG) |
| `fflate` | ZIP downloads and building .docx files |
| `pptxgenjs` | PDF to PowerPoint |
| `tesseract.js` + `@tesseract.js-data/eng` | Image to Text (OCR). `scripts/copy-ocr-assets.mjs` copies the engine into `public/ocr` before `dev`/`build`, so it's served from your own domain |
| `jsbarcode` | Barcode Generator |
| `mammoth`, `html-to-pdfmake`, `pdfmake` | Word to PDF |
| `@fontsource-variable/inter` | Self-hosted Inter font, so no third-party font requests |
| `vitest` (dev) | Unit tests |

The heavy libraries (pdf-lib, pdf.js, qrcode, fflate) are loaded only on the tool pages that need them.

## Getting started

You need Node.js 22.18 or newer, because the post-build script imports TypeScript config files directly.

```bash
npm install
```

```bash
npm run dev
```

The dev server runs at http://localhost:5173.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check, build to `dist/`, then generate the sitemap, robots.txt and one HTML file per route |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the unit tests |
| `npm run typecheck` | Run TypeScript only |

## Environment variables

Copy `.env.example` to `.env`, or set the variables in your hosting dashboard. They are read at **build time** and end up in the public JavaScript, so never put a secret in one.

| Variable | Purpose |
| --- | --- |
| `VITE_SITE_URL` | Public URL with no trailing slash. **Needed for production**: it is used for `sitemap.xml`, canonical URLs and Open Graph URLs. If it is missing, no sitemap is generated. |
| `VITE_CONTACT_ENDPOINT` | Any endpoint that accepts a JSON POST, such as a Formspree form URL. If it is empty, the contact form says it is not connected and does not pretend to send. |
| `VITE_CONTACT_EMAIL` | Optional public email address shown on the contact and legal pages. |
| `VITE_ADS_ENABLED` | Must be `true` for ads to load. |
| `VITE_ADSENSE_CLIENT` | Your real `ca-pub-…` publisher ID. |
| `VITE_AD_SLOT_HOME`, `VITE_AD_SLOT_TOOL`, `VITE_AD_SLOT_DIRECTORY` | Ad unit IDs, one per placement. A placement with no ID renders nothing. |

## Project structure

```
src/
  config/      tools.ts (registry, SEO copy, FAQs), pages.ts, site.ts, ads.ts, legal.ts, limits.ts
  lib/         Pure logic (units, age, timezone, password, text, percentages, page ranges, QR payloads,
               search) plus browser processing (pdf.ts, image.ts). *.test.ts sit next to the code.
  tools/       One UI component per tool, lazy-loaded through tools/index.ts
  components/  Layout, ToolCard, SearchBar, CategoryFilter, AdSlot, CookieConsent, Faq, …
    ui/        Design system: Button, Card, form fields, Dropzone, Modal, Toast, Notice, Segmented, …
  hooks/       useTheme, useConsent, useSeo, useCopy, useObjectUrl, useImageFile
  pages/       Home, Tools, ToolPage, About, Contact, NotFound, legal/*
  styles/      Tailwind entry and design tokens (CSS variables for light and dark)
  utils/       Formatting, downloads, file validation
scripts/generate-sitemap.mjs   Post-build SEO step
public/        favicon, og-image.png, ads.txt
```

### Adding a tool

1. Write the logic in `src/lib/yourTool.ts` and add tests in `yourTool.test.ts`.
2. Build the interface in `src/tools/YourTool.tsx` as a default export.
3. Register it in `src/tools/index.ts`.
4. Add its metadata, instructions, FAQs and related tools to `src/config/tools.ts`. If it needs a new icon, also add the icon to `IconName` and `src/components/ToolIcon.tsx`.

Search, the directory, the sitemap, the per-route HTML and structured data all update automatically from the registry.

## SEO

- Each route gets its own title, description, canonical URL, Open Graph tags and JSON-LD. These are set at runtime by `useSeo`, and also written into a static `dist/<route>/index.html` at build time, so crawlers and link previews see them without running JavaScript.
- Tool pages include `WebApplication`, `FAQPage` and `BreadcrumbList` structured data. The home page includes `WebSite` (with a search action) and `FAQPage`.
- The static HTML for each tool page also contains readable fallback content: the intro, the steps and the FAQs.
- `sitemap.xml` and `robots.txt` are generated at build time.

## Advertising (AdSense readiness)

Advertising is **off by default**, and the site works fully without it.

- `src/config/ads.ts` enables ads only when `VITE_ADS_ENABLED=true` and the publisher ID is a valid `ca-pub-` ID.
- `<AdSlot>` renders nothing unless ads are enabled, the placement has a slot ID, **and** the visitor has consented to advertising. Placements sit only between content sections, never next to upload, download or copy controls.
- The site contains no ad scripts and no placeholder publisher IDs.
- `public/ads.txt` contains only comments for now. After approval, replace them with the line AdSense gives you.
- Once ads are enabled, a consent banner and a "Cookie settings" link appear (`CookieConsent`, `useConsent`).

**Important:** the built-in consent banner is an integration point, not a certified consent management platform (CMP). To serve ads to visitors in the EEA, UK or Switzerland, Google requires a Google-certified CMP, such as Google's own Privacy & messaging tool. Connect that CMP to `ConsentProvider`, or replace the provider with it, before you enable ads. Applying to AdSense, verifying the site and getting approved are separate steps you do yourself.

## Legal pages

Before launch, edit `src/config/legal.ts`: set the operator name, optional location and last-updated date. The policies describe how the site works as built: no analytics, no cookies of its own, files processed locally. Some sections change automatically depending on whether ads or the contact endpoint are configured. They are a starting point, not legal advice. Have them reviewed for your jurisdiction, and update them whenever you add analytics, ads or a backend.

## Browser extension

`extension/` contains a Chrome (Manifest V3) extension. It's a free quick launcher that opens the tools on your website, where the ads are. It doesn't show ads itself, because AdSense doesn't allow ads inside extensions.

- **Toolbar popup:** search all tools and press Enter or click a tool to open it on the website. Shortcut: Alt+Shift+L.
- **Right-click menu:**
  - "Count words in selection" and "Format selected text" open those tools with the selected text filled in.
  - "Create QR code for this page/link" opens the QR tool with that address filled in.
- **Permissions:** only `contextMenus`. It collects no data. Content is passed after `#` in the address, which is never sent to the server, and the website clears it once read (`src/lib/hashParams.ts`).

Build it for your live address:

```bash
VITE_SITE_URL=https://your-domain.com npm run build:extension
```

This creates `dist-extension/`, the folder you load into Chrome, and `lifekit-extension.zip`, the file you upload to the Chrome Web Store. The tool list is generated from `src/config/tools.ts`, and the version comes from `package.json`.

To try it in Chrome:
1. Open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and choose `dist-extension/`.

When your domain changes, rebuild the extension with the new `VITE_SITE_URL` and upload a new version, with a higher `version` in `package.json`.

To publish:
1. Register at the Chrome Web Store Developer Dashboard (one-time US$5 fee).
2. Upload `lifekit-extension.zip`.
3. Add screenshots, a description and the privacy policy link (`/privacy`).
4. In the privacy section, declare that the extension collects no user data.

## Deployment

The repo includes configuration for both Netlify (`netlify.toml`) and Vercel (`vercel.json`). Each one builds with `npm run build`, publishes `dist/`, falls back to the single-page app for unknown routes, caches hashed assets for a long time, and sets basic security headers.

1. Push the repository to GitHub, GitLab or Bitbucket.
2. Import it in Netlify or Vercel. The build settings are picked up from the config file.
3. Set `VITE_SITE_URL` to your final domain, plus any optional variables.
4. Add your custom domain in the hosting dashboard, then rebuild so the sitemap uses the right domain.
5. Submit `https://your-domain/sitemap.xml` in Google Search Console.

Any static host works, as long as it serves `dist/<route>/index.html` for `/<route>` and falls back to `/index.html` for everything else.

### Updating the site

Edit the code or content (most copy lives in `src/config/tools.ts` and `src/pages/`). Then run `npm test` and `npm run build`, and push. Netlify and Vercel redeploy automatically.

## Limits and known limitations

- File limits, set in `src/config/limits.ts`: 150 MB per PDF; 50 files or 400 MB total for merging; 40 MB or 50 megapixels per image. Processing happens on the visitor's device, so very large files depend on how much memory their browser has.
- **Password-protected PDFs** are not supported. The tools say so instead of failing silently.
- **PDF compression:** lossless mode only repacks the file, so savings are usually small. The stronger levels turn each page into a JPEG image, which makes text unselectable. The tool always shows the real sizes, and only offers a download when the file actually got smaller.
- **PDF merging** keeps page content but may drop bookmarks and interactive form fields.
- **Image formats:** input is limited to what the browser can decode, which usually rules out HEIC. Output is JPG, PNG or WebP. Animated GIFs keep only their first frame.
- **Time zones** use the browser's built-in IANA time-zone database.
- **PDF to Word** extracts text, paragraphs and headings only (no images, columns or tables). Scanned PDFs have no text and are rejected with a clear message.
- **PDF to PowerPoint** makes one picture per slide, so slide text isn't editable.
- **Word to PDF** accepts .docx only and keeps basic formatting (headings, emphasis, lists, tables, PNG/JPG images), not the exact page layout.
- **PowerPoint to PDF** isn't possible in the browser with good quality; a guide explains how to do it with free apps.
- **Timer, alarm clock and Pomodoro** only ring while the tab is open, and some phones pause pages when the screen locks.
- **Text to speech** uses the device's built-in voices and can't save audio files.
- **Speech to text** uses the browser's speech service (Google in Chrome, Microsoft in Edge), so audio leaves the device; the tool page and privacy policy say so. Firefox isn't supported.
- **Screen recorder** works on desktop browsers only (mobile browsers don't allow screen capture).
- **Sign PDF** places an image of a signature; it is not a certified digital signature.
- **Image to Text** reads printed English best.
- The site's `Permissions-Policy` header allows the microphone and screen capture for this site only (`microphone=(self), display-capture=(self)`), which the recorders and speech-to-text need.
