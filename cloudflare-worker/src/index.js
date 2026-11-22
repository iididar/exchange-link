/**
 * Cloudflare Worker: Unified Live Exchange Rates Aggregator
 * Project: Exchange Link
 *
 * Aggregates USD/IQD, Iranian Toman, Precious Metals (Gold/Silver), and Forex (EUR/GBP/TRY)
 * into a single high-speed JSON response with Cloudflare Edge Caching (15s) and CORS headers.
 */

const GITHUB_RATES_URL = "https://raw.githubusercontent.com/iididar/exchange-link/main/rates.json";
const RUDAW_API_URL = "https://rudawindex.net/api/prices";

const SWISSQUOTE_URLS = {
  gold: "https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAU/USD",
  silver: "https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAG/USD",
  gbp: "https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/GBP/USD",
  eur: "https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/EUR/USD",
  usdtry: "https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/USD/TRY"
};

const GOLD_API_URLS = {
  gold: "https://api.gold-api.com/price/XAU",
  silver: "https://api.gold-api.com/price/XAG"
};

const GOLDPRICE_ORG_URL = "https://data-asg.goldprice.org/dbXRates/USD";

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400"
};

/**
 * Fetch JSON with strict AbortController timeout
 */
async function fetchWithTimeout(url, headers = {}, timeoutMs = 2500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, ...headers },
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`HTTP ${response.status} from ${url}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Extract quote from Swissquote BBO response
 */
function extractSwissquotePrice(data) {
  try {
    const quote = data?.[0]?.spreadProfilePrices?.[0];
    const ask = parseFloat(quote?.ask);
    const bid = parseFloat(quote?.bid);
    if (Number.isFinite(bid) && Number.isFinite(ask) && bid > 0 && ask > 0) {
      return (bid + ask) / 2;
    }
    if (Number.isFinite(ask) && ask > 0) return ask;
    if (Number.isFinite(bid) && bid > 0) return bid;
  } catch (_) {}
  return null;
}

/**
 * Parse Rudaw Index currency list
 */
function parseRudawCurrencies(data) {
  const result = {
    tomanPer100000Iqd: null,
    gbpUsdPer100: null,
    eurUsdPer100: null,
    tryPer100: null
  };
  try {
    const list = data?.currencies;
    if (!Array.isArray(list)) return result;

    const map = {};
    for (const item of list) {
      const code = String(item?.code || item?.id || "").toLowerCase();
      const buy = parseFloat(String(item?.buy || "").replace(/,/g, ""));
      if (Number.isFinite(buy) && buy > 0) map[code] = buy;
    }

    result.tomanPer100000Iqd = map.ir || map.irr || map.irt || null;
    result.gbpUsdPer100 = map.gb || map.gbp || null;
    result.eurUsdPer100 = map.eu || map.eur || null;
    result.tryPer100 = map.tr || map.try || null;
  } catch (_) {}
  return result;
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const isBypassCache = url.searchParams.has("nocache") || url.searchParams.has("refresh");

    // 1. Cloudflare Edge Cache lookup (15-second edge cache)
    const cache = caches.default;
    const cacheKey = new Request(url.origin + url.pathname, request);

    if (!isBypassCache) {
      const cachedResponse = await cache.match(cacheKey);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    // 2. Fetch all sources in parallel
    const [
      githubResult,
      rudawResult,
      swissGoldResult,
      swissSilverResult,
      swissGbpResult,
      swissEurResult,
      swissTryResult
    ] = await Promise.allSettled([
      fetchWithTimeout(`${GITHUB_RATES_URL}?_=${Date.now()}`),
      fetchWithTimeout(RUDAW_API_URL, {
        Accept: "application/json",
        Origin: "https://rudawindex.net",
        Referer: "https://rudawindex.net/"
      }),
      fetchWithTimeout(SWISSQUOTE_URLS.gold),
      fetchWithTimeout(SWISSQUOTE_URLS.silver),
      fetchWithTimeout(SWISSQUOTE_URLS.gbp),
      fetchWithTimeout(SWISSQUOTE_URLS.eur),
      fetchWithTimeout(SWISSQUOTE_URLS.usdtry)
    ]);

    // Parse GitHub rates.json
    const githubData = githubResult.status === "fulfilled" ? githubResult.value : null;
    const fallbackTelegram = githubData?.telegram || {};
    const fallbackRudaw = githubData?.rudaw || {};

    // Parse Rudaw API
    const liveRudaw = rudawResult.status === "fulfilled" ? parseRudawCurrencies(rudawResult.value) : {};

    // USD Rate
    const iqdPer100Usd = fallbackTelegram?.iqdPer100Usd || 170000;
    const telegramTimestamp = fallbackTelegram?.latestPostAt || new Date().toISOString();

    // Toman Rate
    const tomanRate = liveRudaw.tomanPer100000Iqd || fallbackRudaw?.tomanPer100000Iqd || 26450000;

    // Forex Quotes
    let gbpQuote = swissGbpResult.status === "fulfilled" ? extractSwissquotePrice(swissGbpResult.value) : null;
    if (!gbpQuote && liveRudaw.gbpUsdPer100) gbpQuote = liveRudaw.gbpUsdPer100 / 100;
    if (!gbpQuote && fallbackRudaw?.gbpUsdPer100) gbpQuote = fallbackRudaw.gbpUsdPer100 / 100;
    if (!gbpQuote) gbpQuote = 1.295;

    let eurQuote = swissEurResult.status === "fulfilled" ? extractSwissquotePrice(swissEurResult.value) : null;
    if (!eurQuote && liveRudaw.eurUsdPer100) eurQuote = liveRudaw.eurUsdPer100 / 100;
    if (!eurQuote && fallbackRudaw?.eurUsdPer100) eurQuote = fallbackRudaw.eurUsdPer100 / 100;
    if (!eurQuote) eurQuote = 1.09;

    let tryQuote = swissTryResult.status === "fulfilled" ? extractSwissquotePrice(swissTryResult.value) : null;
    if (!tryQuote && liveRudaw.tryPer100) tryQuote = liveRudaw.tryPer100 / 100;
    if (!tryQuote && fallbackRudaw?.tryPer100) tryQuote = fallbackRudaw.tryPer100 / 100;
    if (!tryQuote) tryQuote = 34.5;

    // Precious Metals (Gold & Silver)
    let goldPrice = swissGoldResult.status === "fulfilled" ? extractSwissquotePrice(swissGoldResult.value) : null;
    let silverPrice = swissSilverResult.status === "fulfilled" ? extractSwissquotePrice(swissSilverResult.value) : null;

    // Fallback 1: Gold-API
    if (!goldPrice || !silverPrice) {
      const [goldApiResult, silverApiResult] = await Promise.allSettled([
        goldPrice ? Promise.resolve(goldPrice) : fetchWithTimeout(GOLD_API_URLS.gold),
        silverPrice ? Promise.resolve(silverPrice) : fetchWithTimeout(GOLD_API_URLS.silver)
      ]);
      if (!goldPrice && goldApiResult.status === "fulfilled") {
        goldPrice = parseFloat(goldApiResult.value?.price) || null;
      }
      if (!silverPrice && silverApiResult.status === "fulfilled") {
        silverPrice = parseFloat(silverApiResult.value?.price) || null;
      }
    }

    // Fallback 2: GoldPrice.org
    if (!goldPrice || !silverPrice) {
      try {
        const gpData = await fetchWithTimeout(GOLDPRICE_ORG_URL);
        const item = gpData?.items?.[0];
        if (!goldPrice) goldPrice = parseFloat(item?.xauPrice) || null;
        if (!silverPrice) silverPrice = parseFloat(item?.xagPrice) || null;
      } catch (_) {}
    }

    // Baseline fallback if all external feeds are unreachable
    if (!goldPrice) goldPrice = 2715.0;
    if (!silverPrice) silverPrice = 31.8;

    // Calculated IQD rates
    const usdFactor = iqdPer100Usd / 100;
    const gbpIqdPer100 = Math.round(gbpQuote * iqdPer100Usd);
    const eurIqdPer100 = Math.round(eurQuote * iqdPer100Usd);
    const tryIqdPer1000 = Math.round((1000 / tryQuote) * usdFactor);

    // Build unified JSON response
    const payload = {
      success: true,
      timestamp: Date.now(),
      updatedAt: new Date().toISOString(),
      rates: {
        usd: {
          iqdPer100Usd: Math.round(iqdPer100Usd),
          latestPostAt: telegramTimestamp
        },
        toman: {
          tomanPer100000Iqd: Math.round(tomanRate)
        },
        fx: {
          GBP: Number(gbpQuote.toFixed(4)),
          EUR: Number(eurQuote.toFixed(4)),
          USDTRY: Number(tryQuote.toFixed(4))
        },
        metals: {
          goldOunce: Number(goldPrice.toFixed(2)),
          silverOunce: Number(silverPrice.toFixed(2))
        }
      },
      calculated: {
        gbpIqdPer100,
        eurIqdPer100,
        tryIqdPer1000
      },
      // 100% backward-compatible fields matching rates.json structure
      telegram: {
        iqdPer100Usd: Math.round(iqdPer100Usd),
        latestPostAt: telegramTimestamp,
        usdRatePostAt: telegramTimestamp
      },
      rudaw: {
        gbpUsdPer100: Number((gbpQuote * 100).toFixed(2)),
        eurUsdPer100: Number((eurQuote * 100).toFixed(2)),
        tryPer100: Number((tryQuote * 100).toFixed(2)),
        tomanPer100000Iqd: Math.round(tomanRate)
      }
    };

    const response = new Response(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=15, s-maxage=15, stale-while-revalidate=10"
      }
    });

    // Store in Cloudflare Edge Cache for 15 seconds
    if (!isBypassCache) {
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
    }

    return response;
  }
};
