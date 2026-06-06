#!/bin/sh
cd /Users/florianlutz/Documents/Claude/code/currency-converter
exec python3 -m http.server "${PORT:-5175}"
