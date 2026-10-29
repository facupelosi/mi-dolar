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
