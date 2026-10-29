// Replaced in the public artifact, independently of rate-verification timestamps.
export const BUILD_ID='__APP_BUILD_ID__';
export function releaseChanged(current,release){return /^[a-f0-9]{64}$/.test(current)&&typeof release?.build==='string'&&/^[a-f0-9]{64}$/.test(release.build)&&release.build!==current;}
export function canonicalAppUrl(href){const url=new URL(href);url.searchParams.delete('v');return url.href;}
if(typeof window!=='undefined'){
 const canonical=canonicalAppUrl(location.href);
 if(canonical!==location.href)history.replaceState(history.state,'',canonical);
 let pending=false,lastCheck=0,banner=null;
 function offerUpdate(build){
  if(banner)return;
  banner=document.createElement('aside');banner.className='app-update';banner.setAttribute('role','status');
  const text=document.createElement('span');text.textContent='Hay una versión nueva de la app.';
  const button=document.createElement('button');button.type='button';button.textContent='Actualizar app';
  button.addEventListener('click',()=>reload(build,true));banner.append(text,button);document.body.append(banner);
 }
 function reload(build,manual=false){
  try{if(!manual&&sessionStorage.getItem('mi-dolar-reload-build')===build)return;sessionStorage.setItem('mi-dolar-reload-build',build);}catch{if(!manual)return;}
  location.reload();
 }
 async function check(){
  if(pending||document.hidden||Date.now()-lastCheck<60000||BUILD_ID==='__APP_BUILD_ID__')return;
  pending=true;lastCheck=Date.now();
  try{
   const response=await fetch('./version.json',{cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(10000)});
   if(!response.ok)return;const release=await response.json();
   if(releaseChanged(BUILD_ID,release)){
    offerUpdate(release.build);
    // Do not interrupt someone entering an amount or choosing an option.
    if(!document.activeElement?.matches('input,select,textarea,[contenteditable="true"]'))reload(release.build);
   }
   if('serviceWorker'in navigator){const registration=await navigator.serviceWorker.getRegistration();registration?.update().catch(()=>{});}
  }catch{/* Offline: keep the available interface; rate freshness is checked separately. */}
  finally{pending=false;}
 }
 addEventListener('pageshow',check);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});
 setInterval(check,60000);check();
}
