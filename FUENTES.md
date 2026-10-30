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

## Ampliación — referencia oficial de Brubank (29/10/2026)
Se incorporó la hoja pública usada por https://www.brubank.com/dolar-oficial mediante Google Visualization sin claves ni cuenta. Recuadro propio en Cotizaciones / Oficial. Es una referencia publicada, no una oferta ejecutable confirmada. Se informa hora de lectura separada de la hora desconocida del precio, plan no confirmado y exclusión del ranking y la calculadora. Cache local validada; un fallo de red conserva la última lectura con aviso. El JSONP se analiza como texto con JSON.parse, nunca eval ni script remoto.

Continuación de búsqueda Mercado Pago: se revisó su documentación oficial Developers/Reference y Cross Border, más la API gratuita Dolarazo. La documentación revisada no ofrece una cotización pública propia de compra/venta USD en billetera; Dolarazo documenta tipos generales, no entidades. La conversión Cross Border pertenece a cobros internacionales y no es evidencia de precio minorista USD. Sigue visible sin cotización verificable; no se reemplaza con MEP genérico ni P2P.

Validación de esta ampliación: 29 pruebas automatizadas; carga real de la hoja, separación Oficial/MEP y exclusión de referencia sin plan/hora de la calculadora verificadas en UI.

## Hacer rendir mis pesos — 29/10/2026

Nueva pestaña Mi plata: monto en ARS, días (1/7/14/30), comparación por ganancia estimada aplicando mínimos y topes. Interés simple: min(saldo,tope) × TNA × días / 365. No capitaliza, descuenta impuestos ni cargos; mantiene saldo y tasa constantes como supuesto. No presenta estimaciones como ganancias garantizadas ni ajustadas por inflación.

Fuente dinámica: https://api.argentinadatos.com/v1/finanzas/fci/otros/ultimo . Se verificó su uso para cuentas en el proyecto público ComparaTasas y se contrastaron tasas y condiciones de Naranja X/Ualá en sus sitios oficiales. Se normalizan sólo productos de cobertura conocida, tasas numéricas en proporción, tope positivo, fecha real no futura y cuentas sin plazo. Fechas de más de 3 días no se destacan. Cache validada, sin inventar tasas en fallos y sin retroceder a fechas anteriores.

Cobertura inicial: Naranja X, Ualá base/Plus 1/Plus 2 y Fiwind opcional. No afirma cobertura total. Ualá especial requiere elección explícita de una tasa ya activa; la opción vuelve a base al recargar. Fiwind es FCI con bonificación (riesgo distinto de depósito bancario) y requiere inclusión explícita. Sobre su excedente del tramo bonificado hay rendimiento variable no estimado: la comparación parcial queda fuera de la mejor opción. Se respeta acreditación mínima diaria de un centavo para Fiwind. No se incluyen criptopesos, otros FCI, plazos fijos ni frascos en esta primera versión.

Fuentes oficiales contrastadas:
- https://www.naranjax.com/cuenta-remunerada : tope, activación, fórmula diaria y disponibilidad.
- https://www.uala.com.ar/inversiones/cuenta-remunerada : mínimo, tope, tasas base/Plus, condiciones y variabilidad. El beneficio actual tiene condiciones mensuales: la proyección supone que se mantienen durante todo el plazo, no lo garantiza.
- https://help.fiwind.io/es/articles/11723346-tus-primeros-pesos-rinden-mas : tramo bonificado y excedente variable.
- https://help.fiwind.io/es/articles/11459227-hay-un-monto-minimo-y-maximo-para-empezar-a-generar-rendimientos : mínimo y acreditación diaria.
- https://help.fiwind.io/es/articles/11420019-puedo-usar-mis-pesos-si-tengo-activados-los-rendimientos : disponibilidad y tipo FCI.

Validación: 42 pruebas automáticas aprobadas. UI con datos reales: monto 500.000/30 días, monto superior a topes, Plus 2 explícito, FCI opcional, rechazo de separadores ambiguos, vuelta segura a base tras recarga, navegación a Dólar y Brubank, pantalla móvil sin desborde horizontal. Cambios sólo en frontend; sin cuentas conectadas ni movimientos de dinero.

Reversión: restaurar el commit anterior f4ddaa9 y publicar de nuevo. Los datos y preferencias locales de pesos usan claves separadas de las cotizaciones USD.

## Ampliación de billeteras, plazos y UX — versión 9 (29/10/2026)

