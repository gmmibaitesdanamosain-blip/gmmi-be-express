--
-- PostgreSQL database dump
--

\restrict bVK1RlSfMpCglnBFS4EEPuSMOOXgfJWWg7yuQrqixn8PA1DdUkxWPXa1Z52lFKk

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-02-13 19:13:27

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 951 (class 1247 OID 25001)
-- Name: bidang_gereja_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.bidang_gereja_enum AS ENUM (
    'Sekretariat',
    'Penatalayanan',
    'Kategorial',
    'Pemberdayaan Jemaat',
    'Rumah Tangga, Sarana, dan Prasarana',
    'BP2K2',
    'Kebendaharaan'
);


ALTER TYPE public.bidang_gereja_enum OWNER TO postgres;

--
-- TOC entry 948 (class 1247 OID 24942)
-- Name: sub_bidang_penatalayanan_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.sub_bidang_penatalayanan_enum AS ENUM (
    'Pelayanan Umum',
    'Pelayanan Khusus'
);


ALTER TYPE public.sub_bidang_penatalayanan_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 234 (class 1259 OID 24830)
-- Name: admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admins (
    id integer NOT NULL,
    nama character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash text NOT NULL,
    role character varying(20) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT admins_role_check CHECK (((role)::text = ANY ((ARRAY['super_admin'::character varying, 'admin_majelis'::character varying])::text[])))
);


ALTER TABLE public.admins OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 24829)
-- Name: admins_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admins_id_seq OWNER TO postgres;

--
-- TOC entry 5512 (class 0 OID 0)
-- Dependencies: 233
-- Name: admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admins_id_seq OWNED BY public.admins.id;


--
-- TOC entry 273 (class 1259 OID 25804)
-- Name: agenda; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agenda (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    kegiatan character varying(150) NOT NULL,
    tanggal date NOT NULL,
    jam_mulai time without time zone NOT NULL,
    jam_selesai time without time zone,
    lokasi character varying(150) NOT NULL,
    penanggung_jawab character varying(150) NOT NULL,
    status character varying(20) DEFAULT 'aktif'::character varying,
    is_publish boolean DEFAULT true,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.agenda OWNER TO postgres;

--
-- TOC entry 286 (class 1259 OID 25982)
-- Name: aktivitas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.aktivitas (
    id integer NOT NULL,
    admin_id integer,
    admin_nama character varying(100),
    aksi character varying(50),
    modul character varying(50),
    detail text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.aktivitas OWNER TO postgres;

--
-- TOC entry 285 (class 1259 OID 25981)
-- Name: aktivitas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.aktivitas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.aktivitas_id_seq OWNER TO postgres;

--
-- TOC entry 5513 (class 0 OID 0)
-- Dependencies: 285
-- Name: aktivitas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.aktivitas_id_seq OWNED BY public.aktivitas.id;


--
-- TOC entry 248 (class 1259 OID 25578)
-- Name: announcements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.announcements (
    id integer NOT NULL,
    isi text NOT NULL,
    status character varying(20) DEFAULT 'draft'::character varying,
    tanggal timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer
);


ALTER TABLE public.announcements OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 25577)
-- Name: announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.announcements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.announcements_id_seq OWNER TO postgres;

--
-- TOC entry 5514 (class 0 OID 0)
-- Dependencies: 247
-- Name: announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.announcements_id_seq OWNED BY public.announcements.id;


--
-- TOC entry 230 (class 1259 OID 24797)
-- Name: arsip_bulanan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.arsip_bulanan (
    id integer NOT NULL,
    bulan integer NOT NULL,
    tahun integer NOT NULL,
    data jsonb,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.arsip_bulanan OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 24796)
-- Name: arsip_bulanan_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.arsip_bulanan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.arsip_bulanan_id_seq OWNER TO postgres;

--
-- TOC entry 5515 (class 0 OID 0)
-- Dependencies: 229
-- Name: arsip_bulanan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.arsip_bulanan_id_seq OWNED BY public.arsip_bulanan.id;


--
-- TOC entry 278 (class 1259 OID 25880)
-- Name: carousel_slides; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carousel_slides (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    subtitle text,
    quote text,
    badge character varying(255),
    image_url character varying(255) NOT NULL,
    cta_text character varying(100),
    cta_link character varying(255),
    order_index integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.carousel_slides OWNER TO postgres;

--
-- TOC entry 277 (class 1259 OID 25879)
-- Name: carousel_slides_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.carousel_slides_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.carousel_slides_id_seq OWNER TO postgres;

--
-- TOC entry 5516 (class 0 OID 0)
-- Dependencies: 277
-- Name: carousel_slides_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.carousel_slides_id_seq OWNED BY public.carousel_slides.id;


--
-- TOC entry 226 (class 1259 OID 24720)
-- Name: jadwal_ibadah; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jadwal_ibadah (
    id integer NOT NULL,
    jenis_ibadah character varying(50) NOT NULL,
    tanggal date NOT NULL,
    jam time without time zone NOT NULL,
    lokasi character varying(200),
    rumah_jemaat character varying(200),
    bulan integer NOT NULL,
    tahun integer NOT NULL,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.jadwal_ibadah OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 24719)
-- Name: jadwal_ibadah_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jadwal_ibadah_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jadwal_ibadah_id_seq OWNER TO postgres;

--
-- TOC entry 5517 (class 0 OID 0)
-- Dependencies: 225
-- Name: jadwal_ibadah_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jadwal_ibadah_id_seq OWNED BY public.jadwal_ibadah.id;


--
-- TOC entry 236 (class 1259 OID 24898)
-- Name: jadwal_pelayanan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jadwal_pelayanan (
    id integer NOT NULL,
    nama_kegiatan character varying(255) NOT NULL,
    tanggal date NOT NULL,
    pelayan jsonb,
    status character varying(20) DEFAULT 'aktif'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.jadwal_pelayanan OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 24897)
-- Name: jadwal_pelayanan_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jadwal_pelayanan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jadwal_pelayanan_id_seq OWNER TO postgres;

--
-- TOC entry 5518 (class 0 OID 0)
-- Dependencies: 235
-- Name: jadwal_pelayanan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jadwal_pelayanan_id_seq OWNED BY public.jadwal_pelayanan.id;


--
-- TOC entry 280 (class 1259 OID 25908)
-- Name: jemaat; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jemaat (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nama character varying(150) NOT NULL,
    tanggal_lahir date,
    jenis_kelamin character(1),
    pendidikan_terakhir character varying(10),
    kategorial character varying(20),
    sektor_id uuid NOT NULL,
    keterangan text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp without time zone,
    tempat_lahir character varying(100),
    pekerjaan_id integer,
    pekerjaan character varying(30),
    CONSTRAINT jemaat_jenis_kelamin_check CHECK ((jenis_kelamin = ANY (ARRAY['L'::bpchar, 'P'::bpchar]))),
    CONSTRAINT jemaat_kategorial_check CHECK (((kategorial)::text = ANY ((ARRAY['P_PRIA'::character varying, 'P_WANITA'::character varying, 'AMMI'::character varying, 'ARMI'::character varying, 'SM'::character varying])::text[]))),
    CONSTRAINT jemaat_pekerjaan_check CHECK (((pekerjaan)::text = ANY ((ARRAY['Buruh'::character varying, 'Petani'::character varying, 'Nelayan'::character varying, 'PNS'::character varying, 'TNI / POLRI'::character varying, 'Guru / Dosen'::character varying, 'Tenaga Kesehatan'::character varying, 'Rohaniawan'::character varying, 'Lainnya'::character varying])::text[]))),
    CONSTRAINT jemaat_pendidikan_terakhir_check CHECK (((pendidikan_terakhir)::text = ANY ((ARRAY['TK'::character varying, 'SD'::character varying, 'SMP'::character varying, 'SMA'::character varying, 'S1'::character varying, 'S2'::character varying, 'S3'::character varying])::text[])))
);


ALTER TABLE public.jemaat OWNER TO postgres;

--
-- TOC entry 282 (class 1259 OID 25947)
-- Name: jemaat_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jemaat_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    jemaat_id uuid,
    perubahan text,
    changed_by uuid,
    changed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.jemaat_history OWNER TO postgres;

--
-- TOC entry 281 (class 1259 OID 25928)
-- Name: jemaat_sakramen; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jemaat_sakramen (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    jemaat_id uuid,
    bpts boolean DEFAULT false,
    sidi boolean DEFAULT false,
    nikah boolean DEFAULT false,
    meninggal boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.jemaat_sakramen OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 24779)
-- Name: kegiatan_bulanan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kegiatan_bulanan (
    id integer NOT NULL,
    bulan integer NOT NULL,
    tahun integer NOT NULL,
    deskripsi text,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.kegiatan_bulanan OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 24778)
-- Name: kegiatan_bulanan_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.kegiatan_bulanan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.kegiatan_bulanan_id_seq OWNER TO postgres;

--
-- TOC entry 5519 (class 0 OID 0)
-- Dependencies: 227
-- Name: kegiatan_bulanan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.kegiatan_bulanan_id_seq OWNED BY public.kegiatan_bulanan.id;


--
-- TOC entry 275 (class 1259 OID 25821)
-- Name: keuangan_laporan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.keuangan_laporan (
    id bigint NOT NULL,
    periode_awal date NOT NULL,
    periode_akhir date NOT NULL,
    tanggal_transaksi date NOT NULL,
    urutan integer NOT NULL,
    keterangan text NOT NULL,
    jenis_transaksi character varying(20) NOT NULL,
    kas_penerimaan numeric(15,2) DEFAULT 0,
    kas_pengeluaran numeric(15,2) DEFAULT 0,
    bank_debit numeric(15,2) DEFAULT 0,
    bank_kredit numeric(15,2) DEFAULT 0,
    created_by bigint,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT keuangan_laporan_jenis_transaksi_check CHECK (((jenis_transaksi)::text = ANY ((ARRAY['PENDAPATAN'::character varying, 'PENGELUARAN'::character varying, 'SALDO_AWAL'::character varying])::text[])))
);


ALTER TABLE public.keuangan_laporan OWNER TO postgres;

--
-- TOC entry 274 (class 1259 OID 25820)
-- Name: keuangan_laporan_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.keuangan_laporan_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.keuangan_laporan_id_seq OWNER TO postgres;

--
-- TOC entry 5520 (class 0 OID 0)
-- Dependencies: 274
-- Name: keuangan_laporan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.keuangan_laporan_id_seq OWNED BY public.keuangan_laporan.id;


--
-- TOC entry 276 (class 1259 OID 25861)
-- Name: laporan_keuangan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.laporan_keuangan (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tanggal date NOT NULL,
    keterangan text NOT NULL,
    kas_penerimaan numeric(15,2) DEFAULT 0,
    kas_pengeluaran numeric(15,2) DEFAULT 0,
    bank_debit numeric(15,2) DEFAULT 0,
    bank_kredit numeric(15,2) DEFAULT 0,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.laporan_keuangan OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 24815)
-- Name: log_notifikasi; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.log_notifikasi (
    id integer NOT NULL,
    jadwal_id integer,
    no_hp character varying(20),
    status character varying(10) DEFAULT 'terkirim'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.log_notifikasi OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 24814)
-- Name: log_notifikasi_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.log_notifikasi_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.log_notifikasi_id_seq OWNER TO postgres;

--
-- TOC entry 5521 (class 0 OID 0)
-- Dependencies: 231
-- Name: log_notifikasi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.log_notifikasi_id_seq OWNED BY public.log_notifikasi.id;


--
-- TOC entry 284 (class 1259 OID 25963)
-- Name: pekerjaan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pekerjaan (
    id integer NOT NULL,
    nama_pekerjaan character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pekerjaan OWNER TO postgres;

--
-- TOC entry 283 (class 1259 OID 25962)
-- Name: pekerjaan_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pekerjaan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pekerjaan_id_seq OWNER TO postgres;

--
-- TOC entry 5522 (class 0 OID 0)
-- Dependencies: 283
-- Name: pekerjaan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pekerjaan_id_seq OWNED BY public.pekerjaan.id;


--
-- TOC entry 224 (class 1259 OID 24702)
-- Name: pengumuman; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pengumuman (
    id integer NOT NULL,
    judul character varying(200) NOT NULL,
    isi text NOT NULL,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pengumuman OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 24701)
-- Name: pengumuman_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pengumuman_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pengumuman_id_seq OWNER TO postgres;

--
-- TOC entry 5523 (class 0 OID 0)
-- Dependencies: 223
-- Name: pengumuman_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pengumuman_id_seq OWNED BY public.pengumuman.id;


--
-- TOC entry 252 (class 1259 OID 25624)
-- Name: pewartaan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pewartaan (
    id integer NOT NULL,
    judul character varying(255) NOT NULL,
    tanggal_ibadah date NOT NULL,
    hari character varying(50),
    tempat_jemaat character varying(255),
    ayat_firman text,
    tema_khotbah character varying(255),
    status character varying(50) DEFAULT 'draft'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pewartaan OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 25623)
-- Name: pewartaan_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pewartaan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pewartaan_id_seq OWNER TO postgres;

--
-- TOC entry 5524 (class 0 OID 0)
-- Dependencies: 251
-- Name: pewartaan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pewartaan_id_seq OWNED BY public.pewartaan.id;


--
-- TOC entry 266 (class 1259 OID 25729)
-- Name: pewartaan_info_ibadah; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pewartaan_info_ibadah (
    id integer NOT NULL,
    pewartaan_id integer,
    tanggal date,
    jam character varying(50),
    jenis_ibadah character varying(255),
    pemimpin character varying(255),
    sektor character varying(100)
);


ALTER TABLE public.pewartaan_info_ibadah OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 25728)
-- Name: pewartaan_info_ibadah_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pewartaan_info_ibadah_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pewartaan_info_ibadah_id_seq OWNER TO postgres;

--
-- TOC entry 5525 (class 0 OID 0)
-- Dependencies: 265
-- Name: pewartaan_info_ibadah_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pewartaan_info_ibadah_id_seq OWNED BY public.pewartaan_info_ibadah.id;


--
-- TOC entry 260 (class 1259 OID 25684)
-- Name: pewartaan_jemaat_sakit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pewartaan_jemaat_sakit (
    id integer NOT NULL,
    pewartaan_id integer,
    nama_jemaat character varying(255),
    keterangan text
);


ALTER TABLE public.pewartaan_jemaat_sakit OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 25683)
-- Name: pewartaan_jemaat_sakit_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pewartaan_jemaat_sakit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pewartaan_jemaat_sakit_id_seq OWNER TO postgres;

--
-- TOC entry 5526 (class 0 OID 0)
-- Dependencies: 259
-- Name: pewartaan_jemaat_sakit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pewartaan_jemaat_sakit_id_seq OWNED BY public.pewartaan_jemaat_sakit.id;


--
-- TOC entry 258 (class 1259 OID 25669)
-- Name: pewartaan_jemaat_ultah; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pewartaan_jemaat_ultah (
    id integer NOT NULL,
    pewartaan_id integer,
    tanggal date,
    nama_jemaat character varying(255),
    keterangan text
);


ALTER TABLE public.pewartaan_jemaat_ultah OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 25668)
-- Name: pewartaan_jemaat_ultah_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pewartaan_jemaat_ultah_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pewartaan_jemaat_ultah_id_seq OWNER TO postgres;

