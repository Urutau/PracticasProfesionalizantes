let datos;

// Cargar datos del JSON

async function cargarDatos() {

    const respuesta = await fetch("../data/datos.json");
    datos = await respuesta.json();

    cargarReservas();
}


// Para la página de CM

function cargarReservas() {

    const reservas = datos.reservas;
    const tabla = document.querySelector("#reservas");

    if (tabla) {

        reservas.forEach(reserva => {

            tabla.innerHTML += `
                <tr>
                    <td>${reserva.fecha}</td>
                    <td>${reserva.hora}</td>
                    <td>${reserva.id_tipo_espacio}</td>
                    <td>${reserva.estado}</td>
                </tr>
            `;

        });
    }
}


// Carga datos para login

cargarDatos();


// LogIn y acceso por rol

const formulario = document.getElementById("formLogIn");

if (formulario) {

    formulario.addEventListener("submit", function (event) {

        event.preventDefault();

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

const enPages = window.location.pathname.includes("/Pages/");

const inicio = enPages ? "../index.html" : "index.html";
const membresias = enPages ? "membresias.html" : "Pages/membresias.html";
const contacto = enPages ? "contacto.html" : "Pages/contacto.html";
const espacios = enPages ? "espacios.html" : "Pages/espacios.html";
const historial = enPages ? "historial.html" : "Pages/historial.html";
const login = enPages ? "_login.html" : "Pages/_login.html";
const _duenio_page = enPages ? "_duenio_page.html" : "Pages/_duenio_page.html";
const _cm_page = enPages ? "_cm_page.html" : "Pages/_cm_page.html";

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