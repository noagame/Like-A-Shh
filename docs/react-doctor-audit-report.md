# Informe de auditoría React Doctor — Like a Shh

Fecha: 2026-07-04
Proyecto: Like a Shh
Tecnología: Next.js 16.2.9 + React 19 + Framer Motion

## Objetivo

Registrar los cambios aplicados para corregir los hallazgos reportados por React Doctor y dejar una referencia clara para futuras auditorías o solicitudes de soporte.

## Resumen ejecutivo

Se aplicó una revisión completa de los problemas de calidad, accesibilidad, rendimiento y estabilidad reportados por React Doctor. La auditoría concluyó con un resultado limpio: no se encontraron issues pendientes en la ejecución final.

## Problemas corregidos

### 1. Botones sin tipo explícito
- Problema: algunos botones no declaraban `type`, lo que podía generar envíos accidentales en formularios.
- Acción: se añadió `type="button"` a los controles de UI y se mantuvo `type="submit"` en el botón de envío del formulario.
- Archivos afectados:
  - [app/components/AboutSection.tsx](../app/components/AboutSection.tsx)
  - [app/components/GallerySection.tsx](../app/components/GallerySection.tsx)

### 2. Uso de índices como clave en listas
- Problema: React podía asociar elementos incorrectamente cuando la lista cambiaba.
- Acción: se reemplazaron las claves basadas en índices por valores estables, preferentemente identificadores o rutas únicas.
- Archivos afectados:
  - [app/components/AboutSection.tsx](../app/components/AboutSection.tsx)
  - [app/components/FAQSection.tsx](../app/components/FAQSection.tsx)
  - [app/components/GallerySection.tsx](../app/components/GallerySection.tsx)

### 3. Accesibilidad en controles de formulario
- Problema: algunos campos del formulario no tenían una asociación accesible con su etiqueta.
- Acción: se añadieron etiquetas visibles o de ayuda para lectores de pantalla.
- Archivos afectados:
  - [app/components/ContactSection.tsx](../app/components/ContactSection.tsx)

### 4. Mismatch de hidratación por uso de fecha en render
- Problema: se estaba calculando el año en JSX con `new Date()`, lo que podía generar diferencias entre servidor y cliente.
- Acción: se movió la lógica a un enfoque compatible con el renderizado del lado del cliente.
- Archivos afectados:
  - [app/components/Footer.tsx](../app/components/Footer.tsx)

### 5. Imágenes con Next.js Image sin dimensiones
- Problema: el componente `Image` de Next.js exige dimensiones explícitas o `fill` para funcionar correctamente.
- Acción: se ajustaron las imágenes para usar `width/height` o `fill` según el caso.
- Archivos afectados:
  - [app/components/AboutSection.tsx](../app/components/AboutSection.tsx)
  - [app/components/CoursesSection.tsx](../app/components/CoursesSection.tsx)
  - [app/components/EventsSection.tsx](../app/components/EventsSection.tsx)
  - [app/components/Footer.tsx](../app/components/Footer.tsx)
  - [app/components/GallerySection.tsx](../app/components/GallerySection.tsx)
  - [app/components/Navbar.tsx](../app/components/Navbar.tsx)

### 6. Soporte para movimiento reducido
- Problema: la app usaba Framer Motion sin considerar la preferencia de movimiento reducido del sistema.
- Acción: se integró el soporte con `useReducedMotion` para adaptar las animaciones.
- Archivos afectados:
  - [app/components/WhatsAppButton.tsx](../app/components/WhatsAppButton.tsx)

### 7. Dependencia sin uso
- Problema: se detectó una dependencia no utilizada en el proyecto.
- Acción: se removió del archivo de dependencias.
- Archivos afectados:
  - [package.json](../package.json)

## Verificación realizada

Se ejecutaron las siguientes comprobaciones:

1. `npm run lint`
   - Resultado: correcto, sin errores.

2. `npm run build`
   - Resultado: compilación exitosa de Next.js.

3. `npx react-doctor@latest --verbose --yes --no-score`
   - Resultado: se reportó “No issues found”.

## Estado final

La auditoría de React Doctor quedó cerrada con éxito y no quedan issues pendientes según la ejecución final.
