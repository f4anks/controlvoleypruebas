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
// === VARIABLES GLOBALES PARA FILTRADO
// ====================================================================

let atletasData = []; 
let categoriasUnicas = new Set(); 

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
// === 2. ESCUCHA DE DATOS EN TIEMPO REAL (MODIFICADA PARA FILTROS)
// ====================================================================

function setupRealtimeListener() {
    const q = query(collection(db, "atletas"), orderBy("ci", "asc"));
    
    onSnapshot(q, (snapshot) => {
        atletasData = []; 
        categoriasUnicas.clear(); 
        
        snapshot.forEach((doc) => {
            const atleta = doc.data();
            atleta.id = doc.id;
            atletasData.push(atleta);
            
            if (atleta.categoria) {
                 categoriasUnicas.add(atleta.categoria);
            }
        });
        
        renderAtletas(atletasData);
        populateCategoryFilter(categoriasUnicas); 
        document.getElementById('loadingMessage').classList.add('hidden');
    }, (error) => {
        console.error("Error al obtener los atletas:", error);
        document.getElementById('loadingMessage').textContent = "Error al cargar los datos.";
    });
}


// ====================================================================
// === 3. FUNCIÓN PARA LLENAR EL FILTRO DE CATEGORÍA
// ====================================================================

function populateCategoryFilter(categorias) {
    const select = document.getElementById('filtroCategoria');
    const valorSeleccionado = select.value; 
    
    select.innerHTML = '<option value="">Todas</option>';
    
    const categoriasOrdenadas = Array.from(categorias).sort();
    categoriasOrdenadas.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria;
        select.appendChild(option);
    });
    
    if (valorSeleccionado && categorias.has(valorSeleccionado)) {
        select.value = valorSeleccionado;
    }
}


// ====================================================================
// === 4. FUNCIÓN PARA PINTAR LA TABLA 
// ====================================================================

function renderAtletas(data) {
    const tbody = document.getElementById('atletasBody');
    tbody.innerHTML = ''; 
    
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
    
    document.getElementById('atletasTable').classList.remove('hidden');
    
    window.aplicarFiltros(); 
}

// ====================================================================
// === 5. FUNCIÓN PRINCIPAL DE FILTRADO Y BÚSQUEDA
// ====================================================================

window.aplicarFiltros = function() {
    const inputBusqueda = document.getElementById('searchInput').value.toLowerCase();
    const filtroCategoria = document.getElementById('filtroCategoria').value;
    const filtroSexo = document.getElementById('filtroSexo').value;
    const filtroSolvencia = document.getElementById('filtroSolvencia').value;
    
    const tabla = document.getElementById('atletasTable');
    const filas = tabla.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    let resultadosVisibles = 0;
    
    for (let i = 0; i < filas.length; i++) {
        const fila = filas[i];
        
        const ci = fila.cells[0].textContent.toLowerCase();
        const nombreCompleto = fila.cells[1].textContent.toLowerCase();
        const categoria = fila.cells[3].textContent;
        const sexo = fila.cells[4].textContent;
        const solvencia = fila.cells[5].textContent;

        let cumpleBusqueda = true;
        let cumpleFiltroCat = true;
        let cumpleFiltroSexo = true;
        let cumpleFiltroSolvencia = true;
        
        if (inputBusqueda) {
            cumpleBusqueda = ci.includes(inputBusqueda) || nombreCompleto.includes(inputBusqueda);
        }
        
        if (filtroCategoria) {
            cumpleFiltroCat = categoria === filtroCategoria;
        }
        
        if (filtroSexo) {
            cumpleFiltroSexo = sexo === filtroSexo;
        }
        
        if (filtroSolvencia) {
            cumpleFiltroSolvencia = solvencia === filtroSolvencia;
        }

        if (cumpleBusqueda && cumpleFiltroCat && cumpleFiltroSexo && cumpleFiltroSolvencia) {
            fila.style.display = "";
            resultadosVisibles++;
        } else {
            fila.style.display = "none";
        }
    }
    
    const noResults = document.getElementById('noResultsMessage');
    if (resultadosVisibles === 0 && filas.length > 0) {
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
    }
}


// ====================================================================
// === 6. LÓGICA DE ORDENAMIENTO DE TABLA (Se mantiene igual)
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
// === 7. FUNCIÓN DE EDICIÓN (IMPORTANTE)
// ====================================================================

window.editAtleta = function(atletaId) {
    // Guarda el ID del atleta en el almacenamiento local
    localStorage.setItem('editAtletaId', atletaId);
    // Redirige al formulario de registro/edición
    window.location.href = 'frm_atletas.html';
}