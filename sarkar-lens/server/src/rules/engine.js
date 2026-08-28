import { FactsSchema } from '../ai/parser.js';

function matchesCondition(facts,c){
  const v=facts[c.fact];
  if(c.op==='exists') return v!==null && v!==undefined && v!=='';
  if(c.op==='eq') return v===c.value;
  if(c.op==='gte') return typeof v==='number' && v>=c.value;
  return false;
}
export function selectServices(rawFacts,services){
  const facts=FactsSchema.parse(rawFacts);
  if(!facts.life_event) return [];
  return services.filter(s=>s.life_events.includes(facts.life_event) && s.conditions.every(c=>matchesCondition(facts,c)))
    .map(s=>({...s,reason:reasonFor(s,facts)}));
}
function reasonFor(s,f){
  if(s.id==='aadhaar-address-update') return `Your residential address is changing to ${f.destination || 'a new location'}.`;
  if(s.id==='voter-address-shift') return 'You said you are already registered to vote and are changing residence.';
  if(s.id==='vehicle-registration-address') return 'You indicated that you own a vehicle and are changing residence.';
  if(s.id==='voter-registration-18') return 'You are 18 or older and are not currently registered as a voter.';
  if(s.id==='aadhaar-lost') return 'Your Aadhaar document is unavailable.';
  if(s.id==='epic-replacement') return 'Your voter ID/EPIC is unavailable.';
  if(s.id==='marriage-registration') return 'Marriage registration may apply, but the exact jurisdiction-specific process is not verified in this prototype.';
  if(s.id==='marriage-name-address-docs') return 'You indicated that your name changed after marriage; affected identity records should be reviewed.';
  return 'This service matches the facts you provided.';
}
