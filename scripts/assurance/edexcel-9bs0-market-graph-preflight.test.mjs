import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {
  draftPath,graphDir,runMarketGraphPreflight,checkMarketGraph,
  candidateGraphConstructionCheck,candidateGraphInterpretationCheck
} from './edexcel-9bs0-market-graph-preflight.mjs';

const draft=JSON.parse(readFileSync(draftPath,'utf8'));
const model=draft.original_numeric_case;
const svg=file=>readFileSync(path.join(graphDir,file),'utf8');
const costFile='edexcel-9bs0-market-supply-left.svg';
const demandFile='edexcel-9bs0-market-demand-right.svg';
const goodConstruct={
 price_axis:'vertical',quantity_axis:'horizontal',
 curves:[
  {id:'D0',quantity_at_price_zero:120,quantity_at_price_thirty:0},
  {id:'S0',quantity_at_price_zero:20,quantity_at_price_thirty:50}
 ],
 equilibrium:{id:'E0',price:20,quantity:40}
};
const goodInterpret={shift:'SUPPLY_LEFT',price:22,quantity:32,own_price_move_does_not_shift_other_curve:true};

describe('Stage 5 original supply-demand graph and evidence boundary',()=>{
 it('accepts exactly three original, geometrically correct accessible SVGs but never issues student evidence',()=>{
  expect(runMarketGraphPreflight()).toMatchObject({result:'PASS',problems:[],
   original_exemplars:3,live_learner_graph_capability:'NOT_IMPLEMENTED',
   evidence_promotion_allowed:false,student_assets_released:0,foundation_change:false,review_state:'HOLD'});
 });
 it('rejects shifted-curve endpoint distortion and swapped axes',()=>{
  const cost=svg(costFile);
  expect(checkMarketGraph(cost.replace('data-curve="S1" x1="135"','data-curve="S1" x1="150"'),'cost',model))
   .toContain('curve_coordinates_or_label_incorrect:S1');
  expect(checkMarketGraph(cost.replace('data-axis="price" x1="100" y1="380" x2="100"','data-axis="price" x1="100" y1="380" x2="550"'),'cost',model))
   .toContain('axis_geometry_incorrect:price');
  expect(checkMarketGraph(cost.replace('font-weight="600" fill="#0F172A"','font-weight="600" fill="none"'),'cost',model))
   .toContain('curve_coordinates_or_label_incorrect:D0');
 });
 it('rejects false equilibrium position, no text alternatives and imported graphics',()=>{
  const demand=svg(demandFile);
  expect(checkMarketGraph(demand.replace('data-equilibrium="E1" cx="247"','data-equilibrium="E1" cx="240"'),'preference',model))
   .toContain('equilibrium_coordinates_or_reading_incorrect:E1');
  expect(checkMarketGraph(demand.replace('<desc id="graph-desc">','<desc>'),'preference',model))
   .toContain('accessible_graph_title_and_description_missing');
  expect(checkMarketGraph(demand.replace('</svg>','<image href="https://example.com/diagram.png"/></svg>'),'preference',model))
   .toContain('foreign_graph_or_executable_content_forbidden');
 });
 it('demonstrates structured construction is a different capability from graph reading',()=>{
  const pass=candidateGraphConstructionCheck(goodConstruct,model);
  expect(pass).toMatchObject({prototype_checks_pass:true,reasons:[],
   live_student_graph_capture_supported:false,mastery_evidence_writable:false,publication_eligible:false});
  expect(candidateGraphConstructionCheck({...goodConstruct,price_axis:'horizontal'},model).reasons)
   .toContain('axis_orientation_wrong');
  expect(candidateGraphConstructionCheck({...goodConstruct,curves:[goodConstruct.curves[0],{...goodConstruct.curves[1],quantity_at_price_zero:10}]},model).reasons)
   .toContain('constructed_curve_incorrect:S0');
  expect(candidateGraphConstructionCheck({...goodConstruct,equilibrium:{id:'E0',price:22,quantity:40}},model).reasons)
   .toContain('constructed_equilibrium_incorrect');
 });
 it('interprets supply and demand shifts in isolation, without counting a model answer as mastery',()=>{
  expect(candidateGraphInterpretationCheck(goodInterpret,'COST-RISE',model))
   .toMatchObject({prototype_checks_pass:true,mastery_evidence_writable:false});
  expect(candidateGraphInterpretationCheck({...goodInterpret,shift:'DEMAND_RIGHT'},'COST-RISE',model).reasons)
   .toContain('shifted_curve_or_direction_incorrect');
  expect(candidateGraphInterpretationCheck({...goodInterpret,own_price_move_does_not_shift_other_curve:false},'COST-RISE',model).reasons)
   .toContain('shift_vs_movement_not_demonstrated');
  expect(candidateGraphInterpretationCheck({shift:'DEMAND_RIGHT',price:22,quantity:42,own_price_move_does_not_shift_other_curve:true},'PREFERENCE-RISE',model))
   .toMatchObject({prototype_checks_pass:true,mastery_evidence_writable:false});
  expect(candidateGraphInterpretationCheck(goodInterpret,'UNKNOWN',model).reasons)
   .toContain('unknown_original_scenario');
 });
 it('rejects mutations to the domain truth even when SVGs are unchanged',()=>{
  const altered=structuredClone(model);
  altered.original_scenarios[0].supply.quantity_intercept=15;
  expect(checkMarketGraph(svg(costFile),'cost',altered))
   .toContain('curve_coordinates_or_label_incorrect:S1');
 });
});
