import SejarahService from "../services/sejarah.service.js";
import { uploadFile, deleteFile } from "../config/appwrite.js";

class SejarahController {
  async getAll(req, res) {
    try {
      const data = await SejarahService.getAll();
      return res.json(data);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }

  async create(req, res) {
    try {
      const { judul, tanggal_peristiwa, deskripsi } = req.body;

      let gambar_url = req.body.gambar_url || null;
      if (req.file) {
        gambar_url = await uploadFile("sejarah", req.file);
      }

      const data = await SejarahService.create({
        judul,
        tanggal_peristiwa,
        deskripsi,
        gambar_url,
      });
      return res.json(data);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { judul, tanggal_peristiwa, deskripsi } = req.body;

      let gambar_url = undefined;
      if (req.file) {
        // Hapus gambar lama dari Appwrite
        const existing = await SejarahService.getById(id);
        if (existing?.gambar_url) {
          await deleteFile("sejarah", existing.gambar_url);
        }
        gambar_url = await uploadFile("sejarah", req.file);
      }

      const data = await SejarahService.update(id, {
        judul,
        tanggal_peristiwa,
        deskripsi,
        gambar_url,
      });
      return res.json(data);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }

  async delete(req, res) {
    try {
      await SejarahService.delete(req.params.id);
      return res.json({ message: "Sejarah deleted successfully" });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
}

export default new SejarahController();
