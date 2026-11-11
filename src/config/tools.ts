/**
 * Central tool registry. Everything about a tool except its interface lives here:
 * metadata, SEO copy, instructions, FAQs and related tools.
 *
 * This file must stay free of runtime imports so the build script
 * (scripts/generate-sitemap.mjs) can read it directly with Node.
 */

export type CategoryId = 'pdf' | 'image' | 'generators' | 'calculators' | 'text' | 'files';

export type IconName =
  | 'FileStack'
  | 'Scissors'
  | 'FileDown'
  | 'ImageDown'
  | 'Repeat'
  | 'QrCode'
  | 'KeyRound'
  | 'Ruler'
  | 'Type'
  | 'Percent'
  | 'Cake'
  | 'Globe'
  | 'CaseSensitive'
  | 'HardDrive'
  | 'FileText'
  | 'Image'
  | 'Sparkles'
  | 'Calculator'
  | 'TextCursorInput'
  | 'Folder';

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  icon: IconName;
}

export interface Faq {
  q: string;
  a: string;
}

export interface Tool {
  slug: string;
  name: string;
  /** One line, used on cards. */
  short: string;
  /** Meta description (aim for 120–160 characters). */
  metaDescription: string;
  /** Longer intro shown on the tool page. */
  intro: string;
  category: CategoryId;
  icon: IconName;
  keywords: string[];
  badge?: 'popular' | 'new';
  /** True when the tool reads files the user provides. */
  handlesFiles: boolean;
  steps: string[];
  faqs: Faq[];
  related: string[];
}

export const categories: Category[] = [
  { id: 'pdf', name: 'PDF Tools', description: 'Merge, split and shrink PDF documents.', icon: 'FileText' },
  { id: 'image', name: 'Image Tools', description: 'Compress and convert photos and graphics.', icon: 'Image' },
  { id: 'generators', name: 'Generators', description: 'Create QR codes and strong passwords.', icon: 'Sparkles' },
  {
    id: 'calculators',
    name: 'Calculators & Converters',
    description: 'Units, percentages, ages, time zones and word counts.',
    icon: 'Calculator',
  },
  { id: 'text', name: 'Text Tools', description: 'Clean up and reformat text in one click.', icon: 'TextCursorInput' },
  { id: 'files', name: 'File Utilities', description: 'Understand and convert file sizes.', icon: 'Folder' },
];

