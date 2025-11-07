from __future__ import annotations

import re
from typing import Tuple
import requests
from bs4 import BeautifulSoup


HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}


def _clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    return text


def scrape_wikipedia(url: str) -> Tuple[str, str, str]:
    """
    Scrape Wikipedia article and return title, cleaned text, and raw HTML.
    Returns: (title, cleaned_text, raw_html)
    """
    resp = requests.get(url, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    raw_html = resp.text

    soup = BeautifulSoup(raw_html, "html.parser")

    # Title
    raw_title = soup.find("h1", id="firstHeading")
    title = raw_title.get_text(strip=True) if raw_title else (soup.title.get_text(strip=True) if soup.title else "")

    # Main content
    content_root = soup.select_one("#mw-content-text") or soup.select_one(".mw-parser-output")
    if not content_root:
        # Fallback: use body text
        content_root = soup.body

    # Remove non-article elements
    for tag in content_root.select("sup, table, style, script, .reference, .navbox, .infobox"):
        tag.decompose()

    paragraphs = [p.get_text(" ", strip=True) for p in content_root.find_all(["p", "li"]) if p.get_text(strip=True)]
    text = _clean_text("\n".join(paragraphs))

    return title, text, raw_html


def preview_wikipedia_title(url: str) -> str:
    """
    Quickly fetch just the title of a Wikipedia article for preview.
    Returns the article title or empty string if not found.
    """
    try:
        resp = requests.get(url, headers=HEADERS, timeout=10)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        raw_title = soup.find("h1", id="firstHeading")
        title = raw_title.get_text(strip=True) if raw_title else (soup.title.get_text(strip=True) if soup.title else "")
        return title
    except Exception:
        return ""



