"""Public official app evidence; retrieval date is never substituted for a rate date."""
from pathlib import Path
from html.parser import HTMLParser
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime,timezone
import re,json,urllib.request,hashlib,calendar
ROOT=Path(__file__).resolve().parents[1]
SOURCES=[
 ('nx','https://www.naranjax.com/cuenta-remunerada','account'),
 ('uala','https://www.uala.com.ar/inversiones/cuenta-remunerada','account'),
 ('mercado-pago','https://www.mercadopago.com.ar/cuenta','indicative'),
 ('brubank','https://help.brubank.com/es/articles/10508364-tasas-de-interes-vigentes','dated-reference'),
 ('personal-pay','https://www.personal.com.ar/pay/blog/inversiones/calcular-rendimiento','fund-method'),
 ('prex','https://www.prexcard.com.ar/centro-de-ayuda/mis-rendimientos/cuenta-remunerada-en-pesos/como-se-calcula-la-tasa-de-rendimiento','fund-method'),
 ('claro-pay','https://claropay.com.ar/p/claropay/faqs.html','fund-method')]
class Text(HTMLParser):
 def __init__(self):super().__init__();self.skip=0;self.parts=[]
 def handle_starttag(self,t,a):
  if t in ('script','style','noscript'):self.skip+=1
 def handle_endtag(self,t):
  if t in ('script','style','noscript'):self.skip=max(0,self.skip-1)
 def handle_data(self,d):
  if not self.skip:self.parts.append(d)
def percentage(value):
 result=float(value.replace(',','.'))/100
 if not 0<=result<=1:raise ValueError('Rate units invalid')
 return result
def parse(app,text):
 out=dict(annualRate=None,cap=None,minimum=None,rateDate=None,validUntil=None,rates=None)
 if app=='mercado-pago':
  out['annualRate']=percentage(re.search(r'En pesos,\s*([\d.,]+)%\s*anual',text)[1]);out['note']='Porcentaje anual indicativo publicado por Mercado Pago. Sin fecha original ni tope explícito en esta página. No es una tasa garantizada ni una oferta autenticada.'
 elif app=='uala':
  match=re.search(r'entre\s*\$([\d.]+)\s*y\s*\$([\d.]+)\s*en tu cuenta rinden\s*([\d.,]+)%',text)
  out.update(minimum=int(match[1].replace('.','')),cap=int(match[2].replace('.','')),annualRate=percentage(match[3]))
  period=re.search(r'válido del\s*(\d{2}/\d{2}/\d{4})\s*al\s*(\d{2}/\d{2}/\d{4})',text)
  out['rateDate']=datetime.strptime(period[1],'%d/%m/%Y').date().isoformat();out['validUntil']=datetime.strptime(period[2],'%d/%m/%Y').date().isoformat()
  out['rates']={'uala-base':out['annualRate'],'uala-plus1':percentage(re.search(r'acumulás\s*\$[\d.]+.*?sube hasta\s*([\d.,]+)%',text)[1]),'uala-plus2':percentage(re.search(r'sumás\s*\$[\d.]+\s*sube hasta\s*([\d.,]+)%',text)[1])}
  out['note']='Base sin consumos; Plus sólo si ya está activa. Tasas variables. La vigencia publicada no garantiza mantener la tasa durante todo el plazo simulado.'
 elif app=='nx':
  out['annualRate']=percentage(re.search(r'cuenta remunerada con\s*([\d.,]+)%\s*TNA',text,re.I)[1]);out['cap']=int(re.search(r'monto máximo remunerado es de\s*\$([\d.]+)',text,re.I)[1].replace('.',''));out['note']='Requiere activar la remuneración y mantener el saldo hasta el cierre. La página no informa la fecha original de la tasa.'
 elif app=='brubank':
  match=re.search(r'hasta\s*\$([\d.]+)\s*para cartera general\.\s*TNA\s*([\d.,]+)%',text)
  out['cap']=int(match[1].replace('.',''));out['annualRate']=percentage(match[2]);out['rateDate']=datetime.strptime(re.search(r'Tasas vigentes al\s*(\d{2}/\d{2}/\d{4})',text)[1],'%d/%m/%Y').date().isoformat()
  out['note']='Cuenta Max, cartera general. El tarifario está fechado, pero no confirma la tasa vigente hoy. Cartera seleccionada tiene otras condiciones. La acreditación se informa para días hábiles; no asumimos el tratamiento de fines de semana.'
 elif app=='prex':
  if 'últimos 7 días' not in text:raise ValueError('Method changed')
  out['note']='La TNA de la app se basa en los últimos 7 días del fondo. El escenario mensual del fondo mostrado por el comparador usa otro período; no se presenta como TNA actual de Prex.'
 elif app=='personal-pay':
  if 'Delta Pesos Clase X' not in text:raise ValueError('Fund class changed')
  out['note']='Personal Pay identifica Delta Pesos Clase X y explica que la tasa es estimada a partir de rendimiento pasado. La página no publica una tasa numérica vigente; no extrapolamos niveles o bonificaciones.'
 else:
  if 'SBS Ahorro Pesos FCI' not in text:raise ValueError('Fund changed')
  out['note']='Claro Pay identifica SBS Ahorro Pesos. Los honorarios se deducen del fondo; no se restan dos veces. La web consultada no publica un porcentaje numérico vigente de la app. La clase debe confirmarse.'
 return out
