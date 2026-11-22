# WorkStation — Gestión de reservas de espacios de trabajo

Proyecto de Prácticas Profesionalizantes I de la Tecnicatura en Desarrollo de Software del Instituto Superior de Formación Técnica Municipal "Leopoldo Marechal".

## Grupo 01 Caso 04

- Cristina Ortega
- Natalia Larrarte Barboza
- Fernando San Emeterio
- César Villarreal
- Julia Gabito

## Descripción

WorkStation es una aplicación web para gestionar reservas de espacios de coworking. Permite que los coworkers registren y consulten sus reservas y que el Community Manager y el dueño consulten las reservas y gestionen su estado.

El proyecto busca organizar la gestión y reducir problemas como la superposición de reservas. Esta entrega es un MVP: una primera versión funcional con un alcance acotado, sobre la que se podrán incorporar mejoras.

## Enlaces
| Recurso | Dirección |
| --- | --- |
| Repositorio | [Código en GitHub](https://github.com/Urutau/PracticasProfesionalizantes) |
| Frontend publicado | [Sitio WorkStation](https://workstationsite.onrender.com/index.html) |
| Backend publicado | [En Render](https://workstation-oklm.onrender.com) |
| Consulta de reservas de la API | [Listado JSON de reservas](https://workstation-oklm.onrender.com/api/reservas) |


## Roles y funcionalidades
| --- | --- |
| Rol | Funcionalidades actuales |
| Coworker (`03`) | Crear reservas y consultar sus reservas en «Mis reservas». |
| Community Manager (`02`) | Consultar las reservas y cambiar su estado entre `Activa` y `Anulada`. |
| Dueño (`01`) | Consultar las reservas obtenidas de la API y cambiar su estado. Ver indicadores ilustrativos de membresías, ventas y horarios. |

### Páginas y navegación
- **Inicio:** bienvenida y accesos a membresías, espacios e historial. El acceso «Historial y agenda» lleva al inicio de sesión si no hay un usuario guardado; si lo hay, dirige al historial del coworker o al panel correspondiente de CM o dueño.
- **Membresías:** presentación de Impulso, Conexión, Crecimiento e Identidad en tarjetas y botón «Consultá por tu membresía» que dirige a Contacto.
- **Espacios:** presentación de Sala Mayor, Escritorios y Salas de trabajo, con fotografías ilustrativas.
- **Contacto:** formulario y página de confirmación. El envío real de mensajes todavía no está implementado.

### Tipos de espacio
| Código en los datos | Nombre en el backend | Presentación en el sitio | Cantidad en los datos iniciales |
| --- | --- | --- | --- |
| `01` | Sala Mayor | Sala Mayor | 1 |
| `02` | Sala | Salas de trabajo | 3 |
| `03` | Escritorio | Escritorios | 30 |

El ingreso actual solicita correo y contraseña de usuarios de demostración. El menú cambia según el rol. Este mecanismo todavía no implementa autenticación ni autorización seguras en el servidor; no debe utilizarse con credenciales o datos reales.

## Tecnologías y arquitectura
- **HTML:** estructura de las páginas, formularios y tablas.
- **CSS:** estilos y distribución visual.
- **JavaScript:** interacción con la persona y solicitudes a la API mediante `fetch`.
- **Node.js y Express:** ejecución del backend y definición de sus rutas.
- **CORS:** permite la comunicación desde el frontend alojado en otro origen.
- **JSON:** formato de intercambio de datos y archivo con la información inicial.
- **Git y GitHub:** control de versiones y colaboración.
- **Render:** publicación del frontend y del backend.

El frontend y el backend son proyectos separados. La pantalla envía solicitudes HTTP; el backend las procesa y devuelve respuestas JSON. El frontend interpreta esas respuestas y actualiza la interfaz.

Por ejemplo, al reservar se envía un `POST /api/reservas`. El backend valida los datos, agrega la reserva a su lista en memoria y responde con el registro creado. La pantalla vuelve a consultar las reservas para actualizar el historial.

## Organización del proyecto

La aplicación se encuentra en `Hito 03_final/` dentro del repositorio.

| Ubicación | Contenido |
| --- | --- |
| `Hito 03_final/README.md` | Documentación de la entrega. |
| `Hito 03_final/backend/index.js` | Servidor y rutas de la API. |
| `Hito 03_final/backend/datos.json` | Usuarios, espacios, extras y reservas iniciales. |
| `Hito 03_final/backend/package.json` | Dependencias y comandos del backend. |
| `Hito 03_final/backend/package-lock.json` | Versiones concretas de las dependencias. |
| `Hito 03_final/frontend/index.html` | Página de inicio. |
| `Hito 03_final/frontend/css/styles.css` | Estilos. |
| `Hito 03_final/frontend/js/script.js` | Comportamiento del frontend e integración con la API. |
| `Hito 03_final/frontend/pages/` | Página de ingreso, historial, espacios, membresías, contacto y paneles por rol. |
| `Hito 03_final/frontend/img/` | Logo y fotografías. |


## Instalación y ejecución

### Usar la web publicada en Render

Para utilizar la aplicación publicada, abrir el [sitio WorkStation](https://workstationsite.onrender.com/index.html) en el navegador.

No es necesario instalar VS Code, Live Server, Node.js ni ejecutar comandos para usar esa versión. El frontend (las pantallas) y el backend (el programa que recibe y procesa las solicitudes) están alojados en Render.

### Preparar una copia del código para trabajar

Para Clonar el repositorio se necesita Git.

```bash
git clone https://github.com/Urutau/PracticasProfesionalizantes.git
cd PracticasProfesionalizantes
```

## Datos y almacenamiento

Al iniciar, el backend carga `datos.json`. Las reservas creadas y los cambios de estado se mantienen en arrays y objetos en la memoria del proceso; no se escriben nuevamente en el archivo.

Por lo tanto:
- Los cambios permanecen mientras siga funcionando esa instancia del servidor.
- Al reiniciarse, vuelve a cargarse la información inicial.
- Un reinicio o nuevo despliegue puede eliminar las reservas creadas durante una demostración.

Estas limitaciones están relacionadas con la ausencia de una base de datos propia.

## Documentación de la API

URL base publicada: `https://workstation-oklm.onrender.com`

| Método | Ruta | Función | Respuestas previstas |
| --- | --- | --- | --- |
| `GET` | `/api/usuarios` | Devuelve los usuarios utilizados por el ingreso actual. | `200` |
| `GET` | `/api/reservas` | Lista las reservas e incorpora nombre de usuario y tipo de espacio. | `200` |
| `GET` | `/api/reservas/:id` | Consulta una reserva por su identificador. | `200`, `404` |
| `POST` | `/api/reservas` | Crea una reserva con estado inicial `Activa`. | `201`, `400`, `409` |
| `PATCH` | `/api/reservas/:id` | Cambia el estado de una reserva a `Activa` o `Anulada`. | `200`, `400`, `404` |

Las solicitudes con cuerpo JSON deben incluir `Content-Type: application/json`.

### Crear una reserva

`POST /api/reservas`

```json
{
  "id_usuario": "U003",
  "fecha": "2026-11-30",
  "hora": "10:00",
  "duracion": 2,
  "id_tipo_espacio": "01",
  "extras": [],
  "invitados": 0,
  "creditos_utilizados": 0
}
```

`duracion` se expresa en horas y debe enviarse como número. Los tipos de espacio son `01` (Sala Mayor), `02` (Sala) y `03` (Escritorio). El servidor asigna `id_reserva` y el estado inicial.

### Cambiar el estado

`PATCH /api/reservas/1`

```json
{
  "estado": "Anulada"
}
```

Si la reserva no existe, responde `404`. Si el estado no es `Activa` o `Anulada`, responde `400`.

## Regla de negocio: disponibilidad de Sala Mayor

Al crear una reserva de Sala Mayor, el backend busca otras reservas activas de ese espacio en la misma fecha. Si los períodos se superponen, responde `409` con el mensaje «La Sala Mayor ya está reservada en ese horario» y no agrega la reserva.

Una reserva puede comenzar exactamente cuando termina la anterior. Las reservas anuladas no bloquean la creación de una nueva reserva.

La corrección también valida que la duración sea un número finito mayor que cero.

El control actual se aplica al `POST`, a Sala Mayor y a períodos de una misma fecha. Falta extenderlo a reactivaciones mediante `PATCH`, reservas que atraviesan el horario de cierre y otros espacios.


## Limitaciones actuales y mejoras pendientes

- **Ingreso y permisos:** el mecanismo actual compara las contraseñas en el navegador y guarda el usuario completo en `localStorage`. El endpoint de usuarios incluye esas contraseñas. Está pendiente reemplazar este mecanismo; ocultar opciones del menú no protege las rutas de la API.
- **Validaciones:** falta completar la validación de fechas, horarios, usuarios y espacios existentes, capacidad y mantenimiento.
- **Disponibilidad:** la corrección de Sala Mayor no cubre reactivar reservas superpuestas ni intervalos que cruzan el horario de cierre. Salas y escritorios se seleccionan por tipo, sin identificar cada unidad individual.
- **Estados de los espacios:** los selectores del panel del CM son visuales; sus cambios no se guardan en el backend.
- **Membresías y créditos:** no se calcula el consumo, saldo ni reintegro de horas. El formulario actual envía cero como créditos utilizados.
- **Informes:** las reservas del dueño provienen de la API, pero las ventas mensuales, los porcentajes de créditos y el ranking de horarios son valores ilustrativos escritos en HTML. No se calculan a partir de las operaciones.
- **Contacto:** el formulario abre una confirmación, pero no registra ni envía mensajes o correos.
- **Otros módulos:** no se implementaron pases digitales, notificaciones automáticas ni copias de seguridad.
- **Navegación y errores:** falta completar el manejo de fallos de conexión, el acceso al historial sin usuario y la ruta de cierre de sesión desde el inicio.
