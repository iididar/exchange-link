// =====================================================
// ١. پاراستنی کلیکی ڕاست و پشکنینی کۆد (Security)
// =====================================================
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('keydown', (e) => {
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
    (e.ctrlKey && ['U', 'S'].includes(e.key.toUpperCase()))
  ) {
    e.preventDefault();
  }
});

// =====================================================
// ٢. بارکردنی خێرای وێنەکان (.jpeg لە پێشەوەیە)
// =====================================================
function resolveImageFile(baseName, onSuccess, onFail) {
  const extensions = ['.jpeg', '.JPEG', '.PNG', '.png', '.JPG', '.jpg', '.webp', ''];
  let idx = 0;

  function tryNext() {
    if (idx >= extensions.length) {
      if (onFail) onFail();
      return;
    }
    const candidate = baseName + extensions[idx++];
    const img = new Image();
    img.onload = () => onSuccess(candidate, img);
    img.onerror = tryNext;
    img.src = candidate;
  }
  tryNext();
}

// پاککردنەوەی تەواوەتی باگراوندی واژووەکە (کردنی بە شەفاف)
function removeSignatureBackground(imgElement, loadedImg) {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = loadedImg.naturalWidth || loadedImg.width;
    canvas.height = loadedImg.naturalHeight || loadedImg.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(loadedImg, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      if (lum < 65) {
        data[i + 3] = 0;
      } else {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = Math.min(255, Math.round((lum - 65) * 2.2));
      }
    }

    ctx.putImageData(imgData, 0, 0);
    imgElement.src = canvas.toDataURL('image/png');
    imgElement.classList.add('clean-alpha');
  } catch (e) {
    imgElement.src = loadedImg.src;
  }
}

resolveImageFile('IMG_6140', (validPath) => {
  document.getElementById('faviconLink').href = validPath;
  document.getElementById('appleIconLink').href = validPath;
});

const sigImgEl = document.getElementById('signatureImg');
const fallbackSigEl = document.getElementById('fallbackSig');
resolveImageFile('IMG_6071', (validPath, loadedImg) => {
  removeSignatureBackground(sigImgEl, loadedImg);
  sigImgEl.style.display = 'block';
  fallbackSigEl.style.display = 'none';
});

const introOverlayEl = document.getElementById('introOverlay');
const introImgEl = document.getElementById('introImg');
resolveImageFile(
  'IMG_6165',
  (validPath) => {
    introImgEl.src = validPath;
    introImgEl.style.display = 'block';
    setTimeout(() => {
      introOverlayEl.classList.add('hide');
    }, 2300);
  },
  () => {
    introOverlayEl.classList.add('hide');
  }
);

// =====================================================
// ٣. سیستمی حاسیبە، دراوەکان و ڕێکخستنەکان
// =====================================================
const RATES_URL = 'rates.json';

const TRANSLATIONS = {
  ku: {
    dir: 'rtl',
    locale: 'ku',
    title: 'نرخی دراوەکان - Exchange App',
    introAlt: 'پێشەکی بەرنامەی گۆڕینی دراو',
    signatureAlt: 'واژووی دیدار ئەحمەد',
    footer: 'Developed by (Didar Ahmad)',
    menuTitle: 'ڕێکخستنەکان',
    close: 'داخستن',
    discount: 'کاراکردنی ١٠٠٠دینار کەمتر بۆ وەرگرتنی دۆلار',
    darkMode: 'دۆخی تاریک',
    language: 'زمان',
    currenciesLabel: 'هەڵبژاردنی دراو',
    refresh: 'نوێکردنەوەی نرخەکان',
    metals: 'زێـڕ و زیـو',
    goldTitle: 'نرخی زێـڕ',
    silverTitle: 'نرخی زیـو',
    metalNames: {
      goldOunce: 'ئۆنسەی زێـڕ',
      gold18k: 'زێـڕی عەیارە 18',
      gold21k: 'زێـڕی عەیارە 21',
      gold22k: 'زێـڕی عەیارە 22',
      gold24k: 'زێـڕی عەیارە 24',
      dubaiLira: 'لیرەی دوبەی',
      silverOunce: 'ئۆنسەی زیـو',
      silverKg: 'زیـو بە کیلۆ'
    },
    metalsLoading: 'نوێکردنەوەی نرخەکان...',
    metalsUnavailable: 'نرخەکانی زێـڕ و زیـو بەردەست نین.',
    menu: 'مێنیو',
    swap: 'گۆڕین',
    dateHelp: 'گرتە بکە بۆ بینینی ڕۆژ',
    whatsapp: 'پەیوەندی لە ڕێگەی واتسئەپ',
    unavailable: 'نرخی تمەن بەردەست نییە',
    iqd: 'دینار',
    usd: 'دۆلار',
    toman: 'تمەن',
    lira: 'لیرە',
    currencyTitles: {
      USD: 'نرخی دۆلار', GBP: 'نرخی پاوەند', EUR: 'نرخی یۆرۆ',
      TRY: 'نرخی لیرەی تورکی', IRR: 'نرخی تمەنی ئێرانی'
    },
    currencies: {
      USD: 'دۆلار', GBP: 'پاوەند', EUR: 'یۆرۆ',
      TRY: 'لیرەی تورکی', IRR: 'تمەن'
    },
    days: ['یەک شەممە', 'دوو شەممە', 'سێ شەممە', 'چوار شەممە', 'پێنج شەممە', 'هەینی', 'شەممە']
  },
  ar: {
    dir: 'rtl',
    locale: 'ar',
    title: 'أسعار العملات - Exchange App',
    introAlt: 'مقدمة تطبيق تحويل العملات',
    signatureAlt: 'توقيع ديدار أحمد',
    footer: 'Developed by (Didar Ahmad)',
    menuTitle: 'الإعدادات',
    close: 'إغلاق',
    discount: 'تفعيل خصم ١٠٠٠ دينار عند شراء الدولار',
    darkMode: 'الوضع الداكن',
    language: 'اللغة',
    currenciesLabel: 'اختيار العملة',
    refresh: 'تحديث الأسعار',
    metals: 'الذهب والفضة',
    goldTitle: 'أسعار الذهب',
    silverTitle: 'أسعار الفضة',
    switchToSilver: 'أسعار الفضة',
    switchToGold: 'الذهب',
    metalNames: {
      goldOunce: 'أونصة الذهب',
      gold18k: 'ذهب عيار 18',
      gold21k: 'ذهب عيار 21',
      gold22k: 'ذهب عيار 22',
      gold24k: 'ذهب عيار 24',
      dubaiLira: 'ليرة دبي',
      silverOunce: 'أونصة الفضة',
      silverKg: 'الفضة لكل كيلوغرام'
    },
    metalsLoading: 'جارٍ تحديث الأسعار...',
    metalsUnavailable: 'أسعار الذهب والفضة غير متاحة.',
    menu: 'القائمة',
    swap: 'تبديل',
    dateHelp: 'اضغط لعرض اليوم',
    whatsapp: 'تواصل عبر واتساب',
    unavailable: 'سعر التومان غير متاح',
    iqd: 'دينار',
    usd: 'دولار',
    toman: 'تومان',
    lira: 'ليرة',
    currencyTitles: {
      USD: 'سعر الدولار', GBP: 'سعر الجنيه الإسترليني', EUR: 'سعر اليورو',
      TRY: 'سعر الليرة التركية', IRR: 'سعر التومان الإيراني'
    },
    currencies: {
      USD: 'دولار', GBP: 'جنيه إسترليني', EUR: 'يورو',
      TRY: 'ليرة تركية', IRR: 'تومان'
    },
    days: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  },
  en: {
    dir: 'ltr',
    locale: 'en',
    title: 'Exchange Rates - Exchange App',
    introAlt: 'Exchange app introduction',
    signatureAlt: 'Didar Ahmad signature',
    footer: 'Developed by (Didar Ahmad)',
    menuTitle: 'Settings',
    close: 'Close',
    discount: 'Apply 1,000 IQD discount when buying dollars',
    darkMode: 'Dark mode',
    language: 'Language',
    currenciesLabel: 'Select currency',
    refresh: 'Refresh rates',
    metals: 'Precious metals',
    goldTitle: 'Gold Prices',
    silverTitle: 'Silver Prices',
    switchToSilver: 'Silver Prices',
    switchToGold: 'Gold',
    metalNames: {
      goldOunce: 'Gold Ounce',
      gold18k: '18K Gold',
      gold21k: '21K Gold',
      gold22k: '22K Gold',
      gold24k: '24K Gold',
      dubaiLira: 'Dubai Lira',
      silverOunce: 'Silver Ounce',
      silverKg: 'Silver per Kilogram'
    },
    metalsLoading: 'Updating prices...',
    metalsUnavailable: 'Gold and silver prices are unavailable.',
    menu: 'Menu',
    swap: 'Swap currencies',
    dateHelp: 'Tap to show weekday',
    whatsapp: 'Contact via WhatsApp',
    unavailable: 'Toman rate unavailable',
    iqd: 'Iraqi Dinar',
    usd: 'US Dollar',
    toman: 'Toman',
    lira: 'Lira',
    currencyTitles: {
      USD: 'US Dollar Rate', GBP: 'British Pound Rate', EUR: 'Euro Rate',
      TRY: 'Turkish Lira Rate', IRR: 'Iranian Toman Rate'
    },
    currencies: {
      USD: 'US Dollar', GBP: 'British Pound', EUR: 'Euro',
      TRY: 'Turkish Lira', IRR: 'Toman'
    },
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  }
};