--
-- TOC entry 5527 (class 0 OID 0)
-- Dependencies: 257
-- Name: pewartaan_jemaat_ultah_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pewartaan_jemaat_ultah_id_seq OWNED BY public.pewartaan_jemaat_ultah.id;


--
-- TOC entry 264 (class 1259 OID 25714)
-- Name: pewartaan_lansia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pewartaan_lansia (
    id integer NOT NULL,
    pewartaan_id integer,
    nama_jemaat character varying(255),
    keterangan text
);


ALTER TABLE public.pewartaan_lansia OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 25713)
-- Name: pewartaan_lansia_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pewartaan_lansia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pewartaan_lansia_id_seq OWNER TO postgres;

--
-- TOC entry 5528 (class 0 OID 0)
-- Dependencies: 263
-- Name: pewartaan_lansia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pewartaan_lansia_id_seq OWNED BY public.pewartaan_lansia.id;


--
-- TOC entry 270 (class 1259 OID 25759)
-- Name: pewartaan_pelayanan_kategorial; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pewartaan_pelayanan_kategorial (
    id integer NOT NULL,
    pewartaan_id integer,
    tanggal_waktu character varying(100),
    kategori_pelayanan character varying(255),
    tempat character varying(255),
    pemimpin character varying(255),
    liturgos_petugas character varying(255)
);


ALTER TABLE public.pewartaan_pelayanan_kategorial OWNER TO postgres;

--
-- TOC entry 269 (class 1259 OID 25758)
-- Name: pewartaan_pelayanan_kategorial_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pewartaan_pelayanan_kategorial_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pewartaan_pelayanan_kategorial_id_seq OWNER TO postgres;

--
-- TOC entry 5529 (class 0 OID 0)
-- Dependencies: 269
-- Name: pewartaan_pelayanan_kategorial_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pewartaan_pelayanan_kategorial_id_seq OWNED BY public.pewartaan_pelayanan_kategorial.id;


--
-- TOC entry 268 (class 1259 OID 25744)
-- Name: pewartaan_pelayanan_sektor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pewartaan_pelayanan_sektor (
    id integer NOT NULL,
    pewartaan_id integer,
    nomor_sektor character varying(50),
    tempat character varying(255),
    pemimpin character varying(255),
    liturgos character varying(255),
    nomor_hp character varying(50)
);


ALTER TABLE public.pewartaan_pelayanan_sektor OWNER TO postgres;

--
-- TOC entry 267 (class 1259 OID 25743)
-- Name: pewartaan_pelayanan_sektor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pewartaan_pelayanan_sektor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pewartaan_pelayanan_sektor_id_seq OWNER TO postgres;

--
-- TOC entry 5530 (class 0 OID 0)
-- Dependencies: 267
-- Name: pewartaan_pelayanan_sektor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pewartaan_pelayanan_sektor_id_seq OWNED BY public.pewartaan_pelayanan_sektor.id;


--
-- TOC entry 262 (class 1259 OID 25699)
-- Name: pewartaan_pemulihan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pewartaan_pemulihan (
    id integer NOT NULL,
    pewartaan_id integer,
    nama_jemaat character varying(255),
    keterangan text
);


ALTER TABLE public.pewartaan_pemulihan OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 25698)
-- Name: pewartaan_pemulihan_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pewartaan_pemulihan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pewartaan_pemulihan_id_seq OWNER TO postgres;

--
-- TOC entry 5531 (class 0 OID 0)
-- Dependencies: 261
-- Name: pewartaan_pemulihan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pewartaan_pemulihan_id_seq OWNED BY public.pewartaan_pemulihan.id;


--
-- TOC entry 256 (class 1259 OID 25654)
-- Name: pewartaan_pokok_doa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pewartaan_pokok_doa (
    id integer NOT NULL,
    pewartaan_id integer,
    kategori character varying(255),
    keterangan text
);


ALTER TABLE public.pewartaan_pokok_doa OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 25653)
-- Name: pewartaan_pokok_doa_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pewartaan_pokok_doa_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pewartaan_pokok_doa_id_seq OWNER TO postgres;

--
-- TOC entry 5532 (class 0 OID 0)
-- Dependencies: 255
-- Name: pewartaan_pokok_doa_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pewartaan_pokok_doa_id_seq OWNED BY public.pewartaan_pokok_doa.id;


--
-- TOC entry 254 (class 1259 OID 25639)
-- Name: pewartaan_tata_ibadah; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pewartaan_tata_ibadah (
    id integer NOT NULL,
    pewartaan_id integer,
    urutan integer,
    nama_bagian character varying(255),
    keterangan text,
    judul_pujian character varying(255),
    isi_konten text
);


ALTER TABLE public.pewartaan_tata_ibadah OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 25638)
-- Name: pewartaan_tata_ibadah_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pewartaan_tata_ibadah_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pewartaan_tata_ibadah_id_seq OWNER TO postgres;

--
-- TOC entry 5533 (class 0 OID 0)
-- Dependencies: 253
-- Name: pewartaan_tata_ibadah_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pewartaan_tata_ibadah_id_seq OWNED BY public.pewartaan_tata_ibadah.id;


--
-- TOC entry 250 (class 1259 OID 25592)
-- Name: program_kegiatan_gereja; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.program_kegiatan_gereja (
    id integer NOT NULL,
    bidang character varying(50) NOT NULL,
    sub_bidang character varying(100),
    nama_program character varying(255) NOT NULL,
    jenis_kegiatan character varying(255) NOT NULL,
    volume integer DEFAULT 1,
    waktu_pelaksanaan character varying(100) NOT NULL,
    rencana_biaya numeric(15,2) DEFAULT 0,
    keterangan text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.program_kegiatan_gereja OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 25591)
-- Name: program_kegiatan_gereja_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.program_kegiatan_gereja_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.program_kegiatan_gereja_id_seq OWNER TO postgres;

--
-- TOC entry 5534 (class 0 OID 0)
-- Dependencies: 249
-- Name: program_kegiatan_gereja_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.program_kegiatan_gereja_id_seq OWNED BY public.program_kegiatan_gereja.id;


--
-- TOC entry 272 (class 1259 OID 25791)
-- Name: renungan_mingguan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.renungan_mingguan (
    id integer NOT NULL,
    judul character varying(255) NOT NULL,
    isi text NOT NULL,
    tanggal date DEFAULT CURRENT_DATE,
    gambar character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.renungan_mingguan OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 25790)
-- Name: renungan_mingguan_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.renungan_mingguan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.renungan_mingguan_id_seq OWNER TO postgres;

--
-- TOC entry 5535 (class 0 OID 0)
-- Dependencies: 271
-- Name: renungan_mingguan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.renungan_mingguan_id_seq OWNED BY public.renungan_mingguan.id;


--
-- TOC entry 279 (class 1259 OID 25896)
-- Name: sectors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sectors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nama_sektor character varying(100) NOT NULL,
    alamat text,
    no_hp character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sectors OWNER TO postgres;

--
-- TOC entry 288 (class 1259 OID 25998)
-- Name: sejarah; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sejarah (
    id integer NOT NULL,
    judul character varying(255) NOT NULL,
    tanggal_peristiwa date,
    deskripsi text NOT NULL,
    gambar_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sejarah OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 24685)
-- Name: sejarah_gereja; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sejarah_gereja (
    id integer NOT NULL,
    konten text NOT NULL,
    updated_by integer,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sejarah_gereja OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 24684)
-- Name: sejarah_gereja_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sejarah_gereja_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sejarah_gereja_id_seq OWNER TO postgres;

--
-- TOC entry 5536 (class 0 OID 0)
-- Dependencies: 221
-- Name: sejarah_gereja_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sejarah_gereja_id_seq OWNED BY public.sejarah_gereja.id;


--
-- TOC entry 287 (class 1259 OID 25997)
-- Name: sejarah_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sejarah_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sejarah_id_seq OWNER TO postgres;

--
-- TOC entry 5537 (class 0 OID 0)
-- Dependencies: 287
-- Name: sejarah_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sejarah_id_seq OWNED BY public.sejarah.id;


--
-- TOC entry 220 (class 1259 OID 24666)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    nama character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password text NOT NULL,
    no_hp character varying(20),
    role character varying(20) NOT NULL,
    status character varying(10) DEFAULT 'aktif'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['super_admin'::character varying, 'admin_majelis'::character varying, 'jemaat'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 24665)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5538 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 237 (class 1259 OID 25030)
-- Name: warta_ibadah; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warta_ibadah (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    judul_warta character varying(255) NOT NULL,
    hari character varying(50),
    tanggal date NOT NULL,
    tempat character varying(150),
    ayat_firman character varying(255),
    tema_khotbah text,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.warta_ibadah OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 25129)
-- Name: warta_informasi_ibadah; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warta_informasi_ibadah (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    warta_id uuid,
    tanggal date,
    jam character varying(20),
    jenis_ibadah character varying(100),
    pemimpin character varying(100),
    sektor character varying(100)
);


ALTER TABLE public.warta_informasi_ibadah OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 25087)
-- Name: warta_jemaat_sakit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warta_jemaat_sakit (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    warta_id uuid,
    nama character varying(150),
    keterangan text
);


ALTER TABLE public.warta_jemaat_sakit OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 25115)
-- Name: warta_lansia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warta_lansia (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    warta_id uuid,
    nama character varying(150),
    keterangan text
);


ALTER TABLE public.warta_lansia OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 25153)
-- Name: warta_pelayanan_kategorial; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warta_pelayanan_kategorial (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    warta_id uuid,
    hari_tanggal character varying(100),
    kategori character varying(100),
    tempat character varying(150),
    pemimpin character varying(100),
    liturgos character varying(100)
);


ALTER TABLE public.warta_pelayanan_kategorial OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 25141)
-- Name: warta_pelayanan_sektor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warta_pelayanan_sektor (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    warta_id uuid,
    sektor character varying(50),
    tempat character varying(150),
    pemimpin character varying(100),
    liturgos character varying(100),
    no_hp character varying(20)
);


ALTER TABLE public.warta_pelayanan_sektor OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 25101)
-- Name: warta_pemulihan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warta_pemulihan (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    warta_id uuid,
    nama character varying(150),
    keterangan text
);


ALTER TABLE public.warta_pemulihan OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 25059)
-- Name: warta_pokok_doa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warta_pokok_doa (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    warta_id uuid,
    kategori character varying(100),
    keterangan text
);


ALTER TABLE public.warta_pokok_doa OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 25043)
-- Name: warta_tata_ibadah; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warta_tata_ibadah (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    warta_id uuid,
    urutan integer NOT NULL,
    nama_bagian character varying(150),
    keterangan character varying(100),
    judul_lagu character varying(150),
    isi text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.warta_tata_ibadah OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 25073)
-- Name: warta_ulang_tahun; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warta_ulang_tahun (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    warta_id uuid,
    tanggal date,
    nama character varying(150),
    keterangan text
);


ALTER TABLE public.warta_ulang_tahun OWNER TO postgres;

--
-- TOC entry 5072 (class 2604 OID 24833)
-- Name: admins id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins ALTER COLUMN id SET DEFAULT nextval('public.admins_id_seq'::regclass);


--
-- TOC entry 5154 (class 2604 OID 25985)
-- Name: aktivitas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aktivitas ALTER COLUMN id SET DEFAULT nextval('public.aktivitas_id_seq'::regclass);


--
-- TOC entry 5092 (class 2604 OID 25581)
-- Name: announcements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements ALTER COLUMN id SET DEFAULT nextval('public.announcements_id_seq'::regclass);


--
-- TOC entry 5067 (class 2604 OID 24800)
-- Name: arsip_bulanan id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arsip_bulanan ALTER COLUMN id SET DEFAULT nextval('public.arsip_bulanan_id_seq'::regclass);


--
-- TOC entry 5135 (class 2604 OID 25883)
-- Name: carousel_slides id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carousel_slides ALTER COLUMN id SET DEFAULT nextval('public.carousel_slides_id_seq'::regclass);


--
-- TOC entry 5063 (class 2604 OID 24723)
-- Name: jadwal_ibadah id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jadwal_ibadah ALTER COLUMN id SET DEFAULT nextval('public.jadwal_ibadah_id_seq'::regclass);


--
-- TOC entry 5076 (class 2604 OID 24901)
-- Name: jadwal_pelayanan id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jadwal_pelayanan ALTER COLUMN id SET DEFAULT nextval('public.jadwal_pelayanan_id_seq'::regclass);


--
-- TOC entry 5065 (class 2604 OID 24782)
-- Name: kegiatan_bulanan id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kegiatan_bulanan ALTER COLUMN id SET DEFAULT nextval('public.kegiatan_bulanan_id_seq'::regclass);


--
-- TOC entry 5122 (class 2604 OID 25824)
-- Name: keuangan_laporan id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.keuangan_laporan ALTER COLUMN id SET DEFAULT nextval('public.keuangan_laporan_id_seq'::regclass);


--
-- TOC entry 5069 (class 2604 OID 24818)
-- Name: log_notifikasi id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.log_notifikasi ALTER COLUMN id SET DEFAULT nextval('public.log_notifikasi_id_seq'::regclass);


--
-- TOC entry 5152 (class 2604 OID 25966)
-- Name: pekerjaan id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pekerjaan ALTER COLUMN id SET DEFAULT nextval('public.pekerjaan_id_seq'::regclass);


--
-- TOC entry 5061 (class 2604 OID 24705)
-- Name: pengumuman id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pengumuman ALTER COLUMN id SET DEFAULT nextval('public.pengumuman_id_seq'::regclass);


--
-- TOC entry 5101 (class 2604 OID 25627)
-- Name: pewartaan id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pewartaan ALTER COLUMN id SET DEFAULT nextval('public.pewartaan_id_seq'::regclass);


--
-- TOC entry 5111 (class 2604 OID 25732)
-- Name: pewartaan_info_ibadah id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pewartaan_info_ibadah ALTER COLUMN id SET DEFAULT nextval('public.pewartaan_info_ibadah_id_seq'::regclass);


