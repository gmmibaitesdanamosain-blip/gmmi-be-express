import prisma from '../config/prisma.js';

class PewartaanRepository {
    async findAll() {
        return prisma.pewartaan.findMany({
            orderBy: [
                { tanggal_ibadah: 'desc' },
                { created_at: 'desc' }
            ]
        });
    }

    async findById(id) {
        return prisma.pewartaan.findUnique({
            where: { id }
        });
    }

    async create(data) {
        const {
            judul, tanggal_ibadah, hari, tempat_jemaat,
            ayat_firman, tema_khotbah, status,
            file_word_url, file_word_id,
            file_pdf_url, file_pdf_id
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
                file_word_url: file_word_url || null,
                file_word_id: file_word_id || null,
                file_pdf_url: file_pdf_url || null,
                file_pdf_id: file_pdf_id || null,
            }
        });
    }

    async update(id, data) {
        const {
            judul, tanggal_ibadah, hari, tempat_jemaat,
            ayat_firman, tema_khotbah, status,
            file_word_url, file_word_id,
            file_pdf_url, file_pdf_id
        } = data;

        return prisma.pewartaan.update({
            where: { id },
            data: {
                judul,
                tanggal_ibadah: new Date(tanggal_ibadah),
                hari: hari || null,
                tempat_jemaat: tempat_jemaat || null,
                ayat_firman: ayat_firman || null,
                tema_khotbah: tema_khotbah || null,
                status,
                ...(file_word_url !== undefined && { file_word_url, file_word_id }),
                ...(file_pdf_url !== undefined && { file_pdf_url, file_pdf_id }),
                updated_at: new Date(),
            }
        });
    }

    async updateStatus(id, status) {
        return prisma.pewartaan.update({
            where: { id },
            data: { status }
        });
    }

    async delete(id) {
        return prisma.pewartaan.delete({ where: { id } });
    }
}

export default new PewartaanRepository();
