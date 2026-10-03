import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public/icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

const resDir = path.resolve('android/app/src/main/res');

const sizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

async function generateAndroidIcons() {
  console.log('Generating Android native launcher icons...');
  for (const [folder, size] of Object.entries(sizes)) {
    const targetFolder = path.join(resDir, folder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    // Standard square launcher icon
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher.png'));

    // Round launcher icon
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher_round.png'));

    // Foreground icon for adaptive icons
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher_foreground.png'));

    console.log(`Generated ${folder} (${size}x${size})`);
  }
  console.log('Android APK icons updated successfully!');
}

generateAndroidIcons().catch((err) => {
  console.error('Error generating android icons:', err);
  process.exit(1);
});
