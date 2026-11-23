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
const WORKER_RATES_URL = 'https://exchange-rates-worker.iididar.workers.dev';
const RATES_URL = 'rates.json';
const CACHED_RATES_STORAGE_KEY = 'exchange_unified_rates_cache_v1';

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
    metalsTitle: 'نرخی کانزاکان',
    goldTitle: 'زێـڕ',
    silverTitle: 'زیـو',
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
const datetimeBoxEl = document.getElementById('datetimeBox');
const timeWrapperEl = document.getElementById('timeWrapper');
const rateNoticeTooltipEl = document.getElementById('rateNoticeTooltip');
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

function setBottomNavActive(view) {
  const items = document.querySelectorAll('.bottom-nav-item');
  items.forEach(button => {
    const isActive = button.dataset.view === view;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
}

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

// چاودێری ئاڕاستەی گۆڕانی نرخەکان (سەوز بۆ بەرزبوونەوە / سوور بۆ دابەزین بۆ ماوەی یەک چرکە)
const PRICE_TREND_STORAGE_KEY = 'exchange_price_trends_v1';

function loadPriceTrendState() {
  try {
    const raw = localStorage.getItem(PRICE_TREND_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const unwrap = (obj) => {
          const res = {};
          if (obj && typeof obj === 'object') {
            for (const k in obj) {
              const val = obj[k];
              res[k] = typeof val === 'number' ? val : (val && typeof val.price === 'number' ? val.price : null);
            }
          }
          return res;
        };
        return {
          currencies: unwrap(parsed.currencies),
          metals: unwrap(parsed.metals)
        };
      }
    }
  } catch (_) {}
  return { currencies: {}, metals: {} };
}

const priceTrends = loadPriceTrendState();

function savePriceTrendState() {
  try {
    localStorage.setItem(PRICE_TREND_STORAGE_KEY, JSON.stringify(priceTrends));
  } catch (_) {}
}

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
  if (languageSelectorLabelEl) languageSelectorLabelEl.textContent = text.language;
  if (currencySelectorLabelEl) currencySelectorLabelEl.textContent = text.currenciesLabel;
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

    const rateKey = `${state.currencyRateBase}_${currency}`;
    const prevRate = priceTrends.currencies[rateKey];
    let changeDirection = null;

    if (Number.isFinite(rate) && rate > 0) {
      if (Number.isFinite(prevRate)) {
        const diff = rate - prevRate;
        if (Math.abs(diff) > 0.0001) {
          changeDirection = diff > 0 ? 'up' : 'down';
        }
      }
      priceTrends.currencies[rateKey] = rate;
    }

    if (changeDirection === 'up') {
      card.classList.add('price-flash-up');
      const cleanup = () => card.classList.remove('price-flash-up');
      card.addEventListener('animationend', cleanup, { once: true });
      setTimeout(cleanup, 1100);
    } else if (changeDirection === 'down') {
      card.classList.add('price-flash-down');
      const cleanup = () => card.classList.remove('price-flash-down');
      card.addEventListener('animationend', cleanup, { once: true });
      setTimeout(cleanup, 1100);
    }

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
  savePriceTrendState();
  if (animateRows) animateCurrencyRateCards();
}

function openCalculatorForCurrency(currency, sourceCardEl) {
  if (!Object.prototype.hasOwnProperty.call(CURRENCY_SYMBOLS, currency)) return;
  heroMorph.isAnimating = false;

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
  document.body.classList.remove('wallet-open');
  document.documentElement.classList.remove('wallet-open');
  const walletViewEl = document.getElementById('walletView');
  if (walletViewEl) walletViewEl.hidden = true;
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
      adjustAmountFontSize(topAmountEl);
      adjustAmountFontSize(bottomAmountEl);
      adjustRateBannerFontSize();
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
      adjustAmountFontSize(topAmountEl);
      adjustAmountFontSize(bottomAmountEl);
      adjustRateBannerFontSize();
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
  metalInvestmentView.hidden = true;
  document.body.classList.remove('metals-open');
  document.body.classList.remove('wallet-open');
  document.documentElement.classList.remove('wallet-open');
  const walletViewEl = document.getElementById('walletView');
  if (walletViewEl) walletViewEl.hidden = true;

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

    const prevPrice = priceTrends.metals[item.key];
    let changeDirection = null;

    if (Number.isFinite(prevPrice)) {
      const diff = price - prevPrice;
      if (Math.abs(diff) > 0.0001) {
        changeDirection = diff > 0 ? 'up' : 'down';
      }
    }
    priceTrends.metals[item.key] = price;

    card.classList.remove('price-up', 'price-down');
    if (changeDirection === 'up') {
      card.classList.remove('price-flash-up', 'price-flash-down');
      void card.offsetWidth;
      card.classList.add('price-flash-up');
      const cleanup = () => card.classList.remove('price-flash-up');
      card.addEventListener('animationend', cleanup, { once: true });
      setTimeout(cleanup, 1100);
    } else if (changeDirection === 'down') {
      card.classList.remove('price-flash-up', 'price-flash-down');
      void card.offsetWidth;
      card.classList.add('price-flash-down');
      const cleanup = () => card.classList.remove('price-flash-down');
      card.addEventListener('animationend', cleanup, { once: true });
      setTimeout(cleanup, 1100);
    }

    card.dataset.price = String(price);
  });
  savePriceTrendState();
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

async function fetchLiveMetalsFallback() {
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
  if (isOpen) {
    activateMainView('metals');
  } else {
    metalState.isOpen = false;
    metalsView.hidden = true;
    metalInvestmentView.hidden = true;
    document.body.classList.remove('metals-open');
    if (state.currentView === 'metals') {
      activateMainView('rates');
    }
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
  if (!el || el.clientWidth === 0) return;
  el.style.fontSize = '';
  const initialSize = parseFloat(getComputedStyle(el).fontSize);
  if (!Number.isFinite(initialSize) || initialSize <= 16) return;

  let low = 16;
  let high = Math.floor(initialSize);

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
  el.scrollLeft = 0;
}

function renderDateOrDay() {
  if (!state.telegramTimestamp) {
    dateDisplayEl.textContent = '--/--/----';
    timeDisplayEl.textContent = '--:-- --';
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

  let hours = postDate.getHours();
  const minutes = String(postDate.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  timeDisplayEl.textContent = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
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
  if (!liveRateBannerEl || liveRateBannerEl.clientWidth === 0) return;
  liveRateBannerEl.style.fontSize = '';
  const initialSize = parseFloat(getComputedStyle(liveRateBannerEl).fontSize);
  if (!Number.isFinite(initialSize) || initialSize <= 10) return;

  let low = 10;
  let high = Math.floor(initialSize);

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
  topAmountEl.scrollLeft = 0;

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
  bottomAmountEl.scrollLeft = 0;
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

let rateNoticeTimer = null;

function hideRateNoticeAnimation() {
  if (rateNoticeTimer) {
    clearTimeout(rateNoticeTimer);
    rateNoticeTimer = null;
  }
  if (rateNoticeTooltipEl) {
    rateNoticeTooltipEl.classList.remove('is-visible');
  }
  if (timeWrapperEl) {
    timeWrapperEl.classList.remove('is-open');
  }
}

function toggleRateNoticeAnimation() {
  if (!rateNoticeTooltipEl) return;

  // گەر دەستت پێدانا بچێتەوە ناوەوە
  if (rateNoticeTooltipEl.classList.contains('is-visible')) {
    hideRateNoticeAnimation();
    return;
  }

  if (rateNoticeTimer) {
    clearTimeout(rateNoticeTimer);
    rateNoticeTimer = null;
  }

  rateNoticeTooltipEl.classList.remove('is-visible');
  if (timeWrapperEl) timeWrapperEl.classList.remove('is-open');
  void rateNoticeTooltipEl.offsetWidth;
  rateNoticeTooltipEl.classList.add('is-visible');
  if (timeWrapperEl) timeWrapperEl.classList.add('is-open');

  // گەر دەستیش پێدانەنا دوای چرکەیەک خۆی بچێتەوە ناوەوە (1 second)
  rateNoticeTimer = setTimeout(() => {
    hideRateNoticeAnimation();
  }, 1000);
}

if (dateDisplayEl) {
  dateDisplayEl.addEventListener('click', (e) => {
    e.stopPropagation();
    state.showDayName = !state.showDayName;
    renderDateOrDay();
    toggleRateNoticeAnimation();
  });
}

if (timeWrapperEl) {
  timeWrapperEl.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleRateNoticeAnimation();
  });
} else if (timeDisplayEl) {
  timeDisplayEl.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleRateNoticeAnimation();
  });
}

