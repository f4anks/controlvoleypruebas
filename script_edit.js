// ====================================================================
// === CONFIGURACIÓN Y CONEXIÓN DE FIREBASE
// ====================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
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

const atletaIdEdit = localStorage.getItem('editAtletaId');
const form = document.getElementById('atletaForm');
const submitButton = document.getElementById('submitButton');

// ====================================================================
// === 1. LÓGICA DE AUTENTICACIÓN
// ====================================================================

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'index.html';
    } else {
        initializeForm();
    }
});

// ====================================================================
// === 2. INICIALIZACIÓN DEL FORMULARIO (Modo Edición o Registro)
// ====================================================================

async function initializeForm() {
    if (atletaIdEdit) {
        document.getElementById('formTitle').textContent = 'Editar Atleta Existente';
        submitButton.textContent = 'Guardar Cambios';
        await loadAtletaData(atletaIdEdit);
    } else {
        document.getElementById('formTitle').textContent = 'Registro de Nuevo Atleta';
        submitButton.textContent = 'Registrar Atleta';
    }
    document.getElementById('ci').disabled = !!atletaIdEdit;
}

// ====================================================================
// === 3. CARGAR DATOS EN EL FORMULARIO (Solo en modo Edición)
// ====================================================================

async function loadAtletaData(id) {
    try {
        const docRef = doc(db, "atletas", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            
            document.getElementById('nombre').value = data.nombre || '';
            document.getElementById('apellido').value = data.apellido || '';
            document.getElementById('ci').value = data.ci || '';
            document.getElementById('fechaNac').value = data.fechaNac || '';
            document.getElementById('categoria').value = data.categoria || '';
            document.getElementById('sexo').value = data.sexo || 'M';
            document.getElementById('posicion').value = data.posicion || '';
            document.getElementById('telefono').value = data.telefono || '';
            document.getElementById('email').value = data.email || '';
            document.getElementById('solvencia').value = data.solvencia || 'Pendiente';
            document.getElementById('peso').value = data.peso || '';
            document.getElementById('talla').value = data.talla || '';
            
        } else {
            alert("Error: El atleta no fue encontrado para edición.");
            localStorage.removeItem('editAtletaId');
            window.location.href = 'index_atletas.html';
        }
    } catch (error) {
        console.error("Error al cargar los datos del atleta:", error);
        alert("Ocurrió un error al cargar la información.");
    }
}

// ====================================================================
// === 4. MANEJO DEL SUBMIT DEL FORMULARIO
// ====================================================================

form.addEventListener('submit', handleFormSubmit);

async function handleFormSubmit(event) {
    event.preventDefault();
    submitButton.disabled = true;
    submitButton.textContent = (atletaIdEdit) ? 'Guardando...' : 'Registrando...';
    
    // 1. Recolección de datos
    const data = {
        nombre: document.getElementById('nombre').value.trim(),
        apellido: document.getElementById('apellido').value.trim(),
        ci: document.getElementById('ci').value.trim(), // Se usa solo en registro o como campo de edición
        fechaNac: document.getElementById('fechaNac').value,
        categoria: document.getElementById('categoria').value,
        sexo: document.getElementById('sexo').value,
        posicion: document.getElementById('posicion').value,
        telefono: document.getElementById('telefono').value,
        email: document.getElementById('email').value,
        solvencia: document.getElementById('solvencia').value,
        peso: document.getElementById('peso').value ? parseFloat(document.getElementById('peso').value) : null,
        talla: document.getElementById('talla').value ? parseFloat(document.getElementById('talla').value) : null,
    };
    
    try {
        if (atletaIdEdit) {
            // Modo EDICIÓN: Actualizar el documento existente
            const docRef = doc(db, "atletas", atletaIdEdit);
            // IMPORTANTE: NO enviamos 'ci' en updateDoc, ya que no queremos cambiar el ID del documento
            const updateData = { ...data };
            delete updateData.ci; 
            await updateDoc(docRef, updateData); 
            alert("¡Atleta actualizado exitosamente!");
        } else {
            // Modo REGISTRO: Crear nuevo documento (usando CI como ID)
            const newDocRef = doc(collection(db, "atletas"), data.ci);
            await setDoc(newDocRef, data);
            alert("¡Atleta registrado exitosamente!");
            form.reset(); 
        }
        
        // Limpiar el ID de edición después de guardar y redirigir
        localStorage.removeItem('editAtletaId');
        window.location.href = 'index_atletas.html';

    } catch (error) {
        console.error("Error al guardar/actualizar el atleta:", error);
        alert(`Ocurrió un error al procesar el registro/edición. Asegúrate de que la C.I. no esté duplicada en registro: ${error.message}`);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = (atletaIdEdit) ? 'Guardar Cambios' : 'Registrar Atleta';
    }
}

// ====================================================================
// === 5. FUNCIÓN DE LIMPIEZA AL SALIR
// ====================================================================

window.onload = function() {
    initializeForm();
};

window.onbeforeunload = function() {
    if (atletaIdEdit) {
        localStorage.removeItem('editAtletaId');
    }
};
