document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar token y rol admin
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    // 2. Mostrar nombre de admin (opcional)
    const adminNameEl = document.getElementById('adminName');
    const adminName = localStorage.getItem('adminName') || 'Admin';
    if (adminNameEl) {
        adminNameEl.textContent = `Bienvenido, ${adminName}`;
    }

    // 3. Botón logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }

    // 4. Referencias a tabla y datos
    const usersTable = document.getElementById('usersTable');
    const tableBody = usersTable ? usersTable.querySelector('tbody') : null;
    let allUsers = [];

    // 5. Función para mostrar toast
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

    // 6. Renderizar usuarios
    function renderUsers(users) {
        if (tableBody) tableBody.innerHTML = '';

        users.forEach(user => {
            // Convertir la fecha de última actualización a un formato legible
            let lastUpdate = '-';
            if (user.date_last_update) {
                lastUpdate = new Date(user.date_last_update).toLocaleString();
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td>${user.fullName || '-'}</td>
        <td>${user.email || '-'}</td>
        <td>${user.role || '-'}</td>
        <td>${user.telefono || '-'}</td>
        <td>${user.docType || '-'}</td>
        <td>${user.docNumber || '-'}</td>
        <td>${user.direccion || '-'}</td>
        <td>${lastUpdate}</td>
        <td class="operations-cell">
          <button class="icon-btn operations-btn" title="Ver operaciones" data-user-id="${user._id}">
            <img src="icon/options/view.png" alt="Ver operaciones">
          </button>
        </td>
      `;
            tableBody.appendChild(tr);
        });
    }

    // 7. Cargar usuarios desde /api/admin/users
    async function loadUsers() {
        try {
            const resp = await fetch('/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!resp.ok) {
                showToast('Error al cargar los usuarios', false);
                return;
            }
            const data = await resp.json();
            allUsers = data;
            renderUsers(allUsers);
        } catch (error) {
            console.error('Error al conectar con el servidor', error);
            showToast('Error al conectar con el servidor', false);
        }
    }

    await loadUsers();

    // 8. Filtro por nombre
    const filterInput = document.getElementById('filterUser');
    filterInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allUsers.filter(u => (u.fullName || '').toLowerCase().includes(term));
        renderUsers(filtered);
    });

    // 9. Delegación de eventos para el botón "Ver operaciones"
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.operations-btn');
        if (btn) {
            const userId = btn.getAttribute('data-user-id');
            // Redirige a la nueva página de visualización de historial
            window.location.href = `view-user-history-operations.html?userId=${userId}`;
        }
    });
});