--
-- TOC entry 5108 (class 2604 OID 25687)
-- Name: pewartaan_jemaat_sakit id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pewartaan_jemaat_sakit ALTER COLUMN id SET DEFAULT nextval('public.pewartaan_jemaat_sakit_id_seq'::regclass);


--
-- TOC entry 5107 (class 2604 OID 25672)
-- Name: pewartaan_jemaat_ultah id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pewartaan_jemaat_ultah ALTER COLUMN id SET DEFAULT nextval('public.pewartaan_jemaat_ultah_id_seq'::regclass);


--
-- TOC entry 5110 (class 2604 OID 25717)
-- Name: pewartaan_lansia id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pewartaan_lansia ALTER COLUMN id SET DEFAULT nextval('public.pewartaan_lansia_id_seq'::regclass);


--
-- TOC entry 5113 (class 2604 OID 25762)
-- Name: pewartaan_pelayanan_kategorial id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pewartaan_pelayanan_kategorial ALTER COLUMN id SET DEFAULT nextval('public.pewartaan_pelayanan_kategorial_id_seq'::regclass);


--
-- TOC entry 5112 (class 2604 OID 25747)
-- Name: pewartaan_pelayanan_sektor id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pewartaan_pelayanan_sektor ALTER COLUMN id SET DEFAULT nextval('public.pewartaan_pelayanan_sektor_id_seq'::regclass);


--
-- TOC entry 5109 (class 2604 OID 25702)
-- Name: pewartaan_pemulihan id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pewartaan_pemulihan ALTER COLUMN id SET DEFAULT nextval('public.pewartaan_pemulihan_id_seq'::regclass);


--
-- TOC entry 5106 (class 2604 OID 25657)
-- Name: pewartaan_pokok_doa id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pewartaan_pokok_doa ALTER COLUMN id SET DEFAULT nextval('public.pewartaan_pokok_doa_id_seq'::regclass);


--
-- TOC entry 5105 (class 2604 OID 25642)
-- Name: pewartaan_tata_ibadah id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pewartaan_tata_ibadah ALTER COLUMN id SET DEFAULT nextval('public.pewartaan_tata_ibadah_id_seq'::regclass);


--
-- TOC entry 5096 (class 2604 OID 25595)
-- Name: program_kegiatan_gereja id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.program_kegiatan_gereja ALTER COLUMN id SET DEFAULT nextval('public.program_kegiatan_gereja_id_seq'::regclass);


--
-- TOC entry 5114 (class 2604 OID 25794)
-- Name: renungan_mingguan id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.renungan_mingguan ALTER COLUMN id SET DEFAULT nextval('public.renungan_mingguan_id_seq'::regclass);


--
-- TOC entry 5156 (class 2604 OID 26001)
-- Name: sejarah id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sejarah ALTER COLUMN id SET DEFAULT nextval('public.sejarah_id_seq'::regclass);


--
-- TOC entry 5059 (class 2604 OID 24688)
-- Name: sejarah_gereja id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sejarah_gereja ALTER COLUMN id SET DEFAULT nextval('public.sejarah_gereja_id_seq'::regclass);


--
-- TOC entry 5056 (class 2604 OID 24669)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5452 (class 0 OID 24830)
-- Dependencies: 234
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admins (id, nama, email, password_hash, role, is_active, created_at, updated_at) FROM stdin;
2	excel miracle	smkindezz@gmail.com	PETRA20LENGGU06	super_admin	t	2026-02-07 11:56:50.820907	2026-02-07 11:56:50.820907
1	Petra Lenggu	petra221106@gmail.com	PETRA20LENGGU06	admin_majelis	t	2026-02-06 19:24:12.136254	2026-02-12 23:27:47.580333
\.


--
-- TOC entry 5491 (class 0 OID 25804)
-- Dependencies: 273
-- Data for Name: agenda; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agenda (id, kegiatan, tanggal, jam_mulai, jam_selesai, lokasi, penanggung_jawab, status, is_publish, created_by, created_at, updated_at) FROM stdin;
6bba3423-c946-4595-b766-79c8368a3396	Ibadah Minggu Utama	2026-02-08	05:00:00	\N	Gedung Utama	Pdt. John Ade	aktif	t	\N	2026-02-10 15:11:48.451167	2026-02-10 15:11:48.451167
7d8b2ba0-cc94-4880-97b6-88071f330cd7	Ibadah Raya Minggu Pagi	2026-02-15	09:00:00	\N	Gedung Utama GMMI	Pdt. Samuel Johnson	aktif	t	\N	2026-02-10 15:13:32.768243	2026-02-10 15:13:32.768243
008b52eb-c42a-48a5-9fe7-f11abf89e42a	Persekutuan Doa Rabu	2026-02-18	19:00:00	\N	Ruang Doa	Ibu Maria	aktif	t	\N	2026-02-10 15:13:32.773741	2026-02-10 15:13:32.773741
108c30d3-42c9-4b07-9004-28b1ef7ef9e8	Latihan Musik & Pujian	2026-02-20	18:00:00	\N	Studio Musik	Sdr. David	aktif	t	\N	2026-02-10 15:13:32.77545	2026-02-10 15:13:32.77545
1600f238-8bf4-423c-9b9d-e37cf81e0731	Ibadah Kaum Muda (Youth)	2026-02-21	17:00:00	\N	Hall Youth Center	Pdm. Michael	aktif	t	\N	2026-02-10 15:13:32.776646	2026-02-10 15:13:32.776646
fd9f95b6-8fae-40e0-a8f7-d9a7e81dc5b0	Sekolah Minggu	2026-02-15	09:00:00	\N	Kelas Anak	Kak Sarah	aktif	t	\N	2026-02-10 15:13:32.777992	2026-02-10 15:13:32.777992
546f465a-19e3-4496-9a8e-61cd5957c379	Rapat Majelis Gereja	2026-02-22	13:00:00	\N	Ruang Rapat	Bpk. Andreas	aktif	t	\N	2026-02-10 15:13:32.779037	2026-02-10 15:13:32.779037
b7b9f691-8f31-48ee-ab80-4687f7784e41	Seminar Keluarga Bahagia	2026-03-01	10:00:00	\N	Aula Serbaguna	Dr. Robert	aktif	t	\N	2026-02-10 15:13:32.781514	2026-02-10 15:13:32.781514
b1532aaf-fc57-4542-b221-9841ee68a6a6	Doa Pagi	2026-02-16	05:00:00	\N	Gedung Utama	Ibu Elisabeth	aktif	t	\N	2026-02-10 15:13:32.782703	2026-02-10 15:13:32.782703
be04e9b3-5f08-42ab-aac6-c3f08e6dd861	Kunjungan Kasih ke Panti Asuhan	2026-03-05	08:00:00	\N	Titik Kumpul Gereja	Diaken Thomas	aktif	t	\N	2026-02-10 15:13:32.784001	2026-02-10 15:13:32.784001
159df40b-a28a-4490-a74e-228625750e20	Ibadah Ucapan Syukur Bulanan	2026-01-31	19:00:00	\N	Gedung Utama	Pdt. Samuel Johnson	selesai	t	\N	2026-02-10 15:13:32.785517	2026-02-10 15:13:32.785517
\.


--
-- TOC entry 5504 (class 0 OID 25982)
-- Dependencies: 286
-- Data for Name: aktivitas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.aktivitas (id, admin_id, admin_nama, aksi, modul, detail, created_at) FROM stdin;
1	1	\N	TAMBAH	PENGUMUMAN	Membuat pengumuman baru	2026-02-13 00:35:36.273421
2	1	\N	TAMBAH	PENGUMUMAN	Membuat pengumuman baru	2026-02-13 00:44:24.245367
3	2	\N	HAPUS	PENGUMUMAN	Menghapus pengumuman ID: 12	2026-02-13 00:44:46.492711
\.


--
-- TOC entry 5466 (class 0 OID 25578)
-- Dependencies: 248
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.announcements (id, isi, status, tanggal, created_at, created_by) FROM stdin;
1	Ibadah Padang akan dilaksanakan pada bulan depan di Taman Bunga.	publish	2026-02-10 00:00:07.92259	2026-02-10 00:00:07.92259	\N
2	Rapat Evaluasi Majelis diadakan hari Sabtu ini pukul 19.00 WIB.	publish	2026-02-10 00:00:07.937099	2026-02-10 00:00:07.937099	\N
3	Pendaftaran Baptisan Air telah dibuka, harap hubungi sekretariat.	publish	2026-02-10 00:00:07.938334	2026-02-10 00:00:07.938334	\N
4	Persiapan Natal GMMI tahun ini dimulai minggu depan.	draft	2026-02-10 00:00:07.939099	2026-02-10 00:00:07.939099	\N
5	Kerja bakti membersihkan gedung gereja Sabtu pagi.	publish	2026-02-10 00:00:07.939966	2026-02-10 00:00:07.939966	\N
6	Kunjungan kasih ke Panti Asuhan Kasih Bunda.	publish	2026-02-10 00:00:07.94073	2026-02-10 00:00:07.94073	\N
7	Seminar Keluarga Bahagia bersama Pdt. Yudi.	draft	2026-02-10 00:00:07.943627	2026-02-10 00:00:07.943627	\N
8	Donor darah sukarela bekerja sama dengan PMI.	publish	2026-02-10 00:00:07.945911	2026-02-10 00:00:07.945911	\N
9	Latihan gabungan tim musik dan pemuji.	publish	2026-02-10 00:00:07.947165	2026-02-10 00:00:07.947165	\N
10	Doa puasa bersama seluruh jemaat.	publish	2026-02-10 00:00:07.948117	2026-02-10 00:00:07.948117	\N
11	harus banget nih	publish	2026-02-13 00:35:36.24951	2026-02-13 00:35:36.24951	\N
\.


--
-- TOC entry 5448 (class 0 OID 24797)
-- Dependencies: 230
-- Data for Name: arsip_bulanan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.arsip_bulanan (id, bulan, tahun, data, created_by, created_at) FROM stdin;
\.


--
-- TOC entry 5496 (class 0 OID 25880)
-- Dependencies: 278
-- Data for Name: carousel_slides; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carousel_slides (id, title, subtitle, quote, badge, image_url, cta_text, cta_link, order_index, is_active, created_at, updated_at) FROM stdin;
2	Persekutuan & Kasih Persaudaraan	Mengalami kehadiran Tuhan melalui ibadah yang transformatif dan persekutuan yang hangat.	Sebab di mana dua atau tiga orang berkumpul dalam Nama-Ku, di situ Aku ada di tengah-tengah mereka. (Matius 18:20)	Ibadah Setiap Minggu	/img/Carousel 2.jpeg	Hubungi Kami	/kontak	2	t	2026-02-11 17:45:51.095144	2026-02-11 17:45:51.095144
3	Melayani Generasi Bagi Kemuliaan Tuhan	Mempersiapkan setiap jemaat untuk menjadi berkat di tengah-tengah dunia melalui talenta setiap pribadi.	Segala perkara dapat kutanggung di dalam Dia yang memberi kekuatan kepadaku. (Filipi 4:13)	Program Pelayanan	/img/Carousel 3.jpeg	Lihat Program	#program	3	t	2026-02-11 17:45:51.096054	2026-02-11 17:45:51.096054
1	Gereja Masehi Musafir Indonesia	Bersatu dalam kasih, bertumbuh dalam iman, dan melayani dengan segenap hati untuk kemuliaan nama Tuhan.	Kasihilah Tuhan, Allahmu, dengan segenap hatimu dan dengan segenap jiwamu dan dengan segenap akal budimu. (Matius 22:37)	Selamat Datang di Keluarga Allah	/img/Carousel 1.jpeg	Jadwal Ibadah	/jadwal	1	t	2026-02-11 17:45:51.091147	2026-02-11 20:08:22.885466
\.


--
-- TOC entry 5444 (class 0 OID 24720)
-- Dependencies: 226
-- Data for Name: jadwal_ibadah; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jadwal_ibadah (id, jenis_ibadah, tanggal, jam, lokasi, rumah_jemaat, bulan, tahun, created_by, created_at) FROM stdin;
\.


--
-- TOC entry 5454 (class 0 OID 24898)
-- Dependencies: 236
-- Data for Name: jadwal_pelayanan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jadwal_pelayanan (id, nama_kegiatan, tanggal, pelayan, status, created_at) FROM stdin;
\.


