import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalAppUrl,releaseChanged} from '../updates.js';
test('El enlace viejo conserva otros parámetros y anclas, pero elimina la versión',()=>{
 assert.equal(canonicalAppUrl('https://facupelosi.github.io/mi-dolar/?v=11&test=1#calculadora'),'https://facupelosi.github.io/mi-dolar/?test=1#calculadora');
 assert.equal(canonicalAppUrl('https://facupelosi.github.io/mi-dolar/'),'https://facupelosi.github.io/mi-dolar/');
});
test('Sólo una versión de software nueva y válida solicita actualizar',()=>{
 const a='a'.repeat(64),b='b'.repeat(64);
 assert.equal(releaseChanged(a,{build:b}),true);
 for(const release of [{build:a},{build:'11'},{},{build:null},null])assert.equal(releaseChanged(a,release),false);
 assert.equal(releaseChanged('__APP_BUILD_ID__',{build:b}),false);
});
