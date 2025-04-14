/*******************************************************
 * frontend/js/user-operations.js
 * Control del wizard de registro de operaciones,
 * cálculo del total y envío del formulario.
 *******************************************************/
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded -> user-operations.js');

    // 1. Verificar token, rol y userId
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

    // Overlays
    const loadingOverlay = document.getElementById('loadingOverlay');
    const successOverlay = document.getElementById('successOverlay');
    const errorOverlay = document.getElementById('errorOverlay');
    const errorMessageEl = document.getElementById('errorMessage');

    // Wizard y barra de progreso
    const steps = [
        document.getElementById('step1'),
        document.getElementById('step2'),
        document.getElementById('step3'),
        document.getElementById('step4')
    ];
    const stepIndicators = [
        document.getElementById('stepIndicator1'),
        document.getElementById('stepIndicator2'),
        document.getElementById('stepIndicator3'),
        document.getElementById('stepIndicator4')
    ];
    let currentStepIndex = 0;
    function goToStep(index) {
        steps.forEach((step, i) => {
            step.style.display = (i === index) ? 'block' : 'none';
        });
        stepIndicators.forEach((indicator, i) => {
            indicator.classList.remove('active', 'completed');
            if (i < index) {
                indicator.classList.add('completed');
            } else if (i === index) {
                indicator.classList.add('active');
            }
        });
        currentStepIndex = index;
    }
    goToStep(0);

    // Botones de navegación
    const btnNext1 = document.getElementById('btnNext1');
    const btnNext2 = document.getElementById('btnNext2');
    const btnNext3 = document.getElementById('btnNext3');
    const btnPrev2 = document.getElementById('btnPrev2');
    const btnPrev3 = document.getElementById('btnPrev3');
    const btnPrev4 = document.getElementById('btnPrev4');
    if (btnNext1) btnNext1.addEventListener('click', () => goToStep(1));
    if (btnNext2) btnNext2.addEventListener('click', () => goToStep(2));
    if (btnNext3) btnNext3.addEventListener('click', () => goToStep(3));
    if (btnPrev2) btnPrev2.addEventListener('click', () => goToStep(0));
    if (btnPrev3) btnPrev3.addEventListener('click', () => goToStep(1));
    if (btnPrev4) btnPrev4.addEventListener('click', () => goToStep(2));

    // Cálculo del total: Total = (Monto * Cantidad) + Comisión
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
    montoInput.addEventListener('input', updateTotal);
    cantidadInput.addEventListener('input', updateTotal);
    comisionInput.addEventListener('input', updateTotal);

    // Envío del formulario
    const operationsForm = document.getElementById('operationsForm');
    if (operationsForm) {
        operationsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            loadingOverlay.style.display = 'flex';

            const formData = new FormData();
            // Paso 1
            formData.append('canal', document.getElementById('canal').value);
            formData.append('plataforma', document.getElementById('exchange').value);
            formData.append('ordenNum', document.getElementById('ordenNum').value);
            formData.append('tipoActivo', document.getElementById('tipoActivo').value);
            formData.append('activo', document.getElementById('activo').value);
            formData.append('moneda', document.getElementById('moneda').value);
            formData.append('monto', montoInput.value);
            formData.append('cantidad', cantidadInput.value);
            formData.append('comision', comisionInput.value);
            formData.append('total', totalInput.value);
            // Fecha de operación (Paso 1)
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
                const response = await fetch('/api/operation/register', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                const data = await response.json();
                loadingOverlay.style.display = 'none';
                if (response.ok) {
                    successOverlay.style.display = 'flex';
                    setTimeout(() => {
                        successOverlay.style.display = 'none';
                    }, 3000);
                    operationsForm.reset();
                    goToStep(0);
                } else {
                    errorMessageEl.textContent = data.message || 'Error desconocido';
                    errorOverlay.style.display = 'flex';
                    setTimeout(() => {
                        errorOverlay.style.display = 'none';
                    }, 3000);
                }
            } catch (error) {
                console.error('Error:', error);
                loadingOverlay.style.display = 'none';
                errorMessageEl.textContent = 'Error al conectar con el servidor';
                errorOverlay.style.display = 'flex';
                setTimeout(() => {
                    errorOverlay.style.display = 'none';
                }, 3000);
            }
        });
    }

    // Configuración del selector de mes para la fecha
    const fechaPagoMonthSelect = document.querySelector('.custom-month-select');
    if (fechaPagoMonthSelect) {
        const fechaPagoMonthTrigger = fechaPagoMonthSelect.querySelector('.custom-month-trigger');
        const fechaPagoMonthDropdown = fechaPagoMonthSelect.querySelector('.custom-month-dropdown');
        const selectedFechaPagoMesSpan = document.getElementById('selectedFechaPagoMes');
        const fechaPagoMesHiddenInput = document.getElementById('fechaPagoMesHidden');
        fechaPagoMonthTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            fechaPagoMonthDropdown.classList.toggle('open');
            fechaPagoMonthTrigger.focus();
        });
        fechaPagoMonthDropdown.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', (e) => {
                const monthValue = e.target.dataset.value;
                const monthName = e.target.textContent;
                selectedFechaPagoMesSpan.textContent = monthName;
                fechaPagoMesHiddenInput.value = monthValue;
                fechaPagoMonthDropdown.classList.remove('open');
            });
        });
        document.addEventListener('click', (e) => {
            if (!fechaPagoMonthSelect.contains(e.target)) {
                fechaPagoMonthDropdown.classList.remove('open');
            }
        });
    }
});
