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
    metalsTitle: 'کانزاکان',
    goldTitle: 'نرخی زێـڕ',
    silverTitle: 'نرخی زیـو',
    currencyRatesTitle: 'نرخی دراوەکان',
    comparisonBase: 'نرخی بەرامبەر',
    currencyRateSubtitles: {
      USD: '100$', GBP: '100£', EUR: '100€', IRR: '1,000,000 تمەن',
      TRY: '1000 لیرە', IQD: '100,000 IQD'
    },
    backToRates: 'گەڕانەوە بۆ نرخی دراوەکان',
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
    metalCalculatorTitle: 'ژمێریاری زێڕ و زیو',
    backToMetals: 'گەڕانەوە بۆ نرخی زێڕ و زیو',
    investmentQuantity: 'بڕی خاوەندارێتی',
    investmentPaid: 'کۆی ئەو پارەیەی پێت داوە',
    investmentCurrent: 'بەهای ئێستا',
    investmentDifference: 'قازانج / زیان',
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
      USD: 'نرخی دۆلار', GBP: 'نرخی پاوەند', EUR: 'نرخی یۆرۆ', IQD: 'نرخی دینار',
      TRY: 'نرخی لیرەی تورکی', IRR: 'نرخی تمەنی ئێرانی'
    },
    currencies: {
      USD: 'دۆلار', GBP: 'پاوەند', EUR: 'یۆرۆ', IQD: 'دینار',
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
    metalsTitle: 'المعادن',
    goldTitle: 'أسعار الذهب',
    silverTitle: 'أسعار الفضة',
    currencyRatesTitle: 'أسعار العملات',
    comparisonBase: 'الأسعار مقابل',
    currencyRateSubtitles: {
      USD: '100$', GBP: '100£', EUR: '100€', IRR: '1,000,000 تومان',
      TRY: '1000 ليرة', IQD: '100,000 IQD'
    },
    backToRates: 'العودة إلى أسعار العملات',
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
    metalCalculatorTitle: 'حاسبة الذهب والفضة',
    backToMetals: 'العودة إلى أسعار الذهب والفضة',
    investmentQuantity: 'الكمية التي تملكها',
    investmentPaid: 'إجمالي المبلغ الذي دفعته',
    investmentCurrent: 'القيمة الحالية',
    investmentDifference: 'الربح / الخسارة',
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
      USD: 'سعر الدولار', GBP: 'سعر الجنيه الإسترليني', EUR: 'سعر اليورو', IQD: 'سعر الدينار',
      TRY: 'سعر الليرة التركية', IRR: 'سعر التومان الإيراني'
    },
    currencies: {
      USD: 'دولار', GBP: 'جنيه إسترليني', EUR: 'يورو', IQD: 'دينار',
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
    metalsTitle: 'Metals',
    goldTitle: 'Gold Prices',
    silverTitle: 'Silver Prices',
    currencyRatesTitle: 'Currency Rates',
    comparisonBase: 'Rates against',
    currencyRateSubtitles: {
      USD: '100$', GBP: '100£', EUR: '100€', IRR: '1,000,000 Toman',
      TRY: '1000 Lira', IQD: '100,000 IQD'
    },
    backToRates: 'Back to currency rates',
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
    metalCalculatorTitle: 'Gold & Silver Calculator',
    backToMetals: 'Back to gold and silver prices',
    investmentQuantity: 'Quantity owned',
    investmentPaid: 'Total amount paid',
    investmentCurrent: 'Current value',
    investmentDifference: 'Profit / loss',
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
      USD: 'US Dollar Rate', GBP: 'British Pound Rate', EUR: 'Euro Rate', IQD: 'Iraqi Dinar Rate',
      TRY: 'Turkish Lira Rate', IRR: 'Iranian Toman Rate'
    },
    currencies: {
      USD: 'US Dollar', GBP: 'British Pound', EUR: 'Euro', IQD: 'Iraqi Dinar',
      TRY: 'Turkish Lira', IRR: 'Toman'
    },
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  }
};

const CURRENCY_SYMBOLS = { USD: '$', GBP: '£', EUR: '€', TRY: 'TRY', IRR: 'IRR', IQD: 'IQD' };
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

