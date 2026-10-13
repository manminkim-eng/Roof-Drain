import sys,json
import os
H=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0,H); from verify_drain_calc import KV,KH,KG,kfind
import re
inp=json.load(open(os.path.join(H,'ref_in.json')))['cases']; out=json.load(open(sys.argv[1] if len(sys.argv)>1 else 'app_out.json'))
# 표 대조
T=out['tables']; ok_t=[]
ok_t.append(all(KV[r[0]]==r[4] for r in T['VT']) and [r[0] for r in T['VT']]==sorted(KV))
ok_t.append(all(KH[int(k)][r[0]]==r[4] for k,v in T['HTS'].items() for r in v))
ok_t.append(all(KG[int(k)][r[0]]==r[4] for k,v in T['GTS'].items() for r in v))
# 원문 전체 셀 대조 (추출 md)
md=open(os.path.join(H,'KDS_31_30_35_2021_표4.4_추출.md'),encoding='utf-8').read()
def parse(sec):
    blk=md.split('## '+sec)[1].split('\n## ')[0]; rows=[]; cur=None
    for l in blk.splitlines():
        if not l.startswith('| ') or '---' in l or 'DN' in l: continue
        c=[x.strip() for x in l.strip('|').split('|')]
        if sec.startswith('표 4.4-1'): rows.append((None,[int(c[0])]+[int(x) for x in c[1:]]))
        else:
            if c[0]: cur=c[0]
            rows.append((cur,[int(c[1])]+[int(x.split()[0]) if '637' not in x else 63 for x in c[2:]]))
    return rows
v=parse('표 4.4-1'); h=parse('표 4.4-2'); g=parse('표 4.4-3')
cell_v=[r for _,r in v]==T['VT']
cell_h=all(T['HTS'][k.split('/')[1]]==[r for kk,r in h if kk==k] for k in ['1/100','1/50','1/25'])
cell_g=all(T['GTS'][k.split('/')[1]]==[r for kk,r in g if kk==k] for k in ['1/200','1/100','1/50','1/25'])
# 계산 대조
bad=0;ex=[]
for c,o in zip(inp,out['cases']):
    vf=1.2 if c['roof']=='valley' else 1.0
    a100=((c['A']+c['W']*0.5)*c['I']/100*vf+c['Q']/0.017*9*25/100)/c['N']
    e=[kfind(KV,a100),kfind(KH[c['slope']],a100),kfind(KG[c['gslope']],a100)]
    if [str(x) for x in e]!=[str(x) for x in o]: bad+=1; ex.append((c,e,o))
# RD 대조
K={}
for l in open(os.path.join(H,'KMA_ASOS_1시간최다강수량_지점요약_1904-2025.txt'),encoding='utf-8'):
    if l[0]!='#' and l.strip(): a=l.split('|'); K[int(a[0])]=a
rd_bad=[r for r in out['RD'] if float(K[r[2]][4])!=r[3] or K[r[2]][5]!=r[5]]
print(json.dumps(dict(tbl_dn100=ok_t,cell_v=cell_v,cell_h=cell_h,cell_g=cell_g,calc_n=len(inp),calc_bad=bad,rd_n=len(out['RD']),rd_bad=len(rd_bad),dup_no=len(out['RD'])-len({r[2] for r in out['RD']}),errs=out['errs']),ensure_ascii=False))
print(ex[:3])
ok=all([*json.loads(json.dumps(ok_t)),cell_v,cell_h,cell_g,bad==0,not rd_bad,not out['errs']]); sys.exit(0 if ok else 1)
