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
// === 2. ESCUCHA DE DATOS EN TIEMPO REAL
// ====================================================================

function setupRealtimeListener() {
    // Consulta los atletas ordenados por CI
    const q = query(collection(db, "atletas"), orderBy("ci", "asc"));
    
    // Escucha de cambios en tiempo real
    onSnapshot(q, (snapshot) => {
        atletasData = []; 
        categoriasUnicas.clear(); 
        
        // Mapea los documentos a objetos JavaScript
        snapshot.forEach((doc) => {
            const atleta = doc.data();
            atleta.id = doc.id;
            atletasData.push(atleta);
            
            if (atleta.categoria) {
                 categoriasUnicas.add(atleta.categoria);
            }
        });
        
        // Ocultar el mensaje de carga una vez que se recibieron los datos (éxito o vacío)
        document.getElementById('loadingMessage').classList.add('hidden');

        // Renderiza la tabla con los datos recibidos
        renderAtletas(atletasData);
        populateCategoryFilter(categoriasUnicas); 
        
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
// === 4. FUNCIÓN PARA PINTAR LA TABLA (Con manejo de datos vacíos)
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
        editButton.className = 'bg-azul-electrico text-white py-1 px-3 rounded-md hover:bg-blue-700 transition duration-