const state = {
  selectedCurrency: 'USD',
  currencyRateBase: 'IQD',
  currentView: 'rates',
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
const metalsView = document.getElementById('metalsView');
const metalsTitleEl = document.getElementById('metalsTitle');
const metalInvestmentView = document.getElementById('metalInvestmentView');
const metalInvestmentTitleEl = document.getElementById('metalInvestmentTitle');
const backToMetalsLabelEl = document.getElementById('backToMetalsLabel');
const metalInvestmentItemNameEl = document.getElementById('metalInvestmentItemName');
const metalInvestmentQuantityEl = document.getElementById('metalInvestmentQuantity');
const metalInvestmentQuantityUnitEl = document.getElementById('metalInvestmentQuantityUnit');
const metalInvestmentPaidEl = document.getElementById('metalInvestmentPaid');
const metalInvestmentPaidUnitEl = document.getElementById('metalInvestmentPaidUnit');
const metalInvestmentQuantityLabelEl = document.getElementById('metalInvestmentQuantityLabel');
const metalInvestmentPaidLabelEl = document.getElementById('metalInvestmentPaidLabel');
const metalInvestmentCurrentLabelEl = document.getElementById('metalInvestmentCurrentLabel');
const metalInvestmentDifferenceLabelEl = document.getElementById('metalInvestmentDifferenceLabel');
const metalInvestmentCurrentValueEl = document.getElementById('metalInvestmentCurrentValue');
const metalInvestmentDifferenceEl = document.getElementById('metalInvestmentDifference');
const metalInvestmentIQDButton = document.getElementById('metalInvestmentIQD');
const metalInvestmentUSDButton = document.getElementById('metalInvestmentUSD');
const currencyRatesView = document.getElementById('currencyRatesView');
const currencyRateList = document.getElementById('currencyRateList');
const currencyRatesTitle = document.getElementById('currencyRatesTitle');
const baseCurrencyToggle = document.getElementById('baseCurrencyToggle');
const baseIQDButton = document.getElementById('baseIQDButton');
const baseUSDButton = document.getElementById('baseUSDButton');
const calculatorView = document.getElementById('calculatorView');
const backToRatesBtn = document.getElementById('backToRatesBtn');
const backToRatesLabel = document.getElementById('backToRatesLabel');
const heroMorphOverlay = document.getElementById('heroMorphOverlay');
let calculatorTransitionTimer = null;

// ─── Hero Morph State ──────────────────────────────────────────────
const heroMorph = {
  sourceRect: null,       // DOMRect of the clicked card
  animTimer: null,        // cleanup timer handle
  isAnimating: false      // guard against double-trigger
};

// ─── Digit Animation State ─────────────────────────────────────────
// Tracks the previously displayed text in each amount-display so we
// can compute a per-character diff and animate only changed digits.
const amtDisplayState = {
  topPrev: '',
  bottomPrev: '',
  dir: 'up'   // 'up' = typing/increasing | 'down' = backspace/decreasing
};

/**
 * Renders `newText` into `el` by wrapping each character in a
 * <span class="amt-digit"> and adding a data-anim attribute to
 * characters that differ from `prevText`, triggering CSS animations.
 *
 * @param {HTMLElement} el        – the .amount-display element
 * @param {string}      newText   – formatted string to display
 * @param {string}      prevText  – previously displayed string
 * @param {'up'|'down'} dir       – animation direction
 * @param {boolean}     stagger   – true for the result row (cascade delay)
 */
function renderAnimatedDigits(el, newText, prevText, dir, stagger = false) {
  if (newText === prevText) return;

  const fragment = document.createDocumentFragment();
  const newChars = [...newText];
  const prevChars = [...prevText];
  const prevLen = prevChars.length;
  const totalNew = newChars.length;

  newChars.forEach((char, i) => {
    const span = document.createElement('span');
    span.className = 'amt-digit';
    span.textContent = char;

    // Determine whether this character is new or changed
    let anim = null;
    if (i >= prevLen) {
      // Brand-new character (string grew longer) → slide in
      anim = dir === 'up' ? 'in-up' : 'in-down';
    } else if (prevChars[i] !== char) {
      // Same position but different character → slot roll
      anim = dir === 'up' ? 'roll-up' : 'roll-down';
    }

    if (anim) {
      span.dataset.anim = anim;
      if (stagger) {
        // Cascade right-to-left: rightmost digit animates first
        const delay = Math.max(0, (totalNew - 1 - i) * 18);
        span.style.animationDelay = `${delay}ms`;
      }
    }

    fragment.append(span);
  });

  el.replaceChildren(fragment);
}
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

const FX_INSTRUMENTS = {
  GBP: 'GBP/USD',
  EUR: 'EUR/USD',
  USDTRY: 'USD/TRY'
};
const METAL_API_URLS = {
  swissquote: {
    gold: 'https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAU/USD',
    silver: 'https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAG/USD'
  },
  goldApi: {
    gold: 'https://api.gold-api.com/price/XAU',
    silver: 'https://api.gold-api.com/price/XAG'
  },
  goldPrice: 'https://data-asg.goldprice.org/dbXRates/USD'
};
const METAL_CACHE_KEYS = {
  gold: 'liveMetalGoldOunce',
  silver: 'liveMetalSilverOunce'
};
const metalState = {
  isSilver: false,
  isOpen: false,
  investmentItemKey: null,
  investmentCurrency: 'IQD',
  isFetching: false,
  isSwitching: false,
  goldOunce: getPositivePrice(localStorage.getItem(METAL_CACHE_KEYS.gold)),
  silverOunce: getPositivePrice(localStorage.getItem(METAL_CACHE_KEYS.silver))
};

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

function applyLanguage(language, animateCurrencyRates = false, animateCurrencyRows = animateCurrencyRates) {
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
  currencyRatesTitle.textContent = text.currencyRatesTitle;
  baseCurrencyToggle.setAttribute('aria-label', text.comparisonBase);
  baseIQDButton.textContent = text.iqd;
  baseUSDButton.textContent = text.usd;
  baseIQDButton.classList.toggle('active', state.currencyRateBase === 'IQD');
  baseUSDButton.classList.toggle('active', state.currencyRateBase === 'USD');
  baseCurrencyToggle.classList.toggle('is-usd', state.currencyRateBase === 'USD');
  if (animateCurrencyRates) {
    baseCurrencyToggle.classList.remove('shimmer');
    void baseCurrencyToggle.offsetWidth;
    baseCurrencyToggle.classList.add('shimmer');
    window.setTimeout(() => baseCurrencyToggle.classList.remove('shimmer'), 700);
  }
  baseIQDButton.setAttribute('aria-pressed', String(state.currencyRateBase === 'IQD'));
  baseUSDButton.setAttribute('aria-pressed', String(state.currencyRateBase === 'USD'));
  backToRatesLabel.textContent = text.backToRates;
  metalInvestmentTitleEl.textContent = text.metalCalculatorTitle;
  backToMetalsLabelEl.textContent = text.backToMetals;
  metalInvestmentQuantityLabelEl.textContent = text.investmentQuantity;
  metalInvestmentPaidLabelEl.textContent = text.investmentPaid;
  metalInvestmentCurrentLabelEl.textContent = text.investmentCurrent;
  metalInvestmentDifferenceLabelEl.textContent = text.investmentDifference;
  metalInvestmentIQDButton.textContent = text.iqd;
  metalInvestmentUSDButton.textContent = text.usd;
  metalInvestmentCurrencyButtons();
  updateMetalInvestmentResults();
  refreshBtn.setAttribute('aria-label', text.refresh);
  refreshBtn.title = text.refresh;
  metalsTitleEl.textContent = text.metalsTitle;
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
  renderCurrencyRateList(animateCurrencyRates, animateCurrencyRows);
  renderDateOrDay();
  renderMetalLabels();
  renderMetalPrices();
  if (window.walletInitialized) renderWalletLabels();
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
    card.tabIndex = 0;
    card.setAttribute('role', 'button');

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
}

const CURRENCY_RATE_BASIS = {
  USD: 100,
  GBP: 100,
  EUR: 100,
  TRY: 1000,
  IRR: 1000000,
  IQD: 100000
};

function getCurrencyRate(currency) {
  const usdRate = getEffectiveUsdRate();
  if (state.currencyRateBase === 'IQD') {
    if (currency === 'USD') return usdRate;
    if (currency === 'GBP' || currency === 'EUR') return state.otherRates[currency];
    if (currency === 'TRY') return state.otherRates.TRY;
    if (currency === 'IRR' && state.otherRates.IRR > 0) {
      return CURRENCY_RATE_BASIS.IRR * 100000 / state.otherRates.IRR;
    }
    return null;
  }

  if (!Number.isFinite(usdRate) || usdRate <= 0) return null;
  if (currency === 'IQD') return CURRENCY_RATE_BASIS.IQD * 100 / usdRate;
  if (currency === 'GBP' || currency === 'EUR') {
    return state.otherRates[currency] * 100 / usdRate;
  }
  if (currency === 'TRY') return state.otherRates.TRY * 100 / usdRate;
  if (currency === 'IRR' && state.otherRates.IRR > 0) {
    return CURRENCY_RATE_BASIS.IRR * 100000 / state.otherRates.IRR * 100 / usdRate;
  }
  return null;
}

let currencyRateListAnimationTimer = null;

function animateCurrencyRateCards() {
  window.clearTimeout(currencyRateListAnimationTimer);
  currencyRateList.classList.remove('list-enter', 'enter-from-left', 'enter-from-right');
  currencyRateList.querySelectorAll('.currency-rate-card').forEach((card, index) => {
    card.style.setProperty('--row-index', index);
  });
  void currencyRateList.offsetWidth;
  currencyRateList.classList.add('list-enter', 'enter-from-right');
  currencyRateListAnimationTimer = window.setTimeout(() => {
    currencyRateList.classList.remove('list-enter', 'enter-from-left', 'enter-from-right');
    currencyRateList.querySelectorAll('.currency-rate-card').forEach(card => {
      card.style.removeProperty('--row-index');
    });
    currencyRateListAnimationTimer = null;
  }, 650);
}

function renderCurrencyRateList(animateChanges = false, animateRows = false) {
  const text = getTranslations();
  const currencies = state.currencyRateBase === 'IQD'
    ? ['USD', 'GBP', 'EUR', 'IRR', 'TRY']
    : ['IQD', 'GBP', 'EUR', 'IRR', 'TRY'];
  const fragment = document.createDocumentFragment();

  currencies.forEach((currency) => {
    const rate = getCurrencyRate(currency);
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'metal-price-card currency-rate-card';
    card.dataset.currency = currency;

    const name = document.createElement('span');
    name.className = 'metal-price-name';
    name.textContent = `${text.currencies[currency]} (${currency})`;

    const identity = document.createElement('span');
    identity.className = 'currency-rate-identity';
    const subtitle = document.createElement('small');
    subtitle.className = 'metal-price-unit';
    if (animateChanges) subtitle.classList.add('currency-rate-value-changing');
    subtitle.setAttribute('dir', 'auto');
    subtitle.textContent = text.currencyRateSubtitles[currency];
    identity.append(name, subtitle);

    const amount = document.createElement('span');
    amount.className = 'metal-price-amount';
    amount.setAttribute('dir', 'ltr');
    const number = document.createElement('span');
    number.className = 'metal-price-number';
    if (animateChanges) number.classList.add('currency-rate-value-changing');
    const decimals = state.currencyRateBase === 'USD' ? 2 : 0;
    number.textContent = Number.isFinite(rate) && rate > 0
      ? `${state.currencyRateBase === 'USD' ? '$' : ''}${formatNumber(rate.toFixed(decimals), decimals)}`
      : '—';

    const unit = document.createElement('small');
    unit.className = 'metal-price-unit';
    if (animateChanges) unit.classList.add('currency-rate-value-changing');
    unit.textContent = state.currencyRateBase === 'USD' ? text.usd : text.iqd;
    amount.append(number, unit);
    card.append(identity, amount);
    card.setAttribute('aria-label', `${name.textContent}: ${number.textContent} ${unit.textContent}`);
    fragment.append(card);
  });

  currencyRateList.replaceChildren(fragment);
  if (animateRows) animateCurrencyRateCards();
}

function openCalculatorForCurrency(currency, sourceCardEl) {
  if (!Object.prototype.hasOwnProperty.call(CURRENCY_SYMBOLS, currency)) return;
  if (heroMorph.isAnimating) return;

  clearCalculatorTransitionTimer();

  // ── 1. Capture source bounding box ───────────────────────────────
  const useHero = !!sourceCardEl && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rect = useHero ? sourceCardEl.getBoundingClientRect() : null;

  // ── 2. Update state & data-bind calculator ────────────────────────
  state.selectedCurrency = currency;
  state.secondaryCurrency = currency === 'USD' ? 'IQD' : state.currencyRateBase;
  state.rawInput = String(CURRENCY_RATE_BASIS[currency]);
  state.isTopForeign = true;
  state.currentView = 'calculator';
  setBottomNavActive('calculator');
  metalState.isOpen = false;
  document.body.classList.remove('metals-open');
  // Reset digit animation state so all digits animate in fresh for the new currency
  amtDisplayState.topPrev = '';
  amtDisplayState.bottomPrev = '';
  amtDisplayState.dir = 'up';
  currSelectBtns.forEach(button => button.classList.toggle('active', button.dataset.curr === currency));
  renderConverterLabels();
  renderRateBanner();
  calculateAndRender();
  adjustRateBannerFontSize();

  if (!useHero) {
    // ── Fallback: existing slide animation ────────────────────────
    currencyRatesView.hidden = true;
    metalsView.hidden = true;
    calculatorView.classList.remove('is-exiting');
    calculatorView.classList.add('is-entering');
    calculatorView.hidden = false;
    void calculatorView.offsetWidth;
    requestAnimationFrame(() => {
      if (state.currentView === 'calculator') {
        calculatorView.classList.remove('is-entering');
      }
    });
    return;
  }

  // ── 3. Hero Morph: EXPAND ─────────────────────────────────────────
  heroMorph.isAnimating = true;
  heroMorph.sourceRect = rect;

  // Mark the source card invisible so the overlay appears "above" it
  sourceCardEl.classList.add('hero-source');

  // Fade out all other cards
  currencyRateList.classList.add('hero-fading-out');

  // Position overlay exactly over the source card
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const targetBR = 20; // final border-radius of expanded container (px)

  // ── Liquid glass start state: match the card exactly ──────────────
  heroMorphOverlay.style.cssText = `
    left: ${rect.left}px;
    top: ${rect.top}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
    border-radius: 16px;
    opacity: 1;
  `;

  // Target: cover the full viewport
  const expandDuration = 440;
  const anim = heroMorphOverlay.animate([
    {
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      borderRadius: '16px',
      backdropFilter: 'blur(8px) saturate(120%)',
      WebkitBackdropFilter: 'blur(8px) saturate(120%)',
      opacity: 1
    },
    {
      left: '0px',
      top: '0px',
      width: `${vw}px`,
      height: `${vh}px`,
      borderRadius: `${targetBR}px`,
      backdropFilter: 'blur(32px) saturate(170%)',
      WebkitBackdropFilter: 'blur(32px) saturate(170%)',
      opacity: 1
    }
  ], {
    duration: expandDuration,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    fill: 'forwards'
  });

  anim.onfinish = () => {
    // ── 4. Show calculator (hidden behind overlay) ─────────────────
    currencyRatesView.hidden = true;
    metalsView.hidden = true;
    calculatorView.classList.remove('is-entering', 'is-exiting');
    calculatorView.classList.add('hero-active', 'hero-content-hidden');
    calculatorView.hidden = false;

    // ── 5. Dissolve overlay into calc content (liquid melt) ────────
    requestAnimationFrame(() => {
      // Blur dissolve: glass fades out while content fades in
      heroMorphOverlay.animate([
        {
          backdropFilter: 'blur(32px) saturate(170%)',
          WebkitBackdropFilter: 'blur(32px) saturate(170%)',
          opacity: 1
        },
        {
          backdropFilter: 'blur(0px) saturate(100%)',
          WebkitBackdropFilter: 'blur(0px) saturate(100%)',
          opacity: 0
        }
      ], {
        duration: 260,
        easing: 'ease-out',
        fill: 'forwards'
      }).onfinish = () => {
        heroMorphOverlay.style.cssText = '';
        heroMorphOverlay.style.opacity = '0';
      };

      // Fade in calculator content
      calculatorView.classList.remove('hero-content-hidden');
      calculatorView.classList.add('hero-content-visible');

      heroMorph.animTimer = setTimeout(() => {
        calculatorView.classList.remove('hero-active', 'hero-content-visible');
        // Clean up list state
        currencyRateList.classList.remove('hero-fading-out');
        sourceCardEl.classList.remove('hero-source');
        heroMorph.isAnimating = false;
        heroMorph.sourceRect = null;
      }, 300);
    });
  };
}

function showCurrencyRates() {
  const shouldAnimate = state.currentView === 'calculator' && !calculatorView.hidden;
  const useHero = shouldAnimate && heroMorph.sourceRect !== null &&
                  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  clearCalculatorTransitionTimer();

  if (heroMorph.animTimer !== null) {
    clearTimeout(heroMorph.animTimer);
    heroMorph.animTimer = null;
  }

  state.currentView = 'rates';
  setBottomNavActive('rates');
  metalState.isOpen = false;
  metalsView.hidden = true;
  document.body.classList.remove('metals-open');

  if (!useHero) {
    // ── Fallback: existing slide-out animation ────────────────────
    if (shouldAnimate) {
      calculatorView.classList.remove('is-entering');
      calculatorView.classList.add('is-exiting');
    } else {
      calculatorView.classList.remove('is-entering', 'is-exiting');
      calculatorView.hidden = true;
    }
    currencyRatesView.hidden = shouldAnimate;
    renderCurrencyRateList();
    if (shouldAnimate) {
      const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 400;
      calculatorTransitionTimer = window.setTimeout(() => {
        calculatorTransitionTimer = null;
        calculatorView.hidden = true;
        calculatorView.classList.remove('is-exiting');
        currencyRatesView.hidden = state.currentView !== 'rates' || metalState.isOpen;
      }, duration);
    }
    return;
  }

  // ── Hero Morph: COLLAPSE ──────────────────────────────────────────
  heroMorph.isAnimating = true;
  const rect = heroMorph.sourceRect;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // 1. Fade out calculator content first
  calculatorView.classList.add('hero-active', 'hero-content-hidden');

  setTimeout(() => {
    // 2. Show rates view underneath (invisible until overlay clears)
    renderCurrencyRateList();
    currencyRatesView.hidden = false;

    // 3. Position overlay over full screen — glass state
    heroMorphOverlay.style.cssText = `
      left: 0px;
      top: 0px;
      width: ${vw}px;
      height: ${vh}px;
      border-radius: 20px;
      opacity: 1;
      backdrop-filter: blur(32px) saturate(170%);
      -webkit-backdrop-filter: blur(32px) saturate(170%);
    `;

    // 4. Animate overlay shrinking back to card position (liquid collapse)
    const collapseDuration = 400;
    const anim = heroMorphOverlay.animate([
      {
        left: '0px',
        top: '0px',
        width: `${vw}px`,
        height: `${vh}px`,
        borderRadius: '20px',
        backdropFilter: 'blur(32px) saturate(170%)',
        WebkitBackdropFilter: 'blur(32px) saturate(170%)',
        opacity: 1
      },
      {
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        borderRadius: '16px',
        backdropFilter: 'blur(8px) saturate(120%)',
        WebkitBackdropFilter: 'blur(8px) saturate(120%)',
        opacity: 0
      }
    ], {
      duration: collapseDuration,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'forwards'
    });

    anim.onfinish = () => {
      // 5. Cleanup
      heroMorphOverlay.style.cssText = '';
      heroMorphOverlay.style.opacity = '0';
      calculatorView.classList.remove('hero-active', 'hero-content-hidden', 'hero-content-visible', 'is-entering', 'is-exiting');
      calculatorView.hidden = true;
      currencyRatesView.hidden = state.currentView !== 'rates' || metalState.isOpen;
      // Restore list cards with a subtle entrance
      currencyRateList.classList.remove('hero-fading-out');
      currencyRateList.querySelectorAll('.currency-rate-card').forEach(c => c.classList.remove('hero-source'));
      heroMorph.sourceRect = null;
      heroMorph.isAnimating = false;
    };
  }, 180); // wait for content to fade first
}

function clearCalculatorTransitionTimer() {
  if (calculatorTransitionTimer !== null) {
    window.clearTimeout(calculatorTransitionTimer);
    calculatorTransitionTimer = null;
  }
}

function renderMetalPrices() {
  const items = metalState.isSilver ? SILVER_PRICE_ITEMS : GOLD_PRICE_ITEMS;
  const ouncePrice = metalState.isSilver ? metalState.silverOunce : metalState.goldOunce;

  metalPriceList.querySelectorAll('.metal-price-card').forEach(card => {
    card.hidden = !items.some(item => item.key === card.dataset.metal);
  });

  if (!Number.isFinite(ouncePrice)) {
    updateMetalInvestmentResults();
    return;
  }
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

    const formattedValue = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: item.currency === 'USD' ? 2 : 0,
      maximumFractionDigits: item.currency === 'USD' ? 2 : 0
    }).format(price);
    number.textContent = item.currency === 'USD' ? `$ ${formattedValue}` : formattedValue;
    unit.textContent = item.currency === 'IQD' ? 'دینار' : '';
    amount.setAttribute('aria-label', `${formattedValue} ${item.currency === 'USD' ? 'USD' : 'دینار'}`);

    card.dataset.price = String(price);
  });
  updateMetalInvestmentResults();
}

