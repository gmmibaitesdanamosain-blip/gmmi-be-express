import prisma from "../config/prisma.js";

class WartaRepository {
  async create(data) {
    return prisma.warta_ibadah.create({
      data: {
        ...data,
        tanggal: data.tanggal ? new Date(data.tanggal) : new Date(),
        files: data.files || [],
      },
    });
  }

  async update(id, data) {
    return prisma.warta_ibadah.update({
      where: { id: id },
      data: {
        ...data,
        tanggal: data.tanggal ? new Date(data.tanggal) : undefined,
      },
    });
  }

  async delete(id) {
    return prisma.warta_ibadah.delete({
      where: { id: id },
    });
  }

  async updateStatus(id, status) {
    return prisma.warta_ibadah.update({
      where: { id: id },
      data: { status },
    });
  }

  async findMany(args) {
    return prisma.warta_ibadah.findMany(args);
  }

  async findById(id) {
    return prisma.warta_ibadah.findUnique({
      where: { id: id },
    });
  }
}

export default new WartaRepository();