const CURRENCY_SYMBOLS = { USD: '$', GBP: '£', EUR: '€', TRY: 'TRY', IRR: 'IRR' };
const savedLanguage = localStorage.getItem('language');
const initialLanguage = Object.hasOwn(TRANSLATIONS, savedLanguage) ? savedLanguage : 'ku';

const savedDarkPref = localStorage.getItem('darkMode');
const initialDarkMode = savedDarkPref !== null ? savedDarkPref === 'true' : true;
const savedBaseRate = Number(localStorage.getItem('telegramRate_USD')) || 0;
const savedRudawTomanBuy = Number(localStorage.getItem('rudawTomanBuy')) || 26450000;
const savedGbpUsdQuote = Number(localStorage.getItem('liveFxQuote_GBP')) ||
  (Number(localStorage.getItem('rudawQuote_GBP')) || 0) / 100;
const savedEurUsdQuote = Number(localStorage.getItem('liveFxQuote_EUR')) ||
  (Number(localStorage.getItem('rudawQuote_EUR')) || 0) / 100;
const savedUsdTryQuote = Number(localStorage.getItem('liveFxQuote_USDTRY')) || 0;
const METAL_PRICES_STORAGE_KEY = 'metalPrices';

function loadCachedMetalPrices() {
  try {
    const savedPrices = JSON.parse(localStorage.getItem(METAL_PRICES_STORAGE_KEY) || '{}');
    return {
      goldOunce: getPositivePrice(savedPrices.goldOunce),
      silverOunce: getPositivePrice(savedPrices.silverOunce)
    };
  } catch (error) {
    console.warn('Unable to load cached precious-metals prices.', error);
    return { goldOunce: null, silverOunce: null };
  }
}

function cacheMetalPrices(goldOunce, silverOunce) {
  try {
    localStorage.setItem(METAL_PRICES_STORAGE_KEY, JSON.stringify({
      goldOunce,
      silverOunce,
      updatedAt: Date.now()
    }));
  } catch (error) {
    console.warn('Unable to cache precious-metals prices.', error);
  }
}

const state = {
  // هەمیشە لە کاتی کردنەوەی وێبسایتەکەدا ڕاستەوخۆ دۆلار هەڵبژێردراوە
  selectedCurrency: 'USD',
  baseRatePer100USD: savedBaseRate,
  otherRates: {
    GBP: savedGbpUsdQuote > 0 && savedBaseRate > 0
      ? Math.round(savedGbpUsdQuote * savedBaseRate)
      : Number(localStorage.getItem('liveFxRate_GBP')) || Number(localStorage.getItem('rudawRate_GBP')) || 225000,
    EUR: savedEurUsdQuote > 0 && savedBaseRate > 0
      ? Math.round(savedEurUsdQuote * savedBaseRate)
      : Number(localStorage.getItem('liveFxRate_EUR')) || Number(localStorage.getItem('rudawRate_EUR')) || 185000,
    TRY: savedUsdTryQuote > 0 && savedBaseRate > 0
      ? Math.round((1000 / savedUsdTryQuote) * (savedBaseRate / 100))
      : Number(localStorage.getItem('liveFxRate_TRY')) || Number(localStorage.getItem('rudawRate_TRY')) || 33682,
    IRR: Number.isFinite(savedRudawTomanBuy) && savedRudawTomanBuy > 0 ? savedRudawTomanBuy : 26450000
  },
  rudawTomanBuy: Number.isFinite(savedRudawTomanBuy) && savedRudawTomanBuy > 0 ? savedRudawTomanBuy : 26450000,
  usdFxQuotes: {
    GBP: savedGbpUsdQuote,
    EUR: savedEurUsdQuote,
    USDTRY: savedUsdTryQuote
  },
  telegramTimestamp: Number(localStorage.getItem('telegramRateTime')) || 0,
  isTopForeign: true,
  rawInput: '0',
  minus1000Active: localStorage.getItem('minus1000Active') === 'true',
  secondaryCurrency: 'IQD',
  language: initialLanguage,
  isDarkMode: initialDarkMode,
  showDayName: false
};

