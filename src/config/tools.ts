/**
 * Central tool registry. Everything about a tool except its interface lives here:
 * metadata, SEO copy, instructions, FAQs and related tools.
 *
 * This file must stay free of runtime imports so the build script
 * (scripts/generate-sitemap.mjs) can read it directly with Node.
 */

export type CategoryId = 'pdf' | 'image' | 'generators' | 'calculators' | 'time' | 'text' | 'media' | 'developer' | 'fun' | 'files';

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
  | 'Folder'
  | 'Timer'
  | 'Watch'
  | 'AlarmClock'
  | 'Coffee'
  | 'Volume2'
  | 'Tag'
  | 'Receipt'
  | 'HeartPulse'
  | 'Landmark'
  | 'GraduationCap'
  | 'CalendarDays'
  | 'FileImage'
  | 'Images'
  | 'FileType'
  | 'Presentation'
  | 'RotateCw'
  | 'Clock'
  | 'Scaling'
  | 'Crop'
  | 'Minimize2'
  | 'ScanText'
  | 'Pipette'
  | 'PenLine'
  | 'ListOrdered'
  | 'Stamp'
  | 'AudioLines'
  | 'StickyNote'
  | 'ListTodo'
  | 'GitCompare'
  | 'Pilcrow'
  | 'Keyboard'
  | 'ChartPie'
  | 'Dices'
  | 'Barcode'
  | 'Sigma'
  | 'TrendingUp'
  | 'PiggyBank'
  | 'BadgePercent'
  | 'School'
  | 'Flame'
  | 'Braces'
  | 'Binary'
  | 'Hash'
  | 'Fingerprint'
  | 'ScreenShare'
  | 'Mic'
  | 'Video'
  | 'Code'
  | 'PenTool'
  | 'CalendarCheck'
  | 'WandSparkles'
  | 'WholeWord'
  | 'Repeat2'
  | 'MessageCircle'
  | 'IndianRupee'
  | 'Fuel'
  | 'BedDouble'
  | 'Hourglass'
  | 'Earth'
  | 'Zap'
  | 'MousePointerClick'
  | 'Users'
  | 'Hexagon'
  | 'Regex'
  | 'FileArchive'
  | 'IdCard'
  | 'Smartphone'
  | 'ScanQrCode'
  | 'Captions'
  | 'LayoutGrid'
  | 'Grid3x3'
  | 'EyeOff'
  | 'AppWindow'
  | 'ReceiptText'
  | 'FileUser'
  | 'Gamepad2'
  | 'BookOpenCheck';

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
  /** Overrides the default privacy line when data leaves the device (e.g. browser speech services). */
  privacyNote?: string;
  steps: string[];
  faqs: Faq[];
  related: string[];
}

