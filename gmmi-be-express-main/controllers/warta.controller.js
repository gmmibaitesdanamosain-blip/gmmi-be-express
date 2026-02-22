import WartaService from "../services/warta.service.js";
import { uploadFile, deleteFile } from "../config/appwrite.js";

class WartaController {
  async getAll(req, res) {
    try {
      const result = await WartaService.getAll(req.query);
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      console.error("[GET /api/warta] Error:", error.message);
      return res
        .status(500)
        .json({
          success: false,
          message: "Gagal mengambil data warta",
          error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
  }

  async create(req, res) {
    try {
      const { judul, tanggal, isi, status, files } = req.body;
      if (!judul || !tanggal) {
        return res
          .status(400)
          .json({ success: false, message: "Judul dan tanggal harus diisi" });
      }

      let thumbnail = null;
      if (req.file) {
        thumbnail = await uploadFile("warta", req.file);
      }

      const data = await WartaService.create({
        judul,
        tanggal,
        isi,
        status,
        thumbnail,
        files,
      });

      return res.status(201).json({
        success: true,
        message: "Warta berhasil dibuat",
        data,
      });
    } catch (error) {
      console.error("Error in WartaController.create:", error);
      return res
        .status(500)
        .json({ success: false, message: "Gagal membuat warta" });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { judul, tanggal, isi, status, files } = req.body;

      let thumbnail = undefined;
      if (req.file) {
        // Hapus thumbnail lama dari Appwrite
        const existing = await WartaService.getById(id);
        if (existing?.thumbnail) {
          await deleteFile("warta", existing.thumbnail);
        }
        thumbnail = await uploadFile("warta", req.file);
      }

      const data = await WartaService.update(id, {
        judul,
        tanggal,
        isi,
        status,
        thumbnail,
        files,
      });

      return res.status(200).json({
        success: true,
        message: "Warta berhasil diperbarui",
        data,
      });
    } catch (error) {
      console.error("Error in WartaController.update:", error);
      return res
        .status(500)
        .json({ success: false, message: "Gagal memperbarui warta" });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await WartaService.delete(id);
      return res.status(200).json({
        success: true,
        message: "Warta berhasil dihapus",
      });
    } catch (error) {
      console.error("Error in WartaController.delete:", error);
      return res
        .status(500)
        .json({ success: false, message: "Gagal menghapus warta" });
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["approved", "rejected", "pending"].includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: "Status tidak valid" });
      }

      const data = await WartaService.updateStatus(id, status);

      return res.status(200).json({
        success: true,
        message: `Status warta berhasil diubah menjadi ${status}`,
        data,
      });
    } catch (error) {
      console.error("Error in WartaController.updateStatus:", error);
      return res
        .status(500)
        .json({ success: false, message: "Gagal memperbarui status warta" });
    }
  }
}

export default new WartaController();
