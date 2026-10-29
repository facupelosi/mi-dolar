# Mi dólar

Comparador de cotizaciones gratuito, sin inicio de sesión. Fuentes: Compará Dólar y CriptoYa. Sitio estático; los montos y preferencias se guardan sólo en el navegador. No opera dinero ni conecta cuentas bancarias.

Los precios son referencias: tienen fecha, vencimiento y validación. Las cotizaciones con comisiones desconocidas, demoras o diferencias entre fuentes no generan una recomendación automática.

## Publicación
GitHub Pages desde la rama main, carpeta raíz. No necesita instalación ni compilación. Los archivos usan rutas relativas para funcionar en el subdirectorio del proyecto.

## Fuentes
- https://comparadolar.ar/docs/introduction
- https://docs.criptoya.com/argentina/

Sin garantías de ejecución al precio mostrado. Verificar condiciones y monto final en la entidad.

## Actualización de calidad de datos

Las observaciones se conservan separadas por proveedor, entidad, modalidad y condición. Una fecha anterior o un precio inválido no sustituye al último válido. La conciliación elige el dato más nuevo y conserva procedencia; diferencias superiores a 0,3% entre fuentes recientes se ponen en revisión. La coincidencia entre agregadores no garantiza independencia de sus fuentes originales.

La hora de observación del proveedor y la hora de consulta se muestran por separado. El navegador conserva hasta 500 cambios y las últimas 60 mediciones de consulta entre ambas fuentes; es una muestra local, no una certificación de disponibilidad global. La actualización no continúa al cerrar la app. Las fuentes y costos continúan sujetos a sus condiciones y a confirmación en cada entidad.

Favoritos: marcar con estrella en Ajustes → Mis apps, o en Ver todas. El filtro Solo mis favoritos y la selección de cuentas se guardan en el navegador.

Pruebas: `node --test tests/ingestion.test.mjs` (sin instalar dependencias).
