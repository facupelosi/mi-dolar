# Fuentes gratuitas revisadas — 29/10/2026

- Compará Dólar: https://api.comparadolar.ar/usd — precios por entidad/modalidad y fecha de observación. Brubank sólo Ultra; sin Mercado Pago ni Naranja X en la respuesta revisada.
- CriptoYa: https://criptoya.com/api/bancostodos — se amplió la normalización a BBVA, Galicia, Macro, Patagonia, Piano, Santander, Columbia, Bytelime y Brubank. Varios registros son antiguos: Brubank y otros llevan fecha 19/12/2025. Brubank no informa plan: no se atribuye la cotización al plan común ni se recomienda. Se muestra la falta de referencia aplicable.
- DolarAPI: https://dolarapi.com/docs/argentina/operations/get-dolar-oficial — API pública sin clave y con CORS abierto. Integrada como referencia general separada: no identifica precio ejecutable por banco y NO participa del ranking ni calculadora. Conserva fecha original, no fecha de descarga.
- ArgentinaDatos: https://argentinadatos.com/docs/ — históricos y otros indicadores; remite a DolarAPI para actuales. No resuelve las entidades faltantes.
- MonedAPI: https://monedapi.ar/docs/referencia-api — gratuita, lecturas sin clave, referencias generales de mercado. No se incorporó como cotización específica de una app.
- Dólar Claro: https://dolarclaro.com/api/ y https://dolarclaro.com/fuentes/ — API general; las páginas de entidades no implican cobertura API por entidad. No agrega cobertura verificable para Mercado Pago.
- Cambio Claro: https://elcambioclaro.com/api — JSON público cada 20 minutos; referencias generales/P2P. No resuelve precio bancario de Mercado Pago ni Brubank común.
- Finanzas Argy: https://finanzasargy.com/cotizaciones-bancos — HTML con dato de Brubank, sin contrato API pública verificado ni condición de plan suficientemente identificada. No se conectó como precio ejecutable de Brubank común.
- Tasita: https://tasita.com.ar/ — página pública con precios y tasas; presencia del nombre Mercado Pago en cuentas remuneradas no prueba cotización USD. No se incorporó como fuente de cambio de esa app.

No se encontró una fuente gratuita pública utilizable que resolviera cotización actual por entidad de Mercado Pago, Naranja X y Brubank común en esta revisión. Esto no demuestra que no exista ninguna, ni que esas apps sean caras.

## Comportamiento publicado
Cobertura dinámica visible dentro de Cotizaciones: ausencia de fuente, otra modalidad, filtro/cuenta, plan, conflicto o antigüedad. Se conserva último dato pero los mayores de 24 horas no participan de recomendaciones/calculadora. Datos entre 2 minutos y 24 horas se muestran demorados y no desplazan a recientes.

## Validación
23 pruebas automatizadas: ingestión, regresiones de fecha, conflictos, favoritos, planes, cotizaciones vencidas, motivos de cobertura y esquema de referencia general. Verificación de UI con datos reales y cambio Oficial/MEP. Sin operaciones de dinero.