- Dólar primero e inicial. Mi plata, Calcular y Fuentes separados. Se eliminó la duplicación de ganador/resumen y tarjeta. Productos agrupados por cuentas, fondos asociados y plazos fijos; filtros de categoría, plazo y liquidez, condiciones de cliente/no cliente y Ualá explícitas.
- Fondos: https://api.argentinadatos.com/v1/finanzas/fci/comparatasas . Mercado Pago (Mercado Fondo A), Personal Pay (Delta Pesos X), Prex (Allaria Ahorro E), Claro Pay (SBS Ahorro Pesos A). Mapeo de clases de referencia del catálogo público de ComparaTasas; no verifica la clase suscripta de cada usuario. Escenario calculado desde retorno del período y días originales, contrastado con TNA equivalente. No presenta ese dato como tasa actual de billetera, no asume topes ilimitados ni destaca ganador contra cuentas o depósitos.
- PF: https://api.argentinadatos.com/v1/finanzas/tasas/plazoFijo . Contrato público: referencia BCRA a $100.000/30 días y tramos por monto/plazo. Sin fecha original; no se inventa una ni se destaca la mejor oferta vigente. Consultar no cambia esa limitación. Se validan montos y plazos de los tramos y se rechazan contradicciones. Límites nulos se tratan como extremos abiertos sólo para una simulación de referencia, con aviso de mínimos/elegibilidad a confirmar. Tramos sin categoría explícita no se transfieren a no clientes.
- Fuentes originales de respaldo: https://www.bcra.gob.ar/plazos-fijos-online/ ; https://www.bcra.gob.ar/api/endpoints/plazos-fijos.php ; https://www.uala.com.ar/inversiones/plazo-fijo ; https://estadisticas.cafci.org.ar/fondos/798?clase=1982 ; https://www.personal.com.ar/pay/blog/inversiones/calcular-rendimiento ; https://www.prexcard.com.ar/centro-de-ayuda/mis-rendimientos/cuenta-remunerada-en-pesos/como-se-obtienen-los-rendimientos-de-mi-saldo-en-pesos ; https://claropay.com.ar/p/claropay/legals.html . Las fuentes oficiales respaldan producto y administrador; no todas identifican la clase minorista, por eso se conserva la aclaración de clase referencial.
- Confiabilidad: esquemas y unidades validadas, fechas futuras/imposibles rechazadas, anti-regresión de fechas, fecha del dato y lectura separadas, datos cacheados identificados, consultas fallidas sin destacar datos. Tasas de cuentas/fondos de más de 3 días no se consideran recientes. Lecturas de cuentas cada 2 minutos (vigencia de consulta 3); fondos/PF cada 10 minutos (vigencia de consulta 15). Actualizar manual fuerza consulta, con el límite global de un minuto. Tres conjuntos del mismo agregador no son tres fuentes independientes.
- Dólar: se deja de afirmar sin comisión automáticamente o por cache heredada. Cargos desconocidos permanecen desconocidos; se compara precio publicado, no costo final ejecutable garantizado.
- Validación: 60 tests automáticos locales y casos de interfaz documentados en CASOS-DE-USO.md. Se comprobó una respuesta real válida de cuatro fondos y 33 entidades de PF. No se certifica exactitud universal, totalidad de cobertura ni rendimiento futuro.

## Tarifarios oficiales fechados — versión 10

Verificados el 29/10/2026. Banco Nación: canal electrónico, personas humanas, ARS; vigencia del tramo 02/10/2026 y documento vigente al 26/10/2026. Mínimo electrónico $500 (no confundir con sucursal $1.500). Banco Provincia: BIP/TAS personas humanas, ARS, vigencia desde 04/09/2026; no se deduce vigencia por la fecha de descarga. Mínimo no verificado en el tarifario, visible como a confirmar. Se conserva la condición de cartera total/cotitularidad.

Se descargan documentos oficiales con scripts/collect_official_pf.py (Python 3.12+, pypdf 6.10.0). Extracción limitada al canal de personas humanas en pesos, tabla de tramos y fechas explícitas; un cambio de estructura no produce tasas inventadas. Registra URL, SHA256 y fecha de revisión. Cada banco falla por separado, sin reutilizar una tasa vieja como recién verificada. La UI bloquea el cálculo vigente tras 24h sin verificación y al fallar la consulta local; no extrapola la tasa de clientes a no clientes ni a menos de 30 días.

Actualización automática pendiente: GitHub rechazó la creación del workflow por faltar el scope workflow a la credencial facupelosi. La propuesta lista está en work/publish.yml local (no publicada). No se cambió la configuración de Pages. Por ahora el JSON se renueva al ejecutar el recolector y publicar. El botón Actualizar de la app descarga el último JSON publicado; no ejecuta el recolector en GitHub.

Fuentes primarias: https://www.bna.com.ar/Home/InformacionAlUsuarioFinanciero y PDF enlazado; https://www.bancoprovincia.com.ar/content/docs/Plazos_fijos_tasas_vigentes.pdf . Son tarifarios públicos publicados por el banco, no una cotización autenticada para cada usuario. Hipotecario fue descartado: el documento encontrado indicaba vigencia antigua; no se usó una fecha de consulta o de términos para suplir una fecha de tasa.


