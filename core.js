export const MAX_AGE=120000;
export function parseAmount(raw){const text=String(raw).trim();if(!/^\d+(?:[.,]\d{1,2})?$/.test(text))return NaN;const n=Number(text.replace(',','.'));return n>0&&n<=1e9?n:NaN;}
const finite=n=>typeof n==='number'&&Number.isFinite(n)&&n>0;
export function quality(q,now=Date.now()){
 const time=Date.parse(q.at);if(!finite(q.ask)||!finite(q.bid)||q.ask<q.bid)return 'Precio inválido';
 if(!Number.isFinite(time)||time>now+60000)return 'Fecha inválida';
 if(q.conflict)return 'Diferencia entre fuentes';if(q.stale||now-time>MAX_AGE)return 'Dato demorado';return null;
}
export function calculate(q,n,mode,unit){const rate=mode==='buy'?q.ask:q.bid;return unit==='usd'?n*rate:n/rate;}
export function normalizeComparadolar(data){if(!Array.isArray(data))throw new Error('Respuesta no válida');return data.filter(q=>q&&['Oficial','MEP'].includes(q.usdType)&&typeof q.slug==='string').map(q=>({id:q.slug,name:String(q.prettyName||q.slug),ask:q.ask,bid:q.bid,at:q.lastSeenAt,stale:q.stale===true,market:q.usdType,condition:q.conditions?String(q.conditions):'',source:'Compará Dólar',url:q.url,knownFees:q.usdType==='Oficial'&&['uala','brubank-ultra'].includes(q.slug)}));}
export const bankMap={bna:'banco-nacion',bapro:'banco-provincia',ciudad:'banco-ciudad',hipotecario:'banco-hipotecario',icbc:'icbc',supervielle:'banco-supervielle',pluscambio:'plus',prex:'prex',andina:'andina',comafi:'comafi',mariva:'mariva',plazacambio:'plazacambio',triacambio:'triacambio'};
// Retain delayed quotes for display. They must never displace a fresh quote.
export function references(quotes,{market,selected,ultra,now=Date.now()}){
 return quotes.filter(q=>q.market===market&&selected(q.id)&&[null,'Dato demorado'].includes(quality(q,now))&&(!q.condition||(q.id==='brubank-ultra'&&ultra)));
}
export function bestReference(quotes,config){const all=references(quotes,config);const fresh=all.filter(q=>!quality(q,config.now));let pool=fresh.length?fresh:all;if(!fresh.length&&pool.length){const newest=Math.max(...pool.map(q=>Date.parse(q.at)));pool=pool.filter(q=>newest-Date.parse(q.at)<=120000);}return pool.sort((a,b)=>config.mode==='buy'?a.ask-b.ask:b.bid-a.bid)[0]||null;}

// Source observations remain separate so a newer aggregator cannot erase provenance.
export function normalizeBanks(data){
 if(!data||typeof data!=='object'||Array.isArray(data))throw new Error('Respuesta no válida');
 return Object.entries(bankMap).filter(([key])=>data[key]).map(([key,id])=>{const b=data[key],stamp=Number(b.time)*1000;return{id,name:({bna:'Banco Nación',bapro:'Banco Provincia',ciudad:'Banco Ciudad',hipotecario:'Banco Hipotecario',supervielle:'Banco Supervielle',pluscambio:'Plus',prex:'Prex',andina:'Andina',comafi:'Comafi',mariva:'Mariva',plazacambio:'Plaza Cambio',triacambio:'Tria Cambio'})[key]||key.toUpperCase(),ask:b.totalAsk,bid:b.totalBid,at:Number.isFinite(stamp)&&Math.abs(stamp)<8640000000000000?new Date(stamp).toISOString():'',market:'Oficial',condition:'',source:'CriptoYa',knownFees:false};});
}
export function validObservation(q,now=Date.now()){
 if(!q||!['Oficial','MEP'].includes(q.market)||typeof q.id!=='string'||!['Compará Dólar','CriptoYa'].includes(q.source))return false;
 return finite(q.ask)&&finite(q.bid)&&q.ask>=q.bid&&Number.isFinite(Date.parse(q.at))&&Date.parse(q.at)<=now+60000;
}
const observationKey=q=>[q.id,q.market,q.condition||'',q.source].join('|');
export function ingest(previous,incoming,now=Date.now()){
 const kept=new Map(previous.filter(q=>validObservation(q,now)).map(q=>[observationKey(q),q]));
 let rejected=0,regressions=0;const changes=[];
 for(const q of incoming){if(!validObservation(q,now)){rejected++;continue;}const key=observationKey(q),old=kept.get(key);
 if(old&&Date.parse(q.at)<Date.parse(old.at)){regressions++;continue;}
 if(!old||q.at!==old.at||q.ask!==old.ask||q.bid!==old.bid||q.stale!==old.stale)changes.push({...q,receivedAt:new Date(now).toISOString()});
 kept.set(key,{...q,receivedAt:new Date(now).toISOString()});
 }
 return{observations:[...kept.values()],rejected,regressions,changes};
}
export function reconcile(observations,now=Date.now()){
 const groups=new Map();for(const q of observations.filter(q=>validObservation(q,now))){const key=[q.id,q.market,q.condition||''].join('|');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(q);}
 return [...groups.values()].map(rows=>{rows.sort((a,b)=>Date.parse(b.at)-Date.parse(a.at));const selected=rows[0];
 const fresh=rows.filter(q=>!q.stale&&now-Date.parse(q.at)<=MAX_AGE);
 const conflict=fresh.some(a=>fresh.some(b=>Math.abs(a.ask-b.ask)/Math.max(a.ask,b.ask)>.003||Math.abs(a.bid-b.bid)/Math.max(a.bid,b.bid)>.003));
 const metadata=rows.find(q=>q.source==='Compará Dólar')||selected;
 return{...selected,name:metadata.name,url:metadata.url,knownFees:rows.some(q=>q.knownFees),conflict,provenance:rows.map(q=>({source:q.source,at:q.at,receivedAt:q.receivedAt,ask:q.ask,bid:q.bid})),crossChecked:fresh.length>1&&!conflict};
 });
}
export function recordHealth(history,sample){return [...history,sample].slice(-60);}
export function healthSummary(history,source){const runs=history.filter(r=>r.source===source);const ok=runs.filter(r=>r.ok);return{runs:runs.length,successes:ok.length,last:runs.at(-1)||null,rejected:runs.reduce((s,r)=>s+(r.rejected||0),0),regressions:runs.reduce((s,r)=>s+(r.regressions||0),0)};}
export function resolveFavorites(quotes,config){
 const base=config.selected;
 if(!config.favoritesOnly)return{selected:base,fallback:false};
 const favoriteSelected=id=>base(id)&&config.favorites.has(id);
 const available=references(quotes,{...config,selected:favoriteSelected});
 if(available.length)return{selected:favoriteSelected,fallback:false};
 return{selected:base,fallback:true};
}