--
-- TOC entry 5498 (class 0 OID 25908)
-- Dependencies: 280
-- Data for Name: jemaat; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jemaat (id, nama, tanggal_lahir, jenis_kelamin, pendidikan_terakhir, kategorial, sektor_id, keterangan, created_at, deleted_at, tempat_lahir, pekerjaan_id, pekerjaan) FROM stdin;
5d486826-afdb-4e90-9be1-430540034eda	PETRA MIRACLE ME LENGGU	\N	\N	S1	P_PRIA	da08950e-b152-47c0-8df9-2ce3706918cd	gg	2026-02-11 19:47:27.806464	2026-02-11 19:50:39.156499	\N	\N	\N
be074e5c-3612-4e68-bb0e-7f5e7c455846	Petra Miracle ME	2006-11-20	L	S1	P_PRIA	da08950e-b152-47c0-8df9-2ce3706918cd	bagus dan baik	2026-02-11 19:57:46.062301	\N	Kupang	\N	\N
ef09a4f4-aff2-45f2-8759-d370362c7c74	Tirza Simatupang	1996-07-21	P	SMP	P_WANITA	b7102b36-4fb9-4f40-b5fe-d3e4da497010	Data testing jemaat ke-1	2026-02-11 21:52:09.881406	\N	Pematang Siantar	\N	Guru / Dosen
060c7292-8d88-485f-9873-f553833e8e90	Petrus Sihombing	1967-09-16	L	S2	P_WANITA	da08950e-b152-47c0-8df9-2ce3706918cd	Data testing jemaat ke-2	2026-02-11 21:52:09.978701	\N	Tebing Tinggi	\N	Tenaga Kesehatan
b310db4b-3516-45af-9b21-10e370b83e75	Jeremia Manurung	2019-09-12	L	S2	SM	34f56af9-7df8-4d1c-872a-2bd1888ba3da	Data testing jemaat ke-3	2026-02-11 21:52:09.986687	\N	Pematang Siantar	\N	Guru / Dosen
ccaf6869-2f58-4f72-a938-37691aecf410	Eliezer Hutabarat	2013-10-10	L	SMA	ARMI	fee89f0a-cd91-489d-9d26-1afb88e84f4b	Data testing jemaat ke-4	2026-02-11 21:52:09.994228	\N	Balige	\N	Rohaniawan
178018f2-6758-42be-851a-ee1b4e64b239	Naomi Siahaan	2019-03-07	P	S2	SM	34f56af9-7df8-4d1c-872a-2bd1888ba3da	Data testing jemaat ke-5	2026-02-11 21:52:10.000805	\N	Jakarta	\N	Petani
f63dc3a0-c09b-4132-a67e-f1e534947563	Lea Simanjuntak	1993-01-23	P	S3	P_WANITA	da08950e-b152-47c0-8df9-2ce3706918cd	Data testing jemaat ke-6	2026-02-11 21:52:10.005914	\N	Tebing Tinggi	\N	Nelayan
b20ffb38-3cb8-4945-9955-087ccbe0b7ba	David Panjaitan	2011-07-25	L	SMP	ARMI	87455348-2e6d-4508-9465-993fcd6f4a12	Data testing jemaat ke-7	2026-02-11 21:52:10.011538	\N	Jakarta	\N	PNS
5af093ee-2c42-4376-902c-37fa9129d279	David Panjaitan	2014-05-13	L	TK	SM	da08950e-b152-47c0-8df9-2ce3706918cd	Data testing jemaat ke-8	2026-02-11 21:52:10.017181	\N	Pematang Siantar	\N	Buruh
74b768fb-0968-4249-a3cd-86c12ff35c8e	Hana Hutabarat	2010-01-07	P	TK	ARMI	4c37a136-fedb-4d59-b715-a1ec860914f9	Data testing jemaat ke-9	2026-02-11 21:52:10.021095	\N	Balige	\N	Tenaga Kesehatan
7286e699-dd8c-433c-b0b4-30a4b5b2458c	Rafael Nababan	2016-03-10	L	SMA	SM	1b658897-1ac6-4802-98c3-5b50d4f3f2ec	Data testing jemaat ke-10	2026-02-11 21:52:10.026026	\N	Tanjung Balai	\N	Guru / Dosen
ac970f0a-2547-413d-956e-efdf3667f33e	David Panjaitan	2015-08-08	L	S2	SM	fee89f0a-cd91-489d-9d26-1afb88e84f4b	Data testing jemaat ke-11	2026-02-11 21:52:10.033414	\N	Jakarta	\N	PNS
04335358-48e7-4c27-af56-b27e0fdb7959	Ester Panjaitan	2011-12-14	P	TK	ARMI	b7102b36-4fb9-4f40-b5fe-d3e4da497010	Data testing jemaat ke-12	2026-02-11 21:52:10.038428	\N	Pematang Siantar	\N	Nelayan
6fdf1291-6908-4c43-a677-9dd185af086a	Kaleb Simbolon	1976-10-11	L	SD	P_PRIA	b7102b36-4fb9-4f40-b5fe-d3e4da497010	Data testing jemaat ke-13	2026-02-11 21:52:10.04306	\N	Tanjung Balai	\N	Tenaga Kesehatan
27126b23-fe68-4830-83ac-9995c3481a25	Petrus Sihombing	1957-07-18	L	TK	P_WANITA	4c37a136-fedb-4d59-b715-a1ec860914f9	Data testing jemaat ke-14	2026-02-11 21:52:10.050561	\N	Medan	\N	Petani
cbeb4fb4-5228-4265-b0f0-feca58b9a33f	Hosea Sinaga	2009-03-11	L	S2	ARMI	4c37a136-fedb-4d59-b715-a1ec860914f9	Data testing jemaat ke-15	2026-02-11 21:52:10.053719	\N	Jakarta	\N	Guru / Dosen
781a467f-b68f-4fc5-9c53-6503ed483401	Naomi Siahaan	2015-02-07	P	SD	AMMI	4c37a136-fedb-4d59-b715-a1ec860914f9	Data testing jemaat ke-16	2026-02-11 21:52:10.097675	\N	Tebing Tinggi	\N	Tenaga Kesehatan
1059fcc3-3dae-446f-a654-31588ccf577a	Eliezer Hutabarat	2018-12-25	L	S2	SM	4c37a136-fedb-4d59-b715-a1ec860914f9	Data testing jemaat ke-17	2026-02-11 21:52:10.10232	\N	Tarutung	\N	PNS
2dc09517-2975-4ce2-aee1-ecdb7f216d3b	Gabriel Simanjuntak	1983-05-16	L	SMA	P_PRIA	fee89f0a-cd91-489d-9d26-1afb88e84f4b	Data testing jemaat ke-18	2026-02-11 21:52:10.105746	\N	Padang Sidempuan	\N	Lainnya
a5b34c60-9849-42f2-a934-64aa2c9b2586	Rafael Nababan	2014-09-22	L	SMP	SM	b7102b36-4fb9-4f40-b5fe-d3e4da497010	Data testing jemaat ke-19	2026-02-11 21:52:10.116096	\N	Balige	\N	TNI / POLRI
ed55df65-e4a6-4d5b-a79c-bdef160cb775	Hana Hutabarat	2020-01-28	P	S2	AMMI	da08950e-b152-47c0-8df9-2ce3706918cd	Data testing jemaat ke-20	2026-02-11 21:52:10.120905	\N	Tebing Tinggi	\N	Nelayan
f6cbc2e5-aa0e-45e9-b8a5-c6ed5b10877e	Kaleb Simbolon	2016-03-08	L	TK	SM	da08950e-b152-47c0-8df9-2ce3706918cd	Data testing jemaat ke-1	2026-02-11 21:53:43.787853	\N	Tebing Tinggi	\N	Tenaga Kesehatan
c2cb4795-4b18-4e8e-8022-a808394cd3ef	Lukas Tampubolon	1983-04-03	L	S2	P_WANITA	fee89f0a-cd91-489d-9d26-1afb88e84f4b	Data testing jemaat ke-2	2026-02-11 21:53:43.86344	\N	Balige	\N	Lainnya
af0526ce-7e57-421c-99ec-ce31f49f886a	Tabita Tampubolon	1990-12-11	P	SMP	P_PRIA	4c37a136-fedb-4d59-b715-a1ec860914f9	Data testing jemaat ke-3	2026-02-11 21:53:43.870665	\N	Tarutung	\N	Nelayan
61156a38-b455-4a46-929b-7176197811b3	Hosea Sinaga	1964-09-03	L	S2	P_PRIA	b7102b36-4fb9-4f40-b5fe-d3e4da497010	Data testing jemaat ke-4	2026-02-11 21:53:43.875971	\N	Tarutung	\N	PNS
7e1e16fe-1680-4b39-80c8-b3ea1bb6d728	Hana Hutabarat	1967-05-25	P	TK	P_PRIA	b7102b36-4fb9-4f40-b5fe-d3e4da497010	Data testing jemaat ke-5	2026-02-11 21:53:43.879796	\N	Jakarta	\N	Lainnya
a8b399a5-cef3-43dc-a2a4-d915b2665806	Naomi Siahaan	2013-05-23	P	SD	ARMI	1b658897-1ac6-4802-98c3-5b50d4f3f2ec	Data testing jemaat ke-6	2026-02-11 21:53:43.884396	\N	Tebing Tinggi	\N	PNS
a559fedc-caea-4ae1-a63f-c722c0b298fa	Kaleb Simbolon	2014-06-06	L	TK	AMMI	b7102b36-4fb9-4f40-b5fe-d3e4da497010	Data testing jemaat ke-7	2026-02-11 21:53:43.889542	\N	Binjai	\N	Nelayan
4150e1fa-f704-4e83-bd7e-9ce964a23801	Ester Panjaitan	2021-11-07	P	SMA	SM	1b658897-1ac6-4802-98c3-5b50d4f3f2ec	Data testing jemaat ke-8	2026-02-11 21:53:43.892917	\N	Sibolga	\N	PNS
a5448922-3ee8-45d9-88c9-eef3d759e07c	Gabriel Simanjuntak	2019-03-09	L	TK	SM	b7102b36-4fb9-4f40-b5fe-d3e4da497010	Data testing jemaat ke-9	2026-02-11 21:53:43.896176	\N	Jakarta	\N	Lainnya
32d59450-e716-4cb9-808e-6106a4b7ee63	Debora Sitorus	1986-04-01	P	SD	P_WANITA	b7102b36-4fb9-4f40-b5fe-d3e4da497010	Data testing jemaat ke-10	2026-02-11 21:53:43.90965	\N	Tebing Tinggi	\N	Lainnya
1535780a-fbac-4864-a5f0-30472bff6901	Petrus Sihombing	2021-02-16	L	S1	AMMI	87455348-2e6d-4508-9465-993fcd6f4a12	Data testing jemaat ke-11	2026-02-11 21:53:43.915265	\N	Binjai	\N	PNS
6149a7dd-21b0-496e-83ae-829068099f75	Gabriel Simanjuntak	1987-08-03	L	SD	P_WANITA	fee89f0a-cd91-489d-9d26-1afb88e84f4b	Data testing jemaat ke-12	2026-02-11 21:53:43.92028	\N	Padang Sidempuan	\N	Buruh
adb2b8cf-7649-4754-b12b-21f490780215	Sara Simbolon	2018-07-05	P	S1	AMMI	4c37a136-fedb-4d59-b715-a1ec860914f9	Data testing jemaat ke-13	2026-02-11 21:53:43.924671	\N	Pematang Siantar	\N	Tenaga Kesehatan
486a31ce-6c57-4379-9d6e-1ca0ab55aeff	Obaja Situmorang	2013-04-25	L	TK	ARMI	4c37a136-fedb-4d59-b715-a1ec860914f9	Data testing jemaat ke-14	2026-02-11 21:53:43.930283	\N	Tarutung	\N	PNS
3fb1229b-04b3-449e-8f4a-0d0312b52612	Nathanael Pardede	1960-01-28	L	SD	P_WANITA	4c37a136-fedb-4d59-b715-a1ec860914f9	Data testing jemaat ke-15	2026-02-11 21:53:43.936394	\N	Medan	\N	Petani
5fcd1cf8-5f82-4240-a95a-768c971a60ad	Naomi Siahaan	1983-06-22	P	SD	P_WANITA	da08950e-b152-47c0-8df9-2ce3706918cd	Data testing jemaat ke-16	2026-02-11 21:53:43.939985	\N	Tebing Tinggi	\N	Petani
0aa2f940-6f71-439e-988b-fa78e7a79d68	Nathanael Pardede	2011-07-17	L	TK	ARMI	87455348-2e6d-4508-9465-993fcd6f4a12	Data testing jemaat ke-17	2026-02-11 21:53:43.943041	\N	Medan	\N	Buruh
59b88024-d8c8-475e-92c9-02312c5ab7f1	Debora Sitorus	1982-04-04	P	S1	P_PRIA	fee89f0a-cd91-489d-9d26-1afb88e84f4b	Data testing jemaat ke-18	2026-02-11 21:53:43.94739	\N	Balige	\N	Lainnya
1184a123-0e75-4229-b646-77cd07c140ff	Tirza Simatupang	2020-07-15	P	S2	SM	b7102b36-4fb9-4f40-b5fe-d3e4da497010	Data testing jemaat ke-19	2026-02-11 21:53:43.951526	\N	Balige	\N	Lainnya
38c43319-e80b-4625-a3cc-d4eb9f49b9dc	Petrus Sihombing	2020-08-08	L	S3	AMMI	1b658897-1ac6-4802-98c3-5b50d4f3f2ec	Data testing jemaat ke-20	2026-02-11 21:53:43.955748	\N	Binjai	\N	Guru / Dosen
\.


--
-- TOC entry 5500 (class 0 OID 25947)
-- Dependencies: 282
-- Data for Name: jemaat_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jemaat_history (id, jemaat_id, perubahan, changed_by, changed_at) FROM stdin;
\.


