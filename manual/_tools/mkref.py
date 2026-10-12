import sys,json,random
import os; H=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0,H); from verify_drain_calc import kds,KV,KH,KG
random.seed(7); cases=[]
for k in range(3000):
    A=random.choice([random.randint(5,400),random.randint(5,4000)]); W=random.choice([0,0,random.randint(0,300)])
    I=round(random.uniform(40,160),1); N=random.randint(1,8); sl=random.choice([100,50,25]); roof=random.choice(['flat','slope','valley'])
    cases.append(dict(A=A,W=W,I=I,N=N,slope=sl,roof=roof))
json.dump({'cases':cases},open(os.path.join(H,'ref_in.json'),'w'))
