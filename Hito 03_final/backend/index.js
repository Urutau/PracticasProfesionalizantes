
const cors = require('cors');
const datos = require('./datos.json');
const reservas = datos.reservas;

const express = require('express');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Horario de atención expresado en minutos.
const APERTURA = 8 * 60;
const CIERRE = 18 * 60;

// Convierte un horario como "09:30" a minutos.
function convertirAMinutos(hora) {
    const [horas, minutos] = hora.split(':').map(Number);

    return horas * 60 + minutos;
}

// Comprueba que la reserva respete los días y horarios de atención.
function validarHorario(fecha, hora, duracion) {

    // La fecha debe llegar como texto con formato AAAA-MM-DD.
    if (
        typeof fecha !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(fecha)
    ) {
        return 'La fecha debe tener el formato AAAA-MM-DD';
    }

    const fechaElegida = new Date(`${fecha}T00:00:00Z`);

    // Comprueba que la fecha exista realmente.
    if (
        Number.isNaN(fechaElegida.getTime()) ||
        fechaElegida.toISOString().slice(0, 10) !== fecha
    ) {
        return 'La fecha no es válida';
    }

    const dia = fechaElegida.getUTCDay();

    if (dia === 0 || dia === 6) {
        return 'WorkStation abre de lunes a viernes';
    }
    
    // Comprobar que la hora tenga un formato válido.
    if (
        typeof hora !== 'string' ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)
    ) {
        return 'La hora debe ser válida y tener el formato HH:MM';
    }

    // Comprobar que la duración sea un número positivo y finito.
    if (
        typeof duracion !== 'number' ||
        !Number.isFinite(duracion) ||
        duracion <= 0
    ) {
        return 'La duración debe ser un número mayor que cero';
    }

    // Calcular el inicio y el final en minutos.
    const inicio = convertirAMinutos(hora);
    const fin = inicio + duracion * 60;

    // Toda la reserva debe quedar dentro del horario de atención.
    if (inicio < APERTURA || fin > CIERRE) {
        return 'La reserva debe comenzar y terminar entre las 08:00 y las 18:00';
    }
    return null;
}

// Comprueba si queda una unidad disponible durante toda la reserva.
function hayDisponibilidad(fecha, hora, duracion, espacio, idExcluir = null) {

    const inicioNuevo = convertirAMinutos(hora);
    const finNuevo = inicioNuevo + duracion * 60;

    // Incluimos el lugar que ocuparía la nueva reserva.
    const movimientos = [
        { minuto: inicioNuevo, cambio: 1 },
        { minuto: finNuevo, cambio: -1 }
    ];

    for (const reserva of reservas) {

        // Ignorar reservas que no participan en esta comparación.
        if (
            reserva.estado !== 'Activa' ||
            reserva.fecha !== fecha ||
            reserva.id_tipo_espacio !== espacio.id_tipo_espacio ||
            reserva.id_reserva === idExcluir
        ) {
            continue;
        }

        const inicioExistente = convertirAMinutos(reserva.hora);
        const finExistente = inicioExistente + reserva.duracion * 60;

        // Comprobar si coincide con alguna parte del nuevo horario.
        if (inicioNuevo < finExistente && finNuevo > inicioExistente) {

            movimientos.push({
                minuto: Math.max(inicioNuevo, inicioExistente),
                cambio: 1
            });

            movimientos.push({
                minuto: Math.min(finNuevo, finExistente),
                cambio: -1
            });
        }
    }

    // Ordenar por horario.
    // Si coinciden, primero liberar (-1) y después ocupar (+1).
    movimientos.sort((a, b) =>
        a.minuto - b.minuto || a.cambio - b.cambio
    );

    let ocupados = 0;

    for (const movimiento of movimientos) {
        ocupados += movimiento.cambio;

        if (ocupados > espacio.cantidad) {
            return false;
        }
    }

    return true;
}

app.get('/api/usuarios', (req, res) => {
    res.json(datos.usuarios);
});

// Listar las reservas

