document.addEventListener('DOMContentLoaded', async () => {
    // Detectar el parámetro "edit" en la URL
    const params = new URLSearchParams(window.location.search);
    const editOpId = params.get('edit');
    if (!editOpId) return; // Si no se pasa el parámetro, no se activa el modo edición

    // Cambiar el encabezado del formulario y el texto del botón
    const formHeader = document.querySelector('.operations-form h3');
    if (formHeader) {
        formHeader.textContent = 'Editar Operación';
    }
    const submitBtn = document.getElementById('btnRegistrar');
    if (submitBtn) {
        submitBtn.textContent = 'Actualizar Operación';
    }

    // Función para mostrar notificaciones tipo toast
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

    // Obtener token y redirigir si no se encuentra
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // Cargar los datos de la operación a editar mediante la API
    try {
        const resp = await fetch(`/api/operation/${editOpId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!resp.ok) {
            showToast('Error al cargar la operación para editar', false);
            return;
        }
        const op = await resp.json();

        // Pre-cargar los campos del Paso 1
        document.getElementById('canal').value = op.canal || '';
        // Precargar el campo "Exchange" usando el valor del campo "plataforma"
        if (op.plataforma) {
            document.getElementById('exchange').value = op.plataforma.toUpperCase();
        } else {
            document.getElementById('exchange').value = '';
        }
        document.getElementById('ordenNum').value = op.ordenNum || '';
        document.getElementById('tipoActivo').value = op.tipoActivo || '';
        document.getElementById('activo').value = op.activo || '';
        document.getElementById('moneda').value = op.moneda || '';
        document.getElementById('monto').value = op.monto || '';
        document.getElementById('cantidad').value = op.cantidad || '';
        document.getElementById('comision').value = op.comision || '';
        document.getElementById('total').value = op.total || '';

        // Actualizar el total (si alguno de estos inputs cambia, ya se tienen los listeners en el otro script)
        const montoInput = document.getElementById('monto');
        const cantidadInput = document.getElementById('cantidad');
        const comisionInput = document.getElementById('comision');
        const totalInput = document.getElementById('total');
        function updateTotal() {
            const monto = parseFloat(montoInput.value) || 0;
            const cantidad = parseFloat(cantidadInput.value) || 0;
            const comision = parseFloat(comisionInput.value) || 0;
            const totalValue = (monto * cantidad) + comision;
            totalInput.value = totalValue.toFixed(2);
        }
        updateTotal();

        // Configurar el campo Fecha de operación
        if (op.fecha) {
            const opDate = new Date(op.fecha);
            const dia = String(opDate.getDate()).padStart(2, '0');
            const mes = String(opDate.getMonth() + 1).padStart(2, '0');
            const anio = opDate.getFullYear();
            document.getElementById('fechaPagoDia').value = dia;
            const monthName = opDate.toLocaleString('default', { month: 'long' });
            document.getElementById('selectedFechaPagoMes').textContent = monthName;
            document.getElementById('fechaPagoMesHidden').value = mes;
            document.getElementById('fechaPagoAnio').value = anio;
        }

        // Pre-cargar datos del Paso 2: Titular Exchange
        document.getElementById('titularNombre').value = op.titularNombre || '';
        document.getElementById('titularTipoID').value = op.titularTipoID || '';
        document.getElementById('titularDocumento').value = op.titularDocumento || '';
        document.getElementById('titularDireccion').value = op.titularDireccion || '';

        // Pre-cargar datos del Paso 3: Tercero/Pago
        document.getElementById('terceroNombre').value = op.terceroNombre || '';
        document.getElementById('terceroTipoID').value = op.terceroTipoID || '';
        document.getElementById('terceroDocumento').value = op.terceroDocumento || '';

        // Pre-cargar datos del Paso 4: Datos de Pago
        document.getElementById('cuentaOrigen').value = op.cuentaOrigen || '';
        document.getElementById('cuentaDestino').value = op.cuentaDestino || '';
        document.getElementById('referenciaPago').value = op.referenciaPago || '';
        document.getElementById('estadoPago').value = op.estadoPago || '';
        // No precargar el campo de constancia para que el usuario pueda subir uno nuevo si lo desea

    } catch (error) {
        console.error('Error al cargar operación para edición:', error);
        showToast('Error al cargar los datos de la operación', false);
    }

    // Asignar submit handler para actualizar la operación (PUT)
    const operationsForm = document.getElementById('operationsForm');
    if (operationsForm) {
        operationsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Deshabilitar el botón para evitar clics múltiples
            submitBtn.disabled = true;

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
                    // Mostrar notificación de éxito y redirigir
                    const successOverlay = document.getElementById('successOverlay');
                    if (successOverlay) {
                        successOverlay.style.display = 'flex';
                        setTimeout(() => {
                            window.location.href = 'user-history-operations.html';
                        }, 1500);
                    } else {
                        showToast('Operación actualizada con éxito', true);
                        setTimeout(() => {
                            window.location.href = 'user-history-operations.html';
                        }, 1500);
                    }
                } else {
                    showToast(data.message || 'Error al actualizar la operación', false);
                    // Rehabilitar el botón en caso de error
                    submitBtn.disabled = false;
                }
            } catch (error) {
                console.error('Error en actualización:', error);
                loadingOverlay.style.display = 'none';
                showToast('Error al conectar con el servidor', false);
                submitBtn.disabled = false;
            }
        });
    }
});
