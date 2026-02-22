import RenunganService from "../services/renungan.service.js";
import { uploadFile, deleteFile } from "../config/appwrite.js";

class RenunganController {
  async getAll(req, res) {
    try {
      const data = await RenunganService.getAll();
      return res.status(200).json({ success: true, data });
    } catch (err) {
      console.error("[GET /api/renungan] Error:", err);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil data renungan",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }

  async getById(req, res) {
    try {
      const data = await RenunganService.getById(req.params.id);
      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Renungan tidak ditemukan"
        });
      }
      return res.status(200).json({ success: true, data });
    } catch (err) {
      console.error("[GET /api/renungan/:id] Error:", err);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil detail renungan",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }

  async create(req, res) {
    try {
      const { judul, isi, tanggal } = req.body;

      let gambar = null;
      if (req.file) {
        gambar = await uploadFile("renungan", req.file);
      }

      const data = await RenunganService.create({
        judul,
        isi,
        tanggal,
        gambar,
      });
      return res.status(201).json({
        success: true,
        data,
        message: "Renungan berhasil dibuat"
      });
    } catch (err) {
      console.error("[POST /api/renungan] Error:", err);
      res.status(500).json({
        success: false,
        message: "Gagal membuat renungan",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { judul, isi, tanggal } = req.body;

      let gambar = undefined;
      if (req.file) {
        // Hapus gambar lama dari Appwrite
        const existing = await RenunganService.getById(id);
        if (existing?.gambar) {
          await deleteFile("renungan", existing.gambar);
        }
        gambar = await uploadFile("renungan", req.file);
      }

      const data = await RenunganService.update(id, {
        judul,
        isi,
        tanggal,
        gambar,
      });
      return res.status(200).json({
        success: true,
        data,
        message: "Renungan berhasil diperbarui"
      });
    } catch (err) {
      console.error("[PUT /api/renungan] Error:", err);
      res.status(500).json({
        success: false,
        message: "Gagal memperbarui renungan",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }

  async delete(req, res) {
    try {
      await RenunganService.delete(req.params.id);
      return res.status(200).json({
        success: true,
        message: "Renungan berhasil dihapus"
      });
    } catch (err) {
      console.error("[DELETE /api/renungan] Error:", err);
      res.status(500).json({
        success: false,
        message: "Gagal menghapus renungan",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
}

export default new RenunganController();