const topAmountEl = document.getElementById('topAmount');
const bottomAmountEl = document.getElementById('bottomAmount');
const topNameEl = document.getElementById('topName');
const topSymbolEl = document.getElementById('topSymbol');
const bottomNameEl = document.getElementById('bottomName');
const bottomSymbolEl = document.getElementById('bottomSymbol');
const topCurrencyToggle = document.getElementById('topCurrencyToggle');
const bottomCurrencyToggle = document.getElementById('bottomCurrencyToggle');
const rateTitleEl = document.getElementById('rateTitle');
const liveRateBannerEl = document.getElementById('liveRateBanner');
const dateDisplayEl = document.getElementById('dateDisplay');
const timeDisplayEl = document.getElementById('timeDisplay');
const swapBtn = document.getElementById('swapBtn');
const keypad = document.getElementById('keypad');

const refreshBtn = document.getElementById('refreshBtn');
const metalsBtn = document.getElementById('metalsBtn');
const metalsView = document.getElementById('metalsView');
const metalsHeading = document.querySelector('.metals-heading');
const goldTab = document.getElementById('goldTab');
const silverTab = document.getElementById('silverTab');
const metalsStatus = document.getElementById('metalsStatus');
const metalPriceList = document.getElementById('metalPriceList');
const hamburgerBtn = document.getElementById('hamburgerBtn');
const menuBackdrop = document.getElementById('menuBackdrop');
const menuCloseBtn = document.getElementById('menuCloseBtn');
const menuTitleEl = document.getElementById('menuTitle');
const discountTextEl = document.getElementById('discountText');
const darkModeTextEl = document.getElementById('darkModeText');
const languageSelectorLabelEl = document.getElementById('languageSelectorLabel');
const currencySelectorLabelEl = document.getElementById('currencySelectorLabel');
const signatureLinkEl = document.getElementById('signatureLink');
const menuFooterEl = document.getElementById('menuFooter');
const discountToggle = document.getElementById('discountToggle');
const darkModeToggle = document.getElementById('darkModeToggle');
const currSelectBtns = document.querySelectorAll('.curr-select-btn');
const languageSelectBtns = document.querySelectorAll('.language-select-btn');

const METAL_PRIMARY_URL = 'https://data-asg.goldprice.org/dbXRates/USD';
const METAL_ALL_ORIGINS_URL = 'https://api.allorigins.win/raw';
const METAL_CORS_PROXY_URL = `https://corsproxy.io/?${encodeURIComponent(METAL_PRIMARY_URL)}`;
const METAL_SWISSQUOTE_PROXY_URL = `https://corsproxy.io/?${encodeURIComponent('https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAU/USD')}`;
const METAL_GOLD_API_URLS = {
  gold: 'https://api.gold-api.com/price/XAU',
  silver: 'https://api.gold-api.com/price/XAG'
};
const cachedMetalPrices = loadCachedMetalPrices();
const FX_INSTRUMENTS = {
  GBP: 'GBP/USD',
  EUR: 'EUR/USD',
  USDTRY: 'USD/TRY'
};
const metalState = {
  isSilver: false,
  isOpen: false,
  isFetching: false,
  isSwitching: false,
  goldOunce: cachedMetalPrices.goldOunce,
  silverOunce: cachedMetalPrices.silverOunce,
  flashTimers: new Map()
};
const rateFlashTimers = new Map();
const rateBannerPreviousValues = new Map();

const GOLD_PRICE_ITEMS = [
  { key: 'goldOunce', currency: 'USD', calculate: gold => gold },
  { key: 'dubaiLira', currency: 'USD', calculate: gold => gold * 0.2035 },
  { key: 'gold18k', currency: 'IQD', calculate: gold => (gold / 31.1035) * 5 * (18 / 24) },
  { key: 'gold21k', currency: 'IQD', calculate: gold => (gold / 31.1035) * 5 * (21 / 24) },
  { key: 'gold22k', currency: 'IQD', calculate: gold => (gold / 31.1035) * 5 * (22 / 24) },
  { key: 'gold24k', currency: 'IQD', calculate: gold => (gold / 31.1035) * 5 }
];
const SILVER_PRICE_ITEMS = [
  { key: 'silverOunce', currency: 'USD', calculate: silver => silver },
  { key: 'silverKg', currency: 'USD', calculate: silver => silver * 32.1507 }
];

// جێگیرکردنی دۆخی سەرەتایی دوگمەکان
discountToggle.checked = state.minus1000Active;
darkModeToggle.checked = state.isDarkMode;
if (!state.isDarkMode) {
  document.body.classList.add('light-mode');
}

function getEffectiveUsdRate() {
  return state.minus1000Active ? (state.baseRatePer100USD - 1000) : state.baseRatePer100USD;
}

function getTranslations() {
  return TRANSLATIONS[state.language];
}

function applyLanguage(language) {
  if (!Object.prototype.hasOwnProperty.call(TRANSLATIONS, language)) return;
  state.language = language;
  localStorage.setItem('language', language);

  const text = getTranslations();
  document.documentElement.lang = language;
  document.documentElement.dir = text.dir;
  document.title = text.title;
  document.querySelector('meta[name="apple-mobile-web-app-title"]').content = text.title;
  document.getElementById('introImg').alt = text.introAlt;
  document.getElementById('signatureImg').alt = text.signatureAlt;
  menuTitleEl.textContent = text.menuTitle;
  menuCloseBtn.setAttribute('aria-label', text.close);
  discountTextEl.textContent = text.discount;
  darkModeTextEl.textContent = text.darkMode;
  languageSelectorLabelEl.textContent = text.language;
  currencySelectorLabelEl.textContent = text.currenciesLabel;
  menuFooterEl.textContent = text.footer;
  refreshBtn.setAttribute('aria-label', text.refresh);
  refreshBtn.title = text.refresh;
  metalsBtn.setAttribute('aria-label', text.metals);
  metalsBtn.title = text.metals;
  hamburgerBtn.setAttribute('aria-label', text.menu);
  swapBtn.setAttribute('aria-label', text.swap);
  dateDisplayEl.title = text.dateHelp;
  signatureLinkEl.title = text.whatsapp;
  currSelectBtns.forEach((button) => {
    const currency = button.dataset.curr;
    button.textContent = text.currencies[currency];
  });
  languageSelectBtns.forEach((button) => {
    button.classList.toggle('active', button.dataset.lang === language);
    button.setAttribute('aria-pressed', String(button.dataset.lang === language));
  });

  renderConverterLabels();
  renderRateBanner();
  renderDateOrDay();
  renderMetalLabels();
  renderMetalPrices();
  calculateAndRender();
}

