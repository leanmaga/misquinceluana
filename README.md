# Invitación reutilizable · Next.js + React + Three.js + GSAP

## Cambiar los datos
Todo el contenido personalizado está en **public/invitacion.json**. No hay que editar componentes para cambiar de persona.

- name: nombre en portada, firma, pie, pestaña y mensajes de WhatsApp.
- age / celebration: edad y nombre del festejo. Los textos narrativos se editan en copy (por ejemplo, reemplazar la palabra Quince para otra edad).
- date: fecha ISO con zona horaria. 2027-12-11T21:00:00-03:00 = 11 de diciembre de 2027, 21:00, Argentina.
- timezone / locale: zona y formato de la fecha.
- venue / address: salón y dirección completa. Ambos botones de mapas usan address.
- whatsapp: número internacional, solo dígitos. Si está vacío, no se envía nada. El invitado termina el envío en WhatsApp; no se guardan respuestas en una base de datos.
- copy: títulos y textos personales.
- timeline: capítulos en el orden que se muestran. Cada capítulo tiene label, title, description y photos. El orden es editorial, sin atribuir edades o fechas no confirmadas.
- photos: cada foto lleva src (ruta /fotos/archivo.jpeg o HTTPS), alt y position (encuadre CSS). Para otra persona, agregá sus imágenes en public/fotos y cambiá las rutas del JSON.
- music.enabled: mostrar/ocultar música. music.youtubeId es el identificador del video oficial; el reproductor aparece solo tras pulsar el botón. music.src permite reemplazar YouTube por un archivo de audio propio en public/musica, por ejemplo /musica/cancion.mp3. src tiene prioridad sobre youtubeId. No se descargó ni se incluyó una copia del audio de YouTube.
- gifts.enabled: mostrar/ocultar regalos. gifts.alias y gifts.provider definen la cuenta. **gifts.active=false** muestra el alias como ejemplo y deshabilita su copia. Cuando exista la cuenta real, actualizar alias y recipient y poner active=true. No configurar un alias ficticio como activo.

El JSON se solicita sin caché. En desarrollo basta editarlo y recargar. Para publicar cambios desde el proyecto, volver a compilar y desplegar; si editás el archivo en un hosting estático directamente, el sitio lo toma al recargar.

## Ejecutar
npm install
npm run dev

## Compilar y ver la exportación
npm run build
node preview.mjs
http://localhost:3015

out/ es la exportación estática. No se necesita un servidor Next.js para alojarla. La animación libera recursos al desmontarse, respeta movimiento reducido y pausa el dibujo con la pestaña oculta. Las fotos se cargan de forma diferida y se amplían en un diálogo accesible.

La imagen de referencia se utilizó como orientación estética; no se publica su marca de agua ni se usa como foto de la quinceañera.
