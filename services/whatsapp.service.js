/**
 * WhatsApp Service for GMMI
 * Handles sending automated messages to congregation and sector leaders.
 * Currently uses console logging as a mock implementation.
 */

// In a real implementation, you would import an API client here (e.g., Twilio, Fonnte, Wablas)
// const axios = require('axios');

export const sendWhatsAppMessage = async (targetNumber, message) => {
    try {
        // Normalize phone number (e.g., replace 08 with 628)
        let formattedNumber = targetNumber.toString();
        if (formattedNumber.startsWith('0')) {
            formattedNumber = '62' + formattedNumber.slice(1);
        }

        console.log(`[WHATSAPP MOCK] Sending message to ${formattedNumber}:`);
        console.log('---------------------------------------------------');
        console.log(message);
        console.log('---------------------------------------------------');

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return { success: true, message: 'Message queued (Mock)' };
    } catch (error) {
        console.error('[WHATSAPP MOCK] Failed to send message:', error);
        return { success: false, error: error.message };
    }
};

export const formatSectorNotification = (sectorName, ibadahData) => {
    return `*SHALOM, PELAYAN TUHAN SEKTOR ${sectorName.toUpperCase()}* 🕊️\n\n` +
        `Kami menginformasikan jadwal pelayanan sektor Anda:\n\n` +
        `📅 Tanggal: ${ibadahData.tanggal}\n` +
        `⏰ Waktu: ${ibadahData.waktu}\n` +
        `📍 Tempat: ${ibadahData.tempat}\n` +
        `👤 Pemimpin: ${ibadahData.pemimpin}\n\n` +
        `Mohon dipersiapkan dengan baik. Terima kasih atas pelayanan Anda.\n` +
        `_Tuhan Yesus Memberkati_ 🙏`;
};