function renderMetalLabels() {
  const text = getTranslations();
  goldTab.textContent = text.goldTitle;
  silverTab.textContent = text.silverTitle;
  metalsHeading.classList.toggle('silver-active', metalState.isSilver);
  goldTab.classList.toggle('active', !metalState.isSilver);
  silverTab.classList.toggle('active', metalState.isSilver);
  goldTab.setAttribute('aria-selected', String(!metalState.isSilver));
  silverTab.setAttribute('aria-selected', String(metalState.isSilver));

  metalPriceList.querySelectorAll('.metal-price-card').forEach((card) => {
    const key = card.dataset.metal;
    const label = card.querySelector('.metal-price-name');
    const item = [...GOLD_PRICE_ITEMS, ...SILVER_PRICE_ITEMS].find(priceItem => priceItem.key === key);
    if (item && label) label.textContent = text.metalNames[item.key];
  });
}

function initializeMetalPriceCards() {
  metalPriceList.replaceChildren();
  [...GOLD_PRICE_ITEMS, ...SILVER_PRICE_ITEMS].forEach((item) => {
    const card = document.createElement('article');
    card.className = 'metal-price-card';
    card.dataset.metal = item.key;

    const name = document.createElement('h2');
    name.className = 'metal-price-name';
    name.textContent = getTranslations().metalNames[item.key];

    const amount = document.createElement('div');
    amount.className = 'metal-price-amount';
    amount.setAttribute('dir', 'ltr');
    const number = document.createElement('span');
    number.className = 'metal-price-number';
    number.setAttribute('aria-hidden', 'true');
    number.textContent = '--';
    const unit = document.createElement('small');
    unit.className = 'metal-price-unit';
    amount.append(number, unit);

    card.append(name, amount);
    metalPriceList.append(card);
  });
  renderMetalLabels();
  renderMetalPrices();
}

function renderOdometer(element, formattedValue) {
  const oldDigits = new Map(
    [...element.querySelectorAll('.odometer-digit')].map(digit => [digit.dataset.position, digit])
  );
  const digitCount = [...formattedValue].filter(character => /\d/.test(character)).length;
  let digitIndex = 0;
  const pendingDigits = [];
  const fragment = document.createDocumentFragment();

  [...formattedValue].forEach((character) => {
    if (!/\d/.test(character)) {
      fragment.append(document.createTextNode(character));
      return;
    }

    const position = String(digitCount - digitIndex - 1);
    let digit = oldDigits.get(position);
    const isNewDigit = !digit;
    if (isNewDigit) {
      digit = document.createElement('span');
      digit.className = 'odometer-digit';
      digit.dataset.position = position;
      digit.setAttribute('aria-hidden', 'true');
      const strip = document.createElement('span');
      strip.className = 'odometer-strip';
      strip.setAttribute('aria-hidden', 'true');
      for (let value = 0; value < 10; value += 1) {
        const cell = document.createElement('span');
        cell.textContent = String(value);
        strip.append(cell);
      }
      digit.append(strip);
    }
    const strip = digit.firstElementChild;
    if (isNewDigit) strip.style.transition = 'none';
    pendingDigits.push({ strip, value: Number(character), isNewDigit });
    fragment.append(digit);
    digitIndex += 1;
  });

  element.replaceChildren(fragment);
  requestAnimationFrame(() => {
    pendingDigits.forEach(({ strip, value }) => {
      strip.style.transform = `translateY(-${value * 1.15}em)`;
    });
    requestAnimationFrame(() => {
      pendingDigits.filter(digit => digit.isNewDigit).forEach(({ strip }) => {
        strip.style.transition = '';
      });
    });
  });
}

function renderMetalPrices() {
  const items = metalState.isSilver ? SILVER_PRICE_ITEMS : GOLD_PRICE_ITEMS;
  const ouncePrice = metalState.isSilver ? metalState.silverOunce : metalState.goldOunce;

  metalPriceList.querySelectorAll('.metal-price-card').forEach(card => {
    card.hidden = !items.some(item => item.key === card.dataset.metal);
  });

  if (!Number.isFinite(ouncePrice)) return;
  items.forEach((item) => {
    const card = metalPriceList.querySelector(`[data-metal="${item.key}"]`);
    const amount = card.querySelector('.metal-price-amount');
    const number = card.querySelector('.metal-price-number');
    const unit = card.querySelector('.metal-price-unit');
    if (item.currency === 'IQD' && state.baseRatePer100USD <= 0) return;
    const rawPrice = item.calculate(ouncePrice);
    const price = item.currency === 'IQD'
      ? Math.round((rawPrice * state.baseRatePer100USD / 100) / 1000) * 1000
      : rawPrice;
    if (!Number.isFinite(price)) return;

    const previousPrice = Number(card.dataset.price);
    const formattedValue = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: item.currency === 'USD' ? 2 : 0,
      maximumFractionDigits: item.currency === 'USD' ? 2 : 0
    }).format(price);
    renderOdometer(number, item.currency === 'USD' ? `$ ${formattedValue}` : formattedValue);
    unit.textContent = item.currency === 'IQD' ? 'دینار' : '';
    amount.setAttribute('aria-label', `${formattedValue} ${item.currency === 'USD' ? 'USD' : 'دینار'}`);

    if (Number.isFinite(previousPrice) && previousPrice !== price) {
      const direction = price > previousPrice ? 'is-up' : 'is-down';
      const existingTimer = metalState.flashTimers.get(item.key);
      if (existingTimer) clearTimeout(existingTimer);
      card.classList.remove('is-up', 'is-down');
      void card.offsetWidth;
      card.classList.add(direction);
      metalState.flashTimers.set(item.key, setTimeout(() => {
        card.classList.remove(direction);
        metalState.flashTimers.delete(item.key);
      }, 1000));
    }
    card.dataset.price = String(price);
  });
}

function switchMetalTab(isSilver) {
  if (metalState.isSilver === isSilver || metalState.isSwitching) return;

  metalState.isSwitching = true;
  const isMovingToSilver = isSilver;
  metalPriceList.classList.remove('list-enter', 'enter-from-left', 'enter-from-right', 'list-exit-to-left', 'list-exit-to-right');
  metalPriceList.classList.add(isMovingToSilver ? 'list-exit-to-right' : 'list-exit-to-left');

  setTimeout(() => {
    metalState.isSilver = isSilver;
    renderMetalLabels();
    renderMetalPrices();
    metalsHeading.classList.remove('shimmer');
    void metalsHeading.offsetWidth;
    metalsHeading.classList.add('shimmer');
    metalPriceList.classList.remove('list-exit-to-left', 'list-exit-to-right');
    metalPriceList.classList.add('list-enter', isMovingToSilver ? 'enter-from-left' : 'enter-from-right');
    requestAnimationFrame(() => {
      metalPriceList.querySelectorAll('.metal-price-card:not([hidden])').forEach((card, index) => {
        card.style.setProperty('--row-index', index);
      });
    });
    setTimeout(() => {
      metalPriceList.classList.remove('list-enter', 'enter-from-left', 'enter-from-right');
      metalPriceList.querySelectorAll('.metal-price-card').forEach(card => {
        card.style.removeProperty('--row-index');
      });
      metalState.isSwitching = false;
    }, 650);
  }, 180);
}

