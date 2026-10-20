const K='jee-os-playlist-v1';
let SOURCE_SEED=null;
const SUBS=[{id:'P',n:'Physics',c:'var(--p)'},{id:'C',n:'Chemistry',c:'var(--c)'},{id:'M',n:'Maths',c:'var(--m)'}];
const SYL={
P:[['Basic Mathematics',7],['Units And Measurement',1],['Motion In A Straight Line',10],['Motion In A Plane',7],['Laws Of Motion',12],['Work, Energy & Power',9],['Circular Motion',6],['Center Of Mass And Collision',12],['Rotational Motion',18],['Gravitation',2],['Mechanical Properties Of Solids',2],['Mechanical Properties Of Fluids',13],['Thermal Properties Of Matter',7],['KTG And Thermodynamics',5],['Simple Harmonic Motion',5],['Waves',7],['Electric Charges And Field',12],['Electric Potential And Capacitance',12],['Current Electricity',4],['Moving Charges And Magnetism',6],['Magnetism And Matter',1],['Electromagnetic Induction',5],['Alternating Current',3],['Electromagnetic Waves',2],['Ray Optics And Optical Instrument',10],['Wave Optics',4],['Dual Nature Of Radiation And Matter',3],['Atoms',3],['Nuclei',1],['Semiconductors',5],['Instruments',2]],
C:[['Some Basic Concepts Of Chemistry',16],['Structure Of Atom',9],['Periodic Table',10],['Chemical Bonding',20],['States Of Matter',4],['Redox Reaction',8],['Chemical Equilibrium',5],['Ionic Equilibrium',6],['Thermodynamics',13],['IUPAC Nomenclature',10],['General Organic Chemistry',14],['Isomerism',17],['Hydrocarbon',15],['Haloalkane And Haloarene',8],['Alcohols, Phenols And Ethers',6],['Aldehydes, Ketones And Carboxylic Acids',6],['Amines',2],['Biomolecules',3],['Solutions',11],['Electrochemistry',8],['Chemical Kinetics',10],['Hydrogen',1],['S Block',3],['Coordination Compounds',14],['D And F Block',6],['P Block',7],['Salt Analysis',6],['Solid State',5],['Surface Chemistry',1],['Metallurgy',1],['Polymers',1],['Chemistry In Everyday Life',2],['Environmental Chemistry',1]],
M:[['Basic Mathematics',14],['Sets',3],['Quadratic Equations',9],['Relations And Functions',12],['Trigonometric Functions',8],['Trigonometric Equation',5],['Solution Of Triangle',2],['Sequence And Series',9],['Complex Number',5],['Permutations And Combinations',9],['Binomial Theorem',6],['Straight Lines',10],['Circles',8],['Parabola',7],['Ellipse',5],['Hyperbola',2],['Matrices',5],['Determinants',4],['Inverse Trigonometric Functions',5],['Limit, Continuity And Differentiability',9],['Methods Of Differentiation',2],['Application Of Derivatives',7],['Indefinite Integration',5],['Definite Integration',6],['Application Of Integrals',1],['Differential Equation',3],['Vector Algebra',4],['Three Dimensional Geometry',4],['Probability',5],['Statistics',2]]};
// Spaced revision after a chapter is complete: days after completion, and what to do.
const CYCLES=[[1,'Rewrite formulas and key points from memory'],[3,'Solve 20 mixed problems (NCERT and level 1-2)'],[7,'Previous-year JEE Main questions of this chapter'],[15,'Advanced-level problems, then fix every mistake'],[30,'Redo the questions you got wrong in your chapter test, plus 10 fresh ones'],[60,'Quick recall of formulas, traps and weak spots']];
const TABS=[['dash','Dashboard'],['plan','Planner'],['cal','Calendar'],['lec','Syllabus'],['rev','Revision'],['test','Tests'],['set','Settings']];
const def=()=>({v:4,name:'',exam:'',theme:'dark',planStart:'',perDay:2,rest:0,balance:true,buffer:30,chapters:[],rev:{},focus:{},rlog:{},snz:{},tres:[],tplan:[],td:null});
let note='',S=def(),tab='dash',filt='all',rfilt='all',q='',open={},lmsg='',err='',pill='dev',PLAN=null,lastDay='',selDay=null,CAL=null,calScroll=false;

const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const iso=d=>d.toLocaleDateString('en-CA');
const today=()=>iso(new Date());
const addD=(s,n)=>{const d=new Date(s+'T00:00');d.setDate(d.getDate()+n);return iso(d)};
const nextSunday=(s,include=false)=>{const d=new Date(s+'T00:00');const day=d.getDay();let n=(7-day)%7;if(!include&&n===0)n=7;d.setDate(d.getDate()+n);return iso(d)};
const firstSundayOfMonth=(s)=>{const d=new Date(s+'T00:00');d.setDate(1);const n=(7-d.getDay())%7;d.setDate(1+n);return iso(d)};
const sundaySeries=(start,count)=>{let d=nextSunday(start,true),a=[];for(let i=0;i<count;i++){a.push(d);d=addD(d,7)}return a};
const diff=(a,b)=>Math.round((new Date(b+'T00:00')-new Date(a+'T00:00'))/864e5);
const fmt=s=>new Date(s+'T00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'});
const fmtL=s=>new Date(s+'T00:00').toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'});
const uid=()=>Math.random().toString(36).slice(2,9);
const pct=(a,b)=>b?Math.round(a*100/b):0;
const col=id=>(SUBS.find(s=>s.id===id)||SUBS[0]).c;
const subName=id=>(SUBS.find(s=>s.id===id)||SUBS[0]).n;
const isUrl=u=>/^https?:\/\//i.test(u||'');
const chap=id=>S.chapters.find(c=>c.id===id);
const ordOf=c=>S.chapters.filter(x=>x.sub===c.sub).indexOf(c)+1;

/* ---------- data ---------- */
function seed(){
 const base=SOURCE_SEED&&Array.isArray(SOURCE_SEED.chapters)?JSON.parse(JSON.stringify(SOURCE_SEED)):null;
 if(base){base.theme='dark';return Object.assign(def(),base)}
 const ch=[];SUBS.forEach(s=>SYL[s.id].forEach((x,i)=>ch.push({id:s.id+String(i+1).padStart(2,'0'),sub:s.id,name:x[0],url:'',lects:[...Array(x[1])].map(()=>({d:null}))})));
 return Object.assign(def(),{chapters:ch,planStart:addD(today(),1)})
}
// Refresh source-owned playlist metadata on saved chapters without touching progress,
// custom names/links, lecture completion dates, notes, revisions, or test history.
function mergeSourcePlaylistMetadata(){
 const source=new Map((SOURCE_SEED?.chapters||[]).map(c=>[c.id,c]));
 let changed=false;
 for(const c of (S.chapters||[])){
  const src=source.get(c.id);if(!src)continue;
  const avg=Number(src.avgSeconds),total=Number(src.totalSeconds),count=Number(src.fetchedCount);
  if(Number.isFinite(avg)&&avg>0&&c.avgSeconds!==avg){c.avgSeconds=avg;changed=true}
  if(Number.isFinite(total)&&total>=0&&c.totalSeconds!==total){c.totalSeconds=total;changed=true}
  if(Number.isFinite(count)&&count>=0&&c.fetchedCount!==count){c.fetchedCount=count;changed=true}
  if(src.durationFetchedAt&&c.durationFetchedAt!==src.durationFetchedAt){c.durationFetchedAt=src.durationFetchedAt;changed=true}
 }
 return changed;
}
const cnt=c=>[c.lects.filter(l=>l.d).length,c.lects.length];
const lastDate=c=>c.lects.reduce((m,l)=>l.d&&l.d>m?l.d:m,'');
function clearSnz(id){Object.keys(S.snz).forEach(k=>{if(k.startsWith(id+'_'))delete S.snz[k]})}
function recheck(c){const all=c.lects.length>0&&c.lects.every(l=>l.d);
 if(all&&!c.doneOn){c.doneOn=lastDate(c)||today();S.rev[c.id]=[]}
 else if(!all&&c.doneOn){delete c.doneOn;delete S.rev[c.id];clearSnz(c.id)}}
function norm(){S.chapters=S.chapters.filter(c=>c&&typeof c==='object');
 S.chapters.forEach(c=>{c.id=c.id||uid();c.url=c.url||'';if(!['P','C','M'].includes(c.sub))c.sub='P';if(!Array.isArray(c.lects))c.lects=[];c.lects=c.lects.map(l=>({d:l&&l.d||null}));recheck(c)});
 ['rev','focus','rlog','snz'].forEach(k=>{if(!S[k]||Array.isArray(S[k]))S[k]={}});['tres','tplan'].forEach(k=>{if(!Array.isArray(S[k]))S[k]=[]});
 if(!S.planStart)S.planStart=today();if(!(+S.perDay>=1))S.perDay=2;S.rest=0;if(S.buffer==null)S.buffer=30;S.theme='dark'}
function subStat(id){let d=0,t=0,cd=0,ct=0;S.chapters.forEach(c=>{if(c.sub!==id)return;const x=cnt(c);d+=x[0];t+=x[1];ct++;if(x[1]&&x[0]===x[1])cd++});return{d,t,cd,ct}}
function totals(){const a=SUBS.map(s=>Object.assign({s},subStat(s.id)));return{a,D:a.reduce((x,y)=>x+y.d,0),T:a.reduce((x,y)=>x+y.t,0),CD:a.reduce((x,y)=>x+y.cd,0),CT:a.reduce((x,y)=>x+y.ct,0)}}
function lectCounts(){const m={};S.chapters.forEach(c=>c.lects.forEach(l=>{if(l.d)m[l.d]=(m[l.d]||0)+1}));return m}
function streak(lm){const on=d=>(lm[d]||0)+(S.rlog[d]||0)>0;let n=0,d=today();if(!on(d))d=addD(d,-1);while(on(d)){n++;d=addD(d,-1)}return n}
function revItems(){const o=[];S.chapters.forEach(c=>{if(!c.doneOn)return;const r=S.rev[c.id]||[];CYCLES.forEach((cy,k)=>{const dn=r[k];o.push({c,k,due:addD(c.doneOn,cy[0]+(S.snz[c.id+'_'+k]||0)),done:!!dn,on:typeof dn==='string'?dn:'',t:cy[1]})})});return o}
const reopenOk=c=>!c.doneOn||confirm('"'+c.name+'" is complete and has revisions scheduled. Changing its lectures reopens it and resets its revision schedule. Continue?');

