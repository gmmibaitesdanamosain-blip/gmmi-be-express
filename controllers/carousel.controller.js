import CarouselService from "../services/carousel.service.js";
import { uploadFile, deleteFile } from "../config/appwrite.js";

class CarouselController {
  async getAll(req, res) {
    try {
      const data = await CarouselService.getAllActive();
      return res.json({ success: true, data });
    } catch (error) {
      console.error("Error in CarouselController.getAll:", error.message);
      return res
        .status(500)
        .json({
          success: false,
          message: "Gagal mengambil data carousel",
          error: error.message,
        });
    }
  }

  async getAllAdmin(req, res) {
    try {
      const data = await CarouselService.getAllAdmin();
      return res.json({ success: true, data });
    } catch (error) {
      console.error("Error in CarouselController.getAllAdmin:", error);
      return res
        .status(500)
        .json({
          success: false,
          message: "Gagal mengambil data carousel admin",
        });
    }
  }

  async create(req, res) {
    try {
      const {
        title,
        subtitle,
        quote,
        badge,
        cta_text,
        cta_link,
        order_index,
        is_active,
      } = req.body;

      let image_url = req.body.image_url || null;
      if (req.file) {
        image_url = await uploadFile("carousel", req.file);
      }

      if (!image_url) {
        return res
          .status(400)
          .json({ success: false, message: "Gambar wajib diunggah" });
      }

      const data = await CarouselService.create({
        title,
        subtitle,
        quote,
        badge,
        image_url,
        cta_text,
        cta_link,
        order_index,
        is_active,
      });

      return res
        .status(201)
        .json({
          success: true,
          message: "Carousel slide berhasil dibuat",
          data,
        });
    } catch (error) {
      console.error("Error in CarouselController.create:", error);
      return res
        .status(500)
        .json({ success: false, message: "Gagal membuat carousel slide" });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        title,
        subtitle,
        quote,
        badge,
        cta_text,
        cta_link,
        order_index,
        is_active,
      } = req.body;

      let image_url = undefined;
      if (req.file) {
        // Hapus gambar lama dari Appwrite
        const existing = await CarouselService.getById(id);
        if (existing?.image_url) {
          await deleteFile("carousel", existing.image_url);
        }
        image_url = await uploadFile("carousel", req.file);
      }

      const data = await CarouselService.update(id, {
        title,
        subtitle,
        quote,
        badge,
        image_url,
        cta_text,
        cta_link,
        order_index,
        is_active,
      });

      return res.json({
        success: true,
        message: "Carousel slide berhasil diperbarui",
        data,
      });
    } catch (error) {
      console.error("Error in CarouselController.update:", error);
      return res
        .status(500)
        .json({ success: false, message: "Gagal memperbarui carousel slide" });
    }
  }

  async delete(req, res) {
    try {
      await CarouselService.delete(req.params.id);
      return res.json({
        success: true,
        message: "Carousel slide berhasil dihapus",
      });
    } catch (error) {
      console.error("Error in CarouselController.delete:", error);
      return res
        .status(500)
        .json({ success: false, message: "Gagal menghapus carousel slide" });
    }
  }
}

export default new CarouselController();
