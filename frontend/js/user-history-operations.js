document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded -> user-history-operations.js');

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    if (!token || role !== 'user') {
        window.location.href = 'index.html';
        return;
    }
    const fullName = localStorage.getItem('fullName') || 'Usuario';
    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
        userNameEl.textContent = `Bienvenido: ${fullName}`;
    }
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }

    // Función para mostrar toast
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

    const operationsTable = document.getElementById('operationsTable');
    const tableBody = operationsTable ? operationsTable.querySelector('tbody') : null;
    let cardViewContainer = document.querySelector('.card-view');
    if (!cardViewContainer) {
        cardViewContainer = document.createElement('div');
        cardViewContainer.className = 'card-view';
        const tableContainer = document.querySelector('.table-container');
        if (tableContainer) tableContainer.appendChild(cardViewContainer);
    }

    let allOperations = [];

    function renderOperations(ops) {
        if (tableBody) tableBody.innerHTML = '';
        if (cardViewContainer) cardViewContainer.innerHTML = '';

        ops.forEach(op => {
            const fechaOperacion = op.fecha ? new Date(op.fecha).toLocaleDateString() : '-';
            const titular = op.titularNombre || '-';
            const numOperacion = (op.ordenNum !== undefined && op.ordenNum !== null) ? op.ordenNum : '-';
            const canal = op.canal || '-';
            const tipo = op.tipoActivo || '-';
            const activo = op.activo || '-';
            const moneda = op.moneda || '-';
            const monto = op.monto != null ? op.monto : '-';
            const cantidad = op.cantidad != null ? op.cantidad : '-';
            const comision = op.comision != null ? op.comision : '-';
            const total = op.total != null ? op.total : '-';

            // Celda de "Acciones" con los 3 iconos en una sola celda
            const accionesCell = `
          <button class="icon-btn view-btn" title="Ver imagen" data-op-id="${op._id}" data-image="${op.receiptImage || ''}">
            <img src="icon/options/view.png" alt="Ver imagen">
          </button>
          <button class="icon-btn edit-btn" title="Editar" data-op-id="${op._id}">
            <img src="icon/options/edit.png" alt="Editar">
          </button>
          <button class="icon-btn delete-btn" title="Eliminar" data-op-id="${op._id}">
            <img src="icon/options/delete.png" alt="Eliminar">
          </button>
      `;

            // Crear la fila de la tabla
            if (tableBody) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
          <td data-label="Fecha operación">${fechaOperacion}</td>
          <td data-label="Recibió pago">${titular}</td>
          <td data-label="N° Operación">${numOperacion}</td>
          <td data-label="Canal">${canal}</td>
          <td data-label="Tipo">${tipo}</td>
          <td data-label="Activo">${activo}</td>
          <td data-label="Moneda">${moneda}</td>
          <td data-label="Monto">${monto}</td>
          <td data-label="Cantidad">${cantidad}</td>
          <td data-label="Comisión">${comision}</td>
          <td data-label="Total">${total}</td>
          <td data-label="Acciones" class="options-cell">${accionesCell}</td>
        `;
                tableBody.appendChild(tr);
            }

            // Crear tarjeta para móviles (card view)
            const card = document.createElement('div');
            card.className = 'operation-card';
            card.innerHTML = `
        <div class="operation-card-header">
          <div class="operation-card-date">Fecha: ${fechaOperacion}</div>
          <div class="operation-card-id">#${numOperacion}</div>
        </div>
        <div class="operation-card-content">
          <div class="operation-field"><span class="field-label">Titular:</span> <span class="field-value">${titular}</span></div>
          <div class="operation-field"><span class="field-label">Canal:</span> <span class="field-value">${canal}</span></div>
          <div class="operation-field"><span class="field-label">Tipo:</span> <span class="field-value">${tipo}</span></div>
          <div class="operation-field"><span class="field-label">Activo:</span> <span class="field-value">${activo}</span></div>
          <div class="operation-field"><span class="field-label">Moneda:</span> <span class="field-value">${moneda}</span></div>
          <div class="operation-field"><span class="field-label">Monto:</span> <span class="field-value">${monto}</span></div>
          <div class="operation-field"><span class="field-label">Cantidad:</span> <span class="field-value">${cantidad}</span></div>
          <div class="operation-field"><span class="field-label">Comisión:</span> <span class="field-value">${comision}</span></div>
          <div class="operation-field"><span class="field-label">Total:</span> <span class="field-value">${total}</span></div>
          <div class="operation-field"><span class="field-label">Acciones:</span> ${accionesCell}</div>
        </div>
      `;
            cardViewContainer.appendChild(card);
        });

        // Asignar funcionalidad a los botones "Editar"
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const opId = btn.getAttribute('data-op-id');
                window.location.href = `user-operations.html?edit=${opId}`;
            });
        });

        // Asignar funcionalidad a los botones "Ver imagen"
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const imagePath = btn.getAttribute('data-image');
                if (!imagePath) {
                    showToast('No hay constancia', false);
                    return;
                }
                const receiptModal = document.getElementById('receiptModal');
                const modalReceiptImage = document.getElementById('modalReceiptImage');
                receiptModal.style.display = 'block';
                modalReceiptImage.src = `/${imagePath}`;
                receiptModal.querySelector('.modal-close').addEventListener('click', () => {
                    receiptModal.style.display = 'none';
                    modalReceiptImage.src = '';
                });
            });
        });
    }

    async function loadOperations() {
        try {
            const resp = await fetch(`/api/history?userId=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!resp.ok) {
                showToast('Error al cargar el historial', false);
                return;
            }
            const data = await resp.json();
            allOperations = data;
            renderOperations(allOperations);
        } catch (error) {
            console.error('Error:', error);
            showToast('Error al conectar con el servidor', false);
        }
    }

    await loadOperations();

    // Filtrar por titularNombre
    const filterInput = document.getElementById('filterTitular');
    filterInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allOperations.filter(op => (op.titularNombre || '').toLowerCase().includes(term));
        renderOperations(filtered);
    });

    // Responsive: mostrar tabla o tarjetas
    function handleViewportChange() {
        if (window.innerWidth <= 768) {
            operationsTable.style.display = 'none';
            cardViewContainer.style.display = 'block';
        } else {
            operationsTable.style.display = 'table';
            cardViewContainer.style.display = 'none';
        }
    }
    handleViewportChange();
    window.addEventListener('resize', handleViewportChange);
});
