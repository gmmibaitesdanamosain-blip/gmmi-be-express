/**
 * Script untuk membuat admin pertama (super_admin)
 * Jalankan: node seed-admin.js
 */
import bcrypt from "bcryptjs";
import prisma from "./config/prisma.js";

const SALT_ROUNDS = 10;

async function seedAdmin() {
  try {
    const email = "superadmin@gmmi.com";
    const password = "Admin@12345";
    const nama = "Super Admin";
    const role = "super_admin";

    // Cek apakah sudah ada
    const existing = await prisma.admins.findUnique({ where: { email } });
    if (existing) {
      console.log("Admin sudah ada dengan email:", email);
      console.log("ID:", existing.id);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const admin = await prisma.admins.create({
      data: { nama, email, password_hash: passwordHash, role },
    });

    console.log("✅ Super Admin berhasil dibuat!");
    console.log("   ID:", admin.id);
    console.log("   Email:", email);
    console.log("   Password:", password);
    console.log("   Role:", role);
  } catch (error) {
    console.error("❌ Gagal membuat admin:", error.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

seedAdmin();
