import sys,json,random
import os; H=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0,H); from verify_drain_calc import kds,KV,KH,KG
random.seed(7); cases=[]
for k in range(3000):
    A=random.choice([random.randint(5,400),random.randint(5,4000)]); W=random.choice([0,0,random.randint(0,300)])
    I=round(random.uniform(40,160),1); N=random.randint(1,8); sl=random.choice([100,50,25]); roof=random.choice(['flat','slope','valley'])
    gs=random.choice([200,100,50,25]); Q=random.choice([0,0,0,round(random.uniform(0,3),2)])
    cases.append(dict(A=A,W=W,I=I,N=N,slope=sl,roof=roof,gslope=gs,Q=Q))
# v6.1.6 — 구간별 설계 사례(밸리형 구간에만 VF 1.2, 교차검증 P6) · 별도 시드라 위 3,000건은 그대로
rz=random.Random(11); zcases=[]
for k in range(500):
    zs=[dict(A=rz.randint(5,1500),W=rz.choice([0,rz.randint(0,150)]),roof=rz.choice(['flat','slope','valley'])) for _ in range(rz.randint(2,3))]
    zcases.append(dict(zones=zs,I=round(rz.uniform(40,160),1),N=rz.randint(1,8),slope=rz.choice([100,50,25]),gslope=rz.choice([200,100,50,25]),Q=rz.choice([0,0,round(rz.uniform(0,3),2)])))
json.dump({'cases':cases,'zcases':zcases},open(os.path.join(H,'ref_in.json'),'w'))
