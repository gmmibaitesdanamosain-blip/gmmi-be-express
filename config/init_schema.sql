-- Database Schema Initialization for GMMI Admin Dashboard
-- Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    isi TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',
    -- 'publish', 'draft'
    tanggal DATE DEFAULT CURRENT_DATE,
    created_by INTEGER REFERENCES admins(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Warta Minggu Table
CREATE TABLE IF NOT EXISTS warta (
    id SERIAL PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    tanggal DATE NOT NULL,
    isi TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    thumbnail TEXT,
    files TEXT [],
    -- Store file paths or URLs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Jadwal Pelayanan Table
CREATE TABLE IF NOT EXISTS jadwal_pelayanan (
    id SERIAL PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    tanggal DATE NOT NULL,
    waktu TIME NOT NULL,
    lokasi VARCHAR(255),
    penanggung_jawab VARCHAR(255),
    status VARCHAR(20) DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);