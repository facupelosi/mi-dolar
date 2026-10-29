// Selection of digital ARS options in Apple's Argentina Finance chart, checked 2026-10-29.
export const POPULAR_SOURCE='https://apps.apple.com/ar/iphone/charts/6015';
export const POPULAR_CHECKED='2026-10-29';
export const POPULAR_APPS=[
 {id:'nx',name:'Naranja X',url:'https://www.naranjax.com/'},
 {id:'mercado-pago',name:'Mercado Pago',url:'https://www.mercadopago.com.ar/'},
 {id:'uala',name:'Ualá',url:'https://www.uala.com.ar/'},
 {id:'personal-pay',name:'Personal Pay',url:'https://www.personalpay.com.ar/'},
 {id:'brubank',name:'Brubank',url:'https://www.brubank.com/'},
 {id:'prex',name:'Prex',url:'https://www.prexcard.com.ar/'},
 {id:'claro-pay',name:'Claro Pay',url:'https://claropay.com.ar/'}
];
export function popularFixedApp(name){const normalized=String(name).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().trim();return /^UALA(?:\s|$)/.test(normalized)?'uala':/^BRUBANK(?:\s|$)/.test(normalized)?'brubank':null;}
