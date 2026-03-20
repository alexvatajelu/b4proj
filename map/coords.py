import time
import csv
import requests
from bs4 import BeautifulSoup

# ------------------------
# CONFIG
# ------------------------
HEADERS = {
    "User-Agent": "store-mapper-script (your_email@example.com)"
}

GEOCODE_URL = "https://nominatim.openstreetmap.org/search"


# ------------------------
# GEOCODER FUNCTION
# ------------------------
def geocode(address):
    params = {
        "q": address,
        "format": "json",
        "limit": 1
    }

    try:
        response = requests.get(GEOCODE_URL, params=params, headers=HEADERS)
        data = response.json()

        if data:
            return data[0]["lat"], data[0]["lon"]
        else:
            return None, None

    except Exception as e:
        print("Error:", e)
        return None, None


# ------------------------
# ICELAND PARSER
# ------------------------
def parse_iceland(file_path):
    addresses = []

    with open(file_path, "r", encoding="utf-8") as f:
        lines = [l.strip() for l in f if l.strip()]

    # Every 3 lines: name, type, address
    for i in range(0, len(lines), 3):
        if i + 2 < len(lines):
            address = lines[i + 2]
            addresses.append(address)

    return addresses


# ------------------------
# TESCO PARSER
# ------------------------
def parse_tesco(file_path):
    addresses = []

    with open(file_path, "r", encoding="utf-8") as f:
        lines = [l.strip() for l in f if l.strip()]

    for i in range(0, len(lines), 3):
        if i + 2 < len(lines):
            address = lines[i + 2]
            addresses.append(address)

    return addresses


# ------------------------
# WAITROSE PARSER (HTML)
# ------------------------
def parse_waitrose(file_path):
    addresses = []

    with open(file_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    rows = soup.find_all("tr")

    for row in rows:
        cols = row.find_all("td")
        if len(cols) >= 2:
            address = cols[1].get_text(strip=True)
            addresses.append(address)

    return addresses


# ------------------------
# SAVE FUNCTION
# ------------------------
def save_coords(name, addresses):
    filename = f"{name}_coords.csv"

    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["address", "latitude", "longitude"])

        for addr in addresses:
            print(f"Geocoding: {addr}")

            lat, lon = geocode(addr)

            writer.writerow([addr, lat, lon])

            time.sleep(1)  # IMPORTANT (rate limit)

    print(f"Saved: {filename}")


# ------------------------
# RUN ALL
# ------------------------
if __name__ == "__main__":
    iceland = parse_iceland("iceland.txt")
    tesco = parse_tesco("tescos.txt")
    waitrose = parse_waitrose("waitrose.txt")

    save_coords("iceland", iceland)
    save_coords("tesco", tesco)
    save_coords("waitrose", waitrose)