/* ---------- Daily continuous PCM planner: 2 hours per subject, 6 hours total ---------- */
// Monday-Saturday are continuous study days. Sundays remain protected test/rest days.
const isRest=d=>S.rest!==''&&+S.rest>=0&&new Date(d+'T00:00').getDay()===+S.rest;
const BLOCK_SECONDS=7200;
const PLAYBACK_SPEED=1.5; // User watches every lecture at 1.5x.
const SUBJECT_ORDER=['P','C','M'];
function videoEstimate(c){return Math.max(1,Math.ceil((Number(c?.avgSeconds)||3600)/PLAYBACK_SPEED))}
// Each subject has its own queue and follows its chapter order. Every study day allocates
// up to two continuous hours to Physics, then Chemistry, then Maths. Whole videos only.
function makeSubjectQueues(excluded=new Set()){
 const queues={P:[],C:[],M:[]};
 S.chapters.forEach(c=>{
   if(!queues[c.sub])return;
   c.lects.forEach((l,i)=>{if(!l.d&&!excluded.has(c.id+'_'+i))queues[c.sub].push({c,i})});
 });
 return queues;
}
function freshPositions(){return{P:0,C:0,M:0}}
function remainingQueues(queues,pos){return SUBJECT_ORDER.some(sub=>pos[sub]<queues[sub].length)}
function fillSubjectAllocation(queues,pos,sub){
 const out=[];let used=0,guard=0;
 while(pos[sub]<queues[sub].length&&guard++<500){
   const x=queues[sub][pos[sub]],secs=videoEstimate(x.c);
   // A whole video that will not fit carries to the next study day for this subject;
   // unused time is left free. A video estimated longer than two hours gets a dedicated
   // overrun allocation so the plan cannot get stuck forever.
   if(used+secs>BLOCK_SECONDS){
     if(used===0&&secs>BLOCK_SECONDS){out.push({sub,c:x.c.id,i:x.i,estimatedSeconds:secs,overrun:true});pos[sub]++;}
     break;
   }
   out.push({sub,c:x.c.id,i:x.i,estimatedSeconds:secs});
   used+=secs;pos[sub]++;
   if(used>=BLOCK_SECONDS)break;
 }
 return out;
}
function pickDay(queues,pos,date){
 if(isRest(date))return [];
 const slots=[];
 SUBJECT_ORDER.forEach(sub=>slots.push(...fillSubjectAllocation(queues,pos,sub)));
 return slots;
}
function todaySlots(){const T=today(),start=S.planStart||T;
 if(!S.td||S.td.date!==T||S.td.schedulerVersion!==5){let slots=[];
   if(T>=start&&!isRest(T)){const queues=makeSubjectQueues(),pos=freshPositions();slots=pickDay(queues,pos,T)}
   S.td={date:T,slots,schedulerVersion:5};save();
 }
 return S.td.slots}
function simulate(p,ex){const queues=makeSubjectQueues(ex),pos=freshPositions();
 const days=[];const T=today(),start=S.planStart||T;let d=T<start?start:addD(T,1),g=0;
 while(remainingQueues(queues,pos)&&g++<2500){if(isRest(d)){d=addD(d,1);continue}const slots=pickDay(queues,pos,d);days.push({date:d,slots});d=addD(d,1)}
 return days}
function buildPlan(p){const sl=todaySlots(),ex=new Set(sl.map(x=>x.c+'_'+x.i)),days=simulate(p||+S.perDay||1,ex),T=today();
 return{today:sl,days,end:days.length?days[days.length-1].date:(S.chapters.some(c=>c.lects.some(l=>!l.d))||sl.length?T:null)}}
function chapDates(pl){const m={},add=(date,x)=>{const o=m[x.c]||(m[x.c]={s:date,e:date});if(date<o.s)o.s=date;if(date>o.e)o.e=date};pl.today.forEach(x=>add(today(),x));pl.days.forEach(d=>d.slots.forEach(x=>add(d.date,x)));return m}
function subEnds(pl){const m={};pl.today.forEach(x=>{m[x.sub]=today()});pl.days.forEach(d=>d.slots.forEach(x=>{m[x.sub]=d.date}));return m}
function todayDone(sub){const T=today();let n=0;S.chapters.forEach(c=>{if(c.sub===sub)c.lects.forEach(l=>{if(l.d===T)n++})});return n}
function behind(){const T=today();let n=0;for(let d=S.planStart||T;d<T;d=addD(d,1))if(!isRest(d))n++;
 return SUBS.map(s=>{const x=subStat(s.id),exp=Math.min(x.t,n*(+S.perDay||1)),before=x.d-todayDone(s.id);return{s,gap:exp-before}})}
function neededPerDay(){if(!S.exam)return null;const tgt=addD(S.exam,-(+S.buffer||0));if(PLAN.end&&PLAN.end<=tgt)return{tgt,p:+S.perDay||1,ok:true};
 for(let p=(+S.perDay||1)+1;p<=8;p++){const e=buildPlan(p).end;if(!e||e<=tgt)return{tgt,p,ok:false}}return{tgt,p:null,ok:false}}
function moreFor(sub){const sl=todaySlots(),ex=new Set(sl.map(x=>x.c+'_'+x.i)),x=queue(sub).find(z=>!ex.has(z.c.id+'_'+z.i));if(x){sl.push({sub,c:x.c.id,i:x.i});save()}}
function pace(lm,D,Tt){const T=today(),ds=Object.keys(lm).sort();if(!ds.length)return null;const span=Math.min(14,Math.max(1,diff(ds[0],T)+1));let n=0;for(let i=0;i<span;i++)n+=lm[addD(T,-i)]||0;return{avg:n/span,span,left:Tt-D}}

/* ---------- local-first persistence + Supabase cloud backend ---------- */
function setPill(p){pill=p;const e=document.getElementById('pill');if(e){e.className='pill '+p;e.innerHTML=pillHTML()}}
const pillHTML=()=>'<i></i>'+({dev:'Local only',saving:'Saving…',ok:'Cloud saved',off:'Cloud sync failed'}[pill]);
function save(){try{localStorage.setItem(K,JSON.stringify(S))}catch(e){};if(cloudUser&&cloudReady)cloudSave()}
const SUPABASE_URL='https://bztsnkejidzjjlaghtly.supabase.co';
const SUPABASE_KEY='sb_publishable_Cef2U5pCDcDJp9DUpe36KA_8DrAetWc';
const sb=(window.supabase&&window.supabase.createClient)?window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY):null;
let cloudUser=null,cloudReady=false,cloudTimer=null,cloudBusy=false;
function authMsg(t,bad=false){const e=document.getElementById('authmsg');if(e){e.textContent=t;e.className='authmsg '+(bad?'bad':'ok')}}
function authOpen(){document.getElementById('authbox')?.classList.add('on');authMsg(cloudUser?('Signed in as '+cloudUser.email):'')}
function authClose(){document.getElementById('authbox')?.classList.remove('on')}
function topicRows(){const rows=[];for(const c of S.chapters)for(let i=0;i<c.lects.length;i++){const d=c.lects[i]?.d;if(d)rows.push({user_id:cloudUser.id,topic_id:`${c.id}-T${String(i+1).padStart(3,'0')}`,status:'COMPLETED',completed_at:d,notes:c.note||'',client_updated_at:new Date().toISOString()})}return rows}
function chapterRows(){return S.chapters.filter(c=>c.note).map(c=>({user_id:cloudUser.id,module_id:c.id,mastery_status:c.doneOn?'MASTERED':'NOT_STARTED',notes:c.note||'',client_updated_at:new Date().toISOString()}))}
function revisionRows(){const rows=[];for(const r of revItems()){const base=addD(r.c.doneOn,CYCLES[r.k][0]),snz=S.snz[r.c.id+'_'+r.k]||0;rows.push({user_id:cloudUser.id,module_id:r.c.id,cycle:r.k+1,due_date:r.due,completed:r.done,completed_at:r.done?r.on:null,snoozed_until:snz?addD(base,snz):null,notes:r.t||'',client_updated_at:new Date().toISOString()})}return rows}
function testRows(){return S.tres.map(r=>({user_id:cloudUser.id,assessment_id:r.ref||r.type,taken_on:r.date,score:r.score,max_score:r.max,minutes:r.mins||null,physics_score:r.p??null,chemistry_score:r.c??null,maths_score:r.m??null,weak_areas:r.note||'',notes:JSON.stringify({id:r.id,name:r.name,sub:r.sub||'',chapter:r.ch||'',type:r.type||'weekly'}),client_updated_at:new Date().toISOString()}))}
function moduleOverrideRows(){
 const base=new Map((SOURCE_SEED?.chapters||[]).map(c=>[c.id,c]));
 const current=new Map(S.chapters.map(c=>[c.id,c]));
 const rows=[];const uidv=cloudUser.id;const now=new Date().toISOString();
 for(const [id,c] of current){const b=base.get(id);if(!b||c.custom||c.name!==b.name||c.sub!==b.sub||c.lects.length!==b.lects.length)rows.push({user_id:uidv,module_id:id,domain_id:c.sub,name:c.name,lecture_count:c.lects.length,custom:!!c.custom,deleted:false,client_updated_at:now})}
 for(const b of (SOURCE_SEED?.chapters||[]))if(!current.has(b.id))rows.push({user_id:uidv,module_id:b.id,domain_id:b.sub,name:b.name,lecture_count:b.lects.length,custom:false,deleted:true,client_updated_at:now});
 return rows;
}
async function cloudLoadOrSeed(){if(!sb||!cloudUser)return false;cloudBusy=true;setPill('saving');try{
 const [u,l,c,r,t,m,o]=await Promise.all([
  sb.from('jeeo_user_settings').select('*').eq('user_id',cloudUser.id).maybeSingle(),
  sb.from('jeeo_lecture_progress').select('*').eq('user_id',cloudUser.id),
  sb.from('jeeo_chapter_progress').select('*').eq('user_id',cloudUser.id),
  sb.from('jeeo_revision_progress').select('*').eq('user_id',cloudUser.id),
  sb.from('jeeo_test_results').select('*').eq('user_id',cloudUser.id),
  sb.from('jeeo_module_links').select('*').eq('user_id',cloudUser.id),
  sb.from('jeeo_module_overrides').select('*').eq('user_id',cloudUser.id)
 ]);
 for(const x of [u,l,c,r,t,m,o])if(x.error)throw x.error;
 if(!u.data){cloudReady=true;cloudBusy=false;await cloudPush();setPill('ok');return true}
 const base=seed();
 S=Object.assign(def(),base,{name:u.data.display_name||'',theme:'dark',exam:u.data.exam_date||'',planStart:u.data.plan_start||'',perDay:u.data.per_day_per_subject||2,rest:u.data.rest_day??0,balance:u.data.balance!==false,buffer:u.data.buffer_days??30,focus:u.data.focus||{},rev:{},rlog:{},snz:{},tres:[],tplan:[],td:null});
 const byMod=new Map(S.chapters.map(c=>[c.id,c]));
 for(const row of (o.data||[])){
  if(!byMod.has(row.module_id)&&!row.custom)continue;
  if(row.deleted){S.chapters=S.chapters.filter(c=>c.id!==row.module_id);byMod.delete(row.module_id);continue}
  let cc=byMod.get(row.module_id);
  if(!cc){cc={id:row.module_id,sub:row.domain_id,name:row.name,url:'',custom:!!row.custom,lects:[...Array(row.lecture_count||0)].map(()=>({d:null}))};S.chapters.push(cc);byMod.set(cc.id,cc)}
  cc.sub=row.domain_id;cc.name=row.name;cc.custom=!!row.custom;cc.lects=[...Array(Math.max(0,Math.min(300,row.lecture_count||0)))].map((_,i)=>cc.lects[i]||({d:null}));
 }
 for(const row of (l.data||[])){const m=String(row.topic_id||'').match(/^(.*)-T(\d+)$/);if(!m)continue;const cc=byMod.get(m[1]),i=+m[2]-1;if(cc&&cc.lects[i])cc.lects[i].d=row.completed_at||null}
 for(const row of (c.data||[])){const cc=byMod.get(row.module_id);if(cc)cc.note=row.notes||''}
 for(const row of (m.data||[])){const cc=byMod.get(row.module_id);if(cc)cc.url=row.url||''}
 for(const row of (r.data||[])){const cc=byMod.get(row.module_id);if(!cc)continue;const k=Math.max(0,(row.cycle|0)-1);cc.doneOn=cc.doneOn||lastDate(cc);S.rev[cc.id]=S.rev[cc.id]||[];if(row.completed_at)S.rev[cc.id][k]=row.completed_at;const baseDue=cc.doneOn?addD(cc.doneOn,CYCLES[k][0]):null;if(baseDue&&row.snoozed_until)S.snz[cc.id+'_'+k]=Math.max(0,diff(baseDue,row.snoozed_until))}
 for(const row of (t.data||[])){let meta={};try{meta=JSON.parse(row.notes||'{}')}catch(e){}S.tres.push({id:meta.id||uid(),ref:row.assessment_id||'',type:meta.type||'weekly',name:meta.name||row.assessment_id||'Test',date:row.taken_on,score:+row.score||0,max:+row.max_score||0,mins:row.minutes||null,sub:meta.sub||'',ch:meta.chapter||'',p:row.physics_score==null?null:+row.physics_score,c:row.chemistry_score==null?null:+row.chemistry_score,m:row.maths_score==null?null:+row.maths_score,note:row.weak_areas||''})}
 norm();try{localStorage.setItem(K,JSON.stringify(S))}catch(e){};cloudReady=true;setPill('ok');render();return true;
}catch(e){cloudReady=false;setPill('off');authMsg('Cloud sync error: '+(e.message||e),true);return false}finally{cloudBusy=false}}
async function cloudPush(){if(!sb||!cloudUser||!cloudReady||cloudBusy)return;try{cloudBusy=true;setPill('saving');const uidv=cloudUser.id,now=new Date().toISOString();
 const settings={user_id:uidv,display_name:S.name||'',theme:'dark',current_section:tab||'dash',per_day_per_subject:+S.perDay||2,rest_day:+S.rest||0,plan_start:S.planStart||null,exam_date:S.exam||null,balance:S.balance!==false,buffer_days:+S.buffer||0,focus:S.focus||{},client_updated_at:now};
 const a=await sb.from('jeeo_user_settings').upsert(settings,{onConflict:'user_id'});if(a.error)throw a.error;
 const del=async table=>{const x=await sb.from(table).delete().eq('user_id',uidv);if(x.error)throw x.error};
 for(const table of ['jeeo_lecture_progress','jeeo_chapter_progress','jeeo_revision_progress','jeeo_test_results','jeeo_module_links','jeeo_module_overrides'])await del(table);
 const batches=[['jeeo_lecture_progress',topicRows()],['jeeo_chapter_progress',chapterRows()],['jeeo_revision_progress',revisionRows()],['jeeo_test_results',testRows()],['jeeo_module_links',S.chapters.filter(c=>c.url).map(c=>({user_id:uidv,module_id:c.id,url:c.url,client_updated_at:now}))],['jeeo_module_overrides',moduleOverrideRows()]];
 for(const [table,rows] of batches){for(let i=0;i<rows.length;i+=200){const part=rows.slice(i,i+200);if(!part.length)continue;const x=await sb.from(table).insert(part);if(x.error)throw x.error}}
 setPill('ok');
 }catch(e){setPill('off');console.error(e)}finally{cloudBusy=false}}