if (datetimeBoxEl) {
  datetimeBoxEl.addEventListener('click', () => {
    showRateNoticeAnimation();
  });
}

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

// Refreshes only the data pipeline for the currently visible screen (using Cloudflare Worker).
refreshBtn.addEventListener('click', async () => {
  refreshBtn.classList.add('spinning');
  await fetchUnifiedRates(true);
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

document.addEventListener('keydown', (e) => {
  if (state.currentView !== 'calculator' || calculatorView.hidden) return;
  if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
  if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
    e.preventDefault();
    handleKeyPress(e.key);
  } else if (e.key === 'Backspace') {
    e.preventDefault();
    handleKeyPress('BACKSPACE');
  }
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

function applyUnifiedRates(data) {
  if (!data || typeof data !== 'object') return;

  // 1. USD / IQD rate
  const telegramRate = Number(data?.rates?.usd?.iqdPer100Usd ?? data?.telegram?.iqdPer100Usd);
  const telegramTimeRaw = data?.rates?.usd?.latestPostAt ?? data?.telegram?.latestPostAt ?? data?.updatedAt;
  const telegramTimestamp = telegramTimeRaw ? Date.parse(telegramTimeRaw) : NaN;

  if (Number.isFinite(telegramRate) && telegramRate > 0) {
    const validTs = Number.isFinite(telegramTimestamp) ? telegramTimestamp : Date.now();
    updateTelegramRate(telegramRate, validTs);
  }

  // 2. Rudaw Toman rate
  const tomanRate = Number(data?.rates?.toman?.tomanPer100000Iqd ?? data?.rudaw?.tomanPer100000Iqd);
  if (Number.isFinite(tomanRate) && tomanRate > 0) {
    state.otherRates.IRR = Math.round(tomanRate);
    state.rudawTomanBuy = state.otherRates.IRR;
    try {
      localStorage.setItem('rudawRate_IRR', String(state.otherRates.IRR));
      localStorage.setItem('rudawTomanBuy', String(state.otherRates.IRR));
    } catch (_) {}
  }

  // 3. FX Quotes (EUR, GBP, USDTRY)
  let fxUpdated = false;
  const fxObj = data?.rates?.fx;
  if (fxObj) {
    const eurQuote = Number(fxObj.EUR ?? fxObj.EURUSD);
    if (Number.isFinite(eurQuote) && eurQuote > 0) {
      state.usdFxQuotes.EUR = eurQuote;
      try { localStorage.setItem('liveFxQuote_EUR', String(eurQuote)); } catch (_) {}
      fxUpdated = true;
    }
    const gbpQuote = Number(fxObj.GBP ?? fxObj.GBPUSD);
    if (Number.isFinite(gbpQuote) && gbpQuote > 0) {
      state.usdFxQuotes.GBP = gbpQuote;
      try { localStorage.setItem('liveFxQuote_GBP', String(gbpQuote)); } catch (_) {}
      fxUpdated = true;
    }
    const usdTryQuote = Number(fxObj.USDTRY ?? fxObj.TRY);
    if (Number.isFinite(usdTryQuote) && usdTryQuote > 0) {
      state.usdFxQuotes.USDTRY = usdTryQuote;
      try { localStorage.setItem('liveFxQuote_USDTRY', String(usdTryQuote)); } catch (_) {}
      fxUpdated = true;
    }
  } else if (data?.rudaw) {
    applyRudawFxQuotes(data.rudaw);
  }

  if (fxUpdated) {
    recalculateUsdFxQuotes();
  }

  // 4. Metals Quotes (Gold & Silver)
  const goldPrice = Number(data?.rates?.metals?.goldOunce ?? data?.rates?.metals?.goldOunceUsd);
  if (Number.isFinite(goldPrice) && goldPrice > 0) {
    metalState.goldOunce = goldPrice;
    cacheMetalPrice(METAL_CACHE_KEYS.gold, goldPrice);
  }

  const silverPrice = Number(data?.rates?.metals?.silverOunce ?? data?.rates?.metals?.silverOunceUsd);
  if (Number.isFinite(silverPrice) && silverPrice > 0) {
    metalState.silverOunce = silverPrice;
    cacheMetalPrice(METAL_CACHE_KEYS.silver, silverPrice);
  }

  if (typeof renderMetalPrices === 'function') {
    renderMetalPrices();
  }
  if (metalsStatus) {
    metalsStatus.textContent = (metalState.goldOunce || metalState.silverOunce)
      ? ''
      : getTranslations().metalsUnavailable;
  }

  // 5. Render UI
  renderRateBanner();
  calculateAndRender();
  renderCurrencyRateList();
  window.dispatchEvent(new Event('wallet-rates-updated'));
}

async function fetchExchangeRatesFallback() {
  try {
    const response = await fetch(`${RATES_URL}?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Rate snapshot returned HTTP ${response.status}`);
    const data = await response.json();
    const telegramRate = Number(data?.telegram?.iqdPer100Usd);
    const telegramTimestamp = Date.parse(data?.telegram?.latestPostAt);
    if (Number.isFinite(telegramRate) && telegramRate > 0 && Number.isFinite(telegramTimestamp)) {
      updateTelegramRate(telegramRate, telegramTimestamp);
    }
    if (data.rudaw) {
      applyRudawFxQuotes(data.rudaw);
      applyRudawTomanRate(data.rudaw);
    }
  } catch (error) {
    console.warn('Fallback rates snapshot error:', error);
  }
  await fetchLiveForeignRates();
  renderCurrencyRateList();
}

let isFetchingUnifiedRates = false;
async function fetchUnifiedRates(forceFresh = false) {
  if (isFetchingUnifiedRates) return;
  isFetchingUnifiedRates = true;
  try {
    const url = forceFresh ? `${WORKER_RATES_URL}?t=${Date.now()}` : WORKER_RATES_URL;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(url, {
      signal: controller.signal,
      cache: forceFresh ? 'no-store' : 'default'
    });
    clearTimeout(timeout);

    if (!response.ok) throw new Error(`Worker returned HTTP ${response.status}`);
    const data = await response.json();
    if (!data || (!data.rates && !data.telegram)) throw new Error('Invalid worker payload');

    applyUnifiedRates(data);
    try {
      localStorage.setItem(CACHED_RATES_STORAGE_KEY, JSON.stringify(data));
    } catch (_) {}
  } catch (error) {
    console.warn('Unified rates worker fetch failed, running fallbacks...', error);
    await Promise.allSettled([
      fetchExchangeRatesFallback(),
      fetchLiveMetalsFallback()
    ]);
  } finally {
    isFetchingUnifiedRates = false;
  }
}

async function fetchExchangeRates() {
  await fetchUnifiedRates();
}

async function fetchLiveMetals() {
  await fetchUnifiedRates();
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

// بارکردنی دەستبەجێ لە کاشی ناوخۆیی (Instant 0ms Cache Load)
try {
  const cachedRatesRaw = localStorage.getItem(CACHED_RATES_STORAGE_KEY);
  if (cachedRatesRaw) {
    const cachedData = JSON.parse(cachedRatesRaw);
    applyUnifiedRates(cachedData);
  }
} catch (e) {
  console.warn('Could not read cached rates from localStorage', e);
}

// پەیوەندی بە سێرڤەر بۆ هێنانی نوێترین نرخەکان
fetchUnifiedRates();

// نوێکردنەوەی خۆکارانەی هەموو نرخەکان هەموو ١٥ چرکە جارێک
setInterval(() => {
  fetchUnifiedRates();
}, 15000);

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    fetchUnifiedRates();
  }
});

// Wallet portfolio and bottom navigation.
const walletCopy = {
  ku: {
    rates: 'دراوەکان',
    metals: 'کانزاکان',
    calculator: 'ژمێرەر',
    wallet: 'جزدان',
    title: 'دارایی',
    estimate: 'کۆی گشتی سامان',
    empty: 'هێشتا هیچ سامانێکت نییە',
    emptyHint: 'یەکەم کڕینەکەت زیاد بکە بۆ بەدواداچوونی وەبەرهێنانەکانت',
    add: '+ زیادکردنی سامان',
    addTitle: 'زیادکردنی سامان',
    asset: 'سامان هەڵبژێرە',
    amount: 'بڕی سامان',
    unitPrice: 'نرخی کڕینی تاک',
    totalPrice: 'نرخی کڕینی گشتی',
    livePriceTitle: 'نرخی بازاڕی ڕاستەوخۆ',
    date: 'بەرواری کڕین',
    notes: 'تێبینی (ئارەزوومەندانە)',
    save: 'پاشەکەوتکردن',
    goldTab: 'زێـڕ',
    silverTab: 'زیـو',
    picker: 'کانزا هەڵبژێرە',
    edit: 'دەستکاری',
    delete: 'سڕینەوە',
    deleteAsset: 'سڕینەوەی ئەم سامانە',
    confirmDeleteTitle: '',
    confirmDeleteDesc: 'ئایا دڵنیایت لە سڕینەوەی ئەم سامانە؟',
    cancel: 'گەڕانەوە',
    confirmDelete: 'سڕینەوە',
    buyUnitPrice: 'نرخی کڕینی تاک',
    buyTotalPrice: 'نرخی کڕینی گشتی',
    liveUnitPrice: 'نرخی ئێستای تاک',
    liveTotalPrice: 'نرخی گشتی ئێستا',
    profit: 'قازانج',
    unit: 'دانە',
    saved: 'پاشەکەوت کرا',
    purchase: 'نرخی کڕین',
    perUnit: 'بۆ هەر',
    gram: 'گرام',
    misqal: 'مسقاڵ',
    ounce: 'ئۆنسە',
    kg: 'کیلۆگرام',
    lira: 'لیرە'
  },
  ar: {
    rates: 'أسعار العملات',
    metals: 'المعادن',
    calculator: 'الحاسبة',
    wallet: 'المحفظة',
    title: 'الأصول والمالية',
    estimate: 'إجمالي الأصول',
    empty: 'لا توجد أصول بعد',
    emptyHint: 'أضف أول أصل لمتابعة استثماراتك',
    add: '+ إضافة أصل',
    addTitle: 'إضافة أصل',
    asset: 'اختر المعدن',
    amount: 'الكمية',
    unitPrice: 'سعر شراء الوحدة',
    totalPrice: 'إجمالي سعر الشراء',
    livePriceTitle: 'سعر السوق المباشر',
    date: 'تاريخ الشراء',
    notes: 'ملاحظات (اختياري)',
    save: 'حفظ',
    goldTab: 'الذهب',
    silverTab: 'الفضة',
    picker: 'اختر المعدن',
    edit: 'تعديل',
    delete: 'حذف',
    deleteAsset: 'حذف هذا الأصل',
    confirmDeleteTitle: '',
    confirmDeleteDesc: 'هل أنت متأكد من حذف هذا الأصل؟',
    cancel: 'رجوع',
    confirmDelete: 'حذف',
    buyUnitPrice: 'سعر شراء الوحدة',
    buyTotalPrice: 'إجمالي سعر الشراء',
    liveUnitPrice: 'سعر الوحدة الحالي',
    liveTotalPrice: 'إجمالي السعر الحالي',
    profit: 'الربح',
    unit: 'وحدة',
    saved: 'تم الحفظ',
    purchase: 'سعر الشراء',
    perUnit: 'لكل',
    gram: 'غرام',
    misqal: 'مثقال',
    ounce: 'أونصة',
    kg: 'كيلوغرام',
    lira: 'ليرة'
  },
  en: {
    rates: 'Rates',
    metals: 'Metals',
    calculator: 'Calculator',
    wallet: 'Wallet',
    title: 'Finance',
    estimate: 'Total Assets',
    empty: 'Your wallet is empty',
    emptyHint: 'Add your first asset to track your investments',
    add: '+ Add asset',
    addTitle: 'Add asset',
    asset: 'Select metal',
    amount: 'Quantity',
    unitPrice: 'Unit purchase price',
    totalPrice: 'Total purchase price',
    livePriceTitle: 'Live Market Price',
    date: 'Purchase date',
    notes: 'Notes (optional)',
    save: 'Save',
    goldTab: 'Gold',
    silverTab: 'Silver',
    picker: 'Select metal',
    edit: 'Edit',
    delete: 'Delete',
    deleteAsset: 'Delete this asset',
    confirmDeleteTitle: '',
    confirmDeleteDesc: 'Are you sure you want to delete this asset?',
    cancel: 'Cancel',
    confirmDelete: 'Delete',
    buyUnitPrice: 'Purchase Unit Price',
    buyTotalPrice: 'Total Purchase Price',
    liveUnitPrice: 'Current Unit Price',
    liveTotalPrice: 'Current Total Price',
    profit: 'Profit',
    unit: 'units',
    saved: 'Saved',
    purchase: 'Purchase price',
    perUnit: 'per',
    gram: 'g',
    misqal: 'Mithqal',
    ounce: 'oz',
    kg: 'kg',
    lira: 'coin'
  }
};

// Metals-only assets portfolio
const walletAssets = [
  { key: 'gold24k', type: 'metal', category: 'gold' },
  { key: 'gold22k', type: 'metal', category: 'gold' },
  { key: 'gold21k', type: 'metal', category: 'gold' },
  { key: 'gold18k', type: 'metal', category: 'gold' },
  { key: 'dubaiLira', type: 'metal', category: 'gold' },
  { key: 'goldOunce', type: 'metal', category: 'gold' },
  { key: 'silverOunce', type: 'metal', category: 'silver' },
  { key: 'silverKg', type: 'metal', category: 'silver' }
];

const walletElementIds = [
  'walletView', 'walletDashboard', 'walletFormView', 'walletTitle', 'walletEstimatedLabel',
  'walletTotal', 'walletProfit', 'walletProfitPercent', 'walletAssetList', 'walletEmptyState',
  'walletEmptyTitle', 'walletEmptySubtitle', 'walletEmptyAdd', 'walletFormTitle', 'walletAssetLabel',
  'walletAssetPicker', 'walletSelectedAsset', 'walletAmountLabel', 'walletAmountInput',
  'walletUnitPriceLabel', 'walletUnitPriceInput', 'walletUnitPriceCurrency',
  'walletTotalPriceLabel', 'walletTotalPriceInput', 'walletTotalPriceCurrency',
  'walletLivePriceBanner', 'walletLivePriceTitle', 'walletLivePriceAmount', 'walletLivePriceUnit',
  'walletFormCurrencyToggle', 'walletDateLabel', 'walletDateInput', 'walletNotesLabel', 'walletNotesInput',
  'walletSaveButton', 'walletFormDeleteBtn', 'walletPickerBackdrop', 'walletPickerTitle', 'walletPickerOptions', 'walletPickerClose',
  'walletConfirmBackdrop', 'walletConfirmTitle', 'walletConfirmDesc', 'walletConfirmItemPreview',
  'walletConfirmCancelBtn', 'walletConfirmDeleteBtn', 'walletFab', 'walletFormBack',
  'walletDetailBackdrop', 'walletDetailEditBtn', 'walletDetailCloseBtn', 'walletDetailIcon', 'walletDetailName', 'walletDetailMeta',
  'walletDetailBuyUnitLabel', 'walletDetailBuyUnitVal',
  'walletDetailBuyTotalLabel', 'walletDetailBuyTotalVal',
  'walletDetailLiveUnitLabel', 'walletDetailLiveUnitVal',
  'walletDetailLiveTotalLabel', 'walletDetailLiveTotalVal',
  'walletDetailProfitLabel', 'walletDetailProfitVal',
  'walletDetailNotesCard', 'walletDetailNotesLabel', 'walletDetailNotesVal'
];
const walletEls = Object.fromEntries(walletElementIds.map(id => [id, document.getElementById(id)]));

let walletState = {
  items: [],
  currency: localStorage.getItem('walletCurrency') === 'USD' ? 'USD' : 'IQD',
  formCurrency: 'IQD',
  lastEditedPriceField: 'unit',
  editingId: null,
  selectedKey: 'gold21k',
  pickerCategory: 'gold'
};

try {
  walletState.items = JSON.parse(localStorage.getItem('exchangeWallet') || '[]').filter(
    item => item && typeof item.id === 'string' && walletAssets.some(asset => asset.key === item.key)
  );
} catch {
  walletState.items = [];
}

const walletCurrencyButtons = document.querySelectorAll('[data-wallet-currency]');
const bottomNavItems = document.querySelectorAll('.bottom-nav-item');

function formatWalletMoney(value, currency = walletState.currency) {
  if (!Number.isFinite(value) || isNaN(value)) return '—';
  const isIqd = currency === 'IQD';
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);

  if (isIqd) {
    // دینار: هەزارەکان بە خاڵ (.) جیا دەکرێنەوە، ئەگەر سەنت هەبێت بە فاریزە (،)
    const hasDecimal = Math.abs(abs - Math.round(abs)) >= 0.01;
    if (hasDecimal) {
      const parts = abs.toFixed(2).split('.');
      const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return `${sign}${intPart},${parts[1]} IQD`;
    }
    const intPart = Math.round(abs).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${sign}${intPart} IQD`;
  } else {
    // دۆلار: هەزارەکان بە فاریزە (,) و سەنت دوای خاڵ (.)
    const parts = abs.toFixed(2).split('.');
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${sign}${intPart}.${parts[1]} ${currency}`;
  }
}

