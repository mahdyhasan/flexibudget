import { useState, useRef, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

/* ── helpers ── */
const uid = () => Math.random().toString(36).substr(2, 9);
const fmt = (n) => "৳" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
const pct = (n) => Number(n || 0).toFixed(1) + "%";

const BUSINESS_TYPES = [
  { id:"shoe_business",   label:"Shoe Business",    icon:"👟", has_cogs:true  },
  { id:"restaurant",      label:"Restaurant",        icon:"🍽️", has_cogs:true  },
  { id:"saas",            label:"SaaS",              icon:"☁️", has_cogs:false },
  { id:"software_dev",    label:"Software Agency",   icon:"💻", has_cogs:false },
  { id:"manufacturing",   label:"Manufacturing",     icon:"🏭", has_cogs:true  },
  { id:"retail",          label:"Retail Store",      icon:"🛍️", has_cogs:true  },
  { id:"facebook_biz",    label:"Facebook Business", icon:"📱", has_cogs:true  },
  { id:"fashion_apparel", label:"Fashion & Apparel", icon:"👗", has_cogs:true  },
  { id:"jewellery",       label:"Jewellery",         icon:"💎", has_cogs:true  },
  { id:"trading_import",  label:"Import & Trading",  icon:"🚢", has_cogs:true  },
  { id:"custom",          label:"Custom Business",   icon:"⚙️", has_cogs:null  },
];

const GREEN="#22c55e", RED="#ef4444", TEAL="#0d9488", AMBER="#f59e0b";
const PIE_COLORS=["#0d9488","#0ea5e9","#8b5cf6","#f59e0b","#ef4444","#22c55e"];

/* ── cost templates ── */
const mkSetup   = () => ({ id:uid(), name:"", amount:0 });
const mkFixed   = () => ({ id:uid(), name:"", amount:0 });
const mkSemi    = () => ({ id:uid(), name:"", base:0, ratePerUnit:0, productRef:"all" });
const mkVar     = () => ({ id:uid(), name:"", ratePerUnit:0, productRef:"all" });
const mkMktF    = () => ({ id:uid(), name:"", amount:0 });
const mkMktU    = () => ({ id:uid(), name:"", ratePerUnit:0, productRef:"all" });
const mkMktP    = () => ({ id:uid(), name:"", pct:0, revenueRef:"all" });
const mkProduct = (hasCogs) => ({
  id:uid(), name:"", unit:"unit", price:0, units:0, growthPct:0,
  ...(hasCogs?{cogs_material:0,cogs_labor:0,cogs_packaging:0,cogs_other:0}:{}),
});

/* ── CALC ENGINE ── */
function calcMonthlyData({ products, setupCosts, fixedCosts, semiVariableCosts,
  variableCosts, marketingFixed, marketingPerUnit, marketingPctRevenue,
  projectionMonths, amortizationMode, hasCogs }) {
  const amortMonths=amortizationMode==="12months"?12:projectionMonths;
  const totalSetup=setupCosts.reduce((s,c)=>s+Number(c.amount||0),0);
  const amortPerMonth=amortMonths>0?totalSetup/amortMonths:0;
  const data=[];
  for (let m=1;m<=projectionMonths;m++) {
    const factor=(p)=>Math.pow(1+Number(p.growthPct||0)/100,m-1);
    let revenue=0,cogs=0; const pu={};
    products.forEach(p=>{
      const u=Number(p.units||0)*factor(p); pu[p.id]=u;
      revenue+=u*Number(p.price||0);
      if(hasCogs) cogs+=u*(Number(p.cogs_material||0)+Number(p.cogs_labor||0)+Number(p.cogs_packaging||0)+Number(p.cogs_other||0));
    });
    const totalUnits=Object.values(pu).reduce((a,b)=>a+b,0);
    const gross=revenue-cogs;
    const fixedTotal=fixedCosts.reduce((s,c)=>s+Number(c.amount||0),0);
    const semiTotal=semiVariableCosts.reduce((s,c)=>{const u=c.productRef==="all"?totalUnits:(pu[c.productRef]||0);return s+Number(c.base||0)+Number(c.ratePerUnit||0)*u;},0);
    const varTotal=variableCosts.reduce((s,c)=>{const u=c.productRef==="all"?totalUnits:(pu[c.productRef]||0);return s+Number(c.ratePerUnit||0)*u;},0);
    const mktF=marketingFixed.reduce((s,c)=>s+Number(c.amount||0),0);
    const mktU=marketingPerUnit.reduce((s,c)=>{const u=c.productRef==="all"?totalUnits:(pu[c.productRef]||0);return s+Number(c.ratePerUnit||0)*u;},0);
    const mktP=marketingPctRevenue.reduce((s,c)=>{const base=c.revenueRef==="all"?revenue:(pu[c.revenueRef]||0)*(products.find(p=>p.id===c.revenueRef)?.price||0);return s+Number(c.pct||0)/100*base;},0);
    const mktTotal=mktF+mktU+mktP;
    const totalCosts=fixedTotal+semiTotal+varTotal+mktTotal+amortPerMonth;
    const netPnL=gross-totalCosts;
    data.push({month:`M${m}`,m,revenue,cogs,gross,fixedTotal,semiTotal,varTotal,mktTotal,amortPerMonth,totalCosts,netPnL,margin:revenue>0?(netPnL/revenue)*100:0});
  }
  return data;
}

function calcBreakeven({ products, fixedCosts, semiVariableCosts, variableCosts,
  marketingFixed, marketingPerUnit, marketingPctRevenue, setupCosts, projectionMonths, amortizationMode, hasCogs }) {
  if (!products.length) return null;
  const amortMonths=amortizationMode==="12months"?12:projectionMonths;
  const amortPerMonth=amortMonths>0?setupCosts.reduce((s,c)=>s+Number(c.amount||0),0)/amortMonths:0;
  const totalFixed=fixedCosts.reduce((s,c)=>s+Number(c.amount||0),0)+amortPerMonth
    +semiVariableCosts.reduce((s,c)=>s+Number(c.base||0),0)
    +marketingFixed.reduce((s,c)=>s+Number(c.amount||0),0);
  const totalUnits=products.reduce((s,p)=>s+Number(p.units||0),0);
  if(totalUnits===0) return null;
  let wcm=0;
  products.forEach(p=>{
    const w=Number(p.units||0)/totalUnits,price=Number(p.price||0);
    const cogsU=hasCogs?(Number(p.cogs_material||0)+Number(p.cogs_labor||0)+Number(p.cogs_packaging||0)+Number(p.cogs_other||0)):0;
    const varU=variableCosts.filter(c=>c.productRef==="all"||c.productRef===p.id).reduce((s,c)=>s+Number(c.ratePerUnit||0),0)
      +marketingPerUnit.filter(c=>c.productRef==="all"||c.productRef===p.id).reduce((s,c)=>s+Number(c.ratePerUnit||0),0)
      +semiVariableCosts.filter(c=>c.productRef==="all"||c.productRef===p.id).reduce((s,c)=>s+Number(c.ratePerUnit||0),0);
    const pctMkt=marketingPctRevenue.filter(c=>c.revenueRef==="all"||c.revenueRef===p.id).reduce((s,c)=>s+Number(c.pct||0)/100*price,0);
    wcm+=w*(price-cogsU-varU-pctMkt);
  });
  if(wcm<=0) return null;
  const breakUnits=Math.ceil(totalFixed/wcm);
  const avgPrice=products.reduce((s,p)=>s+Number(p.price||0)*Number(p.units||0),0)/totalUnits;
  return {breakUnits,breakRevenue:breakUnits*avgPrice};
}

/* ── SHARED STYLES ── */
const inputStyle={background:"#1e293b",border:"1.5px solid #2d3f55",color:"#f1f5f9",borderRadius:12,padding:"13px 14px",fontSize:15,width:"100%",outline:"none",WebkitAppearance:"none",appearance:"none",boxSizing:"border-box",fontFamily:"inherit"};
const labelStyle={fontSize:11,color:"#64748b",marginBottom:5,display:"block",fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase"};

/* ── UI ATOMS ── */
const Inp=({value,onChange,type="text",placeholder,label})=>(
  <div style={{marginBottom:12}}>
    {label&&<label style={labelStyle}>{label}</label>}
    <input type={type} value={value} onChange={onChange} placeholder={placeholder||""}
      style={inputStyle} inputMode={type==="number"?"decimal":undefined}/>
  </div>
);

const Sel=({value,onChange,options,label})=>(
  <div style={{marginBottom:12}}>
    {label&&<label style={labelStyle}>{label}</label>}
    <div style={{position:"relative"}}>
      <select value={value} onChange={onChange}
        style={{...inputStyle,paddingRight:36}}>
        {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:"#475569",pointerEvents:"none",fontSize:12}}>▼</span>
    </div>
  </div>
);

const OutlineBtn=({onClick,children,full,small})=>(
  <button onClick={onClick} style={{
    background:"transparent",color:"#0d9488",border:"1.5px solid #0d9488",
    borderRadius:10,padding:small?"8px 14px":"13px 18px",
    fontSize:small?12:14,fontWeight:600,cursor:"pointer",
    width:full?"100%":undefined,fontFamily:"inherit",
  }}>{children}</button>
);

const PrimaryBtn=({onClick,children,full,disabled})=>(
  <button onClick={onClick} disabled={disabled} style={{
    background:disabled?"#1e293b":"#0d9488",color:disabled?"#475569":"#fff",border:"none",
    borderRadius:12,padding:"14px 20px",fontSize:15,fontWeight:700,cursor:disabled?"default":"pointer",
    width:full?"100%":undefined,fontFamily:"inherit",transition:"background .15s",
  }}>{children}</button>
);

const RemoveBtn=({onClick})=>(
  <button onClick={onClick} style={{background:"#1a0a0a",color:"#f87171",border:"1px solid #7f1d1d",borderRadius:8,padding:"5px 11px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>✕</button>
);

const SectionTitle=({title,sub})=>(
  <div style={{marginBottom:18}}>
    <h2 style={{fontSize:20,fontWeight:800,color:"#f1f5f9",margin:0,letterSpacing:"-0.3px"}}>{title}</h2>
    {sub&&<p style={{fontSize:12,color:"#64748b",marginTop:5,lineHeight:1.5}}>{sub}</p>}
  </div>
);

const KpiCard=({label,value,color})=>{
  const c={teal:"#5eead4",green:"#4ade80",red:"#f87171",amber:"#fbbf24"};
  return(
    <div style={{background:"#1a2438",border:"1px solid #2d3f55",borderRadius:14,padding:"12px 14px",minWidth:0}}>
      <div style={{fontSize:10,color:"#64748b",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</div>
      <div style={{fontSize:16,fontWeight:800,color:c[color]||"#f1f5f9",marginTop:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{value}</div>
    </div>
  );
};

/* ── COST CARD ── */
function CostCard({item,fields,prodOptions=[],onChange,onDelete}){
  return(
    <div style={{background:"#111c2d",border:"1px solid #2d3f55",borderRadius:14,padding:14,marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}>
        <RemoveBtn onClick={onDelete}/>
      </div>
      {fields.map(f=>f.isSelect?(
        <Sel key={f.key} label={f.label} value={item[f.key]}
          options={[{value:"all",label:"All Products"},...prodOptions.map(p=>({value:p.id,label:p.name||"Unnamed"}))]}
          onChange={e=>onChange(f.key,e.target.value)}/>
      ):(
        <Inp key={f.key} label={f.label} type={f.numeric?"number":"text"}
          value={item[f.key]} placeholder={f.placeholder||""}
          onChange={e=>onChange(f.key,e.target.value)}/>
      ))}
    </div>
  );
}

/* ── AI CHAT ── */
async function callAI(messages){
  const res=await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      model:"claude-sonnet-4-20250514",max_tokens:1200,
      system:`You are FlexiBudget AI — a business budget setup assistant for Bangladesh businesses. Onboard users with 4-5 short focused questions, then generate a preset environment.

When ready, respond with a JSON block inside \`\`\`json ... \`\`\` containing:
{
  "ready": true,
  "amortizationMode": "projection",
  "products": [{"name":"","unit":"","price":0,"units":0,"growthPct":0,"cogs_material":0,"cogs_labor":0,"cogs_packaging":0,"cogs_other":0}],
  "setupCosts": [{"name":"","amount":0}],
  "fixedCosts": [{"name":"","amount":0}],
  "semiVariableCosts": [{"name":"","base":0,"ratePerUnit":0,"productRef":"all"}],
  "variableCosts": [{"name":"","ratePerUnit":0,"productRef":"all"}],
  "marketingFixed": [{"name":"","amount":0}],
  "marketingPerUnit": [{"name":"","ratePerUnit":0,"productRef":"all"}],
  "marketingPctRevenue": [{"name":"","pct":0,"revenueRef":"all"}],
  "projectionMonths": 12,
  "summary": "One sentence summary."
}
All amounts in BDT. Use realistic Bangladesh market values. Only include cogs for manufacturing/food/retail. Ask about amortization before generating. Be concise.`,
      messages,
    }),
  });
  const data=await res.json();
  return data.content?.[0]?.text||"Connection error. Please try again.";
}

function ChatPanel({businessType,onComplete,onSkip}){
  const bt=BUSINESS_TYPES.find(b=>b.id===businessType);
  const [msgs,setMsgs]=useState([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const endRef=useRef(null);

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      const reply=await callAI([{role:"user",content:`Business: ${bt?.label} (has_cogs: ${bt?.has_cogs}). Start setup.`}]);
      setMsgs([{role:"assistant",content:reply,id:uid()}]);
      setLoading(false);
    })();
  },[]);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,loading]);

  const send=async()=>{
    if(!input.trim()||loading) return;
    const userMsg={role:"user",content:input,id:uid()};
    const newMsgs=[...msgs,userMsg];
    setMsgs(newMsgs); setInput(""); setLoading(true);
    const apiMsgs=[{role:"user",content:`Business: ${bt?.label} (has_cogs: ${bt?.has_cogs})`},...newMsgs.map(m=>({role:m.role,content:m.content}))];
    const reply=await callAI(apiMsgs);
    setMsgs(prev=>[...prev,{role:"assistant",content:reply,id:uid()}]);
    setLoading(false);
    const jm=reply.match(/```json\s*([\s\S]*?)```/);
    if(jm){try{const env=JSON.parse(jm[1]);if(env.ready) setTimeout(()=>onComplete(env),800);}catch(_){}}
  };

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{flex:1,overflowY:"auto",paddingBottom:8}}>
        {msgs.map(m=>{
          const display=m.content.replace(/```json[\s\S]*?```/g,"").trim();
          return(
            <div key={m.id} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:10}}>
              <div style={{maxWidth:"84%",background:m.role==="user"?"#0f766e":"#1e293b",color:"#f1f5f9",
                borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",
                padding:"11px 14px",fontSize:14,lineHeight:1.6,whiteSpace:"pre-wrap"}}>
                {m.role==="assistant"&&<div style={{fontSize:9,color:"#5eead4",fontWeight:700,marginBottom:4,letterSpacing:"0.1em"}}>FLEXIBUDGET AI</div>}
                {display}
              </div>
            </div>
          );
        })}
        {loading&&(
          <div style={{display:"flex",justifyContent:"flex-start",marginBottom:10}}>
            <div style={{background:"#1e293b",borderRadius:"18px 18px 18px 4px",padding:"11px 14px"}}>
              <div style={{fontSize:9,color:"#5eead4",fontWeight:700,marginBottom:4,letterSpacing:"0.1em"}}>FLEXIBUDGET AI</div>
              <div style={{color:"#475569",fontSize:13}}>Thinking<span style={{animation:"blink 1s infinite"}}>...</span></div>
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>
      <div style={{display:"flex",gap:8,paddingTop:12,borderTop:"1px solid #1e293b"}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
          placeholder="Type your answer…"
          style={{...inputStyle,flex:1,fontSize:15}}/>
        <button onClick={send} disabled={loading||!input.trim()} style={{
          background:loading||!input.trim()?"#1e293b":"#0d9488",color:loading||!input.trim()?"#475569":"#fff",
          border:"none",borderRadius:12,padding:"13px 18px",fontSize:16,fontWeight:700,cursor:"pointer",
        }}>→</button>
      </div>
      <button onClick={onSkip} style={{background:"transparent",border:"none",color:"#475569",fontSize:12,marginTop:12,cursor:"pointer",fontFamily:"inherit",textAlign:"center",width:"100%"}}>
        Skip AI setup → go to calculator
      </button>
    </div>
  );
}

/* ── SECTIONS ── */
function ProductsSection({products,setProducts,hasCogs}){
  const upd=(id,k,v)=>setProducts(p=>p.map(x=>x.id===id?{...x,[k]:v}:x));
  return(
    <div>
      <SectionTitle title="Products" sub="Revenue = Units × Price. Each product can have its own COGS."/>
      {products.map(p=>(
        <div key={p.id} style={{background:"#111c2d",border:"1px solid #2d3f55",borderRadius:16,padding:16,marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontSize:13,fontWeight:700,color:"#5eead4"}}>Product</span>
            <RemoveBtn onClick={()=>setProducts(prev=>prev.filter(x=>x.id!==p.id))}/>
          </div>
          <Inp label="Product Name" value={p.name} onChange={e=>upd(p.id,"name",e.target.value)} placeholder="e.g. Sneakers"/>
          <Inp label="Unit Label" value={p.unit} onChange={e=>upd(p.id,"unit",e.target.value)} placeholder="pair / piece / kg"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Inp label={`Price ৳/${p.unit||"unit"}`} type="number" value={p.price} onChange={e=>upd(p.id,"price",e.target.value)}/>
            <Inp label="Units/Month" type="number" value={p.units} onChange={e=>upd(p.id,"units",e.target.value)}/>
          </div>
          <Inp label="Monthly Growth (%)" type="number" value={p.growthPct} onChange={e=>upd(p.id,"growthPct",e.target.value)}/>
          {hasCogs&&(
            <>
              <div style={{fontSize:11,color:AMBER,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8,marginTop:4}}>COGS per {p.unit||"unit"}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <Inp label="Raw Material ৳" type="number" value={p.cogs_material} onChange={e=>upd(p.id,"cogs_material",e.target.value)}/>
                <Inp label="Labor ৳" type="number" value={p.cogs_labor} onChange={e=>upd(p.id,"cogs_labor",e.target.value)}/>
                <Inp label="Packaging ৳" type="number" value={p.cogs_packaging} onChange={e=>upd(p.id,"cogs_packaging",e.target.value)}/>
                <Inp label="Other ৳" type="number" value={p.cogs_other} onChange={e=>upd(p.id,"cogs_other",e.target.value)}/>
              </div>
            </>
          )}
        </div>
      ))}
      <OutlineBtn full onClick={()=>setProducts(p=>[...p,mkProduct(hasCogs)])}>+ Add Product</OutlineBtn>
    </div>
  );
}

function SetupSection({items,setItems}){return(<div><SectionTitle title="Setup Costs" sub="One-time costs before launch. Amortized monthly."/>
  {items.map(c=><CostCard key={c.id} item={c} fields={[{key:"name",label:"Cost Name",placeholder:"e.g. Shop Renovation"},{key:"amount",label:"Total Amount (৳)",numeric:true}]} onChange={(k,v)=>setItems(p=>p.map(x=>x.id===c.id?{...x,[k]:v}:x))} onDelete={()=>setItems(p=>p.filter(x=>x.id!==c.id))}/>)}
  <OutlineBtn full onClick={()=>setItems(p=>[...p,mkSetup()])}>+ Add Setup Cost</OutlineBtn></div>);}

function FixedSection({items,setItems}){return(<div><SectionTitle title="Fixed Monthly" sub="Same cost every month regardless of sales."/>
  {items.map(c=><CostCard key={c.id} item={c} fields={[{key:"name",label:"Cost Name",placeholder:"e.g. Rent"},{key:"amount",label:"Amount/Month (৳)",numeric:true}]} onChange={(k,v)=>setItems(p=>p.map(x=>x.id===c.id?{...x,[k]:v}:x))} onDelete={()=>setItems(p=>p.filter(x=>x.id!==c.id))}/>)}
  <OutlineBtn full onClick={()=>setItems(p=>[...p,mkFixed()])}>+ Add Fixed Cost</OutlineBtn></div>);}

function SemiVarSection({items,setItems,products}){return(<div><SectionTitle title="Semi-Variable" sub="Base + Rate × Units. e.g. Electricity = ৳3000 + ৳5/unit"/>
  {items.map(c=><CostCard key={c.id} item={c} prodOptions={products} fields={[{key:"name",label:"Name",placeholder:"e.g. Electricity"},{key:"base",label:"Base/Month (৳)",numeric:true},{key:"ratePerUnit",label:"Rate per Unit (৳)",numeric:true},{key:"productRef",label:"Applies To",isSelect:true}]} onChange={(k,v)=>setItems(p=>p.map(x=>x.id===c.id?{...x,[k]:v}:x))} onDelete={()=>setItems(p=>p.filter(x=>x.id!==c.id))}/>)}
  <OutlineBtn full onClick={()=>setItems(p=>[...p,mkSemi()])}>+ Add Semi-Variable Cost</OutlineBtn></div>);}

function VarSection({items,setItems,products}){return(<div><SectionTitle title="Variable Costs" sub="Per unit sold or produced."/>
  {items.map(c=><CostCard key={c.id} item={c} prodOptions={products} fields={[{key:"name",label:"Name",placeholder:"e.g. Delivery per Order"},{key:"ratePerUnit",label:"Rate per Unit (৳)",numeric:true},{key:"productRef",label:"Applies To",isSelect:true}]} onChange={(k,v)=>setItems(p=>p.map(x=>x.id===c.id?{...x,[k]:v}:x))} onDelete={()=>setItems(p=>p.filter(x=>x.id!==c.id))}/>)}
  <OutlineBtn full onClick={()=>setItems(p=>[...p,mkVar()])}>+ Add Variable Cost</OutlineBtn></div>);}

function MarketingSection({mFixed,setMFixed,mUnit,setMUnit,mPct,setMPct,products}){
  const sub=(label,color)=><div style={{fontSize:11,color,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",margin:"16px 0 8px"}}>{label}</div>;
  return(<div>
    <SectionTitle title="Marketing" sub="Fixed, per-unit, and % of revenue marketing costs."/>
    {sub("Fixed Marketing",AMBER)}
    {mFixed.map(c=><CostCard key={c.id} item={c} fields={[{key:"name",label:"Name",placeholder:"e.g. Facebook Ads"},{key:"amount",label:"Amount/Month (৳)",numeric:true}]} onChange={(k,v)=>setMFixed(p=>p.map(x=>x.id===c.id?{...x,[k]:v}:x))} onDelete={()=>setMFixed(p=>p.filter(x=>x.id!==c.id))}/>)}
    <OutlineBtn small onClick={()=>setMFixed(p=>[...p,mkMktF()])}>+ Fixed Marketing</OutlineBtn>
    {sub("Per-Unit Marketing",AMBER)}
    {mUnit.map(c=><CostCard key={c.id} item={c} prodOptions={products} fields={[{key:"name",label:"Name",placeholder:"e.g. Promo Insert"},{key:"ratePerUnit",label:"Rate/Unit (৳)",numeric:true},{key:"productRef",label:"Applies To",isSelect:true}]} onChange={(k,v)=>setMUnit(p=>p.map(x=>x.id===c.id?{...x,[k]:v}:x))} onDelete={()=>setMUnit(p=>p.filter(x=>x.id!==c.id))}/>)}
    <OutlineBtn small onClick={()=>setMUnit(p=>[...p,mkMktU()])}>+ Per-Unit Marketing</OutlineBtn>
    {sub("% of Revenue Marketing",AMBER)}
    {mPct.map(c=><CostCard key={c.id} item={c} prodOptions={products} fields={[{key:"name",label:"Name",placeholder:"e.g. Marketplace Commission"},{key:"pct",label:"% of Revenue",numeric:true},{key:"revenueRef",label:"Revenue Base",isSelect:true}]} onChange={(k,v)=>setMPct(p=>p.map(x=>x.id===c.id?{...x,[k]:v}:x))} onDelete={()=>setMPct(p=>p.filter(x=>x.id!==c.id))}/>)}
    <OutlineBtn small onClick={()=>setMPct(p=>[...p,mkMktP()])}>+ % Revenue Marketing</OutlineBtn>
  </div>);
}

function ResultsSection({monthlyData,breakeven,hasCogs}){
  if(!monthlyData.length) return <p style={{color:"#64748b",fontSize:14,textAlign:"center",marginTop:40}}>Add products and costs to see results.</p>;
  const tot=monthlyData.reduce((a,m)=>({revenue:a.revenue+m.revenue,cogs:a.cogs+m.cogs,totalCosts:a.totalCosts+m.totalCosts,netPnL:a.netPnL+m.netPnL}),{revenue:0,cogs:0,totalCosts:0,netPnL:0});
  const avgMargin=monthlyData.reduce((s,m)=>s+m.margin,0)/monthlyData.length;
  const pieData=[
    {name:"Fixed",   value:monthlyData.reduce((s,m)=>s+m.fixedTotal,0)},
    {name:"Variable",value:monthlyData.reduce((s,m)=>s+m.varTotal,0)},
    {name:"Semi-Var",value:monthlyData.reduce((s,m)=>s+m.semiTotal,0)},
    {name:"Mkt",     value:monthlyData.reduce((s,m)=>s+m.mktTotal,0)},
    {name:"Setup",   value:monthlyData.reduce((s,m)=>s+m.amortPerMonth,0)},
  ].filter(d=>d.value>0);

  return(
    <div>
      <SectionTitle title="PnL Results" sub={`${monthlyData.length}-month projection — all amounts in BDT`}/>

      {/* KPI grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
        <KpiCard label="Total Revenue" value={fmt(tot.revenue)} color="teal"/>
        <KpiCard label="Total Costs" value={fmt(tot.totalCosts)} color="amber"/>
        <KpiCard label={tot.netPnL>=0?"Net Profit":"Net Loss"} value={fmt(Math.abs(tot.netPnL))} color={tot.netPnL>=0?"green":"red"}/>
        <KpiCard label="Avg Net Margin" value={pct(avgMargin)} color={avgMargin>=0?"green":"red"}/>
        {hasCogs&&<KpiCard label="Total COGS" value={fmt(tot.cogs)} color="amber"/>}
        {breakeven&&<KpiCard label="Breakeven Units/Mo" value={breakeven.breakUnits.toLocaleString()} color="teal"/>}
      </div>

      {/* Breakeven box */}
      {breakeven&&(
        <div style={{background:"#042f2e",border:"1px solid #0f766e",borderRadius:14,padding:14,marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,color:"#5eead4",marginBottom:10}}>🎯 Breakeven Analysis</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div><div style={{fontSize:10,color:"#64748b"}}>Units/Month</div><div style={{fontSize:20,fontWeight:800,color:"#5eead4"}}>{breakeven.breakUnits.toLocaleString()}</div></div>
            <div><div style={{fontSize:10,color:"#64748b"}}>Revenue/Month</div><div style={{fontSize:16,fontWeight:700,color:"#5eead4"}}>{fmt(breakeven.breakRevenue)}</div></div>
          </div>
        </div>
      )}

      {/* Chart: Revenue vs Costs */}
      <div style={{background:"#111c2d",border:"1px solid #2d3f55",borderRadius:14,padding:14,marginBottom:12}}>
        <div style={{fontSize:13,fontWeight:700,color:"#cbd5e1",marginBottom:10}}>Revenue vs Total Costs</div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={monthlyData} margin={{left:-18,right:4,top:4}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
            <XAxis dataKey="month" tick={{fill:"#64748b",fontSize:10}}/>
            <YAxis tick={{fill:"#64748b",fontSize:9}} tickFormatter={v=>"৳"+Math.round(v/1000)+"k"}/>
            <Tooltip formatter={v=>fmt(v)} contentStyle={{background:"#0f172a",border:"1px solid #2d3f55",borderRadius:8,fontSize:12}}/>
            <Line type="monotone" dataKey="revenue" stroke={TEAL} strokeWidth={2.5} dot={false} name="Revenue"/>
            <Line type="monotone" dataKey="totalCosts" stroke={AMBER} strokeWidth={2} dot={false} name="Costs"/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart: Net PnL */}
      <div style={{background:"#111c2d",border:"1px solid #2d3f55",borderRadius:14,padding:14,marginBottom:12}}>
        <div style={{fontSize:13,fontWeight:700,color:"#cbd5e1",marginBottom:10}}>Monthly Net PnL</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={monthlyData} margin={{left:-18,right:4,top:4}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
            <XAxis dataKey="month" tick={{fill:"#64748b",fontSize:10}}/>
            <YAxis tick={{fill:"#64748b",fontSize:9}} tickFormatter={v=>"৳"+Math.round(v/1000)+"k"}/>
            <Tooltip formatter={v=>fmt(v)} contentStyle={{background:"#0f172a",border:"1px solid #2d3f55",borderRadius:8,fontSize:12}}/>
            <ReferenceLine y={0} stroke="#475569"/>
            <Bar dataKey="netPnL" radius={[4,4,0,0]} name="Net PnL">
              {monthlyData.map((m,i)=><Cell key={i} fill={m.netPnL>=0?GREEN:RED}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cost breakdown pie */}
      {pieData.length>0&&(
        <div style={{background:"#111c2d",border:"1px solid #2d3f55",borderRadius:14,padding:14,marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:700,color:"#cbd5e1",marginBottom:10}}>Cost Breakdown</div>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <PieChart width={120} height={120}>
              <Pie data={pieData} cx={55} cy={55} innerRadius={30} outerRadius={55} dataKey="value" paddingAngle={2}>
                {pieData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
              </Pie>
              <Tooltip formatter={v=>fmt(v)} contentStyle={{background:"#0f172a",border:"1px solid #2d3f55",borderRadius:8,fontSize:11}}/>
            </PieChart>
            <div style={{flex:1}}>
              {pieData.map((d,i)=>(
                <div key={d.name} style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:PIE_COLORS[i%PIE_COLORS.length],flexShrink:0}}/>
                  <span style={{fontSize:11,color:"#94a3b8",flex:1}}>{d.name}</span>
                  <span style={{fontSize:11,color:"#f1f5f9",fontWeight:600}}>{fmt(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PnL Table */}
      <div style={{background:"#111c2d",border:"1px solid #2d3f55",borderRadius:14,padding:14}}>
        <div style={{fontSize:13,fontWeight:700,color:"#cbd5e1",marginBottom:10}}>Full PnL Table</div>
        <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
          <table style={{borderCollapse:"collapse",fontSize:11,whiteSpace:"nowrap",width:"100%"}}>
            <thead>
              <tr style={{borderBottom:"1px solid #2d3f55"}}>
                {["Month","Revenue",hasCogs?"COGS":null,"Gross","Fixed","Semi","Var","Mkt","Setup","Total Costs","Net PnL","Margin"].filter(Boolean).map(h=>(
                  <th key={h} style={{color:"#64748b",fontWeight:600,padding:"4px 12px 8px 0",textAlign:"left"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthlyData.map(m=>(
                <tr key={m.m} style={{borderBottom:"1px solid #0d1525"}}>
                  <td style={{padding:"7px 12px 7px 0",color:"#94a3b8"}}>{m.month}</td>
                  <td style={{padding:"7px 12px 7px 0",color:"#f1f5f9"}}>{fmt(m.revenue)}</td>
                  {hasCogs&&<td style={{padding:"7px 12px 7px 0",color:"#c4b5fd"}}>{fmt(m.cogs)}</td>}
                  <td style={{padding:"7px 12px 7px 0",color:"#f1f5f9"}}>{fmt(m.gross)}</td>
                  <td style={{padding:"7px 12px 7px 0",color:"#94a3b8"}}>{fmt(m.fixedTotal)}</td>
                  <td style={{padding:"7px 12px 7px 0",color:"#94a3b8"}}>{fmt(m.semiTotal)}</td>
                  <td style={{padding:"7px 12px 7px 0",color:"#94a3b8"}}>{fmt(m.varTotal)}</td>
                  <td style={{padding:"7px 12px 7px 0",color:"#fbbf24"}}>{fmt(m.mktTotal)}</td>
                  <td style={{padding:"7px 12px 7px 0",color:"#475569"}}>{fmt(m.amortPerMonth)}</td>
                  <td style={{padding:"7px 12px 7px 0",color:"#fbbf24",fontWeight:600}}>{fmt(m.totalCosts)}</td>
                  <td style={{padding:"7px 12px 7px 0",fontWeight:700,color:m.netPnL>=0?"#4ade80":"#f87171"}}>{fmt(m.netPnL)}</td>
                  <td style={{padding:"7px 0",fontWeight:600,color:m.margin>=0?"#4ade80":"#f87171"}}>{pct(m.margin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── PROJECTION BOTTOM SHEET ── */
function ProjSheet({open,onClose,projMonths,setProjMonths,amortMode,setAmortMode}){
  if(!open) return null;
  return(
    <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.65)"}}/>
      <div style={{position:"relative",background:"#1e293b",borderRadius:"22px 22px 0 0",padding:"20px 20px 40px"}}>
        <div style={{width:36,height:4,background:"#334155",borderRadius:2,margin:"0 auto 20px"}}/>
        <div style={{fontSize:17,fontWeight:800,color:"#f1f5f9",marginBottom:20}}>Projection Settings</div>
        <label style={{...labelStyle}}>Projection Length — <span style={{color:"#5eead4"}}>{projMonths} months</span></label>
        <input type="range" min={1} max={36} value={projMonths} onChange={e=>setProjMonths(Number(e.target.value))}
          style={{width:"100%",accentColor:"#0d9488",height:6,marginBottom:20,cursor:"pointer"}}/>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#475569",marginTop:-14,marginBottom:18}}>
          <span>1M</span><span>12M</span><span>24M</span><span>36M</span>
        </div>
        <Sel label="Setup Cost Spread" value={amortMode} onChange={e=>setAmortMode(e.target.value)}
          options={[{value:"projection",label:`Spread over ${projMonths} months`},{value:"12months",label:"Spread over 12 months"}]}/>
        <PrimaryBtn full onClick={onClose}>Done</PrimaryBtn>
      </div>
    </div>
  );
}

/* ── MAIN APP ── */
export default function FlexiBudgetAI(){
  const [step,setStep]=useState("select");
  const [businessType,setBusinessType]=useState(null);
  const [hasCogs,setHasCogs]=useState(false);
  const [activeSection,setActiveSection]=useState("products");
  const [sheetOpen,setSheetOpen]=useState(false);

  const [products,setProducts]=useState([]);
  const [setupCosts,setSetupCosts]=useState([]);
  const [fixedCosts,setFixedCosts]=useState([]);
  const [semiVarCosts,setSemiVarCosts]=useState([]);
  const [varCosts,setVarCosts]=useState([]);
  const [mktFixed,setMktFixed]=useState([]);
  const [mktUnit,setMktUnit]=useState([]);
  const [mktPct,setMktPct]=useState([]);
  const [projMonths,setProjMonths]=useState(12);
  const [amortMode,setAmortMode]=useState("projection");

  const loadEnv=(env)=>{
    const ids=(arr=[])=>arr.map(x=>({...x,id:uid()}));
    setProducts(ids(env.products||[]).map(p=>({...p,growthPct:p.growthPct||0})));
    setSetupCosts(ids(env.setupCosts));
    setFixedCosts(ids(env.fixedCosts));
    setSemiVarCosts(ids(env.semiVariableCosts));
    setVarCosts(ids(env.variableCosts));
    setMktFixed(ids(env.marketingFixed));
    setMktUnit(ids(env.marketingPerUnit));
    setMktPct(ids(env.marketingPctRevenue));
    setProjMonths(env.projectionMonths||12);
    setAmortMode(env.amortizationMode||"projection");
    setStep("calculator");
  };

  const bt=BUSINESS_TYPES.find(b=>b.id===businessType);
  const calcProps={products,setupCosts,fixedCosts,semiVariableCosts:semiVarCosts,variableCosts:varCosts,marketingFixed:mktFixed,marketingPerUnit:mktUnit,marketingPctRevenue:mktPct,projectionMonths:projMonths,amortizationMode:amortMode,hasCogs};
  const monthlyData=calcMonthlyData(calcProps);
  const breakeven=calcBreakeven(calcProps);
  const totNetPnL=monthlyData.reduce((s,m)=>s+m.netPnL,0);
  const totRev=monthlyData.reduce((s,m)=>s+m.revenue,0);
  const totCosts=monthlyData.reduce((s,m)=>s+m.totalCosts,0);

  const navItems=[
    {id:"products", label:"Products", icon:"📦"},
    {id:"setup",    label:"Setup",    icon:"🔧"},
    {id:"fixed",    label:"Fixed",    icon:"📌"},
    {id:"semi",     label:"Semi-Var", icon:"⚡"},
    {id:"variable", label:"Variable", icon:"📈"},
    {id:"marketing",label:"Mkt",      icon:"📣"},
    {id:"results",  label:"Results",  icon:"💹"},
  ];

  const baseStyle={background:"#0b1120",minHeight:"100dvh",fontFamily:"'DM Sans',sans-serif",color:"#f1f5f9",WebkitFontSmoothing:"antialiased"};

  /* SELECT */
  if(step==="select") return(
    <div style={{...baseStyle,overflowY:"auto"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>{`* { -webkit-tap-highlight-color: transparent; box-sizing: border-box; } input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }`}</style>
      <div style={{padding:"44px 20px 40px"}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontSize:56,marginBottom:12}}>💹</div>
          <h1 style={{fontSize:30,fontWeight:800,color:"#f1f5f9",margin:0,letterSpacing:"-0.5px"}}>FlexiBudget AI</h1>
          <p style={{color:"#64748b",fontSize:14,marginTop:8}}>AI-powered PnL calculator for any business</p>
        </div>
        <p style={{fontSize:11,color:"#475569",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>Choose your business type</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {BUSINESS_TYPES.map(b=>(
            <button key={b.id} onClick={()=>{setBusinessType(b.id);setHasCogs(b.has_cogs===true);setStep("chat");}}
              style={{background:"#1a2438",border:"1.5px solid #2d3f55",borderRadius:16,padding:"18px 14px",textAlign:"left",cursor:"pointer",fontFamily:"inherit",WebkitTapHighlightColor:"transparent"}}>
              <div style={{fontSize:28,marginBottom:8}}>{b.icon}</div>
              <div style={{fontSize:13,fontWeight:600,color:"#e2e8f0",lineHeight:1.3}}>{b.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  /* CHAT */
  if(step==="chat") return(
    <div style={{...baseStyle,display:"flex",flexDirection:"column",height:"100dvh"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>{`* { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }`}</style>
      <div style={{background:"#0a1120",borderBottom:"1px solid #1e293b",padding:"14px 16px",display:"flex",alignItems:"center",gap:12,flexShrink:0,paddingTop:"calc(14px + env(safe-area-inset-top))"}}>
        <button onClick={()=>setStep("select")} style={{background:"transparent",border:"none",color:"#64748b",fontSize:22,cursor:"pointer",padding:"4px 8px 4px 0",lineHeight:1}}>←</button>
        <span style={{fontSize:26}}>{bt?.icon}</span>
        <div>
          <div style={{fontSize:15,fontWeight:700,color:"#f1f5f9"}}>{bt?.label}</div>
          <div style={{fontSize:11,color:"#0d9488",fontWeight:600}}>AI Setup</div>
        </div>
      </div>
      <div style={{flex:1,overflow:"hidden",padding:16,display:"flex",flexDirection:"column",minHeight:0}}>
        <ChatPanel businessType={businessType} onComplete={loadEnv}
          onSkip={()=>{setProducts([mkProduct(hasCogs)]);setStep("calculator");}}/>
      </div>
    </div>
  );

  /* CALCULATOR */
  return(
    <div style={{...baseStyle,display:"flex",flexDirection:"column",height:"100dvh"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>{`* { -webkit-tap-highlight-color: transparent; box-sizing: border-box; } input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;} input[type=range]{cursor:pointer;}`}</style>
      <ProjSheet open={sheetOpen} onClose={()=>setSheetOpen(false)} projMonths={projMonths} setProjMonths={setProjMonths} amortMode={amortMode} setAmortMode={setAmortMode}/>

      {/* Header */}
      <div style={{background:"#060e1c",borderBottom:"1px solid #1e293b",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,paddingTop:"calc(12px + env(safe-area-inset-top))"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setStep("select")} style={{background:"transparent",border:"none",color:"#64748b",fontSize:20,cursor:"pointer",padding:"4px 8px 4px 0",lineHeight:1}}>←</button>
          <span style={{fontSize:20}}>{bt?.icon}</span>
          <span style={{fontSize:14,fontWeight:700,color:"#f1f5f9"}}>{bt?.label}</span>
        </div>
        <button onClick={()=>setSheetOpen(true)} style={{background:"#1e293b",border:"1px solid #334155",borderRadius:10,padding:"8px 13px",fontSize:12,color:"#94a3b8",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>
          ⚙️ {projMonths}M
        </button>
      </div>

      {/* PnL strip */}
      <div style={{background:"#0a1422",borderBottom:"1px solid #1e293b",padding:"10px 14px",display:"flex",gap:8,overflowX:"auto",flexShrink:0,WebkitOverflowScrolling:"touch"}}>
        {[
          {l:"Revenue",v:fmt(totRev),c:"#5eead4"},
          {l:"Costs",v:fmt(totCosts),c:"#fbbf24"},
          {l:totNetPnL>=0?"▲ Profit":"▼ Loss",v:fmt(Math.abs(totNetPnL)),c:totNetPnL>=0?"#4ade80":"#f87171"},
        ].map(x=>(
          <div key={x.l} style={{flexShrink:0,background:"#1a2438",borderRadius:10,padding:"7px 12px",display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:10,color:"#64748b",fontWeight:600}}>{x.l}</span>
            <span style={{fontSize:13,fontWeight:800,color:x.c}}>{x.v}</span>
          </div>
        ))}
      </div>

      {/* Main scroll area */}
      <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"18px 16px 110px"}}>
        {activeSection==="products"  &&<ProductsSection products={products} setProducts={setProducts} hasCogs={hasCogs}/>}
        {activeSection==="setup"     &&<SetupSection items={setupCosts} setItems={setSetupCosts}/>}
        {activeSection==="fixed"     &&<FixedSection items={fixedCosts} setItems={setFixedCosts}/>}
        {activeSection==="semi"      &&<SemiVarSection items={semiVarCosts} setItems={setSemiVarCosts} products={products}/>}
        {activeSection==="variable"  &&<VarSection items={varCosts} setItems={setVarCosts} products={products}/>}
        {activeSection==="marketing" &&<MarketingSection mFixed={mktFixed} setMFixed={setMktFixed} mUnit={mktUnit} setMUnit={setMktUnit} mPct={mktPct} setMPct={setMktPct} products={products}/>}
        {activeSection==="results"   &&<ResultsSection monthlyData={monthlyData} breakeven={breakeven} hasCogs={hasCogs}/>}
      </div>

      {/* Bottom tab bar */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#060e1c",borderTop:"1px solid #1e293b",display:"flex",zIndex:100,paddingBottom:"env(safe-area-inset-bottom)"}}>
        {navItems.map(n=>(
          <button key={n.id} onClick={()=>setActiveSection(n.id)} style={{
            flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            padding:"10px 2px 8px",background:"transparent",border:"none",cursor:"pointer",
            borderTop:activeSection===n.id?"2.5px solid #0d9488":"2.5px solid transparent",
            fontFamily:"inherit",WebkitTapHighlightColor:"transparent",
          }}>
            <span style={{fontSize:19,marginBottom:2}}>{n.icon}</span>
            <span style={{fontSize:9,fontWeight:700,color:activeSection===n.id?"#5eead4":"#475569",letterSpacing:"0.02em",textTransform:"uppercase"}}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
