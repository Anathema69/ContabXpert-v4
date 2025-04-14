document.addEventListener('DOMContentLoaded', async () => {
    // Verificar que exista token (no se restringe el rol porque es admin)
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // Obtener userId del query string
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');
    if (!userId) {
        document.body.innerHTML = '<p style="text-align:center;">No se especificó un usuario para visualizar el historial.</p>';
        return;
    }

    // Referencia a la tabla
    const historyTable = document.getElementById('historyTable');
    const tableBody = historyTable ? historyTable.querySelector('tbody') : null;

    // Toast para notificaciones
    const toastEl = document.getElementById('toast');
    function showToast(message, success = true) {
        toastEl.textContent = message;
        toastEl.className = `toast show-toast ${success ? 'toast-success' : 'toast-error'}`;
        toastEl.style.display = 'block';
        setTimeout(() => {
            toastEl.classList.remove('show-toast');
            toastEl.style.display = 'none';
        }, 3000);
    }

    // Función para renderizar operaciones
    function renderOperations(operations) {
        if (tableBody) tableBody.innerHTML = '';
        operations.forEach(op => {
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
      `;
            tableBody.appendChild(tr);
        });
    }

    // Función para cargar operaciones desde el endpoint
    async function loadOperations() {
        try {
            const resp = await fetch(`/api/history?userId=${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!resp.ok) {
                showToast('Error al cargar el historial', false);
                return;
            }
            const operations = await resp.json();
            renderOperations(operations);
        } catch (error) {
            console.error(error);
            showToast('Error al conectar con el servidor', false);
        }
    }

    await loadOperations();

    // Botón "Volver al Panel Admin"
    const backPanelBtn = document.getElementById('backPanelBtn');
    if (backPanelBtn) {
        backPanelBtn.addEventListener('click', () => {
            window.location.href = 'user-colection.html';
        });
    }

    // Botón Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
});