function formatInputNumber(val, currency) {
  if (!Number.isFinite(val) || isNaN(val)) return '';
  if (currency === 'IQD') {
    return Math.abs(val - Math.round(val)) < 0.01 ? String(Math.round(val)) : String(parseFloat(val.toFixed(2)));
  }
  return String(parseFloat(val.toFixed(2)));
}

function walletText() {
  return walletCopy[state.language] || walletCopy.en;
}

function walletAssetName(key) {
  const asset = walletAssets.find(option => option.key === key);
  if (!asset) return key;
  return getTranslations().metalNames[key] || key;
}

function walletAssetUnit(key) {
  const text = walletText();
  if (['gold18k', 'gold21k', 'gold22k', 'gold24k'].includes(key)) return text.misqal || 'مسقاڵ';
  if (key === 'dubaiLira') return text.lira;
  if (key.endsWith('Ounce')) return text.ounce;
  if (key === 'silverKg') return text.kg;
  return text.unit;
}

function getAssetIconSvg(key) {
  if (key === 'dubaiLira') {
    // دراوی ئاڵتوونی لیرەی دووبەی (Minted gold coin)
    return `<svg class="wallet-coin-icon" viewBox="0 0 24 24" width="22" height="22" fill="none">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" stroke-width="1.8" fill="rgba(234, 179, 8, 0.16)"/>
      <circle cx="12" cy="12" r="7" stroke="currentColor" stroke-width="1.1" stroke-dasharray="2 1.5"/>
      <circle cx="12" cy="12" r="3.6" stroke="currentColor" stroke-width="1.2"/>
      <path d="M12 6.5v2M12 15.5v2M6.5 12h2M15.5 12h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="12" cy="12" r="1.2" fill="currentColor"/>
    </svg>`;
  }
  if (key && key.startsWith('silver')) {
    // خشتی زیو (Silver bullion)
    return `<svg class="wallet-silver-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 16.5l3.5-7.5h9l3.5 7.5H4z" stroke-width="1.8" fill="rgba(148, 163, 184, 0.15)"/>
      <path d="M8.5 16.5l2-7.5M15.5 16.5l-2-7.5" stroke-width="1.3"/>
      <path d="M4 16.5l1.5 2.5h13l1.5-2.5" stroke-width="1.8"/>
    </svg>`;
  }
  // خشتی زێڕ (Gold bullion / misqals)
  return `<svg class="wallet-gold-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 16.5l3.5-7.5h9l3.5 7.5H4z" stroke-width="1.8" fill="rgba(234, 179, 8, 0.16)"/>
    <path d="M8.5 16.5l2-7.5M15.5 16.5l-2-7.5" stroke-width="1.3"/>
    <path d="M4 16.5l1.5 2.5h13l1.5-2.5" stroke-width="1.8"/>
  </svg>`;
}

