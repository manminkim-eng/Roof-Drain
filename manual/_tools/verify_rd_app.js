// 우수관경 v5.0.10 — 앱 doCalc() 결과를 KDS 독립 구현(Python 출력 ref.json)과 대조
const {chromium}=require('playwright');const {setup,server}=require(__dirname+'/serve.js');const fs=require('fs');
const REPO=process.argv[2], REF=JSON.parse(fs.readFileSync(process.argv[3]));
(async()=>{const srv=await server(REPO,8765);const b=await chromium.launch();const ctx=await b.newContext({serviceWorkers:'block'});await setup(ctx);
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(String(e)));
await pg.goto('http://127.0.0.1:8765/index.html');await pg.waitForTimeout(800);
const out=await pg.evaluate(ref=>{const res={tables:{VT,HTS,GTS},RD,cases:[]};
 for(const c of ref.cases){S.rainfall=c.I;S.area=c.A;S.wall=c.W;S.drains=c.N;S.slope=c.slope;S.safety=0;S.rooftype=c.roof;S.valleyFactor=1.2;S.pipetype='semi';doCalc();
  const R=S.result;res.cases.push([R.vp.over?'>'+R.vp.dn:R.vp.dn,R.hp.over?'>'+R.hp.dn:R.hp.dn,R.gp.over?'>'+R.gp.dn:R.gp.dn]);}
 return res;},REF);
out.errs=errs;fs.writeFileSync(process.argv[4],JSON.stringify(out));await b.close();srv.close();console.log('cases',out.cases.length,'errs',errs.length);})();