--
-- TOC entry 5499 (class 0 OID 25928)
-- Dependencies: 281
-- Data for Name: jemaat_sakramen; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jemaat_sakramen (id, jemaat_id, bpts, sidi, nikah, meninggal, updated_at) FROM stdin;
c9e3acce-9846-43cd-afb9-f3252e5b6872	5d486826-afdb-4e90-9be1-430540034eda	t	f	f	f	2026-02-11 19:47:27.806464
b190161f-42cc-4429-afef-922a89775ae5	be074e5c-3612-4e68-bb0e-7f5e7c455846	t	f	f	f	2026-02-11 19:57:46.062301
6bd31407-7fbc-43ad-bd1d-60bd90e55fea	ef09a4f4-aff2-45f2-8759-d370362c7c74	f	t	t	f	2026-02-11 21:52:09.881406
7a184c1a-6f3c-4494-8243-603896525e21	060c7292-8d88-485f-9873-f553833e8e90	t	t	t	f	2026-02-11 21:52:09.978701
9a875511-b5d6-4d23-9b96-ba950b9eb928	b310db4b-3516-45af-9b21-10e370b83e75	t	f	f	f	2026-02-11 21:52:09.986687
d9f0c078-e157-4c30-bf42-e123abfc9875	ccaf6869-2f58-4f72-a938-37691aecf410	t	t	f	f	2026-02-11 21:52:09.994228
39d595f4-19b0-4342-b890-31edcfb321a7	178018f2-6758-42be-851a-ee1b4e64b239	t	t	f	f	2026-02-11 21:52:10.000805
b043db16-2254-4c5f-bc67-a59a33098b34	f63dc3a0-c09b-4132-a67e-f1e534947563	t	f	t	f	2026-02-11 21:52:10.005914
c76fa97f-230e-407d-b1f1-61f55d851b66	b20ffb38-3cb8-4945-9955-087ccbe0b7ba	f	f	f	f	2026-02-11 21:52:10.011538
300a4017-bf97-41cd-8dfd-7d36c8c17d0c	5af093ee-2c42-4376-902c-37fa9129d279	f	t	f	f	2026-02-11 21:52:10.017181
c5ff9014-fb87-423a-89fe-615cf73f28af	74b768fb-0968-4249-a3cd-86c12ff35c8e	f	t	f	f	2026-02-11 21:52:10.021095
dbd0d05b-e00c-4524-9c48-9828bca0341f	7286e699-dd8c-433c-b0b4-30a4b5b2458c	f	f	f	f	2026-02-11 21:52:10.026026
275ccc3e-2ada-4f19-b53c-84b5d539dce4	ac970f0a-2547-413d-956e-efdf3667f33e	t	t	f	f	2026-02-11 21:52:10.033414
cb28d35e-2744-4e77-9134-a2d23df0405d	04335358-48e7-4c27-af56-b27e0fdb7959	t	f	f	f	2026-02-11 21:52:10.038428
173f1ad5-0f0a-4d20-afbc-f8ec2f22b306	6fdf1291-6908-4c43-a677-9dd185af086a	t	t	f	f	2026-02-11 21:52:10.04306
836d26d3-a569-427a-8915-987e83bce19d	27126b23-fe68-4830-83ac-9995c3481a25	t	f	t	f	2026-02-11 21:52:10.050561
644507e2-974e-4f35-ae00-915bdebb89b6	cbeb4fb4-5228-4265-b0f0-feca58b9a33f	f	t	f	f	2026-02-11 21:52:10.053719
918517e0-fda8-43f3-ba1b-999b7105ad64	781a467f-b68f-4fc5-9c53-6503ed483401	t	f	f	f	2026-02-11 21:52:10.097675
99613262-d7f4-46fe-b129-3cc35418616d	1059fcc3-3dae-446f-a654-31588ccf577a	t	t	f	f	2026-02-11 21:52:10.10232
c56691d3-18b6-4111-8e70-0dac23d6a22d	2dc09517-2975-4ce2-aee1-ecdb7f216d3b	f	t	t	f	2026-02-11 21:52:10.105746
738c59c0-6740-4ae8-a8c8-4dcf5597c589	a5b34c60-9849-42f2-a934-64aa2c9b2586	t	f	f	f	2026-02-11 21:52:10.116096
556a9238-2d64-42ef-a2ae-30b15de61f41	ed55df65-e4a6-4d5b-a79c-bdef160cb775	t	f	f	f	2026-02-11 21:52:10.120905
98a51bca-63e4-4342-8341-8a092f785a03	f6cbc2e5-aa0e-45e9-b8a5-c6ed5b10877e	t	t	f	f	2026-02-11 21:53:43.787853
4980455e-51d9-410f-8fd9-b49b576f1c5e	c2cb4795-4b18-4e8e-8022-a808394cd3ef	t	f	t	f	2026-02-11 21:53:43.86344
6fb45e36-a10c-4d83-9f84-50059ec2d097	af0526ce-7e57-421c-99ec-ce31f49f886a	t	f	f	f	2026-02-11 21:53:43.870665
05005c28-43a6-467a-88b5-4a378dc736cd	61156a38-b455-4a46-929b-7176197811b3	t	t	t	f	2026-02-11 21:53:43.875971
16f89f2f-34cd-47a1-bcfb-cea310684aac	7e1e16fe-1680-4b39-80c8-b3ea1bb6d728	t	t	t	f	2026-02-11 21:53:43.879796
fc221592-2987-40e4-a676-dae2ee0ea91b	a8b399a5-cef3-43dc-a2a4-d915b2665806	t	t	f	f	2026-02-11 21:53:43.884396
91d73aba-0650-4364-8f53-875efb9a9438	a559fedc-caea-4ae1-a63f-c722c0b298fa	t	t	f	f	2026-02-11 21:53:43.889542
b6e4631d-78ad-4fff-8ca6-068ea5f8936d	4150e1fa-f704-4e83-bd7e-9ce964a23801	t	t	f	f	2026-02-11 21:53:43.892917
6951e6bb-b94b-4e60-80c1-69ac8f7b9542	a5448922-3ee8-45d9-88c9-eef3d759e07c	t	f	f	f	2026-02-11 21:53:43.896176
35cfe7bb-d707-48a2-960a-1fa84f01a4bb	32d59450-e716-4cb9-808e-6106a4b7ee63	f	t	f	f	2026-02-11 21:53:43.90965
4a7ecdac-69db-43f8-83c9-8afbcbc2fe2e	1535780a-fbac-4864-a5f0-30472bff6901	f	t	f	f	2026-02-11 21:53:43.915265
653bfbe9-75b3-4371-8d5f-36fad7707e4b	6149a7dd-21b0-496e-83ae-829068099f75	t	f	f	f	2026-02-11 21:53:43.92028
685b95e9-0dec-4810-8d5a-dda804446656	adb2b8cf-7649-4754-b12b-21f490780215	f	t	f	f	2026-02-11 21:53:43.924671
29edfd83-716b-4d96-9ab5-632a89b629d6	486a31ce-6c57-4379-9d6e-1ca0ab55aeff	f	t	f	f	2026-02-11 21:53:43.930283
eab1c61b-76f3-4157-bec0-dfe07ea652d3	3fb1229b-04b3-449e-8f4a-0d0312b52612	t	f	f	f	2026-02-11 21:53:43.936394
ab99db29-4528-4f9f-a808-37bb4c16cfa6	5fcd1cf8-5f82-4240-a95a-768c971a60ad	t	t	t	f	2026-02-11 21:53:43.939985
a3a08d92-d748-4896-9027-99072f3a1f65	0aa2f940-6f71-439e-988b-fa78e7a79d68	t	t	f	f	2026-02-11 21:53:43.943041
dd22d41b-2c1d-428f-8000-29d762b8a8e8	59b88024-d8c8-475e-92c9-02312c5ab7f1	t	f	t	f	2026-02-11 21:53:43.94739
4649a128-4dbf-4d4d-863e-da096e1b8a36	1184a123-0e75-4229-b646-77cd07c140ff	f	t	f	f	2026-02-11 21:53:43.951526
9a6e1f43-0a2d-4528-8920-97faf29c9bd3	38c43319-e80b-4625-a3cc-d4eb9f49b9dc	t	f	f	f	2026-02-11 21:53:43.955748
\.


--
-- TOC entry 5446 (class 0 OID 24779)
-- Dependencies: 228
-- Data for Name: kegiatan_bulanan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kegiatan_bulanan (id, bulan, tahun, deskripsi, created_by, created_at) FROM stdin;
\.


--
-- TOC entry 5493 (class 0 OID 25821)
-- Dependencies: 275
-- Data for Name: keuangan_laporan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.keuangan_laporan (id, periode_awal, periode_akhir, tanggal_transaksi, urutan, keterangan, jenis_transaksi, kas_penerimaan, kas_pengeluaran, bank_debit, bank_kredit, created_by, created_at) FROM stdin;
\.


--
-- TOC entry 5494 (class 0 OID 25861)
-- Dependencies: 276
-- Data for Name: laporan_keuangan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.laporan_keuangan (id, tanggal, keterangan, kas_penerimaan, kas_pengeluaran, bank_debit, bank_kredit, created_by, created_at, updated_at) FROM stdin;
a6685160-ae85-4b86-9992-89ab5cc33402	2024-02-01	Saldo Awal Kas Bulan Februari	5000000.00	0.00	0.00	0.00	\N	2026-02-10 16:07:43.202464	2026-02-10 16:07:43.202464
68a59c66-ca6a-4f47-a747-6aea998a917a	2024-02-01	Saldo Awal Rekening Bank Februari	0.00	0.00	15000000.00	0.00	\N	2026-02-10 16:07:43.308628	2026-02-10 16:07:43.308628
b852bc6e-728d-450d-8aef-4e76a7b56860	2024-02-04	Kolekte Ibadah Raya Minggu 1	2500000.00	0.00	0.00	0.00	\N	2026-02-10 16:07:43.315325	2026-02-10 16:07:43.315325
7c89e186-79f1-4ac1-bc3d-70436276ebdb	2024-02-05	Pembayaran Tagihan Listrik & Air Gereja	0.00	750000.00	0.00	0.00	\N	2026-02-10 16:07:43.321921	2026-02-10 16:07:43.321921
af461121-6c23-4783-b277-79364107c0ad	2024-02-07	Persembahan Syukur Bpk. Budi via Transfer	0.00	0.00	1000000.00	0.00	\N	2026-02-10 16:07:43.327984	2026-02-10 16:07:43.327984
96e74a40-068b-4657-8d6b-4790970790a7	2024-02-10	Konsumsi Rapat Majelis	0.00	300000.00	0.00	0.00	\N	2026-02-10 16:07:43.335897	2026-02-10 16:07:43.335897
8aac6739-3548-4ccd-a599-3e803b540fe4	2024-02-11	Kolekte Ibadah Raya Minggu 2	2800000.00	0.00	0.00	0.00	\N	2026-02-10 16:07:43.343084	2026-02-10 16:07:43.343084
d19f2c3d-94e5-4191-ac50-d0e9be1f1ef9	2024-02-12	Service & Maintenance AC (Transfer Vendor)	0.00	0.00	0.00	1500000.00	\N	2026-02-10 16:07:43.353148	2026-02-10 16:07:43.353148
302dab22-3d4f-4366-95c3-0c2ee129fc0a	2024-02-14	Bantuan Diakonia Sakit (Ibu Susi)	0.00	500000.00	0.00	0.00	\N	2026-02-10 16:07:43.363188	2026-02-10 16:07:43.363188
893b6dfd-52f3-43b0-8116-51629e0a81f0	2024-02-15	Bunga Bank Bulan Februari	0.00	0.00	25000.00	0.00	\N	2026-02-10 16:07:43.369534	2026-02-10 16:07:43.369534
\.


--
-- TOC entry 5450 (class 0 OID 24815)
-- Dependencies: 232
-- Data for Name: log_notifikasi; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.log_notifikasi (id, jadwal_id, no_hp, status, created_at) FROM stdin;
\.


--
-- TOC entry 5502 (class 0 OID 25963)
-- Dependencies: 284
-- Data for Name: pekerjaan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pekerjaan (id, nama_pekerjaan, created_at) FROM stdin;
1	Pelajar	2026-02-11 20:26:00.230518
2	Mahasiswa	2026-02-11 20:26:00.230518
3	PNS	2026-02-11 20:26:00.230518
4	Guru	2026-02-11 20:26:00.230518
5	Dosen	2026-02-11 20:26:00.230518
6	Pendeta	2026-02-11 20:26:00.230518
7	Penginjil	2026-02-11 20:26:00.230518
8	Tenaga Kesehatan	2026-02-11 20:26:00.230518
9	Perawat	2026-02-11 20:26:00.230518
10	Dokter	2026-02-11 20:26:00.230518
11	Bidan	2026-02-11 20:26:00.230518
12	Petani	2026-02-11 20:26:00.230518
13	Nelayan	2026-02-11 20:26:00.230518
14	Buruh	2026-02-11 20:26:00.230518
15	Karyawan Swasta	2026-02-11 20:26:00.230518
16	Wiraswasta	2026-02-11 20:26:00.230518
17	Pedagang	2026-02-11 20:26:00.230518
18	Pengusaha	2026-02-11 20:26:00.230518
19	Supir	2026-02-11 20:26:00.230518
20	Ojek Online	2026-02-11 20:26:00.230518
21	Tukang	2026-02-11 20:26:00.230518
22	Satpam	2026-02-11 20:26:00.230518
23	Polisi	2026-02-11 20:26:00.230518
24	TNI	2026-02-11 20:26:00.230518
25	Ibu Rumah Tangga	2026-02-11 20:26:00.230518
26	Pensiunan	2026-02-11 20:26:00.230518
27	Tidak Bekerja	2026-02-11 20:26:00.230518
28	Lainnya	2026-02-11 20:26:00.230518
33	Polri	2026-02-11 20:46:07.090289
48	Belum Bekerja	2026-02-11 20:46:07.100605
\.


--
-- TOC entry 5442 (class 0 OID 24702)
-- Dependencies: 224
-- Data for Name: pengumuman; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pengumuman (id, judul, isi, created_by, created_at) FROM stdin;
\.


--
-- TOC entry 5470 (class 0 OID 25624)
-- Dependencies: 252
-- Data for Name: pewartaan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pewartaan (id, judul, tanggal_ibadah, hari, tempat_jemaat, ayat_firman, tema_khotbah, status, created_at, updated_at) FROM stdin;
2	Warta Jemaat - Minggu ke-2	2026-02-02	Minggu	Gedung Gereja Utama	Mazmur 23:2	Kasih yang Memulihkan	draft	2026-02-10 00:00:08.28935	2026-02-10 00:00:08.28935
3	Warta Jemaat - Minggu ke-3	2026-01-26	Minggu	Gedung Gereja Utama	Mazmur 23:3	Menjadi Garam Dunia	approved	2026-02-10 00:00:08.295684	2026-02-10 00:00:08.295684
4	Warta Jemaat - Minggu ke-4	2026-01-19	Minggu	Gedung Gereja Utama	Mazmur 23:4	Iman dan Perbuatan	approved	2026-02-10 00:00:08.299272	2026-02-10 00:00:08.299272
5	Warta Jemaat - Minggu ke-5	2026-01-12	Minggu	Gedung Gereja Utama	Mazmur 23:5	Kesetiaan dalam Perkara Kecil	approved	2026-02-10 00:00:08.301714	2026-02-10 00:00:08.301714
6	Warta Jemaat - Minggu ke-6	2026-01-05	Minggu	Gedung Gereja Utama	Mazmur 23:6	Keluarga Allah	approved	2026-02-10 00:00:08.304348	2026-02-10 00:00:08.304348
7	Warta Jemaat - Minggu ke-7	2025-12-29	Minggu	Gedung Gereja Utama	Mazmur 23:7	Pengharapan yang Hidup	approved	2026-02-10 00:00:08.307122	2026-02-10 00:00:08.307122
8	Warta Jemaat - Minggu ke-8	2025-12-22	Minggu	Gedung Gereja Utama	Mazmur 23:8	Kuasa Doa	approved	2026-02-10 00:00:08.314162	2026-02-10 00:00:08.314162
9	Warta Jemaat - Minggu ke-9	2025-12-15	Minggu	Gedung Gereja Utama	Mazmur 23:9	Melayani dengan Hati	approved	2026-02-10 00:00:08.319983	2026-02-10 00:00:08.319983
10	Warta Jemaat - Minggu ke-10	2025-12-08	Minggu	Gedung Gereja Utama	Mazmur 23:10	Buah Roh Kudus	approved	2026-02-10 00:00:08.329561	2026-02-10 00:00:08.329561
1	Warta Jemaat - Minggu ke-1	2026-02-09	Minggu	Gedung Gereja Utama	Mazmur 23:1	Hidup Baru dalam Kristus	approved	2026-02-10 00:00:08.26228	2026-02-10 21:32:14.990448
11	Tata Ibadah	2026-02-15		GMMI Pusat	Yohanes 3:16	huhdwc ;wiohokhfdksvknkfne	draft	2026-02-12 14:08:25.129007	2026-02-12 14:08:25.129007
\.


--
-- TOC entry 5484 (class 0 OID 25729)
-- Dependencies: 266
-- Data for Name: pewartaan_info_ibadah; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pewartaan_info_ibadah (id, pewartaan_id, tanggal, jam, jenis_ibadah, pemimpin, sektor) FROM stdin;
1	1	2026-02-09	09:00	Ibadah Raya	Pdt. Yudi	Semua Sektor
2	2	2026-02-02	09:00	Ibadah Raya	Pdt. Yudi	Semua Sektor
3	3	2026-01-26	09:00	Ibadah Raya	Pdt. Yudi	Semua Sektor
4	4	2026-01-19	09:00	Ibadah Raya	Pdt. Yudi	Semua Sektor
5	5	2026-01-12	09:00	Ibadah Raya	Pdt. Yudi	Semua Sektor
6	6	2026-01-05	09:00	Ibadah Raya	Pdt. Yudi	Semua Sektor
7	7	2025-12-29	09:00	Ibadah Raya	Pdt. Yudi	Semua Sektor
8	8	2025-12-22	09:00	Ibadah Raya	Pdt. Yudi	Semua Sektor
9	9	2025-12-15	09:00	Ibadah Raya	Pdt. Yudi	Semua Sektor
10	10	2025-12-08	09:00	Ibadah Raya	Pdt. Yudi	Semua Sektor
\.