function getPositivePrice(value) {
  const price = Number(value);
  return Number.isFinite(price) && price > 0 ? price : null;
}

function extractSwissquotePrice(data) {
  const pending = [data];
  while (pending.length) {
    const value = pending.pop();
    if (!value || typeof value !== 'object') continue;
    if (Array.isArray(value)) {
      pending.push(...value);
      continue;
    }

    const bid = getPositivePrice(value.bid);
    const ask = getPositivePrice(value.ask);
    if (bid && ask) return (bid + ask) / 2;
    if (bid) return bid;
    pending.push(...Object.values(value));
  }
  return null;
}

async function fetchSwissquoteQuote(url, label) {
  const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
  if (!response.ok) throw new Error(`Swissquote ${label} quote returned HTTP ${response.status}`);
  const price = extractSwissquotePrice(await response.json());
  if (!price) throw new Error(`Swissquote ${label} quote did not contain a valid bid or ask`);
  return price;
}

function getSwissquoteUrl(instrument) {
  return `https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/${instrument}`;
}

async function fetchLiveGoldAndSilver() {
  let goldOunce = null;
  let silverOunce = null;

  try {
    const [auRes, agRes] = await Promise.all([
      fetch('https://api.gold-api.com/price/XAU'),
      fetch('https://api.gold-api.com/price/XAG')
    ]);
    if (auRes.ok && agRes.ok) {
      const auData = await auRes.json();
      const agData = await agRes.json();
      goldOunce = Number(auData.price);
      silverOunce = Number(agData.price);
    }
  } catch (e) {}

  if (!goldOunce || !silverOunce) {
    try {
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://data-asg.goldprice.org/dbXRates/USD')}&t=${Date.now()}`);
      if (res.ok) {
        const wrapper = await res.json();
        const parsed = JSON.parse(wrapper.contents);
        if (parsed?.items?.[0]) {
          goldOunce = Number(parsed.items[0].xauPrice);
          silverOunce = Number(parsed.items[0].xagPrice);
        }
      }
    } catch (e) {}
  }

  if (!goldOunce) {
    try {
      const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=PAXGUSDT');
      if (res.ok) {
        const data = await res.json();
        goldOunce = parseFloat(data.price);
      }
    } catch (e) {}
  }

  return { goldOunce, silverOunce };
}

async function fetchMetalPrices() {
  if (metalState.isFetching) return;
  metalState.isFetching = true;
  if (!metalState.goldOunce && !metalState.silverOunce) {
    metalsStatus.textContent = getTranslations().metalsLoading;
  }

  try {
    const livePrices = await fetchLiveGoldAndSilver();
    const nextGold = getPositivePrice(livePrices.goldOunce);
    const nextSilver = getPositivePrice(livePrices.silverOunce);

    if (nextGold) {
      metalState.goldOunce = nextGold;
    }
    if (nextSilver) {
      metalState.silverOunce = nextSilver;
    }

    if (metalState.goldOunce || metalState.silverOunce) {
      cacheMetalPrices(metalState.goldOunce, metalState.silverOunce);
    }

    renderMetalPrices();
    metalsStatus.textContent = metalState.goldOunce || metalState.silverOunce
      ? ''
      : getTranslations().metalsUnavailable;
  } catch (error) {
    console.warn('Unable to load live Gold and Silver prices.', error);
    metalsStatus.textContent = getTranslations().metalsUnavailable;
  } finally {
    metalState.isFetching = false;
  }
}

function setMetalsViewOpen(isOpen) {
  metalState.isOpen = isOpen;
  if (isOpen) metalState.isSilver = false;
  metalsView.hidden = !isOpen;
  document.body.classList.toggle('metals-open', isOpen);
  metalsBtn.setAttribute('aria-pressed', String(isOpen));
  if (isOpen) {
    renderMetalLabels();
    renderMetalPrices();
    fetchMetalPrices();
  }
}

// فۆرماتکردنی ژمارە بەبێ لەدەستدانی وردبینی بۆ ژمارەی زۆر درێژ (١٤+ ژمارە)
function formatNumber(numStr, maxDecimals = 2) {
  if (!numStr || numStr === '0') return '0';
  let str = numStr.toString();

  if (str.includes('e') || str.includes('E')) {
    const num = Number(str);
    if (!isNaN(num)) {
      str = num.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: maxDecimals });
    }
  }

  const parts = str.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (parts.length > 1 && maxDecimals > 0) {
    return `${parts[0]}.${parts[1].slice(0, maxDecimals)}`;
  }
  return parts[0];
}

function formatRoundedInteger(val) {
  if (!isFinite(val) || isNaN(val) || val === 0) return '0';
  try {
    const bigVal = BigInt(Math.round(val));
    return formatNumber(bigVal.toString(), 0);
  } catch (e) {
    return formatNumber(Math.round(val).toString(), 0);
  }
}

// گونجاندنی قەبارەی فۆنت بۆ ئەوەی ژمارەی درێژ لە ناو سندوقەکەدا بمێنێتەوە
function adjustAmountFontSize(el) {
  el.style.fontSize = '';
  let low = 6;
  let high = Math.floor(parseFloat(getComputedStyle(el).fontSize));

  while (low < high) {
    const fontSize = Math.ceil((low + high) / 2);
    el.style.fontSize = `${fontSize}px`;
    if (el.scrollWidth <= el.clientWidth) {
      low = fontSize;
    } else {
      high = fontSize - 1;
    }
  }

  el.style.fontSize = `${low}px`;
}

function renderDateOrDay() {
  if (!state.telegramTimestamp) {
    dateDisplayEl.textContent = '--/--/----';
    timeDisplayEl.textContent = '--:--';
    return;
  }

  const postDate = new Date(state.telegramTimestamp);
  if (state.showDayName) {
    dateDisplayEl.textContent = getTranslations().days[postDate.getDay()];
  } else {
    const year = postDate.getFullYear();
    const month = String(postDate.getMonth() + 1).padStart(2, '0');
    const day = String(postDate.getDate()).padStart(2, '0');
    dateDisplayEl.textContent = `${year}/${month}/${day}`;
  }

  timeDisplayEl.textContent = `${String(postDate.getHours()).padStart(2, '0')}:${String(postDate.getMinutes()).padStart(2, '0')}`;
}