def collect(spec):
 app,url,kind=spec;row=dict(id=app,url=url,kind=kind,checkedAt=datetime.now(timezone.utc).isoformat(),status='unavailable',annualRate=None,cap=None,minimum=None,rateDate=None,validUntil=None,rates=None,note='No se pudo verificar la página oficial en esta consulta.')
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'MiDolar-public-source-check/1.0'})
  with urllib.request.urlopen(req,timeout=20) as r:
   if urllib.parse.urlparse(r.url).hostname!=urllib.parse.urlparse(url).hostname:raise ValueError('Redirect origin')
   data=r.read(3000000)
  parser=Text();parser.feed(data.decode('utf-8'));text=' '.join(' '.join(parser.parts).split());row.update(parse(app,text));row.update(status='verified',sha256=hashlib.sha256(data).hexdigest())
  if app in ('brubank','personal-pay','prex'):
   extra={'brubank':'https://help.brubank.com/es/articles/9926124-que-es-cuenta-max','personal-pay':'https://www.personal.com.ar/pay/cuentas-remuneradas','prex':'https://allariafondos.com.ar/Fondo/Money-Market'}[app]
   try:
    with urllib.request.urlopen(urllib.request.Request(extra,headers={'User-Agent':'MiDolar-public-source-check/1.0'}),timeout=20) as response:
     if urllib.parse.urlparse(response.url).hostname!=urllib.parse.urlparse(extra).hostname:raise ValueError('Redirect origin')
     extra_data=response.read(3000000)
    extra_parser=Text();extra_parser.feed(extra_data.decode('utf-8'));extra_text=' '.join(' '.join(extra_parser.parts).split())
    if app=='brubank' and 'por adelantado el viernes' in extra_text:
     row['note']='Cuenta Max, cartera general. Tarifario al '+row['rateDate']+': no confirma tasa vigente hoy. El producto requiere activación y elegibilidad. Los rendimientos del fin de semana se acreditan adelantados el viernes según la FAQ oficial.'
    elif app=='personal-pay':
     if not re.search(r'mínimo de inversión.*?\$1,.*?no hay un máximo',extra_text):raise ValueError('Limits changed')
     row['minimum']=1;row['note']+=' La página del producto confirma inversión mínima $1, sin máximo de saldo; requiere activar y aceptar condiciones.'
    elif app=='prex':
     section=extra_text.split('Valores de cuotaparte al ',1)[1].split('Descargar valores históricos',1)[0]
     day=datetime.strptime(section[:10],'%d/%m/%Y').date()
     if day>datetime.now(timezone.utc).date():raise ValueError('Future fund date')
     values=re.search(r'\bE\s+[\d.]+\s+[\d,]+\s+([\d,]+)%\s+([\d,]+)%\s+([\d,]+)%\s+([\d,]+)%\s+([\d,]+)%',section)
     if not values:raise ValueError('Fund table changed')
     month=12 if day.month==1 else day.month-1;year=day.year-1 if day.month==1 else day.year
     before=day.replace(year=year,month=month,day=min(day.day,calendar.monthrange(year,month)[1]));days=(day-before).days
     monthly=float(values[2].replace(',','.'))
     row.update(fundDate=day.isoformat(),fundPeriodDays=days,fundPeriodReturn=monthly,fundAnnualRate=monthly/100/days*365)
    row['extraUrl']=extra
   except Exception as error:row['extraError']=type(error).__name__

 except Exception as error:row['error']=type(error).__name__
 return row
if __name__=='__main__':
 with ThreadPoolExecutor(max_workers=7) as pool:rows=list(pool.map(collect,SOURCES))
 (ROOT/'data'/'official-apps.json').write_text(json.dumps(dict(schemaVersion=1,products=rows),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps([{k:r.get(k) for k in ['id','status','annualRate','rateDate']} for r in rows],ensure_ascii=False))
