/*******************************************************
 * frontend/js/user-history-operations.js
 * Muestra el historial de operaciones del usuario
 * con la estructura de columnas nueva.
 * Agrega funcionalidad a los botones "Editar" y "Eliminar"
 * (por el momento "Eliminar" muestra un placeholder).
 *******************************************************/
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded -> user-history-operations.js');

    // 1. Verificar token, rol y userId
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    if (!token || role !== 'user') {
        window.location.href = 'index.html';
        return;
    }

    // 2. Mostrar el nombre en el encabezado
    const fullName = localStorage.getItem('fullName') || 'Usuario';
    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
        userNameEl.textContent = `Bienvenido: ${fullName}`;
    }

    // 3. Configurar botón de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }

    // 4. Configurar Toast para notificaciones
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

    // 5. Referencias a la tabla y contenedor para vista en tarjetas
    const operationsTable = document.getElementById('operationsTable');
    const tableBody = operationsTable ? operationsTable.querySelector('tbody') : null;
    let cardViewContainer = document.querySelector('.card-view');
    if (!cardViewContainer) {
        cardViewContainer = document.createElement('div');
        cardViewContainer.className = 'card-view';
        const tableContainer = document.querySelector('.table-container');
        if (tableContainer) tableContainer.appendChild(cardViewContainer);
    }

    // 6. Modal para ver constancia
    const receiptModal = document.getElementById('receiptModal');
    const modalCloseBtn = document.querySelector('.modal-close');
    const modalReceiptImage = document.getElementById('modalReceiptImage');
    if (modalCloseBtn && receiptModal) {
        modalCloseBtn.addEventListener('click', () => {
            receiptModal.style.display = 'none';
            modalReceiptImage.src = '';
        });
    }

    // 7. Función para cargar el historial de operaciones
    async function loadOperations() {
        try {
            const resp = await fetch(`/api/history?userId=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!resp.ok) {
                showToast('Error al cargar historial', false);
                return;
            }
            const data = await resp.json();

            // Limpiar contenido previo
            if (tableBody) tableBody.innerHTML = '';
            if (cardViewContainer) cardViewContainer.innerHTML = '';

            // Por cada operación crear una fila de tabla y su tarjeta móvil
            data.forEach((op, idx) => {
                // Formatear la fecha de operación del usuario
                const fechaUsuario = op.fecha ? new Date(op.fecha).toLocaleDateString() : '-';
                // Nombre de quién recibió el pago (titularNombre)
                const recibido = op.titularNombre || '-';
                // Número de operación (ordenNum)
                const numeroOperacion = (op.ordenNum !== undefined && op.ordenNum !== null) ? op.ordenNum : '-';
                const canal = op.canal || '-';
                const tipo = op.tipoActivo || '-';
                const activo = op.activo || '-';
                const moneda = op.moneda || '-';
                const monto = op.monto != null ? op.monto : '-';
                const cantidad = op.cantidad != null ? op.cantidad : '-';
                const comision = op.comision != null ? op.comision : '-';
                const total = op.total != null ? op.total : '-';

                // Botón de constancia: si existe el path se habilita; de lo contrario, se deshabilita.
                let constanciaBtn = `<button class="btn-view-receipt" data-image="${op.receiptImage || ''}" ${!op.receiptImage ? 'disabled style="background-color:#ccc;cursor:not-allowed;"' : ''}>Ver imagen</button>`;
                // Botones de acciones: Editar y Eliminar.
                let acciones = `
                  <button class="action-btn edit-btn" data-op-id="${op._id}">Editar</button>
                  <button class="action-btn delete-btn" data-op-id="${op._id}">Eliminar</button>
                `;

                // Crear la fila de la tabla con el orden de columnas solicitado
                if (tableBody) {
                    let tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td data-label="Fecha usuario">${fechaUsuario}</td>
                        <td data-label="Recibió pago">${recibido}</td>
                        <td data-label="N° Operación">${numeroOperacion}</td>
                        <td data-label="Canal">${canal}</td>
                        <td data-label="Tipo">${tipo}</td>
                        <td data-label="Activo">${activo}</td>
                        <td data-label="Moneda">${moneda}</td>
                        <td data-label="Monto">${monto}</td>
                        <td data-label="Cantidad">${cantidad}</td>
                        <td data-label="Comisión">${comision}</td>
                        <td data-label="Total">${total}</td>
                        <td data-label="Constancia">${constanciaBtn}</td>
                        <td data-label="Acciones">${acciones}</td>
                    `;
                    tableBody.appendChild(tr);
                }

                // Crear tarjeta para vista móvil (adaptada a la nueva estructura)
                let card = document.createElement('div');
                card.className = 'operation-card';
                let cardContent = `
                  <div class="operation-card-header">
                    <div class="operation-card-date">Fecha: ${fechaUsuario}</div>
                    <div class="operation-card-id">#${numeroOperacion}</div>
                  </div>
                  <div class="operation-card-content">
                    <div class="operation-field"><span class="field-label">Recibió pago:</span> <span class="field-value">${recibido}</span></div>
                    <div class="operation-field"><span class="field-label">Canal:</span> <span class="field-value">${canal}</span></div>
                    <div class="operation-field"><span class="field-label">Tipo:</span> <span class="field-value">${tipo}</span></div>
                    <div class="operation-field"><span class="field-label">Activo:</span> <span class="field-value">${activo}</span></div>
                    <div class="operation-field"><span class="field-label">Moneda:</span> <span class="field-value">${moneda}</span></div>
                    <div class="operation-field"><span class="field-label">Monto:</span> <span class="field-value">${monto}</span></div>
                    <div class="operation-field"><span class="field-label">Cantidad:</span> <span class="field-value">${cantidad}</span></div>
                    <div class="operation-field"><span class="field-label">Comisión:</span> <span class="field-value">${comision}</span></div>
                    <div class="operation-field"><span class="field-label">Total:</span> <span class="field-value">${total}</span></div>
                    <div class="operation-field"><span class="field-label">Constancia:</span> ${constanciaBtn}</div>
                    <div class="operation-field"><span class="field-label">Acciones:</span> ${acciones}</div>
                  </div>
                `;
                card.innerHTML = cardContent;
                cardViewContainer.appendChild(card);
            });

            // Asignar funcionalidad al botón "Ver imagen"
            const btnsView = document.querySelectorAll('.btn-view-receipt');
            btnsView.forEach(btn => {
                const imgPath = btn.getAttribute('data-image');
                btn.addEventListener('click', () => {
                    if (!imgPath) {
                        showToast('No hay constancia', false);
                        return;
                    }
                    modalReceiptImage.src = `/${imgPath}`;
                    receiptModal.style.display = 'block';
                });
            });

            // Asignar funcionalidad a los botones "Editar"
            const editButtons = document.querySelectorAll('.edit-btn');
            editButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const opId = btn.getAttribute('data-op-id');
                    // Redirigir a la página user-operations.html con el parámetro edit
                    window.location.href = `user-operations.html?edit=${opId}`;
                });
            });



        } catch (error) {
            console.error('Error al cargar operaciones:', error);
            showToast('Error al conectar con el servidor', false);
        }
    }

    await loadOperations();

    // Ajustar visualización: tabla para pantallas grandes, tarjetas para móviles
    function handleViewportChange() {
        const viewportWidth = window.innerWidth;
        if (viewportWidth <= 768) {
            if (operationsTable) operationsTable.style.display = 'none';
            if (cardViewContainer) cardViewContainer.style.display = 'block';
        } else {
            if (operationsTable) operationsTable.style.display = 'table';
            if (cardViewContainer) cardViewContainer.style.display = 'none';
        }
    }
    handleViewportChange();
    window.addEventListener('resize', handleViewportChange);

    // Si no existe el elemento toast, lo creamos (aunque normalmente ya existe)
    if (!toast) {
        const toastElement = document.createElement('div');
        toastElement.id = 'toast';
        toastElement.className = 'toast';
        document.body.appendChild(toastElement);
    }
});