// نوێکردنەوەی ناونیشان و بانەری نرخ بەپێی دراوی هەڵبژێردراو
function renderRateBanner(animate = false) {
  const curr = state.selectedCurrency;
  const text = getTranslations();
  rateTitleEl.textContent = text.currencyTitles[curr];
  const usdRatePer100 = getEffectiveUsdRate();
  if (!Number.isFinite(usdRatePer100) || usdRatePer100 <= 0) {
    renderOdometer(liveRateBannerEl, '...');
    adjustRateBannerFontSize();
    return;
  }

  let numericRate;
  let displayText;
  const rateInSelectedCurrency = (rateInIqd) =>
    state.secondaryCurrency === 'USD'
      ? formatNumber(((rateInIqd * 100) / usdRatePer100).toFixed(2), 2)
      : formatRoundedInteger(rateInIqd);
  const selectedUnit = state.secondaryCurrency === 'USD' ? text.usd : text.iqd;

  // بەکارهێنانی کۆدی پاراستنی ئاراستە (\u2066 و \u2069) بۆ ئەوەی نووسینی کوردی و ژمارەکان تێکەڵ نەبن
  if (curr === 'USD') {
    numericRate = usdRatePer100;
    displayText = `\u2066100$\u2069 = \u2066${formatRoundedInteger(usdRatePer100)} ${text.iqd}\u2069`;
  } else if (curr === 'GBP') {
    numericRate = state.secondaryCurrency === 'USD'
      ? state.otherRates.GBP * 100 / usdRatePer100 : state.otherRates.GBP;
    displayText = `\u2066100£\u2069 = \u2066${rateInSelectedCurrency(state.otherRates.GBP)} ${selectedUnit}\u2069`;
  } else if (curr === 'EUR') {
    numericRate = state.secondaryCurrency === 'USD'
      ? state.otherRates.EUR * 100 / usdRatePer100 : state.otherRates.EUR;
    displayText = `\u2066100€\u2069 = \u2066${rateInSelectedCurrency(state.otherRates.EUR)} ${selectedUnit}\u2069`;
  } else if (curr === 'TRY') {
    numericRate = state.secondaryCurrency === 'USD'
      ? state.otherRates.TRY * 1000 / usdRatePer100 : state.otherRates.TRY;
    displayText = `\u20661000 ${text.lira}\u2069 = \u2066${rateInSelectedCurrency(state.otherRates.TRY)} ${selectedUnit}\u2069`;
  } else if (curr === 'IRR') {
    numericRate = state.secondaryCurrency === 'USD'
      ? (state.otherRates.IRR * usdRatePer100) / 100000 : state.otherRates.IRR;
    displayText = state.otherRates.IRR > 0
      ? state.secondaryCurrency === 'USD'
        ? `\u2066100$\u2069 = \u2066${formatRoundedInteger((state.otherRates.IRR * usdRatePer100) / 100000)} ${text.toman}\u2069`
        : `\u2066100,000 ${text.iqd}\u2069 = \u2066${formatRoundedInteger(state.otherRates.IRR)} ${text.toman}\u2069`
      : text.unavailable;
  }

  renderOdometer(liveRateBannerEl, displayText || '...');
  liveRateBannerEl.setAttribute('aria-label', displayText || '...');
  const rateKey = `${curr}:${state.secondaryCurrency}`;
  const previousRate = rateBannerPreviousValues.get(rateKey);
  if (Number.isFinite(previousRate) && Number.isFinite(numericRate) && previousRate !== numericRate) {
    flashRateBanner(numericRate > previousRate ? 'is-up' : 'is-down');
  }
  if (Number.isFinite(numericRate)) rateBannerPreviousValues.set(rateKey, numericRate);

  adjustRateBannerFontSize();

  if (animate) {
    liveRateBannerEl.classList.add('pulse');
    setTimeout(() => liveRateBannerEl.classList.remove('pulse'), 300);
  }
}

function flashRateBanner(direction) {
  const existingTimer = rateFlashTimers.get('banner');
  if (existingTimer) clearTimeout(existingTimer);
  liveRateBannerEl.classList.remove('is-up', 'is-down');
  void liveRateBannerEl.offsetWidth;
  liveRateBannerEl.classList.add(direction);
  rateFlashTimers.set('banner', setTimeout(() => {
    liveRateBannerEl.classList.remove(direction);
    rateFlashTimers.delete('banner');
  }, 1000));
}

// نوێکردنەوەی ناوی دراوەکان لەسەر هەردوو کارتی حاسیبەکە
function renderConverterLabels() {
  const text = getTranslations();
  const secondaryName = state.secondaryCurrency === 'USD' ? text.usd : text.iqd;
  const secondarySymbol = state.secondaryCurrency;
  const currencyName = text.currencies[state.selectedCurrency];
  const currencySymbol = CURRENCY_SYMBOLS[state.selectedCurrency];
  const canToggleSecondary = state.selectedCurrency !== 'USD';
  const topHoldsSecondaryCurrency = !state.isTopForeign;
  const toggleLabel = state.secondaryCurrency === 'USD'
    ? state.language === 'en' ? 'Switch secondary currency to Iraqi Dinar' : state.language === 'ar' ? 'تبديل العملة إلى الدينار العراقي' : 'گۆڕینی دراوەی دووەم بۆ دیناری عێراقی'
    : state.language === 'en' ? 'Switch secondary currency to US Dollar' : state.language === 'ar' ? 'تبديل العملة إلى الدولار الأمريكي' : 'گۆڕینی دراوەی دووەم بۆ دۆلاری ئەمریکی';
  [
    [topCurrencyToggle, topHoldsSecondaryCurrency],
    [bottomCurrencyToggle, !topHoldsSecondaryCurrency]
  ].forEach(([button, holdsSecondaryCurrency]) => {
    const isToggleActive = canToggleSecondary && holdsSecondaryCurrency;
    button.disabled = !isToggleActive;
    button.classList.toggle('secondary-currency-toggle', isToggleActive);
    button.setAttribute('aria-label', toggleLabel);
  });

  if (state.isTopForeign) {
    topNameEl.textContent = currencyName;
    topSymbolEl.textContent = currencySymbol;
    bottomNameEl.textContent = secondaryName;
    bottomSymbolEl.textContent = secondarySymbol;
  } else {
    topNameEl.textContent = secondaryName;
    topSymbolEl.textContent = secondarySymbol;
    bottomNameEl.textContent = currencyName;
    bottomSymbolEl.textContent = currencySymbol;
  }
}