function cloudSave(){if(!cloudUser||!cloudReady)return;clearTimeout(cloudTimer);cloudTimer=setTimeout(cloudPush,650)}
function authSignIn(){if(!sb)return authMsg('Cloud service unavailable.',true);const email=document.getElementById('authEmail')?.value.trim(),password=document.getElementById('authPassword')?.value||'';if(!email||!password)return authMsg('Enter your email and password.',true);authMsg('Signing in…');sb.auth.signInWithPassword({email,password}).then(({data,error})=>{if(error)return authMsg(error.message,true);cloudUser=data.user;authClose();return cloudLoadOrSeed()}).then(()=>render()).catch(e=>authMsg(e.message||String(e),true))}
function authSignUp(){if(!sb)return authMsg('Cloud service unavailable.',true);const email=document.getElementById('authEmail')?.value.trim(),password=document.getElementById('authPassword')?.value||'';if(!email||password.length<6)return authMsg('Enter an email and a password of at least 6 characters.',true);authMsg('Creating account…');sb.auth.signUp({email,password}).then(({data,error})=>{if(error)return authMsg(error.message,true);if(data.session){cloudUser=data.user;authClose();return cloudLoadOrSeed().then(()=>render())}return authMsg('Account created. Check your email to confirm it, then sign in.');}).catch(e=>authMsg(e.message||String(e),true))}
async function authSignOut(){if(!sb)return;await sb.auth.signOut();cloudUser=null;cloudReady=false;setPill('dev');render()}
async function initCloud(){if(!sb)return;try{const {data}=await sb.auth.getSession();cloudUser=data.session?.user||null;if(cloudUser)await cloudLoadOrSeed();else setPill('dev');sb.auth.onAuthStateChange((_e,session)=>{cloudUser=session?.user||null;if(cloudUser&&!cloudReady)setTimeout(()=>cloudLoadOrSeed().then(render),0);else if(!cloudUser){cloudReady=false;setPill('dev')}render()})}catch(e){setPill('off')}}
const noteHTML=()=>note==='file'?`<div class="card err"><b>Jee OS could not load its source data.</b><div style="margin-top:4px">Start it with <b>start.bat</b>. Your local progress stays in this browser.</div></div>`:'';
async function boot(){
 try{const r=await fetch('/tracker.json',{cache:'no-store'});if(!r.ok)throw new Error('tracker.json could not be loaded');SOURCE_SEED=await r.json();if(!SOURCE_SEED||!Array.isArray(SOURCE_SEED.chapters))throw new Error('tracker.json is invalid');try{const dr=await fetch('/playlist-durations.json',{cache:'no-store'});if(dr.ok){const dd=await dr.json();const dm=dd.playlists||{};SOURCE_SEED.chapters.forEach(c=>{const d=dm[c.id];if(d&&Number(d.avgSeconds)>0){c.avgSeconds=Number(d.avgSeconds);c.totalSeconds=Number(d.totalSeconds)||0;c.fetchedCount=Number(d.fetchedCount)||0;c.durationFetchedAt=d.fetchedAt||null}})}}catch(_e){}}
 catch(e){note='file';err='Jee OS needs to be opened through start.bat so tracker.json can load.';SOURCE_SEED=null}
 let raw=null;try{raw=localStorage.getItem(K)}catch(e){}
 if(raw){try{S=Object.assign(def(),JSON.parse(raw))}catch(e){S=seed()}}else S=seed()
 // Cached state may predate the latest backend duration refresh. Merge the new
 // duration metadata into it while preserving all user-owned progress and settings.
 const durationsChanged=mergeSourcePlaylistMetadata();
 if(S.schedulerVersion!==5){S.schedulerVersion=5;S.td=null;} else S.td=null;
 norm();
 if(durationsChanged||!raw){try{localStorage.setItem(K,JSON.stringify(S))}catch(_e){}}
 setPill('dev');render();await initCloud()
}
async function importFile(f){if(!f)return;let d;try{d=JSON.parse(await f.text())}catch(e){alert('That file is not valid JSON.');return}
 if(!d||!Array.isArray(d.chapters)){alert('That does not look like a tracker backup (no chapters found).');return}
 if(!confirm('Replace everything in the tracker with this file?'))return;
 S=Object.assign(def(),d,{theme:'dark'});norm();note='';err='';save();render()}

/* ---------- actions ---------- */
function setLect(id,i,on){const c=chap(id);if(!c||!c.lects[i])return;c.lects[i].d=on?today():null;recheck(c);open[id]=true;save();rerender()}
function setRev(id,k,on){const r=S.rev[id]=S.rev[id]||[];const T=today();r[k]=on?T:false;S.rlog[T]=Math.max(0,(S.rlog[T]||0)+(on?1:-1));save();rerender()}
const nk=s=>String(s).toLowerCase().replace(/[^a-z0-9]/g,'');
const subOf=x=>{const k=String(x||'').trim().toLowerCase();return k==='p'||k==='physics'?'P':k==='c'||k==='chemistry'?'C':k==='m'||k==='math'||k==='maths'||k==='mathematics'?'M':''};
function bulkLinks(text){let ok=0,nolink=0;const bad=[];
 text.split('\n').map(x=>x.trim()).filter(Boolean).forEach(line=>{const parts=line.split(/\t|\|/).map(x=>x.trim());let sub='',name='',url='';
  parts.filter(Boolean).forEach(v=>{if(isUrl(v))url=v;else if(!sub&&!name&&parts.length>2&&subOf(v))sub=subOf(v);else if(!name)name=v.replace(/^\d+[.)]?\s+/,'')});
  if(!url){if(name&&!/^(subject|chapter)$/i.test(name))nolink++;return}
  if(!name){bad.push(line.slice(0,60));return}
  let m=S.chapters.filter(c=>nk(c.name)===nk(name)&&(!sub||c.sub===sub));
  if(!m.length)m=S.chapters.filter(c=>nk(c.name).includes(nk(name))&&(!sub||c.sub===sub));
  if(m.length!==1){bad.push(name+(m.length>1?' (exists in '+m.map(c=>subName(c.sub)).join(' and ')+', put the subject first)':' (no match)'));return}
  m[0].url=url;ok++});
 return{ok,bad,nolink}}
function copyTemplate(){const t=SUBS.flatMap(s=>S.chapters.filter(c=>c.sub===s.id).map(c=>s.n+'\t'+c.name+'\t'+(c.url||''))).join('\n');
 const done=m=>{lmsg=m;rerender()};try{navigator.clipboard.writeText(t).then(()=>done('Copied all '+S.chapters.length+' chapters. Paste into Excel or Google Sheets, fill the third column with your links, then copy the three columns back into the box below.'),()=>done('Could not copy. Allow clipboard access and try again.'))}catch(e){done('Could not copy. Allow clipboard access and try again.')}}

/* ---------- views ---------- */
const ring=(p,c)=>`<svg viewBox="0 0 120 120" width="130" height="130"><circle cx="60" cy="60" r="52" fill="none" stroke="var(--soft)" stroke-width="12"/><circle cx="60" cy="60" r="52" fill="none" stroke="${c}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${(326.7*p/100).toFixed(1)} 326.7" transform="rotate(-90 60 60)"/><text x="60" y="67" text-anchor="middle" style="font:800 26px system-ui;fill:var(--ink)">${p}%</text></svg>`;
const watchBtn=c=>isUrl(c.url)?`<a class="btn g s" href="${esc(c.url)}" target="_blank" rel="noopener">Watch</a>`:`<button class="btn g s" data-a="gochap" data-id="${c.id}" title="Add the chapter link first">Add link</button>`;
function slotRow(x){const c=chap(x.c),l=c&&c.lects[x.i];if(!l)return'';
 return `<div class="row ${l.d?'dn':''}"><span class="dot" style="background:${col(x.sub)}"></span><div class="t"><b>${esc(c.name)}</b><div class="mu">${subName(x.sub)} · Video ${x.i+1} of ${c.lects.length} · est. ${Math.round(videoEstimate(c)/60)} min</div></div>${watchBtn(c)}<input type="checkbox" id="s${c.id}_${x.i}" ${l.d?'checked':''} data-a="lec" data-id="${c.id}" data-i="${x.i}" aria-label="Done"></div>`}
