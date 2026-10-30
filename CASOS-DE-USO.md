# Casos de uso y validación — versión 9

Fecha: 29/10/2026. App: https://facupelosi.github.io/mi-dolar/?v=9

## Qué se comprobó

60 pruebas automáticas locales aprobadas. Verificación de interfaz con datos reales en navegador Chromium controlado, a tamaños móviles de 320 y 390 px; no equivale a una prueba física en Safari/iPhone. Ninguna operación financiera realizada.

| Caso | Comportamiento esperado y comprobado | Evidencia |
|---|---|---|
| Abrir app | Dólar es primera pestaña y pantalla inicial | UI |
| Cambiar de sección | Mi plata, Calcular y Fuentes separados; filtros USD sólo en Dólar/Calcular | UI |
| $1.500.000 a 30 días | Cuentas con tope $1 M sólo calculan intereses sobre $1 M y muestran $500.000 fuera del tope | UI + tests |
| Ualá Plus 2 | Requiere selección explícita; tasa especial no se suma a base | UI + tests |
| Recargar | Dólar vuelve al inicio; Plus y bonificación no quedan asumidas | UI + inspección del código |
| Mercado Pago | Visible en billeteras como Mercado Fondo A, con fecha y escenario histórico | UI + tests |
| Comparación de fondos | No hay ganador garantizado frente a depósitos; mínimo y tope no verificado visibles | UI + tests |
| FCI distinto de ARS/clase incorrecta | No se usa como si fuera el fondo de esa billetera | Tests |
| TNA del FCI | Se calcula desde retorno de un mes y días reales; se contrasta con métrica anual de la fuente | Tests + consulta real |
| Rendimiento pasado negativo | Se muestra pérdida, no ganancia positiva; no se extrapola a saldo negativo | Tests |
| Plazo fijo a 7 días | Sin cálculo: exige al menos 30 días | UI + tests |
| Dinero disponible antes del vencimiento | PF excluido de cálculo mientras no acepte inmovilización | UI + tests |
| PF de $500.000 a 60 días para clientes | Sólo tramos aplicables; fecha original ausente indicada y sin mejor oferta vigente | UI + tests |
| PF para no clientes | No reutiliza tramos de clientes ni interpreta 0 como tasa disponible | UI + tests |
| Tasa genérica BCRA | Se aplica únicamente al monto/plazo declarado de $100.000/30 días | Tests |
| Frontera de tramo | Cambia de tasa exactamente en el monto o plazo indicado; tramos contradictorios no calculan | Tests |
| Fecha futura o imposible | Registro rechazado | Tests |
| Dato viejo recién descargado | Conserva fecha original y etiqueta de demora; consulta no lo rejuvenece | Tests |
| Fuente caída o cache | No habilita destacar una mejor opción; conserva datos con aviso | Tests de política de estado; no corte real de Internet |
| Respuesta con esquema/unidad incorrecta | No convierte silenciosamente cadenas ni porcentajes erróneos | Tests |
| Fuentes por conjunto de datos | Estado, cantidad de registros, descartes y enlaces en pestaña Fuentes | UI |
| Teclado | Flechas cambian pestaña en orden Dólar → Mi plata → Calcular → Fuentes | UI |
| Móvil 320 px | Sin desborde horizontal en el caso de tope y Plus | UI, scrollWidth=clientWidth |
| Monto ambiguo | Validación de separadores y límites preservada | Tests; UI en versión previa |
| Brubank / dólar | Referencia oficial sin fecha/plan sigue fuera de ranking/calculadora; compra/venta separadas | Tests de regresión |

## Límites de la verificación

- No se verificaron cuentas autenticadas, tasas personalizadas, disponibilidad de apertura, promociones de cada usuario, impuestos ni cargos finales.
- Las fechas originales y condiciones son las declaradas por las fuentes; no hay garantía de exactitud de terceros ni SLA de los endpoints públicos.
- ArgentinaDatos es un agregador único para los tres conjuntos de Mi plata; tres consultas correctas no significan tres verificaciones independientes.
- Las clases de fondo se toman de un catálogo público contrastado con las páginas del producto/administrador. Se presentan como clases de referencia, no como certificación de la clase suscripta por cada usuario.
- Ningún PF se destaca como mejor oferta vigente mientras la fuente no informe fecha original. Los cálculos fuera de la referencia genérica requieren tramo explícito; mínimos/eligibilidad a confirmar.

## Revertir

La versión anterior es el commit 770121c. Un revert de los cambios de esta versión y nueva publicación restaura la interfaz previa; las preferencias y snapshots locales usan claves separadas.

## Versión 10 — menú y tarifarios oficiales

