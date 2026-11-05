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

const state = {
  // هەمیشە لە کاتی کردنەوەی وێبسایتەکەدا ڕاستەوخۆ دۆلار هەڵبژێردراوە
  selectedCurrency: 'USD',
  baseRatePer100USD: savedBaseRate,
  otherRates: {
    GBP: Number(localStorage.getItem('rudawRate_GBP')) || 225000,   // نرخی ١٠٠ پاوەند بە دینار
    EUR: Number(localStorage.getItem('rudawRate_EUR')) || 185000,   // نرخی ١٠٠ یۆرۆ بە دینار
    TRY: Number(localStorage.getItem('rudawRate_TRY')) || 33682,    // نرخی ١٠٠٠ لیرە بە دینار
    IRR: Number.isFinite(savedRudawTomanBuy) && savedRudawTomanBuy > 0 ? savedRudawTomanBuy : 26450000
  },
  rudawTomanBuy: Number.isFinite(savedRudawTomanBuy) && savedRudawTomanBuy > 0 ? savedRudawTomanBuy : 26450000,
  rudawUsdQuotes: {
    GBP: Number(localStorage.getItem('rudawQuote_GBP')) || 0,
    EUR: Number(localStorage.getItem('rudawQuote_EUR')) || 0
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
  calculateAndRender();
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
    liveRateBannerEl.textContent = '...';
    adjustRateBannerFontSize();
    return;
  }

  const rateInSelectedCurrency = (rateInIqd) =>
    state.secondaryCurrency === 'USD'
      ? formatNumber(((rateInIqd * 100) / usdRatePer100).toFixed(2), 2)
      : formatRoundedInteger(rateInIqd);
  const selectedUnit = state.secondaryCurrency === 'USD' ? text.usd : text.iqd;

  // بەکارهێنانی کۆدی پاراستنی ئاراستە (\u2066 و \u2069) بۆ ئەوەی نووسینی کوردی و ژمارەکان تێکەڵ نەبن
  if (curr === 'USD') {
    const effectiveUsd = getEffectiveUsdRate();
    liveRateBannerEl.textContent = `\u2066100$\u2069 = \u2066${formatRoundedInteger(effectiveUsd)} ${text.iqd}\u2069`;
  } else if (curr === 'GBP') {
    liveRateBannerEl.textContent = `\u2066100£\u2069 = \u2066${rateInSelectedCurrency(state.otherRates.GBP)} ${selectedUnit}\u2069`;
  } else if (curr === 'EUR') {
    liveRateBannerEl.textContent = `\u2066100€\u2069 = \u2066${rateInSelectedCurrency(state.otherRates.EUR)} ${selectedUnit}\u2069`;
  } else if (curr === 'TRY') {
    liveRateBannerEl.textContent = `\u20661000 ${text.lira}\u2069 = \u2066${rateInSelectedCurrency(state.otherRates.TRY)} ${selectedUnit}\u2069`;
  } else if (curr === 'IRR') {
    liveRateBannerEl.textContent = state.otherRates.IRR > 0
      ? state.secondaryCurrency === 'USD'
        ? `\u2066100$\u2069 = \u2066${formatRoundedInteger((state.otherRates.IRR * usdRatePer100) / 100000)} ${text.toman}\u2069`
        : `\u2066100,000 ${text.iqd}\u2069 = \u2066${formatRoundedInteger(state.otherRates.IRR)} ${text.toman}\u2069`
      : text.unavailable;
  }

  adjustRateBannerFontSize();

  if (animate) {
    liveRateBannerEl.classList.add('pulse');
    setTimeout(() => liveRateBannerEl.classList.remove('pulse'), 300);
  }
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
  topAmountEl.textContent = formattedTop;
  adjustAmountFontSize(topAmountEl);
  topAmountEl.scrollLeft = topAmountEl.scrollWidth;

  const inputValue = parseFloat(state.rawInput);
  if (isNaN(inputValue) || inputValue === 0) {
    bottomAmountEl.textContent = '0';
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

  bottomAmountEl.textContent = bottomText;
  adjustAmountFontSize(bottomAmountEl);
  bottomAmountEl.scrollLeft = bottomAmountEl.scrollWidth;
}

function updateTelegramRate(newBaseRate, timestampMs) {
  const isChanged = state.baseRatePer100USD !== newBaseRate || state.telegramTimestamp !== timestampMs;
  state.baseRatePer100USD = newBaseRate;
  state.telegramTimestamp = timestampMs;
  localStorage.setItem('telegramRate_USD', String(newBaseRate));
  localStorage.setItem('telegramRateTime', String(timestampMs));
  recalculateRudawUsdQuotes();
  renderRateBanner(isChanged);
  renderDateOrDay();
  calculateAndRender();
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

// دوگمەی Refresh لە تەنیشت Hamburger
refreshBtn.addEventListener('click', async () => {
  refreshBtn.classList.add('spinning');
  await fetchExchangeRates();
  renderRateBanner(true);
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

function recalculateRudawUsdQuotes() {
  if (state.baseRatePer100USD <= 0) return;

  ['GBP', 'EUR'].forEach((currency) => {
    const usdQuote = state.rudawUsdQuotes[currency];
    if (usdQuote > 0) {
      state.otherRates[currency] = Math.round((usdQuote * state.baseRatePer100USD) / 100);
      localStorage.setItem(`rudawRate_${currency}`, String(state.otherRates[currency]));
    }
  });
}

function applyRudawRates(data) {
  const rates = {
    GBP: Number(data?.gbpUsdPer100),
    EUR: Number(data?.eurUsdPer100),
    TRY: Number(data?.tryPer100),
    IRR: Number(data?.tomanPer100000Iqd)
  };
  if (Object.values(rates).some(rate => !Number.isFinite(rate) || rate <= 0)) {
    throw new Error('Rates snapshot is missing a valid Rudaw Buy rate');
  }

  state.rudawUsdQuotes.GBP = rates.GBP;
  state.rudawUsdQuotes.EUR = rates.EUR;
  state.otherRates.TRY = Math.round(rates.TRY * 10);
  state.otherRates.IRR = Math.round(rates.IRR);
  state.rudawTomanBuy = rates.IRR;

  localStorage.setItem('rudawQuote_GBP', String(rates.GBP));
  localStorage.setItem('rudawQuote_EUR', String(rates.EUR));
  localStorage.setItem('rudawRate_TRY', String(state.otherRates.TRY));
  localStorage.setItem('rudawRate_IRR', String(state.otherRates.IRR));
  localStorage.setItem('rudawTomanBuy', String(rates.IRR));
  recalculateRudawUsdQuotes();
  renderRateBanner();
  calculateAndRender();
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
    applyRudawRates(data.rudaw);
  } catch (error) {
    console.warn('Unable to load the latest Telegram and Rudaw exchange rates.', error);
  } finally {
    isFetchingExchangeRates = false;
  }
}

// دەستپێکردنی سەرەتایی بەرنامەکە
applyLanguage(state.language);
renderRateBanner();
renderDateOrDay();
calculateAndRender();
window.addEventListener('resize', calculateAndRender);
window.addEventListener('resize', adjustRateBannerFontSize);
document.fonts.ready.then(calculateAndRender);
fetchExchangeRates();

setInterval(fetchExchangeRates, 60000);

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) fetchExchangeRates();
});
