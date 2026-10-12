const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'assets/bip-max.s');
const cream = '#ded9cc';
const transparent = {
  r: 0,
  g: 0,
  b: 0,
  alpha: 0
};
const canvas = (w, h) => sharp({
  create: {
    width: w,
    height: h,
    channels: 4,
    background: transparent
  }
});
const svg = (body, w, h) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`);
const saveSVG = (name, body, w, h) => sharp(svg(body, w, h)).png().toFile(path.join(out, name));

async function label(text, file, width, height, font, color = cream, fontfile) {
  const input = await sharp({
    text: {
      text: `<span foreground="${color}">${text}</span>`,
      font,
      fontfile,
      rgba: true
    }
  }).png().toBuffer();
  const {
    width: w,
    height: h
  } = await sharp(input).metadata();
  const resized = await sharp(input).resize({
    width: Math.min(w, width),
    height: Math.min(h, height),
    fit: 'inside'
  }).toBuffer();
  const m = await sharp(resized).metadata();
  await canvas(width, height).composite([{
    input: resized,
    left: 0,
    top: Math.floor((height - m.height) / 2)
  }]).png().toFile(path.join(out, file));
}

async function createBaseAssets() {
  for (const folder of ['time', 'aod', 'small', 'date', 'icons', 'battery', 'weather', 'feathers', 'quotes']) {
    await fs.mkdir(path.join(out, folder), {
      recursive: true
    });
  }
  await sharp(path.join(root, 'art/source/background.png')).resize(432, 514).png().toFile(path.join(out, 'background.png'));
  await canvas(143, 42).png().toFile(path.join(out, 'touch.png'));
}

async function createTypography() {
  const fontfile = path.join(root, 'art/fonts/IMFellEnglish.ttf');
  for (let n = 0; n < 10; n++) {
    await label(String(n), `time/${n}.png`, 60, 84, 'IM FELL English 92', cream, fontfile);
    await label(String(n), `aod/${n}.png`, 60, 84, 'IM FELL English 92', '#888888', fontfile);
    await label(String(n), `small/${n}.png`, 13, 27, 'IM FELL English 25', cream, fontfile);
    await label(String(n), `date/${n}.png`, 13, 23, 'IM FELL English 20', cream, fontfile);
  }
  await label(':', 'time/colon.png', 24, 84, 'IM FELL English 82', cream, fontfile);
  await label(':', 'aod/colon.png', 24, 84, 'IM FELL English 82', '#888888', fontfile);
  for (const [text, name, width] of [['%', 'percent', 20], ['°', 'degree', 12], ['−', 'minus', 14], ['--', 'invalid', 25]]) {
    await label(text, `small/${name}.png`, width, 27, 'IM FELL English 24', cream, fontfile);
  }
  for (const d of ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']) {
    await label(d.toUpperCase() + ',', `date/${d}.png`, 57, 23, 'IM FELL English 18', cream, fontfile);
  }
  for (const [i, month] of ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].entries()) {
    await label(month, `date/month-${i + 1}.png`, 46, 23, 'IM FELL English 18', cream, fontfile);
  }
}

async function createStatusIcons() {
  await saveSVG('icons/heart.png', `<path fill="${cream}" d="M12 22L2.8 12.6C-4 5.7 5.5-1.3 12 5.4 18.5-1.3 28 5.7 21.2 12.6Z"/>`, 24, 24);
  await saveSVG('icons/steps.png', `<g fill="${cream}" transform="rotate(15 12 12)"><ellipse cx="7" cy="8" rx="3.6" ry="6"/><ellipse cx="7" cy="18" rx="3.2" ry="3.7"/><ellipse cx="18" cy="5" rx="3.6" ry="6"/><ellipse cx="18" cy="15" rx="3.2" ry="3.7"/></g>`, 24, 26);
}

async function createBatteryIcons() {
  for (let n = 0; n <= 100; n++) {
    const h = 18 * n / 100;
    await saveSVG(`battery/${n}.png`, `<rect x="6" y="0" width="8" height="3" rx="1" fill="${cream}"/><rect x="2" y="4" width="16" height="23" rx="2" fill="none" stroke="${cream}" stroke-width="2"/>${n ? `<rect x="5" y="${24 - h}" width="10" height="${h}" fill="${cream}"/>` : ''}`, 20, 28);
  }
}

async function createWeatherIcons() {
  const cloud = '<path d="M5 20h17a5 5 0 000-10 7 7 0 00-13-2A6 6 0 005 20Z"/>';
  const sun = '<circle cx="14" cy="13" r="5"/><path d="M14 1v4m0 16v4M2 13h4m16 0h4M5 4l3 3m12 12 3 3M5 22l3-3M20 7l3-3"/>';
  const moon = '<path d="M20 3A10 10 0 101 14C14 18 20 12 20 3Z"/>';
  for (let n = 0; n < 29; n++) {
    let body = cloud;
    if (n === 3) {
      body = sun;
    } else if (n === 28) {
      body = moon;
    } else if ([1, 5, 7, 10, 18, 21, 24, 27].includes(n)) {
      body = cloud + '<path d="M8 22l-2 3m9-3-2 3m9-3-2 3"/>';
    } else if ([2, 6, 8, 9, 12, 16, 19].includes(n)) {
      body = cloud + '<path d="M8 22v4m-2-2h4m8-2v4m-2-2h4"/>';
    } else if ([15, 20].includes(n)) {
      body = cloud + '<path d="M15 16l-5 6h6l-3 4"/>';
    } else if ([11, 13, 14, 17, 22, 23].includes(n)) {
      body = '<path d="M2 8h23M6 13h17M2 18h23M6 23h17"/>';
    } else if (n === 25) {
      body = '<path d="M9 8a5 5 0 0110 0c0 4-5 4-5 8m0 4v2"/>';
    }
    await saveSVG(`weather/${n}.png`, `<g fill="none" stroke="${cream}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</g>`, 28, 28);
  }
}

