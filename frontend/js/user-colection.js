document.addEventListener('DOMContentLoaded', async () => {
    // Verificar token y rol admin
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    const adminNameEl = document.getElementById('adminName');
    const adminName = localStorage.getItem('adminName') || 'Admin';
    if (adminNameEl) {
        adminNameEl.textContent = `Bienvenido, ${adminName}`;
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }

    const usersTable = document.getElementById('usersTable');
    const tableBody = usersTable ? usersTable.querySelector('tbody') : null;
    let allUsers = [];

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
        <td data-label="Nombre">${user.fullName || '-'}</td>
        <td data-label="Email">${user.email || '-'}</td>
        <td data-label="Rol">${user.role || '-'}</td>
        <td data-label="Teléfono">${user.telefono || '-'}</td>
        <td data-label="Tipo Doc">${user.docType || '-'}</td>
        <td data-label="Nº Doc">${user.docNumber || '-'}</td>
        <td data-label="Dirección">${user.direccion || '-'}</td>
        <td data-label="Última actualización">${lastUpdate}</td>
      `;
            tableBody.appendChild(tr);
        });
    }

    async function loadUsers() {
        try {
            const resp = await fetch('/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!resp.ok) {
                console.error('Error al cargar los usuarios');
                return;
            }
            const data = await resp.json();
            allUsers = data;
            renderUsers(allUsers);
        } catch (error) {
            console.error('Error al conectar con el servidor', error);
        }
    }

    await loadUsers();

    // Filtro por nombre
    const filterInput = document.getElementById('filterUser');
    filterInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allUsers.filter(user => (user.fullName || '').toLowerCase().includes(term));
        renderUsers(filtered);
    });
});
