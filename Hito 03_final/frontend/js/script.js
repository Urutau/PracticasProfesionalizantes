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
                    <td>
                        <select class="estadoReserva" data-id="${reserva.id_reserva}">
                            <option value="Activa" ${reserva.estado === "Activa" ? "selected" : ""}>Activa</option>
                            <option value="Anulada" ${reserva.estado === "Anulada" ? "selected" : ""}>Anulada</option>
                        </select>
                    </td>
                </tr>
            `;

        });
    }

// Cambiar estado de una reserva
    const desplegables = document.querySelectorAll(".estadoReserva");

    desplegables.forEach(desplegable => {

        desplegable.addEventListener("change", async function() {

            const id = this.dataset.id;
            const estado = this.value;
            const respuesta = await fetch(`https://workstation-oklm.onrender.com/api/reservas/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ estado: estado })
            });

            const resultado = await respuesta.json();


        // Actualizar la columna Estado
            if (respuesta.ok) {

                this.closest("tr").cells[9].textContent = resultado.estado;
                console.log(resultado);

            } else {
               // Volver a mostrar el estado anterior de la reserva.
                const fila = this.closest("tr");
                const estadoAnterior = fila.cells[9].textContent;

                this.value = estadoAnterior;

                alert(resultado.error || "No se pudo actualizar la reserva");
            }
        });

});
}

function cargarEspacios() {

    const espacios = [
        { nombre: "Sala Mayor", estado: "Libre" },
        { nombre: "Berlin", estado: "Libre" },
        { nombre: "Frankfurt", estado: "Ocupado" },
        { nombre: "Hamburg", estado: "En mantenimiento" }
    ];

    const tabla = document.querySelector("#espacios");

    if (tabla) {
        tabla.innerHTML = "";

        espacios.forEach(espacio => {
            tabla.innerHTML += `
                <tr>
                    <td>${espacio.nombre}</td>
                    <td>
                        <select>
                            <option value="Libre" ${espacio.estado === "Libre" ? "selected" : ""}>Disponible</option>
                            <option value="Ocupado" ${espacio.estado === "Ocupado" ? "selected" : ""}>Ocupado</option>
                            <option value="En mantenimiento" ${espacio.estado === "En mantenimiento" ? "selected" : ""}>En mantenimiento</option>
                        </select>
                    </td>
                </tr>
            `;
        });

        // Fila agrupada de escritorios
        let opciones = "";

        for (let i = 0; i <= 30; i++) {
            opciones += `<option value="${i}">${i}</option>`;
        }

        tabla.innerHTML += `
            <tr>
                <td>Escritorios (30)</td>
                <td>
                    <label>Ocupados:</label>
                    <select id="escritoriosOcupados">
                        ${opciones}
                    </select>
                    <span id="escritoriosDisponibles">30 disponibles</span>
                </td>
            </tr>
        `;

        // Actualizar la cantidad disponible
        const selector = document.querySelector("#escritoriosOcupados");
        const disponibles = document.querySelector("#escritoriosDisponibles");

        selector.addEventListener("change", function() {
            disponibles.textContent = (30 - Number(this.value)) + " disponibles";
        });
    }
}


// Carga datos para la página del CM
cargarReservas();

// Carga datos para el historial de usuario
cargarMisReservas();

//Cargar tabla de espacios para el CM
cargarEspacios();

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


// Reservas por usuario

// Para mostrar las reservas del usuario
async function cargarMisReservas() {

    const tabla = document.querySelector("#misReservas");

    if (tabla) {

        const usuario = JSON.parse(
            localStorage.getItem("usuarioLoggeado")
        );

        const respuesta = await fetch("https://workstation-oklm.onrender.com/api/reservas");
        const reservas = await respuesta.json();

        const misReservas = reservas.filter(
            reserva => reserva.id_usuario === usuario.id_usuario
        );

        tabla.innerHTML = "";

        misReservas.forEach(reserva => {

            // Separar la hora de inicio en horas y minutos.
            const [horas, minutos] = reserva.hora.split(":").map(Number);

            // Sumar la duración, expresando todo en minutos.
            const inicioEnMinutos = horas * 60 + minutos;
            const finEnMinutos = inicioEnMinutos +
                Math.round(Number(reserva.duracion) * 60);

            // Convertir el resultado nuevamente a horas y minutos.
            const horasFin = Math.floor(finEnMinutos / 60);
            const minutosFin = finEnMinutos % 60;

            // Armar el texto con dos dígitos para cada parte.
            const horaFin =
                String(horasFin).padStart(2, "0") + ":" +
                String(minutosFin).padStart(2, "0");

            tabla.innerHTML += `
                <tr>
                    <td>${reserva.fecha}</td>
                    <td>${reserva.hora}</td>
                    <td>${horaFin}</td>
                    <td>${reserva.tipo_espacio}</td>
                    <td>${reserva.estado}</td>
                </tr>
            `;

        });
    }
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


// Verificar permisos de acceso a página de dueño, Community Manager e Historial de Coworker

const paginaActual = window.location.pathname;

if (paginaActual.endsWith("/_duenio_page.html") &&
    (!usuarioLoggeado || usuarioLoggeado.rol !== "01")) {

    alert("El rol actual no permite el acceso a esta página.");
    window.location.href = usuarioLoggeado ? inicio : login;
}

if (paginaActual.endsWith("/_cm_page.html") &&
    (!usuarioLoggeado || usuarioLoggeado.rol !== "02")) {

    alert("El rol actual no permite el acceso a esta página.");
    window.location.href = usuarioLoggeado ? inicio : login;
}

if (paginaActual.endsWith("/historial.html") &&
    (!usuarioLoggeado || usuarioLoggeado.rol !== "03")) {

    alert("Debés iniciar sesión como cliente para acceder a tus reservas.");
    window.location.href = usuarioLoggeado ? inicio : login;

}

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

        window.location.href = login;
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

        if (respuesta.ok) {
            await cargarMisReservas();
            formReserva.reset();
            alert("Reserva realizada con éxito");
        } else {
            alert(resultado.error || "No se pudo realizar la reserva.");
        }

    });
}

// Destino del enlace "Historial y agenda" en el inicio

const enlaceReservasInicio =
    document.getElementById("enlaceReservasInicio");

if (enlaceReservasInicio) {

    enlaceReservasInicio.href = login;

    if (usuarioLoggeado) {
        if (usuarioLoggeado.rol === "03") {
            enlaceReservasInicio.href = "pages/historial.html";
        } else if (usuarioLoggeado.rol === "02") {
            enlaceReservasInicio.href = "pages/_cm_page.html";
        } else if (usuarioLoggeado.rol === "01") {
            enlaceReservasInicio.href = "pages/_duenio_page.html";
        }
    }
}
