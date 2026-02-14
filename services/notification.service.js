import dotenv from 'dotenv';
dotenv.config();

class NotificationService {
    /**
     * Sends a WhatsApp notification for Sektor Service.
     * @param {string} phoneNumber - Target phone number.
     * @param {object} data - Data containing sektor info.
     */
    /**
     * Sends a WhatsApp notification for Sektor Service.
     * @param {string} phoneNumber - Target phone number.
     * @param {object} data - Data containing sektor info.
     */
    async sendWartaSektorNotification(phoneNumber, data) {
        try {
            const { nomor_sektor, tempat, pemimpin, liturgos, judul_warta, tanggal } = data;

            // Format message
            const message = `*SHALOM, PELAYAN TUHAN SEKTOR ${nomor_sektor}* 🕊️\n\n` +
                `Kami menginformasikan jadwal pelayanan sektor Anda:\n\n` +
                `📅 Tanggal: ${new Date(tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n` +
                `📍 Tempat: ${tempat}\n` +
                `👤 Pemimpin: ${pemimpin}\n` +
                `📖 Liturgos: ${liturgos}\n\n` +
                `Mohon dipersiapkan dengan baik. Terima kasih atas pelayanan Anda.\n` +
                `_Tuhan Yesus Memberkati_ 🙏`;

            console.log(`\n[WHATSAPP MOCK] ---------------------------------------------------`);
            console.log(`[WHATSAPP MOCK] Sending to: ${phoneNumber}`);
            console.log(`[WHATSAPP MOCK] Content:\n${message}`);
            console.log(`[WHATSAPP MOCK] ---------------------------------------------------\n`);

            // Check for API Key (e.g. Fonnte, Twilio)
            const apiKey = process.env.WHATSAPP_API_KEY;

            if (apiKey) {
                // Example Fonnte implementation
                const response = await fetch('https://api.fonnte.com/send', {
                    method: 'POST',
                    headers: {
                        'Authorization': apiKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        target: phoneNumber,
                        message: message,
                        countryCode: '62' // Default Indonesia
                    })
                });

                const result = await response.json();
                console.log('[WhatsApp API Response]:', result);
                return result;
            } else {
                return { success: true, message: 'Simulated - No API Key, Logged to Console' };
            }
        } catch (error) {
            console.error('[WhatsApp Notification] Error:', error.message);
            return { success: false, error: error.message };
        }
    }
}

export default new NotificationService();
