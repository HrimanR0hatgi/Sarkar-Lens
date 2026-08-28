import { z } from 'zod';

export const FactsSchema=z.object({
  life_event:z.enum(['moving','turning_18','married','lost_document']).nullable(),
  origin:z.string().nullable(), destination:z.string().nullable(), age:z.number().int().nullable(),
  owns_vehicle:z.boolean().nullable(), housing:z.enum(['rented','owned','unknown']).nullable(),
  voter_registered:z.boolean().nullable(), lost_document_type:z.enum(['aadhaar','voter_id','passport','pan','other']).nullable(),
  marriage_state:z.string().nullable(), changed_name:z.boolean().nullable()
});

function normalize(s){ return s.toLowerCase().replace(/\s+/g,' ').trim(); }
function cityAfter(text, patterns){ for(const p of patterns){ const m=text.match(p); if(m) return m[1].trim().replace(/[.,]$/,''); } return null; }

export function mockParse(input){
  const t=normalize(input);
  let life_event=null;
  if(/moving|move|shifted|shifting|relocat|new city|new state/.test(t)) life_event='moving';
  else if(/turning 18|turned 18|18th birthday|became 18|age 18/.test(t)) life_event='turning_18';
  else if(/married|marriage|getting married|got married/.test(t)) life_event='married';
  else if(/lost|stolen|missing/.test(t) && /aadhaar|voter|epic|passport|pan/.test(t)) life_event='lost_document';

  const origin=cityAfter(t,[/from ([a-z .'-]+?)(?: to |,|\.|$)/]);
  const destination=cityAfter(t,[/\bto ([a-z .'-]+?)(?:\.|,|\s+and\s+|\s+i(?:'|’)m\s+|$)/]);
  const owns_vehicle=/\b(no|don't|do not|without|dont) (?:own|have)(?: a)? (?:car|vehicle)/.test(t)?false: /\b(own|have)(?: a)? (?:car|vehicle)/.test(t)?true:null;
  const housing=/rent|rented|tenant|lease/.test(t)?'rented':/own(?:ing)?|owned/.test(t)?'owned':null;
  const voter_registered=/not registered to vote|not a registered voter|haven't registered to vote|not registered/.test(t)?false:/registered to vote|registered voter|already a voter/.test(t)?true:null;
  let lost_document_type=null;
  if(life_event==='lost_document'){
    if(/aadhaar/.test(t)) lost_document_type='aadhaar'; else if(/voter|epic/.test(t)) lost_document_type='voter_id'; else if(/passport/.test(t)) lost_document_type='passport'; else if(/pan/.test(t)) lost_document_type='pan'; else lost_document_type='other';
  }
  const ageMatch=t.match(/(?:age|aged)\s+(\d{1,3})/);
const age=ageMatch
  ? Number(ageMatch[1])
  : life_event==='turning_18'
    ? 18
    : null;
  return {life_event,origin,destination,age,owns_vehicle,housing,voter_registered,lost_document_type,marriage_state:null,changed_name:/changed my name|name change/.test(t)?true:null};
}

export async function parseSituation(input){
  // Production implementation can swap this function for an LLM provider.
  // The output is always validated by FactsSchema before rules consume it.
  return FactsSchema.parse(mockParse(input));
}