function getMetalItem(key) {
  return [...GOLD_PRICE_ITEMS, ...SILVER_PRICE_ITEMS].find(item => item.key === key) || null;
}

function metalInvestmentCurrencyButtons() {
  const isIQD = metalState.investmentCurrency === 'IQD';
  const text = getTranslations();
  metalInvestmentIQDButton.classList.toggle('active', isIQD);
  metalInvestmentUSDButton.classList.toggle('active', !isIQD);
  metalInvestmentIQDButton.setAttribute('aria-pressed', String(isIQD));
  metalInvestmentUSDButton.setAttribute('aria-pressed', String(!isIQD));
  metalInvestmentPaidLabelEl.textContent = text.investmentPaid;
  metalInvestmentPaidUnitEl.textContent = isIQD ? text.iqd : text.usd;
}

function formatInvestmentValue(value, currency) {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: currency === 'USD' ? 2 : 0,
    maximumFractionDigits: currency === 'USD' ? 2 : 0
  }).format(Math.abs(value));
  return currency === 'USD' ? `$${formatted}` : `${formatted} IQD`;
}

function updateMetalInvestmentResults() {
  if (!metalInvestmentView || !metalInvestmentCurrentValueEl) return;
  const item = getMetalItem(metalState.investmentItemKey);
  const card = item && metalPriceList.querySelector(`[data-metal="${item.key}"]`);
  const quantity = Number(metalInvestmentQuantityEl.value);
  const paid = Number(metalInvestmentPaidEl.value);
  const hasQuantity = metalInvestmentQuantityEl.value.trim() !== '';
  const hasPaid = metalInvestmentPaidEl.value.trim() !== '';
  const unitPrice = Number(card?.dataset.price);
  const usdToIqd = state.baseRatePer100USD / 100;

  metalInvestmentIQDButton.classList.toggle('active', metalState.investmentCurrency === 'IQD');
  metalInvestmentUSDButton.classList.toggle('active', metalState.investmentCurrency === 'USD');
  metalInvestmentIQDButton.setAttribute('aria-pressed', String(metalState.investmentCurrency === 'IQD'));
  metalInvestmentUSDButton.setAttribute('aria-pressed', String(metalState.investmentCurrency === 'USD'));
  const selectedText = getTranslations();
  metalInvestmentPaidLabelEl.textContent = selectedText.investmentPaid;
  metalInvestmentPaidUnitEl.textContent = metalState.investmentCurrency === 'IQD' ? selectedText.iqd : selectedText.usd;

  if (!item) {
    metalInvestmentItemNameEl.textContent = '';
    metalInvestmentCurrentValueEl.textContent = '—';
    metalInvestmentDifferenceEl.textContent = '—';
    metalInvestmentDifferenceEl.classList.remove('is-positive', 'is-negative');
    return;
  }

  metalInvestmentItemNameEl.textContent = getTranslations().metalNames[item.key];
  metalInvestmentQuantityUnitEl.textContent = getTranslations().metalNames[item.key];
  let convertedUnitPrice = unitPrice;
  if (item.currency !== metalState.investmentCurrency) {
    if (!(usdToIqd > 0) || !Number.isFinite(unitPrice)) convertedUnitPrice = NaN;
    else convertedUnitPrice = item.currency === 'USD' ? unitPrice * usdToIqd : unitPrice / usdToIqd;
  }

  const currentValue = Number.isFinite(convertedUnitPrice) && hasQuantity && quantity > 0
    ? quantity * convertedUnitPrice
    : NaN;
  metalInvestmentCurrentValueEl.textContent = Number.isFinite(currentValue)
    ? formatInvestmentValue(currentValue, metalState.investmentCurrency)
    : '—';

  const difference = Number.isFinite(currentValue) && hasPaid && Number.isFinite(paid) && paid >= 0
    ? currentValue - paid
    : NaN;
  if (Number.isFinite(difference)) {
    const sign = difference > 0 ? '+' : difference < 0 ? '−' : '';
    metalInvestmentDifferenceEl.textContent = `${sign}${formatInvestmentValue(difference, metalState.investmentCurrency)}`;
    metalInvestmentDifferenceEl.classList.toggle('is-positive', difference > 0);
    metalInvestmentDifferenceEl.classList.toggle('is-negative', difference < 0);
  } else {
    metalInvestmentDifferenceEl.textContent = '—';
    metalInvestmentDifferenceEl.classList.remove('is-positive', 'is-negative');
  }
}

