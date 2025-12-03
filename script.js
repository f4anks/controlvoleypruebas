// ====================================================================
// === CONFIGURACIÓN Y CONEXIÓN DE FIREBASE
// ====================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyB5RB7mm1j-0gjCNTUEJTkyEqLjyZ3C7ws",
    authDomain: "datacontrolvoley-ff556.firebaseapp.com",
    projectId: "datacontrolvoley-ff556",
    storageBucket: "datacontrolvoley-ff556.firebasestorage.app",
    messagingSenderId: "516409072606",
    appId: "1:516409072606:web:132538dba358a077d71b4f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ====================================================================
// === VARIABLES GLOBALES
// ====================================================================

let atletasData = []; 

// ====================================================================
// === 1. LÓGICA DE AUTENTICACIÓN
// ====================================================================

onAuthStateChanged(auth, (user) => {
    if (!user) {
        console.log("Sesión no encontrada. Redirigiendo a index.html");
        window.location.href = 'index.html';
    } else {
        console.log("Usuario autenticado. Iniciando carga de datos.");
        setupRealtimeListener(); 
    }
});


// ====================================================================
// === 2. ESCUCHA DE DATOS EN TIEMPO REAL
// ====================================================================

function setupRealtimeListener() {
    const q = query(collection(db, "atletas"), orderBy("ci", "asc"));
    
    onSnapshot(q, (snapshot) => {
        atletasData = []; 
        
        snapshot.forEach((doc) => {
            const atleta = doc.data();
            atleta.id = doc.id;
            atletasData.push(atleta);
        });
        
        document.getElementById('loadingMessage').classList.add('hidden');
        renderAtletas(atletasData);
        
    }, (error) => {
        console.error("Error al obtener los atletas:", error);
        document.getElementById('loadingMessage').textContent = "Error al cargar los datos.";
    });
}


// ====================================================================
// === 3. FUNCIÓN PARA PINTAR LA TABLA (Con manejo de datos vacíos)
// ====================================================================

function renderAtletas(data) {
    const tbody = document.getElementById('atletasBody');
    tbody.innerHTML = ''; 
    
    const table = document.getElementById('atletasTable');
    const noResults = document.getElementById('noResultsMessage');
    
    // --- MANEJO DE CASO SIN DATOS ---
    if (data.length === 0) {
        table.classList.add('hidden');
        noResults.textContent = 'No hay atletas registrados en esta base de datos.';
        noResults.classList.remove('hidden');
        return; 
    }
    
    // --- PINTAR FILAS ---
    data.forEach(atleta => {
        const row = tbody.insertRow();
        row.id = atleta.id; 
        
        // Columnas de Datos 
        row.insertCell().textContent = atleta.ci;
        row.insertCell().textContent = `${atleta.nombre} ${atleta.apellido}`;
        row.insertCell().textContent = atleta.fechaNac || 'N/A';
        row.insertCell().textContent = atleta.categoria || 'Sin Cat.';
        row.insertCell().textContent = atleta.sexo || 'N/A';
        row.insertCell().textContent = atleta.solvencia || 'N/A';
        
        // Columna de Acciones
        const actionsCell = row.insertCell();
        const editButton = document.createElement('button');
        editButton.textContent = 'Editar';
        editButton.className = 'bg-azul-electrico text-white py-1 px-3 rounded-md hover:bg-blue-700 transition duration-150 text-sm';
        editButton.onclick = () => editAtleta(atleta.id);
        actionsCell.appendChild(editButton);
    });
    
    // --- VISUALIZACIÓN FINAL ---
    table.classList.remove('hidden'); // Mostrar la tabla
    noResults.classList.add('hidden'); // Ocultar el mensaje de no resultados inicial
    
    // Aplicar filtros (solo la búsqueda ahora)
    window.aplicarFiltros(); 
}

// ====================================================================
// === 4. FUNCIÓN PRINCIPAL DE BÚSQUEDA (SIMPLIFICADA)
// ====================================================================

window.aplicarFiltros = function() {
    // Solo necesitamos el input de búsqueda
    const inputBusqueda = document.getElementById('searchInput').value.toLowerCase();
    
    const tabla = document.getElementById('atletasTable');
    // Si la tabla no existe o está vacía, salir.
    if (!tabla || !tabla.getElementsByTagName('tbody')[0]) return; 
    
    const filas = tabla.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    let resultadosVisibles = 0;
    
    for (let i = 0; i < filas.length; i++) {
        const fila = filas[i];
        
        // Cédula (índice 0) y Nombre Completo (índice 1)
        const ci = fila.cells[0].textContent.toLowerCase();
        const nombreCompleto = fila.cells[1].textContent.toLowerCase();

        let cumpleBusqueda = true;
        
        if (inputBusqueda) {
            // Verifica si la C.I. o el Nombre completo incluyen el texto de búsqueda
            cumpleBusqueda = ci.includes(inputBusqueda) || nombreCompleto.includes(inputBusqueda);
        }
        
        // Mostrar u Ocultar fila
        if (cumpleBusqueda) {
            fila.style.display = "";
            resultadosVisibles++;
        } else {
            fila.style.display = "none";
        }
    }
    
    // --- MANEJO DE MENSAJE "NO HAY RESULTADOS" ---
    const noResults = document.getElementById('noResultsMessage');
    
    if (resultadosVisibles === 0 && filas.length > 0) {
        noResults.textContent = 'No se encontraron atletas que coincidan con la búsqueda.';
        noResults.classList.remove('hidden');
    } else if (filas.length > 0) {
        noResults.classList.add('hidden');
    }
}


// ====================================================================
// === 5. LÓGICA DE ORDENAMIENTO DE TABLA
// ====================================================================

let currentSortColumn = -1;
let sortAscending = true;

window.sortTable = function(columnIndex) {
    const table = document.getElementById("atletasTable");
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.rows);

    if (currentSortColumn === columnIndex) {
        sortAscending = !sortAscending;
    } else {
        currentSortColumn = columnIndex;
        sortAscending = true; 
    }

    rows.sort((rowA, rowB) => {
        const cellA = rowA.cells[columnIndex].textContent.trim();
        const cellB = rowB.cells[columnIndex].textContent.trim();
        let comparison = 0;

        const numA = Number(cellA);
        const numB = Number(cellB);
        
        if (!isNaN(numA) && !isNaN(numB) && columnIndex === 0) {
             comparison = numA - numB;
        } else {
            comparison = cellA.localeCompare(cellB);
        }

        return sortAscending ? comparison : comparison * -1;
    });

    rows.forEach(row => tbody.appendChild(row));
    
    window.aplicarFiltros();
}


// ====================================================================
// === 6. FUNCIÓN DE EDICIÓN
// ====================================================================

window.editAtleta = function(atletaId) {
    localStorage.setItem('editAtletaId', atletaId);
    window.location.href = 'frm_atletas.html';
}