export const tools: Tool[] = [
  {
    slug: 'pdf-merger',
    name: 'PDF Merger',
    short: 'Combine several PDFs into one document, in the order you choose.',
    metaDescription:
      'Merge multiple PDF files into one document for free. Drag to reorder, remove files, then download. Files are combined in your browser and never uploaded.',
    intro:
      'Combine invoices, scanned pages, reports or chapters into a single PDF. Add as many files as you need, arrange them in the right order, and download one tidy document. Merging happens entirely on your device.',
    category: 'pdf',
    icon: 'FileStack',
    keywords: ['merge pdf', 'combine pdf', 'join pdf', 'pdf joiner', 'append pdf', 'concatenate'],
    badge: 'popular',
    handlesFiles: true,
    steps: [
      'Drop your PDF files into the upload area, or click it to choose files.',
      'Drag the files into the order you want, or use the arrow buttons. Remove any you added by mistake.',
      'Optionally change the output file name.',
      'Click “Merge PDFs” and download the combined document.',
    ],
    faqs: [
      {
        q: 'Are my PDFs uploaded to a server?',
        a: 'No. LifeKit reads your files with your browser and builds the merged PDF on your device. Nothing is sent to us, and the files are discarded when you close or refresh the page.',
      },
      {
        q: 'Can I merge password-protected PDFs?',
        a: 'Not at the moment. Encrypted PDFs need to be unlocked before they can be combined. Open the file in a PDF reader with the password and save an unprotected copy first.',
      },
      {
        q: 'Will links, bookmarks and form fields be kept?',
        a: 'Page content, including text, images and vector graphics, is copied exactly. Document-level features such as the bookmark outline and interactive form fields are not always carried over when pages from different files are combined.',
      },
      {
        q: 'Is there a limit on how many files I can merge?',
        a: 'You can combine up to 50 files and roughly 400 MB in total. Because the work happens on your device, very large jobs depend on how much memory your browser has available.',
      },
    ],
    related: ['pdf-splitter', 'pdf-compressor', 'file-size-calculator'],
  },
  {
    slug: 'pdf-splitter',
    name: 'PDF Splitter',
    short: 'Extract pages or split a PDF into several smaller files by page range.',
    metaDescription:
      'Split a PDF by page ranges, extract selected pages, or separate every page into its own file. Free, private and processed entirely in your browser.',
    intro:
      'Pull out the pages you need from a long PDF. Split a document into several parts using page ranges, pick individual pages from thumbnails, or break every page out into its own file. Your document never leaves your device.',
    category: 'pdf',
    icon: 'Scissors',
    keywords: ['split pdf', 'extract pages', 'separate pdf', 'pdf page range', 'cut pdf', 'remove pages'],
    handlesFiles: true,
    steps: [
      'Upload one PDF. LifeKit shows how many pages it contains.',
      'Choose a mode: split by ranges, extract selected pages, or one file per page.',
      'For ranges, type something like “1-3, 4-8, 9”. Each range becomes a separate PDF. For extraction, click page thumbnails or type the page numbers.',
      'Click “Split PDF”, then download each file individually or all together as a ZIP.',
    ],
    faqs: [
      {
        q: 'How do I write page ranges?',
        a: 'Separate ranges with commas. Use a hyphen for a run of pages, for example “1-3, 7, 10-12”. In range mode each item becomes its own PDF; in extract mode all listed pages go into a single PDF in the order you typed them.',
      },
      {
        q: 'Does splitting reduce quality?',
        a: 'No. Pages are copied as they are, so text stays selectable and images keep their original resolution.',
      },
      {
        q: 'Can I reorder pages while extracting?',
        a: 'Yes. In extract mode the output follows the order you type, so “5, 1, 2” creates a PDF that starts with page 5.',
      },
    ],
    related: ['pdf-merger', 'pdf-compressor', 'file-size-calculator'],
  },
  {
    slug: 'pdf-compressor',
    name: 'PDF Compressor',
    short: 'Reduce PDF file size with a lossless clean-up or stronger image-based compression.',
    metaDescription:
      'Make PDF files smaller in your browser. Choose a lossless optimisation or stronger image-based compression and see the exact size saving before you download.',
    intro:
      'Large PDFs are awkward to email and upload. Choose a lossless optimisation that keeps everything intact, or a stronger mode that re-renders pages as compressed images for much bigger savings on scanned or image-heavy files. You always see the real before and after sizes.',
    category: 'pdf',
    icon: 'FileDown',
    keywords: ['compress pdf', 'reduce pdf size', 'shrink pdf', 'smaller pdf', 'optimize pdf', 'pdf size'],
    handlesFiles: true,
    steps: [
      'Upload the PDF you want to make smaller.',
      'Pick a compression level. “Lossless” keeps text selectable; the image-based levels give larger savings but flatten each page into an image.',
      'Click “Compress PDF” and compare the original and new sizes.',
      'If the file got smaller, download it. If not, LifeKit tells you and you can keep your original.',
    ],
    faqs: [
      {
        q: 'Why did my PDF barely shrink?',
        a: 'PDFs that are mostly text, or that were already optimised, have little left to remove. Lossless optimisation only repacks the file’s internal structure. Big savings usually come from compressing images, which is what the image-based levels do.',
      },
      {
        q: 'What does image-based compression change?',
        a: 'Each page is rendered to a JPEG at the chosen resolution and placed into a new PDF. That works well for scans and photos, but the text is no longer selectable or searchable, and links and form fields are removed. Keep your original if you need those.',
      },
      {
        q: 'Is the compression done online?',
        a: 'No. Both modes run in your browser using JavaScript libraries, so your document is never uploaded.',
      },
      {
        q: 'What happens if the result is bigger than the original?',
        a: 'LifeKit compares the sizes and tells you honestly. When compression would not help, we recommend keeping the original file rather than downloading a larger one.',
      },
    ],
    related: ['pdf-merger', 'pdf-splitter', 'image-compressor'],
  },
  {
    slug: 'image-compressor',
    name: 'Image Compressor',
    short: 'Shrink JPG, PNG and WebP images with a quality slider and live size comparison.',
    metaDescription:
      'Compress JPG, PNG and WebP images for free. Adjust quality, resize, preview the result and see the exact size reduction. Runs in your browser with no uploads.',
    intro:
      'Make photos and graphics lighter for websites, email and messaging apps. Adjust quality, optionally scale the image down, and compare the original and compressed sizes before you download. Images are processed locally, and re-encoding also strips hidden metadata such as camera details and GPS location.',
    category: 'image',
    icon: 'ImageDown',
    keywords: ['compress image', 'reduce image size', 'jpg compressor', 'png compressor', 'webp', 'optimize photo', 'resize image'],
    badge: 'popular',
    handlesFiles: true,
    steps: [
      'Drop a JPG, PNG or WebP image into the upload area.',
      'Choose the output format and move the quality slider. Lower quality means a smaller file.',
      'Optionally set a maximum width to scale large photos down. This gives the biggest savings.',
      'Compare the sizes and preview, then download the compressed image.',
    ],
    faqs: [
      {
        q: 'Why doesn’t the quality slider change my PNG?',
        a: 'PNG is a lossless format, so browsers ignore the quality setting when saving PNGs. To shrink a PNG, reduce its dimensions or save it as WebP or JPG instead. WebP keeps transparency.',
      },
      {
        q: 'What quality setting should I use?',
        a: 'For photos, 70–80% usually looks almost identical to the original at a fraction of the size. Go lower for thumbnails, higher for images where fine detail matters.',
      },
      {
        q: 'Is location data removed from my photos?',
        a: 'Yes. The compressed image is redrawn from the pixels only, so EXIF metadata such as GPS coordinates, camera model and capture time is not included in the downloaded file.',
      },
      {
        q: 'Why is the compressed file sometimes larger?',
        a: 'If the original was already heavily compressed, re-encoding at a high quality can produce a bigger file. LifeKit shows the real sizes and warns you when this happens, so you can lower the quality or keep the original.',
      },
    ],
    related: ['image-converter', 'pdf-compressor', 'file-size-calculator'],
  },
  {
    slug: 'image-converter',
    name: 'Image Converter',
    short: 'Convert images between JPG, PNG and WebP right in your browser.',
    metaDescription:
      'Convert images to JPG, PNG or WebP for free. Supports JPG, PNG, WebP, GIF, BMP and AVIF input, with a preview and transparency options. No uploads required.',
    intro:
      'Need a JPG for a form that rejects WebP, or a PNG with a transparent background? Convert between common image formats in a couple of clicks. Conversion happens on your device, so it is fast and private.',
    category: 'image',
    icon: 'Repeat',
    keywords: ['convert image', 'png to jpg', 'jpg to png', 'webp to jpg', 'jpg to webp', 'heic', 'image format', 'avif'],
    handlesFiles: true,
    steps: [
      'Upload an image (JPG, PNG, WebP, GIF, BMP or AVIF, depending on your browser).',
      'Choose the format you want: JPG, PNG or WebP.',
      'For JPG, pick a background colour to replace any transparent areas.',
      'Click “Convert” and download the new file.',
    ],
    faqs: [
      {
        q: 'Which format should I choose?',
        a: 'JPG is best for photos and is accepted almost everywhere. PNG is lossless and supports transparency, which suits logos, screenshots and graphics. WebP gives smaller files than both and is supported by all modern browsers.',
      },
      {
        q: 'What happens to transparency when converting to JPG?',
        a: 'JPG does not support transparency, so transparent areas are filled with the background colour you choose (white by default).',
      },
      {
        q: 'Can I convert HEIC photos from my iPhone?',
        a: 'Only if your browser can open HEIC files, which most cannot today. On iPhone you can change Settings → Camera → Formats to “Most Compatible” to take JPG photos instead.',
      },
      {
        q: 'Are animated GIFs supported?',
        a: 'GIFs can be converted, but only the first frame is kept because JPG, PNG and standard WebP output here are still images.',
      },
    ],
    related: ['image-compressor', 'qr-code-generator', 'file-size-calculator'],
  },
  {
    slug: 'qr-code-generator',
    name: 'QR Code Generator',
    short: 'Create QR codes for links, text, Wi-Fi, email and more. Download as PNG or SVG.',
    metaDescription:
      'Free QR code generator for URLs, text, Wi-Fi, email, phone and SMS. Customise colours and size, then download a PNG or SVG. No sign-up and no expiring links.',
    intro:
      'Create QR codes that work forever. LifeKit encodes your content directly into the code, so there are no redirect links that can expire or track scans. Choose colours and size, then download a crisp PNG or a scalable SVG for print.',
    category: 'generators',
    icon: 'QrCode',
    keywords: ['qr code', 'qr generator', 'wifi qr', 'url qr', 'barcode', 'qr svg'],
    badge: 'popular',
    handlesFiles: false,
    steps: [
      'Choose what the QR code should contain: a URL, plain text, Wi-Fi details, an email, a phone number or an SMS.',
      'Fill in the fields. The preview updates as you type.',
      'Adjust the colours, size and error-correction level if you like.',
      'Download the code as PNG for screens or SVG for print, and test it with your phone camera.',
    ],
    faqs: [
      {
        q: 'Do these QR codes expire?',
        a: 'No. The content is stored in the code itself rather than behind a short link, so it keeps working for as long as the destination exists.',
      },
      {
        q: 'Why won’t my coloured QR code scan?',
        a: 'Scanners need strong contrast between the dark modules and the background. Keep the foreground darker than the background. LifeKit warns you when the contrast looks too low.',
      },
      {
        q: 'What is error correction?',
        a: 'QR codes include redundant data so they still scan when partly damaged or covered. Higher levels are more robust but make the pattern denser. “Medium” suits most uses; choose “High” if the code will be printed on rough surfaces.',
      },
      {
        q: 'PNG or SVG?',
        a: 'PNG is ideal for websites, documents and messages. SVG is a vector format that stays sharp at any size, which makes it the better choice for posters, packaging and professional printing.',
      },
    ],
    related: ['password-generator', 'text-formatter', 'image-converter'],
  },
  {
    slug: 'password-generator',
    name: 'Password Generator',
    short: 'Generate strong random passwords using your browser’s secure random generator.',
    metaDescription:
      'Generate strong, random passwords with a cryptographically secure generator. Choose length and character types, exclude look-alike characters, and copy in one click.',
    intro:
      'Create strong, unique passwords for every account. Passwords are generated on your device with the Web Crypto API, the same source of randomness browsers use for encryption. Nothing is stored or sent anywhere.',
    category: 'generators',
    icon: 'KeyRound',
    keywords: ['password generator', 'random password', 'strong password', 'secure password', 'passcode'],
    badge: 'popular',
    handlesFiles: false,
    steps: [
      'Choose a length. 16 characters or more is a good default.',
      'Select the character types to include: uppercase, lowercase, numbers and symbols.',
      'Turn on “Exclude look-alike characters” if you will type the password by hand.',
      'Copy the password and save it in your password manager.',
    ],
    faqs: [
      {
        q: 'Are generated passwords stored or sent anywhere?',
        a: 'No. Passwords exist only in this page’s memory while it is open. They are never saved to your browser storage and never transmitted.',
      },
      {
        q: 'How is the strength calculated?',
        a: 'The meter estimates entropy: the number of possible passwords given the length and the characters allowed, expressed in bits. Every extra bit doubles the number of guesses an attacker would need.',
      },
      {
        q: 'How long should my password be?',
        a: 'For accounts protected by a password manager, 16–20 random characters is plenty. Length adds more strength than complexity, so if a site limits symbols, make the password longer.',
      },
      {
        q: 'What are look-alike characters?',
        a: 'Characters that are easy to confuse, such as the letter O and the number 0, or lowercase l, uppercase I and the number 1. Excluding them makes passwords easier to read and type, at a small cost in strength.',
      },
    ],
    related: ['qr-code-generator', 'text-formatter', 'word-counter'],
  },
  {
    slug: 'unit-converter',
    name: 'Unit Converter',
    short: 'Convert length, weight, temperature, area, volume, speed, time and data units.',
    metaDescription:
      'Accurate unit converter for length, weight, temperature, area, volume, speed, time and digital storage. Metric and imperial units with instant results.',
    intro:
      'Convert between metric, imperial and US customary units instantly. Every conversion uses exact internationally agreed factors, and you can see the result in all other units of the same type at a glance.',
    category: 'calculators',
    icon: 'Ruler',
    keywords: ['unit converter', 'metric', 'imperial', 'cm to inches', 'kg to lbs', 'celsius to fahrenheit', 'mph to kmh', 'liters to gallons'],
    badge: 'popular',
    handlesFiles: false,
    steps: [
      'Pick a category such as length or temperature.',
      'Enter a value and choose the unit you are converting from.',
      'Choose the unit to convert to. The result updates instantly.',
      'Scroll down to see the same value in every other unit, or use the swap button to reverse the conversion.',
    ],
    faqs: [
      {
        q: 'How accurate are the conversions?',
        a: 'Conversions use exact definitions where they exist (for example, 1 inch is exactly 2.54 cm and 1 pound is exactly 0.45359237 kg). Results are rounded for display to a sensible number of significant figures.',
      },
      {
        q: 'Are gallons US or UK?',
        a: 'Both are available and labelled. A US gallon is 3.785 litres; a UK (imperial) gallon is 4.546 litres. The same applies to fluid ounces and pints.',
      },
      {
        q: 'Which data storage units are used?',
        a: 'Both decimal units (KB, MB, GB, where 1 KB = 1,000 bytes) and binary units (KiB, MiB, GiB, where 1 KiB = 1,024 bytes) are listed, so you can match whatever your software reports.',
      },
    ],
    related: ['percentage-calculator', 'file-size-calculator', 'time-zone-converter'],
  },
  {
    slug: 'word-counter',
    name: 'Word & Character Counter',
    short: 'Count words, characters, sentences and paragraphs, with reading time.',
    metaDescription:
      'Free word counter and character counter. See words, characters with and without spaces, sentences, paragraphs and reading time as you type. Text stays on your device.',
    intro:
      'Check essays, social posts, meta descriptions and assignments against length limits. Counts update as you type and work for most languages. Your text is never uploaded.',
    category: 'calculators',
    icon: 'Type',
    keywords: ['word count', 'character count', 'letter count', 'reading time', 'sentence counter', 'essay length'],
    badge: 'popular',
    handlesFiles: false,
    steps: [
      'Type or paste your text into the box.',
      'Read the live counts for words, characters, sentences and paragraphs.',
      'Use the reading and speaking time estimates to plan presentations or articles.',
      'Copy the text or clear the box when you are done.',
    ],
    faqs: [
      {
        q: 'How are words counted?',
        a: 'LifeKit uses your browser’s built-in language-aware word segmentation, so hyphenated words, contractions and languages without spaces (such as Chinese or Japanese) are handled sensibly. Numbers count as words; punctuation does not.',
      },
      {
        q: 'How is reading time estimated?',
        a: 'Reading time assumes about 238 words per minute, an average for adults reading non-fiction in English. Speaking time assumes about 150 words per minute.',
      },
      {
        q: 'Do emoji count as one character?',
        a: 'Yes. Characters are counted as they appear on screen, so an emoji or an accented letter counts as one, even if it is stored as several code units internally.',
      },
      {
        q: 'Is my text saved?',
        a: 'No. The text stays in this page only and is gone when you leave or refresh.',
      },
    ],
    related: ['text-formatter', 'percentage-calculator', 'password-generator'],
  },
  {
    slug: 'percentage-calculator',
    name: 'Percentage Calculator',
    short: 'Percentages of numbers, percentage change, increase, decrease and difference.',
    metaDescription:
      'Quick percentage calculator: find X% of a number, what percent one number is of another, percentage increase, decrease and difference, with the formula shown.',
    intro:
      'Work out discounts, tips, grades, growth and price changes without second-guessing the formula. Each calculator shows its working so you can check the maths.',
    category: 'calculators',
    icon: 'Percent',
    keywords: ['percentage', 'percent of', 'percent change', 'percentage increase', 'percentage decrease', 'discount', 'tip'],
    handlesFiles: false,
    steps: [
      'Choose the calculation you need.',
      'Enter the two numbers. Results appear as you type.',
      'Check the formula shown under the result if you want to see how it was calculated.',
      'Copy the result with one click.',
    ],
    faqs: [
      {
        q: 'What is the difference between percentage change and percentage difference?',
        a: 'Percentage change compares a new value to an original one, so direction matters. Percentage difference compares two values with no “before” or “after”, dividing the gap by their average.',
      },
      {
        q: 'Why is a 50% increase followed by a 50% decrease not the same number?',
        a: 'Because the second percentage applies to a different base. 100 increased by 50% is 150; 150 decreased by 50% is 75.',
      },
      {
        q: 'How do I calculate a discount?',
        a: 'Use “What is X% of Y” to find the discount amount, or “Percentage decrease” to find what discount a sale price represents.',
      },
    ],
    related: ['unit-converter', 'age-calculator', 'word-counter'],
  },
  {
    slug: 'age-calculator',
    name: 'Age Calculator',
    short: 'Exact age in years, months and days, plus your next birthday.',
    metaDescription:
      'Calculate exact age in years, months and days from a date of birth. See total days lived, the day of the week you were born and a countdown to your next birthday.',
    intro:
      'Find an exact age for forms, milestones or curiosity. Enter a date of birth to see the age in years, months and days, the total time lived, and how long until the next birthday.',
    category: 'calculators',
    icon: 'Cake',
    keywords: ['age calculator', 'how old am i', 'date of birth', 'birthday countdown', 'days alive', 'date difference'],
    handlesFiles: false,
    steps: [
      'Enter the date of birth.',
      'Optionally change “Age on” to calculate an age at a past or future date.',
      'Read the exact age, totals and next-birthday countdown.',
    ],
    faqs: [
      {
        q: 'How are months and days counted?',
        a: 'Age is counted the way people usually say it: full years first, then full months, then the remaining days. If the day of the month has not been reached yet, the days are counted from the same day in the previous month.',
      },
      {
        q: 'What about people born on 29 February?',
        a: 'In years without a 29 February, this calculator treats 28 February as the birthday. Legal conventions vary by country, so check local rules if it matters for official purposes.',
      },
      {
        q: 'Is my date of birth stored?',
        a: 'No. The calculation runs in your browser and nothing is saved.',
      },
    ],
    related: ['time-zone-converter', 'percentage-calculator', 'unit-converter'],
  },
  {
    slug: 'time-zone-converter',
    name: 'Time Zone Converter',
    short: 'Convert a date and time between any two time zones, DST included.',
    metaDescription:
      'Convert times between time zones worldwide with automatic daylight saving time handling. See both local times, UTC offsets and whether the date changes.',
    intro:
      'Schedule calls and meetings across the world without the mental arithmetic. LifeKit uses your browser’s time-zone database, so daylight saving changes and historic rules are applied automatically for the exact date you pick.',
    category: 'calculators',
    icon: 'Globe',
    keywords: ['time zone converter', 'timezone', 'world clock', 'utc', 'gmt', 'est to pst', 'meeting planner', 'daylight saving'],
    badge: 'new',
    handlesFiles: false,
    steps: [
      'Choose the date and time you want to convert, or click “Now”.',
      'Select the time zone that time belongs to (your own zone is preselected).',
      'Select the destination time zone.',
      'Read the converted time, including the UTC offsets and whether it falls on a different day.',
    ],
    faqs: [
      {
        q: 'Does this account for daylight saving time?',
        a: 'Yes. Offsets are calculated for the specific date you enter using the IANA time-zone database built into your browser, so summer and winter times are handled automatically.',
      },
      {
        q: 'What happens with times skipped by daylight saving?',
        a: 'When clocks spring forward, some local times never happen (for example 02:30 in New York on the second Sunday of March). LifeKit flags these and shows the nearest valid time. For repeated times when clocks go back, the first occurrence is used.',
      },
      {
        q: 'Why are cities listed instead of abbreviations like EST?',
        a: 'Abbreviations are ambiguous (CST can mean Central Standard Time or China Standard Time) and do not capture daylight saving rules. City-based zones such as America/New_York are precise.',
      },
    ],
    related: ['age-calculator', 'unit-converter', 'percentage-calculator'],
  },
  {
    slug: 'text-formatter',
    name: 'Text Formatting Tools',
    short: 'Change case, remove extra spaces and duplicates, sort and reverse text.',
    metaDescription:
      'Free text tools: convert to uppercase, lowercase, title case or sentence case, remove extra spaces and duplicate lines, sort lines and reverse text instantly.',
    intro:
      'Tidy up copied text in a click. Fix accidental caps lock, clean messy spacing from PDFs, deduplicate lists and sort lines alphabetically. Everything runs in your browser.',
    category: 'text',
    icon: 'CaseSensitive',
    keywords: ['uppercase', 'lowercase', 'title case', 'sentence case', 'remove spaces', 'remove duplicates', 'sort lines', 'reverse text', 'case converter'],
    handlesFiles: false,
    steps: [
      'Paste your text into the input box.',
      'Click a formatting action. The result appears in the output box.',
      'Chain actions by clicking “Use as input”, then apply another action.',
      'Copy the output or clear both boxes.',
    ],
    faqs: [
      {
        q: 'How does title case handle short words?',
        a: 'Short words such as “a”, “and”, “of” and “the” stay lowercase unless they are the first or last word, following common English style guides.',
      },
      {
        q: 'Is duplicate removal case-sensitive?',
        a: 'Yes by default, so “Apple” and “apple” are kept as different lines. Tick “Ignore case” to treat them as duplicates. The first occurrence of each line is kept in its original position.',
      },
      {
        q: 'How are lines sorted?',
        a: 'Lines are sorted alphabetically using your browser’s language rules, so accented letters and numbers sort naturally (for example “item 2” comes before “item 10”).',
      },
    ],
    related: ['word-counter', 'password-generator', 'qr-code-generator'],
  },
  {
    slug: 'file-size-calculator',
    name: 'File Size Calculator',
    short: 'Convert bytes, KB, MB, GB and TB in both decimal and binary units.',
    metaDescription:
      'Convert file sizes between bytes, KB, MB, GB and TB, plus binary KiB, MiB, GiB and TiB. Understand why a 1 TB drive shows 931 GB.',
    intro:
      'Storage makers, operating systems and apps measure sizes differently. Enter any size to see it in every common unit, and learn why the same file can be “100 MB” in one place and “95.4 MB” in another.',
    category: 'files',
    icon: 'HardDrive',
    keywords: ['file size', 'bytes', 'kb to mb', 'mb to gb', 'gb to tb', 'kib', 'mib', 'gib', 'storage converter'],
    badge: 'new',
    handlesFiles: false,
    steps: [
      'Enter a number and choose its unit.',
      'See the size converted into every decimal and binary unit.',
      'Read the explainer below to understand which unit your device is using.',
    ],
    faqs: [
      {
        q: 'What is the difference between KB and KiB?',
        a: 'A kilobyte (KB) is 1,000 bytes, following the metric system. A kibibyte (KiB) is 1,024 bytes, a power of two. The gap grows with each step: 1 GiB is about 7.4% larger than 1 GB, and 1 TiB is about 10% larger than 1 TB.',
      },
      {
        q: 'Why does my new 1 TB drive show about 931 GB?',
        a: 'The drive maker counts 1 TB as 1,000,000,000,000 bytes. Windows divides by 1,024 repeatedly but still labels the result “GB”, giving 931. macOS uses decimal units and shows close to 1 TB.',
      },
      {
        q: 'Which unit does my computer use?',
        a: 'Windows shows binary sizes with decimal labels (KB, MB, GB). macOS, iOS and most Linux file managers use decimal units. Many technical tools use the explicit binary labels KiB, MiB and GiB.',
      },
    ],
    related: ['unit-converter', 'pdf-compressor', 'image-compressor'],
  },
];

export const toolsBySlug: Record<string, Tool> = Object.fromEntries(tools.map((t) => [t.slug, t]));

export function getCategory(id: CategoryId): Category {
  const c = categories.find((cat) => cat.id === id);
  if (!c) throw new Error(`Unknown category ${id}`);
  return c;
}
