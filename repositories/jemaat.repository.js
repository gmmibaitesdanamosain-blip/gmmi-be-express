import prisma from '../config/prisma.js';

class JemaatRepository {
    async findAll(args = {}) {
        return prisma.jemaat.findMany({
            ...args,
            where: {
                ...args.where,
                deleted_at: null
            },
            orderBy: args.orderBy || { nama: 'asc' }
        });
    }

    async create(data) {
        const {
            nama, sektor_id, pendidikan_terakhir, pekerjaan,
            kategorial, keterangan, sakramen,
            jenis_kelamin, tempat_lahir, tanggal_lahir
        } = data;

        // Normalisasi ID Sektor
        const sektorIdClean = String(sektor_id).trim();

        return prisma.$transaction(async (tx) => {
            return tx.jemaat.create({
                data: {
                    nama,
                    sektor_id: sektorIdClean,
                    pendidikan_terakhir,
                    pekerjaan,
                    kategorial,
                    keterangan,
                    jenis_kelamin,
                    tempat_lahir,
                    tanggal_lahir: tanggal_lahir ? new Date(tanggal_lahir) : null,
                    jemaat_sakramen: {
                        create: {
                            bpts: !!sakramen?.bpts,
                            sidi: !!sakramen?.sidi,
                            nikah: !!sakramen?.nikah,
                            meninggal: !!sakramen?.meninggal
                        }
                    }
                }
            });
        });
    }

    async update(id, data) {
        const {
            nama, sektor_id, pendidikan_terakhir, pekerjaan,
            kategorial, keterangan, sakramen,
            jenis_kelamin, tempat_lahir, tanggal_lahir
        } = data;

        const dataToUpdate = {
            nama,
            pendidikan_terakhir,
            pekerjaan,
            kategorial,
            keterangan,
            jenis_kelamin,
            tempat_lahir,
            tanggal_lahir: tanggal_lahir ? new Date(tanggal_lahir) : undefined
        };

        if (sektor_id) dataToUpdate.sektor_id = String(sektor_id);

        return prisma.$transaction(async (tx) => {
            return tx.jemaat.update({
                where: { id },
                data: {
                    ...dataToUpdate,
                    jemaat_sakramen: sakramen ? {
                        upsert: {
                            create: {
                                bpts: !!sakramen.bpts,
                                sidi: !!sakramen.sidi,
                                nikah: !!sakramen.nikah,
                                meninggal: !!sakramen.meninggal
                            },
                            update: {
                                bpts: sakramen.bpts,
                                sidi: sakramen.sidi,
                                nikah: sakramen.nikah,
                                meninggal: sakramen.meninggal
                            }
                        }
                    } : undefined
                }
            });
        });
    }

    async softDelete(id) {
        return prisma.jemaat.update({
            where: { id },
            data: { deleted_at: new Date() }
        });
    }

    async count(args = {}) {
        return prisma.jemaat.count({
            ...args,
            where: {
                ...args.where,
                deleted_at: null
            }
        });
    }

    async findAllSectors() {
        return prisma.sectors.findMany({
            orderBy: { nama_sektor: 'asc' }
        });
    }

    async createSector(data) {
        return prisma.sectors.create({ data });
    }

    async updateSector(id, data) {
        return prisma.sectors.update({
            where: { id },
            data
        });
    }

    async deleteSector(id) {
        return prisma.sectors.delete({
            where: { id }
        });
    }
}

export default new JemaatRepository();
