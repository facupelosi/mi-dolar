export const PESOS_SOURCE='https://api.argentinadatos.com/v1/finanzas/fci/otros/ultimo';
const products={
 'NARANJA X':{id:'nx',name:'Naranja X',group:'nx',minimum:0,type:'Cuenta remunerada',url:'https://www.naranjax.com/cuenta-remunerada',note:'Activá la TNA. El saldo debe permanecer hasta el cierre diario. El excedente del tope no genera intereses.'},
 'UALA':{id:'uala-base',name:'Ualá · tasa base',group:'uala',minimum:10000,type:'Cuenta remunerada',url:'https://www.uala.com.ar/inversiones/cuenta-remunerada'},
 'UALA PLUS 1':{id:'uala-plus1',name:'Ualá · Plus 1',group:'uala',minimum:10000,type:'Cuenta remunerada',url:'https://www.uala.com.ar/inversiones/cuenta-remunerada'},
 'UALA PLUS 2':{id:'uala-plus2',name:'Ualá · Plus 2',group:'uala',minimum:10000,type:'Cuenta remunerada',url:'https://www.uala.com.ar/inversiones/cuenta-remunerada'},
 'FIWIND':{id:'fiwind',name:'Fiwind',group:'fiwind',minimum:1,type:'FCI con bonificación',url:'https://help.fiwind.io/es/articles/11723346-tus-primeros-pesos-rinden-mas',note:'Requiere activar rendimientos. FCI con riesgo de inversión: no es un depósito bancario. Sobre el excedente se aplica una tasa variable del fondo, no estimada aquí. La acreditación diaria requiere generar al menos $0,01.'}
};
export const argentinaDay=(now=Date.now())=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Argentina/Buenos_Aires',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));
const dateValid=(value,now)=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value&&value<=argentinaDay(now);
export function normalizePesos(raw,now=Date.now()){
 if(!Array.isArray(raw))throw new Error('Respuesta de tasas inválida');
 const rows=[],seen=new Set();let rejected=0;
 for(const row of raw){const meta=Object.hasOwn(products,row?.fondo)?products[row.fondo]:null;if(!meta)continue;
  if(seen.has(meta.id)||typeof row.tna!=='number'||!Number.isFinite(row.tna)||row.tna<0||row.tna>1||typeof row.tope!=='number'||!Number.isFinite(row.tope)||row.tope<=0||!dateValid(row.fecha,now)||typeof row.condiciones!=='string'||row.condiciones.length>3000||row.plazoMinDias!==0||row.plazoMaxDias!==0){rejected++;continue;}
  if(meta.id.startsWith('uala-plus')&&!row.condiciones.trim()){rejected++;continue;}
  seen.add(meta.id);rows.push({...meta,fondo:row.fondo,tna:row.tna,cap:row.tope,date:row.fecha,conditions:row.condiciones.replace(/¡La más alta del mercado!/gi,'').trim(),note:meta.note||'Tasa variable. Mantener al menos $10.000 al cierre diario. El excedente del tope no genera intereses. Confirmá que la tasa elegida ya esté activa en tu app.'});
 }
 if(!rows.length)throw new Error('Sin tasas válidas de las opciones cubiertas');
 return{rows,rejected};
}
export function pesosFresh(row,now=Date.now()){return dateValid(row.date,now)&&Date.parse(argentinaDay(now))-Date.parse(row.date)<=3*86400000;}
export function estimatePesos(row,amount,days){
 if(!Number.isFinite(amount)||amount<=0||amount>1e9||!Number.isInteger(days)||days<1||days>90)throw new Error('Monto o plazo inválido');
 const principal=amount>=row.minimum?Math.min(amount,row.cap):0;
 const daily=principal*row.tna/365;const gain=row.id==='fiwind'&&daily<0.01?0:daily*days;
 return{principal,gain,total:amount+gain,excess:Math.max(0,amount-row.cap),belowMinimum:amount<row.minimum,partial:row.id==='fiwind'&&amount>row.cap};
}
export function comparePesos(rows,{amount,days,tier='uala-base',includeFci=false,now=Date.now()}){
 if(!['uala-base','uala-plus1','uala-plus2'].includes(tier))throw new Error('Tasa Ualá inválida');
 return rows.filter(row=>row.group==='nx'||(row.group==='uala'&&row.id===tier)||(row.group==='fiwind'&&includeFci)).map(row=>({...row,...estimatePesos(row,amount,days),fresh:pesosFresh(row,now)})).sort((a,b)=>Number(b.fresh)-Number(a.fresh)||b.gain-a.gain||a.id.localeCompare(b.id));
}
export function mergePesos(previous,incoming){const map=new Map(previous.map(row=>[row.id,row]));for(const row of incoming){const old=map.get(row.id);if(!old||row.date>=old.date)map.set(row.id,row);}return[...map.values()];}

export function bestPesos(rows,status){return status==='ok'?rows.find(row=>row.fresh&&!row.partial&&!row.belowMinimum&&row.gain>=0.01)||null:null;}
