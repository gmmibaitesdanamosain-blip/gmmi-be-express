import AdminService from "../services/admin.service.js";

class AdminController {
  async register(req, res) {
    try {
      const data = await AdminService.register(req.body, req.user);
      return res.status(201).json({
        success: true,
        message: "Registrasi admin berhasil.",
        data
      });
    } catch (error) {
      console.error("[POST /api/admin/register] Error:", error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getSummary(req, res) {
    try {
      const data = await AdminService.getSummary();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("[GET /api/admin/summary] Error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil ringkasan data",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getAdmins(req, res) {
    try {
      const data = await AdminService.getAll();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("[GET /api/admin] Error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data admin",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async updateAdmin(req, res) {
    try {
      const { id } = req.params; // ID is string
      const data = await AdminService.update(id, req.body);
      return res.status(200).json({
        success: true,
        data,
        message: "Data admin berhasil diperbarui"
      });
    } catch (error) {
      console.error("[PUT /api/admin/:id] Error:", error);
      return res
        .status(error.message.includes("not found") ? 404 : 500)
        .json({
          success: false,
          message: error.message
        });
    }
  }

  async toggleAdminStatus(req, res) {
    try {
      const { id } = req.params; // ID is string
      const data = await AdminService.toggleStatus(id, req.body.isActive);
      return res.status(200).json({
        success: true,
        data,
        message: `Status admin berhasil diubah menjadi ${req.body.isActive ? 'aktif' : 'tidak aktif'}`
      });
    } catch (error) {
      console.error("[PATCH /api/admin/:id/status] Error:", error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      await AdminService.changePassword(
        req.user.id,
        currentPassword,
        newPassword,
      );
      return res.status(200).json({
        success: true,
        message: "Password berhasil diubah"
      });
    } catch (error) {
      console.error("[POST /api/admin/change-password] Error:", error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new AdminController();
