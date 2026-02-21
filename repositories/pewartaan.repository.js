import prisma from '../config/prisma.js';

class PewartaanRepository {
    async findAll(args = {}) {
        return prisma.pewartaan.findMany({
            ...args,
            orderBy: args.orderBy || [
                { tanggal_ibadah: 'desc' },
                { created_at: 'desc' }
            ]
        });
    }

    async findById(id) {
        return prisma.pewartaan.findUnique({
            where: { id: id },
            include: {
                tata_ibadah: { orderBy: { urutan: 'asc' } },
                pokok_doa: true,
                jemaat_ultah: { orderBy: { tanggal: 'asc' } },
                jemaat_sakit: true,
                pemulihan: true,
                lansia: true,
                info_ibadah: { orderBy: [{ tanggal: 'asc' }, { jam: 'asc' }] },
                pelayanan_sektor: true,
                pelayanan_kategorial: { orderBy: { tanggal_waktu: 'asc' } }
            }
        });
    }

    async create(data) {
        const {
            judul, tanggal_ibadah, hari, tempat_jemaat, ayat_firman, tema_khotbah, status,
            tata_ibadah, pokok_doa, jemaat_ultah, jemaat_sakit, pemulihan, lansia,
            info_ibadah, pelayanan_sektor, pelayanan_kategorial
        } = data;

        return prisma.pewartaan.create({
            data: {
                judul,
                tanggal_ibadah: new Date(tanggal_ibadah),
                hari,
                tempat_jemaat,
                ayat_firman,
                tema_khotbah,
                status: status || 'draft',
                tata_ibadah: tata_ibadah ? { create: tata_ibadah } : undefined,
                pokok_doa: pokok_doa ? { create: pokok_doa } : undefined,
                jemaat_ultah: jemaat_ultah ? {
                    create: jemaat_ultah.map(u => ({ ...u, tanggal: new Date(u.tanggal) }))
                } : undefined,
                jemaat_sakit: jemaat_sakit ? { create: jemaat_sakit } : undefined,
                pemulihan: pemulihan ? { create: pemulihan } : undefined,
                lansia: lansia ? { create: lansia } : undefined,
                info_ibadah: info_ibadah ? {
                    create: info_ibadah.map(i => ({ ...i, tanggal: new Date(i.tanggal) }))
                } : undefined,
                pelayanan_sektor: pelayanan_sektor ? { create: pelayanan_sektor } : undefined,
                pelayanan_kategorial: pelayanan_kategorial ? {
                    create: pelayanan_kategorial.map(p => ({ ...p }))
                } : undefined
            }
        });
    }

    async update(id, data) {
        return prisma.$transaction(async (tx) => {
            const schemaTables = [
                'pewartaan_tata_ibadah', 'pewartaan_pokok_doa', 'pewartaan_jemaat_ultah',
                'pewartaan_jemaat_sakit', 'pewartaan_pemulihan', 'pewartaan_lansia',
                'pewartaan_info_ibadah', 'pewartaan_pelayanan_sektor', 'pewartaan_pelayanan_kategorial'
            ];

            for (const table of schemaTables) {
                await tx[table].deleteMany({ where: { pewartaan_id: id } });
            }

            return tx.pewartaan.update({
                where: { id: id },
                data: {
                    judul,
                    tanggal_ibadah: new Date(tanggal_ibadah),
                    hari,
                    tempat_jemaat,
                    ayat_firman,
                    tema_khotbah,
                    status,
                    tata_ibadah: tata_ibadah ? { create: tata_ibadah } : undefined,
                    pokok_doa: pokok_doa ? { create: pokok_doa } : undefined,
                    jemaat_ultah: jemaat_ultah ? {
                        create: jemaat_ultah.map(u => ({ ...u, tanggal: new Date(u.tanggal) }))
                    } : undefined,
                    jemaat_sakit: jemaat_sakit ? { create: jemaat_sakit } : undefined,
                    pemulihan: pemulihan ? { create: pemulihan } : undefined,
                    lansia: lansia ? { create: lansia } : undefined,
                    info_ibadah: info_ibadah ? {
                        create: info_ibadah.map(i => ({ ...i, tanggal: new Date(i.tanggal) }))
                    } : undefined,
                    pelayanan_sektor: pelayanan_sektor ? { create: pelayanan_sektor } : undefined,
                    pelayanan_kategorial: pelayanan_kategorial ? {
                        create: pelayanan_kategorial.map(p => ({ ...p }))
                    } : undefined
                }
            });
        });
    }

    async delete(id) {
        return prisma.pewartaan.delete({ where: { id: id } });
    }

    async updateStatus(id, status) {
        return prisma.pewartaan.update({
            where: { id: id },
            data: { status }
        });
    }

    async count(args = {}) {
        return prisma.pewartaan.count(args);
    }
}

export default new PewartaanRepository();
