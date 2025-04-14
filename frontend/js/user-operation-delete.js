document.addEventListener('DOMContentLoaded', () => {
    // Usaremos delegación de eventos para capturar clics en elementos con clase "delete-btn"
    // sin importar que se hayan agregado dinámicamente.

    // Referencia al modal de confirmación (asegúrate que exista en el HTML)
    const modal = document.getElementById('deleteConfirmModal');
    const modalClose = modal.querySelector('.modal-close');
    const cancelBtn = document.getElementById('cancelDeleteBtn');
    const confirmBtn = document.getElementById('confirmDeleteBtn');

    let currentOpId = null;

    // Función para abrir el modal
    function openModal(opId) {
        currentOpId = opId;
        modal.style.display = 'block';
    }

    // Función para cerrar el modal
    function closeModal() {
        modal.style.display = 'none';
        currentOpId = null;
    }

    // Delegación de eventos: escucha clics en cualquier parte del documento
    document.addEventListener('click', (e) => {
        // Si el elemento clickeado tiene la clase "delete-btn", se abre el modal
        if (e.target && e.target.classList.contains('delete-btn')) {
            const opId = e.target.getAttribute('data-op-id');
            openModal(opId);
        }
    });

    // Asigna los eventos para cerrar el modal
    modalClose.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Función para mostrar un toast
    function showToast(message, success = true) {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.className = 'toast show-toast ' + (success ? 'toast-success' : 'toast-error');
        toast.style.display = 'block';
        setTimeout(() => {
            toast.classList.remove('show-toast');
            toast.style.display = 'none';
        }, 3000);
    }

    // Al confirmar la eliminación, se manda la petición para cambiar hidden a true
    confirmBtn.addEventListener('click', async () => {
        if (!currentOpId) return;

        // Obtener token
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'index.html';
            return;
        }

        // Mostrar overlay de carga (si está definido)
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) loadingOverlay.style.display = 'flex';

        try {
            const response = await fetch(`/api/operation/delete/${currentOpId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ hidden: true })
            });

            const data = await response.json();

            if (response.ok) {
                showToast('Registro eliminado con éxito', true);
                // Recargar la página para actualizar el listado
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                showToast(data.message || 'Error al eliminar el registro', false);
            }
        } catch (error) {
            console.error('Error al eliminar:', error);
            showToast('Error al conectar con el servidor', false);
        } finally {
            if (loadingOverlay) loadingOverlay.style.display = 'none';
        }
        closeModal();
    });

    // Cerrar el modal al hacer clic fuera del contenido
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
});
