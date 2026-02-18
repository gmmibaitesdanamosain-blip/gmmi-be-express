import JemaatRepository from '../repositories/jemaat.repository.js';

class JemaatService {
    /**
     * Memperbaiki error 500 dengan memastikan parameter kosong 
     * tidak dikirim sebagai string ke Prisma.
     */
    async getAllJemaat(filters = {}) {
        const { sektor_id, pendidikan, kategorial, search } = filters;

        // Sanitasi: Jika string kosong, jadikan undefined agar diabaikan Prisma
        const cleanFilters = {
            sektor_id: sektor_id && sektor_id !== '' ? sektor_id : undefined,
            pendidikan_terakhir: pendidikan && pendidikan !== '' ? pendidikan : undefined,
            kategorial: kategorial && kategorial !== '' ? { contains: kategorial, mode: 'insensitive' } : undefined,
            nama: search && search !== '' ? { contains: search, mode: 'insensitive' } : undefined
        };

        // Hapus key yang bernilai undefined
        Object.keys(cleanFilters).forEach(key => cleanFilters[key] === undefined && delete cleanFilters[key]);

        return await JemaatRepository.findAll({
            where: cleanFilters,
            include: {
                sector: true,
                jemaat_sakramen: true
            }
        });
    }

    async createJemaat(data) {
        return await JemaatRepository.create(data);
    }

    async updateJemaat(id, data) {
        return await JemaatRepository.update(id, data);
    }

    async softDeleteJemaat(id) {
        return await JemaatRepository.softDelete(id);
    }

    async getAllSectors() {
        return await JemaatRepository.findAllSectors();
    }

    async createSector(data) {
        return await JemaatRepository.createSector(data);
    }

    async updateSector(id, data) {
        return await JemaatRepository.updateSector(id, data);
    }

    async deleteSector(id) {
        const membersCount = await JemaatRepository.count({
            where: { sektor_id: id }
        });

        if (membersCount > 0) {
            throw new Error('Sektor tidak dapat dihapus karena masih memiliki jemaat aktif');
        }

        return await JemaatRepository.deleteSector(id);
    }
}

export default new JemaatService();
