const digits = folder => Array.from({
  length: 10
}, (_, n) => `${folder}/${n}.png`);
const NORMAL = hmUI.show_level.ONLY_NORMAL;
const AOD = hmUI.show_level.ONAL_AOD;
const createWidget = (kind, props) => hmUI.createWidget(hmUI.widget[kind], {
  show_level: NORMAL,
  ...props
});
const createMetric = (type, y, unit) => createWidget('TEXT_IMG', {
  x: 62,
  y,
  w: 95,
  h: 27,
  type: hmUI.data_type[type],
  font_array: digits('small'),
  h_space: 1,
  align_h: hmUI.align.LEFT,
  invalid_image: 'small/invalid.png',
  negative_image: 'small/minus.png',
  ...(unit ? {
    unit_en: `small/${unit}.png`,
    unit_sc: `small/${unit}.png`,
    unit_tc: `small/${unit}.png`
  } : {})
});

const featherSpecs = [
  { size: 72, x: 42, offset: 310, speed: 22, sway: 23, phase: 0 },
  { size: 56, x: 341, offset: 180, speed: 19, sway: 19, phase: 2.4 },
  { size: 44, x: 236, offset: 500, speed: 25, sway: 28, phase: 4.7 },
  { size: 44, x: 365, offset: 440, speed: 24, sway: 12, phase: 1.1 }
];
const quotePositions = [{ x: 317, y: 221 }, { x: 8, y: 213 }, { x: 290, y: 398 }];

function createArtwork(face) {
  createWidget('IMG', { x: 0, y: 0, src: 'background.png' });
  face.feathers = featherSpecs.map(spec => createWidget('IMG', {
    x: spec.x,
    y: spec.offset - spec.size,
    w: spec.size,
    h: spec.size,
    src: `feathers/${spec.size}-0.png`
  }));
  face.quote = createWidget('IMG', { x: 317, y: 221, src: 'quotes/0-117.png' });
  face.animationTime = 0;
  face.animationTimer = null;
  face.quoteState = '';
}

function animate(face) {
  const seconds = face.animationTime / 1000;
  featherSpecs.forEach((spec, index) => {
    const phase = seconds * 1.05 + spec.phase;
    const frame = Math.floor(((phase / (Math.PI * 2)) % 1) * 72);
    const distance = (seconds * spec.speed + spec.offset) % (514 + spec.size * 2);
    face.feathers[index].setProperty(hmUI.prop.MORE, {
      x: Math.round(spec.x + Math.sin(phase) * spec.sway + Math.sin(phase * 0.47) * 5),
      y: Math.round(distance - spec.size + Math.sin(phase * 2) * 3),
      w: spec.size,
      h: spec.size,
      src: `feathers/${spec.size}-${frame}.png`
    });
  });
  const cycle = seconds % 15;
  const index = Math.min(2, Math.floor(cycle / 4.4));
  const local = cycle - index * 4.4;
  const frame = Math.min(117, Math.floor(local * 30));
  const key = `${index}-${frame}`;
  if (key !== face.quoteState) {
    face.quote.setProperty(hmUI.prop.MORE, {
      x: quotePositions[index].x,
      y: quotePositions[index].y,
      src: `quotes/${index}-${frame}.png`
    });
    face.quoteState = key;
  }
}

function startAnimation(face) {
  if (face.animationTimer !== null) return;
  animate(face);
  face.animationTimer = timer.createTimer(33, 33, () => {
    face.animationTime += 33;
    animate(face);
  }, {});
}

function stopAnimation(face) {
  if (face.animationTimer === null) return;
  timer.stopTimer(face.animationTimer);
  face.animationTimer = null;
}

function createClocks() {
  for (const [folder, level] of [['time', NORMAL], ['aod', AOD]]) {
    createWidget('IMG_TIME', {
      hour_startX: 77,
      hour_startY: 89,
      hour_array: digits(folder),
      hour_space: 3,
      hour_zero: 1,
      hour_align: hmUI.align.LEFT,
      minute_startX: 232,
      minute_startY: 89,
      minute_array: digits(folder),
      minute_space: 3,
      minute_zero: 1,
      minute_follow: 0,
      minute_align: hmUI.align.LEFT,
      show_level: level
    });
    createWidget('IMG', { x: 204, y: 89, src: `${folder}/colon.png`, show_level: level });
  }
}

