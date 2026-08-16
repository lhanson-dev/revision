(function(){
const BASELINE_QUESTIONS=18;

// Make the purpose of the old "Connect" mode obvious to a student.
function relabelConnections(){
  document.querySelectorAll('#nav button').forEach(b=>{if(b.dataset.v==='mindmap')b.textContent='Link topics'});
  document.querySelectorAll('#mobileNav button').forEach(b=>{if(b.textContent.trim()==='Connect')b.textContent='Link topics'});
  document.querySelectorAll('.mode').forEach(m=>{const b=m.querySelector('b');if(b&&b.textContent.trim()==='Connect'){b.textContent='Link topics';const s=m.querySelector('span');if(s)s.textContent='See cause-and-effect links';}});
  const v=document.getElementById('mindmap');
  if(v){const eye=v.querySelector('.eyebrow'),h=v.querySelector('.title'),p=v.querySelector('.subtitle');if(eye)eye.textContent='Link topics';if(h)h.textContent='See how business decisions connect';if(p)p.textContent='Use this for 9, 16 and 20-mark answers: see how a change in one area affects costs, people, customers, operations and profit.';}
}

// Add harder, contextual quick-check questions. Existing questions remain useful foundation checks.
const challengeQuestions=[
{t:'business',d:2,q:'A market grows by 18% while a firm’s sales grow by 7%. Which conclusion is most likely?',o:['The firm has gained market share','The firm has probably lost market share','The market has shrunk','The firm must have made a loss'],a:1,e:'The firm is growing more slowly than the total market, so its share is likely to fall.'},
{t:'business',d:3,q:'A profitable LTD wants rapid expansion but its owners refuse new shareholders and want to keep dividends high. Which constraint is most likely to limit growth?',o:['Too much retained profit','Limited retained profit and equity finance','Unlimited liability','A guaranteed rise in market share'],a:1,e:'High dividends reduce retained profit, while refusing new equity narrows the available funding routes.'},
{t:'business',d:3,q:'Interest rates rise sharply. Which combination is most likely for a highly geared retailer selling discretionary products?',o:['Lower finance costs and stronger demand','Higher finance costs and potentially weaker consumer demand','No effect on costs or demand','Guaranteed higher profit'],a:1,e:'Borrowing may cost more while indebted consumers may reduce discretionary spending.'},
{t:'leadership',d:2,q:'A stakeholder has high power but currently low interest in a decision. A sensible response is to:',o:['Ignore them completely','Keep them satisfied and monitor changes in interest','Give them all operational decisions','Treat them as low power'],a:1,e:'Power–interest analysis suggests keeping high-power stakeholders satisfied even when current interest is low.'},
{t:'leadership',d:3,q:'A project has a 70% chance of generating £180k and a 30% chance of losing £40k. It costs £90k to launch. What is the expected net gain?',o:['£24k','£114k','£126k','£216k'],a:0,e:'Expected value = 0.7×180 + 0.3×(−40) = £114k. Net gain = £114k − £90k = £24k.'},
{t:'leadership',d:3,q:'A skilled design team must create a new product quickly, but staff have more technical expertise than the manager. Which approach is strongest?',o:['Pure autocratic control in all decisions','Greater employee freedom/input with clear deadlines and accountability','No leadership or objectives','Paternalistic decisions with no employee information'],a:1,e:'Expert staff knowledge makes involvement/freedom valuable, while deadlines still require coordination and accountability.'},
{t:'marketing',d:2,q:'Demand for a premium service rises by 12% after consumer income rises by 4%. What does this most strongly suggest?',o:['Demand is relatively income responsive','The service is necessarily inferior','Demand is perfectly price inelastic','Income has no relationship with demand'],a:0,e:'Demand changed proportionately more than income, indicating relatively strong positive income responsiveness.'},
{t:'marketing',d:3,q:'A premium product is in maturity, competitors are entering and brand loyalty is strong. Which response is most coherent?',o:['Cut product quality and raise price','Use relationship marketing and differentiation/extension activity','Stop all promotion immediately','Adopt JIT solely to change market positioning'],a:1,e:'At maturity, retaining loyal customers and extending/differentiating the offer can defend the position against competition.'},
{t:'marketing',d:3,q:'A business cuts price by 10%. Sales volume rises 6%, while unit variable cost is unchanged. Which statement is safest?',o:['Revenue must rise','Revenue must fall slightly unless another factor offsets it','Profit must rise','Market share must fall'],a:1,e:'A 10% price fall with only a 6% volume rise normally reduces revenue; profit is even less certain because contribution per unit also falls.'},
{t:'operations',d:2,q:'Capacity rises from 20,000 to 25,000 units while output rises from 18,000 to 21,000. Capacity utilisation changes from:',o:['90% to 84%','84% to 90%','72% to 95%','90% to 105%'],a:0,e:'18,000/20,000 = 90%; 21,000/25,000 = 84%. Capacity rose faster than output.'},
{t:'operations',d:3,q:'A factory increases labour productivity but customer complaints also rise. Which evaluation is strongest?',o:['Productivity proves operations improved overall','Higher output per worker may have been achieved at the expense of quality','Complaints cannot be linked to operations','Unit costs must have risen'],a:1,e:'Productivity is only one performance measure; pushing output can damage quality and customer outcomes.'},
{t:'operations',d:3,q:'Daily component usage is stable but supplier lead time doubles. What is the strongest inventory implication?',o:['Reorder later','A higher reorder level may be needed','Buffer stock should always be zero','Maximum inventory must halve'],a:1,e:'If replenishment takes longer, ordering earlier helps stock last until the delivery arrives.'},
{t:'finance',d:2,q:'Gross profit margin rises from 38% to 42% but operating profit margin falls from 14% to 10%. Which is most plausible?',o:['Cost of sales improved but operating expenses rose sharply','Revenue must be zero','Fixed costs cannot have changed','Cash flow must be positive'],a:0,e:'A stronger gross margin alongside a weaker operating margin suggests operating expenses increased relative to revenue.'},
{t:'finance',d:3,q:'Fixed costs are £150,000. Price rises from £25 to £28 while variable cost stays £13. What happens to break-even output?',o:['It rises from 12,500 to 15,000','It falls from 12,500 to 10,000','It stays at 12,500','It falls to 5,357'],a:1,e:'Old contribution £12 → break-even 12,500. New contribution £15 → break-even 10,000.'},
{t:'finance',d:3,q:'A business opens Month 1 with £6k. Month 1 net cash flow is −£9k and Month 2 net cash flow is +£5k. What is the Month 2 closing balance if no finance is raised?',o:['£2k','−£3k','£11k','−£8k'],a:0,e:'Month 1 closes at −£3k. Adding Month 2 net inflow of £5k gives a £2k closing balance.'},
{t:'hr',d:2,q:'A firm’s labour turnover rises while unemployment in its local labour market falls sharply. Which link is most plausible?',o:['Recruitment and retention may become harder','Wage pressure must disappear','Labour supply must increase','Training becomes unnecessary'],a:0,e:'A tighter labour market gives employees more alternatives and can increase recruitment and retention pressure.'},
{t:'hr',d:3,q:'Employee costs rise 12% while output rises 20% and labour cost per unit falls. Which judgement is strongest?',o:['The pay rise necessarily damaged efficiency','Higher total employee cost can coexist with improved labour cost efficiency','Output growth proves motivation fell','The business must reduce staffing'],a:1,e:'Total labour cost can rise while cost per unit falls if output/productivity rises faster.'},
{t:'hr',d:3,q:'Automation threatens redundancies in a business already suffering high skilled-worker turnover. Which implementation choice best balances speed and people risk?',o:['Announce redundancies with no consultation','Consult employees on implementation while retaining a clear management decision deadline','Cancel all technology permanently','Delegate the investment decision entirely to new recruits'],a:1,e:'Targeted consultation can improve information and acceptance without removing management accountability or urgency.'}
];
questions.forEach(q=>{if(q.d==null){q.d=/calculate|formula|capacity utilisation|break-even|contribution|turnover is|market share is|closing balance|variance/i.test(q.q)?2:1;}});
challengeQuestions.forEach(q=>{if(!questions.some(x=>x.q===q.q))questions.push(q)});

function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function priorAccuracy(){const rows=Object.entries(state.quiz).filter(([i])=>questions[Number(i)]);if(rows.length<5)return null;return rows.filter(([,v])=>v===1).length/rows.length;}
function pick(level,n,used){const pool=shuffle(questions.map((q,i)=>({q,i})).filter(x=>(x.q.d||1)===level&&!used.has(x.i)));const out=pool.slice(0,n).map(x=>x.i);out.forEach(i=>used.add(i));return out;}

// Mixed tests adapt between attempts: stronger prior performance shifts more questions into challenge difficulty.
const previousStartTest=startTest;
startTest=function(){
  testStarted=true;testScore=0;testPos=0;answered=false;
  const acc=priorAccuracy(),used=new Set();
  const mix=acc===null?[3,4,3]:acc>=.8?[1,4,5]:acc>=.6?[2,5,3]:[4,4,2];
  testList=[...pick(1,mix[0],used),...pick(2,mix[1],used),...pick(3,mix[2],used)];
  while(testList.length<10){const rest=shuffle(questions.map((q,i)=>i).filter(i=>!used.has(i)));if(!rest.length)break;const i=rest[0];used.add(i);testList.push(i)}
  renderQuestion();
};

const previousRenderQuestion=renderQuestion;
renderQuestion=function(){
  previousRenderQuestion();
  if(testPos<testList.length){const q=questions[testList[testPos]],top=document.querySelector('#quickTest .flash-top');if(top&&!top.querySelector('.difficulty')){const names={1:'Foundation',2:'Applied',3:'Challenge'};top.insertAdjacentHTML('beforeend',`<span class="tag difficulty">${names[q.d||1]}</span>`);}}
};

function evidence(){
 const rows=Object.entries(state.quiz).filter(([i])=>questions[Number(i)]);
 const topicsTouched=new Set(rows.map(([i])=>questions[Number(i)].t)).size;
 const diagnosticDone=(state.v2?.diagnostics?.length||0)>0;
 const examDone=(state.v2?.examAttempts?.length||0)>0;
 return{questions:rows.length,topicsTouched,diagnosticDone,examDone,baselineReady:diagnosticDone||(rows.length>=BASELINE_QUESTIONS&&topicsTouched===Object.keys(topics).length)||examDone};
}
function cardStats(k){const ids=flashcards.map((c,i)=>[c,i]).filter(x=>x[0][0]===k).map(x=>x[1]);const seen=ids.filter(i=>state.cards[i]);return{count:seen.length,score:seen.length?seen.reduce((s,i)=>s+(state.cards[i].score||0),0)/(seen.length*2)*100:null};}
function quizStats(k){const r=Object.entries(state.quiz).filter(([i])=>questions[Number(i)]?.t===k);return{count:r.length,score:r.length?r.filter(([,v])=>v===1).length/r.length*100:null};}
function examStats(k){let got=0,max=0;(state.v2?.examAttempts||[]).slice(-3).forEach(a=>{got+=a.topic?.[k]||0;max+=a.topicMax?.[k]||0});return{max,score:max?got/max*100:null};}
function topicReadiness(k){const c=cardStats(k),q=quizStats(k),ex=examStats(k);let knowledge=null;if(q.score!==null&&c.score!==null)knowledge=q.score*.75+c.score*.25;else knowledge=q.score??c.score;if(knowledge===null&&ex.score===null)return null;if(ex.score!==null&&knowledge!==null)return Math.round(knowledge*.55+ex.score*.45);if(ex.score!==null)return Math.round(ex.score*.85);return Math.round(knowledge*.70);}
function overallReadiness(){const vals=Object.keys(topics).map(topicReadiness).filter(v=>v!==null);return vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):0;}
function topicEnough(k){const q=quizStats(k),c=cardStats(k),ex=examStats(k);return ex.max>0||q.count>=3||c.count>=5;}
function readinessLabel(p){return p<45?'Needs targeted repair':p<60?'Developing':p<75?'Building exam readiness':p<85?'Secure':'Strong';}

function patchDashboard(){
 relabelConnections();
 const ev=evidence(),ready=document.getElementById('readiness'),ring=document.getElementById('ring'),status=document.getElementById('statusLine'),next=document.getElementById('nextText');
 const label=ring?.parentElement?.querySelector('.eyebrow');
 if(!ready||!ring)return;
 if(!ev.baselineReady){
   const pct=Math.min(100,Math.round(ev.questions/BASELINE_QUESTIONS*100));ring.style.setProperty('--pct',pct+'%');ready.textContent=`${Math.min(ev.questions,BASELINE_QUESTIONS)}/${BASELINE_QUESTIONS}`;if(label)label.textContent='Baseline evidence';if(status)status.textContent='Building baseline';if(next)next.textContent=`${ev.questions} of ${BASELINE_QUESTIONS} diagnostic checks recorded across ${ev.topicsTouched} of 6 topics. Readiness will appear once there is enough evidence.`;
 }else{
   const p=overallReadiness();ring.style.setProperty('--pct',p+'%');ready.textContent=p+'%';if(label)label.textContent='Exam readiness';if(status)status.textContent=readinessLabel(p);
 }
 const cards=[...document.querySelectorAll('#topicGrid .topic-card')];Object.keys(topics).forEach((k,i)=>{const card=cards[i];if(!card)return;const b=card.querySelector('.topic-head b'),bar=card.querySelector('.bar i'),small=card.querySelector('.small'),q=quizStats(k),c=cardStats(k),ex=examStats(k);if(!topicEnough(k)){if(b)b.textContent='—';if(bar)bar.style.width='0%';if(small)small.textContent=`Building evidence · ${q.count} question${q.count===1?'':'s'} · ${c.count} flashcard${c.count===1?'':'s'}`;}else{const p=topicReadiness(k);if(b)b.textContent=p+'%';if(bar)bar.style.width=p+'%';if(small)small.textContent=`Evidence: ${q.count} questions · ${c.count} flashcards${ex.max?' · exam marks included':''}`;}});
}

const currentRenderDashboard=renderDashboard;
renderDashboard=function(){currentRenderDashboard();patchDashboard();};

if(window.renderProgressV2){
 const currentProgress=window.renderProgressV2;
 window.renderProgressV2=function(){currentProgress();const ev=evidence(),metrics=[...document.querySelectorAll('#progressBody .v2-metric')];if(metrics[0]){const strong=metrics[0].querySelector('strong'),span=metrics[0].querySelector('span');if(!ev.baselineReady){strong.textContent=`${Math.min(ev.questions,BASELINE_QUESTIONS)}/${BASELINE_QUESTIONS}`;span.textContent='Baseline evidence collected';}else{strong.textContent=overallReadiness()+'%';span.textContent='Exam readiness';}}const body=document.getElementById('progressBody');if(body&&!body.querySelector('.baseline-note'))body.insertAdjacentHTML('afterbegin',`<div class="callout baseline-note" style="margin-bottom:14px"><strong>How this works:</strong> progress is evidence, not clicks. The site waits for coverage across the syllabus before showing a readiness score, then combines knowledge checks with exam performance.</div>`);};
}

// Clarify the quick-test purpose in the interface.
const quickTab=document.getElementById('quickTab');if(quickTab)quickTab.textContent='Adaptive 10-question check';
const testView=document.getElementById('test');if(testView){const p=testView.querySelector('.subtitle');if(p)p.textContent='Use the adaptive quick check for recall and applied calculations. It becomes more challenging as your results improve; use Case Study and Exam for full Paper 2 analysis and evaluation.';}

patchDashboard();
})();