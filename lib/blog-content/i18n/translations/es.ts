import type { BlogLocalePack } from "../helpers";
import { createBlogLocalePack, createLocalizedPostSpec } from "./factory";

const sec = (heading: string, focus = heading) => ({ heading, focus });
const post = (spec: Parameters<typeof createLocalizedPostSpec>[1]) =>
  createLocalizedPostSpec("es", spec);

export const esBlogTranslations: BlogLocalePack = createBlogLocalePack("es", [
  post({
    id: "scooter-rental-price-magaluf",
    slug: "cuanto-cuesta-alquilar-scooter-magaluf",
    title: "Cuanto cuesta alquilar un scooter en Magaluf?",
    imageAlt: "Alquiler de scooter 125cc en Magaluf Mallorca",
    sections: [
      sec("Que influye en el precio del alquiler de scooter en Magaluf?", "La temporada, la duracion, el tipo de scooter y la disponibilidad real cambian el precio final."),
      sec("Que incluye NEXA Rentals?", "Con el alquiler de scooter se incluyen dos cascos, soporte para movil y candado de seguridad."),
      sec("Es mejor medio dia o 24 horas?", "Medio dia sirve para trayectos cercanos; 24 horas da mas libertad para playas, puestas de sol y paradas largas."),
      sec("Como consultar el precio exacto online", "La forma mas clara es elegir vehiculo, fecha y horario en la pagina de reserva antes de confirmar."),
    ],
  }),
  post({
    id: "license-125cc-scooter-spain",
    slug: "que-licencia-necesitas-alquilar-scooter-125cc-espana",
    title: "Que licencia necesitas para alquilar un scooter 125cc en Espana?",
    imageAlt: "Licencia de conducir para alquilar scooter 125cc en Espana",
    sections: [
      sec("Norma principal para scooters 125cc", "Un scooter 125cc suele estar asociado a la categoria A1 o a permisos B que cumplen condiciones espanolas."),
      sec("Se puede alquilar con carnet de coche?", "Muchos carnets B de Espana o la UE sirven si tienen experiencia suficiente, pero conviene confirmarlo."),
      sec("Que documentos necesitas?", "Debes llevar licencia original, DNI o pasaporte y metodo de pago para alquiler y deposito."),
      sec("Que hacer si no estas seguro?", "Enviar una foto por WhatsApp antes de reservar evita problemas al recoger el scooter."),
    ],
  }),
  post({
    id: "ebike-rental-price-magaluf",
    slug: "precio-alquiler-ebike-magaluf",
    title: "Cuanto cuesta alquilar una e-bike en Magaluf?",
    imageAlt: "Alquiler de e-bike en Magaluf Mallorca",
    sections: [
      sec("Precios de e-bike en NEXA Rentals", "Las e-bikes tienen tarifas por horas y una opcion de un dia, con duracion maxima de un dia."),
      sec("Que tipos de e-bikes hay?", "Hay e-bikes urbanas Moema y e-bikes de montana Cecotec para distintos estilos de ruta."),
      sec("Cuando elegir una e-bike?", "La e-bike es practica para Magaluf, Palmanova y trayectos cortos sin licencia de moto."),
      sec("Como alquilar una e-bike en Magaluf", "Consulta disponibilidad por WhatsApp o en tienda, sobre todo en dias de mucha demanda."),
    ],
  }),
  post({
    id: "best-place-rent-scooter-magaluf",
    slug: "mejor-lugar-alquilar-scooter-magaluf",
    title: "Cual es el mejor lugar para alquilar un scooter en Magaluf?",
    imageAlt: "Mejor tienda de alquiler de scooters en Magaluf Mallorca",
    sections: [
      sec("Por que importa la ubicacion en Magaluf", "Una tienda cercana al hotel facilita la recogida, la devolucion y cualquier duda durante el viaje."),
      sec("Que hace que una tienda sea la mejor para turistas?", "Precios claros, cascos incluidos, normas de deposito transparentes y atencion en varios idiomas marcan la diferencia."),
      sec("Reserva online frente a solo mostrador", "Reservar online asegura disponibilidad antes de aterrizar, especialmente en verano."),
      sec("Por que muchos visitantes eligen NEXA Rentals", "NEXA se centra en turistas de Magaluf con accesorios incluidos y soporte por WhatsApp."),
    ],
  }),
  post({
    id: "what-you-need-rent-scooter-mallorca",
    slug: "que-necesitas-alquilar-scooter-mallorca",
    title: "Que necesitas para alquilar un scooter en Mallorca?",
    imageAlt: "Documentos necesarios para alquilar scooter en Mallorca",
    sections: [
      sec("Requisitos de licencia de conducir", "Para 125cc normalmente necesitas A1 o un carnet B valido segun las reglas espanolas y europeas."),
      sec("DNI y pasaporte", "La empresa debe verificar tu identidad con documento original en la recogida."),
      sec("Deposito y pago", "El deposito se gestiona en la recogida y depende del vehiculo y las condiciones del alquiler."),
      sec("Edad y experiencia", "La edad minima y experiencia pueden variar por vehiculo y politica de la empresa."),
      sec("Lista practica antes de la recogida", "Prepara licencia, documento de identidad, confirmacion, metodo de pago y ropa comoda."),
    ],
  }),
  post({
    id: "rent-scooter-mallorca-car-licence",
    slug: "alquilar-scooter-mallorca-carnet-coche",
    title: "Puedes alquilar un scooter en Mallorca con carnet de coche?",
    imageAlt: "Alquilar scooter en Mallorca con carnet de coche",
    sections: [
      sec("Carnet de coche y scooters 125cc en Espana", "La categoria A1 cubre motos 125cc, aunque muchos permisos B de la UE pueden ser validos con experiencia."),
      sec("Que comprueba NEXA Rentals en la recogida", "Se revisan licencia original, pasaporte o DNI y datos de la reserva."),
      sec("Por que sigue siendo util reservar online", "Una vez confirmada la licencia, reservar online protege disponibilidad en semanas de alta demanda."),
    ],
  }),
  post({
    id: "scooter-rental-mallorca-deposit",
    slug: "deposito-alquiler-scooter-mallorca",
    title: "Necesitas deposito para alquilar un scooter en Mallorca?",
    imageAlt: "Deposito de alquiler de scooter en Mallorca",
    sections: [
      sec("Por que los alquileres usan deposito", "El deposito protege el vehiculo, accesorios, danos y devoluciones tardias."),
      sec("Cuando y como se paga el deposito", "Normalmente se gestiona al recoger el scooter y se explica en las condiciones de reserva."),
      sec("Consejos para una recogida sin problemas", "Llega con documentos, revisa el scooter y reserva pronto en temporada alta."),
    ],
  }),
  post({ id: "scooter-rental-magaluf-near-beach", slug: "alquiler-scooter-magaluf-cerca-playa", title: "Alquiler de scooter en Magaluf cerca de la playa: guia completa para turistas", imageAlt: "Alquiler de scooter cerca de la playa de Magaluf", sections: [sec("Por que alquilar cerca del paseo de playa"), sec("Que planificar antes de la recogida"), sec("Medio dia o dia completo para vacaciones de playa")] }),
  post({ id: "best-scooter-routes-magaluf", slug: "mejores-rutas-scooter-magaluf-primerizos", title: "Mejores rutas en scooter desde Magaluf para principiantes", imageAlt: "Mejores rutas en scooter desde Magaluf", sections: [sec("Ruta facil del primer dia"), sec("Ruta media para principiantes seguros"), sec("Que evitar en tu primera salida")] }),
  post({ id: "best-places-visit-scooter-magaluf", slug: "mejores-lugares-visitar-scooter-magaluf", title: "Mejores lugares para visitar en scooter desde Magaluf", imageAlt: "Lugares para visitar en scooter desde Magaluf", sections: [sec("Playas y calas de la costa"), sec("Paradas mas largas del suroeste"), sec("Como planificar el dia")] }),
  post({ id: "magaluf-to-palma-scooter", slug: "ir-de-magaluf-a-palma-en-scooter", title: "Puedes ir de Magaluf a Palma en scooter?", imageAlt: "Magaluf a Palma en scooter", sections: [sec("Distancia y tiempo realista"), sec("Aparcamiento y conduccion urbana en Palma"), sec("Consejo sobre duracion del alquiler")] }),
  post({ id: "scooter-vs-taxi-magaluf", slug: "scooter-vs-taxi-magaluf-mas-barato", title: "Scooter vs taxi en Magaluf: que es mas barato para turistas?", imageAlt: "Scooter frente a taxi en Magaluf", sections: [sec("Como se acumulan los costes de taxi"), sec("Donde ahorra dinero el scooter"), sec("Cuando el taxi sigue siendo mejor")] }),
  post({ id: "scooter-vs-car-rental-mallorca", slug: "scooter-vs-coche-alquiler-mallorca", title: "Scooter vs coche de alquiler en Mallorca: cual conviene mas?", imageAlt: "Scooter frente a coche de alquiler en Mallorca", sections: [sec("Aparcamiento y trafico en verano"), sec("Coste y accesorios incluidos"), sec("Elige segun tu tipo de viaje")] }),
  post({ id: "is-renting-scooter-mallorca-worth-it", slug: "merece-la-pena-alquilar-scooter-mallorca", title: "Merece la pena alquilar un scooter en Mallorca?", imageAlt: "Merece la pena alquilar scooter en Mallorca", sections: [sec("La libertad que realmente notas"), sec("Quien deberia evitar el scooter"), sec("Como aprovechar el precio")] }),
  post({ id: "tourists-rent-125cc-mallorca", slug: "turistas-alquilar-scooter-125cc-mallorca", title: "Pueden los turistas alquilar un scooter 125cc en Mallorca?", imageAlt: "Turistas alquilando scooter 125cc en Mallorca", sections: [sec("Documentos que necesitan los turistas"), sec("Preguntas habituales sobre licencias"), sec("Recogida en Magaluf")] }),
  post({ id: "scooter-rental-palmanova", slug: "alquiler-scooter-palmanova-precios-licencia-recogida", title: "Alquiler de scooter en Palmanova: precios, licencia y recogida", imageAlt: "Alquiler de scooter en Palmanova", sections: [sec("Recogida en Palmanova o Magaluf"), sec("Precios y duracion"), sec("Licencia y elementos incluidos")] }),
  post({ id: "magaluf-vs-palmanova-rental", slug: "magaluf-vs-palmanova-alquiler-scooter-donde-reservar", title: "Magaluf vs Palmanova para alquilar scooter: donde reservar?", imageAlt: "Alquiler de scooter Magaluf frente a Palmanova", sections: [sec("La geografia que muchos turistas no ven"), sec("Que comparar al reservar"), sec("Recomendacion para tu reserva")] }),
  post({ id: "helmets-included-mallorca", slug: "alquiler-scooter-mallorca-incluye-cascos", title: "Los alquileres de scooter en Mallorca incluyen cascos?", imageAlt: "Casco incluido en alquiler de scooter en Mallorca", sections: [sec("Por que los cascos deben ser estandar"), sec("Paquete incluido de NEXA Rentals"), sec("Senales de alerta en otras tiendas")] }),
  post({ id: "what-included-scooter-magaluf", slug: "que-incluye-alquilar-scooter-magaluf", title: "Que incluye alquilar un scooter en Magaluf?", imageAlt: "Que incluye el alquiler de scooter en Magaluf", sections: [sec("Accesorios incluidos"), sec("Lo que normalmente no esta incluido"), sec("Antes de confirmar la reserva")] }),
  post({ id: "half-day-scooter-magaluf", slug: "alquilar-scooter-magaluf-medio-dia", title: "Puedes alquilar un scooter en Magaluf por medio dia?", imageAlt: "Alquiler de scooter medio dia en Magaluf", sections: [sec("Cuando basta medio dia"), sec("Horarios de recogida y devolucion"), sec("Precio frente a 24 horas")] }),
  post({ id: "rent-scooter-online-magaluf", slug: "alquilar-scooter-online-magaluf-un-minuto", title: "Como alquilar un scooter online en Magaluf en menos de 1 minuto", imageAlt: "Alquilar scooter online en Magaluf", sections: [sec("Reserva online paso a paso"), sec("Por que online supera al mostrador"), sec("Despues de reservar")] }),
  post({ id: "ebike-vs-scooter-magaluf", slug: "ebike-vs-scooter-magaluf", title: "Alquiler de e-bike en Magaluf: es mejor que un scooter?", imageAlt: "E-bike frente a scooter en Magaluf", sections: [sec("Ventajas de la e-bike en Magaluf"), sec("Ventajas del scooter"), sec("Quien deberia elegir cada opcion")] }),
  post({ id: "best-ebike-routes-magaluf", slug: "mejores-rutas-ebike-magaluf-palmanova", title: "Mejores rutas en e-bike desde Magaluf y Palmanova", imageAlt: "Rutas en e-bike por Magaluf", sections: [sec("Rutas cortas y bonitas"), sec("Extension hacia Palmanova"), sec("Cuando cambiar a scooter")] }),
  post({ id: "magaluf-to-palma-ebike", slug: "ir-de-magaluf-a-palma-en-ebike", title: "Puedes ir de Magaluf a Palma en e-bike?", imageAlt: "Magaluf a Palma en e-bike", sections: [sec("La realidad de la distancia"), sec("La alternativa del scooter"), sec("Mejor uso de la e-bike")] }),
  post({ id: "ebike-vs-taxi-magaluf", slug: "ebike-vs-taxi-magaluf-forma-barata-explorar", title: "E-bike vs taxi en Magaluf: forma mas barata de explorar Mallorca", imageAlt: "E-bike frente a taxi en Magaluf", sections: [sec("Logica de comparacion de costes"), sec("Recordatorio de precios de e-bike NEXA"), sec("Seguridad y vida nocturna")] }),
]);
