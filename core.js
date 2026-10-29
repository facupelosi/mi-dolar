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
export function mergeBanks(quotes,data,now=Date.now()){
 const out=quotes.map(q=>({...q}));if(!data||typeof data!=='object'||Array.isArray(data))throw new Error('Respuesta no válida');
 for(const [key,id]of Object.entries(bankMap)){const b=data[key];if(!b)continue;const stamp=Number(b.time)*1000;const q={id,name:({prex:'Prex',andina:'Andina',comafi:'Comafi',mariva:'Mariva',plazacambio:'Plaza Cambio',triacambio:'Tria Cambio'})[key]||key,ask:b.totalAsk,bid:b.totalBid,at:Number.isFinite(stamp)?new Date(stamp).toISOString():'',market:'Oficial',condition:'',source:'CriptoYa',knownFees:false};const existing=out.find(a=>a.id===id);if(existing){if(!quality(q,now)&&!quality(existing,now)){if(Math.abs(existing.ask-q.ask)/existing.ask>.003||Math.abs(existing.bid-q.bid)/existing.bid>.003)existing.conflict=true;else existing.source+=' + CriptoYa';} }else out.push(q);}
 return out;
}
export function ranked(quotes,{mode,market,selected,ultra,now=Date.now(),confirmed=false}){return quotes.filter(q=>q.market===market&&selected(q.id)&&!quality(q,now)&&(!q.condition||(q.id==='brubank-ultra'&&ultra))&&(!confirmed||q.knownFees)).sort((a,b)=>mode==='buy'?a.ask-b.ask:b.bid-a.bid);}
