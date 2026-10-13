
// Guarda un valor en una cookie convirtiéndolo a JSON.
function guardarCookie(nombre, valor) {
    const valorJSON = JSON.stringify(valor);
    const valorCodificado = encodeURIComponent(valorJSON);

    document.cookie = `${nombre}=${valorCodificado}; max-age=2592000; path=/`;
}

// Lee una cookie y devuelve su contenido convertido a objeto o array.
function leerCookie(nombre) {
    const cookies = document.cookie.split("; ");

    for (const cookie of cookies) {
        const separador = cookie.indexOf("=");
        const clave = cookie.substring(0, separador);
        const valor = cookie.substring(separador + 1);

        if (clave === nombre) {
            try {
                const valorDecodificado = decodeURIComponent(valor);
                return JSON.parse(valorDecodificado);
            } catch (error) {
                console.error("Error al leer la cookie:", error);
                return null;
            }
        }
    }

    return null;
}

// Borra una cookie estableciendo su duración en cero.
function borrarCookie(nombre) {
    document.cookie = `${nombre}=; max-age=0; path=/`;
}

// Guarda los dos arrays principales de la aplicación.
function guardarTodo() {
    guardarCookie("habitos", habitos);
    guardarCookie("registros", registros);
}

// Recupera los hábitos y registros guardados.
function cargarTodo() {
    const habitosGuardados = leerCookie("habitos");
    const registrosGuardados = leerCookie("registros");

    if (Array.isArray(habitosGuardados)) {
        habitos = habitosGuardados;
    }

    if (Array.isArray(registrosGuardados)) {
        registros = registrosGuardados;
    }
}

// Arrays donde guardaremos los hábitos y sus registros.
let habitos = [];
let registros = [];

// Carga los datos guardados al iniciar la página.
cargarTodo();

console.log("Hábitos:", habitos);
console.log("Registros:", registros);

// Prepara el formulario para crear hábitos.
const formularioHabito = document.getElementById("form-habito");

// Muestra los hábitos guardados en la página.
function mostrarHabitos() {
    const lista = document.getElementById("lista-habitos");
    lista.innerHTML = "";

    habitos.forEach(function(habito) {
        const elemento = document.createElement("article");

        const titulo = document.createElement("h3");
        titulo.textContent = habito.nombre;

        const descripcion = document.createElement("p");
        descripcion.textContent = habito.descripcion || "Sin descripción";

        const categoria = document.createElement("p");
        categoria.textContent = "Categoría: " + habito.categoria;

        elemento.append(titulo, descripcion, categoria);
        lista.appendChild(elemento);
    });
}

// Valida el formulario y añade un hábito al array.
formularioHabito.addEventListener("submit", function(evento) {
    evento.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const categoria = document.getElementById("categoria").value;

    if (nombre === "") {
        alert("El nombre del hábito es obligatorio.");
        return;
    }

    const nuevoHabito = {
        id: Date.now(),
        nombre: nombre,
        descripcion: descripcion,
        categoria: categoria
    };

    habitos.push(nuevoHabito);

    guardarTodo();
    mostrarHabitos();

    formularioHabito.reset();
});

// Muestra los hábitos que ya estuvieran guardados.
mostrarHabitos();

// Obtiene el formulario y el desplegable de hábitos.
const formularioRegistro = document.getElementById("form-registro");
const selectorHabitos = document.getElementById("habito-registro");

// Rellena el desplegable utilizando los hábitos guardados.
function actualizarSelectorHabitos() {
    selectorHabitos.innerHTML = "";

    const opcionInicial = document.createElement("option");
    opcionInicial.value = "";
    opcionInicial.textContent = "Selecciona un hábito";
    selectorHabitos.appendChild(opcionInicial);

    habitos.forEach(function(habito) {
        const opcion = document.createElement("option");
        opcion.value = habito.id;
        opcion.textContent = habito.nombre;
        selectorHabitos.appendChild(opcion);
    });
}

// Guarda un registro de un día concreto.
formularioRegistro.addEventListener("submit", function(evento) {
    evento.preventDefault();

    const habitoId = Number(selectorHabitos.value);
    const fecha = document.getElementById("fecha-registro").value;
    const observaciones = document.getElementById("observaciones").value.trim();
    const cumplido = document.getElementById("cumplido").checked;

    if (!habitoId || !fecha) {
        alert("Selecciona un hábito y una fecha.");
        return;
    }

    const nuevoRegistro = {
        id: Date.now(),
        habitoId: habitoId,
        fecha: fecha,
        observaciones: observaciones,
        cumplido: cumplido
    };

    registros.push(nuevoRegistro);

    guardarTodo();
    formularioRegistro.reset();

    document.getElementById("mensaje-registro").textContent =
        "Registro guardado correctamente.";
});

// Actualiza el desplegable al iniciar la página.
actualizarSelectorHabitos();

// Actualiza el desplegable cada vez que se crea un hábito.
const formularioHabitoActual = document.getElementById("form-habito");

formularioHabitoActual.addEventListener("submit", function() {
    setTimeout(actualizarSelectorHabitos, 0);
});
// --- FASE 4 y FASE 5: Modal, Tabla de seguimiento y Cambio de estado ---

