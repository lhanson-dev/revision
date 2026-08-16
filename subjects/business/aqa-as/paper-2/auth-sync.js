const REVISION_MODULE_ID="business-aqa-as-paper-2";
const SUPABASE_URL="https://xwwhshpmeogswxfjtpvq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_N4uw63Yo5_dHLo04C5Tw_g_o8OMXTmG";
const revisionCloud=supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
let revisionUser=null,cloudSaveTimer=null,applyingCloud=false;
function ensureRevisionStateShape(){state.cards=state.cards||{};state.quiz=state.quiz||{};state.topic=state.topic||{};state.v2=state.v2||{examAttempts:[],examDrafts:{},diagnostics:[]};state.v2.examAttempts=state.v2.examAttempts||[];state.v2.examDrafts=state.v2.examDrafts||{};state.v2.diagnostics=state.v2.diagnostics||[]}

function injectAccountUI(){
 const style=document.createElement("style");style.textContent=`.auth-box{margin:18px 0 10px;padding:12px;border:1px solid #294866;border-radius:12px;background:#17304f;color:#d9e4ed;font-size:12px}.auth-box b{display:block;color:#fff;margin-bottom:4px}.auth-box button{margin-top:8px;width:100%;border:1px solid #3a5571;border-radius:9px;padding:8px;background:transparent;color:#fff;font-weight:700;cursor:pointer}.auth-box .sync-ok{color:#7de0b2}.mobile-auth{white-space:nowrap;border:1px solid #3a5571!important;background:#0f2946!important;color:#fff!important}.mobile-auth.synced{border-color:#18a66a!important}`;document.head.appendChild(style);
 const box=document.createElement("div");box.className="auth-box";box.id="authBox";document.querySelector(".sidebar .nav").after(box);
 const mobileButton=document.createElement("button");mobileButton.id="mobileAuthButton";mobileButton.className="mobile-auth synced";mobileButton.onclick=signOutRevision;document.getElementById("mobileNav").appendChild(mobileButton);
 renderAuthBox();
}
function renderAuthBox(status=""){
 const el=document.getElementById("authBox"),mobile=document.getElementById("mobileAuthButton");
 if(!revisionUser)return;
 const label=revisionUser.email||"Signed in";
 if(el)el.innerHTML=`<b>${label}</b><span class="sync-ok">${status||"Cloud progress on"}</span><button onclick="signOutRevision()">Sign out</button>`;
 if(mobile)mobile.textContent=status==="Saving…"?"Saving…":"✓ Synced";
}
async function signOutRevision(){await revisionCloud.auth.signOut();location.replace('../../../../')}
function scheduleCloudSave(){if(applyingCloud||!revisionUser)return;clearTimeout(cloudSaveTimer);renderAuthBox("Saving…");cloudSaveTimer=setTimeout(saveCloudProgress,500)}
async function saveCloudProgress(){if(!revisionUser)return;ensureRevisionStateShape();const payload={user_id:revisionUser.id,module_id:REVISION_MODULE_ID,state:JSON.parse(JSON.stringify(state)),updated_at:new Date().toISOString()};const{error}=await revisionCloud.from("revision_progress").upsert(payload,{onConflict:"user_id,module_id"});renderAuthBox(error?"Saved locally — cloud retry later":"Saved to cloud")}
async function loadCloudProgress(){if(!revisionUser)return;renderAuthBox("Syncing…");const{data,error}=await revisionCloud.from("revision_progress").select("state,updated_at").eq("user_id",revisionUser.id).eq("module_id",REVISION_MODULE_ID).maybeSingle();if(error){renderAuthBox("Cloud unavailable — using local");return}if(data?.state){applyingCloud=true;Object.keys(state).forEach(k=>delete state[k]);Object.assign(state,data.state);ensureRevisionStateShape();localStorage.setItem("paper2State",JSON.stringify(state));applyingCloud=false;buildFlashOrder();renderDashboard();if(document.getElementById("flashcards").classList.contains("active"))showFlash();if(typeof renderProgressV2==="function")renderProgressV2();renderAuthBox("Synced across devices")}else{ensureRevisionStateShape();await saveCloudProgress()}}
async function resetRevisionProgress(){if(!window.confirm("Reset all revision progress on every synced device?"))return;Object.keys(state).forEach(k=>delete state[k]);Object.assign(state,{cards:{},quiz:{},topic:{},v2:{examAttempts:[],examDrafts:{},diagnostics:[]}});localStorage.setItem("paper2State",JSON.stringify(state));if(revisionUser)await revisionCloud.from("revision_progress").delete().eq("user_id",revisionUser.id).eq("module_id",REVISION_MODULE_ID);location.reload()}
async function initRevisionAuth(){
 const{data}=await revisionCloud.auth.getSession();revisionUser=data.session?.user||null;
 if(!revisionUser){location.replace('../../../../');return}
 ensureRevisionStateShape();document.body.classList.add('auth-ready');
 document.title='AQA AS Business Paper 2 | Revision';
 const firstEyebrow=document.querySelector('#home .eyebrow');if(firstEyebrow)firstEyebrow.textContent='Revision dashboard';
 injectAccountUI();await loadCloudProgress();
 revisionCloud.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'||!session){location.replace('../../../../')}})
}
initRevisionAuth();