--
-- TOC entry 5478 (class 0 OID 25684)
-- Dependencies: 260
-- Data for Name: pewartaan_jemaat_sakit; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pewartaan_jemaat_sakit (id, pewartaan_id, nama_jemaat, keterangan) FROM stdin;
\.


--
-- TOC entry 5476 (class 0 OID 25669)
-- Dependencies: 258
-- Data for Name: pewartaan_jemaat_ultah; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pewartaan_jemaat_ultah (id, pewartaan_id, tanggal, nama_jemaat, keterangan) FROM stdin;
1	1	2026-02-09	Sdr. Kevin	HUT ke-25
2	2	2026-02-02	Sdr. Kevin	HUT ke-25
3	3	2026-01-26	Sdr. Kevin	HUT ke-25
4	4	2026-01-19	Sdr. Kevin	HUT ke-25
5	5	2026-01-12	Sdr. Kevin	HUT ke-25
6	6	2026-01-05	Sdr. Kevin	HUT ke-25
7	7	2025-12-29	Sdr. Kevin	HUT ke-25
8	8	2025-12-22	Sdr. Kevin	HUT ke-25
9	9	2025-12-15	Sdr. Kevin	HUT ke-25
10	10	2025-12-08	Sdr. Kevin	HUT ke-25
\.


--
-- TOC entry 5482 (class 0 OID 25714)
-- Dependencies: 264
-- Data for Name: pewartaan_lansia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pewartaan_lansia (id, pewartaan_id, nama_jemaat, keterangan) FROM stdin;
\.


--
-- TOC entry 5488 (class 0 OID 25759)
-- Dependencies: 270
-- Data for Name: pewartaan_pelayanan_kategorial; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pewartaan_pelayanan_kategorial (id, pewartaan_id, tanggal_waktu, kategori_pelayanan, tempat, pemimpin, liturgos_petugas) FROM stdin;
\.


--
-- TOC entry 5486 (class 0 OID 25744)
-- Dependencies: 268
-- Data for Name: pewartaan_pelayanan_sektor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pewartaan_pelayanan_sektor (id, pewartaan_id, nomor_sektor, tempat, pemimpin, liturgos, nomor_hp) FROM stdin;
1	1	Sektor 1	Kel. Bpk. Andi	Dkn. Budi	\N	\N
2	1	Sektor 2	Kel. Ibu Susi	Dkn. Tono	\N	\N
3	2	Sektor 1	Kel. Bpk. Andi	Dkn. Budi	\N	\N
4	2	Sektor 2	Kel. Ibu Susi	Dkn. Tono	\N	\N
5	3	Sektor 1	Kel. Bpk. Andi	Dkn. Budi	\N	\N
6	3	Sektor 2	Kel. Ibu Susi	Dkn. Tono	\N	\N
7	4	Sektor 1	Kel. Bpk. Andi	Dkn. Budi	\N	\N
8	4	Sektor 2	Kel. Ibu Susi	Dkn. Tono	\N	\N
9	5	Sektor 1	Kel. Bpk. Andi	Dkn. Budi	\N	\N
10	5	Sektor 2	Kel. Ibu Susi	Dkn. Tono	\N	\N
11	6	Sektor 1	Kel. Bpk. Andi	Dkn. Budi	\N	\N
12	6	Sektor 2	Kel. Ibu Susi	Dkn. Tono	\N	\N
13	7	Sektor 1	Kel. Bpk. Andi	Dkn. Budi	\N	\N
14	7	Sektor 2	Kel. Ibu Susi	Dkn. Tono	\N	\N
15	8	Sektor 1	Kel. Bpk. Andi	Dkn. Budi	\N	\N
16	8	Sektor 2	Kel. Ibu Susi	Dkn. Tono	\N	\N
17	9	Sektor 1	Kel. Bpk. Andi	Dkn. Budi	\N	\N
18	9	Sektor 2	Kel. Ibu Susi	Dkn. Tono	\N	\N
19	10	Sektor 1	Kel. Bpk. Andi	Dkn. Budi	\N	\N
20	10	Sektor 2	Kel. Ibu Susi	Dkn. Tono	\N	\N
\.


--
-- TOC entry 5480 (class 0 OID 25699)
-- Dependencies: 262
-- Data for Name: pewartaan_pemulihan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pewartaan_pemulihan (id, pewartaan_id, nama_jemaat, keterangan) FROM stdin;
\.


--
-- TOC entry 5474 (class 0 OID 25654)
-- Dependencies: 256
-- Data for Name: pewartaan_pokok_doa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pewartaan_pokok_doa (id, pewartaan_id, kategori, keterangan) FROM stdin;
1	1	Bangsa & Negara	Berdoa untuk persatuan bangsa
2	1	Gereja	Pertumbuhan iman jemaat
3	2	Bangsa & Negara	Berdoa untuk persatuan bangsa
4	2	Gereja	Pertumbuhan iman jemaat
5	3	Bangsa & Negara	Berdoa untuk persatuan bangsa
6	3	Gereja	Pertumbuhan iman jemaat
7	4	Bangsa & Negara	Berdoa untuk persatuan bangsa
8	4	Gereja	Pertumbuhan iman jemaat
9	5	Bangsa & Negara	Berdoa untuk persatuan bangsa
10	5	Gereja	Pertumbuhan iman jemaat
11	6	Bangsa & Negara	Berdoa untuk persatuan bangsa
12	6	Gereja	Pertumbuhan iman jemaat
13	7	Bangsa & Negara	Berdoa untuk persatuan bangsa
14	7	Gereja	Pertumbuhan iman jemaat
15	8	Bangsa & Negara	Berdoa untuk persatuan bangsa
16	8	Gereja	Pertumbuhan iman jemaat
17	9	Bangsa & Negara	Berdoa untuk persatuan bangsa
18	9	Gereja	Pertumbuhan iman jemaat
19	10	Bangsa & Negara	Berdoa untuk persatuan bangsa
20	10	Gereja	Pertumbuhan iman jemaat
\.


--
-- TOC entry 5472 (class 0 OID 25639)
-- Dependencies: 254
-- Data for Name: pewartaan_tata_ibadah; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pewartaan_tata_ibadah (id, pewartaan_id, urutan, nama_bagian, keterangan, judul_pujian, isi_konten) FROM stdin;
1	1	1	Pujian Pembukaan	Berdiri	Ku Masuk Ruang Maha Kudus	\N
2	1	2	Votum & Salam	Jemaat Berdiri	\N	\N
3	1	3	Pujian Penyembahan	Duduk	Bagaikan Bejana	\N
4	2	1	Pujian Pembukaan	Berdiri	Ku Masuk Ruang Maha Kudus	\N
5	2	2	Votum & Salam	Jemaat Berdiri	\N	\N
6	2	3	Pujian Penyembahan	Duduk	Bagaikan Bejana	\N
7	3	1	Pujian Pembukaan	Berdiri	Ku Masuk Ruang Maha Kudus	\N
8	3	2	Votum & Salam	Jemaat Berdiri	\N	\N
9	3	3	Pujian Penyembahan	Duduk	Bagaikan Bejana	\N
10	4	1	Pujian Pembukaan	Berdiri	Ku Masuk Ruang Maha Kudus	\N
11	4	2	Votum & Salam	Jemaat Berdiri	\N	\N
12	4	3	Pujian Penyembahan	Duduk	Bagaikan Bejana	\N
13	5	1	Pujian Pembukaan	Berdiri	Ku Masuk Ruang Maha Kudus	\N
14	5	2	Votum & Salam	Jemaat Berdiri	\N	\N
15	5	3	Pujian Penyembahan	Duduk	Bagaikan Bejana	\N
16	6	1	Pujian Pembukaan	Berdiri	Ku Masuk Ruang Maha Kudus	\N
17	6	2	Votum & Salam	Jemaat Berdiri	\N	\N
18	6	3	Pujian Penyembahan	Duduk	Bagaikan Bejana	\N
19	7	1	Pujian Pembukaan	Berdiri	Ku Masuk Ruang Maha Kudus	\N
20	7	2	Votum & Salam	Jemaat Berdiri	\N	\N
21	7	3	Pujian Penyembahan	Duduk	Bagaikan Bejana	\N
22	8	1	Pujian Pembukaan	Berdiri	Ku Masuk Ruang Maha Kudus	\N
23	8	2	Votum & Salam	Jemaat Berdiri	\N	\N
24	8	3	Pujian Penyembahan	Duduk	Bagaikan Bejana	\N
25	9	1	Pujian Pembukaan	Berdiri	Ku Masuk Ruang Maha Kudus	\N
26	9	2	Votum & Salam	Jemaat Berdiri	\N	\N
27	9	3	Pujian Penyembahan	Duduk	Bagaikan Bejana	\N
28	10	1	Pujian Pembukaan	Berdiri	Ku Masuk Ruang Maha Kudus	\N
29	10	2	Votum & Salam	Jemaat Berdiri	\N	\N
30	10	3	Pujian Penyembahan	Duduk	Bagaikan Bejana	\N
31	11	1	Saat Teduh	Jemaat Berdiri	smsksk	skksks
\.


--
-- TOC entry 5468 (class 0 OID 25592)
-- Dependencies: 250
-- Data for Name: program_kegiatan_gereja; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.program_kegiatan_gereja (id, bidang, sub_bidang, nama_program, jenis_kegiatan, volume, waktu_pelaksanaan, rencana_biaya, keterangan, created_at, updated_at) FROM stdin;
1	Pewartaan	\N	Khotbah Minggu	Ibadah Raya	52	Setiap Minggu	5000000.00	\N	2026-02-10 00:00:07.974646	2026-02-10 00:00:07.974646
2	Persekutuan	\N	Ibadah Kaum Wanita	Persekutuan Doa	12	Bulanan	1200000.00	\N	2026-02-10 00:00:07.982932	2026-02-10 00:00:07.982932
3	Pelayanan	\N	Bantuan Sembako	Diakonia	4	Triwulan	10000000.00	\N	2026-02-10 00:00:07.983862	2026-02-10 00:00:07.983862
4	Pendidikan	\N	Sekolah Minggu	Pengajaran Anak	52	Setiap Minggu	3000000.00	\N	2026-02-10 00:00:07.984513	2026-02-10 00:00:07.984513
5	Penatalayanan	Sarana Prasarana	Renovasi Atap	Pembangunan	1	Juni 2024	25000000.00	\N	2026-02-10 00:00:07.985381	2026-02-10 00:00:07.985381
6	Pewartaan	\N	KKR Pemuda	Kebaktian Kebangunan Rohani	1	Agustus 2024	15000000.00	\N	2026-02-10 00:00:07.986018	2026-02-10 00:00:07.986018
7	Persekutuan	\N	Retreat Majelis	Pembinaan	1	Oktober 2024	20000000.00	\N	2026-02-10 00:00:07.98655	2026-02-10 00:00:07.98655
8	Pelayanan	\N	Kunjungan Orang Sakit	Pastoral	24	Kondisional	2400000.00	\N	2026-02-10 00:00:07.986976	2026-02-10 00:00:07.986976
9	Pendidikan	\N	Katekisasi	Kelas Persiapan Baptisan	2	Semester	500000.00	\N	2026-02-10 00:00:07.987356	2026-02-10 00:00:07.987356
10	Penatalayanan	Administrasi	Pengadaan Komputer	Inventaris	2	April 2024	15000000.00	\N	2026-02-10 00:00:07.987734	2026-02-10 00:00:07.987734
11	Sekretariat	\N	Kegiatan Rutin	Pembuatan /Foto copy Jadwal ibadah untuk semua jenis ibdah selama 1 tahun	1	Minggu Januari 2025	200000.00	Koordinasi dengan bidang penalayanan	2026-02-10 22:01:58.15794	2026-02-10 22:01:58.15794
\.


--
-- TOC entry 5490 (class 0 OID 25791)
-- Dependencies: 272
-- Data for Name: renungan_mingguan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.renungan_mingguan (id, judul, isi, tanggal, gambar, created_at) FROM stdin;
1	Hidup dalam Pengharapan	Pengharapan kita di dalam Kristus tidak akan pernah mengecewakan. Mari kita terus berpegang teguh pada janji-janji-Nya yang setia.	2024-03-03	\N	2026-02-10 14:55:25.61908
2	Kekuatan Doa	Doa adalah nafas hidup orang percaya. Ketika kita berdoa, Tuhan bekerja. Jangan pernah meremehkan kuasa doa yang dinaikkan dengan iman.	2024-03-10	\N	2026-02-10 14:55:25.630907
3	Kasih yang Mengampuni	Tuhan mengajarkan kita untuk mengampuni sesama seperti Dia telah mengampuni kita. Pengampunan membebaskan hati dari beban kepahitan.	2024-03-17	\N	2026-02-10 14:55:25.631804
4	Melayani dengan Hati	Pelayanan yang sejati lahir dari hati yang mengasihi Tuhan. Apapun yang kita lakukan, lakukanlah seperti untuk Tuhan dan bukan untuk manusia.	2024-03-24	\N	2026-02-10 14:55:25.632413
5	Paskah: Kemenangan atas Maut	Kebangkitan Kristus memberikan kita jaminan keselamatan dan hidup yang kekal. Mari rayakan kemenangan ini setiap hari.	2024-03-31	\N	2026-02-10 14:55:25.632916
6	Buah Roh: Kesabaran	Kesabaran adalah tanda kedewasaan rohani. Di tengah ujian, mari kita belajar untuk sabar menantikan waktunya Tuhan yang sempurna.	2024-04-07	\N	2026-02-10 14:55:25.633655
7	Terang dan Garam Dunia	Kita dipanggil untuk menjadi terang di tengah kegelapan dan garam yang memberi rasa. Biarlah hidup kita menjadi saksi bagi kemuliaan-Nya.	2024-04-14	\N	2026-02-10 14:55:25.634116
8	Iman yang Bertumbuh	Iman bukanlah sesuatu yang statis. Melalui firman dan pengalaman hidup bersama Tuhan, iman kita akan terus bertumbuh semakin kuat.	2024-04-21	\N	2026-02-10 14:55:25.634589
9	Bersyukur dalam Segala Hal	Ucapkanlah syukur senantiasa. Hati yang bersyukur adalah kunci kebahagiaan sejati, terlepas dari situasi yang kita hadapi.	2024-04-28	\N	2026-02-10 14:55:25.635127
10	Panggilan untuk Memberitakan Injil	Amanat Agung adalah tugas kita bersama. Mari wartakan kasih Kristus kepada dunia melalui perkataan dan perbuatan kita.	2024-05-05	\N	2026-02-10 14:55:25.635781
\.