export const categories: Category[] = [
  { id: 'pdf', name: 'PDF & Documents', description: 'Merge, compress, convert and sign PDFs, plus invoices and resumes.', icon: 'FileText' },
  { id: 'image', name: 'Image Tools', description: 'Resize, crop, compress, convert and read text from images.', icon: 'Image' },
  { id: 'generators', name: 'Generators', description: 'QR codes, barcodes, passwords, random picks and more.', icon: 'Sparkles' },
  {
    id: 'calculators',
    name: 'Calculators & Converters',
    description: 'Everyday maths, money, health, dates and unit conversions.',
    icon: 'Calculator',
  },
  { id: 'time', name: 'Time & Timers', description: 'Timer, stopwatch, alarm clock and study timer.', icon: 'Clock' },
  { id: 'text', name: 'Text & Writing', description: 'Notes, to-dos, voice typing, word counts and text tools.', icon: 'TextCursorInput' },
  { id: 'media', name: 'Audio & Video', description: 'Record your screen or voice.', icon: 'Video' },
  { id: 'fun', name: 'Fun & Games', description: 'Spin the wheel, typing and reaction tests, dice, teams and counters.', icon: 'Gamepad2' },
  { id: 'developer', name: 'Developer Tools', description: 'JSON, Base64, hashes, UUIDs, regex and number bases.', icon: 'Code' },
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
  {
    slug: 'pdf-to-word',
    name: 'PDF to Word',
    short: 'Turn a PDF into an editable Word document (.docx).',
    metaDescription:
      'Convert PDF to Word for free. Get an editable .docx with your text and headings, created in your browser so the PDF is never uploaded. No sign-up.',
    intro:
      'Need to edit a PDF? Convert it into a Word document and change the text in Word, Google Docs or Pages. LifeKit extracts the text and headings page by page and builds a clean .docx on your device.',
    category: 'pdf',
    icon: 'FileType',
    keywords: ['pdf to word', 'pdf to docx', 'convert pdf to word', 'edit pdf', 'pdf to doc', 'pdf converter'],
    badge: 'new',
    handlesFiles: true,
    steps: [
      'Drop a PDF into the upload area.',
      'Click “Convert to Word”.',
      'Download the .docx file and open it in Word, Google Docs, Pages or LibreOffice.',
      'Check the formatting and adjust fonts or spacing if needed.',
    ],
    faqs: [
      {
        q: 'Will it look exactly like the PDF?',
        a: 'The text, paragraphs and headings come across in reading order, each PDF page on its own page. Complex layouts such as multiple columns, text boxes, special fonts and images are simplified, so expect to tidy the formatting a little.',
      },
      {
        q: 'Why is my Word file empty?',
        a: 'Scanned PDFs are photos of pages, so they contain no actual text to extract. Converting those needs OCR (text recognition), which this tool does not do.',
      },
      {
        q: 'Is my PDF uploaded?',
        a: 'No. The conversion runs entirely in your browser and the file never leaves your device.',
      },
    ],
    related: ['word-to-pdf', 'pdf-to-powerpoint', 'pdf-to-images'],
  },
  {
    slug: 'word-to-pdf',
    name: 'Word to PDF',
    short: 'Convert Word documents (.docx) to PDF in your browser.',
    metaDescription:
      'Convert Word to PDF for free. Turn .docx files into PDFs with headings, lists, tables and images kept, without uploading your document. No sign-up.',
    intro:
      'Turn a Word document into a PDF that looks the same on every device and is ready to email, print or submit. The conversion runs on your device, so private documents stay private.',
    category: 'pdf',
    icon: 'FileText',
    keywords: ['word to pdf', 'docx to pdf', 'convert word to pdf', 'doc to pdf', 'save as pdf'],
    badge: 'new',
    handlesFiles: true,
    steps: [
      'Drop a Word document (.docx) into the upload area.',
      'Click “Convert to PDF”.',
      'Preview the result and download the PDF.',
    ],
    faqs: [
      {
        q: 'What is kept from my document?',
        a: 'Headings, paragraphs, bold, italic, underline, bulleted and numbered lists, links, tables and PNG or JPEG images. Page layout features such as headers, footers, columns, text boxes and custom fonts are not reproduced exactly.',
      },
      {
        q: 'Can I convert old .doc files?',
        a: 'Only the modern .docx format is supported. Open a .doc file in Word, Google Docs or LibreOffice and save it as .docx first.',
      },
      {
        q: 'Need a pixel-perfect PDF?',
        a: 'For an exact copy of a complex layout, use “Save as PDF” or “Export to PDF” in Word, Google Docs or Pages. They have the original fonts and layout engine.',
      },
    ],
    related: ['pdf-to-word', 'pdf-merger', 'pdf-compressor'],
  },
  {
    slug: 'pdf-to-powerpoint',
    name: 'PDF to PowerPoint',
    short: 'Turn each PDF page into a slide in a .pptx presentation.',
    metaDescription:
      'Convert PDF to PowerPoint for free. Every page becomes a full-slide image in a .pptx file you can present or add notes to. Private, in-browser conversion.',
    intro:
      'Present a PDF as a slideshow. Each page becomes a slide in a PowerPoint file you can open in PowerPoint, Google Slides or Keynote, add notes to, or mix with your own slides.',
    category: 'pdf',
    icon: 'Presentation',
    keywords: ['pdf to ppt', 'pdf to powerpoint', 'pdf to pptx', 'pdf to slides', 'convert pdf to presentation'],
    badge: 'new',
    handlesFiles: true,
    steps: [
      'Drop a PDF into the upload area.',
      'Choose the image quality for the slides.',
      'Click “Convert to PowerPoint” and download the .pptx file.',
    ],
    faqs: [
      {
        q: 'Can I edit the text on the slides?',
        a: 'Each slide is a high-quality picture of the PDF page, so the text itself is not editable. You can add new text boxes, notes and slides on top. For editable text, try PDF to Word.',
      },
      {
        q: 'What slide size is used?',
        a: 'The slide size matches the shape of your PDF’s first page, so standard documents and widescreen slide exports both fit without stretching.',
      },
      {
        q: 'Is it private?',
        a: 'Yes. Pages are rendered in your browser and the presentation is built on your device.',
      },
    ],
    related: ['pdf-to-images', 'pdf-to-word', 'pdf-splitter'],
  },
  {
    slug: 'images-to-pdf',
    name: 'Images to PDF',
    short: 'Combine JPG, PNG and other photos into one PDF.',
    metaDescription:
      'Convert JPG, PNG and WebP images to PDF for free. Reorder photos, choose A4 or Letter pages and download one PDF. Perfect for scans and receipts. No uploads.',
    intro:
      'Turn photos of documents, receipts or homework into a single tidy PDF. Put the pages in order, pick a page size and download. Everything happens on your device.',
    category: 'pdf',
    icon: 'FileImage',
    keywords: ['jpg to pdf', 'image to pdf', 'png to pdf', 'photo to pdf', 'pictures to pdf', 'scan to pdf'],
    badge: 'popular',
    handlesFiles: true,
    steps: [
      'Add your images (JPG, PNG, WebP and more).',
      'Drag them into the right order, or use the arrows.',
      'Choose a page size: fit to image, A4 or Letter.',
      'Click “Create PDF” and download it.',
    ],
    faqs: [
      {
        q: 'Which page size should I choose?',
        a: '“A4” or “Letter” gives standard pages that print well, with each photo scaled to fit. “Fit to image” makes each page exactly the size of its photo.',
      },
      {
        q: 'Are my photos rotated correctly?',
        a: 'Yes. LifeKit reads the orientation stored by your phone camera, so portrait photos stay upright.',
      },
      {
        q: 'Can I convert iPhone HEIC photos?',
        a: 'Only if your browser can open HEIC, which Safari on Mac and iPhone usually can. Otherwise set your camera to “Most Compatible” to take JPGs.',
      },
    ],
    related: ['pdf-merger', 'image-compressor', 'pdf-to-images'],
  },
  {
    slug: 'pdf-to-images',
    name: 'PDF to Images',
    short: 'Save PDF pages as JPG or PNG images.',
    metaDescription:
      'Convert PDF to JPG or PNG for free. Choose the quality, then download pages one by one or all together as a ZIP. Runs in your browser with no uploads.',
    intro:
      'Turn PDF pages into images you can post, message or insert into a presentation. Pick JPG or PNG and the resolution, then download individual pages or a ZIP of all of them.',
    category: 'pdf',
    icon: 'Images',
    keywords: ['pdf to jpg', 'pdf to png', 'pdf to image', 'convert pdf to picture', 'pdf page to image'],
    handlesFiles: true,
    steps: [
      'Drop a PDF into the upload area.',
      'Choose JPG or PNG and the image quality.',
      'Click “Convert” and download single pages or all pages as a ZIP.',
    ],
    faqs: [
      {
        q: 'JPG or PNG?',
        a: 'JPG gives smaller files and suits most documents and photos. PNG is lossless and keeps small text and line drawings perfectly sharp, at a larger file size.',
      },
      {
        q: 'What resolution should I use?',
        a: '150 DPI is ideal for screens and messaging. Choose 300 DPI if you plan to print the images.',
      },
      {
        q: 'Is my PDF uploaded?',
        a: 'No. Pages are rendered by your browser on your device.',
      },
    ],
    related: ['images-to-pdf', 'pdf-to-powerpoint', 'image-compressor'],
  },
  {
    slug: 'organize-pdf',
    name: 'Rotate & Organize PDF',
    short: 'Rotate, delete and reorder PDF pages visually.',
    metaDescription:
      'Rotate PDF pages, delete pages you don’t need and drag pages into a new order. Free, visual and private: your PDF is edited in your browser.',
    intro:
      'Fix sideways scans, remove blank or unwanted pages and put pages in the right order, all with page previews. Save the result as a new PDF in one click.',
    category: 'pdf',
    icon: 'RotateCw',
    keywords: ['rotate pdf', 'delete pdf pages', 'remove pages from pdf', 'reorder pdf pages', 'organize pdf', 'turn pdf page'],
    handlesFiles: true,
    steps: [
      'Drop a PDF into the upload area. Page previews appear.',
      'Use the rotate button on any page, or rotate all pages at once.',
      'Delete pages you don’t want and move pages with the arrows.',
      'Click “Save PDF” and download the result.',
    ],
    faqs: [
      {
        q: 'Does rotating reduce quality?',
        a: 'No. Pages are copied as they are and only their orientation setting changes, so text and images stay sharp.',
      },
      {
        q: 'Can I undo a deleted page?',
        a: 'Yes. Deleted pages stay greyed out until you save, so you can restore them with one click.',
      },
      {
        q: 'Is it private?',
        a: 'Yes. Your PDF is edited in your browser and never uploaded.',
      },
    ],
    related: ['pdf-splitter', 'pdf-merger', 'pdf-compressor'],
  },
  {
    slug: 'calculator',
    name: 'Calculator',
    short: 'A simple online calculator with history and keyboard support.',
    metaDescription:
      'Free online calculator for everyday maths: add, subtract, multiply, divide, percentages and brackets, with a calculation history and keyboard support.',
    intro:
      'A clean, fast calculator for everyday sums. Use the buttons or your keyboard, work with brackets and percentages, and look back at your recent calculations.',
    category: 'calculators',
    icon: 'Calculator',
    keywords: ['calculator', 'online calculator', 'basic calculator', 'simple calculator', 'percentage calculator', 'math'],
    badge: 'popular',
    handlesFiles: false,
    steps: [
      'Tap the buttons or type with your keyboard (numbers, + − × ÷, brackets, %).',
      'Press = or Enter to see the result.',
      'Tap a line in the history to reuse a result.',
    ],
    faqs: [
      {
        q: 'How does the % key work?',
        a: 'Like a pocket calculator: 200 + 10% gives 220 (adds 10% of 200), 200 − 10% gives 180, and 200 × 10% gives 20.',
      },
      {
        q: 'Which keyboard keys can I use?',
        a: 'Numbers, + − * /, brackets, % and the decimal point. Enter or = calculates, Backspace deletes the last character and Escape clears everything.',
      },
      {
        q: 'Does it follow the order of operations?',
        a: 'Yes. Multiplication and division happen before addition and subtraction, and brackets are worked out first, so 2 + 3 × 4 = 14.',
      },
    ],
    related: ['percentage-calculator', 'discount-calculator', 'unit-converter'],
  },
  {
    slug: 'discount-calculator',
    name: 'Discount Calculator',
    short: 'Find the sale price and how much you save.',
    metaDescription:
      'Free discount calculator: enter a price and percentage off to see the sale price and savings. Supports extra discounts and sales tax.',
    intro:
      'Shopping a sale? Enter the original price and the discount to see exactly what you will pay and how much you save, including stacked “extra 10% off” deals and sales tax.',
    category: 'calculators',
    icon: 'Tag',
    keywords: ['discount calculator', 'sale price', 'percent off', 'how much is 20 off', 'savings calculator'],
    handlesFiles: false,
    steps: ['Enter the original price.', 'Enter the discount percentage.', 'Optionally add an extra discount or sales tax to see the final price.'],
    faqs: [
      {
        q: 'Is 20% off plus an extra 10% the same as 30% off?',
        a: 'No. The extra discount applies to the already reduced price, so 20% then 10% off is 28% off in total. The calculator shows the combined percentage.',
      },
      {
        q: 'Is tax added before or after the discount?',
        a: 'After. Sales tax is usually charged on the discounted price, which is how this calculator works.',
      },
    ],
    related: ['tip-calculator', 'percentage-calculator', 'calculator'],
  },
  {
    slug: 'tip-calculator',
    name: 'Tip Calculator',
    short: 'Work out the tip and split the bill between friends.',
    metaDescription:
      'Free tip calculator: choose a tip percentage, split the bill between any number of people and round up. See the tip, total and amount per person.',
    intro:
      'End the awkward bill maths. Enter the bill, choose a tip and the number of people, and see exactly what everyone owes, with an option to round up to a whole amount.',
    category: 'calculators',
    icon: 'Receipt',
    keywords: ['tip calculator', 'split bill', 'gratuity', 'bill splitter', 'restaurant tip'],
    handlesFiles: false,
    steps: ['Enter the bill amount.', 'Pick a tip percentage or type your own.', 'Set the number of people to split the bill.'],
    faqs: [
      {
        q: 'How much should I tip?',
        a: 'Customs vary by country. In the US 15–20% is common at restaurants; in many other countries tipping is smaller or optional, or a service charge is already included.',
      },
      {
        q: 'What does “Round up” do?',
        a: 'It rounds each person’s share up to the next whole amount, so nobody has to deal with coins. The extra goes to the tip.',
      },
    ],
    related: ['discount-calculator', 'percentage-calculator', 'calculator'],
  },
  {
    slug: 'bmi-calculator',
    name: 'BMI Calculator',
    short: 'Calculate your body mass index in metric or imperial units.',
    metaDescription:
      'Free BMI calculator for adults. Enter height and weight in metric or imperial units to see your BMI, its WHO category and the healthy weight range for your height.',
    intro:
      'Body mass index (BMI) is a quick screening measure that compares weight with height. Enter yours in kilograms and centimetres or pounds and feet to see your BMI and the healthy weight range for your height.',
    category: 'calculators',
    icon: 'HeartPulse',
    keywords: ['bmi calculator', 'body mass index', 'healthy weight', 'bmi chart', 'weight calculator'],
    handlesFiles: false,
    steps: ['Choose metric or imperial units.', 'Enter your height and weight.', 'Read your BMI, its category and your healthy weight range.'],
    faqs: [
      {
        q: 'What do the BMI categories mean?',
        a: 'For adults the WHO uses: under 18.5 underweight, 18.5–24.9 healthy weight, 25–29.9 overweight and 30 or more obesity.',
      },
      {
        q: 'Is BMI accurate for everyone?',
        a: 'No. BMI does not distinguish muscle from fat, and it does not apply to children, teenagers or pregnancy. Treat it as a rough guide, not a diagnosis, and talk to a health professional for advice.',
      },
      {
        q: 'Is my data saved?',
        a: 'No. The calculation happens in your browser and nothing is stored.',
      },
    ],
    related: ['unit-converter', 'age-calculator', 'percentage-calculator'],
  },
  {
    slug: 'loan-calculator',
    name: 'Loan & EMI Calculator',
    short: 'Monthly payment, total interest and a yearly breakdown.',
    metaDescription:
      'Free loan and EMI calculator. Enter the amount, interest rate and term to see your monthly payment, total interest and a year-by-year repayment schedule.',
    intro:
      'Planning a car loan, personal loan or mortgage? See your monthly payment (EMI), how much interest you will pay in total, and how the balance falls year by year.',
    category: 'calculators',
    icon: 'Landmark',
    keywords: ['loan calculator', 'emi calculator', 'mortgage calculator', 'monthly payment', 'interest calculator', 'car loan'],
    handlesFiles: false,
    steps: ['Enter the loan amount.', 'Enter the yearly interest rate.', 'Enter the term in years or months and read your monthly payment and schedule.'],
    faqs: [
      {
        q: 'What is EMI?',
        a: 'EMI stands for equated monthly instalment: the fixed amount you pay each month, covering both interest and part of the loan itself.',
      },
      {
        q: 'Why do I pay more interest at the start?',
        a: 'Interest is charged on the remaining balance, which is highest at the beginning. As you repay, more of each payment goes towards the loan itself.',
      },
      {
        q: 'Are these figures exact?',
        a: 'They follow the standard amortisation formula with monthly compounding. Your lender’s figures may differ slightly because of fees, insurance or how they round.',
      },
    ],
    related: ['percentage-calculator', 'calculator', 'discount-calculator'],
  },
  {
    slug: 'gpa-calculator',
    name: 'GPA Calculator',
    short: 'Calculate your grade point average from your courses.',
    metaDescription:
      'Free GPA calculator. Add your courses, credits and letter grades to get your semester GPA on a 4.0 scale, and include previous credits for your cumulative GPA.',
    intro:
      'Add your courses with their credits and grades to see your GPA instantly. Include your previous GPA and credits to find your cumulative GPA.',
    category: 'calculators',
    icon: 'GraduationCap',
    keywords: ['gpa calculator', 'grade point average', 'college gpa', 'cumulative gpa', 'semester gpa', '4.0 scale'],
    handlesFiles: false,
    steps: ['Add each course with its credits and letter grade.', 'Optionally enter your previous GPA and credits.', 'Read your semester and cumulative GPA.'],
    faqs: [
      {
        q: 'Which grading scale is used?',
        a: 'The common US 4.0 scale: A/A+ = 4.0, A− = 3.7, B+ = 3.3, B = 3.0 and so on down to F = 0. You can also enter grade points directly if your school uses another scale.',
      },
      {
        q: 'How is GPA weighted?',
        a: 'Each grade is multiplied by the course credits, added up, and divided by the total credits, so a 4-credit course counts more than a 1-credit course.',
      },
    ],
    related: ['percentage-calculator', 'calculator', 'word-counter'],
  },
  {
    slug: 'date-calculator',
    name: 'Date Calculator',
    short: 'Days between two dates, or add and subtract days.',
    metaDescription:
      'Free date calculator: count the days, weeks and working days between two dates, or add and subtract days, weeks, months and years from any date.',
    intro:
      'How many days until a deadline or holiday? What date is 90 days from now? Count the time between two dates, including working days, or add and subtract time from any date.',
    category: 'calculators',
    icon: 'CalendarDays',
    keywords: ['date calculator', 'days between dates', 'days until', 'add days to date', 'business days', 'countdown'],
    handlesFiles: false,
    steps: ['Choose “Between dates” or “Add or subtract”.', 'Pick your dates or the amount of time.', 'Read the result in days, weeks, months and working days.'],
    faqs: [
      {
        q: 'Are both dates included?',
        a: 'The count includes the start date but not the end date, which is how “days between” is usually calculated. Tick “Include end date” to count both.',
      },
      {
        q: 'What are working days?',
        a: 'Monday to Friday. Public holidays are not excluded because they differ between countries.',
      },
    ],
    related: ['age-calculator', 'time-zone-converter', 'timer'],
  },
  {
    slug: 'timer',
    name: 'Online Timer',
    short: 'A countdown timer with alarm sound and quick presets.',
    metaDescription:
      'Free online countdown timer with alarm. Set hours, minutes and seconds or use quick presets, then get an alert sound when time is up. Works on phone and desktop.',
    intro:
      'Set a countdown for cooking, workouts, exams or breaks. Choose a preset or type your own time, pick an alarm sound, and LifeKit alerts you when time is up.',
    category: 'time',
    icon: 'Timer',
    keywords: ['timer', 'countdown timer', 'online timer', 'set a timer', 'kitchen timer', '5 minute timer', '10 minute timer'],
    badge: 'new',
    handlesFiles: false,
    steps: ['Tap a preset or enter hours, minutes and seconds.', 'Press Start.', 'Keep this tab open. The alarm sounds when the countdown reaches zero.'],
    faqs: [
      {
        q: 'Will the alarm ring if I switch tabs?',
        a: 'Yes, as long as this page stays open in a browser tab. Some phones pause web pages when the screen locks, so keep the screen on for important timers.',
      },
      {
        q: 'Why can’t I hear anything?',
        a: 'Check your volume and silent switch. Browsers also need you to tap the page once before they allow sound, which pressing Start does.',
      },
    ],
    related: ['stopwatch', 'pomodoro-timer', 'alarm-clock'],
  },
  {
    slug: 'stopwatch',
    name: 'Stopwatch',
    short: 'An accurate online stopwatch with lap times.',
    metaDescription:
      'Free online stopwatch with lap times, accurate to a hundredth of a second. Start, pause, record laps and reset. Works on phone and desktop.',
    intro:
      'Time runs, workouts, speeches or experiments to a hundredth of a second. Record lap times and see your fastest and slowest laps highlighted.',
    category: 'time',
    icon: 'Watch',
    keywords: ['stopwatch', 'online stopwatch', 'lap timer', 'chronometer', 'time tracker'],
    handlesFiles: false,
    steps: ['Press Start.', 'Press Lap to record a split time.', 'Press Pause to stop, and Reset to start again.'],
    faqs: [
      {
        q: 'Is it accurate?',
        a: 'Yes. Time is measured from your device clock rather than by counting ticks, so it stays accurate even if the display updates slowly.',
      },
      {
        q: 'Does it keep running if I switch tabs?',
        a: 'Yes. The elapsed time is calculated from when you started, so it is correct when you come back.',
      },
    ],
    related: ['timer', 'pomodoro-timer', 'alarm-clock'],
  },
  {
    slug: 'alarm-clock',
    name: 'Online Alarm Clock',
    short: 'Set alarms that ring in your browser.',
    metaDescription:
      'Free online alarm clock. Set one or more alarms with labels and sounds, snooze when they ring, and see the current time in large digits.',
    intro:
      'Set alarms for reminders, naps or study sessions right in your browser. Add several alarms with labels, choose a sound, and snooze or stop them when they ring.',
    category: 'time',
    icon: 'AlarmClock',
    keywords: ['alarm clock', 'online alarm', 'set alarm', 'wake up alarm', 'reminder alarm'],
    handlesFiles: false,
    steps: ['Pick a time and an optional label.', 'Choose an alarm sound and press “Add alarm”.', 'Keep this tab open. The alarm rings at the set time.'],
    faqs: [
      {
        q: 'Will it wake me up if my phone is locked?',
        a: 'Not reliably. Websites cannot set alarms in your phone’s clock app, and many phones pause web pages when locked. For waking up, use your phone’s built-in alarm. This tool is ideal for reminders while you are at your device.',
      },
      {
        q: 'Are my alarms saved?',
        a: 'They are saved in this browser so they survive a refresh, but they only ring while this page is open.',
      },
    ],
    related: ['timer', 'pomodoro-timer', 'time-zone-converter'],
  },
  {
    slug: 'pomodoro-timer',
    name: 'Pomodoro Study Timer',
    short: 'Focus in timed sessions with automatic breaks.',
    metaDescription:
      'Free Pomodoro timer: 25-minute focus sessions with short and long breaks, adjustable lengths, a session counter and alert sounds. Great for studying and work.',
    intro:
      'The Pomodoro technique splits work into focused blocks with short breaks in between. Start a session, focus until the alarm, take your break, and let LifeKit keep count.',
    category: 'time',
    icon: 'Coffee',
    keywords: ['pomodoro timer', 'study timer', 'focus timer', 'productivity timer', '25 minute timer'],
    handlesFiles: false,
    steps: ['Adjust focus and break lengths if you like.', 'Press Start and focus until the alarm.', 'Take your break. After four sessions, enjoy a longer break.'],
    faqs: [
      {
        q: 'What is the Pomodoro technique?',
        a: 'A time-management method where you work for 25 minutes, take a 5-minute break, and after four rounds take a longer 15–30 minute break. The short deadlines make it easier to start and stay focused.',
      },
      {
        q: 'Can I change the lengths?',
        a: 'Yes. Set any focus, short-break and long-break length that suits you.',
      },
    ],
    related: ['timer', 'stopwatch', 'word-counter'],
  },
  {
    slug: 'text-to-speech',
    name: 'Text to Speech',
    short: 'Have any text read aloud in natural voices.',
    metaDescription:
      'Free text to speech online. Paste text and listen with your device’s voices, choose the language, speed and pitch. Private: your text is not uploaded.',
    intro:
      'Listen to articles, notes or essays instead of reading them. Paste your text, pick a voice, speed and pitch, and press Play. LifeKit uses the voices built into your device.',
    category: 'text',
    icon: 'Volume2',
    keywords: ['text to speech', 'read aloud', 'tts', 'text reader', 'speak text', 'voice reader'],
    badge: 'new',
    handlesFiles: false,
    steps: ['Type or paste your text.', 'Choose a voice, speed and pitch.', 'Press Play. Pause or stop at any time.'],
    faqs: [
      {
        q: 'Which voices are available?',
        a: 'The voices installed on your device and browser. Phones and Macs usually include natural-sounding voices for many languages; Chrome adds online voices from Google.',
      },
      {
        q: 'Can I download the audio as an MP3?',
        a: 'Not at the moment. Browsers play text-to-speech directly and do not let websites record it.',
      },
      {
        q: 'Is my text sent anywhere?',
        a: 'With your device’s built-in voices, text stays on your device. Some browsers’ online voices (for example Google voices in Chrome) are processed by that browser’s provider.',
      },
    ],
    related: ['word-counter', 'text-formatter', 'pomodoro-timer'],
  },
  // ---------- Batch 3: images ----------
  {
    slug: 'image-resizer',
    name: 'Image Resizer',
    short: 'Resize photos to exact pixels, a percentage or social media sizes.',
    metaDescription: 'Free image resizer: change a photo’s size in pixels or percent, or pick Instagram, YouTube, passport and profile picture presets. Private, no upload.',
    intro: 'Make any photo the exact size you need. Type the width and height, scale by a percentage, or pick a ready-made size for Instagram, YouTube, WhatsApp, LinkedIn or a passport photo.',
    category: 'image', icon: 'Scaling',
    keywords: ['resize image', 'image resizer', 'resize photo', 'change image size', 'instagram size', 'resize to 1080x1080', 'passport photo size', 'reduce image dimensions'],
    badge: 'popular', handlesFiles: true,
    steps: ['Drop an image into the box.', 'Choose pixels, percent or a preset size.', 'Pick the format and quality, then press “Resize image”.', 'Download your resized picture.'],
    faqs: [
      { q: 'Will resizing make my photo blurry?', a: 'Making an image smaller keeps it sharp. Making it much bigger than the original can look soft, because the extra pixels have to be filled in.' },
      { q: 'What happens if the new shape is different?', a: 'You choose: crop to fill the new shape, fit the whole picture with white bars, or stretch it.' },
      { q: 'Is my photo uploaded?', a: 'No. The image is resized by your browser on your own device.' },
    ],
    related: ['crop-image', 'compress-image-to-kb', 'image-compressor'],
  },
  {
    slug: 'crop-image',
    name: 'Crop & Rotate Image',
    short: 'Crop, rotate and flip photos with a simple drag.',
    metaDescription: 'Crop images online for free. Drag to select, pick 1:1, 4:5, 16:9 or other ratios, rotate and flip photos. Works on phones, nothing is uploaded.',
    intro: 'Cut out the part of a photo you want, straighten sideways pictures, or mirror a selfie. Drag the box, choose a shape like square or 16:9, and download.',
    category: 'image', icon: 'Crop',
    keywords: ['crop image', 'crop photo', 'rotate image', 'flip image', 'mirror image', 'square crop', 'crop to 16:9'],
    handlesFiles: true,
    steps: ['Drop an image into the box.', 'Drag the crop box, or its corners, to choose the area. Pick a ratio if you need an exact shape.', 'Rotate or flip if needed.', 'Press “Crop image” and download.'],
    faqs: [
      { q: 'Can I just rotate without cropping?', a: 'Yes. Press “Select whole image”, rotate or flip, then press “Crop image” to save.' },
      { q: 'Does it work on a phone?', a: 'Yes. Drag the box and corners with your finger.' },
    ],
    related: ['image-resizer', 'image-converter', 'compress-image-to-kb'],
  },
  {
    slug: 'compress-image-to-kb',
    name: 'Compress Image to KB',
    short: 'Shrink a photo or signature to 20 KB, 50 KB, 100 KB or any size.',
    metaDescription: 'Compress a photo or signature to an exact size like 20KB, 50KB or 100KB for exam and job application forms. Free, fast and private, no upload.',
    intro: 'Online forms for exams, jobs, passports and scholarships often say “photo must be under 50 KB” or “signature under 20 KB”. Pick the size and LifeKit finds the best quality that fits.',
    category: 'image', icon: 'Minimize2',
    keywords: ['compress image to 20kb', 'compress image to 50kb', 'reduce photo size in kb', 'image to 100kb', 'signature resize 20kb', 'photo for exam form', 'ssc photo size', 'compress jpg to kb'],
    badge: 'new', handlesFiles: true,
    steps: ['Drop your photo or signature into the box.', 'Pick a target size such as 20 KB or 50 KB, or type your own.', 'If the form gives a pixel size, enter it under “Required pixel size”.', 'Press Compress and download the JPG.'],
    faqs: [
      { q: 'How does it reach the exact size?', a: 'It tries many quality levels and keeps the best one under your limit. If that isn’t enough, it gently reduces the pixel size too.' },
      { q: 'Why is the result JPG?', a: 'JPG gives the smallest files for photos and is accepted by almost every online form.' },
      { q: 'The form also needs a size like 200 × 230 px. Can I do that?', a: 'Yes. Open “Required pixel size” and enter the maximum width and height. For an exact size, use the Image Resizer first, then compress.' },
    ],
    related: ['image-resizer', 'image-compressor', 'crop-image'],
  },
  {
    slug: 'image-to-text',
    name: 'Image to Text (OCR)',
    short: 'Copy text from photos, screenshots and scanned pages.',
    metaDescription: 'Free online OCR: extract text from images, screenshots and scanned documents. Copy or download the text. Runs in your browser, nothing is uploaded.',
    intro: 'Take a photo of notes, a book page, a receipt or a screenshot, and turn the words into text you can copy, edit and search. Recognition runs on your device.',
    category: 'image', icon: 'ScanText',
    keywords: ['image to text', 'ocr', 'extract text from image', 'photo to text', 'screenshot to text', 'scan to text', 'copy text from picture'],
    badge: 'new', handlesFiles: true,
    steps: ['Drop a photo or screenshot into the box, or paste one with Ctrl+V.', 'Press “Extract text”.', 'Check and edit the text, then copy it or download a .txt file.'],
    faqs: [
      { q: 'Which languages does it read?', a: 'English printed text. Handwriting and other languages may not be recognised well.' },
      { q: 'How can I get better results?', a: 'Use a sharp, well-lit photo taken straight on, with large, clear text. Crop away anything that isn’t text.' },
      { q: 'Is my image uploaded?', a: 'No. The text reader runs inside your browser. The first time, it downloads its engine (about 4 MB) from LifeKit itself.' },
    ],
    related: ['pdf-to-word', 'crop-image', 'word-counter'],
  },
  {
    slug: 'color-picker',
    name: 'Color Picker',
    short: 'Pick colours from images and convert HEX, RGB, HSL and CMYK.',
    metaDescription: 'Free colour picker: pick colours from any image, convert between HEX, RGB, HSL and CMYK, and get tints and shades. Simple, fast and private.',
    intro: 'Find the exact colour of anything. Open an image and click a pixel, use the colour wheel, or type a code to convert it between HEX, RGB, HSL and CMYK.',
    category: 'image', icon: 'Pipette',
    keywords: ['color picker', 'colour picker', 'hex to rgb', 'rgb to hex', 'color from image', 'eyedropper', 'color code'],
    handlesFiles: true,
    steps: ['Choose a colour, type a code, or open an image and click on it.', 'Copy the code you need: HEX, RGB, HSL or CMYK.', 'Click a tint or shade to explore lighter and darker versions.'],
    faqs: [
      { q: 'Can I pick a colour from anywhere on my screen?', a: 'In Chrome and Edge on a computer, yes: press “Pick from screen”. Other browsers can pick from an image you open.' },
      { q: 'What is CMYK used for?', a: 'Printing. Screens use RGB, while printers mix cyan, magenta, yellow and black ink.' },
    ],
    related: ['image-converter', 'qr-code-generator', 'crop-image'],
  },
  // ---------- Batch 3: PDF ----------
  {
    slug: 'sign-pdf',
    name: 'Sign PDF',
    short: 'Draw, type or upload your signature and place it on a PDF.',
    metaDescription: 'Sign PDF documents online for free. Draw, type or upload your signature, place it on any page and download. Your document never leaves your device.',
    intro: 'Sign forms, agreements and letters without printing. Create your signature once, tap where it goes, adjust the size and download the signed PDF.',
    category: 'pdf', icon: 'PenLine',
    keywords: ['sign pdf', 'add signature to pdf', 'esign pdf', 'sign document online', 'signature on pdf', 'fill and sign'],
    badge: 'new', handlesFiles: true,
    steps: ['Drop the PDF into the box.', 'Draw, type or upload your signature.', 'Tap the page where it should go, then drag and resize it.', 'Press “Save signed PDF” and download.'],
    faqs: [
      { q: 'Is this a legally binding signature?', a: 'It adds a picture of your signature, which many everyday forms accept. Some contracts need a certified digital signature from a trusted provider, so check if you’re unsure.' },
      { q: 'Can I add more than one signature?', a: 'Yes. Place it as many times as you like on any pages, and create several signatures or initials.' },
      { q: 'Is my document uploaded?', a: 'No. The PDF is signed in your browser.' },
    ],
    related: ['pdf-page-numbers', 'watermark-pdf', 'pdf-merger'],
  },
  {
    slug: 'pdf-page-numbers',
    name: 'Add Page Numbers to PDF',
    short: 'Number the pages of a PDF in a few clicks.',
    metaDescription: 'Add page numbers to a PDF for free. Choose position, style (1, Page 1 of 10) and starting number, skip the cover page. Private, nothing is uploaded.',
    intro: 'Give reports, assignments and printed documents tidy page numbers. Choose where they go and how they look, and skip the cover page if you like.',
    category: 'pdf', icon: 'ListOrdered',
    keywords: ['add page numbers to pdf', 'number pdf pages', 'pdf page numbering', 'insert page numbers'],
    handlesFiles: true,
    steps: ['Drop your PDF into the box.', 'Choose the position, style and starting number.', 'Press “Add page numbers” and download.'],
    faqs: [
      { q: 'Can I start from a number other than 1?', a: 'Yes. Set “Start at” to any number, which is useful when the PDF is part of a bigger document.' },
      { q: 'Will it change my content?', a: 'No. Numbers are added on top. Everything else stays exactly the same.' },
    ],
    related: ['watermark-pdf', 'organize-pdf', 'pdf-merger'],
  },
  {
    slug: 'watermark-pdf',
    name: 'Watermark PDF',
    short: 'Stamp text like DRAFT or CONFIDENTIAL on every page.',
    metaDescription: 'Add a text watermark to PDF pages for free: DRAFT, CONFIDENTIAL, COPY or your name. Choose size, colour, transparency and angle. No upload.',
    intro: 'Mark documents as drafts, protect copies of your ID, or add your name to your work. Pick the text, colour and transparency, and LifeKit stamps every page.',
    category: 'pdf', icon: 'Stamp',
    keywords: ['watermark pdf', 'add watermark to pdf', 'pdf stamp', 'confidential watermark', 'draft watermark'],
    handlesFiles: true,
    steps: ['Drop your PDF into the box.', 'Type the watermark text and adjust size, transparency, colour and angle.', 'Press “Add watermark” and download.'],
    faqs: [
      { q: 'Should I watermark copies of my ID?', a: 'It’s a good idea. Writing something like “For bank KYC only, 2026” makes a copy harder to misuse.' },
      { q: 'Can the watermark be removed?', a: 'It’s added as text on top of each page. Determined people with editing software could remove it, so it’s a deterrent, not real protection.' },
    ],
    related: ['pdf-page-numbers', 'sign-pdf', 'pdf-compressor'],
  },
  // ---------- Batch 3: text ----------
  {
    slug: 'speech-to-text',
    name: 'Speech to Text',
    short: 'Type with your voice in English, Hindi and 18 more languages.',
    metaDescription: 'Free speech to text: talk and watch your words appear. Voice typing in English, Hindi, Malayalam, Tamil and more. Copy or download the text.',
    intro: 'Speak instead of typing. Press the microphone, talk naturally, and your words appear on screen, ready to copy into notes, messages or essays.',
    category: 'text', icon: 'AudioLines',
    keywords: ['speech to text', 'voice typing', 'voice to text', 'dictation', 'talk to type', 'hindi voice typing', 'transcribe voice'],
    badge: 'new', handlesFiles: false,
    privacyNote: 'Voice recognition is provided by your browser (Google in Chrome, Microsoft in Edge). LifeKit never receives your audio.',
    steps: ['Choose your language.', 'Tap the microphone and allow access when your browser asks.', 'Speak clearly. Say “comma” or “full stop” for punctuation.', 'Tap again to stop, then copy or download your text.'],
    faqs: [
      { q: 'Which browsers work?', a: 'Chrome, Edge and Safari. Firefox doesn’t support voice typing yet.' },
      { q: 'Is my voice sent anywhere?', a: 'The browser’s own speech service does the recognition: in Chrome that’s Google and in Edge it’s Microsoft. LifeKit never receives or stores your audio.' },
      { q: 'Can it transcribe an audio file?', a: 'No. It listens to your microphone live.' },
    ],
    related: ['text-to-speech', 'notepad', 'word-counter'],
  },
  {
    slug: 'notepad',
    name: 'Online Notepad',
    short: 'Quick notes that save automatically in your browser.',
    metaDescription: 'Free online notepad that saves automatically. Write quick notes, keep several notes, change text size and download as .txt. No sign-up needed.',
    intro: 'A distraction-free place to jot things down. Notes save automatically on this device as you type, so they’re still here when you come back.',
    category: 'text', icon: 'StickyNote',
    keywords: ['online notepad', 'notepad', 'notes online', 'text editor', 'quick notes', 'write notes'],
    handlesFiles: false,
    steps: ['Start typing. Your note saves automatically.', 'Press “New” for another note, and pick notes from the list.', 'Copy or download a note as a .txt file whenever you like.'],
    faqs: [
      { q: 'Where are my notes saved?', a: 'In your browser’s storage on this device. They aren’t uploaded, so they won’t appear on other devices.' },
      { q: 'Can I lose my notes?', a: 'Clearing your browser data or using a private window removes them. Download anything important as a .txt file.' },
    ],
    related: ['todo-list', 'word-counter', 'text-formatter'],
  },
  {
    slug: 'todo-list',
    name: 'To-Do List',
    short: 'A simple task list with due dates that remembers your tasks.',
    metaDescription: 'Free online to-do list: add tasks, set due dates, star important ones and tick them off. Saves automatically in your browser, no account needed.',
    intro: 'Keep track of homework, chores and errands. Add tasks, set due dates, star what matters and enjoy ticking things off. Everything saves on your device.',
    category: 'text', icon: 'ListTodo',
    keywords: ['to do list', 'todo list online', 'task list', 'checklist', 'task planner', 'daily planner'],
    handlesFiles: false,
    steps: ['Type a task and press Add. Add a due date if you like.', 'Tick the box when it’s done. Tap the star for important tasks.', 'Tap a task to edit it and use the arrows to reorder.'],
    faqs: [
      { q: 'Are my tasks saved?', a: 'Yes, in this browser on this device. They stay until you delete them or clear your browser data.' },
      { q: 'Can I use it on my phone?', a: 'Yes. Add LifeKit to your home screen for quick access.' },
    ],
    related: ['notepad', 'pomodoro-timer', 'alarm-clock'],
  },
  {
    slug: 'text-compare',
    name: 'Text Compare',
    short: 'See exactly what changed between two texts.',
    metaDescription: 'Compare two texts online and highlight the differences line by line and word by word. Great for essays, code and contracts. Free and private.',
    intro: 'Paste two versions of an essay, contract or code and instantly see what was added, removed or changed, down to the individual word.',
    category: 'text', icon: 'GitCompare',
    keywords: ['text compare', 'diff checker', 'compare text', 'find differences', 'text difference', 'compare documents'],
    handlesFiles: false,
    steps: ['Paste the original text on the left.', 'Paste the changed text on the right.', 'Read the highlighted differences below: green is added, red is removed.'],
    faqs: [
      { q: 'Can I ignore small differences?', a: 'Yes. Tick “Ignore capital letters” or “Ignore extra spaces”.' },
      { q: 'Is my text uploaded?', a: 'No. The comparison happens in your browser.' },
    ],
    related: ['word-counter', 'text-formatter', 'json-formatter'],
  },
  {
    slug: 'lorem-ipsum-generator',
    name: 'Lorem Ipsum Generator',
    short: 'Placeholder text in paragraphs, sentences or words.',
    metaDescription: 'Generate lorem ipsum placeholder text: choose paragraphs, sentences or words, add HTML tags and copy in one click. Free dummy text generator.',
    intro: 'Need filler text for a design, website or school project? Pick how much you want and copy it in one click.',
    category: 'text', icon: 'Pilcrow',
    keywords: ['lorem ipsum', 'lorem ipsum generator', 'placeholder text', 'dummy text', 'filler text'],
    handlesFiles: false,
    steps: ['Choose paragraphs, sentences or words.', 'Set how many you need.', 'Press Copy.'],
    faqs: [{ q: 'What does lorem ipsum mean?', a: 'It comes from a scrambled passage by the Roman writer Cicero. Designers use it because it looks like real text without distracting readers.' }],
    related: ['word-counter', 'text-formatter', 'notepad'],
  },
  {
    slug: 'typing-test',
    name: 'Typing Speed Test',
    short: 'Check your typing speed in words per minute.',
    metaDescription: 'Free typing speed test: measure your WPM and accuracy in 15, 30, 60 or 120 seconds. Track your best score and practise to type faster.',
    intro: 'How fast can you type? Take a quick test with common words and see your words per minute and accuracy. Your best score is saved so you can beat it.',
    category: 'fun', icon: 'Keyboard',
    keywords: ['typing test', 'typing speed test', 'wpm test', 'words per minute', 'typing practice', 'keyboard test'],
    badge: 'new', handlesFiles: false,
    steps: ['Pick a test length.', 'Start typing the words shown. The timer starts with your first key.', 'Press space after each word.', 'See your WPM and accuracy when time runs out.'],
    faqs: [
      { q: 'What is a good typing speed?', a: 'The average is about 40 words per minute. 60+ is fast, and professional typists often reach 75 or more.' },
      { q: 'How is WPM calculated?', a: 'Correctly typed characters divided by 5 (the standard word length), per minute. Mistakes don’t count.' },
    ],
    related: ['word-counter', 'pomodoro-timer', 'notepad'],
  },
  // ---------- Batch 3: generators ----------
  {
    slug: 'spin-the-wheel',
    name: 'Spin the Wheel',
    short: 'A random picker wheel for names, choices and prizes.',
    metaDescription: 'Spin the wheel to pick a random name, choice or prize. Add your own options, remove winners and spin again. Fair, fun and free.',
    intro: 'Can’t decide? Type your options, spin the wheel and let it choose. Great for picking names in class, choosing food or running giveaways.',
    category: 'fun', icon: 'ChartPie',
    keywords: ['spin the wheel', 'wheel spinner', 'random name picker', 'decision wheel', 'random picker', 'wheel of names'],
    badge: 'new', handlesFiles: false,
    steps: ['Type your options, one per line.', 'Press Spin.', 'See the winner, and optionally remove it before the next spin.'],
    faqs: [
      { q: 'Is it really random?', a: 'Yes. The winner is chosen with your browser’s secure random number generator before the wheel starts turning.' },
      { q: 'How many options can I add?', a: 'Up to 100.' },
    ],
    related: ['random-number-generator', 'password-generator', 'qr-code-generator'],
  },
  {
    slug: 'random-number-generator',
    name: 'Random Number Generator',
    short: 'Random numbers, dice rolls and coin flips.',
    metaDescription: 'Generate random numbers in any range, with or without repeats. Roll dice or flip a coin. Fair results from a secure random generator.',
    intro: 'Pick lottery numbers, choose a raffle winner, roll dice for a board game or flip a coin, with results you can trust.',
    category: 'fun', icon: 'Dices',
    keywords: ['random number generator', 'random number', 'roll dice', 'flip a coin', 'pick a number', 'raffle'],
    handlesFiles: false,
    steps: ['Choose Number, Dice or Coin.', 'Set the range and how many numbers you need.', 'Press Generate.'],
    faqs: [{ q: 'Can I get numbers without repeats?', a: 'Yes. Tick “No repeats” to draw unique numbers, like a raffle.' }],
    related: ['spin-the-wheel', 'password-generator', 'uuid-generator'],
  },
  {
    slug: 'barcode-generator',
    name: 'Barcode Generator',
    short: 'Create Code 128, EAN-13, UPC and more barcodes.',
    metaDescription: 'Free barcode generator: create Code 128, EAN-13, UPC-A, EAN-8, Code 39 and ITF-14 barcodes and download them as PNG or SVG.',
    intro: 'Make barcodes for labels, stock, events and libraries. Pick the type, enter the value and download a sharp PNG or SVG.',
    category: 'generators', icon: 'Barcode',
    keywords: ['barcode generator', 'create barcode', 'ean13 generator', 'upc barcode', 'code 128', 'barcode maker'],
    handlesFiles: false,
    steps: ['Choose the barcode type.', 'Enter the value.', 'Adjust the size, then download a PNG or SVG.'],
    faqs: [{ q: 'Can I use these on products I sell in shops?', a: 'Retail products need official numbers registered with GS1. These barcodes are perfect for your own inventory, labels and events.' }],
    related: ['qr-code-generator', 'uuid-generator', 'random-number-generator'],
  },
  // ---------- Batch 3: calculators ----------
  {
    slug: 'scientific-calculator',
    name: 'Scientific Calculator',
    short: 'Trig, logs, powers, roots and factorials.',
    metaDescription: 'Free online scientific calculator with sin, cos, tan, log, ln, powers, roots, factorials, π and e. Degrees or radians, keyboard support and history.',
    intro: 'A full scientific calculator for school, college and work: trigonometry, logarithms, powers, roots and more, in degrees or radians.',
    category: 'calculators', icon: 'Sigma',
    keywords: ['scientific calculator', 'online scientific calculator', 'sin cos tan calculator', 'log calculator', 'calculator with exponents'],
    badge: 'popular', handlesFiles: false,
    steps: ['Tap the buttons or type with your keyboard.', 'Switch between DEG and RAD for angles.', 'Press = to see the answer. Use Ans to reuse it.'],
    faqs: [
      { q: 'Degrees or radians?', a: 'DEG is selected by default, so sin(30) = 0.5. Switch to RAD for radians.' },
      { q: 'What does −2^2 give?', a: '−4, following standard maths rules (the power is worked out before the minus). Type (−2)^2 to get 4.' },
    ],
    related: ['calculator', 'percentage-calculator', 'unit-converter'],
  },
  {
    slug: 'sip-calculator',
    name: 'SIP Calculator',
    short: 'See how much your monthly SIP or lump sum could grow.',
    metaDescription: 'SIP calculator: estimate the future value of monthly mutual fund investments or a lump sum, with total invested and returns year by year.',
    intro: 'Planning to invest a little every month? See how your SIP or one-time investment could grow over time, and how much of the final amount is returns.',
    category: 'calculators', icon: 'TrendingUp',
    keywords: ['sip calculator', 'mutual fund calculator', 'sip return calculator', 'lump sum calculator', 'investment calculator'],
    badge: 'new', handlesFiles: false,
    steps: ['Choose monthly SIP or one-time investment.', 'Enter the amount, expected yearly return and number of years.', 'See the estimated value and the year-by-year growth.'],
    faqs: [
      { q: 'Are these returns guaranteed?', a: 'No. Market returns go up and down. This is an estimate based on a steady average return.' },
      { q: 'How is SIP value calculated?', a: 'Each monthly payment grows with monthly compounding, using the same formula most Indian fund houses use.' },
    ],
    related: ['compound-interest-calculator', 'loan-calculator', 'gst-calculator'],
  },
  {
    slug: 'compound-interest-calculator',
    name: 'Compound Interest Calculator',
    short: 'Watch savings grow with compound interest and monthly deposits.',
    metaDescription: 'Free compound interest calculator with monthly contributions. Choose daily, monthly, quarterly or yearly compounding and see your balance by year.',
    intro: 'See how savings, fixed deposits or investments grow when interest earns interest. Add regular monthly deposits and compare compounding frequencies.',
    category: 'calculators', icon: 'PiggyBank',
    keywords: ['compound interest calculator', 'interest calculator', 'savings calculator', 'fd calculator', 'investment growth'],
    handlesFiles: false,
    steps: ['Enter your starting amount and any monthly addition.', 'Enter the interest rate, years and compounding frequency.', 'See your final balance and yearly breakdown.'],
    faqs: [{ q: 'What does compounding frequency change?', a: 'More frequent compounding (monthly instead of yearly) earns slightly more, because interest starts earning interest sooner.' }],
    related: ['sip-calculator', 'loan-calculator', 'percentage-calculator'],
  },
  {
    slug: 'gst-calculator',
    name: 'GST Calculator',
    short: 'Add or remove GST, with CGST, SGST and IGST.',
    metaDescription: 'Free GST calculator for India: add or remove GST at 5%, 12%, 18% or 28% and see CGST, SGST and IGST. Also works for VAT and sales tax.',
    intro: 'Work out GST in seconds. Add tax to a price, or find the original price from a GST-inclusive amount, with the CGST and SGST split shown.',
    category: 'calculators', icon: 'BadgePercent',
    keywords: ['gst calculator', 'gst calculation', 'reverse gst', 'cgst sgst calculator', 'vat calculator', 'tax calculator india'],
    badge: 'new', handlesFiles: false,
    steps: ['Choose Add GST or Remove GST.', 'Enter the amount and pick the rate.', 'Read the GST, CGST/SGST split and the final amount.'],
    faqs: [
      { q: 'What is the difference between CGST, SGST and IGST?', a: 'For sales within one state, GST is split equally into CGST (central) and SGST (state). For sales between states, the full amount is IGST.' },
      { q: 'How do I remove GST from a price?', a: 'Choose “Remove GST”. The calculator divides by (1 + rate), so ₹1,180 at 18% gives ₹1,000 before tax.' },
    ],
    related: ['discount-calculator', 'percentage-calculator', 'sip-calculator'],
  },
  {
    slug: 'cgpa-to-percentage',
    name: 'CGPA to Percentage',
    short: 'Convert CGPA to percentage and back.',
    metaDescription: 'Convert CGPA to percentage (CGPA × 9.5 for CBSE) and percentage to CGPA. Includes VTU, Mumbai University and 4-point GPA formulas.',
    intro: 'Need your marks as a percentage for a form or job application? Convert your CGPA using the CBSE formula or your university’s own.',
    category: 'calculators', icon: 'School',
    keywords: ['cgpa to percentage', 'cgpa calculator', 'percentage to cgpa', 'cbse cgpa', 'convert cgpa', 'gpa to percentage'],
    badge: 'new', handlesFiles: false,
    steps: ['Choose CGPA → % or % → CGPA.', 'Enter your value.', 'Pick your board or university’s formula.'],
    faqs: [
      { q: 'Why multiply by 9.5?', a: 'CBSE found that the average marks of students in a grade range came to about 9.5 times the grade point, so it uses CGPA × 9.5.' },
      { q: 'Is this formula official for my university?', a: 'Many universities have their own formula, often printed on the marksheet. Use the one they specify.' },
    ],
    related: ['gpa-calculator', 'percentage-calculator', 'calculator'],
  },
  {
    slug: 'calorie-calculator',
    name: 'Calorie Calculator',
    short: 'Daily calories to maintain, lose or gain weight.',
    metaDescription: 'Free calorie calculator: estimate the calories you need each day to maintain, lose or gain weight, based on age, height, weight and activity.',
    intro: 'Find out roughly how many calories your body uses each day, and what to aim for if you want to lose or gain weight.',
    category: 'calculators', icon: 'Flame',
    keywords: ['calorie calculator', 'tdee calculator', 'bmr calculator', 'calories per day', 'weight loss calculator', 'maintenance calories'],
    handlesFiles: false,
    steps: ['Enter your sex, age, weight and height.', 'Choose your activity level.', 'See your daily calorie targets.'],
    faqs: [
      { q: 'How accurate is it?', a: 'It uses the Mifflin–St Jeor equation, one of the most reliable formulas, but everyone is different. Treat it as a starting point.' },
      { q: 'What is BMR?', a: 'Basal metabolic rate: the calories your body burns at complete rest just to stay alive.' },
    ],
    related: ['bmi-calculator', 'unit-converter', 'age-calculator'],
  },
  // ---------- Batch 3: developer ----------
  {
    slug: 'json-formatter',
    name: 'JSON Formatter',
    short: 'Format, validate and minify JSON.',
    metaDescription: 'Free JSON formatter and validator: pretty-print, minify and check JSON with clear error messages showing the line and column. Private, in your browser.',
    intro: 'Paste messy JSON and make it readable, or minify it for production. Errors point to the exact line and column.',
    category: 'developer', icon: 'Braces',
    keywords: ['json formatter', 'json validator', 'json beautifier', 'pretty print json', 'minify json', 'json viewer'],
    handlesFiles: false,
    steps: ['Paste your JSON on the left.', 'Press Format / validate, or Minify.', 'Copy or download the result.'],
    faqs: [{ q: 'Is my data sent anywhere?', a: 'No. Formatting happens in your browser, which makes it safe for API responses and config files.' }],
    related: ['base64-encoder', 'hash-generator', 'text-compare'],
  },
  {
    slug: 'base64-encoder',
    name: 'Base64 & URL Encoder',
    short: 'Encode and decode Base64 and URL text.',
    metaDescription: 'Encode or decode Base64 and URL-encoded text online, with full UTF-8 support. Convert files to Base64 data URLs. Free and private.',
    intro: 'Convert text to and from Base64 or URL encoding, including emojis and non-English characters. You can also turn a file into a Base64 data URL.',
    category: 'developer', icon: 'Binary',
    keywords: ['base64 encode', 'base64 decode', 'url encode', 'url decode', 'base64 converter', 'image to base64'],
    handlesFiles: true,
    steps: ['Choose Base64 or URL, then Encode or Decode.', 'Type or paste your text.', 'Copy the result.'],
    faqs: [{ q: 'Is Base64 encryption?', a: 'No. Base64 only changes how data is written. Anyone can decode it, so never use it to hide passwords.' }],
    related: ['json-formatter', 'hash-generator', 'uuid-generator'],
  },
  {
    slug: 'hash-generator',
    name: 'Hash Generator',
    short: 'MD5, SHA-1, SHA-256 and SHA-512 for text or files.',
    metaDescription: 'Generate MD5, SHA-1, SHA-256, SHA-384 and SHA-512 hashes of text or files, and check a download against a published checksum. Private.',
    intro: 'Create checksums of text or files, and verify that a download hasn’t been changed by comparing it with the hash the publisher gives.',
    category: 'developer', icon: 'Hash',
    keywords: ['hash generator', 'md5 generator', 'sha256 generator', 'checksum', 'file hash', 'sha1'],
    handlesFiles: true,
    steps: ['Type text, or choose a file.', 'All hashes appear instantly.', 'Paste a published hash into “Compare” to check it matches.'],
    faqs: [{ q: 'Which hash should I use?', a: 'SHA-256 for checking files and general use. MD5 and SHA-1 are fine for spotting accidental changes, but not for security.' }],
    related: ['password-generator', 'base64-encoder', 'uuid-generator'],
  },
  {
    slug: 'uuid-generator',
    name: 'UUID Generator',
    short: 'Generate random v4 UUIDs in bulk.',
    metaDescription: 'Generate random version 4 UUIDs (GUIDs) online, up to 1,000 at a time, with options for uppercase, hyphens and braces. Copy or download.',
    intro: 'Create unique IDs for databases, test data and software. Generate one or a thousand at once.',
    category: 'developer', icon: 'Fingerprint',
    keywords: ['uuid generator', 'guid generator', 'uuid v4', 'random uuid', 'unique id generator'],
    handlesFiles: false,
    steps: ['Choose how many UUIDs you need.', 'Pick the format options.', 'Press Generate, then copy or download.'],
    faqs: [{ q: 'Can two UUIDs be the same?', a: 'In practice, no. There are about 5.3 × 10³⁶ possible v4 UUIDs.' }],
    related: ['password-generator', 'hash-generator', 'random-number-generator'],
  },
  // ---------- Batch 3: media ----------
  {
    slug: 'screen-recorder',
    name: 'Screen Recorder',
    short: 'Record your screen with your voice, free and with no watermark.',
    metaDescription: 'Free online screen recorder: record your screen, a window or a tab with microphone and computer sound. No watermark, no time limit, no upload.',
    intro: 'Record tutorials, presentations, bug reports or game clips right in your browser. Add your voice, pause when you need to and download the video.',
    category: 'media', icon: 'ScreenShare',
    keywords: ['screen recorder', 'record screen', 'online screen recorder', 'screen capture video', 'record screen with audio', 'no watermark'],
    badge: 'new', handlesFiles: false,
    steps: ['Choose whether to record your microphone and computer sound.', 'Press Start and choose the screen, window or tab to record.', 'Pause or stop whenever you like.', 'Watch the preview and download the video.'],
    faqs: [
      { q: 'Does it work on phones?', a: 'No. Mobile browsers don’t let websites record the screen. Use your phone’s built-in screen recorder instead.' },
      { q: 'Is there a watermark or time limit?', a: 'No watermark. Recording length is limited only by your device’s memory.' },
      { q: 'What format is the video?', a: 'WebM in Chrome, Edge and Firefox, and MP4 in Safari (and in newer Chrome versions). Both play in VLC and most modern players.' },
    ],
    related: ['voice-recorder', 'image-converter', 'stopwatch'],
  },
  {
    slug: 'voice-recorder',
    name: 'Voice Recorder',
    short: 'Record audio from your microphone and download it.',
    metaDescription: 'Free online voice recorder: record audio from your microphone, pause and resume, play it back and download. No sign-up, nothing is uploaded.',
    intro: 'Record voice notes, lectures, song ideas or interview answers. Tap to record, play it back and download the audio file.',
    category: 'media', icon: 'Mic',
    keywords: ['voice recorder', 'online voice recorder', 'audio recorder', 'record audio', 'mic recorder', 'voice memo'],
    handlesFiles: false,
    steps: ['Tap the microphone and allow access.', 'Speak. Pause and resume if you need to.', 'Tap again to stop, listen, and download.'],
    faqs: [
      { q: 'Is my recording uploaded?', a: 'No. Audio is recorded and kept in your browser until you download it or close the tab.' },
      { q: 'What format is the file?', a: 'WebM or M4A depending on your browser. Both play on phones and computers.' },
    ],
    related: ['speech-to-text', 'screen-recorder', 'text-to-speech'],
  },
  // ---------- Batch 4 ----------
  {
    slug: 'text-to-handwriting', name: 'Text to Handwriting', short: 'Turn typed text into realistic handwriting on paper.',
    metaDescription: 'Free text to handwriting converter: type or paste text and get realistic handwritten pages on ruled paper. Blue or black ink, Hindi supported. Download PDF.',
    intro: 'Type your notes or assignment and see them written by hand on ruled paper, complete with natural wobble. Choose the handwriting, ink colour and paper, then download images or a PDF.',
    category: 'text', icon: 'PenTool', keywords: ['text to handwriting', 'handwriting converter', 'typed to handwritten', 'assignment handwriting', 'handwritten notes generator', 'hindi handwriting'],
    badge: 'new', handlesFiles: false,
    steps: ['Type or paste your text.', 'Choose the handwriting style, ink colour and paper.', 'Adjust size and messiness until it looks right.', 'Download the pages as images or one PDF.'],
    faqs: [
      { q: 'Does it support Hindi?', a: 'Yes. Choose the Kalam handwriting, which supports Devanagari as well as English.' },
      { q: 'Can I use it for school assignments?', a: 'That depends on your school’s rules. Many teachers want work in your own handwriting, so check first.' },
    ],
    related: ['notepad', 'word-counter', 'images-to-pdf'],
  },
  {
    slug: 'attendance-calculator', name: 'Attendance Calculator', short: 'How many classes can you skip and still stay above 75%?',
    metaDescription: 'Attendance calculator for college students: find out how many classes you can bunk and still keep 75%, or how many you must attend to get back above it.',
    intro: 'Enter the classes you’ve attended and the total held. LifeKit tells you how many more you can safely miss, or how many you need to attend in a row to reach the required percentage.',
    category: 'calculators', icon: 'CalendarCheck', keywords: ['attendance calculator', 'bunk calculator', '75 attendance calculator', 'how many classes can i skip', 'attendance percentage'],
    badge: 'new', handlesFiles: false,
    steps: ['Enter classes attended and total classes held.', 'Choose the required attendance (usually 75%).', 'Read how many classes you can skip or must attend.'],
    faqs: [
      { q: 'How is attendance percentage calculated?', a: 'Classes attended ÷ total classes × 100. For example, 42 out of 50 is 84%.' },
      { q: 'Does it count medical leave?', a: 'No. Colleges handle leave differently, so add approved leave to “attended” only if your college counts it.' },
    ],
    related: ['marks-percentage-calculator', 'cgpa-to-percentage', 'gpa-calculator'],
  },
  {
    slug: 'fancy-text-generator', name: 'Fancy Text Generator', short: 'Stylish fonts for Instagram bios, captions and WhatsApp.',
    metaDescription: 'Fancy text generator: turn normal text into 𝐛𝐨𝐥𝐝, 𝓈𝒸𝓇𝒾𝓅𝓉, 𝕕𝕠𝕦𝕓𝕝𝕖 and more stylish fonts. Copy and paste into Instagram, WhatsApp, games and bios.',
    intro: 'Make your bio and captions stand out. Type once and copy any of 16 stylish text styles: bold, script, bubble, small caps, upside down and more.',
    category: 'text', icon: 'WandSparkles', keywords: ['fancy text generator', 'instagram fonts', 'stylish text', 'cool fonts copy paste', 'bio fonts', 'font generator'],
    badge: 'popular', handlesFiles: false,
    steps: ['Type your text.', 'Find a style you like.', 'Tap Copy and paste it anywhere.'],
    faqs: [
      { q: 'Why do some styles show boxes?', a: 'These styles use special Unicode characters. Most phones and apps show them, but some older devices or apps can’t.' },
      { q: 'Are fancy fonts bad for accessibility?', a: 'Screen readers may read them strangely, so use them for decoration, not for important information.' },
    ],
    related: ['text-formatter', 'text-repeater', 'word-counter'],
  },
  {
    slug: 'marks-percentage-calculator', name: 'Marks Percentage Calculator', short: 'Total marks, percentage and grade for all your subjects.',
    metaDescription: 'Calculate your marks percentage for board exams or semesters: add subjects, enter marks and see your total, percentage, grade and CGPA equivalent.',
    intro: 'Add your subjects and marks to get your overall percentage instantly, along with a CBSE-style grade and the equivalent CGPA.',
    category: 'calculators', icon: 'BookOpenCheck', keywords: ['percentage calculator marks', 'marks percentage', 'board exam percentage', 'total marks calculator', 'percentage of marks'],
    handlesFiles: false,
    steps: ['Enter each subject’s marks and maximum marks.', 'Add or remove subjects as needed.', 'Read your total, percentage and grade.'],
    faqs: [{ q: 'How do I calculate percentage of marks?', a: 'Add up all marks scored, divide by the total maximum marks, and multiply by 100.' }],
    related: ['cgpa-to-percentage', 'gpa-calculator', 'attendance-calculator'],
  },
  {
    slug: 'number-to-words', name: 'Number to Words', short: 'Write amounts in words for cheques, in lakh/crore or million.',
    metaDescription: 'Convert numbers to words for cheques and invoices: “Rupees One Lakh Twenty-Five Thousand Only”. Indian lakh/crore and international million/billion.',
    intro: 'Writing a cheque or invoice? Type an amount and get it in words, in the Indian system (lakh, crore) or the international one (million, billion), with rupees and paise.',
    category: 'calculators', icon: 'WholeWord', keywords: ['number to words', 'amount in words', 'rupees in words', 'cheque amount in words', 'lakh crore converter'],
    handlesFiles: false,
    steps: ['Type the number or amount.', 'Choose lakh/crore or million/billion.', 'Copy the words or the cheque-style text.'],
    faqs: [{ q: 'What is 1 crore in millions?', a: '1 crore = 10 million, and 1 lakh = 100,000.' }],
    related: ['invoice-generator', 'gst-calculator', 'calculator'],
  },
  {
    slug: 'text-repeater', name: 'Text Repeater', short: 'Repeat any text or emoji up to 10,000 times.',
    metaDescription: 'Free text repeater: repeat words, emojis or messages hundreds of times with new lines, spaces or commas, and copy in one tap.',
    intro: 'Repeat a word, message or emoji as many times as you like, separated by new lines, spaces or commas.',
    category: 'text', icon: 'Repeat2', keywords: ['text repeater', 'repeat text', 'emoji repeater', 'repeat message', 'text multiplier'],
    handlesFiles: false, steps: ['Type the text.', 'Choose how many times and the separator.', 'Copy the result.'],
    faqs: [{ q: 'Is there a limit?', a: 'Up to 10,000 repeats, which is plenty for most uses.' }],
    related: ['fancy-text-generator', 'text-formatter', 'word-counter'],
  },
  {
    slug: 'whatsapp-link-generator', name: 'WhatsApp Link Generator', short: 'Create a wa.me chat link and QR code with a ready message.',
    metaDescription: 'Create a WhatsApp click-to-chat link (wa.me) with a pre-filled message, plus a QR code. Perfect for Instagram bios, shops and business cards.',
    intro: 'Let customers or friends message you in one tap. Enter your number and an optional message to get a WhatsApp link and QR code.',
    category: 'generators', icon: 'MessageCircle', keywords: ['whatsapp link generator', 'wa.me link', 'click to chat', 'whatsapp qr code', 'whatsapp link for instagram'],
    handlesFiles: false, steps: ['Enter your WhatsApp number with country code.', 'Add a message (optional).', 'Copy the link or download the QR code.'],
    faqs: [{ q: 'Do people need to save my number?', a: 'No. The link opens a chat with you directly.' }],
    related: ['qr-code-generator', 'qr-code-scanner', 'fancy-text-generator'],
  },
  {
    slug: 'income-tax-calculator', name: 'Income Tax Calculator (India)', short: 'Compare old vs new tax regime for FY 2025-26.',
    metaDescription: 'Income tax calculator for India FY 2025-26 (AY 2026-27): compare the new and old regime, with standard deduction, 87A rebate, surcharge and cess.',
    intro: 'See how much income tax you’ll pay under the new and old regimes, and which one saves you more. Includes the ₹12 lakh rebate, standard deduction, 80C and cess.',
    category: 'calculators', icon: 'IndianRupee', keywords: ['income tax calculator', 'new vs old regime', 'tax calculator india', 'income tax fy 2025-26', 'salary tax calculator'],
    badge: 'new', handlesFiles: false,
    steps: ['Enter your yearly income.', 'Tick “salaried” if you get the standard deduction.', 'Add old-regime deductions like 80C if you have them.', 'Compare the two regimes.'],
    faqs: [
      { q: 'Is income up to ₹12 lakh tax-free?', a: 'Under the new regime for FY 2025-26, yes: the 87A rebate covers tax on taxable income up to ₹12 lakh. Salaried people also get a ₹75,000 standard deduction, so salary up to ₹12.75 lakh has no tax.' },
      { q: 'Which regime should I choose?', a: 'If your deductions (80C, HRA, home loan and so on) are large, the old regime may be cheaper. The calculator compares both.' },
      { q: 'Is this tax advice?', a: 'No. It’s an estimate based on published slabs. Confirm on incometax.gov.in or with a tax professional.' },
    ],
    related: ['gst-calculator', 'sip-calculator', 'fd-rd-calculator'],
  },
  {
    slug: 'fd-rd-calculator', name: 'FD & RD Calculator', short: 'Maturity amount for fixed and recurring deposits.',
    metaDescription: 'FD and RD calculator: find the maturity amount and interest for fixed deposits and recurring deposits with quarterly compounding, like Indian banks.',
    intro: 'Planning a fixed deposit or a monthly recurring deposit? See exactly how much you’ll get back at maturity.',
    category: 'calculators', icon: 'Landmark', keywords: ['fd calculator', 'rd calculator', 'fixed deposit calculator', 'recurring deposit calculator', 'fd maturity'],
    handlesFiles: false, steps: ['Choose FD or RD.', 'Enter the amount, interest rate and period.', 'Read the maturity amount and interest.'],
    faqs: [{ q: 'How often is FD interest compounded?', a: 'Most Indian banks compound quarterly, which this calculator uses.' }],
    related: ['compound-interest-calculator', 'sip-calculator', 'income-tax-calculator'],
  },
  {
    slug: 'fuel-cost-calculator', name: 'Fuel Cost Calculator', short: 'How much fuel a trip needs and what it costs.',
    metaDescription: 'Trip fuel cost calculator: enter distance, mileage and petrol price to see fuel needed, total cost, cost per km and cost per person.',
    intro: 'Planning a road trip? Work out the fuel cost and split it fairly between friends.',
    category: 'calculators', icon: 'Fuel', keywords: ['fuel cost calculator', 'petrol cost calculator', 'trip cost calculator', 'mileage calculator'],
    handlesFiles: false, steps: ['Enter the distance.', 'Enter your vehicle’s mileage and the fuel price.', 'Add how many people are sharing.'],
    faqs: [{ q: 'Where do I find my mileage?', a: 'Fill the tank, note the odometer, drive, refill, then divide kilometres driven by litres added.' }],
    related: ['unit-converter', 'tip-calculator', 'discount-calculator'],
  },
  {
    slug: 'sleep-calculator', name: 'Sleep Calculator', short: 'Best times to sleep or wake up, based on sleep cycles.',
    metaDescription: 'Sleep calculator: find the best bedtime for your wake-up time, or when to wake up if you sleep now, using 90-minute sleep cycles.',
    intro: 'Wake up feeling fresh by timing your sleep with 90-minute cycles. Pick a wake-up time to get bedtimes, or see when to set your alarm if you sleep now.',
    category: 'calculators', icon: 'BedDouble', keywords: ['sleep calculator', 'bedtime calculator', 'sleep cycle calculator', 'when should i sleep', 'wake up time'],
    handlesFiles: false, steps: ['Choose “Wake up at” or “Sleep now”.', 'Pick your time.', 'Choose one of the suggested times.'],
    faqs: [{ q: 'How much sleep do teenagers need?', a: 'Health guidelines suggest 8–10 hours for teenagers and 7–9 for adults.' }],
    related: ['alarm-clock', 'pomodoro-timer', 'calorie-calculator'],
  },
  {
    slug: 'countdown-timer', name: 'Countdown to Date', short: 'Live countdown to exams, birthdays or any event.',
    metaDescription: 'Create a live countdown to any date: exams, birthdays, holidays or launches. Shows days, hours, minutes and seconds. Share it with a link.',
    intro: 'How many days until your exams, birthday or trip? Set the date and watch the live countdown, then share the link with friends.',
    category: 'time', icon: 'Hourglass', keywords: ['countdown timer', 'days until', 'exam countdown', 'countdown to date', 'birthday countdown'],
    handlesFiles: false, steps: ['Name your event.', 'Pick the date and time.', 'Copy the link to share your countdown.'],
    faqs: [{ q: 'Can friends see the same countdown?', a: 'Yes. Copy the link: it contains the event name and date.' }],
    related: ['date-calculator', 'timer', 'world-clock'],
  },
  {
    slug: 'world-clock', name: 'World Clock', short: 'Current time in cities around the world.',
    metaDescription: 'Free world clock: see the current time in India, Dubai, London, New York and any city. Add your own cities and see the time difference.',
    intro: 'Keep track of family, friends and colleagues abroad. See the live time in multiple cities and how far ahead or behind they are.',
    category: 'time', icon: 'Earth', keywords: ['world clock', 'time in dubai', 'time in usa', 'current time', 'time difference'],
    handlesFiles: false, steps: ['See the default cities.', 'Add any city from the list.', 'Remove cities you don’t need.'],
    faqs: [{ q: 'Does it handle daylight saving?', a: 'Yes. It uses your browser’s built-in time-zone database.' }],
    related: ['time-zone-converter', 'countdown-timer', 'alarm-clock'],
  },
  {
    slug: 'reaction-time-test', name: 'Reaction Time Test', short: 'How fast are your reflexes? Test in milliseconds.',
    metaDescription: 'Test your reaction time: wait for green and tap as fast as you can. See your time in milliseconds, your average and your best score.',
    intro: 'Wait for the box to turn green, then tap as fast as you can. The average person reacts in about 250 milliseconds. Can you beat it?',
    category: 'fun', icon: 'Zap', keywords: ['reaction time test', 'reflex test', 'reaction speed', 'human benchmark', 'click speed'],
    handlesFiles: false, steps: ['Tap the box to start.', 'Wait for it to turn green.', 'Tap as fast as you can.'],
    faqs: [{ q: 'What is a good reaction time?', a: 'Around 200–250 ms is typical. Under 200 ms is very fast.' }],
    related: ['typing-test', 'spin-the-wheel', 'random-number-generator'],
  },
  {
    slug: 'tally-counter', name: 'Tally Counter', short: 'A simple tap counter that remembers the count.',
    metaDescription: 'Online tally counter: tap to count people, laps, reps or prayers. Count up or down by 1, 5 or 10, and the count is saved on your device.',
    intro: 'Count anything with a big tap button: people at an event, reps at the gym, laps or tasbih. The count is saved even if you close the page.',
    category: 'fun', icon: 'MousePointerClick', keywords: ['tally counter', 'click counter', 'tap counter', 'online counter', 'tasbih counter'],
    handlesFiles: false, steps: ['Tap the circle to count.', 'Use + and − to adjust.', 'Reset when you’re done.'],
    faqs: [{ q: 'Is the count saved?', a: 'Yes, on this device, until you reset it.' }],
    related: ['stopwatch', 'reaction-time-test', 'team-generator'],
  },
  {
    slug: 'team-generator', name: 'Random Team Generator', short: 'Split names into fair random teams.',
    metaDescription: 'Random team generator: paste a list of names and split them into 2 or more fair, random teams for games, class projects or sports.',
    intro: 'Paste your list of names, choose how many teams, and LifeKit shuffles everyone into balanced random groups.',
    category: 'fun', icon: 'Users', keywords: ['team generator', 'random team picker', 'group generator', 'split into teams', 'random groups'],
    handlesFiles: false, steps: ['Type the names, one per line.', 'Choose the number of teams.', 'Press “Make teams” and copy the result.'],
    faqs: [{ q: 'Is it fair?', a: 'Yes. Names are shuffled with a secure random generator and teams differ in size by at most one.' }],
    related: ['spin-the-wheel', 'random-number-generator', 'tally-counter'],
  },
  {
    slug: 'base-converter', name: 'Binary & Hex Converter', short: 'Convert numbers between binary, octal, decimal and hex.',
    metaDescription: 'Convert numbers between binary, octal, decimal and hexadecimal instantly. Supports very large numbers. Free number base converter.',
    intro: 'Convert any whole number between binary (base 2), octal (base 8), decimal (base 10) and hexadecimal (base 16).',
    category: 'developer', icon: 'Hexagon', keywords: ['binary converter', 'hex to decimal', 'decimal to binary', 'number base converter', 'binary to decimal'],
    handlesFiles: false, steps: ['Choose the input base.', 'Type the number.', 'Copy any of the results.'],
    faqs: [{ q: 'Does it support fractions?', a: 'No, whole numbers only, but they can be as large as you like.' }],
    related: ['scientific-calculator', 'hash-generator', 'base64-encoder'],
  },
  {
    slug: 'regex-tester', name: 'Regex Tester', short: 'Test regular expressions with live highlighting.',
    metaDescription: 'Free online regex tester: write a regular expression, see matches highlighted live, and inspect capture groups. JavaScript syntax.',
    intro: 'Build and debug regular expressions with live match highlighting and capture groups, using JavaScript regex syntax.',
    category: 'developer', icon: 'Regex', keywords: ['regex tester', 'regular expression tester', 'regex online', 'test regex', 'javascript regex'],
    handlesFiles: false, steps: ['Type your pattern.', 'Choose flags.', 'Paste test text and see matches.'],
    faqs: [{ q: 'Which regex flavour does it use?', a: 'JavaScript (ECMAScript), the same as in browsers and Node.js.' }],
    related: ['json-formatter', 'text-compare', 'base64-encoder'],
  },
  {
    slug: 'favicon-generator', name: 'Favicon Generator', short: 'Make favicon.ico and app icons from a letter or logo.',
    metaDescription: 'Free favicon generator: create favicon.ico, PNG icons, Apple touch icon and Android icons from text, an emoji or your logo, with the HTML code.',
    intro: 'Give your website a proper icon. Create one from a letter, emoji or logo and download a complete pack with the HTML to paste in.',
    category: 'developer', icon: 'AppWindow', keywords: ['favicon generator', 'favicon ico', 'create favicon', 'apple touch icon', 'website icon'],
    handlesFiles: true, steps: ['Choose a letter/emoji or upload a logo.', 'Pick colours and corner style.', 'Download the pack and add the HTML to your site.'],
    faqs: [{ q: 'What’s included?', a: 'favicon.ico (16, 32, 48), PNG favicons, a 180×180 Apple touch icon, 192 and 512 Android icons and a web manifest.' }],
    related: ['image-resizer', 'color-picker', 'qr-code-generator'],
  },
  {
    slug: 'compress-pdf-to-kb', name: 'Compress PDF to KB', short: 'Shrink a PDF to 100 KB, 200 KB or any size for forms.',
    metaDescription: 'Compress a PDF to a specific size like 100KB, 200KB or 500KB for exam and job application forms. Free, private, in your browser.',
    intro: 'Online forms often say “upload PDF under 200 KB”. Pick the size and LifeKit shrinks your document until it fits.',
    category: 'pdf', icon: 'FileArchive', keywords: ['compress pdf to 100kb', 'compress pdf to 200kb', 'reduce pdf size in kb', 'pdf under 500kb', 'pdf for exam form'],
    badge: 'new', handlesFiles: true,
    steps: ['Drop your PDF into the box.', 'Pick a target size or type your own.', 'Press Compress and download.'],
    faqs: [
      { q: 'Will the text still be selectable?', a: 'To reach small sizes, pages are saved as images, so text can’t be selected afterwards. It still looks the same when printed or viewed.' },
      { q: 'What if it can’t reach my size?', a: 'You’ll get the smallest possible version and a message. Try Black & white, or a slightly larger target.' },
    ],
    related: ['pdf-compressor', 'compress-image-to-kb', 'images-to-pdf'],
  },
  {
    slug: 'passport-photo-maker', name: 'Passport Photo Maker', short: 'Crop passport and visa photos and print several on one sheet.',
    metaDescription: 'Make passport size photos online: crop to 35×45 mm, 2×2 inch and more, then print 6–8 copies on 4×6 photo paper or A4. Free, private.',
    intro: 'Skip the studio. Crop your photo to the right passport or visa size, then download a single photo or a print sheet with several copies on 4×6 photo paper or A4.',
    category: 'image', icon: 'IdCard', keywords: ['passport size photo', 'passport photo maker', '35x45 photo', '2x2 photo', 'visa photo', 'passport photo print sheet'],
    badge: 'new', handlesFiles: true,
    steps: ['Upload a front-facing photo on a plain light background.', 'Choose the photo size and drag/zoom to fit your face in the oval.', 'Download a single photo or a print sheet.', 'Print at 100% (actual size).'],
    faqs: [
      { q: 'Does it change the background to white?', a: 'No. Take your photo against a plain white or light wall for the best result.' },
      { q: 'Will it be accepted?', a: 'It produces the correct size at 300 DPI. Acceptance also depends on lighting, expression and background, so check your country’s official rules.' },
    ],
    related: ['crop-image', 'compress-image-to-kb', 'image-resizer'],
  },
  {
    slug: 'heic-to-jpg', name: 'HEIC to JPG', short: 'Convert iPhone photos (.HEIC) to JPG or PNG.',
    metaDescription: 'Convert HEIC to JPG online for free: turn iPhone photos into JPG or PNG that work everywhere. Batch convert, private, no upload.',
    intro: 'iPhone photos are saved as HEIC, which many websites and forms won’t accept. Convert them to JPG or PNG in seconds.',
    category: 'image', icon: 'Smartphone', keywords: ['heic to jpg', 'heic converter', 'iphone photo to jpg', 'heif to jpg', 'convert heic'],
    handlesFiles: true, steps: ['Drop your .HEIC photos.', 'Choose JPG or PNG.', 'Convert and download.'],
    faqs: [{ q: 'Can my iPhone save JPG instead?', a: 'Yes: Settings → Camera → Formats → Most Compatible.' }],
    related: ['image-converter', 'image-compressor', 'image-resizer'],
  },
  {
    slug: 'qr-code-scanner', name: 'QR Code Scanner', short: 'Scan QR codes with your camera or from a screenshot.',
    metaDescription: 'Scan QR codes online with your camera or by uploading a screenshot. Free QR reader that works on your device: nothing is uploaded.',
    intro: 'Read any QR code using your camera, or upload a screenshot or photo that contains one. The code is decoded on your device.',
    category: 'generators', icon: 'ScanQrCode', keywords: ['qr code scanner', 'scan qr code online', 'qr reader', 'scan qr from image', 'qr code from screenshot'],
    handlesFiles: true, steps: ['Press “Scan with camera” and allow access, or upload a screenshot.', 'Point at the QR code.', 'Copy the result or open the link.'],
    faqs: [{ q: 'Is it safe to open QR links?', a: 'Check the address first. Scammers sometimes use QR codes to send people to fake payment or login pages.' }],
    related: ['qr-code-generator', 'whatsapp-link-generator', 'barcode-generator'],
  },
  {
    slug: 'add-text-to-image', name: 'Add Text to Image', short: 'Make memes, quotes and captions on photos.',
    metaDescription: 'Add text to any photo online: make memes with classic top and bottom text, quote images and captions. Choose style, size and colour.',
    intro: 'Put text on a picture in seconds: classic memes, quotes or captions. Choose the style, size and colour and download.',
    category: 'image', icon: 'Captions', keywords: ['add text to image', 'meme generator', 'meme maker', 'text on photo', 'caption image'],
    handlesFiles: true, steps: ['Upload an image.', 'Type top and bottom text.', 'Pick a style and download.'],
    faqs: [{ q: 'Can I use any image?', a: 'Use your own photos or images you have the right to use.' }],
    related: ['collage-maker', 'crop-image', 'image-resizer'],
  },
  {
    slug: 'collage-maker', name: 'Photo Collage Maker', short: 'Combine 2–9 photos into one collage.',
    metaDescription: 'Free photo collage maker: combine up to 9 photos into a square, 4:5, story or wide collage with spacing, rounded corners and background colour.',
    intro: 'Turn several photos into one beautiful collage for Instagram, WhatsApp status or printing. The layout adjusts automatically.',
    category: 'image', icon: 'LayoutGrid', keywords: ['collage maker', 'photo collage', 'photo grid', 'combine photos', 'instagram collage'],
    handlesFiles: true, steps: ['Add 2–9 photos.', 'Choose the shape, spacing and corners.', 'Download the collage.'],
    faqs: [{ q: 'What size is the collage?', a: 'High resolution: 2160 px wide for square and 4:5, and 1620 × 2880 for stories.' }],
    related: ['instagram-grid-maker', 'add-text-to-image', 'image-resizer'],
  },
  {
    slug: 'instagram-grid-maker', name: 'Instagram Grid Maker', short: 'Split one photo into a 3×1, 3×2 or 3×3 grid.',
    metaDescription: 'Split a photo into an Instagram grid: 3×1, 3×2 or 3×3 tiles in the new 4:5 or square shape, numbered in posting order.',
    intro: 'Create a giant puzzle picture on your Instagram profile. Split one photo into tiles that line up perfectly when posted in order.',
    category: 'image', icon: 'Grid3x3', keywords: ['instagram grid maker', 'split image for instagram', 'grid splitter', 'instagram puzzle', '3x3 grid'],
    handlesFiles: true, steps: ['Upload a photo.', 'Choose 3×1, 3×2 or 3×3 and the tile shape.', 'Download the tiles and post them in the numbered order.'],
    faqs: [{ q: 'Why 4:5 tiles?', a: 'Instagram’s profile grid now shows posts as taller rectangles, so 4:5 tiles line up best.' }],
    related: ['collage-maker', 'image-resizer', 'crop-image'],
  },
  {
    slug: 'blur-image', name: 'Blur & Hide Info in Image', short: 'Pixelate or black out private details before sharing.',
    metaDescription: 'Blur or black out parts of a screenshot or photo: hide names, phone numbers, addresses, faces or bank details before sharing. Private, in your browser.',
    intro: 'Sharing a screenshot? Drag over names, numbers, faces or addresses to pixelate them or cover them with a black box.',
    category: 'image', icon: 'EyeOff', keywords: ['blur image', 'pixelate image', 'censor screenshot', 'hide information in photo', 'blur face'],
    handlesFiles: true, steps: ['Upload a screenshot or photo.', 'Drag over the parts to hide.', 'Download the safe version.'],
    faqs: [{ q: 'Is pixelation safe for passwords or bank numbers?', a: 'Use Black box for sensitive data: it removes the information completely, while pixelation can sometimes be guessed.' }],
    related: ['crop-image', 'add-text-to-image', 'image-compressor'],
  },
  {
    slug: 'invoice-generator', name: 'Invoice Generator', short: 'Create professional invoices with GST/VAT as PDF.',
    metaDescription: 'Free invoice generator: add your logo, items, GST or VAT and discounts, then download a professional PDF invoice. No sign-up, saved on your device.',
    intro: 'Bill clients in minutes. Add your business details, logo and items, and LifeKit works out tax and totals and creates a clean PDF invoice.',
    category: 'pdf', icon: 'ReceiptText', keywords: ['invoice generator', 'free invoice maker', 'gst invoice', 'bill generator', 'invoice pdf', 'freelance invoice'],
    badge: 'new', handlesFiles: false,
    steps: ['Fill in your details and the client’s.', 'Add items, quantities and rates.', 'Set tax and discount.', 'Download the PDF.'],
    faqs: [
      { q: 'Is it a valid GST invoice?', a: 'It includes the common fields (GSTIN, tax, totals), but GST invoices have specific legal requirements. Check what your business needs.' },
      { q: 'Is my data saved?', a: 'Your details are saved in this browser for next time. Nothing is uploaded.' },
    ],
    related: ['gst-calculator', 'number-to-words', 'resume-builder'],
  },
  {
    slug: 'resume-builder', name: 'Resume Builder', short: 'Fill in a form and download a clean, ATS-friendly resume.',
    metaDescription: 'Free resume builder: fill in your experience, education and skills and download a clean, ATS-friendly PDF resume. No sign-up, saved on your device.',
    intro: 'Create a professional one-column resume that recruiters and applicant tracking systems can read easily. Fill in the form and download a PDF.',
    category: 'pdf', icon: 'FileUser', keywords: ['resume builder', 'cv maker', 'free resume maker', 'ats resume', 'resume pdf', 'fresher resume'],
    badge: 'new', handlesFiles: false,
    steps: ['Fill in your contact details and summary.', 'Add experience, projects and education with bullet points.', 'Add skills and achievements.', 'Download the PDF.'],
    faqs: [
      { q: 'Is it ATS-friendly?', a: 'Yes. It uses a simple single-column layout with standard headings and real text, which applicant tracking systems read well.' },
      { q: 'Is my information private?', a: 'Everything stays in your browser. Nothing is uploaded.' },
    ],
    related: ['invoice-generator', 'text-to-handwriting', 'word-counter'],
  },
];

export const toolsBySlug: Record<string, Tool> = Object.fromEntries(tools.map((t) => [t.slug, t]));

export function getCategory(id: CategoryId): Category {
  const c = categories.find((cat) => cat.id === id);
  if (!c) throw new Error(`Unknown category ${id}`);
  return c;
}
