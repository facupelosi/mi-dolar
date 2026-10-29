"""Collect dated retail ARS fixed deposits from official bank documents. Fail closed."""
import io
import json
import re
import hashlib
import urllib.request
from datetime import datetime, timezone, date
from pathlib import Path
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
MONTHS = dict(zip('enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre'.split(), range(1, 13)))

def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'MiDolar-public-source-check/1.0'}), timeout=40) as response:
        if response.url.split('/')[2] != url.split('/')[2]:
            raise ValueError('Unexpected redirect host')
        return response.read()

def spanish_date(text):
    match = re.search(r'(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})', text, re.I)
    if not match:
        raise ValueError('Missing original date')
    result = date(int(match[3]), MONTHS[match[2].lower()], int(match[1])).isoformat()
    if result > datetime.now(timezone.utc).date().isoformat():
        raise ValueError('Future rate date')
    return result

def parse_nacion(text):
    publication = spanish_date(text.split('TASAS PASIVAS EN PESOS')[0])
    section = text.split('PLAZO FIJO CANAL ELECTRÓNICO Personas Humanas -Sector Privado', 1)[1].split('PLAZO FIJO TRADICIONAL CON PAGO', 1)[0]
    since = re.search(r'\b(\d{2})-(\d{2})-(\d{2})\b', section)
    effective = date(2000 + int(since[3]), int(since[2]), int(since[1])).isoformat()
    matches = re.findall(r'(\d+)\s+a\s+(\d+)\s+días\s+([\d,]+)%', section)
    if [(int(a), int(b)) for a,b,_ in matches] != [(30,59),(60,89),(90,179),(180,269),(270,370)]:
        raise ValueError('Changed Nación table')
    return effective, publication, [(int(a),int(b),float(r.replace(',','.'))/100) for a,b,r in matches]

def parse_provincia(text):
    effective = spanish_date(text.split('VIGENCIA:',1)[1])
    section = text.split('Depósito a Plazo Fijo Digital - BIP / TAS - Persona Humana (*)',1)[1].split('Depósito a Plazo Fijo Digital - BIP / TAS - Persona Jurídica',1)[0]
    matches = re.findall(r'de\s+(\d+)\s+a\s+(\d+)\s+días\s+([\d,]+)%', section)
    if [(int(a),int(b)) for a,b,_ in matches] != [(30,44),(45,59),(60,89),(90,119),(120,179),(180,364)]:
        raise ValueError('Changed Provincia table')
    return effective, None, [(int(a),int(b),float(r.replace(',','.'))/100) for a,b,r in matches]

def collect():
    checked = datetime.now(timezone.utc).isoformat()
    products, errors = [], []
    specs = [
        dict(id='nacion', name='Banco Nación', landing='https://www.bna.com.ar/Home/InformacionAlUsuarioFinanciero', url=None, minimum=500, channel='Canal electrónico · personas humanas', parser=parse_nacion, note='Mínimo $500 según la tabla oficial del canal electrónico. Para clientes, sector privado; no aplica a sucursales, empresas ni UVA.'),
        dict(id='provincia', name='Banco Provincia', landing='https://www.bancoprovincia.com.ar/content/docs/Plazos_fijos_tasas_vigentes.pdf', url='https://www.bancoprovincia.com.ar/content/docs/Plazos_fijos_tasas_vigentes.pdf', minimum=None, channel='BIP / TAS · personas humanas', parser=parse_provincia, note='El tarifario considera la cartera total de plazos fijos en pesos no ajustables. En cotitularidad, distribuye los certificados proporcionalmente. Mínimo y elegibilidad a confirmar en BIP; no aplica a ATM ni empresas.')
    ]
    for spec in specs:
        try:
            url = spec['url']
            if url is None:
                html = get(spec['landing']).decode('utf-8')
                path = re.search(r'href=[\"\']([^\"\']+tasas_ope[^\"\']+\.pdf)[\"\']', html, re.I)[1]
                url = 'https://www.bna.com.ar' + path if path.startswith('/') else path
                if not url.startswith('https://www.bna.com.ar/'):
                    raise ValueError('Unexpected document origin')
            pdf = get(url)
            text = '\n'.join(p.extract_text(extraction_mode='layout') for p in PdfReader(io.BytesIO(pdf)).pages)
            # Normalize layout whitespace while retaining line boundaries.
            text = re.sub(r'[^\S\n]+', ' ', text)
            effective, publication, tiers = spec['parser'](text)
            if effective > checked[:10] or any(not 0 < r <= 1 for _,_,r in tiers):
                raise ValueError('Invalid date/rate')
            products.append(dict(id='official-'+spec['id'], name=spec['name'], effectiveFrom=effective, publicationDate=publication, checkedAt=checked, minimum=spec['minimum'], channel=spec['channel'], conditions=spec['note'], url=url, landing=spec['landing'], sha256=hashlib.sha256(pdf).hexdigest(), tiers=[dict(plazoMinDias=a,plazoMaxDias=b,tna=r,montoMinimo=spec['minimum'],montoMaximo=None) for a,b,r in tiers]))
        except Exception as error:
            errors.append(dict(id=spec['id'], name=spec['name'], message='No se pudo verificar el documento oficial; fuera de comparación vigente.', detail=type(error).__name__))
    output = dict(schemaVersion=1, generatedAt=checked, products=products, errors=errors)
    (ROOT/'data'/'official-fixed.json').write_text(json.dumps(output, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps(dict(verified=len(products), errors=errors), ensure_ascii=False))

if __name__ == '__main__':
    collect()
