// Public sheet used by the official Brubank website. No API key or account.
export const BRUBANK_URL='https://docs.google.com/spreadsheets/d/1KG0uD9hojsYyRY4BltuNJByUwygHUBuo5dWdm5uIbrw/gviz/tq?tqx=out:json&sheet=143BBK&range=A1:B1';
export function parseBrubankReference(raw,receivedAt=Date.now()){
 if(typeof raw!=='string'||raw.length>100000)throw new Error('Respuesta inesperada');
 const match=raw.match(/^\s*\/\*O_o\*\/\s*google\.visualization\.Query\.setResponse\(([\s\S]*)\);?\s*$/);
 if(!match)throw new Error('Formato inesperado');
 const body=JSON.parse(match[1]);
 if(body.status!=='ok'||body.table?.rows?.length!==1)throw new Error('Tabla inesperada');
 const cells=body.table.rows[0].c;
 if(!Array.isArray(cells)||cells.length!==2)throw new Error('Celdas inesperadas');
 const parse=cell=>{if(!cell||!['string','number'].includes(typeof cell.v)||!/^\d+(?:\.\d+)?$/.test(String(cell.v)))throw new Error('Precio inválido');const n=Number(cell.v);if(!Number.isFinite(n)||n<=0)throw new Error('Precio inválido');return n;};
 const ask=parse(cells[0]),bid=parse(cells[1]);
 if(ask<bid||!Number.isFinite(receivedAt))throw new Error('Referencia inválida');
 return{ask,bid,receivedAt:new Date(receivedAt).toISOString(),observedAt:null,plan:null};
}
export function validBrubankCache(value,now=Date.now()){
 return !!value&&typeof value.ask==='number'&&Number.isFinite(value.ask)&&typeof value.bid==='number'&&Number.isFinite(value.bid)&&value.bid>0&&value.ask>=value.bid&&value.observedAt===null&&value.plan===null&&Number.isFinite(Date.parse(value.receivedAt))&&Date.parse(value.receivedAt)<=now+60000;
}
export async function fetchBrubankReference(){
 const response=await fetch(BRUBANK_URL,{signal:AbortSignal.timeout(15000),cache:'no-store',credentials:'omit'});
 if(!response.ok)throw new Error('HTTP '+response.status);
 return parseBrubankReference(await response.text());
}