function todayCard(){const T=today(),sl=PLAN.today,start=S.planStart||T;
 if(T<start)return `<div class="card"><h3>Today</h3><div class="empty">Plan starts ${fmt(start)}. Each study day is one continuous 6-hour block: 2 hours each for Physics, Chemistry and Maths.</div></div>`;
 if(isRest(T)&&!sl.length)return `<div class="card"><h3>Today</h3><div class="empty">Rest day. Revise, give a test, or just recover.</div></div>`;
 if(!sl.length)return `<div class="card"><h3>Today</h3><div class="empty">Every video is done. Use the time for revision and tests.</div></div>`;
 const dn=sl.filter(x=>{const c=chap(x.c);return c&&c.lects[x.i]&&c.lects[x.i].d}).length;
 const subjectSections=SUBS.map(subject=>{
   const rows=sl.filter(x=>x.sub===subject.id);
   return `<section style="margin-top:12px"><div class="eyebrow" style="margin-bottom:4px;color:${subject.c}">${subject.n} · 2 hours</div>${rows.length?rows.map(slotRow).join(''):`<div class="mu" style="padding:5px 0 5px 12px">No whole video fits this subject's 2-hour allocation. Use the time for revision or question practice.</div>`}</section>`;
 }).join('');
 return `<div class="card"><div style="display:flex;justify-content:space-between;align-items:baseline"><h3>Today's 6-hour study block</h3><span class="mu">${dn} of ${sl.length} videos done</span></div><div class="bar" style="margin:8px 0"><span style="width:${pct(dn,sl.length)}%;background:${dn===sl.length?'var(--c)':'var(--ac)'}"></span></div>${subjectSections}<div class="mu" style="margin-top:10px">Study in one continuous block: Physics 2h, Chemistry 2h, Maths 2h. Estimates use playlist-average durations at 1.5×; whole videos only. A video that does not fit carries forward for that subject, leaving unused minutes available for revision or question practice.</div></div>`}
function finishCard(){const T=today();
 if(!PLAN.end)return `<div class="card"><h3>Finish line</h3><div class="empty">Whole syllabus complete.</div></div>`;
 const days=diff(T,PLAN.end),target=S.exam?addD(S.exam,-(+S.buffer||0)):null;
 const byExam=target?`<div class="mu" style="margin-top:8px">Revision buffer: ${+S.buffer||0} days · target video-finish date ${fmt(target)}. ${PLAN.end<=target?'The current whole-video plan fits the target.':'The current whole-video plan finishes after the target; consider moving the exam date, reducing the buffer, or studying longer blocks.'}</div>`:'<div class="mu" style="margin-top:8px">Add your exam date in Settings to compare the whole-video plan against your revision buffer.</div>';
 return `<div class="card"><h3>Finish line</h3><div class="big" style="margin-top:4px">${fmt(PLAN.end)}<span> · in ${days} day${days===1?'':'s'}</span></div><div class="mu" style="margin:2px 0 8px">Estimated from playlist-average durations at 1.5× playback. Each study day allocates two hours per subject in one continuous six-hour block; complete videos are never split.</div>${byExam}</div>`}


function dash(){const T=today(),tt=totals(),lm=lectCounts(),rv=revItems(),due=rv.filter(r=>!r.done&&r.due<=T).sort((a,b)=>a.due<b.due?-1:1),rd=rv.filter(r=>r.done).length;
 const tn=lm[T]||0,best=Math.max(0,...Object.values(lm)),pc=pace(lm,tt.D,tt.T);
 const wk=[...Array(7)].map((_,i)=>{const d=addD(T,i-6);return[d,lm[d]||0]}),mx=Math.max(3,...wk.map(x=>x[1])),wsum=wk.reduce((a,x)=>a+x[1],0);
 const prog=S.chapters.filter(c=>{const x=cnt(c);return x[0]>0&&x[0]<x[1]}).sort((a,b)=>lastDate(b)>lastDate(a)?1:-1).slice(0,5);
 return `<div class="card hero">${ring(pct(tt.D,tt.T),'var(--ac)')}<div style="flex:1;min-width:200px"><div class="big">${tt.D}<span> of ${tt.T} videos</span></div><div class="mu" style="margin:4px 0 10px">${tt.CD} of ${tt.CT} chapters complete · ${rd} of ${rv.length} revisions done</div><div class="bar"><span style="width:${pct(tt.D,tt.T)}%;background:var(--ac)"></span></div></div></div>
 <div class="grid">${tt.a.map(x=>`<div class="card"><div style="display:flex;justify-content:space-between;align-items:baseline"><b style="color:${x.s.c}">${x.s.n}</b><span class="big" style="font-size:28px">${pct(x.d,x.t)}%</span></div><div class="bar" style="margin:8px 0"><span style="width:${pct(x.d,x.t)}%;background:${x.s.c}"></span></div><div class="mu">${x.d} of ${x.t} videos · ${x.cd} of ${x.ct} chapters</div></div>`).join('')}</div>
 ${todayCard()}
 <div class="grid"><div class="card"><h3>Streak and week</h3><div class="big" style="margin-top:6px">${streak(lm)}<span> day streak</span></div><div class="mu" style="margin:6px 0 2px">${tn} video${tn===1?'':'s'} today · ${wsum} this week · best day ${best}${pc?' · avg '+pc.avg.toFixed(1)+' a day':''}</div><div class="wk">${wk.map(x=>`<div><span>${x[1]||''}</span><u style="height:${x[1]/mx*100}%"></u><span>${new Date(x[0]+'T00:00').toLocaleDateString('en',{weekday:'short'}).slice(0,2)}</span></div>`).join('')}</div></div>${finishCard()}</div>
 <div class="grid"><div class="card"><h3>Revision due</h3>${due.length?due.slice(0,5).map(revRow).join('')+(due.length>5?`<div class="mu" style="padding-top:8px">and ${due.length-5} more in the Revision tab</div>`:''):'<div class="empty">Nothing due. Finish all videos of a chapter to start its revision cycles.</div>'}</div>
 <div class="card"><h3>In progress</h3>${prog.length?prog.map(c=>{const x=cnt(c);return `<div class="row"><span class="dot" style="background:${col(c.sub)}"></span><div class="t"><b>${esc(c.name)}</b><div class="bar" style="margin-top:5px"><span style="width:${pct(x[0],x[1])}%;background:${col(c.sub)}"></span></div></div><span class="mu">${x[0]}/${x[1]}</span></div>`}).join(''):'<div class="empty">Tick your first video to see chapters here.</div>'}</div></div>
 ${testCards()}`}

function cell(sl,sub){const by=[];sl.filter(x=>x.sub===sub).forEach(x=>{const l=by[by.length-1];if(l&&l.c===x.c&&l.i[l.i.length-1]===x.i)l.i.push(x.i+1);else by.push({c:x.c,i:[x.i+1]})});return by.map(b=>{const c=chap(b.c),r=b.i.length>1?b.i[0]+'-'+b.i[b.i.length-1]:b.i[0];return esc(c?c.name:'?')+' <span class="mu">V'+r+'</span>'}).join('<br>')||'<span class="mu">-</span>'}
function plan(){const T=today(),bh=behind(),cd=chapDates(PLAN),sh=PLAN.days.slice(0,14),start=S.planStart||T,dn0=T<start?0:Math.max(1,diff(start,T)+1);
 return `<div class="card"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px"><h3>${T<start?'Starts tomorrow':'Day '+dn0+' of the plan'}</h3><span class="mu">${fmtL(T)}${PLAN.end?' · syllabus ends '+fmt(PLAN.end):''}</span></div><p class="mu" style="margin:6px 0 0">Monday through Saturday use one continuous 6-hour study block: Physics 2h, Chemistry 2h, Maths 2h. Each subject progresses through its own chapters in syllabus order. Whole videos only, estimated using playlist-average durations at 1.5× playback; a video that does not fit carries forward for that subject and unused minutes stay free for revision or question practice. Sundays remain protected for the existing test/rest system.</p></div>
 ${todayCard()}${finishCard()}
 <div class="card"><h3>Next 14 study days</h3><div class="tw"><table class="pt"><tr><th>Day</th>${SUBS.map(s=>`<th style="color:${s.c}">${s.n}</th>`).join('')}</tr>${sh.map(d=>`<tr><td style="white-space:nowrap">${fmtL(d.date)}<div class="mu">Day ${diff(S.planStart||T,d.date)+1}</div></td>${SUBS.map(s=>`<td>${cell(d.slots,s.id)}</td>`).join('')}</tr>`).join('')||'<tr><td colspan="4" class="empty">Nothing left to schedule.</td></tr>'}</table></div></div>
 ${SUBS.map(s=>{const chs=S.chapters.filter(c=>c.sub===s.id);return `<details class="card"><summary style="cursor:pointer;font-weight:600;color:${s.c}">${s.n} roadmap, chapter by chapter</summary><div style="margin-top:8px">${chs.map((c,k)=>{const x=cnt(c),d=cd[c.id];return `<div class="row"><span class="mu" style="width:26px">${k+1}</span><div class="t"><b>${esc(c.name)}</b><div class="mu">${x[0]}/${x[1]} videos</div></div><span class="mu" style="white-space:nowrap">${c.doneOn?'<span style="color:var(--c)">complete</span>':d?fmt(d.s)+' to '+fmt(d.e):'-'}</span></div>`}).join('')}</div></details>`}).join('')}
 <div class="btns"><button class="btn g" data-a="rebuild">Rebuild today's videos</button><span class="mu" style="align-self:center">Use this after changing the plan settings or choosing "Start here" on a chapter.</span></div>`}

function rows(c){return c.lects.map((l,i)=>`<div class="lr ${l.d?'done':''}"><input type="checkbox" id="l${c.id}_${i}" ${l.d?'checked':''} data-a="lec" data-id="${c.id}" data-i="${i}"><label for="l${c.id}_${i}" ${l.d?`title="Done ${fmt(l.d)}"`:''}>Video ${i+1}</label>${isUrl(c.url)?`<a class="btn g s" href="${esc(c.url)}" target="_blank" rel="noopener">Watch</a>`:''}</div>`).join('')}
function chCard(c){const x=cnt(c),p=pct(x[0],x[1]),isCur=S.focus[c.sub]===c.id;
 return `<details class="ch" data-id="${c.id}" data-n="${esc(c.name.toLowerCase())}" style="--k:${col(c.sub)}" ${open[c.id]?'open':''}><summary><span class="mu" style="width:22px">${ordOf(c)}</span><div class="t"><b>${esc(c.name)}</b><span class="mu">${subName(c.sub)} · ${x[0]}/${x[1]} videos${c.doneOn?' · complete':''}</span></div>${isCur?'<span class="tag cur">start here</span>':''}${isUrl(c.url)?'':'<span class="tag bad">no link</span>'}${c.doneOn?'<span class="tag ok">complete</span>':''}<div class="mini bar"><span style="width:${p}%;background:${col(c.sub)}"></span></div><b style="width:38px;text-align:right">${p}%</b></summary>
 <div class="acts"><input data-a="clink" data-id="${c.id}" value="${esc(c.url)}" placeholder="Paste this chapter's link from your coaching website" aria-label="Chapter link">${isUrl(c.url)?`<a class="btn" href="${esc(c.url)}" target="_blank" rel="noopener">Open</a>`:''}</div>
 <div class="acts"><button class="btn g" data-a="focus" data-id="${c.id}">${isCur?'Clear start here':'Start here'}</button><button class="btn g" data-a="all" data-id="${c.id}">Mark all done</button><button class="btn g" data-a="reset" data-id="${c.id}">Reset</button><button class="btn g" data-a="setn" data-id="${c.id}">Set video count</button>${c.custom?`<button class="btn g" data-a="del" data-id="${c.id}">Delete</button>`:''}</div>
 ${c.lects.length?`<div class="in" data-id="${c.id}">${open[c.id]?rows(c):''}</div>`:'<div class="mu" style="padding:0 14px 10px">No videos yet. Use Set video count.</div>'}
 <div class="nt"><textarea placeholder="Notes for this chapter (where you got stuck, what to revisit)" data-a="note" data-id="${c.id}" style="min-height:48px">${esc(c.note||'')}</textarea></div></details>`}
