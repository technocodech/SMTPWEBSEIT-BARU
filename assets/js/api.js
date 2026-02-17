class ApiService {
            constructor() {
                this.baseUrl = window.BASE_URL;
                console.log("✅ API Service ready:", this.baseUrl);
            }

            async register(formData) {
                try {
                    console.log("📤 Mengirim data pendaftaran...");
                    
                    // Tampilkan data yang dikirim untuk debugging
                    for (let pair of formData.entries()) {
                        if (pair[0] === 'document') {
                            console.log(`📎 File: ${pair[1].name}`);
                        } else {
                            console.log(`📝 ${pair[0]}: ${pair[1]}`);
                        }
                    }
                    
                    const response = await fetch(`${this.baseUrl}/api/register`, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'ngrok-skip-browser-warning': 'true'
                        }
                    });

                    console.log("📥 Response status:", response.status);
                    
                    // Ambil response body sebagai text dulu untuk debugging
                    const responseText = await response.text();
                    console.log("📦 Response text:", responseText);
                    
                    // Parse JSON
                    let data;
                    try {
                        data = JSON.parse(responseText);
                    } catch (e) {
                        console.error("❌ Gagal parse JSON:", e);
                        throw new Error('Server mengembalikan response tidak valid');
                    }

                    if (!response.ok) {
                        // Ini yang penting! Ambil pesan error dari backend
                        const errorMessage = data.detail || data.message || 'Pendaftaran gagal';
                        console.log("❌ Error dari backend:", errorMessage);
                        throw new Error(errorMessage);
                    }

                    return {
                        success: true,
                        message: data.message,
                        registration_number: data.registration_number,
                        data: data
                    };

                } catch (error) {
                    console.error("❌ Error caught:", error.message);
                    
                    // Bedakan error koneksi vs error validasi
                    if (error.message.includes('Failed to fetch') || 
                        error.message.includes('NetworkError') ||
                        error.message.includes('Network Error')) {
                        return {
                            success: false,
                            error: 'Tidak dapat terhubung ke server. Pastikan backend dan ngrok sudah running.'
                        };
                    }
                    
                    // Return pesan error asli dari backend
                    return {
                        success: false,
                        error: error.message  // Ini akan berisi "Email sudah terdaftar" dll
                    };
                }
            }

            async healthCheck() {
                try {
                    const response = await fetch(`${this.baseUrl}/api/health`, {
                        headers: {
                            'ngrok-skip-browser-warning': 'true'
                        }
                    });
                    const data = await response.json();
                    console.log("💚 Server health:", data);
                    return data;
                } catch (error) {
                    console.error("💔 Server down:", error.message);
                    return null;
                }
            }
        }

        window.api = new ApiService();
        
        setTimeout(() => {
            window.api.healthCheck();
        }, 1000);
