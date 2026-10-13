// 우수관경 산정 시스템 매뉴얼 화면 캡처 — usage: node capture_rd.js <repoDir> <outDir>
// 규격: 1440×900 · DSF 1.25 · _marks.json(번호 배지 % 좌표) · _example.json(예제 검증값)
const {chromium}=require(process.env.MM_PW||'playwright');const fs=require('fs');const path=require('path');const {setup,server}=require('./serve');
const repo=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]);fs.mkdirSync(out,{recursive:true});
const VW=1440,VH=900,DSF=1.25,PORT=8898;
/* 예제 A = 전북 익산(인근 군산 No.140 · 152.2mm/h) · 평지붕 600㎡ + 수직벽 80㎡ · 드레인 4개 · 원형관 · 1/100 · 여유율 0%
   예제 B = A + 반원형 빗물받이 · 구배 1/50
   예제 C = 구간별 설계 — A구간 400㎡+벽 60㎡ · B구간 200㎡+벽 20㎡ (합 600㎡ · 80㎡) */
const FREEZE=`(()=>{const T=new Date(2026,9,13,10,0,0).getTime();const D=Date;class F extends D{constructor(...a){if(a.length)super(...a);else super(T);}static now(){return T;}}window.Date=F;window.alert=()=>{};window.confirm=()=>true;try{localStorage.clear();localStorage.setItem('pwa-banner-dismissed','1')}catch(e){}})()`;
const HELP=`window.__vis=e=>e&&e.getClientRects().length>0;
window.__card=t=>{const h=[...document.querySelectorAll('.card-tit')].find(e=>__vis(e)&&e.textContent.trim().startsWith(t));return h?h.closest('.card'):null;};
window.__find=sel=>{if(sel.startsWith('card:'))return __card(sel.slice(5));
 if(sel.startsWith('a4sub:'))return document.querySelectorAll('#a4-page .a4-sub')[+sel.slice(6)]||null;
 for(const s of sel.split(',')){const e=[...document.querySelectorAll(s)].find(__vis);if(e)return e;}return null;};
window.__tab=t=>switchTab(t,document.getElementById('tab-'+t));
window.__setv=(id,v)=>{const e=document.getElementById(id);e.value=v;};
window.__A=()=>{resetAll();__tab('calc');document.getElementById('sel-sido').value='전북특별자치도';filterCities();
  selectRegionData(RD.find(r=>r[1]==='익산'));__setv('inp-area',600);__setv('inp-wall',80);__setv('inp-drains',4);
  __setv('sel-pipetype','circular');__setv('sel-slope','100');__setv('sel-safety','0');liveCalc();window.scrollTo(0,0);};
window.__B=()=>{__A();__setv('sel-pipetype','semi');__setv('sel-slope','50');__setv('sel-gslope','50');liveCalc();window.scrollTo(0,0);};
window.__C=()=>{__A();setZoneMode('multi');zones=[{id:1,name:'A구간',area:400,wall:60,roof:'flat'},{id:2,name:'B구간',area:200,wall:20,roof:'flat'}];zoneCounter=2;renderZoneList();calcZoneTotal();liveCalc();window.scrollTo(0,0);};
window.__ex=()=>{const R=S.result;return {sigun:S.sigun,stn:S.kmaStn,no:S.stationNo,rain:S.rainfall,period:S.period,date:S.rainDate,area:S.area,wall:S.wall,drains:S.drains,slope:S.slope,gslope:S.gslope,cont:S.cont,pipetype:S.pipetype,
  ea:+R.ea.toFixed(2),ct:+R.ct.toFixed(2),dc:+R.dc.toFixed(2),fl:+R.fl.toFixed(1),vp:R.vp.dn,vmax:R.vp.maxArea,hp:R.hp.dn,hmax:R.hp.maxArea,gp:R.gp.dn,gmax:R.gp.maxArea,
  hero:document.getElementById('res-main-dn').textContent,desc:document.getElementById('res-main-desc').textContent,sum:[...document.querySelectorAll('.sum-bar .sum-item')].map(e=>e.textContent.trim())};};`;
