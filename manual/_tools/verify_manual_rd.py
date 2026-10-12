# -*- coding: utf-8 -*-
"""매뉴얼 검사 — usage: python verify_manual_rd.py <repoDir>
   ① 그림 파일·표시점 ② 범례 수 = 표시점 수 ③ 예제 결과가 본문에 있음 ④ 내부 링크 ⑤ 앱 근거 표기(v5.0.12)"""
import sys, os, re, json
repo = sys.argv[1]; M = os.path.join(repo, 'manual'); ok = True
def chk(name, cond, info=''):
    global ok; ok &= bool(cond); print(('✓' if cond else '✗'), name, info)
h = open(os.path.join(M, 'index.html'), encoding='utf-8').read()
marks = json.load(open(os.path.join(M, 'images', '_marks.json'), encoding='utf-8'))
ex = json.load(open(os.path.join(M, '_tools', '_example.json'), encoding='utf-8'))
figs = re.findall(r'<figure class="shot[^"]*" id="fig-([^"]+)">(.*?)</figure>', h, re.S)
chk('그림 수 = 캡처 수', len(figs) == len(marks), f'{len(figs)}/{len(marks)}')
chk('그림 파일 존재', all(os.path.exists(os.path.join(M, 'images', k + '.webp')) for k in marks))
out = [f'{k}:{m["label"]}' for k, v in marks.items() for m in v['marks'] if 'x' not in m or m['x'] < 0 or m['y'] < 0 or m['x'] + m['w'] > 100.5 or m['y'] + m['h'] > 100.5]
chk('표시점이 이미지 안', not out, str(out[:5]))
bad = [sid for sid, body in figs if len(re.findall(r'<li><b>', body)) != len(marks[sid]['marks'])]
chk('범례 수 = 표시점 수', not bad, str(bad))
need = []
for k in 'ABC':
    e = ex[k]; need += [f"DN {e['vp']}", f"DN {e['hp']}", f"{e['dc']:,.1f}", str(e['rain'])]
need += [f"DN {ex['B']['gp']}"]
miss = [n for n in need if n not in h]
chk('예제 결과가 본문에 있음', not miss, f'{len(need)}개 ' + str(miss))
chk('예제 A DN100·125 · B DN100·100·175 · C=A', (ex['A']['vp'], ex['A']['hp']) == (100, 125) and (ex['B']['hp'], ex['B']['gp']) == (100, 175) and (ex['C']['vp'], ex['C']['hp'], ex['C']['dc']) == (ex['A']['vp'], ex['A']['hp'], ex['A']['dc']))
ids = set(re.findall(r'id="([^"]+)"', h)); links = set(re.findall(r'href="#([^"]+)"', h))
chk('내부 링크', links <= ids, str(sorted(links - ids)[:5]))
chk('매뉴얼 — 옛 표기 없음', not re.search(r'건축물 빗물배수설비|2021 제정|secθ\)\s*=|안전 여유율', h))
app = open(os.path.join(repo, 'index.html'), encoding='utf-8').read()
chk('앱 — 원문 표(DN100 427)', '[100,1708,854,570,427,' in app)
chk('앱 — 옛 표기 없음', not re.search(r"1991~2020 평년|건축물 빗물배수설비|1/cos|\+20% \(권장\)|1/25 \(최소\)", app))
chk('앱 — 매뉴얼 버튼', 'class="tb tb-manual"' in app and 'Roof-Drain/manual/' in app)
sw = open(os.path.join(repo, 'sw.js'), encoding='utf-8').read()
chk('sw — usu-v5.0.12', "'usu-v5.0.12'" in sw)
sys.exit(0 if ok else 1)