function openMetalInvestment(itemKey) {
  const item = getMetalItem(itemKey);
  if (!item) return;
  metalState.investmentItemKey = itemKey;
  metalState.investmentCurrency = 'IQD';
  metalInvestmentQuantityEl.value = '';
  metalInvestmentPaidEl.value = '';
  metalInvestmentView.hidden = false;
  metalsView.hidden = true;
  metalInvestmentCurrencyButtons();
  updateMetalInvestmentResults();
}

function closeMetalInvestment() {
  metalInvestmentView.hidden = true;
  metalsView.hidden = false;
  metalState.investmentItemKey = null;
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
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Swissquote ${label} quote returned HTTP ${response.status}`);
  const price = extractSwissquotePrice(await response.json());
  if (!price) throw new Error(`Swissquote ${label} quote did not contain a valid bid or ask`);
  return price;
}

function getSwissquoteUrl(instrument) {
  return `https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/${instrument}`;
}

async function fetchJsonWithTimeout(url, label) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch(url, { cache: 'no-store', signal: controller.signal });
    if (!response.ok) throw new Error(`${label} returned HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchMetalQuote(url, label, readPrice) {
  const data = await fetchJsonWithTimeout(url, label);
  const price = getPositivePrice(readPrice(data));
  if (!price) throw new Error(`${label} response did not contain a valid price`);
  return price;
}

function cacheMetalPrice(key, price) {
  try {
    localStorage.setItem(key, String(price));
  } catch (error) {
    console.warn('Unable to cache the latest precious-metals price.', error);
  }
}

async function fetchLiveMetals() {
  if (metalState.isFetching) return;
  metalState.isFetching = true;
  if (!metalState.goldOunce && !metalState.silverOunce) {
    metalsStatus.textContent = getTranslations().metalsLoading;
  } else {
    metalsStatus.textContent = '';
  }

  try {
    let goldPrice = null;
    let silverPrice = null;
    const readSwissquotePrice = data => {
      const quote = data?.[0]?.spreadProfilePrices?.[0];
      return getPositivePrice(quote?.ask) || getPositivePrice(quote?.bid);
    };
    const readGoldApiPrice = data => data?.price;

    const primaryResults = await Promise.allSettled([
      fetchMetalQuote(METAL_API_URLS.swissquote.gold, 'Swissquote gold', readSwissquotePrice),
      fetchMetalQuote(METAL_API_URLS.swissquote.silver, 'Swissquote silver', readSwissquotePrice)
    ]);
    if (primaryResults[0].status === 'fulfilled') goldPrice = primaryResults[0].value;
    if (primaryResults[1].status === 'fulfilled') silverPrice = primaryResults[1].value;

    const fallbackResults = await Promise.allSettled([
      goldPrice ? Promise.resolve(goldPrice) :
        fetchMetalQuote(METAL_API_URLS.goldApi.gold, 'Gold-API gold', readGoldApiPrice),
      silverPrice ? Promise.resolve(silverPrice) :
        fetchMetalQuote(METAL_API_URLS.goldApi.silver, 'Gold-API silver', readGoldApiPrice)
    ]);
    if (!goldPrice && fallbackResults[0].status === 'fulfilled') goldPrice = fallbackResults[0].value;
    if (!silverPrice && fallbackResults[1].status === 'fulfilled') silverPrice = fallbackResults[1].value;

    if (!goldPrice || !silverPrice) {
      try {
        const data = await fetchJsonWithTimeout(METAL_API_URLS.goldPrice, 'GoldPrice.org');
        const item = data?.items?.[0];
        goldPrice = goldPrice || getPositivePrice(item?.xauPrice);
        silverPrice = silverPrice || getPositivePrice(item?.xagPrice);
      } catch {
        // Keep the latest valid quote if the final fallback is unavailable.
      }
    }

    if (goldPrice) {
      metalState.goldOunce = goldPrice;
      cacheMetalPrice(METAL_CACHE_KEYS.gold, goldPrice);
    }
    if (silverPrice) {
      metalState.silverOunce = silverPrice;
      cacheMetalPrice(METAL_CACHE_KEYS.silver, silverPrice);
    }
    renderMetalPrices();
    window.dispatchEvent(new Event('wallet-rates-updated'));
    metalsStatus.textContent = metalState.goldOunce || metalState.silverOunce
      ? ''
      : getTranslations().metalsUnavailable;
  } finally {
    metalState.isFetching = false;
  }
}

function setMetalsViewOpen(isOpen) {
  metalState.isOpen = isOpen;
  if (isOpen) metalState.isSilver = false;
  metalsView.hidden = !isOpen;
  metalInvestmentView.hidden = true;
  currencyRatesView.hidden = isOpen || state.currentView !== 'rates';
  calculatorView.hidden = isOpen || state.currentView !== 'calculator';
  document.body.classList.toggle('metals-open', isOpen);
  if (isOpen) {
    metalState.investmentItemKey = null;
    renderMetalLabels();
    renderMetalPrices();
    fetchLiveMetals();
  } else if (state.currentView === 'rates') {
    animateCurrencyRateCards();
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
function renderRateBanner() {
  const curr = state.selectedCurrency;
  const text = getTranslations();
  rateTitleEl.textContent = text.currencyTitles[curr];
  const usdRatePer100 = getEffectiveUsdRate();
  if (!Number.isFinite(usdRatePer100) || usdRatePer100 <= 0) {
    renderRateBannerText('...');
    adjustRateBannerFontSize();
    return;
  }

  let displayText;
  const rateInSelectedCurrency = (rateInIqd) =>
    state.secondaryCurrency === 'USD'
      ? formatNumber(((rateInIqd * 100) / usdRatePer100).toFixed(2), 2)
      : formatRoundedInteger(rateInIqd);
  const selectedUnit = state.secondaryCurrency === 'USD' ? text.usd : text.iqd;

  // بەکارهێنانی کۆدی پاراستنی ئاراستە (\u2066 و \u2069) بۆ ئەوەی نووسینی کوردی و ژمارەکان تێکەڵ نەبن
  if (curr === 'IQD') {
    displayText = `\u2066100,000 IQD\u2069 = \u2066${formatNumber(((100000 * 100) / usdRatePer100).toFixed(2), 2)} $\u2069`;
  } else if (curr === 'USD') {
    displayText = `\u2066100$\u2069 = \u2066${formatRoundedInteger(usdRatePer100)} ${text.iqd}\u2069`;
  } else if (curr === 'GBP') {
    displayText = `\u2066100£\u2069 = \u2066${rateInSelectedCurrency(state.otherRates.GBP)} ${selectedUnit}\u2069`;
  } else if (curr === 'EUR') {
    displayText = `\u2066100€\u2069 = \u2066${rateInSelectedCurrency(state.otherRates.EUR)} ${selectedUnit}\u2069`;
  } else if (curr === 'TRY') {
    displayText = `\u20661000 ${text.lira}\u2069 = \u2066${rateInSelectedCurrency(state.otherRates.TRY)} ${selectedUnit}\u2069`;
  } else if (curr === 'IRR') {
    displayText = state.otherRates.IRR > 0
      ? state.secondaryCurrency === 'USD'
        ? `\u2066100$\u2069 = \u2066${formatRoundedInteger((state.otherRates.IRR * usdRatePer100) / 100000)} ${text.toman}\u2069`
        : `\u2066100,000 ${text.iqd}\u2069 = \u2066${formatRoundedInteger(state.otherRates.IRR)} ${text.toman}\u2069`
      : text.unavailable;
  }

  renderRateBannerText(displayText || '...');
  liveRateBannerEl.setAttribute('aria-label', displayText || '...');
  adjustRateBannerFontSize();
}

function renderRateBannerText(value) {
  const fragment = document.createDocumentFragment();
  value.split(/([0-9][0-9,.]*|[€£$])/g).forEach((part) => {
    if (!part) return;
    if (/^[€£$]$/.test(part) || /^\d/.test(part)) {
      const span = document.createElement('span');
      span.className = /^[€£$]$/.test(part) ? 'rate-currency-symbol' : 'rate-number';
      span.textContent = part;
      fragment.append(span);
    } else {
      fragment.append(document.createTextNode(part));
    }
  });
  liveRateBannerEl.replaceChildren(fragment);
}

// نوێکردنەوەی ناوی دراوەکان لەسەر هەردوو کارتی حاسیبەکە
function renderConverterLabels() {
  const text = getTranslations();
  const secondaryName = state.secondaryCurrency === 'USD' ? text.usd : text.iqd;
  const secondarySymbol = state.secondaryCurrency;
  const currencyName = text.currencies[state.selectedCurrency];
  const currencySymbol = CURRENCY_SYMBOLS[state.selectedCurrency];
  const canToggleSecondary = state.selectedCurrency !== 'USD' && state.selectedCurrency !== 'IQD';
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
  if (curr === 'IQD') return 1;
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
  // Consume and reset direction so non-keypress callers default to 'up'
  const dir = amtDisplayState.dir;
  amtDisplayState.dir = 'up';

  const formattedTop = formatNumber(state.rawInput, 4);
  renderAnimatedDigits(topAmountEl, formattedTop, amtDisplayState.topPrev, dir);
  amtDisplayState.topPrev = formattedTop;
  topAmountEl.setAttribute('aria-label', formattedTop);
  adjustAmountFontSize(topAmountEl);
  topAmountEl.scrollLeft = topAmountEl.scrollWidth;

  const inputValue = parseFloat(state.rawInput);
  if (isNaN(inputValue) || inputValue === 0) {
    renderAnimatedDigits(bottomAmountEl, '0', amtDisplayState.bottomPrev, dir);
    amtDisplayState.bottomPrev = '0';
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

  // stagger=true → cascade right-to-left on the result row
  renderAnimatedDigits(bottomAmountEl, bottomText, amtDisplayState.bottomPrev, dir, true);
  amtDisplayState.bottomPrev = bottomText;
  bottomAmountEl.setAttribute('aria-label', bottomText);
  adjustAmountFontSize(bottomAmountEl);
  bottomAmountEl.scrollLeft = bottomAmountEl.scrollWidth;
}

function updateTelegramRate(newBaseRate, timestampMs) {
  state.baseRatePer100USD = newBaseRate;
  state.telegramTimestamp = timestampMs;
  localStorage.setItem('telegramRate_USD', String(newBaseRate));
  localStorage.setItem('telegramRateTime', String(timestampMs));
  recalculateUsdFxQuotes();
  renderRateBanner();
  renderDateOrDay();
  calculateAndRender();
  renderCurrencyRateList();
  renderMetalPrices();
  window.dispatchEvent(new Event('wallet-rates-updated'));
}

// هەڵبژاردنی دراوەکان لەناو مێنۆی Hamburger
currSelectBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const chosen = btn.dataset.curr;
    if (!chosen) return;
    currSelectBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    openCalculatorForCurrency(chosen);

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
  renderRateBanner();
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


metalPriceList.addEventListener('click', (event) => {
  const card = event.target.closest('.metal-price-card[data-metal]');
  if (card && metalPriceList.contains(card)) openMetalInvestment(card.dataset.metal);
});

metalPriceList.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const card = event.target.closest('.metal-price-card[data-metal]');
  if (!card || !metalPriceList.contains(card)) return;
  event.preventDefault();
  openMetalInvestment(card.dataset.metal);
});

document.getElementById('backToMetalsBtn').addEventListener('click', closeMetalInvestment);
metalInvestmentQuantityEl.addEventListener('input', updateMetalInvestmentResults);
metalInvestmentPaidEl.addEventListener('input', updateMetalInvestmentResults);
metalInvestmentIQDButton.addEventListener('click', () => {
  metalState.investmentCurrency = 'IQD';
  updateMetalInvestmentResults();
});
metalInvestmentUSDButton.addEventListener('click', () => {
  metalState.investmentCurrency = 'USD';
  updateMetalInvestmentResults();
});

currencyRateList.addEventListener('click', (event) => {
  const card = event.target.closest('.currency-rate-card');
  if (card && currencyRateList.contains(card)) openCalculatorForCurrency(card.dataset.currency, card);
});

baseIQDButton.addEventListener('click', () => {
  if (state.currencyRateBase === 'IQD') return;
  state.currencyRateBase = 'IQD';
  applyLanguage(state.language, true);
});

baseUSDButton.addEventListener('click', () => {
  if (state.currencyRateBase === 'USD') return;
  state.currencyRateBase = 'USD';
  applyLanguage(state.language, true);
});

backToRatesBtn.addEventListener('click', showCurrencyRates);

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
  renderRateBanner();
  calculateAndRender();
  renderCurrencyRateList();
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
    await fetchLiveMetals();
  } else {
    await fetchExchangeRates();
    renderRateBanner();
  }
  setTimeout(() => {
    refreshBtn.classList.remove('spinning');
  }, 600);
});

