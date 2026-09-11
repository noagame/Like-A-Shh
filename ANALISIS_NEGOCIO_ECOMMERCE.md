# Análisis de Negocio E-Commerce: Like a Shh

## 1. Resumen ejecutivo

Like a Shh es hoy una plataforma híbrida de **e-commerce de servicios con generación de leads y catálogo digital**. No es aún un e-commerce pleno: facilita el descubrimiento y la reserva de experiencias, mientras que los cursos grabados se monetizan en Hotmart y las reservas no liquidan un pago en la plataforma. Su prioridad estratégica es unificar el checkout y el registro transaccional sin deteriorar la experiencia de reserva ni la seguridad de los datos personales.

## 2. Diagnóstico del modelo actual

### Clasificación

| Componente | Estado actual | Clasificación |
| --- | --- | --- |
| Landing, galería y contacto | Descubrimiento, confianza y contacto | Lead generation |
| Cursos en Hotmart | Catálogo con salida a un checkout de tercero | Catálogo digital / afiliación o venta externa |
| Eventos y clases | Inventario de cupos, reserva y gestión de asistencia | E-commerce de servicios sin cobro in-app |
| `/mi-cuenta` | Historial, reservas, perfil y privacidad | Capa de retención / CRM transaccional |

### Cadena de valor digital

1. **Atracción.** La landing comunica la marca, evidencia social, cursos, eventos y galería. Sus CTA deben conducir a una intención única y medible: crear cuenta, explorar, reservar o comprar.
2. **Conversión.** La alumna autenticada navega `/mi-cuenta/explorar`, compara fecha, modalidad, ubicación y cupos, y registra la reserva. La capacidad se protege en base de datos, lo que evita sobreventa de cupos.
3. **Entrega.** La sesión presencial u online se ejecuta fuera del producto, con el enlace o dirección disponible para la alumna inscrita.
4. **Retención.** `/mi-cuenta`, reseñas, historial, comunidad y comunicación posterior a la clase sostienen recompra y recomendación.

### Flujo de monetización y fricciones

Hotmart resuelve impuestos, medios de pago y entrega de cursos, pero traslada a la usuaria a otro dominio. Eso interrumpe la continuidad visual, dificulta atribuir el pago al recorrido de Like a Shh y limita los bundles entre curso y clases. Por otra parte, reservar una clase sin cobrar reduce fricción inicial, pero expone al negocio a no-shows y no registra ingreso, AOV ni cohorte de compra.

## 3. Gap analysis hacia e-commerce pleno

### Capacidades faltantes

| Brecha | Riesgo actual | Recomendación de producción |
| --- | --- | --- |
| Checkout integrado | Fuga de conversión y pago no atribuible | Adaptador de pagos con Webpay Plus como prioridad local; Mercado Pago y Stripe como alternativas según expansión. |
| Confirmación asíncrona | Un redirect de éxito no prueba pago | Crear pago en estado `pending`; confirmar exclusivamente con webhook firmado, idempotente y registrado. |
| Órdenes e ítems | No hay fuente de verdad comercial | Tablas `orders`, `order_items`, `payments`, `pricing_tiers`, `coupons` y ledger de cambios. |
| Producto recurrente | Venta aislada, LTV limitado | Packs de 4/8 clases con saldo, pase libre mensual y reglas explícitas de vencimiento. |
| DTE chileno | Riesgo operacional y tributario | Integrar proveedor certificado (OpenFactura o Haulmer) después de `payment=paid`; almacenar folio, XML/PDF y resultado. |
| Analítica de embudo | Decisiones sin atribución | Eventos de adquisición, checkout, pago, asistencia y renovación con IDs pseudonimizados. |

### Modelo de datos objetivo

`orders` debe contener `id`, `user_id`, moneda CLP, subtotal, descuento, total, estado (`pending`, `paid`, `cancelled`, `refunded`), canal y timestamps. `order_items` referencia una orden y un producto/version de precio; no debe depender de un precio mutable. `payments` conserva proveedor, referencia externa única, estado, monto, payload mínimo y fecha de confirmación. `pricing_tiers` define precios y vigencia. `coupons` y `coupon_redemptions` separan regla promocional de su uso efectivo.

El webhook debe verificar firma, tomar un bloqueo por `provider_reference`, comparar moneda/monto contra la orden y ejecutar una transición de estado permitida. La reserva se confirma al pago o se sostiene temporalmente con expiración explícita. Nunca se debe confiar en la URL de retorno del navegador como señal de pago.

### Productos recurrentes

Un pack necesita una entidad de saldo (`class_credits`) con compra origen, créditos totales/disponibles, vencimiento y consumo idempotente por reserva. Un pase mensual requiere suscripción, período de facturación, estado, reglas de elegibilidad y límites de reserva concurrente. Se recomienda empezar por “Pack 4 clases” y “Pack 8 clases”: son más simples que el cobro recurrente y permiten validar demanda, elasticidad y asistencia.

### Facturación electrónica

El flujo recomendado es: webhook confirmado → orden `paid` → cola/outbox → emisión DTE por proveedor → guardar `dte_status`, folio y URL de documento → notificar a la alumna. Si el DTE falla, el pago conserva `paid`; se reintenta la emisión con una clave idempotente y se alerta a administración. Los datos tributarios deben pedirse solamente cuando sean necesarios y conservarse según la política de retención aplicable.

## 4. Marco de KPIs

| KPI | Fórmula | Decisión que habilita |
| --- | --- | --- |
| CAC | gasto atribuible de captación / nuevas clientas pagadoras | Escala y eficiencia de canal |
| LTV | margen bruto medio por clienta × frecuencia × vida estimada | Límite sostenible de CAC |
| Churn | alumnas activas que no renuevan / alumnas elegibles al inicio | Valor de packs, programación y retención |
| Conversión | órdenes pagadas / sesiones o leads cualificados | Fricción de landing y checkout |
| AOV | ingresos netos / órdenes pagadas | Bundles, precio y promociones |
| No-show | reservas no asistidas / reservas confirmadas | Política de cancelación y recordatorios |

El tablero debe segmentar por canal, primera compra vs. recompra, modalidad y cohorte mensual. Los valores financieros deben calcularse con pagos confirmados, reembolsos y descuentos, nunca con reservas.

## 5. Hoja de ruta priorizada

**Fase 1 (0–4 semanas):** instrumentación de eventos, catálogo de precios, políticas de cancelación claras y comunidad moderada. **Fase 2 (4–8 semanas):** órdenes, Webpay sandbox, webhooks idempotentes, checkout de una clase y panel de conciliación. **Fase 3 (8–12 semanas):** packs, cupones, DTE y automatizaciones de recuperación. Cada fase debe desplegarse primero en staging, con pruebas de RLS, pago duplicado y recuperación ante webhook tardío.
