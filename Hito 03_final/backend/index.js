
//Parte 2 - Server:
const cors = require('cors');
const datos = require('./datos.json');
const reservas = datos.reservas;

const express = require('express');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

//Parte 3 - Listar las reservas


// app.get('/api/reservas', (req, res) => {
//     res.json(reservas);
// });

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


//Parte 4 - Buscar reserva por ID

app.get('/api/reservas/:id', (req, res) => {
    const id = Number(req.params.id);
    const reserva = reservas.find(p => p.id_reserva == id);
    if (!reserva){
        return res.status(404).json({error: 'Reserva no encontrada'});
    }
    res.json(reserva);
});



// Agregar una reserva

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

    const nuevo = {
        id_reserva: reservas.length + 1, id_usuario, fecha, hora, duracion, id_tipo_espacio, extras: extras || [], invitados, creditos_utilizados, estado: 'Activa'
    };

    reservas.push(nuevo);

    res.status(201).json(nuevo);

});


// app.post('/api/reservas', (req, res) => {
//     const { nombre, precio, categoria } = req.body || {};

//     if (!nombre || precio < 0 || !categoria){
//         return res.status(404)
//         .json({error: 'Dato ausente o precio menor a 1'});
//     }

//     const nuevo = {id_reserva: reservas.length + 1, nombre, precio, categoria};
//     reservas.push(nuevo);
//     res.status(201).json(nuevo);
// })

app.listen(PORT, () => {console.log(`http://localhost:${PORT}`)
})