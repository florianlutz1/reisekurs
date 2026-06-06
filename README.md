# Reisekurs 🇸🇬 🇮🇩 🇹🇭

Schlanke, offline-fähige Währungsrechner-PWA für die Sommerreise – Singapur (SGD), Indonesien (IDR) und Thailand (THB) ⇄ Euro.

## Features
- **Beide Richtungen**: lokalen Betrag eingeben → Euro, oder umgekehrt (Swap-Button).
- **Tageskurs**: holt sich automatisch **einmal pro Tag** den aktuellen Kurs (Interbanken-Mittelkurs, sehr nah an Visa/Mastercard). Manuelles Aktualisieren per Button jederzeit.
- **Eigener Kurs**: trag ein, was du beim echten Geldwechsel bekommen hast (z. B. „100 € → 1.560.000 Rp“) – die App rechnet deinen persönlichen Kurs aus und du kannst pro Land zwischen Tageskurs und eigenem Kurs umschalten.
- **Offline-first**: einmal geladene Kurse + deine Eingaben liegen lokal; die App funktioniert komplett ohne Netz. Online wird automatisch aktualisiert.
- **iPhone-Optik**: Safe-Area, große Touch-Flächen, automatischer Light/Dark-Mode, als App auf den Home-Bildschirm installierbar.

## Stack
Reines Vanilla HTML/CSS/JS – kein Build, keine Dependencies. Kursquelle: `open.er-api.com` (kostenlos, kein API-Key, CORS offen).

## Lokal testen
```sh
cd currency-converter
python3 -m http.server 5175
# http://localhost:5175 im Browser öffnen
```

## Aufs iPhone bringen (als installierbare Offline-App)
Service Worker brauchen HTTPS. Am einfachsten kostenlos hosten:

**Option A – Netlify Drop (kein Account-Setup nötig):**
1. https://app.netlify.com/drop öffnen
2. den Ordner `currency-converter/` reinziehen → du bekommst eine `https://…netlify.app`-URL

**Option B – GitHub Pages:**
1. Ordner in ein Repo pushen, in den Repo-Settings Pages aktivieren (Branch `main`, Root)

**Dann am iPhone (Safari):**
1. die HTTPS-URL öffnen
2. Teilen-Symbol → **„Zum Home-Bildschirm“**
3. Das „Reisekurs“-Icon erscheint – startet im Vollbild und läuft offline.

## Hinweis
Die Kurse sind Interbanken-Mittelkurse zur Orientierung. Deine Karte/Bank kann minimal abweichen (Aufschlag i. d. R. <1 %). Genau dafür gibt es den „Eigener Kurs“-Modus.
