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

## Live
**https://florianlutz1.github.io/reisekurs/** (GitHub Pages, Repo `florianlutz1/reisekurs`).
Bei Änderungen einfach `git push` – Pages baut automatisch neu.

## Aufs iPhone bringen (als installierbare Offline-App)
1. **https://florianlutz1.github.io/reisekurs/** in **Safari** öffnen
2. Teilen-Symbol → **„Zum Home-Bildschirm“**
3. Das „Reisekurs“-Icon erscheint – startet im Vollbild und läuft offline.

## Hinweis
Die Kurse sind Interbanken-Mittelkurse zur Orientierung. Deine Karte/Bank kann minimal abweichen (Aufschlag i. d. R. <1 %). Genau dafür gibt es den „Eigener Kurs“-Modus.
