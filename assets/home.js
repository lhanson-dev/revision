const client=supabase.createClient(
  "https://xwwhshpmeogswxfjtpvq.supabase.co",
  "sb_publishable_N4uw63Yo5_dHLo04C5Tw_g_o8OMXTmG",
  {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}
);

const MODULE_ID="business-aqa-as-paper-2";
const MODULE_URL="subjects/business/aqa-as/paper-2/";
let currentUser=null;
let evidenceSummary=null;
let currentState=null;
let typeTimer=null;
let revInitialTyped=false;

function prefersReducedMotion(){
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function setRevCopy(titleText,messageText,{typing=false}={}){
  const title=document.getElementById("revTitle");
  const message=document.getElementById("revMessage");
  if(!title||!message)return;
  title.textContent=titleText;
  clearInterval(typeTimer);
  message.classList.remove("typing");
  if(!typing||prefersReducedMotion()){
    message.textContent=messageText;
    return;
  }
  message.textContent="";
  message.classList.add("typing");
  let i=0;
  typeTimer=setInterval(()=>{
    i++;
    message.textContent=messageText.slice(0,i);
    if(i>=messageText.length){
      clearInterval(typeTimer);
      typeTimer=null;
      message.classList.remove("typing");
    }
  },18);
}

function msg(text,error=false){
  const el=document.getElementById("message");
  el.textContent=text;
  el.style.color=error?"#b43852":"#66708f";
}

function friendlyName(user){
  const meta=user?.user_metadata||{};
  const explicit=meta.first_name||meta.given_name||meta.name;
  if(explicit){
    const first=String(explicit).trim().split(/\s+/)[0];
    if(first)return first.charAt(0).toUpperCase()+first.slice(1);
  }
  const local=(user?.email||"").split("@")[0].replace(/[._-]+/g," ").trim();
  if(local && /^[a-zA-Z ]+$/.test(local)){
    const first=local.split(/\s+/)[0];
    if(first && first.length>1)return first.charAt(0).toUpperCase()+first.slice(1);
  }
  return "there";
}

function renderIdentity(){
  if(!currentUser)return;
  const name=friendlyName(currentUser);
  document.getElementById("desktopName").textContent=name;
  document.getElementById("drawerName").textContent=name;
  document.getElementById("drawerEmail").textContent=currentUser.email||"";
  const initial=name==="there"?"R":name.charAt(0).toUpperCase();
  document.getElementById("desktopInitial").textContent=initial;
}

function render(){
  const signedIn=!!currentUser;
  document.getElementById("authScreen").style.display=signedIn?"none":"flex";
  document.getElementById("appScreen").classList.toggle("show",signedIn);
  if(signedIn){
    renderIdentity();
    resetRev({typing:!revInitialTyped});
    revInitialTyped=true;
    loadEvidence();
  }else{
    evidenceSummary=null;
    resetRev();
  }
}

async function signIn(){
  msg("Signing in…");
  const email=document.getElementById("email").value.trim();
  const password=document.getElementById("password").value;
  const {error}=await client.auth.signInWithPassword({email,password});
  if(error)return msg(error.message,true);
}

async function signUp(){
  msg("Creating account…");
  const email=document.getElementById("email").value.trim();
  const password=document.getElementById("password").value;
  if(password.length<6)return msg("Use a password of at least 6 characters.",true);
  const {data,error}=await client.auth.signUp({
    email,password,
    options:{emailRedirectTo:"https://lhanson-dev.github.io/revision/"}
  });
  if(error)return msg(error.message,true);
  if(data.session)msg("Account created.");
  else msg("Account created. Check your email to confirm your address, then return here to sign in.");
}

async function signOut(){
  await client.auth.signOut();
  currentUser=null;
  toggleMenu(false);
  render();
}

function normaliseState(state){
  return state && typeof state==="object"
    ? {cards:state.cards||{},quiz:state.quiz||{},topic:state.topic||{},v2:state.v2||{}}
    : {cards:{},quiz:{},topic:{},v2:{}};
}

function evidenceCount(state){
  return Object.keys(state.cards||{}).length+Object.keys(state.quiz||{}).length;
}

function coveragePercent(state){
  if(typeof flashcards==="undefined"||!flashcards.length)return 0;
  const seen=new Set(Object.keys(state.cards||{}).map(Number));
  return Math.round(seen.size/flashcards.length*100);
}

function examReadinessPercent(state){
  const attempts=state?.v2?.examAttempts||[];
  if(!attempts.length)return null;
  const recent=attempts.slice(-3);
  const values=recent.map(a=>{
    const max=Number(a.max||80);
    return max>0?Number(a.score||0)/max*100:0;
  });
  return Math.round(values.reduce((s,v)=>s+v,0)/values.length);
}

function topicMastery(state,key){
  if(typeof flashcards==="undefined" || typeof questions==="undefined" || typeof topics==="undefined")return 0;
  const cards=flashcards.map((card,index)=>[card,index]).filter(([card])=>card[0]===key);
  const score=cards.reduce((total,[,index])=>total+(state.cards[index]?.score||0),0);
  const quiz=Object.entries(state.quiz||{}).filter(([index])=>questions[index]&&questions[index].t===key);
  const quizScore=quiz.length?quiz.filter(([,result])=>result===1).length/quiz.length*100:0;
  const cardPct=cards.length?score/(cards.length*2)*100:0;
  return Math.round(cardPct*.7+quizScore*.3);
}

function summariseEvidence(state){
  const keys=typeof topics==="undefined"?[]:Object.keys(topics);
  const scores=keys.map(key=>({key,score:topicMastery(state,key)})).sort((a,b)=>a.score-b.score);
  const count=evidenceCount(state);
  const coverage=coveragePercent(state);
  const understanding=scores.length?Math.round(scores.reduce((sum,x)=>sum+x.score,0)/scores.length):0;
  const examReadiness=examReadinessPercent(state);
  if(!scores.length || count===0)return {hasEvidence:false,count,weak:null,strong:null,scores,coverage,understanding,examReadiness};
  return {
    hasEvidence:true,
    count,
    weak:scores[0],
    strong:scores[scores.length-1],
    scores,coverage,understanding,examReadiness
  };
}

async function loadEvidence(){
  if(!currentUser)return;
  let state=normaliseState(JSON.parse(localStorage.getItem("paper2State")||"{}"));
  try{
    const {data,error}=await client
      .from("revision_progress")
      .select("state")
      .eq("module_id",MODULE_ID)
      .maybeSingle();
    if(!error && data?.state)state=normaliseState(data.state);
  }catch(_error){
    // Local evidence remains the safe fallback.
  }
  currentState=state;
  evidenceSummary=summariseEvidence(state);
  renderToday();
  renderProgressSnapshot();
  renderContinueHint();
}

function renderToday(){
  const strong=document.getElementById("strongestArea");
  const weak=document.getElementById("weakestArea");
  const note=document.getElementById("todayNote");
  if(!evidenceSummary?.hasEvidence){
    strong.textContent="Building your baseline";
    weak.textContent="Take a short diagnostic";
    note.textContent="As you answer questions, REV will have better evidence to guide you.";
    return;
  }
  strong.textContent=topics[evidenceSummary.strong.key].short;
  weak.textContent=topics[evidenceSummary.weak.key].short;
  note.textContent=`Based on ${evidenceSummary.count} saved recall and quiz responses.`;
}

function setMetric(valueId,barId,textId,value,text){
  const valueEl=document.getElementById(valueId);
  const bar=document.getElementById(barId);
  const textEl=document.getElementById(textId);
  if(!valueEl||!bar||!textEl)return;
  if(value===null||value===undefined){
    valueEl.textContent="Not assessed";
    bar.style.width="0%";
  }else{
    valueEl.textContent=`${value}%`;
    bar.style.width=`${Math.max(0,Math.min(100,value))}%`;
  }
  textEl.textContent=text;
}

function renderProgressSnapshot(){
  if(!evidenceSummary)return;
  setMetric("coverageValue","coverageBar","coverageText",evidenceSummary.coverage,
    evidenceSummary.coverage?"How much of the flashcard set you have actively assessed.":"Start answering to build syllabus coverage evidence.");
  setMetric("understandingValue","understandingBar","understandingText",evidenceSummary.hasEvidence?evidenceSummary.understanding:null,
    evidenceSummary.hasEvidence?"Built from your saved recall and quiz answers.":"Not enough answer evidence yet to judge understanding.");
  setMetric("readinessValue","readinessBar","readinessText",evidenceSummary.examReadiness,
    evidenceSummary.examReadiness===null?"Complete a full exam attempt to create a stronger readiness signal.":"Based on your recent full exam attempts.");
}

function renderContinueHint(){
  const hint=document.getElementById("continueHint");
  if(!hint)return;
  if(evidenceSummary?.hasEvidence){
    hint.textContent=`REV currently sees ${topics[evidenceSummary.weak.key].short} as the clearest area to revisit.`;
  }else{
    hint.textContent="Start with a diagnostic or choose an activity to build your baseline.";
  }
}

function suggestNextStep(){
  const line=document.getElementById("evidenceLine");
  document.getElementById("revInitialActions").hidden=true;
  document.getElementById("recommendationActions").hidden=false;

  if(!evidenceSummary?.hasEvidence){
    setRevCopy(`Hi, ${friendlyName(currentUser)} 👋`,`I don’t have enough answer evidence yet to call one area weak. Start with a short diagnostic and I’ll use what you show me to guide the next step.`,{typing:true});
    line.innerHTML='<span class="evidence-icon" aria-hidden="true">↗</span><span>Why: there is not enough evidence yet for a reliable topic recommendation.</span>';
    return;
  }

  const weak=topics[evidenceSummary.weak.key].short;
  setRevCopy(`Hi, ${friendlyName(currentUser)} 👋`,`I’d focus on ${weak} next. Your saved flashcard and quiz evidence makes it the clearest area to revisit. Work there next, then we can see whether the picture changes.`,{typing:true});
  line.innerHTML=`<span class="evidence-icon" aria-hidden="true">↗</span><span>Why: ${weak} currently has the weakest evidence across your Business topics.</span>`;
}

function resetRev({typing=false}={}){
  const initial=document.getElementById("revInitialActions");
  const recommendation=document.getElementById("recommendationActions");
  const line=document.getElementById("evidenceLine");
  const name=currentUser?friendlyName(currentUser):"Jamie";
  setRevCopy(`Hi, ${name} 👋`,`What shall we do today? I can guide you to the topic that looks most useful to work on next, or you can choose where to start.`,{typing});
  initial.hidden=false;
  recommendation.hidden=true;
  line.innerHTML='<span class="evidence-icon" aria-hidden="true">↗</span><span>REV uses your revision evidence to guide the next step.</span>';
}

function startRecommendation(){
  location.href=MODULE_URL;
}

function chooseSubject(){
  location.href="subjects/business/";
}

function focusRev(){
  const guide=document.getElementById("revGuide");
  if(!guide)return;
  guide.scrollIntoView({behavior:"smooth",block:"center"});
  setTimeout(()=>document.querySelector("#revGuide .button.lime")?.focus({preventScroll:true}),350);
}

function toggleMenu(open){
  const backdrop=document.getElementById("menuBackdrop");
  const drawer=document.getElementById("menuDrawer");
  if(open){
    backdrop.hidden=false;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden","false");
  }else{
    backdrop.hidden=true;
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden","true");
  }
}

async function init(){
  const {data}=await client.auth.getSession();
  currentUser=data.session?.user||null;
  render();
  client.auth.onAuthStateChange((event,session)=>{
    currentUser=session?.user||null;
    render();
    if(event==="SIGNED_IN")msg("");
  });
}

init();
