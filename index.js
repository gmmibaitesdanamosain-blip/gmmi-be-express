import express from "express";
import cors from "cors";
import helmet from "helmet";
// import fs from 'fs';
// import './config/env.js';

import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.route.js";
import pengumumanRoutes from "./routes/pengumuman.routes.js";
import wartaRoutes from "./routes/warta.routes.js";
import ibadahRoutes from "./routes/ibadah.routes.js";
import arsipRoutes from "./routes/arsip.routes.js";
import keuanganRoutes from "./routes/keuangan.routes.js";
import programRoutes from "./routes/program.routes.js";
import pewartaanRoutes from "./routes/pewartaan.routes.js";
import renunganRoutes from "./routes/renungan.routes.js";
import carouselRoutes from "./routes/carousel.routes.js";
import jemaatRoutes from "./routes/jemaat.routes.js";
import pekerjaanRoutes from "./routes/pekerjaan.routes.js";
import sejarahRoutes from "./routes/sejarah.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Security: Helmet adds secure HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
        "img-src": ["'self'", "data:", "blob:", "*"],
        "connect-src": ["'self'", "*", "http://localhost:*", "ws://localhost:*"],
        "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
        "object-src": ["'none'"],
        "upgrade-insecure-requests": [],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  cors({
    origin: "*", // Recommended: set to specific domain in production
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

app.get("/ping", (req, res) => {
  res.json({ pong: true, time: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.json({ message: "GMMI Backend running" });
});

// Suppress Chrome DevTools 404 errors
app.get("/.well-known/appspecific/com.chrome.devtools.json", (req, res) => {
  res.status(204).end();
});

app.use('/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/super-admin', adminRoutes);
app.use('/api/announcements', pengumumanRoutes);
app.use('/api/warta', wartaRoutes);
app.use('/api/jadwal', ibadahRoutes);
app.use('/api/arsip', arsipRoutes);
app.use('/api/keuangan', keuanganRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/pewartaan', pewartaanRoutes);
app.use('/pewartaan', pewartaanRoutes); // Alias for convenience
app.use('/api/renungan', renunganRoutes);
app.use('/api/carousel', carouselRoutes);
app.use('/api/jemaat', jemaatRoutes);
app.use('/api/pekerjaan', pekerjaanRoutes);
app.use('/api/sejarah', sejarahRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
