/**
 * PWA Icon Generator Script
 * Run: node scripts/generate-icons.js
 *
 * Requires: npm install sharp
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('⚠️  sharp not installed. Run: npm install sharp --save-dev');
  console.log('📝 Creating placeholder icons instead...\n');
  createPlaceholderIcons();
  process.exit(0);
}

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const ICONS_DIR = path.join(__dirname, '../public/icons');
const SVG_PATH = path.join(ICONS_DIR, 'icon.svg');

async function generateIcons() {
  console.log('🎨 Generating PWA icons...\n');

  // Ensure icons directory exists
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  // Read SVG
  const svgBuffer = fs.readFileSync(SVG_PATH);

  // Generate each size
  for (const size of ICON_SIZES) {
    const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`✅ Created: icon-${size}x${size}.png`);
  }

  // Generate Apple Touch Icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(ICONS_DIR, 'apple-touch-icon.png'));

  console.log('✅ Created: apple-touch-icon.png');

  // Generate favicon
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, '../public/favicon.png'));

  console.log('✅ Created: favicon.png');

  console.log('\n🎉 All icons generated successfully!');
}

function createPlaceholderIcons() {
  // Create simple placeholder text files indicating icons need to be generated
  const ICONS_DIR = path.join(__dirname, '../public/icons');

  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  // Create a README for icons
  const readme = `# PWA Icons

These icons need to be generated from icon.svg

## Option 1: Use the script
\`\`\`bash
npm install sharp --save-dev
node scripts/generate-icons.js
\`\`\`

## Option 2: Use online tool
1. Go to https://realfavicongenerator.net/
2. Upload the icon.svg file
3. Download and extract icons here

## Option 3: Use Figma/Photoshop
Export icon.svg to these sizes:
- 72x72, 96x96, 128x128, 144x144
- 152x152, 192x192, 384x384, 512x512
`;

  fs.writeFileSync(path.join(ICONS_DIR, 'README.md'), readme);
  console.log('📄 Created: icons/README.md with instructions');
}

generateIcons().catch(console.error);
