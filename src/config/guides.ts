/**
 * GUIDE ARTICLES
 * ==============
 * Each guide becomes a page at /guides/<slug> and is added to the sitemap
 * automatically when the site is built.
 *
 * HOW TO ADD A NEW GUIDE
 * 1. Copy one whole { ... }, block below (from "{" to "},") and paste it at the top of the list.
 * 2. Change: slug (lowercase-words-with-dashes, must be unique), title, description,
 *    date (YYYY-MM-DD), tools (slugs of related LifeKit tools) and body.
 * 3. Write the body between the backticks (`) using simple formatting:
 *      ## Section heading        ### Smaller heading
 *      - bullet point            1. numbered step
 *      > A highlighted tip
 *      **bold text**             [link text](/tools/pdf-merger)
 *    Leave an empty line between paragraphs. Don't use the backtick character inside the body.
 * 4. Commit and push. Vercel publishes it about a minute later.
 *
 * This file must stay free of imports (the build script reads it directly).
 */

export interface Guide {
  slug: string;
  title: string;
  /** Shown in Google results and on cards (aim for 120–160 characters). */
  description: string;
  /** Publication date, YYYY-MM-DD. */
  date: string;
  /** Slugs of related LifeKit tools, shown as "Try the tool" links. */
  tools: string[];
  body: string;
}

