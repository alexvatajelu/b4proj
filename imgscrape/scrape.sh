#!/bin/bash

set -euo pipefail
mkdir -p downloaded_images

while IFS= read -r url; do
  [ -z "$url" ] && continue
  wget -q -P downloaded_images "$url"
done < urls.txt