function getMetalLivePrice(key, currency = 'IQD') {
  const usdIqd = getEffectiveUsdRate() / 100;
  if (!(usdIqd > 0)) return null;

  const isSilver = key.startsWith('silver');
  const ounce = isSilver ? metalState.silverOunce : metalState.goldOunce;
  if (!(ounce > 0)) return null;

  let unitPriceIqd = null;
  let unitPriceUsd = null;

  if (['gold18k', 'gold21k', 'gold22k', 'gold24k'].includes(key)) {
    const item = GOLD_PRICE_ITEMS.find(i => i.key === key);
    if (!item) return null;
    const misqalUsd = item.calculate(ounce); // 1 misqal in USD
    unitPriceUsd = misqalUsd;
    unitPriceIqd = misqalUsd * usdIqd;
  } else if (key === 'dubaiLira') {
    unitPriceUsd = ounce * 0.2035;
    unitPriceIqd = unitPriceUsd * usdIqd;
  } else if (key === 'goldOunce' || key === 'silverOunce') {
    unitPriceUsd = ounce;
    unitPriceIqd = unitPriceUsd * usdIqd;
  } else if (key === 'silverKg') {
    unitPriceUsd = ounce * 32.1507;
    unitPriceIqd = unitPriceUsd * usdIqd;
  }

  return currency === 'USD' ? unitPriceUsd : unitPriceIqd;
}

function updateFormLivePriceBanner() {
  const key = walletState.selectedKey || 'gold21k';
  const curr = walletState.formCurrency;
  const livePrice = getMetalLivePrice(key, curr);
  const unit = walletAssetUnit(key);
  const text = walletText();

  if (walletEls.walletLivePriceAmount) {
    if (livePrice != null && livePrice > 0) {
      walletEls.walletLivePriceAmount.textContent = formatWalletMoney(livePrice, curr);
    } else {
      walletEls.walletLivePriceAmount.textContent = '—';
    }
  }

  if (walletEls.walletLivePriceUnit) {
    walletEls.walletLivePriceUnit.textContent = `${text.perUnit} 1 ${unit}`;
  }

  if (walletEls.walletUnitPriceCurrency) walletEls.walletUnitPriceCurrency.textContent = curr;
  if (walletEls.walletTotalPriceCurrency) walletEls.walletTotalPriceCurrency.textContent = curr;

  const formCurrencyBtns = document.querySelectorAll('[data-form-currency]');
  formCurrencyBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.formCurrency === curr));
}