const fl=c=>filt==='all'||(filt==='ip'?cnt(c)[0]>0&&cnt(c)[0]<cnt(c)[1]:filt==='dn'?!!c.doneOn:filt==='nl'?!isUrl(c.url):c.sub===filt);
function lec(){const tt=totals(),list=S.chapters.filter(fl),nl=S.chapters.filter(c=>!isUrl(c.url)).length;
 return `<div class="grid">${tt.a.map(x=>`<div class="card"><div style="display:flex;justify-content:space-between"><b style="color:${x.s.c}">${x.s.n}</b><span class="mu">${x.ct} chapters · ${x.t} videos</span></div><div class="bar" style="margin:8px 0"><span style="width:${pct(x.d,x.t)}%;background:${x.s.c}"></span></div><div class="mu">${x.d} done (${pct(x.d,x.t)}%) · ${x.cd} chapters complete</div></div>`).join('')}</div>
 <details class="card"><summary style="cursor:pointer;font-weight:600">Add chapter links in bulk (${nl} chapters still have no link)</summary><form id="links" style="margin-top:12px"><div class="mu" style="margin-bottom:8px">Easiest way: press <b>Copy chapter list</b>, paste it into Excel or Google Sheets, fill the third column with your links, then copy all three columns back into the box. You can also type lines like <b>Chapter name | link</b>. Basic Mathematics exists in Physics and Maths, so for that one write <b>Physics | Basic Mathematics | link</b>.</div><div class="btns" style="margin-bottom:8px"><button type="button" class="btn g" data-a="tpl">Copy chapter list</button></div><textarea name="text" required style="min-height:120px" placeholder="Rotational Motion | https://yourcoaching.com/..."></textarea><div style="margin-top:10px"><button class="btn">Save links</button></div>${lmsg?`<div class="mu" style="margin-top:8px">${esc(lmsg)}</div>`:''}</form></details>
 <details class="card"><summary style="cursor:pointer;font-weight:600">+ Add a chapter that is not in the list</summary><form id="addch" class="f" style="margin-top:12px"><div><span class="mu">Subject</span><select name="sub">${SUBS.map(s=>`<option value="${s.id}">${s.n}</option>`).join('')}</select></div><div><span class="mu">Chapter name</span><input name="name" required></div><div><span class="mu">Number of videos</span><input name="n" type="number" min="1" max="200" required></div><div class="w"><span class="mu">Link (optional)</span><input name="url" placeholder="https://..."></div><div><button class="btn">Add chapter</button></div></form></details>
 <div class="chips">${[['all','All'],...SUBS.map(s=>[s.id,s.n]),['ip','In progress'],['dn','Complete'],['nl','No link']].map(x=>`<button class="chip ${filt===x[0]?'on':''}" data-a="filt" data-v="${x[0]}">${x[1]}</button>`).join('')}</div>
 <div style="display:flex;gap:10px;align-items:center;margin-bottom:12px"><input id="search" placeholder="Search chapters" value="${esc(q)}"><span class="mu" id="cnt" style="white-space:nowrap"></span></div>
 ${list.length?list.map(chCard).join(''):'<div class="card empty">No chapters here.</div>'}`}

function revRow(r){const T=today(),dd=diff(T,r.due),k=r.c.id+'_'+r.k,
 when=r.done?(r.on?'done '+fmt(r.on):'done'):dd<0?`<span class="late">overdue by ${-dd} day${dd<-1?'s':''}</span>`:dd===0?'<b>today</b>':'in '+dd+' day'+(dd>1?'s':'')+' · '+fmt(r.due);
 return `<div class="row"><input type="checkbox" id="r${k}" ${r.done?'checked':''} data-a="rev" data-id="${r.c.id}" data-k="${r.k}"><label class="t" for="r${k}"><b style="color:${col(r.c.sub)}">${esc(r.c.name)}</b> · Revision ${r.k+1} <span class="mu">(day ${CYCLES[r.k][0]})</span><div class="mu">${esc(r.t)}</div></label><span class="mu" style="white-space:nowrap">${when}</span>${r.done?'':`<button class="btn g s" data-a="snz" data-id="${r.c.id}" data-k="${r.k}" title="Push this revision back one day">+1 day</button>`}</div>`}
function rev(){const T=today(),rv=revItems().filter(r=>rfilt==='all'||r.c.sub===rfilt),od=rv.filter(r=>!r.done&&r.due<T).sort((a,b)=>a.due<b.due?-1:1),td=rv.filter(r=>!r.done&&r.due===T),
  up=rv.filter(r=>!r.done&&r.due>T).sort((a,b)=>a.due<b.due?-1:1),wk=up.filter(r=>diff(T,r.due)<=7).length,dn=rv.filter(r=>r.done).sort((a,b)=>a.on<b.on?1:-1);
 const sec=(t,l,e)=>`<div class="card"><h3 style="margin-bottom:6px">${t} <span class="mu">${l.length||''}</span></h3>${l.length?l.map(revRow).join(''):`<div class="empty">${e}</div>`}</div>`;
 const doneC=S.chapters.filter(c=>c.doneOn).length;
 return `<div class="stats"><div class="stat"><b class="${od.length?'late':''}">${od.length}</b><span class="mu">overdue</span></div><div class="stat"><b>${td.length}</b><span class="mu">due today</span></div><div class="stat"><b>${wk}</b><span class="mu">in the next 7 days</span></div><div class="stat"><b>${dn.length}</b><span class="mu">done so far</span></div></div>
 <div class="chips">${[['all','All'],...SUBS.map(s=>[s.id,s.n])].map(x=>`<button class="chip ${rfilt===x[0]?'on':''}" data-a="rfilt" data-v="${x[0]}">${x[1]}</button>`).join('')}</div>
 ${sec('Overdue',od,'Nothing overdue.')}${sec('Due today',td,'Nothing due today.')}${sec('Upcoming',up.slice(0,25),'Complete a chapter to schedule its revisions.')}
 <details class="card"><summary style="cursor:pointer;font-weight:600">Completed revisions (${dn.length})</summary>${dn.slice(0,30).map(revRow).join('')||'<div class="empty">None yet.</div>'}</details>
 <div class="card"><h3>How revision works</h3><p class="mu" style="margin:6px 0 0">When you tick the last video of a chapter it is marked complete and six revision cycles are scheduled from that day: ${CYCLES.map((c,i)=>'R'+(i+1)+' after '+c[0]+(c[0]>1?' days':' day')).join(', ')}. Spaced repetition with problem solving is the standard topper pattern. ${doneC} chapter${doneC===1?'':'s'} complete so far. Use +1 day to push a revision back. Unticking a lecture in a completed chapter removes its schedule.</p></div>`}

/* ---------- tests: deterministic Sunday assessment system ---------- */
const TYPES={subject:'Subject Progress Test',weekly:'Weekly Progress Test',mock:'Monthly Full Mock'};
const TEST_SPEC={subject:{marks:300,questions:75,minutes:180,label:'Subject Progress Test'},weekly:{marks:180,questions:45,minutes:180,label:'Weekly Progress Test'},mock:{marks:360,questions:90,minutes:180,label:'Monthly Full Mock'}};
const TEST_ORDER={subject:1,weekly:2,mock:3};
const tpct=r=>r.max?Math.round(r.score*100/r.max):0;
const tlogged=ref=>S.tres.some(r=>r.ref===ref);
let lg=null;
function progressPct(){const t=totals();return pct(t.D,t.T)}
const chapterOrder=id=>{const i=S.chapters.findIndex(c=>c.id===id);return i<0?99999:i};
const subjectOrder=id=>({P:1,C:2,M:3}[id]||9);
const testSort=(a,b)=>{const d=diff(b.due,a.due);if(d)return d;const p=(TEST_ORDER[a.type]||9)-(TEST_ORDER[b.type]||9);if(p)return p;if(a.type==='subject'&&b.type==='subject'){const q=subjectOrder(a.sub)-subjectOrder(b.sub);return q||(a.series||0)-(b.series||0)}return String(a.name).localeCompare(String(b.name))};
function syllabusEnd(){return PLAN.end||today()}
function subjectChapters(sub,cd){return S.chapters.filter(c=>c.sub===sub&&cd[c.id]&&cd[c.id].e).sort((a,b)=>chapterOrder(a.id)-chapterOrder(b.id))}
function coverageOnDate(cd,sub,d){return S.chapters.filter(c=>(!sub||c.sub===sub)&&cd[c.id]&&cd[c.id].e<=d).sort((a,b)=>chapterOrder(a.id)-chapterOrder(b.id))}
function addPlannedTest(o,key,type,name,due,ex={},allowAfterEnd=false){if(!due||(!allowAfterEnd&&due>syllabusEnd())||tlogged(key))return;o.push(Object.assign({key,type,name,due},ex))}
function plannedTests(){
 const T=today(),cd=chapDates(PLAN),o=[];
 // 1. Subject Progress Tests: after every 3rd completed/planned chapter in each subject.
 // These remain valid even when the due Sunday falls after the overall video finish date.
 SUBS.forEach(sub=>{
   const cs=subjectChapters(sub.id,cd);
   for(let i=2;i<cs.length;i+=3){
     const c=cs[i],base=c.doneOn||(cd[c.id]&&cd[c.id].e);
     if(!base)continue;
     const series=(i+1)/3;let due=nextSunday(base,false);
     addPlannedTest(o,`st_${sub.id}_${series}`,'subject',`${sub.n} — Subject Progress Test ${series}`,due,{sub:sub.id,series,marks:300,questions:75,coverage:coverageOnDate(cd,sub.id,due).map(x=>x.name)} ,true);
   }
   const all=S.chapters.filter(c=>c.sub===sub.id);
   if(cs.length===all.length&&cs.length){
     const last=cs[cs.length-1],base=last.doneOn||(cd[last.id]&&cd[last.id].e);
     if(base){let d=nextSunday(base,false);for(let n=1;n<=5;n++){
       addPlannedTest(o,`sfinal_${sub.id}_${n}`,'subject',`${sub.n} — Final Subject Test ${n}/5`,d,{sub:sub.id,series:100+n,final:true,marks:300,questions:75,coverage:cs.map(x=>x.name)},true);
       d=addD(d,7);
     }}
   }
 });
 // 2. Weekly Progress Test: every Sunday. Fixed 180 marks / 45 questions,
 // and covers every chapter completed by that test date. There is no separate
 // Chapter Mastery Test; Weekly is the chapter-check layer.
 sundaySeries(T,Math.max(1,Math.floor(diff(T,nextSunday(PLAN.end,false))/7)+1)).forEach(d=>{
   
   const cov=coverageOnDate(cd,null,d);
   if(!cov.length)return;
   addPlannedTest(o,'wk_'+d,'weekly','Weekly Progress Test',d,{marks:180,questions:45,minutes:180,coverage:cov.map(c=>c.name)} ,true);
 });
 // 3. Monthly Full Mock: first Sunday of each month, including the first Sunday
 // after the syllabus finishes so the complete PCM syllabus is actually tested.
 const cursor=new Date(T+'T00:00');
 for(let i=0;i<36;i++){
   const first=new Date(cursor.getFullYear(),cursor.getMonth()+i,1),d=firstSundayOfMonth(iso(first));
   if(d<T)continue;
   
   if(d>nextSunday(PLAN.end,false))break;
   const cov=coverageOnDate(cd,null,d);
   if(!cov.length)continue;
   addPlannedTest(o,'mock_'+d,'mock','Monthly Full Mock',d,{marks:360,questions:90,coverage:cov.map(c=>c.name)},true);
 }
 const sorted=o.sort(testSort);let last='',n=0;sorted.forEach(t=>{if(t.due!==last){last=t.due;n=1}else n++;t.dayOrder=n;t.slot=TEST_SPEC[t.type].label});return sorted;
}
const dueTests=()=>plannedTests().filter(t=>t.due<=today()).length;
function badge(k){const n=k==='test'?dueTests():k==='rev'?revItems().filter(r=>!r.done&&r.due<=today()).length:0;return n?` <span class="tag" style="margin-left:4px">${n}</span>`:''}
function logTest(v){const fields=['p','c','m'],hasAny=fields.some(k=>v[k]!==''&&v[k]!=null),has=fields.every(k=>v[k]!==''&&v[k]!=null),p=has?+v.p:null,c=has?+v.c:null,m=has?+v.m:null;
 const score=v.score===''||v.score==null?(has?p+c+m:NaN):+v.score,max=+v.max;
 if(!isFinite(score)||score<0||!(max>0)||score>max){alert('Score must be between 0 and the maximum score.');return}
 if(hasAny&&!has){alert('For a full-paper result, enter Physics, Chemistry and Maths marks together.');return}
 if(has){const subjectMax=max/3;if([p,c,m].some(x=>!isFinite(x)||x<0||x>subjectMax)){alert('Each subject mark must be between 0 and one-third of the paper maximum.');return}if(Math.abs((p+c+m)-score)>1e-9){alert('Physics + Chemistry + Maths must equal the total score.');return}}
 S.tres.push({id:uid(),ref:v.ref||'',type:v.type,name:(v.name||'').trim()||TYPES[v.type],date:v.date||today(),score,max,mins:v.mins?+v.mins:null,sub:v.sub||'',ch:(lg&&lg.ch)||'',p,c,m,note:(v.note||'').trim()});
 lg=null;save();rerender()}