const modalSeguimiento = document.getElementById("modal-seguimiento");
const btnVerSeguimiento = document.getElementById("btn-ver-seguimiento");
const btnCerrarModal = document.getElementById("btn-cerrar-modal");

// Muestra u oculta la ventana modal
function abrirModal() {
    generarTablaSeguimiento();
    modalSeguimiento.classList.remove("oculto");
}

function cerrarModal() {
    modalSeguimiento.classList.add("oculto");
}

btnVerSeguimiento.addEventListener("click", function(e) {
    e.preventDefault();
    abrirModal();
});

btnCerrarModal.addEventListener("click", cerrarModal);

// Cerrar al hacer clic en el fondo oscuro exterior
modalSeguimiento.addEventListener("click", function(e) {
    if (e.target === this) {
        cerrarModal();
    }
});

// Función para alternar/cambiar el estado de un registro (Fase 5)
function toggleCumplido(registroId) {
    // Si la función se invoca directamente o mediante window.opener
    const objetivo = window.opener ? window.opener : window;
    
    const registro = objetivo.registros.find(r => r.id === registroId);
    if (registro) {
        registro.cumplido = !registro.cumplido;
        objetivo.guardarTodo();
        
        if (window.opener) {
            window.opener.generarTablaSeguimiento();
        } else {
            generarTablaSeguimiento();
        }
    }
}

// Genera la tabla dinámicamente relacionando habitos y registros por habitoId
function generarTablaSeguimiento() {
    const cuerpoTabla = document.getElementById("cuerpo-tabla");
    const resumen = document.getElementById("resumen-seguimiento");
    
    if (!cuerpoTabla) return;
    
    cuerpoTabla.innerHTML = "";
    
    let cumplidos = 0;
    let fallados = 0;

    registros.forEach(function(registro) {
        // Relación por habitoId
        const habitoEncontrado = habitos.find(h => h.id === registro.habitoId);
        const nombreHabito = habitoEncontrado ? habitoEncontrado.nombre : "Hábito eliminado";

        if (registro.cumplido) {
            cumplidos++;
        } else {
            fallados++;
        }

        const fila = document.createElement("tr");

        const tdHabito = document.createElement("td");
        tdHabito.textContent = nombreHabito;

        const tdFecha = document.createElement("td");
        tdFecha.textContent = registro.fecha;

        const tdObs = document.createElement("td");
        tdObs.textContent = registro.observaciones || "-";

        const tdEstado = document.createElement("td");
        tdEstado.textContent = registro.cumplido ? "✓ Cumplido" : "✗ No cumplido";
        tdEstado.className = registro.cumplido ? "estado-cumplido" : "estado-fallado";

        const tdAccion = document.createElement("td");
        const btnCambiar = document.createElement("button");
        btnCambiar.textContent = "Cambiar";
        btnCambiar.addEventListener("click", function() {
            toggleCumplido(registro.id);
        });

        tdAccion.appendChild(btnCambiar);

        fila.append(tdHabito, tdFecha, tdObs, tdEstado, tdAccion);
        cuerpoTabla.appendChild(fila);
    });

    resumen.textContent = `Resumen: ${cumplidos} día(s) cumplido(s) | ${fallados} día(s) fallado(s). Total registros: ${registros.length}`;
}

// --- FASE 6: Estadísticas y Borrado general ---

// Calcula y muestra las estadísticas en el panel principal
function actualizarEstadisticas() {
    const elHabitos = document.getElementById("stat-habitos");
    const elCumplidos = document.getElementById("stat-cumplidos");
    const elFallados = document.getElementById("stat-fallados");

    if (!elHabitos || !elCumplidos || !elFallados) return;

    const totalHabitos = habitos.length;
    const diasCumplidos = registros.filter(r => r.cumplido === true).length;
    const diasFallados = registros.filter(r => r.cumplido === false).length;

    elHabitos.textContent = totalHabitos;
    elCumplidos.textContent = diasCumplidos;
    elFallados.textContent = diasFallados;
}

// Botón para eliminar todas las cookies y reiniciar la app
const btnBorrarTodo = document.getElementById("btn-borrar-todo");

if (btnBorrarTodo) {
    btnBorrarTodo.addEventListener("click", function() {
        const confirmar = confirm("¿Estás seguro de que quieres borrar todos los hábitos y registros? Esta acción no se puede deshacer.");
        
        if (confirmar) {
            borrarCookie("habitos");
            borrarCookie("registros");
            habitos = [];
            registros = [];

            mostrarHabitos();
            actualizarSelectorHabitos();
            actualizarEstadisticas();
            
            if (typeof generarTablaSeguimiento === "function") {
                generarTablaSeguimiento();
            }

            alert("Todos los datos han sido eliminados correctamente.");
        }
    });
}
  
// Actualizamos las estadísticas en las operaciones clave
const fnGuardarTodoOriginal = guardarTodo;
guardarTodo = function() {
    fnGuardarTodoOriginal();
    actualizarEstadisticas();
};

// Carga inicial de estadísticas al arrancar la app
actualizarEstadisticas();