function setFormCurrency(newCurrency) {
  if (walletState.formCurrency === newCurrency) return;
  const oldCurrency = walletState.formCurrency;
  walletState.formCurrency = newCurrency;
  const usdIqd = getEffectiveUsdRate() / 100;

  if (usdIqd > 0) {
    const currentUnit = parseFloat(walletEls.walletUnitPriceInput.value);
    const currentTotal = parseFloat(walletEls.walletTotalPriceInput.value);

    if (!isNaN(currentUnit) && currentUnit > 0) {
      const convertedUnit = oldCurrency === 'IQD' && newCurrency === 'USD'
        ? currentUnit / usdIqd
        : currentUnit * usdIqd;
      walletEls.walletUnitPriceInput.value = formatInputNumber(convertedUnit, newCurrency);
    }

    if (!isNaN(currentTotal) && currentTotal > 0) {
      const convertedTotal = oldCurrency === 'IQD' && newCurrency === 'USD'
        ? currentTotal / usdIqd
        : currentTotal * usdIqd;
      walletEls.walletTotalPriceInput.value = formatInputNumber(convertedTotal, newCurrency);
    }
  }

  updateFormLivePriceBanner();
}

function syncPriceCalculations(source) {
  const qty = parseFloat(walletEls.walletAmountInput.value);
  const curr = walletState.formCurrency;

  if (source === 'unit') {
    walletState.lastEditedPriceField = 'unit';
    const unit = parseFloat(walletEls.walletUnitPriceInput.value);
    if (qty > 0 && !isNaN(unit) && unit >= 0) {
      const total = qty * unit;
      walletEls.walletTotalPriceInput.value = formatInputNumber(total, curr);
    } else if (walletEls.walletUnitPriceInput.value === '') {
      walletEls.walletTotalPriceInput.value = '';
    }
  } else if (source === 'total') {
    walletState.lastEditedPriceField = 'total';
    const total = parseFloat(walletEls.walletTotalPriceInput.value);
    if (qty > 0 && !isNaN(total) && total >= 0) {
      const unit = total / qty;
      walletEls.walletUnitPriceInput.value = formatInputNumber(unit, curr);
    } else if (walletEls.walletTotalPriceInput.value === '') {
      walletEls.walletUnitPriceInput.value = '';
    }
  } else if (source === 'amount') {
    if (!(qty > 0)) return;
    if (walletState.lastEditedPriceField === 'total') {
      const total = parseFloat(walletEls.walletTotalPriceInput.value);
      if (!isNaN(total) && total >= 0) {
        const unit = total / qty;
        walletEls.walletUnitPriceInput.value = formatInputNumber(unit, curr);
      }
    } else {
      const unit = parseFloat(walletEls.walletUnitPriceInput.value);
      if (!isNaN(unit) && unit >= 0) {
        const total = qty * unit;
        walletEls.walletTotalPriceInput.value = formatInputNumber(total, curr);
      }
    }
  }
}

function formatPnlValues(amount, percent, currency) {
  if (amount == null || !Number.isFinite(amount)) {
    return { status: 'neutral', amountStr: '—', percentStr: '—' };
  }

  const isZero = Math.abs(amount) < (currency === 'IQD' ? 1 : 0.005);
  if (isZero) {
    return {
      status: 'neutral',
      amountStr: formatWalletMoney(0, currency),
      percentStr: '0.00%'
    };
  }

  const isProfit = amount > 0;
  const sign = isProfit ? '+' : '-';
  const absAmount = Math.abs(amount);
  const formattedAmount = formatWalletMoney(absAmount, currency);
  const formattedPct = percent != null && Number.isFinite(percent)
    ? `${sign}${Math.abs(percent).toFixed(2)}%`
    : '';

  return {
    status: isProfit ? 'profit' : 'loss',
    amountStr: `${sign}${formattedAmount}`,
    percentStr: formattedPct
  };
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
  if (walletEls.walletUnitPriceLabel) walletEls.walletUnitPriceLabel.textContent = text.unitPrice;
  if (walletEls.walletTotalPriceLabel) walletEls.walletTotalPriceLabel.textContent = text.totalPrice;
  if (walletEls.walletLivePriceTitle) walletEls.walletLivePriceTitle.textContent = text.livePriceTitle;
  walletEls.walletDateLabel.textContent = text.date;
  walletEls.walletNotesLabel.textContent = text.notes;
  walletEls.walletSaveButton.textContent = text.save;
  if (walletEls.walletFormDeleteBtn) walletEls.walletFormDeleteBtn.textContent = text.deleteAsset || text.delete;
  walletEls.walletPickerTitle.textContent = text.picker;

  const goldTabBtn = document.querySelector('[data-picker-category="gold"]');
  if (goldTabBtn) goldTabBtn.textContent = text.goldTab;
  const silverTabBtn = document.querySelector('[data-picker-category="silver"]');
  if (silverTabBtn) silverTabBtn.textContent = text.silverTab;

  walletCurrencyButtons.forEach(button => button.classList.toggle('active', button.dataset.walletCurrency === walletState.currency));
  updateFormLivePriceBanner();
  renderWallet();
}

let pendingDeleteId = null;
let pendingDeleteFromForm = false;

function showDeleteConfirmation(itemId, fromForm = false) {
  const item = walletState.items.find(i => i.id === itemId);
  if (!item) return;

  pendingDeleteId = itemId;
  pendingDeleteFromForm = fromForm;
  const text = walletText();
  const unit = walletAssetUnit(item.key);
  const name = walletAssetName(item.key);

  if (walletEls.walletConfirmTitle) walletEls.walletConfirmTitle.textContent = text.confirmDeleteTitle || '';
  if (walletEls.walletConfirmDesc) walletEls.walletConfirmDesc.textContent = text.confirmDeleteDesc || 'ئایا دڵنیایت لە سڕینەوەی ئەم سامانە؟';
  if (walletEls.walletConfirmItemPreview) walletEls.walletConfirmItemPreview.textContent = `${name} · ${item.amount} ${unit}`;
  if (walletEls.walletConfirmCancelBtn) walletEls.walletConfirmCancelBtn.textContent = text.cancel || 'گەڕانەوە';
  if (walletEls.walletConfirmDeleteBtn) walletEls.walletConfirmDeleteBtn.textContent = text.confirmDelete || 'سڕینەوە';

  if (walletEls.walletConfirmBackdrop) {
    walletEls.walletConfirmBackdrop.hidden = false;
    const trashSvg = walletEls.walletConfirmBackdrop.querySelector('.wallet-confirm-icon-wrap svg');
    if (trashSvg) {
      trashSvg.style.animation = 'none';
      void trashSvg.offsetHeight;
      trashSvg.style.animation = '';
    }
  }
}

function hideDeleteConfirmation() {
  pendingDeleteId = null;
  pendingDeleteFromForm = false;
  if (walletEls.walletConfirmBackdrop) walletEls.walletConfirmBackdrop.hidden = true;
}

let selectedDetailItem = null;

function closeAllCardMenus() {
  document.querySelectorAll('.wallet-card-menu-popover:not([hidden])').forEach(el => {
    el.hidden = true;
  });
}

