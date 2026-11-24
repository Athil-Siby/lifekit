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
    slug: 'compress-photo-to-20kb-for-exam-forms',
    title: 'How to Compress a Photo or Signature to 20 KB for Exam Forms',
    description: 'SSC, UPSC, NEET, bank and job forms often want a photo under 50 KB and a signature under 20 KB. Here is how to get the exact size in seconds, for free.',
    date: '2026-11-24',
    tools: ['compress-image-to-kb', 'image-resizer', 'crop-image'],
    body: `Almost every online application in India has the same rule buried in the instructions: "Photograph must be between 20 KB and 50 KB" and "Signature must be between 10 KB and 20 KB". A phone photo is usually 2–5 MB, more than a hundred times too big. Here is the fastest way to fix it.

## Step 1: Take a good photo

- Stand in front of a plain white or light wall, facing the camera.
- Use daylight from a window, not a harsh flash.
- For the signature, sign in black or blue ink on plain white paper and photograph it from directly above.

## Step 2: Crop it

Open the [Crop & Rotate Image](/tools/crop-image) tool and cut away everything except your face and shoulders (or just the signature). Smaller area means a smaller file, so crop tightly.

## Step 3: Set the pixel size (if the form asks)

Some forms also give dimensions, such as 200 × 230 pixels for a photo or 140 × 60 for a signature. Use the [Image Resizer](/tools/image-resizer) to set the exact width and height.

## Step 4: Compress to the KB limit

1. Open [Compress Image to KB](/tools/compress-image-to-kb).
2. Drop in your photo.
3. Pick the size: 20 KB, 50 KB or type your own.
4. Press Compress and download the JPG.

LifeKit tries many quality levels and keeps the best one that fits under your limit, so the photo stays as sharp as possible.

> Tip: if a form says "between 20 KB and 50 KB", aim for about 40 KB. Files that are too small can be rejected too.

## Common mistakes

- **Uploading a PNG.** Most forms want JPG/JPEG. The compressor always saves JPG.
- **Using a selfie with a busy background.** Retake it against a plain wall.
- **Stretching the photo.** Keep the proportions: crop first, then resize.`,
  },
  {
    slug: 'cgpa-to-percentage-explained',
    title: 'CGPA to Percentage: How to Convert It (CBSE, VTU, Mumbai University)',
    description: 'Why CBSE multiplies CGPA by 9.5, which formula your university uses, and how to convert CGPA to percentage and back without mistakes.',
    date: '2026-11-24',
    tools: ['cgpa-to-percentage', 'marks-percentage-calculator', 'gpa-calculator'],
    body: `Job portals, college applications and scholarship forms often ask for a percentage, but your marksheet shows a CGPA. The conversion depends on who issued the grades.

## CBSE and most universities: CGPA × 9.5

CBSE studied years of results and found that a student's percentage was, on average, about 9.5 times their grade point. So:

- 8.2 CGPA × 9.5 = **77.9%**
- 9.0 CGPA × 9.5 = **85.5%**

Many universities that use a 10-point scale follow the same rule.

## Other common formulas

- **VTU / AICTE:** (CGPA − 0.75) × 10. So 8.0 becomes 72.5%.
- **Mumbai University:** CGPA × 7.1 + 11. So 8.0 becomes 67.8%.
- **4-point GPA (US style):** GPA × 25 is a rough guide. 3.6 becomes about 90%.

> Always check your marksheet or university website first. If they print an official formula, use that one.

## Converting percentage back to CGPA

Reverse the formula. With CBSE, divide by 9.5: 85% ÷ 9.5 = 8.95 CGPA.

## Do it instantly

The [CGPA to Percentage](/tools/cgpa-to-percentage) tool has all these formulas built in, in both directions. If you have individual subject marks instead, the [Marks Percentage Calculator](/tools/marks-percentage-calculator) adds them up and shows your percentage and grade.`,
  },
  {
    slug: 'sign-pdf-on-phone',
    title: 'How to Sign a PDF on Your Phone (No Printer, No App)',
    description: 'Sign rental agreements, forms and letters on your phone in under a minute: draw your signature, place it on the page and download the signed PDF.',
    date: '2026-11-24',
    tools: ['sign-pdf', 'compress-pdf-to-kb', 'pdf-merger'],
    body: `Printing a document just to sign it and scan it again wastes time and paper. You can do the whole thing on your phone.

## Step by step

1. Open [Sign PDF](/tools/sign-pdf) and choose the PDF from your phone or downloads.
2. Under **Draw**, sign with your finger in the white box. Prefer typing? Use **Type** and pick your name. You can also **Upload** a photo of your signature on white paper.
3. Tap **Use signature**.
4. Tap the page where the signature should go. Drag it into place and use the size slider to make it fit the line.
5. Need initials on every page? Tap each page to place it again.
6. Tap **Save signed PDF** and download.

> Your document never leaves your phone. The signing happens inside your browser.

## Is it legally valid?

For many everyday documents (rental forms, permission slips, internal approvals) a picture of your signature is accepted. Some contracts and government filings need a certified digital signature (for example Aadhaar eSign or a DSC in India). If you're unsure, ask the person who sent you the document.

## After signing

- The file is too big to email or upload? Use [Compress PDF to KB](/tools/compress-pdf-to-kb).
- Need to send several signed pages as one file? Use the [PDF Merger](/tools/pdf-merger).`,
  },
  {
    slug: 'attendance-75-percent-rule',
    title: 'The 75% Attendance Rule: How Many Classes Can You Miss?',
    description: 'How attendance percentage is calculated, how to work out how many classes you can skip, and how many you must attend to get back above 75%.',
    date: '2026-11-24',
    tools: ['attendance-calculator', 'pomodoro-timer', 'todo-list'],
    body: `Most Indian colleges and universities require at least 75% attendance to sit for exams. Falling below it can mean fines, extra assignments or being "detained". Here's how to stay safe.

## How attendance is calculated

Attendance % = classes attended ÷ classes held × 100.

If you attended 42 of 50 classes, that's 84%.

## How many classes can I skip?

You can keep missing classes as long as attended ÷ (held + missed) stays at or above 75%. With 42 of 50:

- Miss 1 → 42/51 = 82.4%
- Miss 6 → 42/56 = 75.0% ✓
- Miss 7 → 42/57 = 73.7% ✗

So you can miss **6** more.

## I'm below 75%. How do I recover?

Each class you attend pushes the percentage up. With 30 of 50 (60%), you'd need to attend the next **30 classes in a row** to reach 60/80 = 75%. The lower you fall, the longer it takes, so don't let it slip early in the semester.

> The [Attendance Calculator](/tools/attendance-calculator) does this maths instantly for any target: 65%, 75%, 80% or more.

## Tips

- Check your college portal every week, not just before exams.
- Ask how medical leave is counted. Some colleges add it back, some don't.
- Labs and tutorials are often tracked separately.`,
  },
  {
    slug: 'new-vs-old-tax-regime',
    title: 'New vs Old Tax Regime (FY 2025-26): Which One Saves You More?',
    description: 'A simple explanation of India’s new and old income tax regimes for FY 2025-26: slabs, the ₹12 lakh rebate, deductions and how to choose.',
    date: '2026-11-24',
    tools: ['income-tax-calculator', 'sip-calculator', 'fd-rd-calculator'],
    body: `Since Budget 2025, most salaried people in India pay less tax under the new regime, but not everyone. Here's how the two compare for FY 2025-26 (AY 2026-27).

> Tax rules change in every Budget. Use this as a guide and confirm on incometax.gov.in before filing.

## New regime: lower rates, few deductions

- No tax on income up to ₹4 lakh, then 5%, 10%, 15%, 20%, 25% and 30% in ₹4 lakh steps above that.
- Rebate under section 87A: if taxable income is ₹12 lakh or less, your tax is zero.
- Salaried people get a ₹75,000 standard deduction, so a salary up to ₹12.75 lakh has no tax.
- Most deductions (80C, HRA, home-loan interest on a self-occupied home) are not allowed.

## Old regime: higher rates, many deductions

- No tax up to ₹2.5 lakh (more for senior citizens), then 5%, 20% and 30%.
- Rebate if taxable income is ₹5 lakh or less.
- ₹50,000 standard deduction, plus 80C (up to ₹1.5 lakh), 80D health insurance, HRA, home-loan interest and more.

## Which should you choose?

Add up all your deductions. If they're large (for example full 80C, high HRA and a home loan), the old regime can still win at higher incomes. For most people with few deductions, the new regime is cheaper.

The quickest way is to try your numbers in the [Income Tax Calculator](/tools/income-tax-calculator). It shows both regimes side by side and tells you which saves more.`,
  },
  {
    slug: 'passport-photo-size-guide',
    title: 'Passport Photo Size Guide: 35×45 mm, 2×2 Inch and More',
    description: 'The right passport and visa photo sizes for India, the US, UK, Canada and Schengen, plus tips for a photo that gets accepted, and how to print it at home.',
    date: '2026-11-24',
    tools: ['passport-photo-maker', 'compress-image-to-kb', 'crop-image'],
    body: `Photo rules are the most common reason passport and visa applications get delayed. Here are the usual sizes and how to make a correct photo yourself.

## Common sizes

- **35 × 45 mm:** India passport, UK, Schengen/EU, Australia and many others.
- **2 × 2 inches (51 × 51 mm):** US passport and visa, and India visa/OCI.
- **50 × 70 mm:** Canada passport.
- **33 × 48 mm:** China visa.

> Rules change and differ by country. Always check the official website for the exact requirements.

## What makes a photo acceptable

- Plain white or light background with no shadows.
- Face the camera directly, neutral expression, mouth closed.
- Eyes open and clearly visible; no sunglasses or tinted glasses.
- Head and top of shoulders in the frame; the face takes up most of the height.
- Recent photo (usually taken in the last 6 months).

## Make and print it at home

1. Take the photo against a white wall in daylight, with the phone at eye level.
2. Open the [Passport Photo Maker](/tools/passport-photo-maker), choose the size and fit your face in the oval.
3. Download a print sheet for 4×6 inch photo paper (prints at any photo shop or kiosk) or A4.
4. Print at **100% / actual size**, not "fit to page".

For online applications that want a small file, run the single photo through [Compress Image to KB](/tools/compress-image-to-kb).`,
  },
  {
    slug: 'edit-a-pdf-convert-to-word',
    title: 'How to Edit a PDF: Convert It to Word for Free',
    description: 'The simplest way to edit the text in a PDF is to turn it into a Word document. Here is how, what gets kept, and what to do with scanned PDFs.',
    date: '2026-11-24',
    tools: ['pdf-to-word', 'image-to-text', 'word-to-pdf'],
    body: `PDFs are designed to look the same everywhere, which also makes them hard to change. The easiest fix is to convert the PDF into a Word document, edit it, then save it as a PDF again.

## Step 1: Convert to Word

1. Open [PDF to Word](/tools/pdf-to-word).
2. Drop in your PDF and press **Convert to Word**.
3. Download the .docx file.

LifeKit keeps the text, paragraphs and headings. Complex layouts with columns, tables and images are simplified, so you may need to tidy the formatting.

## Step 2: Edit

Open the .docx in Microsoft Word, Google Docs (upload it to Drive) or WPS Office on your phone, and make your changes.

## Step 3: Turn it back into a PDF

Use **File → Save as PDF** in Word or Google Docs, or LifeKit's [Word to PDF](/tools/word-to-pdf).

## What about scanned PDFs?

A scanned PDF is just a photo of paper, so it has no real text inside. PDF to Word will tell you if that's the case. Instead:

1. Take a screenshot of the page (or open the scan as an image).
2. Use [Image to Text](/tools/image-to-text) to read the words.
3. Copy the text into a new document.

> Converting your own documents is fine. Don't edit official documents such as certificates or ID cards: that can be illegal.`,
  },
  {
    slug: 'sip-vs-fd',
    title: 'SIP vs FD: Which Is Better for Your Savings?',
    description: 'A plain-English comparison of mutual fund SIPs and bank fixed deposits: returns, risk, taxes and how to choose, with examples you can try yourself.',
    date: '2026-11-24',
    tools: ['sip-calculator', 'fd-rd-calculator', 'compound-interest-calculator'],
    body: `Fixed deposits (FDs) and mutual fund SIPs are the two most common ways Indians save. They suit different goals.

## Fixed deposit (FD)

- You lock money in a bank for a fixed time at a fixed rate (often 6–7.5% a year).
- Very low risk: you know exactly what you'll get. Bank deposits are insured up to ₹5 lakh per bank by DICGC.
- Interest is taxed at your income-tax slab rate.

**Example:** ₹1,00,000 for 3 years at 7%, compounded quarterly, grows to about ₹1,23,100.

## SIP (systematic investment plan)

- You invest a fixed amount every month in a mutual fund.
- Equity funds have historically averaged around 10–14% a year in India over long periods, but returns go up and down and are **not guaranteed**.
- Better suited to goals 5+ years away, so short-term falls have time to recover.

**Example:** ₹5,000 a month for 10 years at an assumed 12% grows to about ₹11.6 lakh, from ₹6 lakh invested.

## How to choose

- **Need the money within 1–3 years, or can't handle any loss?** FD or RD.
- **Saving for something 5–15 years away?** A SIP has historically grown faster.
- **Unsure?** Many people split: an emergency fund in FDs, long-term goals in SIPs.

Try your own numbers with the [SIP Calculator](/tools/sip-calculator) and the [FD & RD Calculator](/tools/fd-rd-calculator).

> This guide is general information, not financial advice. Read scheme documents carefully before investing.`,
  },
  {
    slug: 'pomodoro-study-method',
    title: 'The Pomodoro Technique: Study Longer Without Burning Out',
    description: 'How the Pomodoro technique works, why it helps you focus, and a simple study plan you can start today with a free online timer.',
    date: '2026-11-24',
    tools: ['pomodoro-timer', 'todo-list', 'sleep-calculator'],
    body: `If you sit down to study for three hours and end up scrolling your phone after ten minutes, the Pomodoro technique is for you.

## How it works

1. Pick one task.
2. Focus on it for **25 minutes**. No phone, no tabs.
3. Take a **5-minute** break: stand up, drink water, stretch.
4. After **4 rounds**, take a longer **15–30 minute** break.

Each 25-minute block is one "pomodoro", named after a tomato-shaped kitchen timer.

## Why it works

- 25 minutes feels short, so it's easy to start.
- Regular breaks stop your brain from getting tired.
- Counting pomodoros shows real progress ("I did 6 today!").

## A simple exam-week plan

- Morning: 4 pomodoros on your hardest subject.
- Afternoon: 4 pomodoros of practice questions.
- Evening: 2 pomodoros of revision, then stop.

## Tools that help

- The [Pomodoro Timer](/tools/pomodoro-timer) runs the cycle for you and rings at each break.
- Write the day's tasks in the [To-Do List](/tools/todo-list) and tick them off.
- Sleep matters as much as study. Use the [Sleep Calculator](/tools/sleep-calculator) to find a bedtime that fits your wake-up time.

> Keep your phone in another room during focus blocks. It's the single biggest difference.`,
  },
  {
    slug: 'fresher-resume-tips',
    title: 'How to Write Your First Resume (Fresher Guide with Examples)',
    description: 'No work experience? Here is what to put on a fresher resume, how to write strong bullet points, and how to make it pass ATS filters.',
    date: '2026-11-24',
    tools: ['resume-builder', 'word-counter', 'text-compare'],
    body: `Your first resume doesn't need years of experience. It needs to show what you can do, clearly, on one page.

## What to include

1. **Name and contact:** phone, a professional email, city, and LinkedIn or portfolio link.
2. **Summary (2–3 lines):** who you are and what you're looking for.
3. **Education:** degree, college, years, CGPA or percentage if it's good.
4. **Projects:** your best substitute for experience. College projects, hackathons and personal projects all count.
5. **Internships or part-time work**, if any.
6. **Skills:** tools and technologies you can actually use.
7. **Achievements:** competitions, certificates, volunteering, languages.

## Write bullets that stand out

Start with an action word and add a result, ideally a number:

- Weak: "Worked on the college website."
- Strong: "Rebuilt the college events page in React, cutting load time by 40%."

## Make it ATS-friendly

Many companies filter resumes with software (applicant tracking systems) before a person reads them.

- Use a simple single-column layout with standard headings.
- Use real text, not images of text.
- Include keywords from the job description (if they ask for "Excel", write "Excel").
- Save as PDF unless they ask for Word.

## Build it in minutes

The [Resume Builder](/tools/resume-builder) gives you a clean, ATS-friendly layout. Fill in the form and download a PDF. It saves your progress on your device, so you can tailor it for each job.`,
  },
  {
    slug: 'powerpoint-to-pdf',
    title: 'How to Convert PowerPoint to PDF (Free, on Any Device)',
    description:
      'Turn a PowerPoint (.pptx) into a PDF in under a minute using apps you already have: PowerPoint, Google Slides, Keynote or your phone. Step by step.',
    date: '2026-11-14',
    tools: ['pdf-compressor', 'pdf-merger', 'pdf-to-powerpoint'],
    body: `Sending slides as a PDF is the safest way to share them: the fonts, layout and pictures look the same on every device, and nobody can accidentally edit them. You don't need a converter website for this. The apps you already use can do it, and the result is a perfect copy.

> Why doesn't LifeKit convert PowerPoint to PDF in the browser? Getting slides exactly right needs the full PowerPoint layout engine, and doing it badly would give you broken slides. The apps below do it perfectly and for free.

## On Windows or Mac with PowerPoint

1. Open your presentation in PowerPoint.
2. Click **File**, then **Save As** (on Mac: **File**, then **Export**).
3. Choose **PDF** as the file type.
4. Click **Save**. Done.

## With Google Slides (free, any computer)

1. Go to Google Drive and upload your .pptx file.
2. Open it with **Google Slides**.
3. Click **File**, then **Download**, then **PDF document (.pdf)**.

## On a Mac with Keynote

1. Open the .pptx file in Keynote.
2. Click **File**, then **Export To**, then **PDF**.
3. Pick the image quality and click **Next**, then **Export**.

## On iPhone or Android

1. Open the file in the free PowerPoint app, Google Slides or Keynote.
2. Tap the **share** or **three-dot** menu.
3. Choose **Export**, **Download** or **Print**, then **PDF** (on iPhone, Print and then pinch out on the preview to make a PDF).

## After you have the PDF

- **File too big to email?** Shrink it with the [PDF Compressor](/tools/pdf-compressor).
- **Need to combine it with other documents?** Use the [PDF Merger](/tools/pdf-merger).
- **Need slides from a PDF?** Go the other way with [PDF to PowerPoint](/tools/pdf-to-powerpoint).
`,
  },
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