function subAvg(){const a={P:[0,0],C:[0,0],M:[0,0]};S.tres.forEach(r=>{if(r.p!=null&&r.c!=null&&r.m!=null){const per=r.max/3;a.P[0]+=r.p;a.P[1]+=per;a.C[0]+=r.c;a.C[1]+=per;a.M[0]+=r.m;a.M[1]+=per}else if(r.sub&&a[r.sub]){a[r.sub][0]+=r.score;a[r.sub][1]+=r.max}});return a}
function testRow(t){const T=today(),dd=diff(T,t.due),when=dd<0?`<span class="late">Overdue by ${-dd} day${dd<-1?'s':''}</span>`:dd===0?'<b>Due today</b>':'In '+dd+' day'+(dd>1?'s':'');const sp=TEST_SPEC[t.type];const cov=t.coverage&&t.coverage.length?t.coverage:[];const coverage=cov.length?`<div class="test-detail-block"><span class="test-detail-label">Coverage</span><div class="test-chips">${cov.map((x,i)=>`<span class="test-chip">${i+1}. ${esc(x)}</span>`).join('')}</div></div>`:'';return `<div class="test-row-card"><div class="test-row-main"><span class="test-order">${t.dayOrder}</span><div class="test-row-content"><div class="test-title-line"><b>${esc(t.name)}</b><span class="tag">${esc(sp.label)}</span></div><div class="test-meta-grid"><div><span>DATE</span><b>${fmt(t.due)}</b></div><div><span>STATUS</span><b>${when}</b></div><div><span>QUESTIONS</span><b>${sp.questions}</b></div><div><span>MARKS</span><b>${sp.marks}</b></div><div><span>TIME</span><b>${sp.minutes} min</b></div></div>${coverage}</div><button class="btn s test-log-btn" data-a="tlog" data-key="${esc(t.key)}">Log result</button></div></div>`}
function logForm(){const ty=lg?lg.type:'weekly',sp=TEST_SPEC[ty]||TEST_SPEC.weekly;return `<details class="card" ${lg?'open':''}><summary style="cursor:pointer;font-weight:600">${lg?'Log result: '+esc(lg.name):'Log a test result'}</summary><form id="logt" class="f" style="margin-top:12px"><input type="hidden" name="ref" value="${esc(lg?lg.ref:'')}"><div class="w"><span class="mu">Test name</span><input name="name" required value="${esc(lg?lg.name:'')}" placeholder="Select a planned test above"></div><div><span class="mu">Type</span><select name="type">${Object.keys(TYPES).map(k=>`<option value="${k}" ${k===ty?'selected':''}>${TYPES[k]}</option>`).join('')}</select></div><div><span class="mu">Date taken</span><input type="date" name="date" value="${today()}" required></div><div><span class="mu">Subject (if applicable)</span><select name="sub"><option value="">Mixed / all</option>${SUBS.map(s=>`<option value="${s.id}" ${lg&&lg.sub===s.id?'selected':''}>${s.n}</option>`).join('')}</select></div><div><span class="mu">Score</span><input name="score" type="number" step="any"></div><div><span class="mu">Out of</span><input name="max" type="number" value="${sp.marks}" readonly></div><div><span class="mu">Time taken (minutes)</span><input name="mins" type="number" min="0"></div>${SUBS.map(s=>`<div><span class="mu">${s.n} marks</span><input name="${s.id.toLowerCase()}" type="number" step="any"></div>`).join('')}<div class="w"><span class="mu">Mistakes / weak areas</span><textarea name="note" placeholder="What should improve next time?"></textarea></div><div><button class="btn">Save result</button>${lg?'<button type="button" class="btn g" data-a="tcancel">Cancel</button>':''}</div></form></details>`}
function logTest(v){const type=v.type,sp=TEST_SPEC[type]||TEST_SPEC.weekly,max=+v.max,fields=['p','c','m'],hasAny=fields.some(k=>v[k]!==''&&v[k]!=null),has=fields.every(k=>v[k]!==''&&v[k]!=null),p=has?+v.p:null,c=has?+v.c:null,m=has?+v.m:null,score=v.score===''||v.score==null?(has?p+c+m:NaN):+v.score;if(max!==sp.marks){alert(`${sp.label} must be ${sp.marks} marks.`);return}if(!isFinite(score)||score<0||score>max){alert('Score must be between 0 and the maximum score.');return}if(hasAny&&!has){alert('Enter Physics, Chemistry and Maths marks together.');return}if(has){const sm=max/3;if([p,c,m].some(x=>!isFinite(x)||x<0||x>sm)){alert('Subject marks cannot exceed one-third of the paper maximum.');return}if(p+c+m!==score){alert('Physics + Chemistry + Maths must equal the total score.');return}}S.tres.push({id:uid(),ref:v.ref||'',type,name:(v.name||'').trim()||sp.label,date:v.date||today(),score,max,mins:v.mins?+v.mins:null,sub:v.sub||'',ch:(lg&&lg.ch)||'',p,c,m,note:(v.note||'').trim()});lg=null;save();rerender()}
function trend(rs){const a=[...rs].reverse().slice(-20);if(a.length<2)return'<div class="empty">Log two tests to see your trend.</div>';
 const W=600,H=170,X=i=>34+i*(W-50)/(a.length-1),Y=p=>H-22-Math.max(0,Math.min(100,p))/100*(H-40);
 return `<div class="tw"><svg viewBox="0 0 ${W} ${H}" style="min-width:420px;width:100%">${[0,50,100].map(p=>`<line x1="34" x2="${W-8}" y1="${Y(p)}" y2="${Y(p)}" stroke="var(--ln)"/><text x="2" y="${Y(p)+4}" style="font-size:11px;fill:var(--mu)">${p}%</text>`).join('')}<polyline fill="none" stroke="var(--ac)" stroke-width="3" points="${a.map((r,i)=>X(i)+','+Y(tpct(r))).join(' ')}"/>${a.map((r,i)=>`<circle cx="${X(i)}" cy="${Y(tpct(r))}" r="${r.type==='mock'?6:4}" fill="${r.type==='mock'?'var(--m)':'var(--ac)'}"><title>${esc(r.name)}: ${tpct(r)}%</title></circle>`).join('')}</svg></div><div class="mu">Pink dots are full mocks. Hover a dot for details.</div>`}
function tests(){const T=today(),pl=plannedTests(),od=pl.filter(t=>t.due<T),td=pl.filter(t=>t.due===T),up=pl.filter(t=>t.due>T).slice(0,15),rs=[...S.tres].sort((a,b)=>a.date<b.date?1:-1),avg=rs.length?Math.round(rs.reduce((a,r)=>a+tpct(r),0)/rs.length):null,best=rs.length?Math.max(...rs.map(tpct)):null,sa=subAvg(),weak=rs.filter(r=>r.note).slice(0,6);const sec=(t,l,e)=>`<div class="card"><h3 style="margin-bottom:6px">${t} <span class="mu">${l.length||''}</span></h3>${l.length?l.map(testRow).join(''):`<div class="empty">${e}</div>`}</div>`;return `<div class="test-hero card"><div><div class="eyebrow">SUNDAY TEST SYSTEM</div><h2>Sundays are protected for testing (except 11 Oct 2026).</h2><p class="mu">Sundays are normally reserved for tests; 11 Oct 2026 is a one-time two-block study exception. Tests still use your existing video mapping.</p></div><div class="next-test"><span class="mu">Next test</span><b>${pl.length?fmt(pl[0].due):'—'}</b><span>${pl.length?esc(pl[0].name):'No tests planned yet.'}</span></div></div><div class="stats"><div class="stat"><b>${rs.length}</b><span class="mu">tests logged</span></div><div class="stat"><b>${avg===null?'–':avg+'%'}</b><span class="mu">average score</span></div><div class="stat"><b>${best===null?'–':best+'%'}</b><span class="mu">best score</span></div><div class="stat"><b class="${od.length?'late':''}">${od.length+td.length}</b><span class="mu">due now</span></div></div>${logForm()}${sec('Overdue',od,'Nothing overdue.')} ${sec('Due today',td,'No test due today.')} ${sec('Upcoming',up,'All automatic tests are planned from the existing video mapping.')}<div class="card test-guide"><h3>Fixed test structure</h3><p class="mu">Every Sunday uses the same deterministic test order. There is no limit to how many tests may fall on one Sunday, and automatic tests cannot be postponed or skipped. Weekly tests are the chapter-check layer: every chapter completed by the test date is included, so there is no separate Chapter Mastery Test.</p><div class="test-rule-grid"><div><b>1 · Subject Progress</b><span>300 marks · 75 questions · after every 3 chapters in each subject.</span></div><div><b>2 · Weekly Progress</b><span>180 marks · 45 questions · every Sunday, covering every chapter completed by the test date.</span></div><div><b>3 · Monthly Full Mock</b><span>360 marks · 90 questions · all PCM work completed by that Sunday.</span></div><div><b>4 · Final Subject Tests</b><span>300 marks · 75 questions · five cumulative tests after each subject finishes.</span></div></div><p class="mu" style="margin-top:12px">After each subject finishes, five Final Subject Tests are placed on the next five Sundays. All tests are planned from the existing video mapping; the app does not generate new lecture or syllabus data.</p></div></div>`}
function testCards(){const T=today(),pl=plannedTests(),due=pl.filter(t=>t.due<=T),shown=due.length?due.slice(0,3):pl.slice(0,2),rs=[...S.tres].sort((a,b)=>a.date<b.date?1:-1),l8=rs.slice(0,8).reverse();
 return `<div class="grid"><div class="card"><div style="display:flex;justify-content:space-between"><h3>Tests</h3><button class="btn g s" data-a="tab" data-v="test">Open</button></div>${shown.length?shown.map(t=>{const d=diff(T,t.due);return `<div class="row"><div class="t"><b>${esc(t.name)}</b><div class="mu">${d<0?'<span class="late">overdue</span>':d===0?'due today':'on '+fmt(t.due)}</div></div><button class="btn s" data-a="tlog" data-key="${esc(t.key)}">Log</button></div>`}).join(''):'<div class="empty">No tests planned yet. Complete a chapter and its test appears here.</div>'}</div>
 <div class="card"><h3>Test scores</h3>${rs.length?`<div class="big" style="margin-top:4px">${Math.round(rs.reduce((a,r)=>a+tpct(r),0)/rs.length)}%<span> average of ${rs.length} test${rs.length>1?'s':''}</span></div><div class="mu" style="margin:4px 0">Last: ${esc(rs[0].name)}, ${tpct(rs[0])}%</div><div class="wk">${l8.map(r=>`<div><span>${tpct(r)}</span><u style="height:${Math.max(3,Math.min(100,tpct(r)))}%;background:${r.type==='mock'?'var(--m)':'var(--ac)'}"></u></div>`).join('')}</div>`:'<div class="empty">Log your first test to see scores here.</div>'}</div></div>`}