app.get('/api/reservas', (req, res) => {

    const reservasCompletas = reservas.map(reserva => {

        const usuario = datos.usuarios.find(
            usuario => usuario.id_usuario === reserva.id_usuario
        );

        const espacio = datos.espacios.find(
            espacio => espacio.id_tipo_espacio === reserva.id_tipo_espacio
        );

        return {
            ...reserva,
            usuario: usuario ? usuario.nombre + ' ' + usuario.apellido : 'Usuario no encontrado',
            tipo_espacio: espacio ? espacio.tipo : 'Espacio no encontrado'
        };

    });

    res.json(reservasCompletas);

});


//Buscar reserva por ID

app.get('/api/reservas/:id', (req, res) => {
    const id = Number(req.params.id);
    const reserva = reservas.find(p => p.id_reserva == id);
    if (!reserva){
        return res.status(404).json({error: 'Reserva no encontrada'});
    }
    res.json(reserva);
});

// PATCH cambiar estado de reserva

app.patch('/api/reservas/:id', (req, res) => {

    const id = Number(req.params.id);

    const reserva = reservas.find(p => p.id_reserva == id);

    if (!reserva) {
        return res.status(404).json({error: 'Reserva no encontrada'});
    }

    const { estado } = req.body;

    if (estado !== 'Activa' && estado !== 'Anulada') {
        return res.status(400).json({error: 'Estado no válido'});
    }
        // Antes de activar, comprobar horario y disponibilidad.
    if (estado === 'Activa') {

        const errorHorario = validarHorario(
            reserva.fecha,
            reserva.hora,
            reserva.duracion
        );

        if (errorHorario !== null) {
            return res.status(400).json({
                error: errorHorario
            });
        }

        const espacio = datos.espacios.find(
            espacio => espacio.id_tipo_espacio === reserva.id_tipo_espacio
        );

        if (!espacio) {
            return res.status(400).json({
                error: 'El tipo de espacio no existe'
            });
        }

        if (
            !Number.isInteger(espacio.cantidad) ||
            espacio.cantidad <= 0
        ) {
            return res.status(500).json({
                error: 'La cantidad de espacios no está configurada correctamente'
            });
        }

        const disponible = hayDisponibilidad(
            reserva.fecha,
            reserva.hora,
            reserva.duracion,
            espacio,
            reserva.id_reserva
        );

        if (!disponible) {
            return res.status(409).json({
                error: 'No se puede activar la reserva: no hay disponibilidad de ' +
                       espacio.tipo + ' para todo el horario solicitado'
            });
        }
    }

    reserva.estado = estado;

    res.json(reserva);

});

// Crear reserva

app.post('/api/reservas', (req, res) => {

    const {
        id_usuario,
        fecha,
        hora,
        duracion,
        id_tipo_espacio,
        extras,
        invitados,
        creditos_utilizados
    } = req.body;

    if (!id_usuario || !fecha || !hora || !duracion || !id_tipo_espacio) {
        return res.status(400).json({
            error: 'Faltan datos para crear la reserva'
        });
    }

    // Validar fecha, día de atención, hora y duración.
    const errorHorario = validarHorario(fecha, hora, duracion);

    if (errorHorario !== null) {
        return res.status(400).json({
            error: errorHorario
        });
    }
    

    // Buscar el tipo de espacio solicitado.
    const espacio = datos.espacios.find(
        espacio => espacio.id_tipo_espacio === id_tipo_espacio
    );

    if (!espacio) {
        return res.status(400).json({
            error: 'El tipo de espacio no existe'
        });
    }

    // Comprobar que la cantidad disponible esté bien configurada.
    if (
        !Number.isInteger(espacio.cantidad) ||
        espacio.cantidad <= 0
    ) {
        return res.status(500).json({
            error: 'La cantidad de espacios no está configurada correctamente'
        });
    }

    // Comprobar disponibilidad durante todo el horario solicitado.
    const disponible = hayDisponibilidad(
        fecha,
        hora,
        duracion,
        espacio
    );

    if (!disponible) {
        return res.status(409).json({
            error: 'No hay disponibilidad de ' + espacio.tipo +
                   ' para todo el horario solicitado'
        });
    }

    const nuevo = {
        id_reserva: reservas.length + 1,
        id_usuario,
        fecha,
        hora,
        duracion,
        id_tipo_espacio,
        extras: extras || [],
        invitados,
        creditos_utilizados,
        estado: 'Activa'
    };

    reservas.push(nuevo);

    res.status(201).json(nuevo);

});

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});