--
-- TOC entry 5497 (class 0 OID 25896)
-- Dependencies: 279
-- Data for Name: sectors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sectors (id, nama_sektor, alamat, no_hp, created_at) FROM stdin;
1b658897-1ac6-4802-98c3-5b50d4f3f2ec	Sektor 2	Wilayah 2	-	2026-02-11 19:06:34.508661
fee89f0a-cd91-489d-9d26-1afb88e84f4b	Sektor 3	Wilayah 3	-	2026-02-11 19:06:34.51006
87455348-2e6d-4508-9465-993fcd6f4a12	Sektor 4	Wilayah 4	-	2026-02-11 19:06:34.511424
b7102b36-4fb9-4f40-b5fe-d3e4da497010	Sektor 5	Wilayah 5	-	2026-02-11 19:06:34.513359
34f56af9-7df8-4d1c-872a-2bd1888ba3da	Sektor 6	Wilayah 6	-	2026-02-11 19:06:34.514734
4c37a136-fedb-4d59-b715-a1ec860914f9	Sektor 7	Wilayah 7	-	2026-02-11 19:06:34.516452
da08950e-b152-47c0-8df9-2ce3706918cd	Sektor 1	Wilayah 1	081236927067	2026-02-11 19:06:34.490955
\.


--
-- TOC entry 5506 (class 0 OID 25998)
-- Dependencies: 288
-- Data for Name: sejarah; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sejarah (id, judul, tanggal_peristiwa, deskripsi, gambar_url, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5440 (class 0 OID 24685)
-- Dependencies: 222
-- Data for Name: sejarah_gereja; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sejarah_gereja (id, konten, updated_by, updated_at) FROM stdin;
\.


--
-- TOC entry 5438 (class 0 OID 24666)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, nama, email, password, no_hp, role, status, created_at) FROM stdin;
\.


