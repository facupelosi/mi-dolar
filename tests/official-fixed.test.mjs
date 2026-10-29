import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeOfficialFixed,evaluateOfficialFixed,snapshotStatus} from '../investments.js';
const raw=JSON.parse(readFileSync(new URL('./fixtures/official-fixed.json',import.meta.url)));
const now=Date.parse(raw.generatedAt);
const options={amount:500000,days:30,lock:true,customer:true};
test('Documento oficial conserva vigencia original y fecha de verificación separadas',()=>{
 const {rows}=normalizeOfficialFixed(raw,now);assert.equal(rows.length,2);assert.equal(rows[0].date,'2026-10-02');assert.notEqual(rows[0].date,rows[0].checkedAt.slice(0,10));assert.equal(snapshotStatus(rows[0],{status:'ok',receivedAt:new Date(now).toISOString()},now),'Tarifario oficial verificado');
});
test('Tasa oficial aplica al tramo de días y al canal, sin reinversión',()=>{
 const rows=normalizeOfficialFixed(raw,now).rows;
 assert.equal(evaluateOfficialFixed(rows[0],options,now).tna,.1925);
 assert.equal(evaluateOfficialFixed(rows[0],{...options,days:60},now).tna,.2);
 assert.equal(evaluateOfficialFixed(rows[1],options,now).gain,500000*.21*30/365);
});
test('Verificación vencida, no cliente, falta de inmovilización y mínimo bloquean cálculo',()=>{
 const row=normalizeOfficialFixed(raw,now).rows[0];
 for(const [opts,t]of[[options,now+86400001],[{...options,customer:false},now],[{...options,lock:false},now],[{...options,days:7},now],[{...options,amount:499},now]])assert.equal(evaluateOfficialFixed(row,opts,t).gain,null);
});
test('Origen ajeno, fecha futura, unidades incorrectas y tramos superpuestos se rechazan',()=>{
 for(const change of[p=>p.url='https://example.com/rates.pdf',p=>p.effectiveFrom='2099-01-01',p=>p.tiers[0].tna=19.25,p=>p.tiers[1].plazoMinDias=30]){const copy=structuredClone(raw);change(copy.products[0]);const result=normalizeOfficialFixed(copy,now);assert.equal(result.rows.length,1);assert.equal(result.rejected,1);}
});