function handleKeyPress(key) {
  // بۆ تمەن تا ٢٠ ژمارە ڕێگەپێدراوە (زیاتر لە ١٤ ژمارە)، بۆ دراوەکانی تر ١٢ ژمارە
  const maxAllowedDigits = state.selectedCurrency === 'IRR' ? 20 : 12;

  // Set animation direction before mutating rawInput
  amtDisplayState.dir = key === 'BACKSPACE' ? 'down' : 'up';

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

function applyRudawFxQuotes(data) {
  const gbpQuote = Number(data?.gbpUsdPer100);
  const eurQuote = Number(data?.eurUsdPer100);
  const usdTryQuote = Number(data?.tryPer100);

  if (Number.isFinite(gbpQuote) && gbpQuote > 0) {
    const quote = gbpQuote / 100;
    state.usdFxQuotes.GBP = quote;
    localStorage.setItem('liveFxQuote_GBP', String(quote));
    state.otherRates.GBP = Math.round(quote * state.baseRatePer100USD);
    localStorage.setItem('liveFxRate_GBP', String(state.otherRates.GBP));
  }

  if (Number.isFinite(eurQuote) && eurQuote > 0) {
    const quote = eurQuote / 100;
    state.usdFxQuotes.EUR = quote;
    localStorage.setItem('liveFxQuote_EUR', String(quote));
    state.otherRates.EUR = Math.round(quote * state.baseRatePer100USD);
    localStorage.setItem('liveFxRate_EUR', String(state.otherRates.EUR));
  }

  if (Number.isFinite(usdTryQuote) && usdTryQuote > 0) {
    const quote = usdTryQuote / 100;
    state.usdFxQuotes.USDTRY = quote;
    localStorage.setItem('liveFxQuote_USDTRY', String(quote));
    state.otherRates.TRY = Math.round((1000 / quote) * (state.baseRatePer100USD / 100));
    localStorage.setItem('liveFxRate_TRY', String(state.otherRates.TRY));
  }
  renderCurrencyRateList();
  window.dispatchEvent(new Event('wallet-rates-updated'));
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
  renderCurrencyRateList();
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
      renderCurrencyRateList();
      window.dispatchEvent(new Event('wallet-rates-updated'));
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
    applyRudawFxQuotes(data.rudaw);
    applyRudawTomanRate(data.rudaw);
  } catch (error) {
    console.warn('Unable to load the latest USD/IQD and Toman rates.', error);
  } finally {
    isFetchingExchangeRates = false;
  }
  await fetchLiveForeignRates();
  renderCurrencyRateList();
}

