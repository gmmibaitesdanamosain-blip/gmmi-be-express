import SejarahRepository from "../repositories/sejarah.repository.js";

class SejarahService {
  async getAll() {
    return await SejarahRepository.findAll();
  }

  async getById(id) {
    return await SejarahRepository.findById(id);
  }

  async create(data) {
    return await SejarahRepository.create(data);
  }

  async update(id, data) {
    return await SejarahRepository.update(id, data);
  }

  async delete(id) {
    return await SejarahRepository.delete(id);
  }
}

export default new SejarahService();
