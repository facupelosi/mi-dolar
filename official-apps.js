import{validDate}from'./investments.js?v=14';
import{argentinaDay}from'./pesos.js?v=14';
const HOSTS={nx:'www.naranjax.com',uala:'www.uala.com.ar','mercado-pago':'www.mercadopago.com.ar',brubank:'help.brubank.com','personal-pay':'www.personal.com.ar',prex:'www.prexcard.com.ar','claro-pay':'claropay.com.ar'};
export function normalizeOfficialApps(raw,now=Date.now()){
 if(raw?.schemaVersion!==1||!Array.isArray(raw.products))throw Error('Evidencia oficial inválida');const rows=[],seen=new Set();let rejected=0;
 for(const p of raw.products){try{if(!p||!Object.hasOwn(HOSTS,p.id)||seen.has(p.id)||new URL(p.url).protocol!=='https:'||new URL(p.url).hostname!==HOSTS[p.id]||!['verified','unavailable'].includes(p.status)||!Number.isFinite(Date.parse(p.checkedAt))||Date.parse(p.checkedAt)>now+60000||p.annualRate!==null&&(!Number.isFinite(p.annualRate)||p.annualRate<0||p.annualRate>1)||[p.cap,p.minimum].some(v=>v!==null&&(!Number.isFinite(v)||v<0))||p.rateDate!==null&&!validDate(p.rateDate,now)||p.validUntil!==null&&(!/^\d{4}-\d{2}-\d{2}$/.test(p.validUntil)||!Number.isFinite(Date.parse(p.validUntil))||new Date(p.validUntil).toISOString().slice(0,10)!==p.validUntil)||typeof p.note!=='string'||p.note.length>3000)throw Error();if(p.rates&&Object.entries(p.rates).some(([id,r])=>!['uala-base','uala-plus1','uala-plus2'].includes(id)||!Number.isFinite(r)||r<0||r>1))throw Error();if(p.fundAnnualRate!==undefined&&(!validDate(p.fundDate,now)||!Number.isInteger(p.fundPeriodDays)||p.fundPeriodDays<20||p.fundPeriodDays>35||!Number.isFinite(p.fundPeriodReturn)||!Number.isFinite(p.fundAnnualRate)||Math.abs(p.fundAnnualRate-p.fundPeriodReturn/100/p.fundPeriodDays*365)>.000001||p.fundAnnualRate<0||p.fundAnnualRate>1))throw Error();if(p.extraUrl&&!['https://allariafondos.com.ar/Fondo/Money-Market','https://www.personal.com.ar/pay/cuentas-remuneradas','https://help.brubank.com/es/articles/9926124-que-es-cuenta-max'].includes(p.extraUrl))throw Error();seen.add(p.id);rows.push(p);}catch{rejected++;}}
 if(!rows.length)throw Error('Sin respaldo oficial válido');return{rows,rejected};
}
export function officialEvidenceCurrent(row,now=Date.now()){return row?.status==='verified'&&now-Date.parse(row.checkedAt)>=-60000&&now-Date.parse(row.checkedAt)<=86400000&&(!row.validUntil||row.validUntil>=argentinaDay(now));}
export function accountEvidenceMatches(account,evidence){const rate=evidence?.rates?.[account.id]??evidence?.annualRate;return evidence?.kind==='account'&&typeof rate==='number'&&Math.abs(account.tna-rate)<.000001&&account.cap===evidence.cap&&(evidence.minimum===null||account.minimum===evidence.minimum);}

export function officialFundScenario(row,proof,now=Date.now()){
 if(!officialEvidenceCurrent(proof,now))return row;
 if(row.id==='mercado-pago'&&proof.annualRate!==null)return{...row,tna:proof.annualRate,date:null,fundName:null,officialDirectRate:true,referenceDataUrl:proof.url,referenceReceivedAt:proof.checkedAt};
 if(row.id==='prex'&&proof.fundAnnualRate!==undefined)return{...row,tna:proof.fundAnnualRate,date:proof.fundDate,periodDays:proof.fundPeriodDays,periodReturn:proof.fundPeriodReturn,referenceDataUrl:proof.extraUrl,referenceReceivedAt:proof.checkedAt};
 return row;
}