--
-- TOC entry 5455 (class 0 OID 25030)
-- Dependencies: 237
-- Data for Name: warta_ibadah; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warta_ibadah (id, judul_warta, hari, tanggal, tempat, ayat_firman, tema_khotbah, created_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5462 (class 0 OID 25129)
-- Dependencies: 244
-- Data for Name: warta_informasi_ibadah; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warta_informasi_ibadah (id, warta_id, tanggal, jam, jenis_ibadah, pemimpin, sektor) FROM stdin;
\.


--
-- TOC entry 5459 (class 0 OID 25087)
-- Dependencies: 241
-- Data for Name: warta_jemaat_sakit; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warta_jemaat_sakit (id, warta_id, nama, keterangan) FROM stdin;
\.


--
-- TOC entry 5461 (class 0 OID 25115)
-- Dependencies: 243
-- Data for Name: warta_lansia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warta_lansia (id, warta_id, nama, keterangan) FROM stdin;
\.


--
-- TOC entry 5464 (class 0 OID 25153)
-- Dependencies: 246
-- Data for Name: warta_pelayanan_kategorial; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warta_pelayanan_kategorial (id, warta_id, hari_tanggal, kategori, tempat, pemimpin, liturgos) FROM stdin;
\.


--
-- TOC entry 5463 (class 0 OID 25141)
-- Dependencies: 245
-- Data for Name: warta_pelayanan_sektor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warta_pelayanan_sektor (id, warta_id, sektor, tempat, pemimpin, liturgos, no_hp) FROM stdin;
\.


--
-- TOC entry 5460 (class 0 OID 25101)
-- Dependencies: 242
-- Data for Name: warta_pemulihan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warta_pemulihan (id, warta_id, nama, keterangan) FROM stdin;
\.


--
-- TOC entry 5457 (class 0 OID 25059)
-- Dependencies: 239
-- Data for Name: warta_pokok_doa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warta_pokok_doa (id, warta_id, kategori, keterangan) FROM stdin;
\.


--
-- TOC entry 5456 (class 0 OID 25043)
-- Dependencies: 238
-- Data for Name: warta_tata_ibadah; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warta_tata_ibadah (id, warta_id, urutan, nama_bagian, keterangan, judul_lagu, isi, created_at) FROM stdin;
\.


--
-- TOC entry 5458 (class 0 OID 25073)
-- Dependencies: 240
-- Data for Name: warta_ulang_tahun; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warta_ulang_tahun (id, warta_id, tanggal, nama, keterangan) FROM stdin;
\.


--
-- TOC entry 5539 (class 0 OID 0)
-- Dependencies: 233
-- Name: admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admins_id_seq', 2, true);


--
-- TOC entry 5540 (class 0 OID 0)
-- Dependencies: 285
-- Name: aktivitas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.aktivitas_id_seq', 3, true);


--
-- TOC entry 5541 (class 0 OID 0)
-- Dependencies: 247
-- Name: announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.announcements_id_seq', 12, true);


--
-- TOC entry 5542 (class 0 OID 0)
-- Dependencies: 229
-- Name: arsip_bulanan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.arsip_bulanan_id_seq', 1, false);


--
-- TOC entry 5543 (class 0 OID 0)
-- Dependencies: 277
-- Name: carousel_slides_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.carousel_slides_id_seq', 4, true);


--
-- TOC entry 5544 (class 0 OID 0)
-- Dependencies: 225
-- Name: jadwal_ibadah_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jadwal_ibadah_id_seq', 1, false);


--
-- TOC entry 5545 (class 0 OID 0)
-- Dependencies: 235
-- Name: jadwal_pelayanan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jadwal_pelayanan_id_seq', 1, false);


--
-- TOC entry 5546 (class 0 OID 0)
-- Dependencies: 227
-- Name: kegiatan_bulanan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.kegiatan_bulanan_id_seq', 1, false);


--
-- TOC entry 5547 (class 0 OID 0)
-- Dependencies: 274
-- Name: keuangan_laporan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.keuangan_laporan_id_seq', 1, false);


--
-- TOC entry 5548 (class 0 OID 0)
-- Dependencies: 231
-- Name: log_notifikasi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.log_notifikasi_id_seq', 1, false);


--
-- TOC entry 5549 (class 0 OID 0)
-- Dependencies: 283
-- Name: pekerjaan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pekerjaan_id_seq', 49, true);


--
-- TOC entry 5550 (class 0 OID 0)
-- Dependencies: 223
-- Name: pengumuman_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pengumuman_id_seq', 1, false);


--
-- TOC entry 5551 (class 0 OID 0)
-- Dependencies: 251
-- Name: pewartaan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pewartaan_id_seq', 11, true);


--
-- TOC entry 5552 (class 0 OID 0)
-- Dependencies: 265
-- Name: pewartaan_info_ibadah_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pewartaan_info_ibadah_id_seq', 10, true);


--
-- TOC entry 5553 (class 0 OID 0)
-- Dependencies: 259
-- Name: pewartaan_jemaat_sakit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pewartaan_jemaat_sakit_id_seq', 1, false);


--
-- TOC entry 5554 (class 0 OID 0)
-- Dependencies: 257
-- Name: pewartaan_jemaat_ultah_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pewartaan_jemaat_ultah_id_seq', 10, true);


--
-- TOC entry 5555 (class 0 OID 0)
-- Dependencies: 263
-- Name: pewartaan_lansia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pewartaan_lansia_id_seq', 1, false);


--
-- TOC entry 5556 (class 0 OID 0)
-- Dependencies: 269
-- Name: pewartaan_pelayanan_kategorial_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pewartaan_pelayanan_kategorial_id_seq', 1, false);


--
-- TOC entry 5557 (class 0 OID 0)
-- Dependencies: 267
-- Name: pewartaan_pelayanan_sektor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pewartaan_pelayanan_sektor_id_seq', 20, true);


--
-- TOC entry 5558 (class 0 OID 0)
-- Dependencies: 261
-- Name: pewartaan_pemulihan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pewartaan_pemulihan_id_seq', 1, false);


--
-- TOC entry 5559 (class 0 OID 0)
-- Dependencies: 255
-- Name: pewartaan_pokok_doa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pewartaan_pokok_doa_id_seq', 20, true);


--
-- TOC entry 5560 (class 0 OID 0)
-- Dependencies: 253
-- Name: pewartaan_tata_ibadah_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pewartaan_tata_ibadah_id_seq', 31, true);


--
-- TOC entry 5561 (class 0 OID 0)
-- Dependencies: 249
-- Name: program_kegiatan_gereja_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.program_kegiatan_gereja_id_seq', 11, true);


--
-- TOC entry 5562 (class 0 OID 0)
-- Dependencies: 271
-- Name: renungan_mingguan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.renungan_mingguan_id_seq', 10, true);


--
-- TOC entry 5563 (class 0 OID 0)
-- Dependencies: 221
-- Name: sejarah_gereja_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sejarah_gereja_id_seq', 1, false);


--
-- TOC entry 5564 (class 0 OID 0)
-- Dependencies: 287
-- Name: sejarah_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sejarah_id_seq', 1, false);


--
-- TOC entry 5565 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- TOC entry 5183 (class 2606 OID 24848)
-- Name: admins admins_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_email_key UNIQUE (email);


--
-- TOC entry 5185 (class 2606 OID 24846)
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- TOC entry 5235 (class 2606 OID 25819)
-- Name: agenda agenda_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agenda
    ADD CONSTRAINT agenda_pkey PRIMARY KEY (id);


--
-- TOC entry 5258 (class 2606 OID 25991)
-- Name: aktivitas aktivitas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aktivitas
    ADD CONSTRAINT aktivitas_pkey PRIMARY KEY (id);


--
-- TOC entry 5209 (class 2606 OID 25590)
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- TOC entry 5179 (class 2606 OID 24808)
-- Name: arsip_bulanan arsip_bulanan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arsip_bulanan
    ADD CONSTRAINT arsip_bulanan_pkey PRIMARY KEY (id);


--
-- TOC entry 5242 (class 2606 OID 25894)
-- Name: carousel_slides carousel_slides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carousel_slides
    ADD CONSTRAINT carousel_slides_pkey PRIMARY KEY (id);


--
-- TOC entry 5175 (class 2606 OID 24732)
-- Name: jadwal_ibadah jadwal_ibadah_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jadwal_ibadah
    ADD CONSTRAINT jadwal_ibadah_pkey PRIMARY KEY (id);


--
-- TOC entry 5187 (class 2606 OID 24910)
-- Name: jadwal_pelayanan jadwal_pelayanan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jadwal_pelayanan
    ADD CONSTRAINT jadwal_pelayanan_pkey PRIMARY KEY (id);


--
-- TOC entry 5252 (class 2606 OID 25956)
-- Name: jemaat_history jemaat_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jemaat_history
    ADD CONSTRAINT jemaat_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5246 (class 2606 OID 25922)
-- Name: jemaat jemaat_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jemaat
    ADD CONSTRAINT jemaat_pkey PRIMARY KEY (id);


--
-- TOC entry 5248 (class 2606 OID 25941)
-- Name: jemaat_sakramen jemaat_sakramen_jemaat_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jemaat_sakramen
    ADD CONSTRAINT jemaat_sakramen_jemaat_id_key UNIQUE (jemaat_id);


--
-- TOC entry 5250 (class 2606 OID 25939)
-- Name: jemaat_sakramen jemaat_sakramen_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jemaat_sakramen
    ADD CONSTRAINT jemaat_sakramen_pkey PRIMARY KEY (id);


--
-- TOC entry 5177 (class 2606 OID 24790)
-- Name: kegiatan_bulanan kegiatan_bulanan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kegiatan_bulanan
    ADD CONSTRAINT kegiatan_bulanan_pkey PRIMARY KEY (id);


--
-- TOC entry 5237 (class 2606 OID 25841)
-- Name: keuangan_laporan keuangan_laporan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.keuangan_laporan
    ADD CONSTRAINT keuangan_laporan_pkey PRIMARY KEY (id);


--
-- TOC entry 5240 (class 2606 OID 25877)
-- Name: laporan_keuangan laporan_keuangan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.laporan_keuangan
    ADD CONSTRAINT laporan_keuangan_pkey PRIMARY KEY (id);


--
-- TOC entry 5181 (class 2606 OID 24823)
-- Name: log_notifikasi log_notifikasi_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.log_notifikasi
    ADD CONSTRAINT log_notifikasi_pkey PRIMARY KEY (id);


--
-- TOC entry 5254 (class 2606 OID 25973)
-- Name: pekerjaan pekerjaan_nama_pekerjaan_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pekerjaan
    ADD CONSTRAINT pekerjaan_nama_pekerjaan_key UNIQUE (nama_pekerjaan);


--
-- TOC entry 5256 (class 2606 OID 25971)
-- Name: pekerjaan pekerjaan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pekerjaan
    ADD CONSTRAINT pekerjaan_pkey PRIMARY KEY (id);


--
-- TOC entry 5173 (class 2606 OID 24713)
-- Name: pengumuman pengumuman_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pengumuman
    ADD CONSTRAINT pengumuman_pkey PRIMARY KEY (id);


--
-- TOC entry 5227 (class 2606 OID 25737)
-- Name: pewartaan_info_ibadah pewartaan_info_ibadah_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pewartaan_info_ibadah
    ADD CONSTRAINT pewartaan_info_ibadah_pkey PRIMARY KEY (id);


--
-- TOC entry 5221 (class 2606 OID 25692)
-- Name: pewartaan_jemaat_sakit pewartaan_jemaat_sakit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pewartaan_jemaat_sakit
    ADD CONSTRAINT pewartaan_jemaat_sakit_pkey PRIMARY KEY (id);


--
-- TOC entry 5219 (class 2606 OID 25677)
-- Name: pewartaan_jemaat_ultah pewartaan_jemaat_ultah_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pewartaan_jemaat_ultah
    ADD CONSTRAINT pewartaan_jemaat_ultah_pkey PRIMARY KEY (id);


--
-- TOC entry 5225 (class 2606 OID 25722)
-- Name: pewartaan_lansia pewartaan_lansia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pewartaan_lansia
    ADD CONSTRAINT pewartaan_lansia_pkey PRIMARY KEY (id);


--
-- TOC entry 5231 (class 2606 OID 25767)
-- Name: pewartaan_pelayanan_kategorial pewartaan_pelayanan_kategorial_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pewartaan_pelayanan_kategorial
    ADD CONSTRAINT pewartaan_pelayanan_kategorial_pkey PRIMARY KEY (id);


--
-- TOC entry 5229 (class 2606 OID 25752)
-- Name: pewartaan_pelayanan_sektor pewartaan_pelayanan_sektor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pewartaan_pelayanan_sektor
    ADD CONSTRAINT pewartaan_pelayanan_sektor_pkey PRIMARY KEY (id);


--
-- TOC entry 5223 (class 2606 OID 25707)
-- Name: pewartaan_pemulihan pewartaan_pemulihan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pewartaan_pemulihan
    ADD CONSTRAINT pewartaan_pemulihan_pkey PRIMARY KEY (id);


--
-- TOC entry 5213 (class 2606 OID 25637)
-- Name: pewartaan pewartaan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pewartaan
    ADD CONSTRAINT pewartaan_pkey PRIMARY KEY (id);


--
-- TOC entry 5217 (class 2606 OID 25662)
-- Name: pewartaan_pokok_doa pewartaan_pokok_doa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pewartaan_pokok_doa
    ADD CONSTRAINT pewartaan_pokok_doa_pkey PRIMARY KEY (id);


--
-- TOC entry 5215 (class 2606 OID 25647)
-- Name: pewartaan_tata_ibadah pewartaan_tata_ibadah_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pewartaan_tata_ibadah
    ADD CONSTRAINT pewartaan_tata_ibadah_pkey PRIMARY KEY (id);


--
-- TOC entry 5211 (class 2606 OID 25608)
-- Name: program_kegiatan_gereja program_kegiatan_gereja_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.program_kegiatan_gereja
    ADD CONSTRAINT program_kegiatan_gereja_pkey PRIMARY KEY (id);


--
-- TOC entry 5233 (class 2606 OID 25803)
-- Name: renungan_mingguan renungan_mingguan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.renungan_mingguan
    ADD CONSTRAINT renungan_mingguan_pkey PRIMARY KEY (id);


--
-- TOC entry 5244 (class 2606 OID 25907)
-- Name: sectors sectors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sectors
    ADD CONSTRAINT sectors_pkey PRIMARY KEY (id);


--
-- TOC entry 5171 (class 2606 OID 24695)
-- Name: sejarah_gereja sejarah_gereja_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sejarah_gereja
    ADD CONSTRAINT sejarah_gereja_pkey PRIMARY KEY (id);


--
-- TOC entry 5260 (class 2606 OID 26010)
-- Name: sejarah sejarah_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sejarah
    ADD CONSTRAINT sejarah_pkey PRIMARY KEY (id);


--
-- TOC entry 5167 (class 2606 OID 24683)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5169 (class 2606 OID 24681)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5189 (class 2606 OID 25042)
-- Name: warta_ibadah warta_ibadah_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warta_ibadah
    ADD CONSTRAINT warta_ibadah_pkey PRIMARY KEY (id);


--
-- TOC entry 5203 (class 2606 OID 25135)
-- Name: warta_informasi_ibadah warta_informasi_ibadah_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warta_informasi_ibadah
    ADD CONSTRAINT warta_informasi_ibadah_pkey PRIMARY KEY (id);


--
-- TOC entry 5197 (class 2606 OID 25095)
-- Name: warta_jemaat_sakit warta_jemaat_sakit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warta_jemaat_sakit
    ADD CONSTRAINT warta_jemaat_sakit_pkey PRIMARY KEY (id);


--
-- TOC entry 5201 (class 2606 OID 25123)
-- Name: warta_lansia warta_lansia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warta_lansia
    ADD CONSTRAINT warta_lansia_pkey PRIMARY KEY (id);


--
-- TOC entry 5207 (class 2606 OID 25161)
-- Name: warta_pelayanan_kategorial warta_pelayanan_kategorial_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warta_pelayanan_kategorial
    ADD CONSTRAINT warta_pelayanan_kategorial_pkey PRIMARY KEY (id);


--
-- TOC entry 5205 (class 2606 OID 25147)
-- Name: warta_pelayanan_sektor warta_pelayanan_sektor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warta_pelayanan_sektor
    ADD CONSTRAINT warta_pelayanan_sektor_pkey PRIMARY KEY (id);


--
-- TOC entry 5199 (class 2606 OID 25109)
-- Name: warta_pemulihan warta_pemulihan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warta_pemulihan
    ADD CONSTRAINT warta_pemulihan_pkey PRIMARY KEY (id);


--
-- TOC entry 5193 (class 2606 OID 25067)
-- Name: warta_pokok_doa warta_pokok_doa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warta_pokok_doa
    ADD CONSTRAINT warta_pokok_doa_pkey PRIMARY KEY (id);


--
-- TOC entry 5191 (class 2606 OID 25053)
-- Name: warta_tata_ibadah warta_tata_ibadah_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warta_tata_ibadah
    ADD CONSTRAINT warta_tata_ibadah_pkey PRIMARY KEY (id);


--
-- TOC entry 5195 (class 2606 OID 25081)
-- Name: warta_ulang_tahun warta_ulang_tahun_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warta_ulang_tahun
    ADD CONSTRAINT warta_ulang_tahun_pkey PRIMARY KEY (id);


--
-- TOC entry 5238 (class 1259 OID 25878)
-- Name: idx_laporan_keuangan_tanggal; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_laporan_keuangan_tanggal ON public.laporan_keuangan USING btree (tanggal);


--
-- TOC entry 5276 (class 2606 OID 25992)
-- Name: announcements announcements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admins(id);


--
-- TOC entry 5265 (class 2606 OID 24809)
-- Name: arsip_bulanan arsip_bulanan_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arsip_bulanan
    ADD CONSTRAINT arsip_bulanan_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5263 (class 2606 OID 24733)
-- Name: jadwal_ibadah jadwal_ibadah_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jadwal_ibadah
    ADD CONSTRAINT jadwal_ibadah_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5289 (class 2606 OID 25957)
-- Name: jemaat_history jemaat_history_jemaat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jemaat_history
    ADD CONSTRAINT jemaat_history_jemaat_id_fkey FOREIGN KEY (jemaat_id) REFERENCES public.jemaat(id);


--
-- TOC entry 5286 (class 2606 OID 25975)
-- Name: jemaat jemaat_pekerjaan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jemaat
    ADD CONSTRAINT jemaat_pekerjaan_id_fkey FOREIGN KEY (pekerjaan_id) REFERENCES public.pekerjaan(id);


--
-- TOC entry 5288 (class 2606 OID 25942)
-- Name: jemaat_sakramen jemaat_sakramen_jemaat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jemaat_sakramen
    ADD CONSTRAINT jemaat_sakramen_jemaat_id_fkey FOREIGN KEY (jemaat_id) REFERENCES public.jemaat(id) ON DELETE CASCADE;


--
-- TOC entry 5287 (class 2606 OID 25923)
-- Name: jemaat jemaat_sektor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jemaat
    ADD CONSTRAINT jemaat_sektor_id_fkey FOREIGN KEY (sektor_id) REFERENCES public.sectors(id) ON DELETE CASCADE;


--
-- TOC entry 5264 (class 2606 OID 24791)
-- Name: kegiatan_bulanan kegiatan_bulanan_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kegiatan_bulanan
    ADD CONSTRAINT kegiatan_bulanan_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5266 (class 2606 OID 24824)
-- Name: log_notifikasi log_notifikasi_jadwal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.log_notifikasi
    ADD CONSTRAINT log_notifikasi_jadwal_id_fkey FOREIGN KEY (jadwal_id) REFERENCES public.jadwal_ibadah(id) ON DELETE CASCADE;


--
-- TOC entry 5262 (class 2606 OID 24714)
-- Name: pengumuman pengumuman_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pengumuman
    ADD CONSTRAINT pengumuman_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5283 (class 2606 OID 25738)
-- Name: pewartaan_info_ibadah pewartaan_info_ibadah_pewartaan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pewartaan_info_ibadah
    ADD CONSTRAINT pewartaan_info_ibadah_pewartaan_id_fkey FOREIGN KEY (pewartaan_id) REFERENCES public.pewartaan(id) ON DELETE CASCADE;


--
-- TOC entry 5280 (class 2606 OID 25693)
-- Name: pewartaan_jemaat_sakit pewartaan_jemaat_sakit_pewartaan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pewartaan_jemaat_sakit
    ADD CONSTRAINT pewartaan_jemaat_sakit_pewartaan_id_fkey FOREIGN KEY (pewartaan_id) REFERENCES public.pewartaan(id) ON DELETE CASCADE;


--
-- TOC entry 5279 (class 2606 OID 25678)
-- Name: pewartaan_jemaat_ultah pewartaan_jemaat_ultah_pewartaan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pewartaan_jemaat_ultah
    ADD CONSTRAINT pewartaan_jemaat_ultah_pewartaan_id_fkey FOREIGN KEY (pewartaan_id) REFERENCES public.pewartaan(id) ON DELETE CASCADE;


--
-- TOC entry 5282 (class 2606 OID 25723)
-- Name: pewartaan_lansia pewartaan_lansia_pewartaan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pewartaan_lansia
    ADD CONSTRAINT pewartaan_lansia_pewartaan_id_fkey FOREIGN KEY (pewartaan_id) REFERENCES public.pewartaan(id) ON DELETE CASCADE;


--
-- TOC entry 5285 (class 2606 OID 25768)
-- Name: pewartaan_pelayanan_kategorial pewartaan_pelayanan_kategorial_pewartaan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pewartaan_pelayanan_kategorial
    ADD CONSTRAINT pewartaan_pelayanan_kategorial_pewartaan_id_fkey FOREIGN KEY (pewartaan_id) REFERENCES public.pewartaan(id) ON DELETE CASCADE;


--
-- TOC entry 5284 (class 2606 OID 25753)
-- Name: pewartaan_pelayanan_sektor pewartaan_pelayanan_sektor_pewartaan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pewartaan_pelayanan_sektor
    ADD CONSTRAINT pewartaan_pelayanan_sektor_pewartaan_id_fkey FOREIGN KEY (pewartaan_id) REFERENCES public.pewartaan(id) ON DELETE CASCADE;


--
-- TOC entry 5281 (class 2606 OID 25708)
-- Name: pewartaan_pemulihan pewartaan_pemulihan_pewartaan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pewartaan_pemulihan
    ADD CONSTRAINT pewartaan_pemulihan_pewartaan_id_fkey FOREIGN KEY (pewartaan_id) REFERENCES public.pewartaan(id) ON DELETE CASCADE;


--
-- TOC entry 5278 (class 2606 OID 25663)
-- Name: pewartaan_pokok_doa pewartaan_pokok_doa_pewartaan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pewartaan_pokok_doa
    ADD CONSTRAINT pewartaan_pokok_doa_pewartaan_id_fkey FOREIGN KEY (pewartaan_id) REFERENCES public.pewartaan(id) ON DELETE CASCADE;


--
-- TOC entry 5277 (class 2606 OID 25648)
-- Name: pewartaan_tata_ibadah pewartaan_tata_ibadah_pewartaan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pewartaan_tata_ibadah
    ADD CONSTRAINT pewartaan_tata_ibadah_pewartaan_id_fkey FOREIGN KEY (pewartaan_id) REFERENCES public.pewartaan(id) ON DELETE CASCADE;


--
-- TOC entry 5261 (class 2606 OID 24696)
-- Name: sejarah_gereja sejarah_gereja_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sejarah_gereja
    ADD CONSTRAINT sejarah_gereja_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- TOC entry 5273 (class 2606 OID 25136)
-- Name: warta_informasi_ibadah warta_informasi_ibadah_warta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warta_informasi_ibadah
    ADD CONSTRAINT warta_informasi_ibadah_warta_id_fkey FOREIGN KEY (warta_id) REFERENCES public.warta_ibadah(id) ON DELETE CASCADE;


--
-- TOC entry 5270 (class 2606 OID 25096)
-- Name: warta_jemaat_sakit warta_jemaat_sakit_warta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warta_jemaat_sakit
    ADD CONSTRAINT warta_jemaat_sakit_warta_id_fkey FOREIGN KEY (warta_id) REFERENCES public.warta_ibadah(id) ON DELETE CASCADE;


--
-- TOC entry 5272 (class 2606 OID 25124)
-- Name: warta_lansia warta_lansia_warta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warta_lansia
    ADD CONSTRAINT warta_lansia_warta_id_fkey FOREIGN KEY (warta_id) REFERENCES public.warta_ibadah(id) ON DELETE CASCADE;


--
-- TOC entry 5275 (class 2606 OID 25162)
-- Name: warta_pelayanan_kategorial warta_pelayanan_kategorial_warta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warta_pelayanan_kategorial
    ADD CONSTRAINT warta_pelayanan_kategorial_warta_id_fkey FOREIGN KEY (warta_id) REFERENCES public.warta_ibadah(id) ON DELETE CASCADE;


--
-- TOC entry 5274 (class 2606 OID 25148)
-- Name: warta_pelayanan_sektor warta_pelayanan_sektor_warta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warta_pelayanan_sektor
    ADD CONSTRAINT warta_pelayanan_sektor_warta_id_fkey FOREIGN KEY (warta_id) REFERENCES public.warta_ibadah(id) ON DELETE CASCADE;


--
-- TOC entry 5271 (class 2606 OID 25110)
-- Name: warta_pemulihan warta_pemulihan_warta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warta_pemulihan
    ADD CONSTRAINT warta_pemulihan_warta_id_fkey FOREIGN KEY (warta_id) REFERENCES public.warta_ibadah(id) ON DELETE CASCADE;


--
-- TOC entry 5268 (class 2606 OID 25068)
-- Name: warta_pokok_doa warta_pokok_doa_warta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warta_pokok_doa
    ADD CONSTRAINT warta_pokok_doa_warta_id_fkey FOREIGN KEY (warta_id) REFERENCES public.warta_ibadah(id) ON DELETE CASCADE;


--
-- TOC entry 5267 (class 2606 OID 25054)
-- Name: warta_tata_ibadah warta_tata_ibadah_warta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warta_tata_ibadah
    ADD CONSTRAINT warta_tata_ibadah_warta_id_fkey FOREIGN KEY (warta_id) REFERENCES public.warta_ibadah(id) ON DELETE CASCADE;


--
-- TOC entry 5269 (class 2606 OID 25082)
-- Name: warta_ulang_tahun warta_ulang_tahun_warta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warta_ulang_tahun
    ADD CONSTRAINT warta_ulang_tahun_warta_id_fkey FOREIGN KEY (warta_id) REFERENCES public.warta_ibadah(id) ON DELETE CASCADE;


-- Completed on 2026-02-13 19:13:27

--
-- PostgreSQL database dump complete
--

\unrestrict bVK1RlSfMpCglnBFS4EEPuSMOOXgfJWWg7yuQrqixn8PA1DdUkxWPXa1Z52lFKk

