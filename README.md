# Luana · Mis XV
Invitación independiente con Next.js, React, Three.js y GSAP ScrollTrigger.

## Desarrollo
npm install
npm run dev

## Producción
npm run build
La exportación estática queda en out/.

## Personalizar
Editar public/invitacion.json:
- date: fecha ISO con zona horaria (Argentina: -03:00).
- venue / address: salón y dirección completa para Google Maps y Waze.
- whatsapp: código internacional y número, solo dígitos. Los formularios preparan un mensaje; el invitado debe enviarlo en WhatsApp. No hay base de datos ni envío automático.
- photos: URLs HTTPS o rutas /fotos/imagen.jpg (guardar archivos en public/fotos). También admite objetos {"src":"/fotos/imagen.jpg","alt":"Descripción"}.
- demo: cambiar a false al cargar los datos reales.

La fecha y el salón iniciales son ejemplos. Sin WhatsApp configurado, no se simulan envíos exitosos. La galería muestra espacios ilustrados hasta agregar fotos. La escena respeta movimiento reducido y libera recursos al desmontarse.
