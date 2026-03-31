#!/bin/bash
cd "/Users/nachoalegria/Documents/New project" || exit 1
echo "Abriendo OBA Intranet en http://localhost:4173"
python3 -m http.server 4173