function set(){const dn=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
 return `<div class="card"><h3 style="margin-bottom:10px">About you</h3><div class="f"><div><span class="mu">Name</span><input data-a="field" data-k="name" value="${esc(S.name)}"></div><div><span class="mu">Exam date</span><input type="date" data-a="field" data-k="exam" value="${esc(S.exam)}"></div><div><span class="mu">Appearance</span><div class="btn g s" style="cursor:default">Dark mode</div></div></div></div>
 <div class="card"><h3 style="margin-bottom:6px">Daily plan</h3><p class="mu" style="margin:0 0 10px">Changes apply from tomorrow. Press "Rebuild today's videos" in the Planner to apply them now.</p><div class="f"><div><span class="mu">Plan start date</span><input type="date" data-a="field" data-k="planStart" value="${esc(S.planStart)}"></div><div><span class="mu">Daily lecture blocks</span><div class="btn g s" style="cursor:default">One continuous 6-hour block</div><span class="mu">Monday–Saturday: Physics 2h + Chemistry 2h + Maths 2h. Each subject follows its own chapter order; whole videos only at 1.5× playback using playlist-average durations. If a video does not fit, it carries forward for that subject. Use any remaining time for revision or question practice.</span></div><div class="protected-day"><span class="mu">Protected day</span><b>Sunday</b><span class="mu">Existing Sunday test/rest system; no regular lecture block</span></div><div><span class="mu">Days kept for revision before exam</span><input type="number" min="0" max="365" data-a="nfield" data-k="buffer" value="${+S.buffer||0}"></div></div>
 <div class="row" style="border:0;margin-top:6px"><span class="mu">Monday–Saturday: one continuous 6-hour block, with 2 hours each for Physics, Chemistry and Maths. Sundays remain test/rest days.</span></div></div>
 <div class="card test-settings"><div class="test-setting-head"><div><div class="eyebrow">TEST DAY</div><h3>Sunday is your test day</h3><p class="mu">Sundays are normally reserved for Subject Progress Tests, Weekly Progress Tests and Monthly Full Mocks; Weekly tests absorb chapter-level checking instead of creating separate Chapter Mastery Tests.</p></div><div class="sun-badge">SUN</div></div><div class="test-rules"><span>Subject Progress → every 3 chapters</span><span>Weekly Progress → every Sunday</span><span>Monthly Full Mock → first Sunday</span></div></div>
 <div class="card"><h3>Your data</h3><p class="mu">Progress is kept locally for offline use. When you sign in, your tracker state is also synced to your private cloud account.</p><div class="btns"><button class="btn g" data-a="dl">Download backup</button><label class="btn g">Import a backup<input type="file" accept=".json,application/json" data-a="import" hidden></label><button class="btn g" data-a="resetall">Reset everything</button></div></div>`}

/* ---------- calendar: every date until the end ---------- */
const EMPTYDAY=()=>({pl:[],dn:[],rv:[],rp:[],ts:[],tr:[]});
function calData(){if(CAL)return CAL;const T=today(),m={},g=d=>m[d]||(m[d]=EMPTYDAY());
 S.chapters.forEach(c=>c.lects.forEach((l,i)=>{if(l.d)g(l.d).dn.push({sub:c.sub,c:c.id,i})}));
 PLAN.today.forEach(x=>g(T).pl.push(x));PLAN.days.forEach(d=>d.slots.forEach(x=>g(d.date).pl.push(x)));
 revItems().forEach(r=>g(r.due).rv.push(r));
 const cd=chapDates(PLAN);S.chapters.forEach(c=>{if(c.doneOn)return;const e=cd[c.id]&&cd[c.id].e;if(e)CYCLES.forEach((cy,k)=>g(addD(e,cy[0])).rp.push({c,k}))});
 plannedTests().forEach(t=>g(t.due).ts.push(t));S.tres.forEach(r=>g(r.date).tr.push(r));
 return CAL=m}
function calMonths(){const T=today(),m=calData(),ds=Object.keys(m).sort();
 // Calendar starts with the current month; do not include any earlier months.
 const first=T.slice(0,7)+'-01';
 let last=ds.length?ds[ds.length-1]:T;if(S.exam&&S.exam>last)last=S.exam;if(PLAN.end&&PLAN.end>last)last=PLAN.end;if(diff(T,last)>900)last=addD(T,900);
 const out=[];let y=+first.slice(0,4),mo=+first.slice(5,7);const ly=+last.slice(0,4),lm=+last.slice(5,7);
 while(y<ly||(y===ly&&mo<=lm)){out.push([y,mo]);if(++mo>12){mo=1;y++}}return out}
function calCell(d,m,T){const o=m[d]||EMPTYDAY();
 const dots=SUBS.map(s=>{let st='';if(d<T){if(o.dn.some(x=>x.sub===s.id))st='f'}else{const pl=o.pl.filter(x=>x.sub===s.id);if(pl.length)st=pl.every(x=>{const c=chap(x.c);return c&&c.lects[x.i]&&c.lects[x.i].d})?'f':'o';else if(d===T&&o.dn.some(x=>x.sub===s.id))st='f'}
  return st?`<i class="dt ${st}" style="color:${s.c}"></i>`:''}).join('');
 const pend=o.rv.filter(r=>!r.done).length,bd=[pend?`<span class="b r">R${pend}</span>`:o.rv.length?'<span class="b">R&#10003;</span>':'',o.rp.length?`<span class="b p">r${o.rp.length}</span>`:'',o.ts.length?`<span class="b t">T${o.ts.length}</span>`:o.tr.length?'<span class="b">T&#10003;</span>':''].join('');
 const missed=d<T&&d>=(S.planStart||T)&&!isRest(d)&&!o.dn.length;
 const cls=[d===T?'td':'',isRest(d)?'rs':'',new Date(d+'T00:00').getDay()===0?'sun':'',missed?'ms':'',d===selDay?'sl':'',d===S.exam?'ex':'',PLAN.end===d?'en':''].join(' ');
 return `<button class="cd ${cls}" data-a="cday" data-d="${d}" aria-label="${fmtL(d)}"><span class="dn">${+d.slice(8)}${d===S.exam?' EXAM':PLAN.end===d?' END':''}</span><span class="dots">${dots}</span><span class="bds">${bd}</span></button>`}
function monthCard(y,mo){const T=today(),m=calData(),first=new Date(y,mo-1,1),dim=new Date(y,mo,0).getDate(),lead=(first.getDay()+6)%7,id=y+'-'+String(mo).padStart(2,'0');
 let cells='',done=0,plan=0;for(let i=0;i<lead;i++)cells+='<span></span>';
 for(let d=1;d<=dim;d++){const ds=id+'-'+String(d).padStart(2,'0'),o=m[ds];if(ds<T){cells+='<span></span>';continue}if(o){done+=o.dn.length;if(ds>T)plan+=o.pl.length;else if(ds===T)plan+=o.pl.filter(x=>{const c=chap(x.c);return c&&!c.lects[x.i].d}).length}cells+=calCell(ds,m,T)}
 return `<div class="card" id="m-${id}"><div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:6px"><h3>${first.toLocaleDateString('en-IN',{month:'long',year:'numeric'})}</h3><span class="mu">${done?done+' done':''}${done&&plan?' · ':''}${plan?plan+' planned':''}</span></div><div class="calh" style="margin-top:8px"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div><div class="cal">${cells}</div></div>`}
const doneRow=x=>{const c=chap(x.c);return c?`<div class="row dn"><span class="dot" style="background:${col(x.sub)}"></span><div class="t"><b>${esc(c.name)}</b><div class="mu">${subName(x.sub)} · Lecture ${x.i+1} of ${c.lects.length} · done</div></div></div>`:''};
const planRow=x=>{const c=chap(x.c);if(!c)return'';const slot=x.slot?`<span class="tag" style="margin-left:6px">${esc(x.slot)}</span>`:'';return `<div class="row"><span class="dot" style="background:${col(x.sub)}"></span><div class="t"><b>${esc(c.name)}${slot}</b><div class="mu">${subName(x.sub)} · Video ${x.i+1} of ${c.lects.length} · est. ${Math.round(videoEstimate(c)/60)} min</div></div>${watchBtn(c)}</div>`};
function daySheet(d){const T=today(),o=calData()[d]||EMPTYDAY(),tags=[];
 if(d===T)tags.push('Today');if(isRest(d))tags.push('Rest day');if(d===S.exam)tags.push('EXAM DAY');if(PLAN.end===d)tags.push('Last video of the syllabus is planned today');if(S.planStart&&d>=S.planStart)tags.push('Day '+(diff(S.planStart,d)+1)+' of the plan');
 let lect;if(d===T){const ids=new Set(PLAN.today.map(x=>x.c+'_'+x.i));lect=PLAN.today.map(slotRow).join('')+o.dn.filter(x=>!ids.has(x.c+'_'+x.i)).map(doneRow).join('')}
 else if(d<T)lect=o.dn.map(doneRow).join('')||`<div class="mu">${isRest(d)?'Rest day.':'No videos were ticked on this day.'}</div>`;
 else lect=o.pl.map(planRow).join('')||`<div class="mu">${isRest(d)?'Rest day.':'Nothing planned.'}</div>`;
 const sec=(t,h)=>h?`<h3 style="margin:12px 0 4px;font-size:14px">${t}</h3>${h}`:'';
 const rv=o.rv.map(revRow).join('')+o.rp.map(x=>`<div class="row"><div class="t"><b style="color:${col(x.c.sub)}">${esc(x.c.name)}</b> · Revision ${x.k+1}<div class="mu">Expected once you finish this chapter</div></div></div>`).join('');
 const ts=o.ts.map(testRow).join('')+o.tr.map(r=>`<div class="row"><div class="t"><b>${esc(r.name)}</b><div class="mu">Logged: ${r.score}/${r.max} (${tpct(r)}%)</div></div></div>`).join('');
 return `<div class="sheet"><div class="sin"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><h3>${fmtL(d)}</h3><button class="btn g s" data-a="cclose">Close</button></div><div class="mu">${tags.join(' · ')}</div>${sec('Videos',lect)}${sec('Revision',rv)}${sec('Tests',ts)}</div></div>`}
