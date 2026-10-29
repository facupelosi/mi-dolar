import{argentinaDay,pesosFresh}from'./pesos.js?v=9';
export const FUND_SOURCE='https://api.argentinadatos.com/v1/finanzas/fci/comparatasas';
export const FIXED_SOURCE='https://api.argentinadatos.com/v1/finanzas/tasas/plazoFijo';
export const fundMappings={
 'Mercado Fondo - Clase A':{id:'mercado-pago',name:'Mercado Pago',url:'https://estadisticas.cafci.org.ar/fondos/798?clase=1982'},
 'Delta Pesos - Clase X':{id:'personal-pay',name:'Personal Pay',url:'https://www.personal.com.ar/pay/blog/inversiones/calcular-rendimiento'},
 'Allaria Ahorro - Clase E':{id:'prex',name:'Prex',url:'https://www.prexcard.com.ar/centro-de-ayuda/mis-rendimientos/cuenta-remunerada-en-pesos/como-se-obtienen-los-rendimientos-de-mi-saldo-en-pesos'},
 'SBS Ahorro Pesos - Clase A':{id:'claro-pay',name:'Claro Pay',url:'https://claropay.com.ar/p/claropay/legals.html'}
};
const number=n=>typeof n==='number'&&Number.isFinite(n);
export function validDate(date,now=Date.now()){return typeof date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(date)&&Number.isFinite(Date.parse(date))&&new Date(date).toISOString().slice(0,10)===date&&date<=argentinaDay(now);}
export function safeUrl(url,fallback='https://www.bcra.gob.ar/plazos-fijos-online/'){try{const parsed=new URL(url);return parsed.protocol==='https:'?parsed.href:fallback;}catch{return fallback;}}
export function normalizeFunds(raw,now=Date.now()){
 if(!raw||!Array.isArray(raw.fondos))throw new Error('Respuesta de fondos inválida');
 const rows=[],seen=new Set();let rejected=0;
 for(const fund of raw.fondos){const meta=Object.hasOwn(fundMappings,fund?.nombre)?fundMappings[fund.nombre]:null;if(!meta)continue;
  const r=fund.rendimientos;
  if(seen.has(meta.id)||fund.moneda!=='Peso Argentino'||fund.tipoRenta!=='Mercado de Dinero'||!validDate(fund.fecha,now)||!number(fund.inversionMinima)||fund.inversionMinima<0||!Number.isInteger(fund.plazoLiquidacionDias)||fund.plazoLiquidacionDias<0||!r||!number(r.unMes)||r.unMes<=-100||r.unMes>100||!Number.isInteger(r.diasUnMes)||r.diasUnMes<20||r.diasUnMes>35||!number(r.tnaEstimada)||r.tnaEstimadaPeriodo!=='unMes'||r.tnaEstimadaDias!==r.diasUnMes){rejected++;continue;}
  const annual=r.unMes/r.diasUnMes*365;
  if(Math.abs(annual-r.tnaEstimada)>.03){rejected++;continue;}
  seen.add(meta.id);rows.push({...meta,kind:'fund',fundName:fund.nombre,tna:annual/100,date:fund.fecha,minimum:fund.inversionMinima,cap:null,settlement:fund.plazoLiquidacionDias,periodDays:r.diasUnMes,periodReturn:r.unMes,type:'FCI · rendimiento histórico',source:'funds'});
 }
 if(!rows.length)throw new Error('Sin fondos comparables válidos');return{rows,rejected};
}
export function normalizeFixed(raw){
 if(!Array.isArray(raw))throw new Error('Respuesta de plazos fijos inválida');const rows=[],seen=new Set();let rejected=0;
 for(const bank of raw){if(!bank||typeof bank.entidad!=='string'||!bank.entidad.trim()||bank.entidad.length>200||seen.has(bank.entidad)){rejected++;continue;}
  const validRate=r=>number(r)&&r>0&&r<=1;
  const tiers=Array.isArray(bank.tasas)?bank.tasas.filter(t=>t&&validRate(t.tna)&&[t.montoMinimo,t.montoMaximo].every(v=>v===null||number(v)&&v>=0)&&Number.isInteger(t.plazoMinDias)&&t.plazoMinDias>=30&&t.plazoMinDias<=365&&(t.plazoMaxDias===null||Number.isInteger(t.plazoMaxDias)&&t.plazoMaxDias>=t.plazoMinDias&&t.plazoMaxDias<=365)&&(t.montoMinimo===null||t.montoMaximo===null||t.montoMaximo>=t.montoMinimo)):[];
  rejected+=(Array.isArray(bank.tasas)?bank.tasas.length:0)-tiers.length;
  if(!validRate(bank.tnaClientes)&&!validRate(bank.tnaNoClientes)&&!tiers.length){rejected++;continue;}
  seen.add(bank.entidad);rows.push({id:'pf-'+bank.entidad.trim(),name:bank.entidad.trim(),kind:'fixed',type:'Plazo fijo tradicional',date:null,customer:validRate(bank.tnaClientes)?bank.tnaClientes:null,nonCustomer:validRate(bank.tnaNoClientes)?bank.tnaNoClientes:null,tiers,url:safeUrl(bank.enlace),source:'fixed',conditions:typeof bank.condiciones==='string'?bank.condiciones.slice(0,3000):''});
 }if(!rows.length)throw new Error('Sin plazos fijos válidos');return{rows,rejected};
}
export function evaluateFixed(row,{amount,days,lock=false,customer=true}){
 const result={...row,gain:null,total:null,tna:null,eligible:false,reason:''};
 if(days<30)return{...result,reason:'El plazo fijo tradicional exige al menos 30 días.'};
 if(!lock)return{...result,reason:'Requiere inmovilizar el dinero. Activá «Puedo esperar al vencimiento» para simular.'};
 const base=customer?row.customer:row.nonCustomer;
 // Generic BCRA values explicitly correspond to ARS 100,000 / 30 days.
 let rate=amount===100000&&days===30?base:null;
 const matches=customer?row.tiers.filter(t=>days>=t.plazoMinDias&&(t.plazoMaxDias===null||days<=t.plazoMaxDias)&&(t.montoMinimo===null||amount>=t.montoMinimo)&&(t.montoMaximo===null||amount<=t.montoMaximo)):[];
 if(matches.length&&new Set(matches.map(t=>t.tna)).size!==1)return{...result,reason:'Los tramos informados se contradicen; no calculamos una ganancia.'};
 if(matches.length)rate=matches[0].tna;
 if(rate===null)return{...result,reason:'Sin tasa aplicable verificada para este monto, plazo y condición de cliente.'};
 const gain=amount*rate*days/365;
 return{...result,tna:rate,gain,total:amount+gain,appliedTier:matches[0]||null,scope:matches.length?'tier':'bcra-reference',reason:'Simulación de referencia: la fuente no informa la fecha original de la tasa. Confirmá tasa, monto mínimo y elegibilidad en el banco.'};
}
export function evaluateFund(row,{amount,days,lock=false},now=Date.now()){
 const belowMinimum=amount<row.minimum;
 const unavailable=!lock&&row.settlement>0;
 const reason=belowMinimum?'No alcanza el mínimo del fondo.':unavailable?'El rescate tiene liquidación diferida.':'Escenario del fondo asociado; puede diferir del rendimiento mostrado por la billetera. Límites y beneficios de la app no verificados.';
 const gain=belowMinimum||unavailable?null:amount*row.tna*days/365;
 if(gain!==null&&amount+gain<0)return{...row,gain:null,total:null,fresh:pesosFresh(row,now),eligible:false,reason:'No extrapolamos una pérdida histórica a un saldo negativo.'};
 return{...row,gain,total:gain===null?null:amount+gain,fresh:pesosFresh(row,now),eligible:false,reason};
}
export function sourceReady(source,now=Date.now()){
 return source?.status==='ok'&&Number.isFinite(Date.parse(source.receivedAt))&&now-Date.parse(source.receivedAt)<=(Number.isFinite(source.ttlMs)&&source.ttlMs>0&&source.ttlMs<=1800000?source.ttlMs:180000)&&Date.parse(source.receivedAt)<=now+60000;
}
export function snapshotStatus(row,source,now=Date.now()){
 if(!sourceReady(source,now))return 'Consulta no vigente';
 if(!row.date)return 'Fecha de tasa no informada';
 return pesosFresh(row,now)?'Dato fechado reciente':'Dato demorado';
}
