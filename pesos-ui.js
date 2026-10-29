import{PESOS_SOURCE,normalizePesos,comparePesos,mergePesos,bestPesos}from'./pesos.js';
import{parseAmount}from'./core.js';
const $=id=>document.getElementById(id);
const money=value=>new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:2}).format(value);
const el=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;};
const link=(label,url)=>{const node=el('a',label);node.href=url;node.target='_blank';node.rel='noopener';return node;};
export function initPesos({read,save}){
 let rows=[],status='idle',receivedAt=null,rejected=0,pending=false;
 const cached=read('mi-dolar-pesos-source',null);
 if(cached&&typeof cached==='object'){try{rows=normalizePesos(cached.raw).rows;receivedAt=Number.isFinite(Date.parse(cached.receivedAt))&&Date.parse(cached.receivedAt)<=Date.now()+60000?cached.receivedAt:null;}catch{}}
 const prefs=read('mi-dolar-pesos-prefs',{});
 if(typeof prefs.amount==='string'&&Number.isFinite(parseAmount(prefs.amount)))$('pesosAmount').value=prefs.amount;
 if(['1','7','14','30'].includes(prefs.days))$('pesosDays').value=prefs.days;
 // Special rates and FCI inclusion require a fresh explicit selection each visit.
 function persist(){save('mi-dolar-pesos-prefs',{amount:$('pesosAmount').value,days:$('pesosDays').value});}
 function render(){
  const amount=parseAmount($('pesosAmount').value),days=Number($('pesosDays').value);
  $('pesosError').textContent='';$('pesosResults').replaceChildren();$('pesosMore').replaceChildren();
  $('pesosStatus').textContent=(status==='loading'?'Consultando tasas…':status==='error'?'La fuente no respondió. Mostramos datos guardados sin destacar una mejor opción.':status==='ok'?'Datos recibidos de ArgentinaDatos.':'Datos guardados: verificando vigencia…')+(receivedAt?' Última consulta correcta: '+new Date(receivedAt).toLocaleString('es-AR',{timeZone:'America/Argentina/Buenos_Aires',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'')+(rejected?' · '+rejected+' registros inválidos descartados.':'');
  if(!Number.isFinite(amount)){$('pesosError').textContent='Ingresá un monto positivo, hasta 1.000.000.000, sin separador de miles. Ejemplo: 500000,50.';return;}
  if(!rows.length){$('pesosResults').append(el('p',status==='error'?'No hay tasas verificables para mostrar. Volvé a actualizar.':'Conectando con las tasas reales…','notice'));return;}
  const tier=$('pesosTier').value,includeFci=$('pesosFci').checked;
  const compared=comparePesos(rows,{amount,days,tier,includeFci});
  const best=bestPesos(compared,status);
  if(best){const banner=el('article',undefined,'pesos-best');banner.append(el('div','MAYOR GANANCIA ESTIMADA ENTRE LAS OPCIONES INCLUIDAS','eyebrow'),el('h2',best.name),el('p',best.type,'small muted'),el('div','+ '+money(best.gain),'pesos-gain'),el('p','En '+days+' días · saldo final estimado '+money(best.total),'small'));$('pesosResults').append(banner);}
  else $('pesosResults').append(el('p','No hay una opción con datos recientes y cálculo completo para destacar.','notice'));
  if(tier!=='uala-base'&&!rows.some(row=>row.id===tier))$('pesosResults').append(el('p','La tasa especial elegida no está disponible en la fuente; no la reemplazamos por otra.','notice'));
  for(const row of compared){const card=el('article',undefined,'pesos-card');card.append(el('h2',row.name),el('p',row.type+' · disponibilidad diaria','small muted'),el('div','+ '+money(row.gain),'pesos-gain'),el('p',(row.partial?'Ganancia estimada sólo del tramo bonificado':'Ganancia estimada')+' en '+days+' días','small'),el('p',(row.tna*100).toLocaleString('es-AR',{maximumFractionDigits:2})+'% TNA · tope '+money(row.cap),'small'));
   card.append(el('p','Saldo calculado: '+money(row.principal)+(row.excess?' · fuera de ese tope: '+money(row.excess):''),'small muted'));
   card.append(el('p','Tasa informada al '+row.date.split('-').reverse().join('/')+(row.minimum?' · mínimo '+money(row.minimum):''),'small muted'));
   if(row.id.startsWith('uala-plus'))card.append(el('p','Requisito: '+row.conditions,'pesos-caution'));
   if(row.belowMinimum)card.append(el('p','No alcanza el mínimo de '+money(row.minimum)+'.','pesos-caution'));
   if(row.partial)card.append(el('p','El excedente también puede rendir a la tasa variable del FCI. No lo estimamos ni destacamos esta opción para tu monto.','pesos-caution'));
   if(!row.fresh)card.append(el('p','Dato de más de 3 días: queda fuera de la mejor opción.','pesos-caution'));
   const details=document.createElement('details');details.append(el('summary','Condiciones y fuente'),el('p',row.conditions||'Sin condiciones adicionales informadas en el registro de tasas.','small'),el('p',row.note,'small muted'),el('p','Fecha informada por la fuente: '+row.date+'. No equivale a una verificación en tu cuenta.','small muted'),link('Condiciones oficiales',row.url),document.createTextNode(' · '),link('Tasas: ArgentinaDatos',PESOS_SOURCE));card.append(details);$('pesosMore').append(card);
  }
  if(!compared.length)$('pesosResults').append(el('p','No hay tasas disponibles para tu selección.','notice'));
 }
 async function refresh(){if(pending)return;pending=true;status='loading';render();try{const response=await fetch(PESOS_SOURCE,{signal:AbortSignal.timeout(15000),cache:'no-store',credentials:'omit'});if(!response.ok)throw new Error('HTTP '+response.status);const raw=await response.json(),normalized=normalizePesos(raw);rows=mergePesos(rows,normalized.rows);rejected=normalized.rejected;receivedAt=new Date().toISOString();save('mi-dolar-pesos-source',{raw:rows.map(row=>({fondo:row.fondo,tna:row.tna,tope:row.cap,fecha:row.date,condiciones:row.conditions,plazoMinDias:0,plazoMaxDias:0})),receivedAt});status='ok';}catch{status='error';}finally{pending=false;render();}}
 for(const id of ['pesosAmount','pesosDays','pesosTier','pesosFci'])$(id).addEventListener(id==='pesosAmount'?'input':'change',()=>{persist();render();});
 render();return{render,refresh};
}