function createDate() {
  const weekImages = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => `date/${day}.png`);
  const monthImages = Array.from({
    length: 12
  }, (_, n) => `date/month-${n + 1}.png`);
  const dayImages = digits('date');
  createWidget('IMG_WEEK', {
    x: 136,
    y: 52,
    week_en: weekImages,
    week_sc: weekImages,
    week_tc: weekImages
  });
  createWidget('IMG_DATE', {
    month_startX: 199,
    month_startY: 52,
    month_is_character: true,
    month_en_array: monthImages,
    month_sc_array: monthImages,
    month_tc_array: monthImages,
    month_zero: 0,
    month_space: 0,
    day_startX: 251,
    day_startY: 52,
    day_en_array: dayImages,
    day_sc_array: dayImages,
    day_tc_array: dayImages,
    day_zero: 1,
    day_follow: 0,
    day_space: 1
  });
}

function createSteps() {
  createWidget('IMG', {
    x: 30,
    y: 354,
    src: 'icons/steps.png'
  });
  createMetric('STEP', 354);
}

function createHeartRate(face) {
  createWidget('IMG', {
    x: 30,
    y: 389,
    src: 'icons/heart.png'
  });
  face.heartText = createMetric('HEART', 389);
  face.heart = hmSensor.createSensor(hmSensor.id.HEART);
  face.updateHeart = () => {
    const current = face.heart.current;
    const last = face.heart.last;
    const valid = value => typeof value === 'number' && isFinite(value) && value > 0 && value <= 250;
    const value = valid(last) ? last : valid(current) ? current : null;
    face.heartText.setProperty(hmUI.prop.TEXT, value === null ? '--' : String(Math.round(value)));
  };
  face.heart.addEventListener(hmSensor.event.CURRENT, face.updateHeart);
  face.heart.addEventListener(hmSensor.event.LAST, face.updateHeart);
  face.updateHeart();
}

function createBattery(face) {
  createMetric('BATTERY', 424, 'percent');
  face.battery = hmSensor.createSensor(hmSensor.id.BATTERY);
  face.batteryIcon = createWidget('IMG', {
    x: 32,
    y: 424,
    src: 'battery/0.png'
  });
  face.updateBattery = () => {
    const raw = face.battery.current;
    const percent = typeof raw === 'number' && isFinite(raw) ? Math.max(0, Math.min(100, Math.round(raw))) : 0;
    face.batteryIcon.setProperty(hmUI.prop.MORE, {
      src: `battery/${percent}.png`
    });
  };
  face.battery.addEventListener(hmSensor.event.CHANGE, face.updateBattery);
  face.updateBattery();
}

function createWeather() {
  createWidget('IMG_LEVEL', {
    x: 28,
    y: 459,
    w: 28,
    h: 26,
    type: hmUI.data_type.WEATHER_CURRENT,
    image_array: Array.from({
      length: 29
    }, (_, n) => `weather/${n}.png`),
    image_length: 29
  });
  createMetric('WEATHER_CURRENT', 459, 'degree');
}

function createTouchTargets() {
  for (const [type, y] of [['STEP', 350], ['HEART', 385], ['BATTERY', 420], ['WEATHER_CURRENT', 455]]) {
    createWidget('IMG_CLICK', {
      x: 22,
      y,
      w: 113,
      h: 35,
      src: 'touch.png',
      type: hmUI.data_type[type]
    });
  }
}

WatchFace({
  build() {
    createArtwork(this);
    createClocks();
    createDate();
    createSteps();
    createHeartRate(this);
    createBattery(this);
    createWeather();
    createTouchTargets();
    createWidget('WIDGET_DELEGATE', {
      resume_call: () => {
        this.updateBattery();
        this.updateHeart();
        startAnimation(this);
      },
      pause_call: () => stopAnimation(this)
    });
    startAnimation(this);
  },
  onDestroy() {
    stopAnimation(this);
    if (this.battery && this.updateBattery) {
      this.battery.removeEventListener(hmSensor.event.CHANGE, this.updateBattery);
    }
    if (this.heart && this.updateHeart) {
      this.heart.removeEventListener(hmSensor.event.CURRENT, this.updateHeart);
      this.heart.removeEventListener(hmSensor.event.LAST, this.updateHeart);
    }
  }
});
