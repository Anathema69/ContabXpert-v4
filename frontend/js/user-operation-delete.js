document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('deleteConfirmModal');
    const modalClose = modal.querySelector('.modal-close');
    const cancelBtn = document.getElementById('cancelDeleteBtn');
    const confirmBtn = document.getElementById('confirmDeleteBtn');

    let currentOpId = null;

    function openModal(opId) {
        currentOpId = opId;
        modal.style.display = 'block';
    }

    function closeModal() {
        modal.style.display = 'none';
        currentOpId = null;
    }

    // Delegación de eventos para detectar clic en botón de eliminación
    document.addEventListener('click', (e) => {
        if (e.target && (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn'))) {
            const btn = e.target.closest('.delete-btn');
            const opId = btn.getAttribute('data-op-id');
            openModal(opId);
        }
    });

    modalClose.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

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

    confirmBtn.addEventListener('click', async () => {
        if (!currentOpId) return;
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'index.html';
            return;
        }
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

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
});