const SHOTS=[
 {id:'s01_overview',pre:"__A()",clip:'viewport',m:[['.tab-bar-inner','작업 탭'],['.sum-bar','요약 스트립'],['#panel-calc .step-bar','진행 단계'],['card:STEP 1','지역 선택'],['.result-hero','결과 — 추천 수직관'],['.fab-wrap','초기화 · 계산식 안내']]},
 {id:'s02_tabs',clip:'.hdr-shell',m:[['#tab-calc','관경 산정'],['#tab-stdtable','관경 표준표'],['#tab-rain','지역 강우량'],['#tab-guide','설계 기준'],['#tab-a4','A4 미리보기'],['.hdr-right','근거 기준']]},
 {id:'s03_region',clip:'card:STEP 1',m:[['#sel-sido','광역시도'],['#sel-sigun','시군구'],['.rcard.sel','선택 지역 카드'],['#rain-info-box','관측소 · 강우량 · 자료기간']]},
 {id:'s04_roof',clip:'card:STEP 2',m:[['#mode-single-btn','단일 구간 / 구간별'],['#inp-area','수평투영 지붕면적'],['#inp-wall','수직벽 면적'],['#sel-rooftype','지붕 유형']]},
 {id:'s05_drain',clip:'card:STEP 3',m:[['#inp-drains','드레인 개수'],['#drain-unit-area','1개당 분담면적'],['#sel-pipetype','드레인 형태'],['#sel-slope','수평관 기울기'],['#sel-safety','여유율(KDS 외)'],['#inp-cont','연속 배출 유량(KDS 4.4.6)']]},
 {id:'s06_hero',clip:'.result-hero',union:'.stat-grid',m:[['#res-main-dn','추천 수직관 DN'],['#res-eff-area','유효면적'],['#res-rainfall','시간최대강우량'],['#res-flow','설계유량']]},
 {id:'s07_vert',clip:'card:우수 수직관 관경 산정',m:[['#vresults .pc-rec','추천 DN — 표 4.4-1'],['#cv-eff','유효면적 합계'],['#cv-conv','100mm/h 환산'],['#cv-zone','드레인당 환산면적'],['#cv-result','적용 관경'],['#cv-slope-h','수평관 구배 — 표 직접 조회']]},
 {id:'s08_horiz',clip:'card:우수 수평관 관경 산정',m:[['#hresults .pc-rec','추천 DN — 표 4.4-2']]},
 {id:'s09_detail',clip:'card:드레인별 분담면적',union:'card:설계 수량 종합',m:[['#drain-detail','드레인별 상세'],['#count-summary','설계 수량 종합']]},
 {id:'s10_std',pre:"__tab('stdtable');scrollTo(0,0)",wait:700,clip:'card:표 4.4-1',m:[['#std-v-body tr:nth-child(3)','DN 100 — 100mm/h 427㎡']]},
 {id:'s11_std_h',clip:'card:표 4.4-2',m:[['#std-h-body tr:nth-child(1)','1/100 구배'],['#std-h-body tr:nth-child(10)','1/50 구배'],['#std-h-body tr:nth-child(19)','1/25 구배']]},
 {id:'s12_std_g',clip:'card:표 4.4-3',m:[['#panel-stdtable .nb.org','원문 확인(637 → 63)']]},
 {id:'s13_rain',pre:"__tab('rain');scrollTo(0,0)",wait:700,clip:'viewport',m:[['#rain-search','지역 검색'],['#rain-filter','강우량 범위'],['#rain-table-body tr:nth-child(1)','지점 · 관측소 · 최대값 · 발생일']]},
 {id:'s14_guide',pre:"__tab('guide');scrollTo(0,0)",wait:700,clip:'viewport',m:[['card:산정 흐름','산정 흐름'],['card:KDS 31 30 35','KDS 주요 조문']]},
 {id:'s15_guide_roof',clip:'card:지붕 형태별',m:[]},
 {id:'s16_guide_law',clip:'card:KDS 31 30 35 : 2021 주요 조문',union:'card:수평관 기울기별',m:[]},
 {id:'s17_modal',pre:"__tab('calc');openCalcGuide()",wait:800,fixed:true,post:"closeCalcGuide()",clip:'#calcModal .modal-box',m:[]},
 {id:'s18_a4',pre:"__A();__tab('a4');scrollTo(0,0)",wait:1500,clip:'viewport',m:[['#btn-jpg','JPG 저장'],['.mm-btn-pdf','인쇄 · PDF'],['#a4-page','A4 산정 결과서']]},
 {id:'s19_a4page',clip:'#a4-page',m:[['a4sub:0','1. 적용 조건'],['a4sub:1','2. 산정 결과 요약'],['a4sub:2','3. 계산 과정'],['a4sub:3','4. 설계 수량'],['a4sub:4','5. 적용 법적 근거']]},
 {id:'s20_var_gutter',pre:"__B()",wait:700,clip:'#gutter-card',union:'card:우수 수평관 관경 산정',m:[['#hresults .pc-rec','수평관 — 1/50 구배'],['#gresults .pc-rec','반원형 빗물받이 — 표 4.4-3']]},
 {id:'s25_var_gutter_a4',pre:"__B();__tab('a4');scrollTo(0,0)",wait:1500,clip:'#a4-page',post:"__A()",m:[['a4sub:2','3. 계산 과정 — 빗물받이 관경 선정'],['a4sub:3','4. 설계 수량 — 반원형 빗물받이']]},
 {id:'s21_var_zone',pre:"__C()",wait:700,clip:'card:STEP 2',m:[['#mode-multi-btn','구간별 설계'],['#zone-list','구간 입력'],['#zone-total-area','유효면적 합계']]},
];
(async()=>{
 const s=await server(repo,PORT);const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:DSF,serviceWorkers:'block'});await setup(ctx);
 const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.addInitScript(FREEZE);
 await pg.goto(`http://127.0.0.1:${PORT}/index.html`);await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(2500);
 await pg.addStyleTag({content:'#pwa-banner,#ios-modal-rain,#toast,.toast{display:none!important}'});
 await pg.evaluate(HELP);
 const ex={};const meta={};
 for(const S of SHOTS){
  if(S.pre){try{await pg.evaluate(S.pre);}catch(e){errs.push(S.id+' pre '+e.message);}}
  await pg.waitForTimeout(S.wait||600);
  if(S.id==='s01_overview')ex.A=await pg.evaluate('__ex()');
  if(S.id==='s20_var_gutter')ex.B=await pg.evaluate('__ex()');
  if(S.id==='s21_var_zone')ex.C=await pg.evaluate('__ex()');
  if(S.id==='s19_a4page')ex.A_a4=await pg.evaluate(()=>document.getElementById('a4-page').innerText.replace(/\s+/g,' '));
  const info=await pg.evaluate(({S,VW,VH})=>{
   const abs=e=>{const r=e.getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,w:r.width,h:r.height};};
   let clip;
   if(S.clip==='viewport'){clip={x:0,y:scrollY,width:VW,height:VH};}
   else{const el=__find(S.clip);if(!el)return {err:'clip '+S.clip};const a=abs(el);clip={x:a.x,y:a.y,width:a.w,height:a.h};
     if(S.union){const e2=__find(S.union);if(e2){const a2=abs(e2);const x0=Math.min(clip.x,a2.x),y0=Math.min(clip.y,a2.y),x1=Math.max(clip.x+clip.width,a2.x+a2.w),y1=Math.max(clip.y+clip.height,a2.y+a2.h);clip={x:x0,y:y0,width:x1-x0,height:y1-y0};}}
     const P=12;clip={x:Math.max(0,clip.x-P),y:Math.max(0,clip.y-P),width:clip.width+2*P,height:clip.height+2*P};}
   const marks=[];(S.m||[]).forEach(([sel,label],i)=>{const e=__find(sel);if(!e){marks.push({n:i+1,label,miss:sel});return;}const a=abs(e);
     marks.push({n:i+1,label,x:+((a.x-clip.x)/clip.width*100).toFixed(2),y:+((a.y-clip.y)/clip.height*100).toFixed(2),w:+(Math.min(a.w,clip.x+clip.width-a.x)/clip.width*100).toFixed(2),h:+(Math.min(a.h,clip.y+clip.height-a.y)/clip.height*100).toFixed(2)});});
   return {clip,marks};},{S,VW,VH});
  if(info.err){errs.push(S.id+' '+info.err);continue;}
  const c=info.clip;const cl={x:Math.max(0,c.x),y:Math.max(0,c.y),width:Math.min(c.width,VW-Math.max(0,c.x)),height:c.height};
  if(S.clip==='viewport'){await pg.screenshot({path:path.join(out,S.id+'.png'),clip:{x:0,y:0,width:VW,height:VH}});}
  else if(S.fixed){const sx=await pg.evaluate(()=>scrollX),sy=await pg.evaluate(()=>scrollY);await pg.screenshot({path:path.join(out,S.id+'.png'),clip:{x:c.x-sx,y:c.y-sy,width:Math.min(c.width,VW),height:Math.min(c.height,VH)}});}
  else{await pg.screenshot({path:path.join(out,S.id+'.png'),clip:cl,fullPage:true});}
  meta[S.id]={w:Math.round(cl.width),h:Math.round(Math.min(cl.height,S.fixed?VH:1e9)),marks:info.marks};
  if(S.post){try{await pg.evaluate(S.post);}catch(e){errs.push(S.id+' post '+e.message);}await pg.waitForTimeout(400);}
 }
 await pg.evaluate('__A()');await pg.waitForTimeout(500);ex.after=await pg.evaluate('__ex()');
 const mctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,serviceWorkers:'block',isMobile:true,hasTouch:true});await setup(mctx);
 const mp=await mctx.newPage();await mp.addInitScript(FREEZE);
 await mp.goto(`http://127.0.0.1:${PORT}/index.html`);await mp.waitForTimeout(2500);
 await mp.addStyleTag({content:'#pwa-banner,#ios-modal-rain,#toast,.toast{display:none!important}'});await mp.evaluate(HELP);await mp.evaluate('__A()');await mp.waitForTimeout(600);
 await mp.screenshot({path:path.join(out,'s22_mobile_main.png')});meta['s22_mobile_main']={w:390,h:844,marks:[]};
 await mp.evaluate(()=>{document.querySelector('.result-hero').scrollIntoView({block:'start'});});await mp.waitForTimeout(500);
 await mp.screenshot({path:path.join(out,'s23_mobile_result.png')});meta['s23_mobile_result']={w:390,h:844,marks:[]};
 await mp.evaluate(()=>{__tab('a4');window.scrollTo(0,0);});await mp.waitForTimeout(1200);
 await mp.screenshot({path:path.join(out,'s24_mobile_a4.png')});meta['s24_mobile_a4']={w:390,h:844,marks:[]};
 ex.mobile=await mp.evaluate(()=>({page:document.documentElement.scrollWidth}));
 fs.writeFileSync(path.join(out,'_marks.json'),JSON.stringify(meta,null,1));fs.writeFileSync(path.join(out,'_example.json'),JSON.stringify(ex,null,1));
 const miss=[];Object.entries(meta).forEach(([k,v])=>v.marks.forEach(m=>{if(m.miss)miss.push(k+':'+m.miss);else if(m.x<0||m.y<0||m.x+m.w>100.5||m.y+m.h>100.5)miss.push(k+':OUT '+m.label+' '+m.x+','+m.y+','+m.w+','+m.h);}));
 const pick=e=>e&&[e.vp,e.hp,e.gp,e.dc,e.hero];
 console.log(JSON.stringify({A:pick(ex.A),B:pick(ex.B),C:pick(ex.C),same:JSON.stringify(ex.A)===JSON.stringify(ex.after),mobile:ex.mobile,sizes:Object.fromEntries(Object.entries(meta).map(([k,v])=>[k,v.w+'x'+v.h])),miss,errs:errs.slice(0,15)},null,1));
 await b.close();s.close();
})();
