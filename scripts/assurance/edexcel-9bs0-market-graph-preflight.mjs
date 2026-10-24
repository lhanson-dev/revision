import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const draftPath=path.join(root,'research/content-production-repeatability/edexcel-9bs0-shared-market-node-draft.json');
export const graphDir=path.join(root,'research/content-production-repeatability/market-graph-exemplars');
const expected=[
 {file:'edexcel-9bs0-market-baseline.svg',curveIds:['D0','S0'],pointIds:['E0'],kind:'baseline'},
 {file:'edexcel-9bs0-market-supply-left.svg',curveIds:['D0','S0','S1'],pointIds:['E0','E1'],kind:'cost'},
 {file:'edexcel-9bs0-market-demand-right.svg',curveIds:['D0','D1','S0'],pointIds:['E0','E1'],kind:'preference'}
];
const x=q=>100+q*3.5;
const y=p=>380-p*10;
export const qAtPrice=(curve,p)=>curve.quantity_intercept+curve.price_coefficient*p;
export const solveEquilibrium=(demand,supply)=>{
 const slope=demand.price_coefficient-supply.price_coefficient;
 if(!Number.isFinite(slope)||slope===0)throw new Error('parallel_or_invalid_curves');
 const price=(supply.quantity_intercept-demand.quantity_intercept)/slope;
 return {price,quantity:qAtPrice(demand,price)};
};
const tag=(svg,type,key,id)=>svg.match(new RegExp('<'+type+'\\b[^>]*\\bdata-'+key+'="'+id+'"[^>]*>'))?.[0]??null;
const attr=(element,name)=>Number(element?.match(new RegExp('\\b'+name+'="([^"]+)"'))?.[1]);
const contains=(svg,name,id)=>Boolean(tag(svg,'text',name,id));
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<0.00001;

