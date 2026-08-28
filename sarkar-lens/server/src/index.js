import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import servicesData from '../data/services.json' with { type:'json' };
import { seedServices,getServices,setProgress,getProgress } from './db/database.js';
import { parseSituation, FactsSchema } from './ai/parser.js';
import { selectServices } from './rules/engine.js';

seedServices(servicesData);
const app=express(); app.use(cors()); app.use(express.json());
const PORT=process.env.PORT||4000;

app.get('/api/health',(req,res)=>res.json({ok:true}));
app.post('/api/parse',async(req,res)=>{ try{ if(typeof req.body.input!=='string'||!req.body.input.trim()) return res.status(400).json({error:'Input is required.'}); const facts=await parseSituation(req.body.input); res.json({facts}); }catch(e){res.status(422).json({error:'Could not safely parse the situation.',details:e.message});} });
app.post('/api/checklist',async(req,res)=>{
  console.log('CHECKLIST REQUEST:', req.body);

  try{
    const facts=req.body.facts
      ? FactsSchema.parse(req.body.facts)
      : await parseSituation(req.body.input||'');

    console.log('PARSED FACTS:', facts);

    const services=selectServices(facts,getServices());

    console.log('SERVICES FOUND:', services.length);

    const sessionId=crypto.randomUUID();

    res.json({sessionId,facts,services});
  }catch(e){
    console.error('CHECKLIST ERROR:', e);

    res.status(422).json({
      error:'Insufficient or ambiguous information.',
      details:e.message
    });
  }
});
app.get('/api/progress/:sessionId',(req,res)=>res.json({items:getProgress(req.params.sessionId)}));
app.post('/api/progress',(req,res)=>{ const {sessionId,serviceId,status}=req.body; const allowed=['not_started','in_progress','completed','not_applicable']; if(!sessionId||!serviceId||!allowed.includes(status)) return res.status(400).json({error:'Invalid progress payload.'}); setProgress(sessionId,serviceId,status); res.json({ok:true}); });
app.get('/api/dependencies',(req,res)=>{ const services=getServices(); const nodes=services.map(s=>({id:s.id,name:s.name})); const edges=[]; services.forEach(s=>s.dependencies.forEach(d=>edges.push({from:d,to:s.id}))); res.json({nodes,edges}); });
app.listen(PORT,()=>console.log(`Sarkar Lens API running on http://localhost:${PORT}`));