- Menú principal: Dólar / Mi plata. Dólar primero; calculadora a un toque debajo de los dos precios. Sin pestaña Fuentes. Mis apps y ajustes en desplegable secundario, trazabilidad conservada por producto.
- $500.000 / 30 días / clientes / inmovilizar: Provincia BIP 21% TNA, interés $8.630,14; Nación electrónico 19,25%, $7.910,96 según documentos verificados 29/10. Son ejemplos fechados, no tasas permanentes.
- 60 días Nación: toma 20% y no reutiliza 19,25%. Siete días, liquidez inmediata, no cliente y Nación por debajo de $500: sin cálculo aplicable.
- Sin verificación del documento durante más de 24h, consulta fallida, URL ajena al banco, fecha futura, porcentajes en unidad incorrecta o tramos superpuestos: no se ofrece una tasa vigente.
- Referencias del BCRA/ArgentinaDatos sin fecha original: desplegable separado, no compiten con los tarifarios oficiales.
- Automatización preparada pero no activada: falta permiso workflow de GitHub. No prometer refresco automático del documento mientras no se configure. Actualizar en el cliente vuelve a leer la publicación, sin renovar la fecha original.


## Versión 11 — Mi plata simple y actualización automática

Tres entradas: monto, días y qué comparar. Las cuentas disponibles, los plazos fijos y las billeteras se ven por separado. La selección de plazo fijo implica esperar al vencimiento y no exige un segundo control contradictorio. A menos de 30 días no se calcula plazo fijo. Ganancia estimada y total primero; TNA desarrollada en castellano, topes, mínimos y condiciones en un desplegable. Los datos sin fecha van dentro de metodología, fuera del recorrido principal. Las cuentas sin consulta reciente o con tasa demorada no muestran una ganancia vigente. Dólar sigue primero.

QA Chromium aislado: 320, 390 y 768 px sin overflow; cambio de cuentas a plazo fijo y regreso, bloqueo de 7 días, monto inválido sin resultados, sin errores JS. 64 pruebas de dominio pasan. No equivale a prueba física de Safari/iPhone. Actualización automática desde GitHub comprobada con documentos de los dos bancos y publicación nueva; no depende de esta computadora.

## Enlace permanente y actualización de la app

La URL para compartir e instalar es https://facupelosi.github.io/mi-dolar/ . Los parámetros antiguos `v` se eliminan de la barra sin navegar ni perder otros parámetros/anclas. El manifiesto ya abre la raíz estable. El proceso de publicación genera version.json y una huella determinista de los archivos de interfaz; excluye las cotizaciones y sus fechas de consulta, por lo que una revisión de tasas no obliga a recargar la app.

Con conexión, la interfaz compara su huella al abrirse, volver a primer plano y cada minuto visible. Una versión diferente recarga la interfaz; si el foco está en un campo editable o selector, ofrece «Actualizar app». Evita repetir una recarga automática a la misma versión en la misma sesión si la publicación/CDN todavía no coincide. Sin red mantiene la interfaz disponible, y la vigencia de tasas se controla por separado. Registro del service worker con updateViaCache:none y comprobación explícita de nuevas versiones. No requiere cambiar links ni reinstalar el acceso directo.

QA de actualización: enlace anterior con v=11 queda en raíz; cambio de versión con monto enfocado conserva la entrada y muestra botón; actualización manual y automática; publicación todavía discordante no crea bucle. 66 pruebas de dominio pasan. Pruebas de navegador en Chromium; no se certifica Safari físico.

## Apps populares — selección por App Store Argentina

La vista inicial reúne cuentas (Naranja X/Ualá), escenarios históricos del fondo asociado a Mercado Pago, Personal Pay, Prex y Claro Pay, y Brubank con ausencia de tasa verificable explícita. Se conservan los grupos y no se ordenan como equivalentes depósitos y fondos. No se incluyen Nación/Provincia ni en plazos fijos ni en referencias secundarias de Mi plata. Pruebas de navegador: siete apps presentes, ningún banco tradicional en el panel, ningún cálculo de plazo fijo sin fecha, sin overflow en 320 y 390 px. 67 pruebas de dominio pasan.

## Respaldo oficial por app

Se agregan fuentes oficiales desplegables a todas las apps, con fecha original y lectura separadas. Mercado Pago usa escenario con porcentaje indicativo publicado; Prex usa el retorno mensual fechado de Allaria cuando se puede validar. Brubank muestra 19% al 09/09 sin ganancia actual. Se bloquean discrepancias de cuentas y campañas vencidas; una nueva descarga no renueva la fecha de origen. Pruebas: 73 de dominio; UI sin errores JS, siete apps, MP $500.000/30d da $7.808,22 bajo supuesto publicado, sin cálculo vigente de Brubank y sin bancos tradicionales. Verificado en Chromium, no Safari físico.