export function checkMarketGraph(svg,kind,caseData){
 const problems=[];const require=(ok,id)=>{if(!ok)problems.push(id)};
 const shape=expected.find(v=>v.kind===kind);
 if(!shape)return ['unknown_graph_kind'];
 require(svg.startsWith('<svg ')&&svg.includes('role="img"')&&svg.includes('aria-labelledby="graph-title graph-desc"')
  &&svg.includes('<title id="graph-title">')&&svg.includes('<desc id="graph-desc">'),
  'accessible_graph_title_and_description_missing');
 require(!/<(?:script|image|foreignObject)\b/i.test(svg)&&!/\b(?:href|onload|onclick)=/i.test(svg),
  'foreign_graph_or_executable_content_forbidden');
 const axes=[['quantity','100','380','610','380'],['price','100','380','100','65']];
 for(const [id,xa,ya,xb,yb] of axes){
  const l=tag(svg,'line','axis',id);
  require(Boolean(l)&&[xa,ya,xb,yb].every((n,i)=>String(attr(l,['x1','y1','x2','y2'][i]))===n),'axis_geometry_incorrect:'+id);
 }
 require(contains(svg,'axis-label','price')&&contains(svg,'axis-label','quantity')
  &&svg.includes('Price (GBP/pack)')&&svg.includes('Quantity (packs/week)'),
  'correct_unit_axes_required');
 const scenario=kind==='cost'?caseData.original_scenarios[0]:kind==='preference'?caseData.original_scenarios[1]:null;
 const curves={D0:caseData.demand,S0:caseData.supply,
  ...(kind==='cost'?{S1:scenario?.supply}:{}),
  ...(kind==='preference'?{D1:scenario?.demand}:{})};
 require((svg.match(/data-curve="/g)||[]).length===shape.curveIds.length,'curve_count_incorrect');
 for(const id of shape.curveIds){
  const curve=curves[id],l=tag(svg,'line','curve',id);
  require(Boolean(l)&&contains(svg,'curve-label',id)&&curve
   &&near(attr(l,'x1'),x(qAtPrice(curve,0)))&&near(attr(l,'y1'),y(0))
   &&near(attr(l,'x2'),x(qAtPrice(curve,30)))&&near(attr(l,'y2'),y(30)),
   'curve_coordinates_or_label_incorrect:'+id);
 }
 const baseline=solveEquilibrium(caseData.demand,caseData.supply);
 const shifted=scenario?solveEquilibrium(scenario.demand,scenario.supply):null;
 require(near(baseline.price,20)&&near(baseline.quantity,40)
  &&(!scenario||near(shifted.price,22)&&near(shifted.quantity,kind==='cost'?32:42)),
  'source_example_math_incorrect');
 require((svg.match(/data-equilibrium="/g)||[]).length===shape.pointIds.length,'equilibrium_count_incorrect');
 for(const id of shape.pointIds){
  const p=id==='E0'?baseline:shifted;
  const point=tag(svg,'circle','equilibrium',id);
  const label=tag(svg,'text','point-label',id);
  require(Boolean(point)&&Boolean(label)
   &&near(attr(point,'cx'),x(p.quantity))&&near(attr(point,'cy'),y(p.price))
   &&label.includes('P'+p.price+', Q'+p.quantity+')')
   &&Boolean(tag(svg,'line','guide',id+'-p'))
   &&Boolean(tag(svg,'line','guide',id+'-q')),
   'equilibrium_coordinates_or_reading_incorrect:'+id);
 }
 if(scenario){
  const fixed=kind==='cost'?caseData.demand:caseData.supply;
  const unchanged=kind==='cost'?scenario.demand:scenario.supply;
  require(fixed.quantity_intercept===unchanged.quantity_intercept
   &&fixed.price_coefficient===unchanged.price_coefficient,
   'unchanged_curve_changed:'+kind);
  require(kind!=='cost'||scenario.shift==='SUPPLY_LEFT'&&scenario.supply.quantity_intercept<caseData.supply.quantity_intercept,
   'supply_shift_direction_wrong');
  require(kind!=='preference'||scenario.shift==='DEMAND_RIGHT'&&scenario.demand.quantity_intercept>caseData.demand.quantity_intercept,
   'demand_shift_direction_wrong');
 }
 return problems;
}

export function candidateGraphConstructionCheck(answer,caseData){
 const reasons=[];
 const demand=caseData.demand,supply=caseData.supply;
 const expectedPair=[{id:'D0',curve:demand},{id:'S0',curve:supply}];
 if(answer?.price_axis!=='vertical'||answer?.quantity_axis!=='horizontal')reasons.push('axis_orientation_wrong');
 if(!Array.isArray(answer?.curves)||answer.curves.length!==2)reasons.push('expected_two_student_constructed_curves');
 for(const c of expectedPair){
  const found=answer?.curves?.find(x=>x.id===c.id);
  if(!found||!near(found.quantity_at_price_zero,qAtPrice(c.curve,0))
   ||!near(found.quantity_at_price_thirty,qAtPrice(c.curve,30)))reasons.push('constructed_curve_incorrect:'+c.id);
 }
 const eq=solveEquilibrium(demand,supply);
 if(answer?.equilibrium?.id!=='E0'||!near(answer?.equilibrium?.price,eq.price)
  ||!near(answer?.equilibrium?.quantity,eq.quantity))reasons.push('constructed_equilibrium_incorrect');
 return {prototype_checks_pass:reasons.length===0,reasons,
  observable_capture_method:'STRUCTURED_COORDINATE_SIMULATION_ONLY',
  live_student_graph_capture_supported:false,
  mastery_evidence_writable:false,publication_eligible:false};
}

export function candidateGraphInterpretationCheck(answer,scenario,caseData){
 const reasons=[];
 const correct=caseData.original_scenarios.find(x=>x.scenario_id===scenario);
 if(!correct)return {prototype_checks_pass:false,reasons:['unknown_original_scenario'],
  mastery_evidence_writable:false,publication_eligible:false};
 const p=solveEquilibrium(correct.demand,correct.supply);
 if(answer?.shift!==correct.shift)reasons.push('shifted_curve_or_direction_incorrect');
 if(!near(answer?.price,p.price)||!near(answer?.quantity,p.quantity))reasons.push('equilibrium_reading_incorrect');
 if(answer?.own_price_move_does_not_shift_other_curve!==true)reasons.push('shift_vs_movement_not_demonstrated');
 return {prototype_checks_pass:reasons.length===0,reasons,
  observable_capture_method:'STRUCTURED_READING_SIMULATION_ONLY',
  live_student_graph_capture_supported:false,
  mastery_evidence_writable:false,publication_eligible:false};
}

export function runMarketGraphPreflight(){
 const draft=JSON.parse(readFileSync(draftPath,'utf8'));
 const problems=[];
 for(const figure of expected){
  const xml=readFileSync(path.join(graphDir,figure.file),'utf8');
  problems.push(...checkMarketGraph(xml,figure.kind,draft.original_numeric_case));
 }
 if(draft.lifecycle!=='RESEARCH_DRAFT_REQUIRES_INDEPENDENT_REVIEW'
  ||draft.publication_decision!=='HOLD'
  ||draft.proposed_node_id_assigned!==false
  ||draft.assurance?.subject_expert_review!=='PENDING')problems.push('foundational_review_status_drift');
 return {result:problems.length?'FAIL':'PASS',problems,original_exemplars:3,
  live_learner_graph_capability:'NOT_IMPLEMENTED',evidence_promotion_allowed:false,
  student_assets_released:0,foundation_change:false,review_state:'HOLD'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const out=runMarketGraphPreflight();
 process.stdout.write(JSON.stringify(out,null,2)+'\n');
 if(out.result!=='PASS')process.exitCode=1;
}
