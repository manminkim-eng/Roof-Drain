#!/bin/bash
# 매뉴얼 전체 재생성: 계산 대조 → 캡처 → WebP → HTML → PDF → 검증   usage: bash build.sh <repoDir> <rawDir>
# 환경: MM_PW(playwright 경로) · MM_VENDOR(CDN 로컬 사본 폴더 — html2canvas · @fontsource/* · pretendard, npm pack)
set -e; cd "$(dirname "$0")"; REPO="$1"; RAW="$2"; M="$REPO/manual"; rm -rf "$RAW"; mkdir -p "$RAW" "$M/images"
python3 mkref.py && node verify_rd_app.js "$REPO" ref_in.json "$RAW/app_out.json" && python3 cmp_app.py "$RAW/app_out.json"
node capture_rd.js "$REPO" "$RAW" > "$RAW/_log.json"
python3 - "$RAW" "$M" <<'PY'
import sys,glob,os,shutil
from PIL import Image
raw,M=sys.argv[1],sys.argv[2]
for f in sorted(glob.glob(raw+'/s*.png')): Image.open(f).convert('RGB').save(M+'/images/'+os.path.basename(f)[:-4]+'.webp',quality=82,method=6)
shutil.copy(raw+'/_marks.json',M+'/images/_marks.json'); shutil.copy(raw+'/_example.json',M+'/_tools/_example.json')
PY
MANUAL_DIR="$M" python3 gen_manual_rd.py
node pdf_rd.js "$M" RD_사용자매뉴얼_Ver-5.0.pdf "건축물 우수관경 산정 시스템 사용자 매뉴얼 Ver-5.0"
python3 verify_manual_rd.py "$REPO"
node audit_responsive.js "$M/index.html" > "$RAW/_audit.json"
