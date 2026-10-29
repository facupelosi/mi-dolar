import test from 'node:test';
import assert from 'node:assert/strict';
import{POPULAR_APPS,popularFixedApp}from'../popular-apps.js';
test('La selección incluye apps digitales y excluye bancos tradicionales',()=>{
 assert.equal(new Set(POPULAR_APPS.map(a=>a.id)).size,7);
 assert.ok(POPULAR_APPS.some(a=>a.id==='mercado-pago'));
 for(const name of ['Banco Provincia','Banco Nación','Banco Galicia','BANCO VOII S.A.','UALATEST'])assert.equal(popularFixedApp(name),null);
 assert.equal(popularFixedApp('UALÁ BANK S.A.U.'),'uala');
 assert.equal(popularFixedApp('BRUBANK S.A.U.'),'brubank');
});
