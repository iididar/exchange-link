import html
import json
import re
import urllib.request
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path


TELEGRAM_URL = "https://t.me/s/PMCgroup"
RUDAW_API_URL = "https://rudawindex.net/api/prices"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
)
RATE_PATTERN = re.compile(r"(?<![\d.])100\s*\$\s*[=:：]\s*([\d,]+(?:\.\d+)?)", re.IGNORECASE)
DIGIT_TRANSLATION = str.maketrans(
    "۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩",
    "01234567890123456789",
)


def fetch(url, headers=None):
    request_headers = {"User-Agent": USER_AGENT}
    if headers:
        request_headers.update(headers)
    request = urllib.request.Request(url, headers=request_headers)
    with urllib.request.urlopen(request, timeout=25) as response:
        return response.read()


class TelegramPostParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.posts = []
        self.current = None
        self.widget_depth = 0
        self.text_stack = []
        self.message_text = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        classes = set(attributes.get("class", "").split())

        if tag == "div" and self.current is None and "tgme_widget_message" in classes:
            self.current = {
                "post": attributes.get("data-post", ""),
                "timestamp": None,
                "text": "",
            }
            self.widget_depth = 1
            return

        if self.current is None:
            return

        if tag == "time" and attributes.get("datetime"):
            self.current["timestamp"] = attributes["datetime"]

        if tag == "div":
            self.widget_depth += 1

        if tag == "div" and "tgme_widget_message_text" in classes and not self.text_stack:
            self.text_stack = ["div"]
            self.message_text = []
        elif self.text_stack and tag not in {
            "area", "base", "br", "col", "embed", "hr", "img", "input",
            "link", "meta", "param", "source", "track", "wbr",
        }:
            self.text_stack.append(tag)

        if tag == "br" and self.text_stack:
            self.message_text.append("\n")

    def handle_endtag(self, tag):
        if self.current is None:
            return

        if self.text_stack and tag in self.text_stack:
            index = len(self.text_stack) - 1 - self.text_stack[::-1].index(tag)
            del self.text_stack[index:]
            if not self.text_stack:
                self.current["text"] = "".join(self.message_text).strip()

        if tag == "div":
            self.widget_depth -= 1
            if self.widget_depth == 0:
                self.posts.append(self.current)
                self.current = None

    def handle_data(self, data):
        if self.text_stack:
            self.message_text.append(data)


def parse_timestamp(value):
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    if parsed.tzinfo is None:
        return None
    return parsed


def normalize_number(value):
    normalized = html.unescape(value).translate(DIGIT_TRANSLATION).replace(",", "").strip()
    number = float(normalized)
    if not number > 0:
        raise ValueError("Rate must be positive")
    return round(number)


def read_existing_snapshot(path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


def read_telegram_rates(previous):
    parser = TelegramPostParser()
    parser.feed(fetch(TELEGRAM_URL).decode("utf-8", errors="replace"))
    posts = []
    rate_posts = []

    for post in parser.posts:
        timestamp = parse_timestamp(post["timestamp"])
        if timestamp is None:
            continue
        post["parsed_timestamp"] = timestamp
        posts.append(post)
        match = RATE_PATTERN.search(post["text"].translate(DIGIT_TRANSLATION))
        if match:
            rate_posts.append((timestamp, normalize_number(match.group(1))))

    if not posts:
        raise ValueError("Telegram page contained no posts with timestamps")

    latest_post = max(posts, key=lambda post: post["parsed_timestamp"])["parsed_timestamp"]
    old_telegram = previous.get("telegram", {})
    usd_rate = old_telegram.get("iqdPer100Usd")
    usd_rate_post_at = parse_timestamp(old_telegram.get("usdRatePostAt"))

    if rate_posts:
        latest_rate_at, latest_rate = max(rate_posts, key=lambda item: item[0])
        if usd_rate_post_at is None or latest_rate_at >= usd_rate_post_at:
            usd_rate = latest_rate
            usd_rate_post_at = latest_rate_at

    if not isinstance(usd_rate, (int, float)) or usd_rate <= 0 or usd_rate_post_at is None:
        raise ValueError("Telegram page contained no usable 100 USD rate")

    return {
        "iqdPer100Usd": round(usd_rate),
        "latestPostAt": latest_post.isoformat().replace("+00:00", "Z"),
        "usdRatePostAt": usd_rate_post_at.isoformat().replace("+00:00", "Z"),
    }


def read_rudaw_rates():
    response = fetch(
        RUDAW_API_URL,
        {
            "Accept": "application/json",
            "Origin": "https://rudawindex.net",
            "Referer": "https://rudawindex.net/",
        },
    )
    data = json.loads(response)
    currencies = data.get("currencies")
    if not isinstance(currencies, list):
        raise ValueError("Rudaw response did not contain currency data")

    rates_by_code = {
        str(item.get("code") or item.get("id") or "").lower(): item.get("buy")
        for item in currencies
        if isinstance(item, dict)
    }

    def get_buy(*codes):
        for code in codes:
            value = rates_by_code.get(code)
            try:
                rate = float(str(value).replace(",", ""))
            except (TypeError, ValueError):
                continue
            if rate > 0:
                return rate
        raise ValueError(f"Rudaw response is missing a Buy rate for {codes[0]}")

    return {
        "gbpUsdPer100": get_buy("gb", "gbp"),
        "eurUsdPer100": get_buy("eu", "eur"),
        "tryPer100": get_buy("tr", "try"),
        "tomanPer100000Iqd": get_buy("ir", "irr", "irt"),
    }


def main():
    output_path = Path(__file__).with_name("rates.json")
    previous = read_existing_snapshot(output_path)
    snapshot = {
        "telegram": read_telegram_rates(previous),
        "rudaw": read_rudaw_rates(),
    }
    new_content = json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n"

    if output_path.exists() and output_path.read_text(encoding="utf-8") == new_content:
        print("Rate snapshot is unchanged.")
        return

    output_path.write_text(new_content, encoding="utf-8")
    print("Updated rate snapshot from Telegram and Rudaw.")


if __name__ == "__main__":
    main()