function showWalletDetail(item) {
  if (!item) return;
  selectedDetailItem = item;
  closeAllCardMenus();

  const text = walletText();
  const targetCurr = walletState.currency;
  const usdIqd = getEffectiveUsdRate() / 100;
  const qty = Number(item.amount) || 0;
  const unit = walletAssetUnit(item.key);

  if (walletEls.walletDetailIcon) {
    walletEls.walletDetailIcon.className = `wallet-asset-icon wallet-detail-icon ${item.key.startsWith('silver') ? 'is-silver' : ''}`;
    walletEls.walletDetailIcon.innerHTML = getAssetIconSvg(item.key);
  }
  if (walletEls.walletDetailName) {
    walletEls.walletDetailName.textContent = walletAssetName(item.key);
  }

  const displayDate = item.date ? new Intl.DateTimeFormat(
    state.language === 'en' ? 'en-US' : state.language === 'ar' ? 'ar-IQ' : 'ku-IQ',
    { day: 'numeric', month: 'short', year: 'numeric' }
  ).format(new Date(`${item.date}T12:00:00`)) : '';

  if (walletEls.walletDetailMeta) {
    walletEls.walletDetailMeta.textContent = `${item.amount} ${unit}${displayDate ? ' · ' + displayDate : ''}`;
  }

  // 1. نرخی کڕینی تاک
  const unitPurchase = Number(item.unitPrice || item.purchasePrice) || 0;
  if (walletEls.walletDetailBuyUnitLabel) walletEls.walletDetailBuyUnitLabel.textContent = text.buyUnitPrice || 'نرخی کڕینی تاک';
  if (walletEls.walletDetailBuyUnitVal) walletEls.walletDetailBuyUnitVal.textContent = `${formatWalletMoney(unitPurchase, item.purchaseCurrency)} / ${unit}`;

  // 2. نرخی کڕینی گشتی
  const itemTotalPaid = Number(item.totalPrice) || (unitPurchase * qty);
  if (walletEls.walletDetailBuyTotalLabel) walletEls.walletDetailBuyTotalLabel.textContent = text.buyTotalPrice || 'نرخی کڕینی گشتی';
  if (walletEls.walletDetailBuyTotalVal) walletEls.walletDetailBuyTotalVal.textContent = formatWalletMoney(itemTotalPaid, item.purchaseCurrency);

  // Live Unit & Current Value
  const liveUnit = getMetalLivePrice(item.key, targetCurr);
  const currentValue = (liveUnit != null && qty > 0) ? liveUnit * qty : null;

  // 3. نرخی ئێستای تاک
  if (walletEls.walletDetailLiveUnitLabel) walletEls.walletDetailLiveUnitLabel.textContent = text.liveUnitPrice || 'نرخی ئێستای تاک';
  if (walletEls.walletDetailLiveUnitVal) walletEls.walletDetailLiveUnitVal.textContent = liveUnit != null ? `${formatWalletMoney(liveUnit, targetCurr)} / ${unit}` : '—';

  // 4. نرخی گشتی ئێستا
  if (walletEls.walletDetailLiveTotalLabel) walletEls.walletDetailLiveTotalLabel.textContent = text.liveTotalPrice || 'نرخی گشتی ئێستا';
  if (walletEls.walletDetailLiveTotalVal) walletEls.walletDetailLiveTotalVal.textContent = currentValue != null ? formatWalletMoney(currentValue, targetCurr) : '—';

  // 5. قازانج
  let costInTarget = itemTotalPaid;
  if (item.purchaseCurrency !== targetCurr && usdIqd > 0) {
    if (item.purchaseCurrency === 'USD' && targetCurr === 'IQD') {
      costInTarget = itemTotalPaid * usdIqd;
    } else if (item.purchaseCurrency === 'IQD' && targetCurr === 'USD') {
      costInTarget = itemTotalPaid / usdIqd;
    }
  }

  const itemPnl = (currentValue != null && Number.isFinite(costInTarget)) ? currentValue - costInTarget : null;
  const itemPnlPct = (costInTarget > 0 && itemPnl != null) ? (itemPnl / costInTarget) * 100 : null;
  const pnlInfo = formatPnlValues(itemPnl, itemPnlPct, targetCurr);

  if (walletEls.walletDetailProfitLabel) walletEls.walletDetailProfitLabel.textContent = text.profit || 'قازانج';
  if (walletEls.walletDetailProfitVal) {
    walletEls.walletDetailProfitVal.className = `wallet-detail-profit-val is-${pnlInfo.status}`;
    walletEls.walletDetailProfitVal.innerHTML = `<span class="pnl-amount">${pnlInfo.amountStr}</span> <span class="pnl-percent">(${pnlInfo.percentStr})</span>`;
  }

  if (walletEls.walletDetailNotesCard) {
    if (item.notes && item.notes.trim()) {
      walletEls.walletDetailNotesCard.hidden = false;
      if (walletEls.walletDetailNotesLabel) walletEls.walletDetailNotesLabel.textContent = text.notes || 'تێبینی';
      if (walletEls.walletDetailNotesVal) walletEls.walletDetailNotesVal.textContent = item.notes;
    } else {
      walletEls.walletDetailNotesCard.hidden = true;
    }
  }

  if (walletEls.walletDetailBackdrop) walletEls.walletDetailBackdrop.hidden = false;
}

function hideWalletDetail() {
  selectedDetailItem = null;
  if (walletEls.walletDetailBackdrop) walletEls.walletDetailBackdrop.hidden = true;
}