async function createFeathers() {
  const source = await sharp(path.join(root, 'art/source/feather.png')).trim().png().toBuffer();
  for (const [size, length] of [[72, 54], [56, 41], [44, 32]]) {
    for (let frame = 0; frame < 72; frame++) {
      const phase = frame / 72 * Math.PI * 2;
      const angle = 40 * Math.sin(phase) + 9 * Math.sin(phase * 2);
      const width = Math.round(length * (0.62 + 0.38 * Math.abs(Math.cos(phase + 0.4))));
      const input = await sharp(source).resize(length, length, { fit: 'inside' }).resize({ width }).rotate(angle, { background: transparent }).png().toBuffer();
      const m = await sharp(input).metadata();
      await canvas(size, size).composite([{ input, left: Math.floor((size - m.width) / 2), top: Math.floor((size - m.height) / 2) }]).png().toFile(path.join(out, `feathers/${size}-${frame}.png`));
    }
  }
}

async function createQuotes() {
  const fontfile = path.join(root, 'art/fonts/IMFellEnglish.ttf');
  const phrases = [
    ['MY', 'SOLDIERS,', 'PUSH', 'FORWARD!'],
    ['MY', 'SOLDIERS,', 'SCREAM', 'OUT!'],
    ['MY', 'SOLDIERS,', 'RAGE!']
  ];
  for (const [n, lines] of phrases.entries()) {
    const parts = [];
    const top = Math.floor((104 - lines.length * 24) / 2);
    for (const [line, text] of lines.entries()) {
      const input = await sharp({
        text: {
          text: `<span foreground="${cream}">${text}</span>`,
          font: 'IM FELL English 19',
          fontfile,
          rgba: true
        }
      }).png().toBuffer();
      const m = await sharp(input).metadata();
      parts.push({ input, left: Math.floor((108 - m.width) / 2), top: top + line * 24 });
    }
    const source = await canvas(108, 104).composite(parts).png().toBuffer();
    for (let frame = 0; frame <= 117; frame++) {
      const seconds = frame / 30;
      const glow = (1 + Math.cos(seconds * Math.PI * 2 / 4)) / 2;
      const entry = Math.max(0, 1 - frame / 3) ** 2;
      const scale = 0.96 + entry * 0.04;
      const envelope = Math.max(0, Math.min(1, (3.9 - seconds) / 0.18));
      const width = Math.round(108 * scale);
      const height = Math.round(104 * scale);
      const input = await sharp(source).resize(width, height).png().toBuffer();
      const { data, info } = await canvas(108, 104).composite([{
        input,
        left: Math.floor((108 - width) / 2),
        top: Math.floor((104 - height) / 2)
      }]).raw().toBuffer({ resolveWithObject: true });
      for (let i = 3; i < data.length; i += 4) {
        data[i] = Math.round(data[i] * envelope * (0.7 + glow * 0.2));
      }
      await sharp(data, { raw: info }).png().toFile(path.join(out, `quotes/${n}-${frame}.png`));
    }
  }
}

async function createPreview() {
  const layers = [];
  const place = (file, x, y) => layers.push({ input: path.join(out, file), left: x, top: y });
  place('date/tue.png', 136, 52);
  place('date/month-4.png', 199, 52);
  place('date/1.png', 251, 52);
  place('date/6.png', 265, 52);
  place('time/1.png', 77, 89);
  place('time/0.png', 140, 89);
  place('time/colon.png', 204, 89);
  place('time/0.png', 232, 89);
  place('time/8.png', 295, 89);
  for (const [text, y] of [['7432', 354], ['72', 389], ['84', 424], ['25', 459]]) {
    [...text].forEach((n, i) => place(`small/${n}.png`, 62 + i * 14, y));
  }
  place('icons/steps.png', 30, 354);
  place('icons/heart.png', 30, 389);
  place('battery/84.png', 32, 424);
  place('small/percent.png', 90, 424);
  place('weather/0.png', 28, 459);
  place('small/degree.png', 90, 459);
  place('quotes/0-30.png', 317, 221);
  place('feathers/72-18.png', 41, 245);
  place('feathers/56-48.png', 338, 160);
  place('feathers/44-9.png', 244, 448);
  await sharp(path.join(out, 'background.png')).composite(layers).png().toFile(path.join(root, 'art/preview.png'));
  await sharp(path.join(root, 'art/preview.png')).resize(294, 350).png().toFile(path.join(out, 'preview.png'));
}

async function main() {
  await createBaseAssets();
  await createTypography();
  await createStatusIcons();
  await createBatteryIcons();
  await createWeatherIcons();
  await createFeathers();
  await createQuotes();
  await createPreview();
}

main().catch(error => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
