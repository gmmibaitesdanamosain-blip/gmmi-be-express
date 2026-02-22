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
      console.log('[UPDATE Carousel] Request received for ID:', id);

      // 1. Validasi ID carousel
      if (!id || typeof id !== 'string' || id.trim() === '') {
        console.error('[UPDATE Carousel] Invalid ID:', id);
        return res.status(400).json({
          success: false,
          message: 'Invalid carousel ID'
        });
      }

      // 2. Cek apakah carousel exists
      const existing = await CarouselService.getById(id);
      if (!existing) {
        console.error('[UPDATE Carousel] Carousel not found with ID:', id);
        return res.status(404).json({
          success: false,
          message: 'Carousel not found'
        });
      }
      console.log('[UPDATE Carousel] Carousel found:', existing.title);

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

      console.log('[UPDATE Carousel] Request body:', { title, subtitle, order_index, is_active });
      console.log('[UPDATE Carousel] Image file:', req.file ? req.file.originalname : 'No new image');

      // 3. Validasi required fields
      if (title && title.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Title cannot be empty'
        });
      }

      // 4. Handle image upload (jika ada gambar baru)
      let image_url = undefined;
      if (req.file) {
        try {
          console.log('[UPDATE Carousel] Uploading new image...');
          image_url = await uploadFile("carousel", req.file);
          console.log('[UPDATE Carousel] New image uploaded:', image_url);

          // Hapus gambar lama dari Appwrite (optional tapi recommended)
          if (existing?.image_url) {
            try {
              console.log('[UPDATE Carousel] Deleting old image...');
              await deleteFile("carousel", existing.image_url);
              console.log('[UPDATE Carousel] Old image deleted successfully');
            } catch (deleteError) {
              console.error('[UPDATE Carousel] Failed to delete old image:', deleteError.message);
              // Lanjutkan meskipun gagal hapus gambar lama
            }
          }
        } catch (uploadError) {
          console.error('[UPDATE Carousel] Failed to upload new image:', uploadError);
          return res.status(500).json({
            success: false,
            message: 'Failed to upload image: ' + uploadError.message
          });
        }
      }

      // 5. Update carousel di database
      console.log('[UPDATE Carousel] Updating database...');
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

      console.log('[UPDATE Carousel] Success! Updated carousel:', data.id);
      return res.json({
        success: true,
        message: "Carousel slide berhasil diperbarui",
        data,
      });
    } catch (error) {
      console.error("[UPDATE Carousel] Error:", error);
      return res
        .status(500)
        .json({
          success: false,
          message: "Gagal memperbarui carousel slide",
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      console.log('[DELETE Carousel] Request received for ID:', id);

      // 1. Validasi ID carousel
      if (!id || typeof id !== 'string' || id.trim() === '') {
        console.error('[DELETE Carousel] Invalid ID:', id);
        return res.status(400).json({
          success: false,
          message: 'Invalid carousel ID'
        });
      }

      // 2. Cek apakah carousel exists
      const carousel = await CarouselService.getById(id);
      if (!carousel) {
        console.error('[DELETE Carousel] Carousel not found with ID:', id);
        return res.status(404).json({
          success: false,
          message: 'Carousel not found'
        });
      }
      console.log('[DELETE Carousel] Carousel found:', carousel.title);

      // 3. Hapus gambar dari storage (jika ada)
      if (carousel.image_url) {
        try {
          console.log('[DELETE Carousel] Deleting image from storage...');
          await deleteFile("carousel", carousel.image_url);
          console.log('[DELETE Carousel] Image deleted successfully');
        } catch (imageError) {
          console.error('[DELETE Carousel] Failed to delete image:', imageError.message);
          // Lanjutkan delete carousel meskipun gagal hapus gambar
        }
      }

      // 4. Hapus carousel dari database
      console.log('[DELETE Carousel] Deleting from database...');
      await CarouselService.delete(id);
      console.log('[DELETE Carousel] Success! Deleted carousel:', id);

      return res.json({
        success: true,
        message: "Carousel slide berhasil dihapus",
      });
    } catch (error) {
      console.error("[DELETE Carousel] Error:", error);
      return res
        .status(500)
        .json({
          success: false,
          message: "Gagal menghapus carousel slide",
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
  }
}

export default new CarouselController();