function renderWallet() {
  const list = walletEls.walletAssetList;
  list.replaceChildren();
  const text = walletText();
  const targetCurr = walletState.currency;
  const usdIqd = getEffectiveUsdRate() / 100;

  let totalValue = 0;
  let totalCost = 0;
  let allKnown = true;

  walletState.items.forEach(item => {
    const qty = Number(item.amount);
    const liveUnit = getMetalLivePrice(item.key, targetCurr);
    const currentValue = (liveUnit != null && qty > 0) ? liveUnit * qty : null;

    const itemTotalPaid = Number(item.totalPrice) || (Number(item.purchasePrice || item.unitPrice) * qty);
    let costInTarget = itemTotalPaid;
    if (item.purchaseCurrency !== targetCurr && usdIqd > 0) {
      if (item.purchaseCurrency === 'USD' && targetCurr === 'IQD') {
        costInTarget = itemTotalPaid * usdIqd;
      } else if (item.purchaseCurrency === 'IQD' && targetCurr === 'USD') {
        costInTarget = itemTotalPaid / usdIqd;
      }
    }

    const itemPnl = (currentValue != null && Number.isFinite(costInTarget)) ? currentValue - costInTarget : null;
    const itemPnlPct = (costInTarget > 0 && itemPnl != null) ? (itemPnl / costInTarget) * 100 : null;

    if (currentValue != null && Number.isFinite(costInTarget)) {
      totalValue += currentValue;
      totalCost += costInTarget;
    } else {
      allKnown = false;
    }

    const unit = walletAssetUnit(item.key);
    const card = document.createElement('article');
    card.className = 'wallet-asset-card card-surface';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `${walletAssetName(item.key)} details`);

    // کلیک لەسەر کارتەکە پەنجەرەی وردەکاری دەکاتەوە
    card.addEventListener('click', event => {
      if (event.target.closest('.wallet-card-menu-btn') || event.target.closest('.wallet-card-menu-popover')) {
        return;
      }
      showWalletDetail(item);
    });

    const info = document.createElement('div');
    info.className = 'wallet-asset-info';

    const icon = document.createElement('span');
    icon.className = `wallet-asset-icon ${item.key.startsWith('silver') ? 'is-silver' : ''}`;
    icon.innerHTML = getAssetIconSvg(item.key);

    const details = document.createElement('div');
    details.className = 'wallet-asset-details';

    const name = document.createElement('strong');
    name.textContent = walletAssetName(item.key);

    const displayDate = item.date ? new Intl.DateTimeFormat(
      state.language === 'en' ? 'en-US' : state.language === 'ar' ? 'ar-IQ' : 'ku-IQ',
      { day: 'numeric', month: 'short', year: 'numeric' }
    ).format(new Date(`${item.date}T12:00:00`)) : '';

    const meta = document.createElement('small');
    meta.textContent = `${item.amount} ${unit}${displayDate ? ' · ' + displayDate : ''}`;

    details.append(name, meta);
    info.append(icon, details);

    const stats = document.createElement('div');
    stats.className = 'wallet-asset-stats';

    const pnlInfo = formatPnlValues(itemPnl, itemPnlPct, targetCurr);

    // تەنها ڕێژەی قازانج لەسەر کارتەکە دەنووسرێت
    const profitEl = document.createElement('span');
    profitEl.className = `wallet-card-profit-badge is-${pnlInfo.status}`;
    profitEl.textContent = pnlInfo.percentStr || '0.00%';

    // دوگمەی ٣ نوقتە (kebab menu) بۆ دەستکاری و سڕینەوە
    const menuWrap = document.createElement('div');
    menuWrap.className = 'wallet-card-menu-wrap';

    const menuBtn = document.createElement('button');
    menuBtn.type = 'button';
    menuBtn.className = 'wallet-card-menu-btn';
    menuBtn.setAttribute('aria-label', 'Options');
    menuBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <circle cx="12" cy="5" r="2"/>
        <circle cx="12" cy="12" r="2"/>
        <circle cx="12" cy="19" r="2"/>
      </svg>
    `;

    const popover = document.createElement('div');
    popover.className = 'wallet-card-menu-popover';
    popover.hidden = true;

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'wallet-card-menu-item';
    editBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 20h9"></path>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
      </svg>
      <span>${text.edit}</span>
    `;
    editBtn.addEventListener('click', event => {
      event.stopPropagation();
      closeAllCardMenus();
      openWalletForm(item);
    });

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'wallet-card-menu-item is-delete';
    removeBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
      <span>${text.delete}</span>
    `;
    removeBtn.addEventListener('click', event => {
      event.stopPropagation();
      closeAllCardMenus();
      showDeleteConfirmation(item.id, false);
    });

    popover.append(editBtn, removeBtn);
    menuWrap.append(menuBtn, popover);

    menuBtn.addEventListener('click', event => {
      event.stopPropagation();
      const willOpen = popover.hidden;
      closeAllCardMenus();
      if (willOpen) {
        popover.hidden = false;
      }
    });

    stats.append(profitEl, menuWrap);
    card.append(info, stats);
    list.append(card);

    if (selectedDetailItem && selectedDetailItem.id === item.id) {
      showWalletDetail(item);
    }
  });

  const hasAssets = walletState.items.length > 0;
  walletEls.walletEmptyState.hidden = hasAssets;
  walletEls.walletAssetList.hidden = !hasAssets;

  // Requirement 1: FAB is strictly hidden when hasAssets === 0, or in form view, or not in wallet view
  const isDashboardActive = !walletEls.walletView.hidden && walletEls.walletFormView.hidden;
  walletEls.walletFab.hidden = !isDashboardActive || !hasAssets;

  const totalDisplay = (allKnown && hasAssets) ? formatWalletMoney(totalValue, targetCurr) : (hasAssets ? '—' : formatWalletMoney(0, targetCurr));
  walletEls.walletTotal.textContent = totalDisplay;

  const netPnl = (allKnown && hasAssets) ? totalValue - totalCost : null;
  const netPnlPct = (allKnown && hasAssets && totalCost > 0) ? (netPnl / totalCost) * 100 : null;
  const netPnlInfo = formatPnlValues(netPnl, netPnlPct, targetCurr);

  walletEls.walletProfit.textContent = netPnlInfo.amountStr;
  walletEls.walletProfit.className = `wallet-summary-profit is-${netPnlInfo.status}`;

  walletEls.walletProfitPercent.textContent = netPnlInfo.percentStr || '—';
  walletEls.walletProfitPercent.className = `wallet-profit-badge is-${netPnlInfo.status}`;

  walletCurrencyButtons.forEach(button => button.classList.toggle('active', button.dataset.walletCurrency === walletState.currency));
}

function persistWallet() {
  try {
    localStorage.setItem('exchangeWallet', JSON.stringify(walletState.items));
  } catch (error) {
    console.warn('Unable to save wallet entries.', error);
  }
}

function openWalletForm(item = null) {
  hideWalletDetail();
  closeAllCardMenus();
  walletState.editingId = item?.id || null;
  walletState.selectedKey = item?.key || (walletAssets[0]?.key || 'gold21k');
  walletState.formCurrency = item?.purchaseCurrency || walletState.currency;
  walletState.lastEditedPriceField = 'unit';

  walletEls.walletDashboard.hidden = true;
  walletEls.walletFormView.hidden = false;
  walletEls.walletFab.hidden = true; // Always hide FAB while form is open

  walletEls.walletFormTitle.textContent = item ? walletText().edit : walletText().addTitle;
  walletEls.walletAmountInput.value = item?.amount ?? '';

  const unitVal = item?.unitPrice ?? item?.purchasePrice;
  const totalVal = item?.totalPrice ?? (unitVal && item?.amount ? unitVal * item.amount : '');

  walletEls.walletUnitPriceInput.value = (unitVal != null && unitVal !== '')
    ? formatInputNumber(Number(unitVal), walletState.formCurrency)
    : '';
  walletEls.walletTotalPriceInput.value = (totalVal != null && totalVal !== '')
    ? formatInputNumber(Number(totalVal), walletState.formCurrency)
    : '';

  walletEls.walletDateInput.value = item?.date || new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  walletEls.walletNotesInput.value = item?.notes || '';
  walletEls.walletSelectedAsset.textContent = walletAssetName(walletState.selectedKey);
  if (walletEls.walletFormDeleteBtn) {
    walletEls.walletFormDeleteBtn.hidden = !item;
    walletEls.walletFormDeleteBtn.textContent = walletText().deleteAsset || walletText().delete;
  }

  updateFormLivePriceBanner();
  renderWallet();
}

function closeWalletForm() {
  walletEls.walletFormView.hidden = true;
  walletEls.walletDashboard.hidden = false;
  walletState.editingId = null;
  if (walletEls.walletFormDeleteBtn) walletEls.walletFormDeleteBtn.hidden = true;
  renderWallet();
}

function renderWalletPicker() {
  const currentAsset = walletAssets.find(a => a.key === walletState.selectedKey);
  const category = walletState.pickerCategory || currentAsset?.category || 'gold';
  walletState.pickerCategory = category;

  document.querySelectorAll('[data-picker-category]').forEach(button => {
    button.classList.toggle('active', button.dataset.pickerCategory === category);
  });

  walletEls.walletPickerOptions.replaceChildren();

  walletAssets.filter(item => item.category === category).forEach(item => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'wallet-option';
    button.textContent = walletAssetName(item.key);
    button.addEventListener('click', () => {
      walletState.selectedKey = item.key;
      walletEls.walletSelectedAsset.textContent = walletAssetName(item.key);
      walletEls.walletPickerBackdrop.hidden = true;
      updateFormLivePriceBanner();
      syncPriceCalculations(walletState.lastEditedPriceField);
    });
    walletEls.walletPickerOptions.append(button);
  });
}

function activateMainView(view) {
  if (!view) return;

  // Clear transition timers & hero morph states
  clearCalculatorTransitionTimer();
  if (heroMorph.animTimer !== null) {
    clearTimeout(heroMorph.animTimer);
    heroMorph.animTimer = null;
  }
  heroMorph.isAnimating = false;
  heroMorph.sourceRect = null;

  if (heroMorphOverlay) {
    heroMorphOverlay.style.cssText = '';
    heroMorphOverlay.className = '';
    heroMorphOverlay.style.opacity = '0';
    heroMorphOverlay.style.pointerEvents = 'none';
  }

  if (currencyRateList) {
    currencyRateList.classList.remove('hero-fading-out');
    currencyRateList.querySelectorAll('.currency-rate-card.hero-source').forEach(c => c.classList.remove('hero-source'));
  }

  calculatorView.classList.remove(
    'hero-active',
    'hero-content-hidden',
    'hero-content-visible',
    'is-entering',
    'is-exiting'
  );

  state.currentView = view;
  setBottomNavActive(view);

  // Toggle body & document classes
  document.body.classList.toggle('wallet-open', view === 'wallet');
  document.documentElement.classList.toggle('wallet-open', view === 'wallet');
  document.body.classList.toggle('metals-open', view === 'metals');

  // Toggle views visibility
  if (walletEls && walletEls.walletView) walletEls.walletView.hidden = view !== 'wallet';
  currencyRatesView.hidden = view !== 'rates';
  metalsView.hidden = view !== 'metals';
  metalInvestmentView.hidden = true;
  calculatorView.hidden = view !== 'calculator';
  metalState.isOpen = (view === 'metals');

  if (view === 'wallet') {
    if (walletEls && walletEls.walletDashboard) walletEls.walletDashboard.hidden = false;
    if (walletEls && walletEls.walletFormView) walletEls.walletFormView.hidden = true;
    renderWallet();
  } else if (view === 'rates') {
    renderCurrencyRateList();
  } else if (view === 'metals') {
    metalState.investmentItemKey = null;
    renderMetalLabels();
    renderMetalPrices();
    fetchLiveMetals();
  } else if (view === 'calculator') {
    if (!state.selectedCurrency || !Object.prototype.hasOwnProperty.call(CURRENCY_SYMBOLS, state.selectedCurrency)) {
      state.selectedCurrency = 'USD';
    }
    state.secondaryCurrency = state.selectedCurrency === 'USD' ? 'IQD' : state.currencyRateBase;
    currSelectBtns.forEach(button => button.classList.toggle('active', button.dataset.curr === state.selectedCurrency));
    renderConverterLabels();
    renderRateBanner();
    calculateAndRender();
    adjustRateBannerFontSize();
    requestAnimationFrame(() => {
      adjustAmountFontSize(topAmountEl);
      adjustAmountFontSize(bottomAmountEl);
      adjustRateBannerFontSize();
    });
  }
}

bottomNavItems.forEach(button => button.addEventListener('click', () => activateMainView(button.dataset.view)));
walletEls.walletEmptyAdd.addEventListener('click', () => openWalletForm());
walletEls.walletFab.addEventListener('click', () => openWalletForm());
walletEls.walletFormBack.addEventListener('click', closeWalletForm);
if (walletEls.walletFormDeleteBtn) {
  walletEls.walletFormDeleteBtn.addEventListener('click', () => {
    if (walletState.editingId) {
      showDeleteConfirmation(walletState.editingId, true);
    }
  });
}

if (walletEls.walletConfirmCancelBtn) {
  walletEls.walletConfirmCancelBtn.addEventListener('click', hideDeleteConfirmation);
}

if (walletEls.walletConfirmBackdrop) {
  walletEls.walletConfirmBackdrop.addEventListener('click', event => {
    if (event.target === walletEls.walletConfirmBackdrop) hideDeleteConfirmation();
  });
}

if (walletEls.walletConfirmDeleteBtn) {
  walletEls.walletConfirmDeleteBtn.addEventListener('click', () => {
    if (pendingDeleteId) {
      if (selectedDetailItem && selectedDetailItem.id === pendingDeleteId) {
        hideWalletDetail();
      }
      walletState.items = walletState.items.filter(entry => entry.id !== pendingDeleteId);
      persistWallet();
      const shouldCloseForm = pendingDeleteFromForm;
      hideDeleteConfirmation();
      if (shouldCloseForm) {
        closeWalletForm();
      } else {
        renderWallet();
      }
    }
  });
}

if (walletEls.walletDetailCloseBtn) {
  walletEls.walletDetailCloseBtn.addEventListener('click', hideWalletDetail);
}
if (walletEls.walletDetailBackdrop) {
  walletEls.walletDetailBackdrop.addEventListener('click', event => {
    if (event.target === walletEls.walletDetailBackdrop) hideWalletDetail();
  });
}
if (walletEls.walletDetailEditBtn) {
  walletEls.walletDetailEditBtn.addEventListener('click', () => {
    if (selectedDetailItem) {
      const it = selectedDetailItem;
      hideWalletDetail();
      openWalletForm(it);
    }
  });
}

document.addEventListener('click', event => {
  if (!event.target.closest('.wallet-card-menu-wrap')) {
    closeAllCardMenus();
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeAllCardMenus();
    hideWalletDetail();
    hideDeleteConfirmation();
    if (walletEls.walletPickerBackdrop) walletEls.walletPickerBackdrop.hidden = true;
  }
});

walletEls.walletAssetPicker.addEventListener('click', () => {
  const currentAsset = walletAssets.find(a => a.key === walletState.selectedKey);
  walletState.pickerCategory = currentAsset?.category || 'gold';
  renderWalletPicker();
  walletEls.walletPickerBackdrop.hidden = false;
});

walletEls.walletPickerClose.addEventListener('click', () => {
  walletEls.walletPickerBackdrop.hidden = true;
});

walletEls.walletPickerBackdrop.addEventListener('click', event => {
  if (event.target === walletEls.walletPickerBackdrop) walletEls.walletPickerBackdrop.hidden = true;
});

document.querySelectorAll('[data-picker-category]').forEach(button => {
  button.addEventListener('click', () => {
    walletState.pickerCategory = button.dataset.pickerCategory;
    renderWalletPicker();
  });
});

walletCurrencyButtons.forEach(button => {
  button.addEventListener('click', () => {
    walletState.currency = button.dataset.walletCurrency;
    localStorage.setItem('walletCurrency', walletState.currency);
    renderWallet();
  });
});

// Form Currency Toggle: IQD / USD
document.querySelectorAll('[data-form-currency]').forEach(button => {
  button.addEventListener('click', () => {
    setFormCurrency(button.dataset.formCurrency);
  });
});

// Two-way synchronized inputs
walletEls.walletAmountInput.addEventListener('input', () => syncPriceCalculations('amount'));
walletEls.walletUnitPriceInput.addEventListener('input', () => syncPriceCalculations('unit'));
walletEls.walletTotalPriceInput.addEventListener('input', () => syncPriceCalculations('total'));

walletEls.walletSaveButton.addEventListener('click', () => {
  const amount = Number(walletEls.walletAmountInput.value);
  let unitPrice = Number(walletEls.walletUnitPriceInput.value);
  let totalPrice = Number(walletEls.walletTotalPriceInput.value);

  if (!walletState.selectedKey) {
    walletEls.walletAssetPicker.focus();
    return;
  }

  if (!(amount > 0)) {
    walletEls.walletAmountInput.setCustomValidity('Enter an amount greater than zero.');
    walletEls.walletAmountInput.reportValidity();
    walletEls.walletAmountInput.addEventListener('input', () => walletEls.walletAmountInput.setCustomValidity(''), { once: true });
    return;
  }

  if (walletEls.walletUnitPriceInput.value === '' && walletEls.walletTotalPriceInput.value === '') {
    walletEls.walletUnitPriceInput.setCustomValidity('Enter purchase price.');
    walletEls.walletUnitPriceInput.reportValidity();
    walletEls.walletUnitPriceInput.addEventListener('input', () => walletEls.walletUnitPriceInput.setCustomValidity(''), { once: true });
    return;
  }

  if (!(unitPrice > 0) && totalPrice > 0 && amount > 0) {
    unitPrice = totalPrice / amount;
  } else if (!(totalPrice > 0) && unitPrice > 0 && amount > 0) {
    totalPrice = unitPrice * amount;
  }

  if (!walletEls.walletDateInput.value) {
    walletEls.walletDateInput.setCustomValidity('Choose purchase date.');
    walletEls.walletDateInput.reportValidity();
    walletEls.walletDateInput.addEventListener('input', () => walletEls.walletDateInput.setCustomValidity(''), { once: true });
    return;
  }

  const entry = {
    id: walletState.editingId || crypto.randomUUID(),
    key: walletState.selectedKey,
    type: 'metal',
    amount,
    unitPrice,
    totalPrice,
    purchasePrice: unitPrice,
    purchaseCurrency: walletState.formCurrency,
    date: walletEls.walletDateInput.value,
    notes: walletEls.walletNotesInput.value.trim()
  };

  const index = walletState.items.findIndex(item => item.id === entry.id);
  if (index >= 0) walletState.items[index] = entry;
  else walletState.items.unshift(entry);

  persistWallet();
  closeWalletForm();
});

window.addEventListener('storage', event => {
  if (event.key === 'exchangeWallet') {
    try {
      walletState.items = JSON.parse(event.newValue || '[]');
      renderWallet();
    } catch {}
  }
});

window.addEventListener('wallet-rates-updated', () => {
  renderWallet();
  updateFormLivePriceBanner();
});

window.walletInitialized = true;
renderWalletLabels();
