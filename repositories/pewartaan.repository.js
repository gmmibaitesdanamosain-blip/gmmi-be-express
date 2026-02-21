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
                hari: hari || null,
                tempat_jemaat: tempat_jemaat || null,
                ayat_firman: ayat_firman || null,
                tema_khotbah: tema_khotbah || null,
                status: status || 'draft',

                tata_ibadah: Array.isArray(tata_ibadah) && tata_ibadah.length > 0
                    ? { create: tata_ibadah.map(t => ({
                        urutan: t.urutan ?? null,
                        nama_bagian: t.nama_bagian || null,
                        keterangan: t.keterangan || null,
                        judul_pujian: t.judul_pujian || null,
                        isi_konten: t.isi_konten || null,
                    })) }
                    : undefined,

                pokok_doa: Array.isArray(pokok_doa) && pokok_doa.length > 0
                    ? { create: pokok_doa.map(p => ({
                        kategori: p.kategori || null,
                        keterangan: p.keterangan || null,
                    })) }
                    : undefined,

                jemaat_ultah: Array.isArray(jemaat_ultah) && jemaat_ultah.length > 0
                    ? { create: jemaat_ultah.map(u => ({
                        tanggal: u.tanggal ? new Date(u.tanggal) : null,
                        nama_jemaat: u.nama_jemaat || null,
                        keterangan: u.keterangan || null,
                    })) }
                    : undefined,

                jemaat_sakit: Array.isArray(jemaat_sakit) && jemaat_sakit.length > 0
                    ? { create: jemaat_sakit.map(j => ({
                        nama_jemaat: j.nama_jemaat || null,
                        keterangan: j.keterangan || null,
                    })) }
                    : undefined,

                pemulihan: Array.isArray(pemulihan) && pemulihan.length > 0
                    ? { create: pemulihan.map(p => ({
                        nama_jemaat: p.nama_jemaat || null,
                        keterangan: p.keterangan || null,
                    })) }
                    : undefined,

                lansia: Array.isArray(lansia) && lansia.length > 0
                    ? { create: lansia.map(l => ({
                        nama_jemaat: l.nama_jemaat || null,
                        keterangan: l.keterangan || null,
                    })) }
                    : undefined,

                info_ibadah: Array.isArray(info_ibadah) && info_ibadah.length > 0
                    ? { create: info_ibadah.map(i => ({
                        tanggal: i.tanggal ? new Date(i.tanggal) : null,
                        jam: i.jam || null,
                        jenis_ibadah: i.jenis_ibadah || null,
                        pemimpin: i.pemimpin || null,
                        sektor: i.sektor || null,
                    })) }
                    : undefined,

                pelayanan_sektor: Array.isArray(pelayanan_sektor) && pelayanan_sektor.length > 0
                    ? { create: pelayanan_sektor.map(s => ({
                        nomor_sektor: s.nomor_sektor || null,
                        tempat: s.tempat || null,
                        pemimpin: s.pemimpin || null,
                        liturgos: s.liturgos || null,
                        nomor_hp: s.nomor_hp || null,
                    })) }
                    : undefined,

                pelayanan_kategorial: Array.isArray(pelayanan_kategorial) && pelayanan_kategorial.length > 0
                    ? { create: pelayanan_kategorial.map(k => ({
                        tanggal_waktu: k.tanggal_waktu || null,
                        kategori_pelayanan: k.kategori_pelayanan || null,
                        tempat: k.tempat || null,
                        pemimpin: k.pemimpin || null,
                        liturgos_petugas: k.liturgos_petugas || null,
                    })) }
                    : undefined,
            }
        });
    }

    async update(id, data) {
        // FIX: destructure data terlebih dahulu
        const {
            judul, tanggal_ibadah, hari, tempat_jemaat, ayat_firman, tema_khotbah, status,
            tata_ibadah, pokok_doa, jemaat_ultah, jemaat_sakit, pemulihan, lansia,
            info_ibadah, pelayanan_sektor, pelayanan_kategorial
        } = data;

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
                    hari: hari || null,
                    tempat_jemaat: tempat_jemaat || null,
                    ayat_firman: ayat_firman || null,
                    tema_khotbah: tema_khotbah || null,
                    status,
                    updated_at: new Date(),

                    tata_ibadah: Array.isArray(tata_ibadah) && tata_ibadah.length > 0
                        ? { create: tata_ibadah.map(t => ({
                            urutan: t.urutan ?? null,
                            nama_bagian: t.nama_bagian || null,
                            keterangan: t.keterangan || null,
                            judul_pujian: t.judul_pujian || null,
                            isi_konten: t.isi_konten || null,
                        })) }
                        : undefined,

                    pokok_doa: Array.isArray(pokok_doa) && pokok_doa.length > 0
                        ? { create: pokok_doa.map(p => ({
                            kategori: p.kategori || null,
                            keterangan: p.keterangan || null,
                        })) }
                        : undefined,

                    jemaat_ultah: Array.isArray(jemaat_ultah) && jemaat_ultah.length > 0
                        ? { create: jemaat_ultah.map(u => ({
                            tanggal: u.tanggal ? new Date(u.tanggal) : null,
                            nama_jemaat: u.nama_jemaat || null,
                            keterangan: u.keterangan || null,
                        })) }
                        : undefined,

                    jemaat_sakit: Array.isArray(jemaat_sakit) && jemaat_sakit.length > 0
                        ? { create: jemaat_sakit.map(j => ({
                            nama_jemaat: j.nama_jemaat || null,
                            keterangan: j.keterangan || null,
                        })) }
                        : undefined,

                    pemulihan: Array.isArray(pemulihan) && pemulihan.length > 0
                        ? { create: pemulihan.map(p => ({
                            nama_jemaat: p.nama_jemaat || null,
                            keterangan: p.keterangan || null,
                        })) }
                        : undefined,

                    lansia: Array.isArray(lansia) && lansia.length > 0
                        ? { create: lansia.map(l => ({
                            nama_jemaat: l.nama_jemaat || null,
                            keterangan: l.keterangan || null,
                        })) }
                        : undefined,

                    info_ibadah: Array.isArray(info_ibadah) && info_ibadah.length > 0
                        ? { create: info_ibadah.map(i => ({
                            tanggal: i.tanggal ? new Date(i.tanggal) : null,
                            jam: i.jam || null,
                            jenis_ibadah: i.jenis_ibadah || null,
                            pemimpin: i.pemimpin || null,
                            sektor: i.sektor || null,
                        })) }
                        : undefined,

                    pelayanan_sektor: Array.isArray(pelayanan_sektor) && pelayanan_sektor.length > 0
                        ? { create: pelayanan_sektor.map(s => ({
                            nomor_sektor: s.nomor_sektor || null,
                            tempat: s.tempat || null,
                            pemimpin: s.pemimpin || null,
                            liturgos: s.liturgos || null,
                            nomor_hp: s.nomor_hp || null,
                        })) }
                        : undefined,

                    pelayanan_kategorial: Array.isArray(pelayanan_kategorial) && pelayanan_kategorial.length > 0
                        ? { create: pelayanan_kategorial.map(k => ({
                            tanggal_waktu: k.tanggal_waktu || null,
                            kategori_pelayanan: k.kategori_pelayanan || null,
                            tempat: k.tempat || null,
                            pemimpin: k.pemimpin || null,
                            liturgos_petugas: k.liturgos_petugas || null,
                        })) }
                        : undefined,
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
