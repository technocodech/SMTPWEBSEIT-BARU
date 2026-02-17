document.addEventListener('DOMContentLoaded', function() {
            console.log("🚀 DOM loaded - initializing form...");
            
            const form = document.getElementById('registrationForm');
            
            if (!form) {
                console.error("❌ Form tidak ditemukan!");
                return;
            }
            
            console.log("✅ Form ditemukan, mengaktifkan handler...");
            
            // File Upload Handler
            const fileInput = document.getElementById('document');
            const fileNameDisplay = document.getElementById('fileNameDisplay');
            const imagePreview = document.getElementById('imagePreview');
            const uploadIcon = document.getElementById('uploadIcon');
            
            if (fileInput && fileNameDisplay) {
                fileInput.addEventListener('change', function(e) {
                    if (this.files && this.files[0]) {
                        const file = this.files[0];
                        fileNameDisplay.textContent = file.name;
                        fileNameDisplay.style.color = '#D4AF37';
                        
                        // Validasi file
                        const maxSize = 2 * 1024 * 1024;
                        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
                        
                        if (!allowedTypes.includes(file.type)) {
                            showAlert('Format file harus PDF, JPG, atau PNG', 'error');
                            this.value = '';
                            fileNameDisplay.textContent = 'Tidak ada file dipilih';
                            if (imagePreview) imagePreview.style.display = 'none';
                            if (uploadIcon) uploadIcon.style.display = 'flex';
                            return;
                        }
                        
                        if (file.size > maxSize) {
                            showAlert('Ukuran file maksimal 2MB', 'error');
                            this.value = '';
                            fileNameDisplay.textContent = 'Tidak ada file dipilih';
                            if (imagePreview) imagePreview.style.display = 'none';
                            if (uploadIcon) uploadIcon.style.display = 'flex';
                            return;
                        }
                        
                        // Preview untuk gambar
                        if (file.type.startsWith('image/')) {
                            const reader = new FileReader();
                            reader.onload = function(e) {
                                if (imagePreview) {
                                    imagePreview.src = e.target.result;
                                    imagePreview.style.display = 'block';
                                    if (uploadIcon) uploadIcon.style.display = 'none';
                                }
                            };
                            reader.readAsDataURL(file);
                        } else {
                            if (imagePreview) imagePreview.style.display = 'none';
                            if (uploadIcon) uploadIcon.style.display = 'flex';
                        }
                        
                    } else {
                        fileNameDisplay.textContent = 'Tidak ada file dipilih';
                        if (imagePreview) imagePreview.style.display = 'none';
                        if (uploadIcon) uploadIcon.style.display = 'flex';
                    }
                });
            }
            
            // Form Submission
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                console.log("📤 Form submitted!");
                
                // Ambil data
                const full_name = document.getElementById('full_name')?.value;
                const nisn = document.getElementById('nisn')?.value;
                const email = document.getElementById('email')?.value;
                const phone = document.getElementById('phone')?.value;
                const origin_school = document.getElementById('origin_school')?.value;
                const major = document.getElementById('major')?.value;
                const address = document.getElementById('address')?.value;
                const document_file = document.getElementById('document')?.files[0];
                const agreement = document.getElementById('agreement')?.checked;
                
                // Reset error
                document.querySelectorAll('.error-message').forEach(el => el.remove());
                document.querySelectorAll('.input-premium').forEach(el => el.classList.remove('error'));
                
                let isValid = true;
                
                // Validasi
                if (!full_name || full_name.trim() === '') {
                    showFieldError('full_name', 'Nama lengkap harus diisi');
                    isValid = false;
                }
                
                if (!nisn || nisn.trim() === '') {
                    showFieldError('nisn', 'NISN harus diisi');
                    isValid = false;
                } else if (!/^\d{10}$/.test(nisn)) {
                    showFieldError('nisn', 'NISN harus 10 digit angka');
                    isValid = false;
                }
                
                if (!email || email.trim() === '') {
                    showFieldError('email', 'Email harus diisi');
                    isValid = false;
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    showFieldError('email', 'Format email tidak valid');
                    isValid = false;
                }
                
                if (!phone || phone.trim() === '') {
                    showFieldError('phone', 'Nomor WhatsApp harus diisi');
                    isValid = false;
                } else if (!/^(0|62)\d{9,13}$/.test(phone.replace(/\s/g, ''))) {
                    showFieldError('phone', 'Format nomor WhatsApp tidak valid');
                    isValid = false;
                }
                
                if (!origin_school || origin_school.trim() === '') {
                    showFieldError('origin_school', 'Asal sekolah harus diisi');
                    isValid = false;
                }
                
                if (!major || major === '') {
                    showFieldError('major', 'Pilih jurusan terlebih dahulu');
                    isValid = false;
                }
                
                if (!address || address.trim() === '') {
                    showFieldError('address', 'Alamat harus diisi');
                    isValid = false;
                }
                
                if (!document_file) {
                    showAlert('Upload berkas persyaratan', 'error');
                    isValid = false;
                }
                
                if (!agreement) {
                    showAlert('Anda harus menyetujui syarat dan ketentuan', 'error');
                    isValid = false;
                }
                
                if (!isValid) return;
                
                // Submit
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses pendaftaran...';
                
                try {
                    const formData = new FormData();
                    formData.append('full_name', full_name.trim());
                    formData.append('nisn', nisn.trim());
                    formData.append('email', email.trim());
                    formData.append('phone', phone.trim());
                    formData.append('origin_school', origin_school.trim());
                    formData.append('major', major);
                    formData.append('address', address.trim());
                    formData.append('document', document_file);
                    
                    const result = await window.api.register(formData);
                    
                    if (result.success) {
                        showAlert('✅ ' + (result.message || 'Pendaftaran berhasil!'), 'success');
                        
                        if (result.registration_number) {
                            sessionStorage.setItem('registration_number', result.registration_number);
                        }
                        
                        setTimeout(() => {
                            window.location.href = 'success.html';
                        }, 2000);
                        
                    } else {
                        // Ini akan menampilkan "Email sudah terdaftar" dll
                        showAlert('❌ ' + result.error, 'error');
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalText;
                    }
                    
                } catch (error) {
                    console.error('Submission error:', error);
                    showAlert('❌ Terjadi kesalahan sistem', 'error');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            });
            
            // Helper functions
            function showFieldError(fieldId, message) {
                const field = document.getElementById(fieldId);
                if (!field) return;
                
                field.classList.add('error');
                
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
                errorDiv.id = `error-${fieldId}`;
                
                const oldError = document.getElementById(`error-${fieldId}`);
                if (oldError) oldError.remove();
                
                const parent = field.closest('.form-group') || field.parentNode;
                parent.appendChild(errorDiv);
            }
            
            function showAlert(message, type = 'success') {
                const alertId = 'alert-' + Date.now();
                const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
                
                const alertHtml = `
                    <div id="${alertId}" class="custom-alert ${type}">
                        <div class="alert-content">
                            <i class="fas ${icon}"></i>
                            <span>${message}</span>
                        </div>
                        <button onclick="this.parentElement.remove()" class="alert-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                
                document.body.insertAdjacentHTML('beforeend', alertHtml);
                
                setTimeout(() => {
                    const alert = document.getElementById(alertId);
                    if (alert) {
                        alert.style.animation = 'slideOut 0.3s ease forwards';
                        setTimeout(() => alert.remove(), 300);
                    }
                }, 5000);
            }
        });
