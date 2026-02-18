import prisma from '../config/prisma.js';

class RenunganRepository {
    async findAll() {
        return prisma.renungan_mingguan.findMany({
            orderBy: { tanggal: 'desc' }
        });
    }

    async findById(id) {
        return prisma.renungan_mingguan.findUnique({
            where: { id: id }
        });
    }

    async create(data) {
        return prisma.renungan_mingguan.create({
            data: {
                ...data,
                tanggal: data.tanggal ? new Date(data.tanggal) : new Date()
            }
        });
    }

    async update(id, data) {
        return prisma.renungan_mingguan.update({
            where: { id: id },
            data: {
                ...data,
                tanggal: data.tanggal ? new Date(data.tanggal) : undefined
            }
        });
    }

    async delete(id) {
        return prisma.renungan_mingguan.delete({
            where: { id: id }
        });
    }
}

export default new RenunganRepository();
