/************************************************
 * frontend/js/user-panel.js
 * Actualización de datos complementarios del usuario,
 * con los nuevos campos para tipo y número de documento
 * y la dirección.
 ************************************************/
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');

    if (!token || role !== 'user') {
        window.location.href = 'index.html';
        return;
    }

    const storedFullName = localStorage.getItem('fullName') || 'Usuario';
    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
        userNameEl.textContent = `Bienvenido: ${storedFullName}`;
    }

    // Navegación de la barra lateral
    const btnDatos = document.getElementById('btnDatos');
    if (btnDatos) {
        btnDatos.addEventListener('click', () => {
            window.location.href = 'user-panel.html';
        });
    }
    const btnOperaciones = document.getElementById('btnOperaciones');
    if (btnOperaciones) {
        btnOperaciones.addEventListener('click', () => {
            window.location.href = 'user-operations.html';
        });
    }
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('userId');
            localStorage.removeItem('fullName');
            window.location.href = 'index.html';
        });
    }

    const datosForm = document.getElementById('datosForm');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const toast = document.getElementById('toast');

    function showToast(message, success = true) {
        toast.textContent = message;
        toast.className = 'toast show-toast ' + (success ? 'toast-success' : 'toast-error');
        toast.style.display = 'block';
        setTimeout(() => {
            toast.classList.remove('show-toast');
            toast.style.display = 'none';
        }, 3000);
    }

    // Manejo del selector del código de país y bandera
    const countryCodeSelect = document.getElementById('countryCode');
    const countryFlagImg = document.getElementById('countryFlag');
    if (countryCodeSelect) {
        countryCodeSelect.addEventListener('change', () => {
            const selectedOption = countryCodeSelect.options[countryCodeSelect.selectedIndex];
            const flagFile = selectedOption.getAttribute('data-flag');
            if (flagFile && countryFlagImg) {
                countryFlagImg.src = `icon/flags/${flagFile}`;
            }
        });
    }

    // Envío del formulario de actualización
    datosForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!userId || !token) {
            showToast('Sesión no válida. Por favor, inicia sesión nuevamente.', false);
            window.location.href = 'index.html';
            return;
        }

        loadingOverlay.style.display = 'flex';

        const fullName = document.getElementById('fullName').value.trim();
        const countryCode = document.getElementById('countryCode').value;
        const phoneNumber = document.getElementById('phoneNumber').value.trim();
        const telefono = `${countryCode} ${phoneNumber}`;

        // Nuevos campos: docType, docNumber y direccion
        const docType = document.getElementById('docType').value;
        const docNumber = document.getElementById('docNumber').value.trim();
        const direccion = document.getElementById('direccion').value.trim();

        try {
            const response = await fetch(`/api/user/update/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    fullName,
                    telefono,
                    docType,
                    docNumber,
                    direccion
                })
            });
            const data = await response.json();
            loadingOverlay.style.display = 'none';
            if (response.ok) {
                localStorage.setItem('fullName', fullName);
                if (userNameEl) {
                    userNameEl.textContent = `Bienvenido: ${fullName}`;
                }
                datosForm.reset();
                // Restablece el código de país y bandera a valores por defecto
                countryCodeSelect.value = '+57';
                countryFlagImg.src = 'icon/flags/co.png';
                showToast(data.message, true);
            } else {
                showToast(data.message, false);
            }
        } catch (error) {
            console.error('Error:', error);
            loadingOverlay.style.display = 'none';
            showToast('Error al conectar con el servidor', false);
        }
    });
});
