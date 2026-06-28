# Base URL
BASE_URL="http://localhost:3000"

echo "--- GET /api/uuid (version=4) ---"
curl -sS "$BASE_URL/api/uuid?version=4" \
  -H "Accept: application/json" | jq .

echo "--- POST /api/timestamp (toUnix) ---"
curl -sS "$BASE_URL/api/timestamp" \
  -H "Content-Type: application/json" \
  -d '{"action":"toUnix"}' | jq .

echo "--- GET /api/timestamp (legacy) ---"
curl -sS "$BASE_URL/api/timestamp" \
  -H "Accept: application/json" | jq .

echo "--- POST /api/qrcode ---"
curl -sS "$BASE_URL/api/qrcode" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello QR","size":256}' | jq .

echo "--- GET /api/qrcode (legacy) ---"
curl -sS "$BASE_URL/api/qrcode?text=Hello%20QR&size=256" \
  -H "Accept: application/json" | jq .

echo "--- POST /api/barcode (ean13) ---"
curl -sS "$BASE_URL/api/barcode" \
  -H "Content-Type: application/json" \
  -d '{"value":"1234567890128","type":"ean13"}' | jq .

echo "--- POST /api/minify (html) ---"
curl -sS "$BASE_URL/api/minify" \
  -H "Content-Type: application/json" \
  -d '{"type":"html","code":"<html>   <!--c--> <body>  <h1>Hi</h1> </body></html>"}' | jq .

echo "--- POST /api/text (morseencode) ---"
curl -sS "$BASE_URL/api/text" \
  -H "Content-Type: application/json" \
  -d '{"action":"morseencode","text":"HELLO WORLD"}' | jq .

echo "--- POST /api/image (compress) ---"
curl -sS "$BASE_URL/api/image" \
  -H "Content-Type: application/json" \
  -d '{"action":"compress","imageBase64":"data:image/png;base64,PUT_BASE64_HERE","quality":80,"format":"webp"}' | jq .

echo "--- POST /api/pdf (download) ---"
# Output PDF as output.pdf
curl -sS -L "$BASE_URL/api/pdf" \
  -H "Content-Type: application/json" \
  -d '{"text":"Ini contoh PDF dari multi-api"}' \
  --output output.pdf

echo "Downloaded: output.pdf"

