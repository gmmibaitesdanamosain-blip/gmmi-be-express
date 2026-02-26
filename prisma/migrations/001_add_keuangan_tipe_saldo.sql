-- Migration: 001_add_keuangan_tipe_saldo
-- Adds tipe, saldo_kas, saldo_bank columns to laporan_keuangan
-- Run this once against your PostgreSQL database.

-- 1. Tambah kolom tipe
ALTER TABLE laporan_keuangan
    ADD COLUMN IF NOT EXISTS tipe VARCHAR(20) NOT NULL DEFAULT 'transaksi';

-- 2. Constraint validasi nilai tipe
ALTER TABLE laporan_keuangan
    DROP CONSTRAINT IF EXISTS chk_keuangan_tipe;

ALTER TABLE laporan_keuangan
    ADD CONSTRAINT chk_keuangan_tipe CHECK (tipe IN ('transaksi', 'saldo_awal'));

-- 3. Tambah kolom saldo_kas (running balance kas)
ALTER TABLE laporan_keuangan
    ADD COLUMN IF NOT EXISTS saldo_kas DECIMAL(15,2) NOT NULL DEFAULT 0;

-- 4. Tambah kolom saldo_bank (running balance bank)
ALTER TABLE laporan_keuangan
    ADD COLUMN IF NOT EXISTS saldo_bank DECIMAL(15,2) NOT NULL DEFAULT 0;

-- 5. Index pada kolom tanggal untuk performa filter
CREATE INDEX IF NOT EXISTS idx_laporan_keuangan_tanggal
    ON laporan_keuangan (tanggal);

-- 6. Index gabungan untuk ORDER BY yang digunakan pada running balance
CREATE INDEX IF NOT EXISTS idx_laporan_keuangan_tanggal_created
    ON laporan_keuangan (tanggal ASC, created_at ASC);

-- ============================================================
-- CATATAN MIGRASI DATA AWAL
-- ============================================================
-- Setelah menjalankan migration ini, saldo_kas dan saldo_bank
-- semua baris lama akan bernilai 0.
--
-- Untuk menghitung ulang running balance dari data yang sudah ada,
-- jalankan query berikut (recalculate via update dengan window function):
--
-- WITH ordered AS (
--     SELECT id,
--            tipe,
--            kas_penerimaan,
--            kas_pengeluaran,
--            bank_debit,
--            bank_kredit,
--            SUM(
--                CASE WHEN tipe = 'saldo_awal'
--                     THEN kas_penerimaan
--                     ELSE kas_penerimaan - kas_pengeluaran END
--            ) OVER (ORDER BY tanggal ASC, created_at ASC
--                    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS saldo_kas_calc,
--            SUM(
--                CASE WHEN tipe = 'saldo_awal'
--                     THEN bank_debit
--                     ELSE bank_debit - bank_kredit END
--            ) OVER (ORDER BY tanggal ASC, created_at ASC
--                    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS saldo_bank_calc
--     FROM laporan_keuangan
-- )
-- UPDATE laporan_keuangan lk
-- SET saldo_kas  = o.saldo_kas_calc,
--     saldo_bank = o.saldo_bank_calc
-- FROM ordered o
-- WHERE lk.id = o.id;
-- ============================================================