## Automatización habilitada — versión 11

El 29/10/2026 se autorizó el scope workflow de facupelosi y se migró Pages de legacy a workflow. `.github/workflows/publish.yml` revisa documentos oficiales cada 6 horas (minuto 17 UTC), ante pushes y con ejecución manual. Guarda la verificación en un commit de datos y publica un artefacto que contiene sólo los archivos públicos. El commit de datos es evidencia nueva real de verificación y mantiene el repositorio actualizado. Se usa GITHUB_TOKEN temporal con contents:write, pages:write, id-token:write; no se publican credenciales. Las pruebas usan un fixture fijo, no esperan tasas constantes en los datos vivos.

Primera ejecución correcta: https://github.com/facupelosi/mi-dolar/actions/runs/40940397434 . Se verificaron ambas fuentes desde el runner de GitHub y se publicó el JSON nuevo. Esto reemplaza el bloqueo de permisos descrito para v10; ya no está pendiente. La programación de GitHub puede demorarse; la app mantiene el corte de 24 horas y no inventa vigencia ante fallos. El botón Actualizar descarga el último resultado del servidor. Una revisión del documento no cambia su fecha original de vigencia.

## Selección de apps digitales populares — 29/10/2026

Mi plata se concentra en Naranja X, Mercado Pago, Ualá, Personal Pay, Brubank, Prex y Claro Pay. Las siete aparecen en el primer tramo del ranking gratuito de Finanzas para iPhone Argentina consultado en https://apps.apple.com/ar/iphone/charts/6015 . Es una selección editorial por presencia en el ranking y pertinencia para pesos; no un ranking de usuarios activos ni una afirmación de que sean las siete primeras. Se excluyen bancos tradicionales, apps cuyo uso principal queda fuera de la comparación en pesos y opciones que no están en esta selección. La selección es fechada, no se presenta como ranking en vivo.

Nación y Provincia salen de la UI de Mi plata. Sus documentos históricos y el recolector se conservan para no romper la automatización ni perder trazabilidad del trabajo anterior; no alimentan la comparación visible. Los plazos fijos de referencia se filtran a entidades digitales identificadas (Ualá y Brubank), y sin fecha de tasa no se calcula ganancia vigente. Las otras apps informan ausencia de plazo fijo con tasa fechada verificada, sin afirmar que no ofrezcan inversiones.

## Fuentes oficiales de las siete apps (investigación 29/10/2026)

El recolector scripts/collect_official_apps.py consulta páginas públicas oficiales, sin autenticación, y registra lectura, URL, hash y fecha original por separado. La automatización cada seis horas publica data/official-apps.json. Fallos o cambios de esquema no inventan tasas. La evidencia vence tras 24h y respeta el fin explícito de campañas.

- Naranja X: página cuenta-remunerada, 20% TNA y tope $1M observados; fecha original ausente. Se contrasta con la referencia fechada de la cuenta.
- Ualá: cuenta-remunerada, base 19%, Plus 1 20%, Plus 2 24%; $10.000 mínimo / $1M tope; campaña publicada 01/10–31/10/2026. Una discrepancia de tasa, tope o nivel con la referencia del cálculo bloquea la ganancia. Plus no se activa por elegirlo en el simulador.
- Mercado Pago: /cuenta publica 19% anual indicativo en pesos, sin fecha original ni tope explícito. Se usa en un escenario condicionado a que todo el saldo aplique; no se presenta como oferta ejecutable ni participa de un ganador entre depósitos.
- Brubank: ayuda/10508364-tasas-de-interes-vigentes publica Cuenta Max general 19%, $1M, al 09/09/2026. Se muestra esa fecha sin calcular una oferta actual. FAQ/9926124 confirma que el viernes se adelantan los rendimientos de fin de semana. Los TyC requieren activación y elegibilidad; la app informa la TNA diaria.
- Personal Pay: blog oficial identifica Delta Pesos clase X; cuentas-remuneradas confirma mínimo $1, sin máximo y rendimiento histórico. No publica un porcentaje numérico vigente en las páginas consultadas.
- Prex Argentina: ayuda explica TNA de últimos 7 días. Allaria/Fondo/Money-Market publica clase E al 28/10, 1M 1,64%; escenario mensual de 30 días, equivalente anual simple 19,9533%. Es un período distinto del indicador de Prex y conserva la advertencia de clase de referencia a confirmar. No se usó Prex Uruguay.
- Claro Pay: FAQs identifica SBS Ahorro Pesos y honorarios deducidos; sin porcentaje actual de app. La página del administrador enlazada devolvió 403: no se eludió la restricción; continúa el escenario histórico del catálogo intermediario, identificado como tal.

Las cuatro billeteras no se presentan como depósitos garantizados; se distingue porcentaje indicativo, historial del fondo y tasa nominal de cuenta. Verificar condiciones personales antes de operar.
