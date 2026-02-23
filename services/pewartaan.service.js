import PewartaanRepository from '../repositories/pewartaan.repository.js';

class PewartaanService {
    async getAll() {
        return PewartaanRepository.findAll();
    }

    async getById(id) {
        return PewartaanRepository.findById(id);
    }

    async create(data) {
        return PewartaanRepository.create(data);
    }

    async update(id, data) {
        return PewartaanRepository.update(id, data);
    }

    async updateStatus(id, status) {
        return PewartaanRepository.updateStatus(id, status);
    }

    async delete(id) {
        return PewartaanRepository.delete(id);
    }
}

export default new PewartaanService();