function adjustRateBannerFontSize() {
  liveRateBannerEl.style.fontSize = '';
  let low = 10;
  let high = parseFloat(getComputedStyle(liveRateBannerEl).fontSize);

  while (low < high) {
    const fontSize = Math.ceil((low + high) / 2);
    liveRateBannerEl.style.fontSize = `${fontSize}px`;
    if (liveRateBannerEl.scrollWidth <= liveRateBannerEl.clientWidth) {
      low = fontSize;
    } else {
      high = fontSize - 1;
    }
  }

  liveRateBannerEl.style.fontSize = `${low}px`;
}

function getIqdPerForeignUnit() {
  const curr = state.selectedCurrency;
  if (curr === 'USD') return getEffectiveUsdRate() / 100;
  if (curr === 'GBP' || curr === 'EUR') return state.otherRates[curr] / 100;
  if (curr === 'TRY') return state.otherRates.TRY / 1000;
  if (curr === 'IRR') return 100000 / state.otherRates.IRR;
  return 0;
}

function getIqdPerSecondaryUnit() {
  return state.secondaryCurrency === 'USD' ? getEffectiveUsdRate() / 100 : 1;
}

// هەژمارکردنی ورد بۆ هەر ٥ دراوەکە (بە پاڵپشتیی BigInt بۆ تمەن تا ٢٠ ژمارە)
function calculateAndRender() {
  const formattedTop = formatNumber(state.rawInput, 4);
  renderOdometer(topAmountEl, formattedTop);
  topAmountEl.setAttribute('aria-label', formattedTop);
  adjustAmountFontSize(topAmountEl);
  topAmountEl.scrollLeft = topAmountEl.scrollWidth;

  const inputValue = parseFloat(state.rawInput);
  if (isNaN(inputValue) || inputValue === 0) {
    renderOdometer(bottomAmountEl, '0');
    bottomAmountEl.setAttribute('aria-label', '0');
    adjustAmountFontSize(bottomAmountEl);
    return;
  }

  const iqdPerForeignUnit = getIqdPerForeignUnit();
  const iqdPerSecondaryUnit = getIqdPerSecondaryUnit();
  let bottomText = '0';

  if (state.selectedCurrency === 'IRR' && !state.rawInput.includes('.') &&
      Number.isFinite(iqdPerForeignUnit) && iqdPerForeignUnit > 0) {
    try {
      const inputBig = BigInt(state.rawInput);
      const tomanRateBig = BigInt(Math.round(state.otherRates.IRR));
      const usdRateBig = BigInt(Math.round(getEffectiveUsdRate()));
      let numerator;
      let denominator;

      if (state.isTopForeign) {
        numerator = inputBig * 100000n;
        denominator = tomanRateBig;
        if (state.secondaryCurrency === 'USD') {
          numerator *= 100n;
          denominator *= usdRateBig;
        }
      } else {
        numerator = inputBig * tomanRateBig;
        denominator = 100000n;
        if (state.secondaryCurrency === 'USD') {
          numerator *= usdRateBig;
          denominator *= 100n;
        }
      }

      if (state.secondaryCurrency === 'USD') {
        const cents = (numerator * 100n + denominator / 2n) / denominator;
        const decimalValue = `${cents / 100n}.${String(cents % 100n).padStart(2, '0')}`;
        bottomText = formatNumber(decimalValue, 2);
      } else {
        bottomText = formatNumber(((numerator + denominator / 2n) / denominator).toString(), 0);
      }
    } catch (error) {
      const result = state.isTopForeign
        ? (inputValue * iqdPerForeignUnit) / iqdPerSecondaryUnit
        : (inputValue * iqdPerSecondaryUnit) / iqdPerForeignUnit;
      bottomText = formatRoundedInteger(result);
    }
  } else {
    const result = state.isTopForeign
      ? (inputValue * iqdPerForeignUnit) / iqdPerSecondaryUnit
      : (inputValue * iqdPerSecondaryUnit) / iqdPerForeignUnit;
    bottomText = state.isTopForeign && state.secondaryCurrency === 'IQD'
      ? formatRoundedInteger(result)
      : formatNumber(Number.isInteger(result) ? result.toString() : result.toFixed(2).replace(/\.?0+$/, ''), 2);
  }

  renderOdometer(bottomAmountEl, bottomText);
  bottomAmountEl.setAttribute('aria-label', bottomText);
  adjustAmountFontSize(bottomAmountEl);
  bottomAmountEl.scrollLeft = bottomAmountEl.scrollWidth;
}

function updateTelegramRate(newBaseRate, timestampMs) {
  const isChanged = state.baseRatePer100USD !== newBaseRate || state.telegramTimestamp !== timestampMs;
  state.baseRatePer100USD = newBaseRate;
  state.telegramTimestamp = timestampMs;
  localStorage.setItem('telegramRate_USD', String(newBaseRate));
  localStorage.setItem('telegramRateTime', String(timestampMs));
  recalculateUsdFxQuotes();
  renderRateBanner(isChanged);
  renderDateOrDay();
  calculateAndRender();
  renderMetalPrices();
}

// هەڵبژاردنی دراوەکان لەناو مێنۆی Hamburger
currSelectBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const chosen = btn.dataset.curr;
    if (!chosen) return;

    state.selectedCurrency = chosen;
    if (chosen === 'USD') state.secondaryCurrency = 'IQD';
    state.rawInput = '0';
    state.isTopForeign = true;

    currSelectBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    renderConverterLabels();
    renderRateBanner(true);
    calculateAndRender();

    setTimeout(() => {
      menuBackdrop.classList.remove('open');
    }, 140);
  });
});

languageSelectBtns.forEach((button) => {
  button.addEventListener('click', () => applyLanguage(button.dataset.lang));
});

function toggleSecondaryCurrency() {
  if (state.selectedCurrency === 'USD') return;
  state.secondaryCurrency = state.secondaryCurrency === 'IQD' ? 'USD' : 'IQD';
  renderConverterLabels();
  renderRateBanner(true);
  calculateAndRender();
}

topCurrencyToggle.addEventListener('click', toggleSecondaryCurrency);
bottomCurrencyToggle.addEventListener('click', toggleSecondaryCurrency);

dateDisplayEl.addEventListener('click', () => {
  state.showDayName = !state.showDayName;
  renderDateOrDay();
});

hamburgerBtn.addEventListener('click', () => {
  menuBackdrop.classList.add('open');
});

metalsBtn.addEventListener('click', () => {
  setMetalsViewOpen(!metalState.isOpen);
});

goldTab.addEventListener('click', () => {
  switchMetalTab(false);
});

silverTab.addEventListener('click', () => {
  switchMetalTab(true);
});

menuCloseBtn.addEventListener('click', () => {
  menuBackdrop.classList.remove('open');
});

menuBackdrop.addEventListener('click', (e) => {
  if (e.target === menuBackdrop) {
    menuBackdrop.classList.remove('open');
  }
});

discountToggle.addEventListener('change', (e) => {
  state.minus1000Active = e.target.checked;
  localStorage.setItem('minus1000Active', state.minus1000Active);
  renderRateBanner(true);
  calculateAndRender();
});

