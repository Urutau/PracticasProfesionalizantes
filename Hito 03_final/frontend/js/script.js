let datos;

// Cargar datos del JSON


async function cargarDatos() {
    const respuesta = await fetch("https://workstation-oklm.onrender.com/api/usuarios");
    const usuarios = await respuesta.json();
    datos = { usuarios };
}


// Para la página de CM


async function cargarReservas() {

    const respuesta = await fetch("https://workstation-oklm.onrender.com/api/reservas");
    //const respuesta = await fetch("http://localhost:3000/api/reservas");
    const reservas = await respuesta.json();

    const tabla = document.querySelector("#reservas");

    if (tabla) {

        tabla.innerHTML = "";

        reservas.forEach(reserva => {

            let extras = "";

            reserva.extras.forEach(extra => {
                extras += extra.nombre + " (" + extra.cantidad + "), ";
            });

            tabla.innerHTML += `
                <tr>
                    <td>${reserva.id_reserva}</td>
                    <td>${reserva.usuario}</td>
                    <td>${reserva.fecha}</td>
                    <td>${reserva.hora}</td>
                    <td>${reserva.duracion} hs</td>
                    <td>${reserva.tipo_espacio}</td>
                    <td>${extras || "Sin extras"}</td>
                    <td>${reserva.invitados}</td>
                    <td>${reserva.creditos_utilizados}</td>
                    <td>${reserva.estado}</td>
                    <td></td>
                </tr>
            `;

        });
    }
}


// Carga datos para la página del CM
cargarReservas();

// LogIn y acceso por rol
const formulario = document.getElementById("formLogIn");

if (formulario) {

    formulario.addEventListener("submit", async function(event) {

        event.preventDefault();

        await cargarDatos();

        const email = document.getElementById("liemail").value;
        const password = document.getElementById("lipassword").value;

        const usuarioIn = datos.usuarios.find(
            usuario => usuario.correo === email
        );

        if (usuarioIn && usuarioIn.password === password) {

            localStorage.setItem(
                "usuarioLoggeado",
                JSON.stringify(usuarioIn)
            );

            alert("Inicio de sesión exitoso ✅");

            window.location.href = "../index.html";

        } else {

            alert("Usuario y/o contraseña incorrectos ⛔");

        }

    });

}


// Esto es para el index

const usuarioLoggeado = JSON.parse(
    localStorage.getItem("usuarioLoggeado")
);


// Nav por rol

/// Rutas de navegación

const enPages = window.location.pathname.includes("/pages/");

const inicio = enPages ? "../index.html" : "index.html";
const membresias = enPages ? "membresias.html" : "pages/membresias.html";
const contacto = enPages ? "contacto.html" : "pages/contacto.html";
const espacios = enPages ? "espacios.html" : "pages/espacios.html";
const historial = enPages ? "historial.html" : "pages/historial.html";
const login = enPages ? "_login.html" : "pages/_login.html";
const _duenio_page = enPages ? "_duenio_page.html" : "pages/_duenio_page.html";
const _cm_page = enPages ? "_cm_page.html" : "pages/_cm_page.html";

const nav = document.getElementById("navPrincipal");

if (usuarioLoggeado) {

    if (usuarioLoggeado.rol === "01") {
        nav.innerHTML = `
        <ul>
            <li><a href="${inicio}">Inicio</a></li>
            <li><a href="${membresias}">Membresías</a></li>
            <li><a href="${contacto}">Contacto</a></li>
            <li><a href="${espacios}">Espacios</a></li>
            <li><a href="${_duenio_page}">Informe</a></li>
            <li><a href="#" id="cerrarSesion">Cerrar Sesión</a></li>
        </ul>`
    } else if (usuarioLoggeado.rol === "02") {
        nav.innerHTML = `
        <ul>
            <li><a href="${inicio}">Inicio</a></li>
            <li><a href="${membresias}">Membresías</a></li>
            <li><a href="${contacto}">Contacto</a></li>
            <li><a href="${espacios}">Espacios</a></li>
            <li><a href="${_cm_page}">Reservas</a></li>
            <li><a href="#" id="cerrarSesion">Cerrar Sesión</a></li>
        </ul>`
    } else if (usuarioLoggeado.rol === "03") {
        nav.innerHTML = `
        <ul>
            <li><a href="${inicio}">Inicio</a></li>
            <li><a href="${membresias}">Membresías</a></li>
            <li><a href="${contacto}">Contacto</a></li>
            <li><a href="${espacios}">Espacios</a></li>
            <li><a href="${historial}">Mis reservas</a></li>            
            <li><a href="#" id="cerrarSesion">Cerrar Sesión</a></li>
        </ul>`
    }
} else {
    nav.innerHTML = `
            <ul>
            <li><a href="${inicio}">Inicio</a></li>
            <li><a href="${membresias}">Membresías</a></li>
            <li><a href="${contacto}">Contacto</a></li>
            <li><a href="${espacios}">Espacios</a></li>
            <li><a href="${login}">Iniciar Sesión</a></li>
            </ul>`
}


//Para cerrar la sesión
const cerrarSesion = document.getElementById("cerrarSesion");

if (cerrarSesion) {
    cerrarSesion.addEventListener("click", function (event) {

        event.preventDefault();

        localStorage.removeItem("usuarioLoggeado");

        window.location.href = "_login.html";
    });
}

//Formulario de reservas
const formReserva = document.getElementById("formReserva");

if (formReserva) {

    formReserva.addEventListener("submit", async function(event) {

        event.preventDefault();

        const fecha = document.getElementById("fecha").value;
        const hora = document.getElementById("hora").value;
        const espacio = document.getElementById("espacio").value;
        const duracion = document.getElementById("duracion").value;
        const invitados = document.getElementById("invitados").value;

        console.log(fecha, hora, espacio, duracion, invitados);

        const nuevaReserva = {
            id_usuario: usuarioLoggeado.id_usuario,
            fecha: fecha,
            hora: hora,
            duracion: Number(duracion),
            id_tipo_espacio: espacio,
            extras: [],
            invitados: Number(invitados),
            creditos_utilizados: 0
        };

        console.log(nuevaReserva);

        const respuesta = await fetch("https://workstation-oklm.onrender.com/api/reservas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(nuevaReserva)
        });

        const resultado = await respuesta.json();

        console.log(resultado);

    });

}