export const guides: Guide[] = [
  {
    slug: 'reduce-pdf-size-for-email',
    title: 'How to Reduce PDF File Size for Email',
    description:
      'PDF too big to attach? Learn why PDFs get large and how to shrink them for email in a few clicks, for free and without uploading your document anywhere.',
    date: '2026-11-11',
    tools: ['pdf-compressor', 'pdf-splitter', 'image-compressor'],
    body: `
You have finished a document, hit send, and your email app refuses: the attachment is too large. Most email services cap attachments at around **20–25 MB**, and some workplaces set lower limits. Here is how to get your PDF under the limit without losing what matters.

## Why are some PDFs so large?

A PDF is a container. Text and simple drawings take up very little space, but a few things make files balloon:

- **Scanned pages.** Every page of a scan is a photo. A 20-page scan at high resolution can easily pass 30 MB.
- **High-resolution photos.** Images pasted straight from a phone camera are often 4,000 pixels wide or more.
- **Embedded fonts and leftovers.** Files that have been edited many times can carry unused data.

Knowing which of these applies to your file tells you which fix will work.

## Option 1: Compress the PDF

The quickest fix is a PDF compressor. With the [LifeKit PDF Compressor](/tools/pdf-compressor) the work happens in your browser, so the document never leaves your device.

1. Open the PDF Compressor and drop in your file.
2. Choose a level. **Lossless** tidies the file structure and keeps text selectable. **Balanced** turns each page into a compressed image and gives the biggest savings on scans.
3. Click **Compress PDF** and compare the before and after sizes.
4. Download the smaller file and attach it.

> If your PDF is mostly text, lossless compression may only save a little. That is normal: text is already compact. Image-based compression helps most with scans and photo-heavy documents.

## Option 2: Send only the pages that matter

Does the recipient really need all 60 pages? Use the [PDF Splitter](/tools/pdf-splitter) to extract the relevant pages, or split the document into two smaller parts and send them in separate emails.

## Option 3: Shrink images before making the PDF

If you are creating the PDF yourself from photos, compress the photos first. Scaling a phone photo down to about 1,600 pixels wide with the [Image Compressor](/tools/image-compressor) usually cuts its size by 80% or more while still looking sharp on screen.

## Option 4: Scan smarter next time

For ordinary documents, scanning at **150–200 DPI in greyscale** gives perfectly readable pages at a fraction of the size of a 600 DPI colour scan. Most scanner apps have these settings under quality or resolution.

## When to use a link instead

If the file has to stay at full quality, for example a print-ready brochure, upload it to a cloud storage service and send a share link instead of an attachment. Gmail does this automatically for files over its limit.

## Quick checklist

- Try lossless compression first, then an image-based level if needed.
- Remove pages the recipient does not need.
- Compress photos before putting them into a PDF.
- Scan documents at 150–200 DPI in greyscale.
- Use a share link for files that must stay at full quality.
`,
  },
  {
    slug: 'merge-pdf-files-free',
    title: 'How to Merge PDF Files for Free (Without Uploading Them)',
    description:
      'Combine several PDFs into one document in the right order, for free. Step-by-step guide plus tips for naming, ordering and keeping private files on your device.',
    date: '2026-11-11',
    tools: ['pdf-merger', 'pdf-splitter', 'pdf-compressor'],
    body: `
Combining PDFs is one of the most common office chores: invoices for an expense claim, chapters of a report, or scanned pages that came out as separate files. You do not need paid software to do it.

## Why merging in your browser matters

Many online PDF tools upload your files to their servers. That is a problem for contracts, payslips, IDs and medical letters. The [LifeKit PDF Merger](/tools/pdf-merger) reads the files with your browser and combines them on your own device, so nothing is uploaded.

## How to merge PDFs step by step

1. Open the [PDF Merger](/tools/pdf-merger).
2. Drag your PDF files onto the upload area, or click it to choose them. You can add more files later.
3. Put the files in order. Drag them up or down the list, or use the arrow buttons.
4. Remove anything you added by mistake with the ✕ button.
5. Optionally type a name for the finished file.
6. Click **Merge PDFs**, then **Download merged PDF**.

That is it: one tidy document, in the order you chose.

## Tips for a cleaner result

- **Name files with numbers first.** Files called 01-cover.pdf, 02-report.pdf and 03-appendix.pdf are easy to put in order.
- **Check the page count.** The merger shows how many pages each file has, so you can spot a missing or duplicate file before merging.
- **Too big to email?** Run the merged file through the [PDF Compressor](/tools/pdf-compressor) afterwards.
- **Need just part of a file?** Extract the pages you need with the [PDF Splitter](/tools/pdf-splitter) first, then merge.

## Things to know

> Password-protected PDFs cannot be merged until the password is removed. Open the file in a PDF reader with the password, save an unprotected copy, and merge that.

Page content such as text, images and drawings is copied exactly. Interactive extras like form fields and the bookmark sidebar are not always carried over when files from different sources are combined, so keep the originals if you rely on those.

## Frequently asked questions

### Is there a limit on how many files I can merge?

You can combine up to 50 files and roughly 400 MB in total. Very large jobs depend on how much memory your device has.

### Does merging reduce quality?

No. Pages are copied as they are, so text stays sharp and selectable.

### Does it work on a phone?

Yes. The merger works in modern mobile browsers. Choose files from your phone's Files app.
`,
  },
  {
    slug: 'jpg-vs-png-vs-webp',
    title: 'JPG vs PNG vs WebP: Which Image Format Should You Use?',
    description:
      'A plain-English guide to JPG, PNG and WebP: how they differ, when to use each one, and how to convert between them without losing quality.',
    date: '2026-11-11',
    tools: ['image-converter', 'image-compressor'],
    body: `
Picking the wrong image format can make a website slow, a logo look blurry, or a form reject your upload. The good news: for everyday use there are only three formats to understand.

## The short answer

- **Photos:** JPG, or WebP for websites.
- **Logos, icons, screenshots and anything with transparency:** PNG, or WebP for websites.
- **Websites in general:** WebP gives smaller files than both and works in all modern browsers.

## JPG (or JPEG)

JPG is the classic photo format. It uses **lossy** compression: it throws away detail your eye is unlikely to notice, which keeps files small.

- Best for photographs and images with smooth gradients.
- Accepted almost everywhere, from government forms to old software.
- No transparency: transparent areas become a solid colour.
- Each time a JPG is edited and saved again, it loses a little more quality.

## PNG

PNG is **lossless**: it keeps every pixel exactly. That makes it ideal for images with sharp edges and text.

- Best for logos, icons, screenshots, diagrams and illustrations.
- Supports transparency.
- Photos saved as PNG are usually several times larger than the same photo as JPG.

## WebP

WebP is a newer format designed for the web. It can be lossy or lossless, supports transparency, and typically produces files **around 25–35% smaller** than JPG or PNG at similar quality. Every major modern browser supports it.

- Best for images on websites and in web apps.
- Not every older program or upload form accepts it yet.

## Quick comparison

- **Transparency:** JPG no, PNG yes, WebP yes.
- **File size for photos:** JPG small, PNG large, WebP smallest.
- **Sharp text and edges:** JPG fair, PNG excellent, WebP excellent.
- **Compatibility:** JPG everywhere, PNG everywhere, WebP modern browsers.

## How to convert between formats

1. Open the [Image Converter](/tools/image-converter) and drop in your image.
2. Choose JPG, PNG or WebP.
3. When converting to JPG, pick a background colour for transparent areas.
4. Click **Convert** and download the result.

> Converting a JPG to PNG does not bring back lost detail. It only makes the file bigger. Convert to PNG when you need lossless editing or transparency, not to "improve" quality.

## Making images smaller

If your goal is a smaller file rather than a different format, use the [Image Compressor](/tools/image-compressor). Lowering the quality to around 75% and scaling large photos down to the size they will actually be displayed at usually gives the biggest savings.
`,
  },
  {
    slug: 'wifi-qr-code',
    title: 'How to Make a QR Code for Your Wi-Fi Network',
    description:
      'Let guests join your Wi-Fi by scanning a QR code instead of typing a long password. Free step-by-step guide, plus security and printing tips.',
    date: '2026-11-11',
    tools: ['qr-code-generator', 'password-generator'],
    body: `
Reading out a long Wi-Fi password letter by letter is nobody's favourite job. A Wi-Fi QR code lets guests point their phone camera at it and join in seconds.

## What you need

- Your network name (also called the SSID).
- Your Wi-Fi password.
- The security type. Most home networks use **WPA2 or WPA3**. You can usually find all three on a sticker on your router or in its settings app.

## How to create the QR code

1. Open the [QR Code Generator](/tools/qr-code-generator).
2. Choose the **Wi-Fi** tab.
3. Type the network name exactly as it appears, including capital letters and spaces.
4. Choose the security type. Pick **WPA / WPA2 / WPA3** for most networks.
5. Type the password. Tick **Hidden network** only if your network does not appear in the normal Wi-Fi list.
6. Download the code as **PNG** to share digitally, or **SVG** for sharp printing.

The QR code contains your network details directly, so it keeps working as long as the name and password stay the same. Nothing is stored online.

## Test it before you print

Open your phone's camera and point it at the code on your screen. Both iPhone and Android cameras recognise Wi-Fi QR codes and offer to join the network. If it does not work, check the network name and password for typos.

## Printing tips

- Print the code at least **3 cm (about 1.2 inches)** wide so phones can read it from arm's length.
- Keep strong contrast: a dark code on a light background.
- Leave a white border around the code. Scanners need that quiet space.
- Add a short label such as "Scan to join our Wi-Fi".

## Keep it secure

> Anyone who can see the QR code can join your network, just like anyone who knows the password.

- **Use a guest network** if your router offers one. Guests get internet access without reaching your computers, printers or smart devices.
- **Do not post the code publicly**, for example in photos on social media.
- **Changed your password?** Make a new code, because the old one stops working.

Need a stronger password for your network? The [Password Generator](/tools/password-generator) creates long random passwords, and a QR code means nobody has to type them.
`,
  },
  {
    slug: 'create-strong-password',
    title: 'How to Create a Strong Password You Can Actually Use',
    description:
      'What makes a password strong in 2026, why length beats complexity, and simple habits that protect your accounts: password managers, passphrases and two-factor login.',
    date: '2026-11-11',
    tools: ['password-generator'],
    body: `
Most account break-ins do not involve clever hacking. They happen because someone reused a password that leaked from another website, or picked one that is easy to guess. A few habits fix most of the risk.

## What makes a password strong?

A strong password is **long, random and unique**.

- **Long:** every extra character multiplies the number of guesses an attacker needs. 16 characters is a good target for random passwords.
- **Random:** no names, birthdays, pets, football teams or keyboard patterns like qwerty123.
- **Unique:** never reuse a password. If one site leaks it, attackers try it everywhere else.

> Length matters more than complexity. A long random password, or a passphrase of several random words, is far stronger than a short password stuffed with symbols.

## Option 1: Let a generator create it

Humans are bad at being random. A generator is not. The [LifeKit Password Generator](/tools/password-generator) uses your browser's cryptographically secure random number generator, the same kind used for encryption, and never stores or sends the result.

1. Set the length to 16 or more.
2. Keep uppercase, lowercase, numbers and symbols switched on, unless a site does not allow symbols.
3. Turn on **Exclude look-alike characters** if you will ever type it by hand.
4. Copy it into your password manager.

## Option 2: Use a passphrase for passwords you type often

For the few passwords you must remember, such as your computer login or your password manager's master password, use four or more **random** words, for example: lantern-orbit-pepper-glacier. Choose the words randomly rather than making a meaningful sentence.

## Use a password manager

Nobody can remember 100 unique random passwords. A password manager remembers them for you and fills them in automatically. Many browsers and phones include one, and there are also dedicated apps. You only need to remember one strong master password.

## Turn on two-factor authentication

Two-factor authentication (2FA) asks for a second proof, such as a code from an app or a passkey, when you log in. Even if your password leaks, an attacker still cannot get in. Turn it on first for your email, banking and social media accounts, because email is the key to resetting everything else.

## Habits that help

- Change a password straight away if a site tells you it was involved in a breach.
- You do not need to change strong, unique passwords on a schedule.
- Never share passwords by text or email.
- Be wary of emails asking you to "confirm" your password. Go to the site directly instead.

## Quick summary

- Use a generator for 16+ character random passwords.
- Use a random-word passphrase for the few you must remember.
- Store everything in a password manager.
- Turn on two-factor authentication for important accounts.
`,
  },
  {
    slug: 'why-1tb-shows-931gb',
    title: 'KB vs KiB: Why Your 1 TB Drive Shows Only 931 GB',
    description:
      'Bought a 1 TB drive and your computer says 931 GB? Nothing is missing. Learn the difference between decimal and binary units, and how to convert between them.',
    date: '2026-11-11',
    tools: ['file-size-calculator', 'unit-converter'],
    body: `
You plug in a brand-new 1 TB drive and your computer reports 931 GB. Did the manufacturer short-change you? No. You are seeing two different ways of counting the same number of bytes.

## Two systems for the same thing

**Decimal units** count in thousands, like the metric system:

- 1 kilobyte (KB) = 1,000 bytes
- 1 megabyte (MB) = 1,000 KB = 1,000,000 bytes
- 1 gigabyte (GB) = 1,000 MB
- 1 terabyte (TB) = 1,000 GB = 1,000,000,000,000 bytes

**Binary units** count in powers of two, which is how computer memory is built:

- 1 kibibyte (KiB) = 1,024 bytes
- 1 mebibyte (MiB) = 1,024 KiB
- 1 gibibyte (GiB) = 1,024 MiB = 1,073,741,824 bytes
- 1 tebibyte (TiB) = 1,024 GiB

The binary units have their own names (KiB, MiB, GiB, TiB) precisely so they do not get confused with the decimal ones. Unfortunately, not all software uses them.

## Where the 931 comes from

Drive makers use decimal units, so a 1 TB drive holds 1,000,000,000,000 bytes. Windows divides by 1,024 at each step, which gives:

1,000,000,000,000 ÷ 1,073,741,824 ≈ **931.32**

That is 931.32 GiB, but Windows labels it "GB". The capacity is all there. It is just described in a different unit. macOS and iOS use decimal units, so the same drive shows close to 1 TB on a Mac.

> The gap grows as numbers get bigger: about 2.4% for KB vs KiB, 7.4% for GB vs GiB and almost 10% for TB vs TiB.

## Who uses which?

- **Drive and USB stick makers:** decimal (GB, TB).
- **macOS, iOS and most Linux file managers:** decimal.
- **Windows:** binary, but labelled with decimal names.
- **RAM:** binary. "16 GB" of memory is really 16 GiB.

## Bonus: bits vs bytes in internet speeds

Internet speeds are measured in **bits** per second (Mbps), while file sizes are measured in **bytes**. There are 8 bits in a byte, so divide by 8: a 100 Mbps connection downloads at most about 12.5 MB per second.

## Convert any size instantly

The [File Size Calculator](/tools/file-size-calculator) converts between bytes, KB, MB, GB and TB and their binary equivalents in one go, and shows what Windows would display. For bits and other data units, try the digital storage section of the [Unit Converter](/tools/unit-converter).
`,
  },
];

export const guidesBySlug: Record<string, Guide> = Object.fromEntries(guides.map((g) => [g.slug, g]));

/** Guides that mention a given tool, newest first. */
export function guidesForTool(toolSlug: string): Guide[] {
  return guides.filter((g) => g.tools.includes(toolSlug));
}