// دەستپێکردنی سەرەتایی بەرنامەکە
initializeMetalPriceCards();
applyLanguage(state.language, false, true);
renderRateBanner();
renderDateOrDay();
calculateAndRender();
window.addEventListener('resize', calculateAndRender);
window.addEventListener('resize', adjustRateBannerFontSize);
document.fonts.ready.then(calculateAndRender);
fetchExchangeRates();

setInterval(fetchExchangeRates, 60000);
const startLiveMetalUpdates = () => {
  fetchLiveMetals();
  setInterval(fetchLiveMetals, 3000);
};
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startLiveMetalUpdates, { once: true });
} else {
  startLiveMetalUpdates();
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    fetchExchangeRates();
    fetchLiveMetals();
  }
});

// Wallet portfolio and bottom navigation.
const walletCopy = {
  ku: { rates: 'دراوەکان', metals: 'کانزاکان', calculator: 'ژمێرەر', wallet: 'جزدان', title: 'پۆرتفۆلیۆ', estimate: 'خەمڵێنراو', empty: 'هێشتا هیچ سامانێکت نییە', emptyHint: 'یەکەم کڕینەکەت زیاد بکە بۆ بەدواداچوونی وەبەرهێنانەکانت', add: '+ زیادکردنی سامان', addTitle: 'زیادکردنی سامان', asset: 'سامان هەڵبژێرە', amount: 'بڕ', purchase: 'نرخی کڕین', date: 'بەرواری کڕین', notes: 'تێبینی (ئارەزوومەندانە)', save: 'پاشەکەوتکردن', currencies: 'دراو', metalsTab: 'کانزا', picker: 'سامان هەڵبژێرە', edit: 'دەستکاری', delete: 'سڕینەوە', unit: 'دانە', saved: 'پاشەکەوت کرا' },
  ar: { rates: 'أسعار العملات', metals: 'المعادن', calculator: 'الحاسبة', wallet: 'المحفظة', title: 'المحفظة', estimate: 'القيمة التقديرية', empty: 'لا توجد أصول بعد', emptyHint: 'أضف أول أصل لمتابعة استثماراتك', add: '+ إضافة أصل', addTitle: 'إضافة أصل', asset: 'اختر الأصل', amount: 'الكمية', purchase: 'سعر الشراء', date: 'تاريخ الشراء', notes: 'ملاحظات (اختياري)', save: 'حفظ', currencies: 'العملات', metalsTab: 'المعادن', picker: 'اختر الأصل', edit: 'تعديل', delete: 'حذف', unit: 'وحدة', saved: 'تم الحفظ' },
  en: { rates: 'Rates', metals: 'Metals', calculator: 'Calculator', wallet: 'Wallet', title: 'Portfolio', estimate: 'Estimated value', empty: 'Your wallet is empty', emptyHint: 'Add your first asset to track your investments', add: '+ Add asset', addTitle: 'Add asset', asset: 'Select asset', amount: 'Amount', purchase: 'Purchase price', date: 'Purchase date', notes: 'Notes (optional)', save: 'Save', currencies: 'Currencies', metalsTab: 'Metals', picker: 'Select asset', edit: 'Edit', delete: 'Delete', unit: 'units', saved: 'Saved' }
};
const walletAssets = [
  ...['USD', 'GBP', 'EUR', 'IRR', 'TRY', 'IQD'].map(key => ({ key, type: 'currency' })),
  ...['gold24k', 'gold21k', 'gold18k', 'dubaiLira', 'goldOunce', 'silverOunce', 'silverKg'].map(key => ({ key, type: 'metal' }))
];
const walletEls = Object.fromEntries(['walletView','walletDashboard','walletFormView','walletTitle','walletEstimatedLabel','walletTotal','walletProfit','walletProfitPercent','walletAssetList','walletEmptyState','walletEmptyTitle','walletEmptySubtitle','walletEmptyAdd','walletFormTitle','walletAssetLabel','walletAssetPicker','walletSelectedAsset','walletAmountLabel','walletPurchaseLabel','walletDateLabel','walletNotesLabel','walletSaveButton','walletAmountInput','walletPurchaseInput','walletDateInput','walletNotesInput','walletPickerBackdrop','walletPickerTitle','walletPickerOptions','walletPickerClose','walletFab','walletFormBack'].map(id => [id, document.getElementById(id)]));
let walletState = { items: [], currency: localStorage.getItem('walletCurrency') === 'USD' ? 'USD' : 'IQD', editingId: null, selectedKey: null, pickerCategory: 'currencies' };
try { walletState.items = JSON.parse(localStorage.getItem('exchangeWallet') || '[]').filter(item => item && typeof item.id === 'string' && walletAssets.some(asset => asset.key === item.key)); } catch { walletState.items = []; }
const walletCurrencyButtons = document.querySelectorAll('[data-wallet-currency]');
const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
const formatWalletMoney = (value, currency = walletState.currency) => {
  if (!Number.isFinite(value)) return '—';
  try { return new Intl.NumberFormat(state.language === 'en' ? 'en-US' : state.language === 'ar' ? 'ar-IQ' : 'ku-IQ', { maximumFractionDigits: currency === 'IQD' ? 0 : 2, minimumFractionDigits: currency === 'IQD' ? 0 : 2 }).format(value) + ` ${currency}`; } catch { return `${value.toFixed(2)} ${currency}`; }
};
function walletText() { return walletCopy[state.language] || walletCopy.en; }
function walletAssetName(key) {
  const asset = walletAssets.find(option => option.key === key);
  if (!asset) return key;
  if (asset.type === 'currency') return getTranslations().currencies[key] || key;
  return getTranslations().metalNames[key] || key;
}
function walletAssetUnit(key) {
  if (['gold18k','gold21k','gold22k','gold24k'].includes(key)) return 'g';
  if (key === 'dubaiLira') return 'lira';
  if (key.endsWith('Ounce')) return 'oz';
  if (key === 'silverKg') return 'kg';
  return walletText().unit;
}
function walletUnitPriceIqd(key) {
  const asset = walletAssets.find(option => option.key === key);
  const usdIqd = getEffectiveUsdRate() / 100;
  if (!asset) return null;
  if (asset.type === 'currency') {
    if (!(usdIqd > 0)) return null;
    if (key === 'USD') return usdIqd;
    if (key === 'IQD') return 1;
    if (key === 'GBP' || key === 'EUR') return Number(state.otherRates[key]) / 100;
    if (key === 'TRY') return Number(state.otherRates.TRY) / 1000;
    if (key === 'IRR') return usdIqd * 100 / Number(state.otherRates.IRR);
    return null;
  }
  const item = getMetalItem(key);
  const ounce = key.startsWith('silver') ? metalState.silverOunce : metalState.goldOunce;
  if (!item || !(ounce > 0)) return null;
  const raw = item.calculate(ounce);
  let iqd = item.currency === 'IQD' ? raw : raw * usdIqd;
  if (['gold18k','gold21k','gold22k','gold24k'].includes(key)) iqd /= 5; // metal card quote is for five grams
  if (key === 'silverKg') iqd /= 1000;
  return Number.isFinite(iqd) && iqd > 0 ? iqd : null;
}
function walletMarketValue(item, currency = walletState.currency) {
  const unitIqd = walletUnitPriceIqd(item.key);
  const usdIqd = getEffectiveUsdRate() / 100;
  if (!(unitIqd > 0) || !(usdIqd > 0)) return null;
  return unitIqd * Number(item.amount) / (currency === 'USD' ? usdIqd : 1);
}
function renderWalletLabels() {
  const text = walletText();
  document.getElementById('navRatesLabel').textContent = text.rates;
  document.getElementById('navMetalsLabel').textContent = text.metals;
  document.getElementById('navCalculatorLabel').textContent = text.calculator;
  document.getElementById('navWalletLabel').textContent = text.wallet;
  walletEls.walletTitle.textContent = text.title;
  walletEls.walletEstimatedLabel.textContent = text.estimate;
  walletEls.walletEmptyTitle.textContent = text.empty;
  walletEls.walletEmptySubtitle.textContent = text.emptyHint;
  walletEls.walletEmptyAdd.textContent = text.add;
  walletEls.walletFormTitle.textContent = text.addTitle;
  walletEls.walletAssetLabel.textContent = text.asset;
  walletEls.walletAmountLabel.textContent = text.amount;
  walletEls.walletPurchaseLabel.textContent = text.purchase;
  walletEls.walletDateLabel.textContent = text.date;
  walletEls.walletNotesLabel.textContent = text.notes;
  walletEls.walletSaveButton.textContent = text.save;
  walletEls.walletPickerTitle.textContent = text.picker;
  document.querySelector('[data-picker-category="currencies"]').textContent = text.currencies;
  document.querySelector('[data-picker-category="metals"]').textContent = text.metalsTab;
  walletCurrencyButtons.forEach(button => button.classList.toggle('active', button.dataset.walletCurrency === walletState.currency));
  renderWallet();
}
function renderWallet() {
  const list = walletEls.walletAssetList;
  list.replaceChildren();
  const text = walletText();
  let total = 0, cost = 0, known = true;
  walletState.items.forEach(item => {
    const value = walletMarketValue(item);
    const rate = walletUnitPriceIqd(item.key);
    const usdIqd = getEffectiveUsdRate() / 100;
    const currentUnit = rate == null ? null : rate / (walletState.currency === 'USD' ? usdIqd : 1);
    const purchaseUnit = Number(item.purchasePrice) * (item.purchaseCurrency === walletState.currency ? 1 : item.purchaseCurrency === 'USD' ? usdIqd : 1 / usdIqd);
    const paid = purchaseUnit * Number(item.amount);
    const profit = value == null ? null : value - paid;
    if (value == null || !Number.isFinite(paid)) known = false; else { total += value; cost += paid; }
    const card = document.createElement('article'); card.className = 'wallet-asset-card card-surface';
    const info = document.createElement('div'); info.className = 'wallet-asset-info';
    const icon = document.createElement('span'); icon.className = 'wallet-asset-icon'; icon.textContent = item.type === 'metal' ? '✦' : (item.key.slice(0, 2));
    const details = document.createElement('div'); details.className = 'wallet-asset-details';
    const name = document.createElement('strong'); name.textContent = walletAssetName(item.key);
    const displayDate = item.date ? new Intl.DateTimeFormat(state.language === 'en' ? 'en-US' : state.language === 'ar' ? 'ar-IQ' : 'ku-IQ', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${item.date}T12:00:00`)) : '';
    const meta = document.createElement('small'); meta.textContent = `${item.amount} ${item.type === 'metal' ? walletAssetUnit(item.key) : text.unit} · ${displayDate}`;
    const purchase = document.createElement('small'); purchase.textContent = `${text.purchase}: ${formatWalletMoney(Number(item.purchasePrice), item.purchaseCurrency)}`;
    details.append(name, meta, purchase); info.append(icon, details);
    const stats = document.createElement('div'); stats.className = 'wallet-asset-stats';
    const profitEl = document.createElement('strong'); profitEl.className = 'wallet-loss'; profitEl.textContent = profit == null ? '—' : `${profit >= 0 ? '+' : ''}${formatWalletMoney(profit)}`;
    const pctEl = document.createElement('small'); const pct = paid > 0 && profit != null ? profit / paid * 100 : null; pctEl.className = 'wallet-loss'; pctEl.textContent = pct == null ? '—' : `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
    const currentEl = document.createElement('small'); currentEl.textContent = currentUnit == null ? '—' : formatWalletMoney(value);
    const actions = document.createElement('div'); actions.className = 'wallet-card-actions';
    const edit = document.createElement('button'); edit.type = 'button'; edit.textContent = text.edit; edit.addEventListener('click', () => openWalletForm(item));
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = text.delete; remove.addEventListener('click', () => { walletState.items = walletState.items.filter(entry => entry.id !== item.id); persistWallet(); renderWallet(); });
    stats.append(profitEl, pctEl, currentEl, actions); actions.append(edit, remove); card.append(info, stats); list.append(card);
  });
  walletEls.walletEmptyState.hidden = walletState.items.length > 0;
  walletEls.walletAssetList.hidden = walletState.items.length === 0;
  walletEls.walletTotal.textContent = known && walletState.items.length ? formatWalletMoney(total) : walletState.items.length ? '—' : formatWalletMoney(0);
  const net = known ? total - cost : null;
  walletEls.walletProfit.textContent = net == null ? '—' : `${net >= 0 ? '+' : ''}${formatWalletMoney(net)}`;
  const pct = known && cost > 0 ? net / cost * 100 : null;
  walletEls.walletProfitPercent.textContent = pct == null ? '—' : `${pct >= 0 ? '⌃ +' : '⌄ '}${Math.abs(pct).toFixed(2)}%`;
  walletEls.walletProfit.classList.toggle('wallet-loss', net == null || net <= 0);
  walletEls.walletProfitPercent.classList.toggle('wallet-loss', pct == null || pct <= 0);
  walletEls.walletFab.hidden = walletEls.walletFormView.hidden === false;
  walletCurrencyButtons.forEach(button => button.classList.toggle('active', button.dataset.walletCurrency === walletState.currency));
}
function persistWallet() { try { localStorage.setItem('exchangeWallet', JSON.stringify(walletState.items)); } catch (error) { console.warn('Unable to save wallet entries.', error); } }
function setBottomNavActive(view) { document.querySelectorAll('.bottom-nav-item').forEach(button => button.classList.toggle('active', button.dataset.view === view)); }
function openWalletForm(item = null) {
  walletState.editingId = item?.id || null;
  walletState.selectedKey = item?.key || null;
  walletEls.walletDashboard.hidden = true; walletEls.walletFormView.hidden = false;
  walletEls.walletFormTitle.textContent = item ? walletText().edit : walletText().addTitle;
  walletEls.walletAmountInput.value = item?.amount ?? '';
  walletEls.walletPurchaseInput.value = item?.purchasePrice ?? '';
  walletEls.walletDateInput.value = item?.date || new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  walletEls.walletNotesInput.value = item?.notes || '';
  walletEls.walletSelectedAsset.textContent = item ? walletAssetName(item.key) : walletText().asset;
  renderWallet();
}
function closeWalletForm() { walletEls.walletFormView.hidden = true; walletEls.walletDashboard.hidden = false; walletState.editingId = null; renderWallet(); }
function renderWalletPicker() {
  const category = walletState.pickerCategory;
  document.querySelectorAll('[data-picker-category]').forEach(button => button.classList.toggle('active', button.dataset.pickerCategory === category));
  walletEls.walletPickerOptions.replaceChildren();
  walletAssets.filter(item => item.type === (category === 'currencies' ? 'currency' : 'metal')).forEach(item => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'wallet-option'; button.textContent = walletAssetName(item.key);
    button.addEventListener('click', () => { walletState.selectedKey = item.key; walletEls.walletSelectedAsset.textContent = walletAssetName(item.key); walletEls.walletPickerBackdrop.hidden = true; });
    walletEls.walletPickerOptions.append(button);
  });
}
function activateMainView(view) {
  walletEls.walletView.hidden = view !== 'wallet';
  document.body.classList.toggle('wallet-open', view === 'wallet');
  document.documentElement.classList.toggle('wallet-open', view === 'wallet');
  if (view === 'wallet') {
    setMetalsViewOpen(false); metalInvestmentView.hidden = true; currencyRatesView.hidden = true; calculatorView.hidden = true;
    walletEls.walletDashboard.hidden = false; walletEls.walletFormView.hidden = true; renderWallet();
  } else if (view === 'rates') { setMetalsViewOpen(false); metalInvestmentView.hidden = true; showCurrencyRates(); }
  else if (view === 'metals') { heroMorph.sourceRect = null; showCurrencyRates(); setMetalsViewOpen(true); }
  else if (view === 'calculator') { setMetalsViewOpen(false); metalInvestmentView.hidden = true; openCalculatorForCurrency(state.selectedCurrency); }
  bottomNavItems.forEach(button => button.classList.toggle('active', button.dataset.view === view));
}
bottomNavItems.forEach(button => button.addEventListener('click', () => activateMainView(button.dataset.view)));
walletEls.walletEmptyAdd.addEventListener('click', () => openWalletForm());
walletEls.walletFab.addEventListener('click', () => openWalletForm());
walletEls.walletFormBack.addEventListener('click', closeWalletForm);
walletEls.walletAssetPicker.addEventListener('click', () => { walletState.pickerCategory = 'currencies'; renderWalletPicker(); walletEls.walletPickerBackdrop.hidden = false; });
walletEls.walletPickerClose.addEventListener('click', () => walletEls.walletPickerBackdrop.hidden = true);
walletEls.walletPickerBackdrop.addEventListener('click', event => { if (event.target === walletEls.walletPickerBackdrop) walletEls.walletPickerBackdrop.hidden = true; });
document.querySelectorAll('[data-picker-category]').forEach(button => button.addEventListener('click', () => { walletState.pickerCategory = button.dataset.pickerCategory; renderWalletPicker(); }));
walletCurrencyButtons.forEach(button => button.addEventListener('click', () => { walletState.currency = button.dataset.walletCurrency; localStorage.setItem('walletCurrency', walletState.currency); renderWallet(); }));
walletEls.walletSaveButton.addEventListener('click', () => {
  const amount = Number(walletEls.walletAmountInput.value), purchasePrice = Number(walletEls.walletPurchaseInput.value);
  if (!walletState.selectedKey) { walletEls.walletAssetPicker.focus(); return; }
  if (!(amount > 0)) { walletEls.walletAmountInput.setCustomValidity('Enter an amount greater than zero.'); walletEls.walletAmountInput.reportValidity(); walletEls.walletAmountInput.addEventListener('input', () => walletEls.walletAmountInput.setCustomValidity(''), { once: true }); return; }
  if (walletEls.walletPurchaseInput.value === '' || !(purchasePrice >= 0)) { walletEls.walletPurchaseInput.setCustomValidity('Enter a valid purchase price.'); walletEls.walletPurchaseInput.reportValidity(); walletEls.walletPurchaseInput.addEventListener('input', () => walletEls.walletPurchaseInput.setCustomValidity(''), { once: true }); return; }
  if (!walletEls.walletDateInput.value) { walletEls.walletDateInput.setCustomValidity('Choose the purchase date.'); walletEls.walletDateInput.reportValidity(); walletEls.walletDateInput.addEventListener('input', () => walletEls.walletDateInput.setCustomValidity(''), { once: true }); return; }
  const entry = { id: walletState.editingId || crypto.randomUUID(), key: walletState.selectedKey, type: walletAssets.find(asset => asset.key === walletState.selectedKey).type, amount, purchasePrice, purchaseCurrency: walletState.currency, date: walletEls.walletDateInput.value, notes: walletEls.walletNotesInput.value.trim() };
  const index = walletState.items.findIndex(item => item.id === entry.id); if (index >= 0) walletState.items[index] = entry; else walletState.items.unshift(entry);
  persistWallet(); closeWalletForm();
});
walletEls.walletAmountInput.addEventListener('input', renderWallet);
walletEls.walletPurchaseInput.addEventListener('input', renderWallet);
window.addEventListener('storage', event => { if (event.key === 'exchangeWallet') { try { walletState.items = JSON.parse(event.newValue || '[]'); renderWallet(); } catch {} } });
window.addEventListener('wallet-rates-updated', renderWallet);
window.walletInitialized = true;
renderWalletLabels();
