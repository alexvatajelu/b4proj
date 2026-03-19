#!/usr/bin/env python3
import os
import sys
from urllib.parse import urlparse, unquote
import mimetypes
import hashlib
from concurrent.futures import ThreadPoolExecutor, as_completed

def ensure_reqs():
    try:
        import requests  # noqa: F401
        from tqdm import tqdm  # noqa: F401
    except Exception:
        print("Please run: python3 -m pip install requests tqdm")
        sys.exit(1)

ensure_reqs()

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from tqdm import tqdm
import argparse

BASE = os.path.dirname(__file__) or "."
URLS = os.path.join(BASE, "urlss/urlll6.txt")
OUTDIR = os.path.join(BASE, "downloaded_images")

def ext_from_response(resp, url):
    path = urlparse(url).path
    name = os.path.basename(path)
    if name and "." in name:
        return unquote(name).split(".")[-1]
    ct = resp.headers.get("content-type", "")
    if "/" in ct:
        ext = mimetypes.guess_extension(ct.split(";")[0].strip())
        if ext:
            return ext.lstrip('.')
    return "bin"

def save_url(i, url, outdir):
    url = url.strip()
    if not url or url.startswith("#"):
        return None
    if url.startswith("data:"):
        return f"skipped-data:{i}"
    try:
        # use a session with browser-like headers to avoid 403 from some hosts
        session = requests.Session()
        retries = Retry(total=3, backoff_factor=0.5, status_forcelist=(500,502,503,504))
        session.mount("https://", HTTPAdapter(max_retries=retries))
        session.mount("http://", HTTPAdapter(max_retries=retries))
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Referer": "https://commons.wikimedia.org/",
        }
        resp = session.get(url, headers=headers, stream=True, timeout=20)
        resp.raise_for_status()
        ext = ext_from_response(resp, url)
        h = hashlib.sha1(url.encode()).hexdigest()[:10]
        fname = f"{i:04d}-{h}.{ext}"
        path = os.path.join(outdir, fname)
        with open(path, "wb") as f:
            for chunk in resp.iter_content(8192):
                if chunk:
                    f.write(chunk)
        return path
    except Exception as e:
        return f"error:{i}:{e}"

def main():
    p = argparse.ArgumentParser(description="Download images from urls.txt")
    p.add_argument("--dry-run", action="store_true", help="Don't download, just report")
    p.add_argument("--workers", type=int, default=6, help="Parallel downloads")
    args = p.parse_args()

    if not os.path.exists(URLS):
        print(f"Missing urls file: {URLS}")
        sys.exit(2)

    with open(URLS, "r", encoding="utf-8") as f:
        lines = [l.rstrip("\n") for l in f]

    urls = [l for l in lines if l.strip()]
    print(f"Found {len(urls)} non-empty lines in urls.txt")

    if args.dry_run:
        sample = urls[:10]
        print("First 10 entries (or fewer):")
        for i, u in enumerate(sample, 1):
            print(f"{i:03d}: {u}")
        skipped = sum(1 for u in urls if u.strip().startswith("data:"))
        print(f"Data URIs (skipped): {skipped}")
        print("Dry-run complete. To download, run without --dry-run.")
        return

    os.makedirs(OUTDIR, exist_ok=True)
    results = []
    with ThreadPoolExecutor(max_workers=args.workers) as ex:
        futures = {ex.submit(save_url, idx+1, url, OUTDIR): url for idx, url in enumerate(urls)}
        for fut in tqdm(as_completed(futures), total=len(futures)):
            results.append(fut.result())

    print("Results:")
    for r in results:
        print(r)

if __name__ == "__main__":
    main()