darkModeToggle.addEventListener('change', (e) => {
  state.isDarkMode = e.target.checked;
  localStorage.setItem('darkMode', state.isDarkMode);
  if (state.isDarkMode) {
    document.body.classList.remove('light-mode');
  } else {
    document.body.classList.add('light-mode');
  }
});

// Refreshes only the data pipeline for the currently visible screen.
refreshBtn.addEventListener('click', async () => {
  refreshBtn.classList.add('spinning');
  if (metalState.isOpen) {
    await fetchMetalPrices();
  } else {
    await fetchExchangeRates();
    renderRateBanner(true);
  }
  setTimeout(() => {
    refreshBtn.classList.remove('spinning');
  }, 600);
});

function handleKeyPress(key) {
  // بۆ تمەن تا ٢٠ ژمارە ڕێگەپێدراوە (زیاتر لە ١٤ ژمارە)، بۆ دراوەکانی تر ١٢ ژمارە
  const maxAllowedDigits = state.selectedCurrency === 'IRR' ? 20 : 12;

  if (key === 'BACKSPACE') {
    state.rawInput = state.rawInput.length > 1 ? state.rawInput.slice(0, -1) : '0';
  } else if (key === '.') {
    if (!state.rawInput.includes('.')) state.rawInput += '.';
  } else {
    if (state.rawInput.replace('.', '').length >= maxAllowedDigits) return;
    state.rawInput = state.rawInput === '0' ? key : state.rawInput + key;
  }
  calculateAndRender();
}

keypad.addEventListener('touchstart', (e) => {
  const btn = e.target.closest('.key-btn');
  if (!btn) return;
  e.preventDefault();
  btn.classList.add('pressed');
  handleKeyPress(btn.dataset.key);
}, { passive: false });

keypad.addEventListener('touchend', (e) => {
  const btn = e.target.closest('.key-btn');
  if (btn) btn.classList.remove('pressed');
});

keypad.addEventListener('touchcancel', (e) => {
  const btn = e.target.closest('.key-btn');
  if (btn) btn.classList.remove('pressed');
});

keypad.addEventListener('mousedown', (e) => {
  const btn = e.target.closest('.key-btn');
  if (btn) handleKeyPress(btn.dataset.key);
});

function toggleSwap() {
  state.isTopForeign = !state.isTopForeign;
  state.rawInput = '0';
  renderConverterLabels();
  calculateAndRender();
}

swapBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  swapBtn.classList.add('pressed');
  toggleSwap();
}, { passive: false });

swapBtn.addEventListener('touchend', () => {
  swapBtn.classList.remove('pressed');
});

swapBtn.addEventListener('mousedown', toggleSwap);

function recalculateUsdFxQuotes() {
  if (state.baseRatePer100USD <= 0) return;

  ['GBP', 'EUR'].forEach((currency) => {
    const usdQuote = state.usdFxQuotes[currency];
    if (usdQuote > 0) {
      state.otherRates[currency] = Math.round(usdQuote * state.baseRatePer100USD);
      localStorage.setItem(`liveFxRate_${currency}`, String(state.otherRates[currency]));
    }
  });
  if (state.usdFxQuotes.USDTRY > 0) {
    state.otherRates.TRY = Math.round((1000 / state.usdFxQuotes.USDTRY) * (state.baseRatePer100USD / 100));
    localStorage.setItem('liveFxRate_TRY', String(state.otherRates.TRY));
  }
}

function applyRudawTomanRate(data) {
  const tomanRate = Number(data?.tomanPer100000Iqd);
  if (!Number.isFinite(tomanRate) || tomanRate <= 0) {
    throw new Error('Rates snapshot is missing a valid Rudaw Toman buy rate');
  }
  state.otherRates.IRR = Math.round(tomanRate);
  state.rudawTomanBuy = state.otherRates.IRR;
  localStorage.setItem('rudawRate_IRR', String(state.otherRates.IRR));
  localStorage.setItem('rudawTomanBuy', String(state.otherRates.IRR));
  renderRateBanner();
  calculateAndRender();
}

let isFetchingLiveForeignRates = false;
async function fetchLiveForeignRates() {
  if (isFetchingLiveForeignRates) return;
  isFetchingLiveForeignRates = true;
  try {
    const results = await Promise.allSettled(
      Object.entries(FX_INSTRUMENTS).map(async ([currency, instrument]) => ({
        currency,
        instrument,
        quote: await fetchSwissquoteQuote(getSwissquoteUrl(instrument), instrument)
      }))
    );

    let updated = false;
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Unable to fetch the live ${Object.keys(FX_INSTRUMENTS)[index]} exchange quote.`, result.reason);
        return;
      }

      const { currency, quote } = result.value;
      state.usdFxQuotes[currency] = quote;
      localStorage.setItem(`liveFxQuote_${currency}`, String(quote));
      updated = true;
    });

    if (updated) {
      recalculateUsdFxQuotes();
      renderRateBanner();
      calculateAndRender();
    }
  } finally {
    isFetchingLiveForeignRates = false;
  }
}

let isFetchingExchangeRates = false;
async function fetchExchangeRates() {
  if (isFetchingExchangeRates) return;
  isFetchingExchangeRates = true;
  try {
    const response = await fetch(`${RATES_URL}?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Rate snapshot returned HTTP ${response.status}`);
    const data = await response.json();
    const telegramRate = Number(data?.telegram?.iqdPer100Usd);
    const telegramTimestamp = Date.parse(data?.telegram?.latestPostAt);
    if (!Number.isFinite(telegramRate) || telegramRate <= 0 || !Number.isFinite(telegramTimestamp)) {
      throw new Error('Rate snapshot is missing a valid Telegram USD rate or post time');
    }

    updateTelegramRate(telegramRate, telegramTimestamp);
    applyRudawTomanRate(data.rudaw);
  } catch (error) {
    console.warn('Unable to load the latest USD/IQD and Toman rates.', error);
  } finally {
    isFetchingExchangeRates = false;
  }
  await fetchLiveForeignRates();
}

// دەستپێکردنی سەرەتایی بەرنامەکە
initializeMetalPriceCards();
applyLanguage(state.language);
renderRateBanner();
renderDateOrDay();
calculateAndRender();
fetchMetalPrices();
window.addEventListener('resize', calculateAndRender);
window.addEventListener('resize', adjustRateBannerFontSize);
document.fonts.ready.then(calculateAndRender);
fetchExchangeRates();

setInterval(fetchExchangeRates, 60000);
setInterval(() => {
  if (metalState.isOpen) fetchMetalPrices();
}, 30000);

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    fetchExchangeRates();
    if (metalState.isOpen) fetchMetalPrices();
  }
});
