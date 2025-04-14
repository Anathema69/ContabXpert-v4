/*******************************************************
 * frontend/js/user-operation-edit.js
 * Este script se activa si la URL contiene ?edit=ID_OPERACIÓN.
 * Carga los datos de la operación para editar, pre-popula el formulario
 * y al enviar se realiza una petición PUT para actualizar.
 *******************************************************/
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const editOpId = params.get('edit');
    if (!editOpId) return; // No se está editando

    // Cambiar el encabezado del formulario para indicar modo edición
    const formHeader = document.querySelector('.operations-form h3');
    if (formHeader) {
        formHeader.textContent = 'Editar Operación';
    }
    // Cambiar texto del botón de envío a "Actualizar Operación"
    const submitBtn = document.getElementById('btnRegistrar');
    if (submitBtn) {
        submitBtn.textContent = 'Actualizar Operación';
    }

    // Obtener token
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // Cargar datos de la operación a editar
    try {
        const resp = await fetch(`/api/operation/${editOpId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!resp.ok) {
            alert('Error al cargar la operación para editar');
            return;
        }
        const op = await resp.json();

        // Pre-cargar campos de Paso 1
        document.getElementById('canal').value = op.canal || '';
        document.getElementById('ordenNum').value = op.ordenNum || '';
        document.getElementById('tipoActivo').value = op.tipoActivo || '';
        document.getElementById('activo').value = op.activo || '';
        document.getElementById('moneda').value = op.moneda || '';
        document.getElementById('monto').value = op.monto || '';
        document.getElementById('cantidad').value = op.cantidad || '';
        document.getElementById('comision').value = op.comision || '';
        document.getElementById('total').value = op.total || '';

        if (op.fecha) {
            const opDate = new Date(op.fecha);
            const dia = String(opDate.getDate()).padStart(2, '0');
            const mes = String(opDate.getMonth() + 1).padStart(2, '0');
            const anio = opDate.getFullYear();
            document.getElementById('fechaPagoDia').value = dia;
            // Actualizar el texto del botón del mes y el input hidden
            const monthName = opDate.toLocaleString('default', { month: 'long' });
            document.getElementById('selectedFechaPagoMes').textContent = monthName;
            document.getElementById('fechaPagoMesHidden').value = mes;
            document.getElementById('fechaPagoAnio').value = anio;
        }
        // Paso 2: Titular Exchange
        document.getElementById('titularNombre').value = op.titularNombre || '';
        document.getElementById('titularTipoID').value = op.titularTipoID || '';
        document.getElementById('titularDocumento').value = op.titularDocumento || '';
        document.getElementById('titularDireccion').value = op.titularDireccion || '';
        // Paso 3: Tercero/Pago
        document.getElementById('terceroNombre').value = op.terceroNombre || '';
        document.getElementById('terceroTipoID').value = op.terceroTipoID || '';
        document.getElementById('terceroDocumento').value = op.terceroDocumento || '';
        // Paso 4: Datos de Pago
        // En modo edición, se permite editar la cuentaOrigen
        document.getElementById('cuentaOrigen').value = op.cuentaOrigen || '';
        document.getElementById('cuentaDestino').value = op.cuentaDestino || '';
        document.getElementById('referenciaPago').value = op.referenciaPago || '';
        document.getElementById('estadoPago').value = op.estadoPago || '';
        // La constancia se omite, a menos que el usuario decida subir un nuevo archivo.

    } catch (error) {
        console.error('Error al cargar operación para edición:', error);
        alert('Error al cargar los datos de la operación');
    }

    // Modificar el comportamiento del formulario para actualizar la operación
    const operationsForm = document.getElementById('operationsForm');
    if (operationsForm) {
        operationsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const loadingOverlay = document.getElementById('loadingOverlay');
            loadingOverlay.style.display = 'flex';
            const formData = new FormData();
            // Paso 1
            formData.append('canal', document.getElementById('canal').value);
            formData.append('plataforma', document.getElementById('exchange').value);
            formData.append('ordenNum', document.getElementById('ordenNum').value);
            formData.append('tipoActivo', document.getElementById('tipoActivo').value);
            formData.append('activo', document.getElementById('activo').value);
            formData.append('moneda', document.getElementById('moneda').value);
            formData.append('monto', document.getElementById('monto').value);
            formData.append('cantidad', document.getElementById('cantidad').value);
            formData.append('comision', document.getElementById('comision').value);
            formData.append('total', document.getElementById('total').value);
            formData.append('fechaPagoDia', document.getElementById('fechaPagoDia').value);
            formData.append('fechaPagoMesHidden', document.getElementById('fechaPagoMesHidden').value);
            formData.append('fechaPagoAnio', document.getElementById('fechaPagoAnio').value);
            // Paso 2
            formData.append('titularNombre', document.getElementById('titularNombre').value);
            formData.append('titularTipoID', document.getElementById('titularTipoID').value);
            formData.append('titularDocumento', document.getElementById('titularDocumento').value);
            formData.append('titularDireccion', document.getElementById('titularDireccion').value);
            // Paso 3
            formData.append('terceroNombre', document.getElementById('terceroNombre').value);
            formData.append('terceroTipoID', document.getElementById('terceroTipoID').value);
            formData.append('terceroDocumento', document.getElementById('terceroDocumento').value);
            // Paso 4
            formData.append('cuentaOrigen', document.getElementById('cuentaOrigen').value);
            formData.append('cuentaDestino', document.getElementById('cuentaDestino').value);
            formData.append('referenciaPago', document.getElementById('referenciaPago').value);
            formData.append('estadoPago', document.getElementById('estadoPago').value);
            const receiptImageInput = document.getElementById('receiptImage');
            if (receiptImageInput && receiptImageInput.files.length > 0) {
                formData.append('receiptImage', receiptImageInput.files[0]);
            }

            try {
                const response = await fetch(`/api/operation/edit/${editOpId}`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                const data = await response.json();
                loadingOverlay.style.display = 'none';
                if (response.ok) {
                    alert('Operación actualizada con éxito');
                    window.location.href = 'user-history-operations.html';
                } else {
                    alert(data.message || 'Error al actualizar la operación');
                }
            } catch (error) {
                console.error('Error en actualización:', error);
                loadingOverlay.style.display = 'none';
                alert('Error al conectar con el servidor');
            }
        });
    }
});