function cal(){const T=today(),mo=calMonths(),dl=S.exam?diff(T,S.exam):null,key=(y,m)=>y+'-'+String(m).padStart(2,'0');
 const mn=(y,m)=>new Date(y,m-1,1).toLocaleDateString('en-IN',{month:'short'})+" '"+String(y).slice(2);
 return `<div class="card"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px"><h3>Calendar</h3><span class="mu">${PLAN.end?'Syllabus ends '+fmtL(PLAN.end):'Syllabus complete'}${dl>0?' · exam '+fmtL(S.exam)+' ('+dl+' days)':''}</span></div>
 <div class="mu" style="margin-top:6px;line-height:1.9">Tap a day for its videos, revisions and tests. Dots are Physics, Chemistry and Maths: <i class="dt f" style="color:var(--ac)"></i> done, <i class="dt o" style="color:var(--ac)"></i> planned. <span class="b r">R2</span> revisions due, <span class="b p">r2</span> revisions expected after the chapter is finished, <span class="b t">T1</span> tests. A red top edge is a missed day and grey is a rest day.</div>
 <div class="chips" style="margin:10px 0 0"><button class="chip on" data-a="cmonth" data-v="${T.slice(0,7)}">Today</button>${mo.map(x=>`<button class="chip" data-a="cmonth" data-v="${key(x[0],x[1])}">${mn(x[0],x[1])}</button>`).join('')}</div></div>
 ${mo.map(x=>monthCard(x[0],x[1])).join('')}${selDay?'<div style="height:48vh"></div>'+daySheet(selDay):''}`}
const V={dash,plan,cal,lec,rev,test:tests,set};
const timeStr=()=>new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
const dateStr=()=>new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
function subLine(){const T=today(),start=S.planStart||T,dl=S.exam?diff(T,S.exam):null;if(T<start)return 'Plan starts '+fmt(start)+(PLAN&&PLAN.end?' · ends '+fmt(PLAN.end):'');const n=Math.max(1,diff(start,T)+1);return 'Day '+n+' of the plan'+(PLAN&&PLAN.end?' (ends '+fmt(PLAN.end)+')':'')+' · '+(dl===null?'add your exam date in Settings':dl>0?dl+' days to the exam':dl===0?'exam day':'exam date has passed')}
function head(){return `<div class="top"><div><h1>${S.name?esc(S.name)+"'s ":''}Jee OS</h1><div class="mu" id="sub">${esc(subLine())}</div></div><div class="clk"><div class="clkt" id="clk">${timeStr()}</div><div class="mu" id="dts">${dateStr()}</div></div><div class="btns" style="align-items:center"><span class="authuser">${cloudUser?esc(cloudUser.email):'Not signed in'}</span>${cloudUser?'<button class="btn g s" data-a="signout">Sign out</button>':'<button class="btn s" data-a="auth">Cloud Sync</button>'}</div><span id="pill" class="pill ${pill}">${pillHTML()}</span></div>${err?`<div class="card err">${esc(err)}</div>`:''}${noteHTML()}`}
function render(){const t=S.theme;if(t)document.documentElement.dataset.theme=t;else delete document.documentElement.dataset.theme;
 lastDay=today();PLAN=buildPlan();CAL=null;
 document.getElementById('top').innerHTML=head();
 document.getElementById('nav').innerHTML=TABS.map(x=>`<button class="${tab===x[0]?'on':''}" data-a="tab" data-v="${x[0]}">${x[1]}${badge(x[0])}</button>`).join('');
 document.getElementById('app').innerHTML=V[tab]();if(tab==='lec')applySearch();if(tab==='cal'&&calScroll){calScroll=false;const e=document.getElementById('m-'+today().slice(0,7));if(e)e.scrollIntoView()}}
function rerender(){const y=scrollY;render();scrollTo(0,y)}
function applySearch(){const t=q.trim().toLowerCase();let n=0;document.querySelectorAll('details.ch').forEach(d=>{const hide=t&&!d.dataset.n.includes(t);d.style.display=hide?'none':'';if(!hide)n++});const e=document.getElementById('cnt');if(e)e.textContent=n+' chapters'}
setInterval(()=>{const a=document.getElementById('clk');if(a)a.textContent=timeStr();if(lastDay&&today()!==lastDay){rerender();return}const d=document.getElementById('dts');if(d)d.textContent=dateStr()},1000);

/* ---------- events ---------- */
document.addEventListener('click',e=>{const el=e.target.closest('[data-a]');if(!el||['INPUT','SELECT','TEXTAREA'].includes(el.tagName))return;const a=el.dataset.a,id=el.dataset.id,c=chap(id);
 if(a==='tab'){tab=el.dataset.v;const cs=tab==='cal';if(cs)calScroll=true;render();if(!cs)scrollTo(0,0)}
 else if(a==='cday'){selDay=selDay===el.dataset.d?null:el.dataset.d;rerender()}
 else if(a==='cclose'){selDay=null;rerender()}
 else if(a==='cmonth'){const e=document.getElementById('m-'+el.dataset.v);if(e)e.scrollIntoView({behavior:'smooth'})}
 else if(a==='filt'){filt=el.dataset.v;render()}
 else if(a==='rfilt'){rfilt=el.dataset.v;render()}
 else if(a==='gochap'&&c){tab='lec';q=c.name;filt='all';open[id]=true;render();scrollTo(0,0)}
 else if(a==='more'){moreFor(el.dataset.v);rerender()}
 else if(a==='rebuild'){const sl=S.td?S.td.slots:[];if(sl.some(x=>{const k=chap(x.c);return k&&k.lects[x.i]&&k.lects[x.i].d})&&!confirm('Some of today\'s videos are already done. Rebuilding replaces today\'s list (your ticks stay). Continue?'))return;S.td=null;save();rerender()}
 else if(a==='snz'){const k=id+'_'+el.dataset.k;S.snz[k]=(S.snz[k]||0)+1;save();rerender()}
 else if(a==='focus'&&c){if(S.focus[c.sub]===id)delete S.focus[c.sub];else S.focus[c.sub]=id;open[id]=true;save();rerender()}
 else if(a==='all'&&c){c.lects.forEach(l=>{if(!l.d)l.d=today()});recheck(c);open[id]=true;save();rerender()}
 else if(a==='reset'&&c){if(confirm('Mark every video in this chapter as not done?')){c.lects.forEach(l=>l.d=null);recheck(c);open[id]=true;save();rerender()}}
 else if(a==='setn'&&c){const v=prompt('How many videos does "'+c.name+'" have?',c.lects.length);if(v===null)return;const n=Math.round(+v);if(!(n>=0&&n<=300)){alert('Enter a number from 0 to 300.');return}
  if(c.lects.slice(n).some(l=>l.d)&&!confirm('This removes videos that are already ticked. Continue?'))return;if(n>c.lects.length&&!reopenOk(c))return;
  c.lects=[...Array(n)].map((_,i)=>c.lects[i]||{d:null});recheck(c);open[id]=true;S.td=null;save();rerender()}
 else if(a==='del'&&c){if(confirm('Delete "'+c.name+'" and its progress?')){S.chapters=S.chapters.filter(x=>x.id!==id);delete S.rev[id];clearSnz(id);S.td=null;save();rerender()}}
 else if(a==='tpl')copyTemplate()
 else if(a==='tlog'){const t=plannedTests().find(x=>x.key===el.dataset.key);if(t){lg={ref:t.key,name:t.name,type:t.type,ch:t.ch||'',sub:t.sub||''};tab='test';render();scrollTo(0,0)}}
 else if(a==='tcancel'){lg=null;rerender()}
 else if(a==='tdel'){if(confirm('Delete this test result?')){S.tres=S.tres.filter(r=>r.id!==id);save();rerender()}}
 else if(a==='resetall'){if(confirm('Delete ALL progress and start again from the PCM syllabus?')&&confirm('Really sure? Download a backup first if unsure.')){S=seed();save();render()}}
 else if(a==='auth'){authOpen()}
 else if(a==='authclose'){authClose()}
 else if(a==='signin'){authSignIn()}
 else if(a==='signup'){authSignUp()}
 else if(a==='signout'){authSignOut()}
 else if(a==='dl'){const l=document.createElement('a');l.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:'application/json'}));l.download='jee-backup-'+today()+'.json';l.click()}
});
document.addEventListener('change',e=>{const el=e.target.closest('[data-a]');if(!el)return;const a=el.dataset.a;
 if(a==='lec')setLect(el.dataset.id,+el.dataset.i,el.checked)
 else if(a==='rev')setRev(el.dataset.id,+el.dataset.k,el.checked)
 else if(a==='note'){const c=chap(el.dataset.id);if(c){c.note=el.value;save()}}
 else if(a==='clink'){const c=chap(el.dataset.id);if(c){c.url=el.value.trim();open[c.id]=true;save();rerender()}}
 else if(a==='import')importFile(el.files[0])
 else if(a==='field'){const k=el.dataset.k;S[k]=k==='theme'?'dark':el.value;save();if(['theme','name','exam','planStart'].includes(k))render()}
 else if(a==='nfield'){const k=el.dataset.k;S[k]=k==='rest'?+el.value:Math.max(k==='perDay'?1:0,+el.value||0);save();render()}
 else if(a==='bfield'){S.balance=el.checked;save();render()}
 else if(a==='tfield'){S[el.dataset.k]=Math.max(0,+el.value||0);save()}
});
document.addEventListener('input',e=>{if(e.target.id==='search'){q=e.target.value;applySearch()}});
document.addEventListener('toggle',e=>{const d=e.target;if(!d.classList||!d.classList.contains('ch'))return;const id=d.dataset.id;open[id]=d.open;
 if(d.open){const c=chap(id),box=d.querySelector('.in');if(c&&box&&!box.innerHTML)box.innerHTML=rows(c)}},true);
document.addEventListener('submit',e=>{e.preventDefault();const f=e.target,v=Object.fromEntries(new FormData(f));
 if(f.id==='addch'){const name=v.name.trim();if(!name)return;S.chapters.push({id:uid(),sub:v.sub,name,url:(v.url||'').trim(),custom:1,lects:[...Array(Math.max(1,Math.min(200,+v.n||1)))].map(()=>({d:null}))});filt='all';S.td=null;save();rerender()}
 else if(f.id==='links'){const r=bulkLinks(v.text);lmsg=r.ok+' link'+(r.ok===1?'':'s')+' saved.'+(r.nolink?' '+r.nolink+' row'+(r.nolink>1?'s':'')+' without a link were skipped.':'')+(r.bad.length?' Could not use '+r.bad.length+': '+r.bad.slice(0,4).join('; ')+(r.bad.length>4?' and more':''):'');if(r.ok)save();rerender()}
 else if(f.id==='logt')logTest(v)
});
boot();
