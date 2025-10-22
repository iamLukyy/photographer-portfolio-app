<div align="center">

# 📸 Photography Portfolio & Booking System

**Modern, minimalist portfolio for professional photographers**

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?style=flat&logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

[Live Demo](https://lukaskarel.com/) • [Documentation](#-quick-start) • [Deploy](#-deployment)

![Portfolio Preview](.github/preview.png)

</div>

---

## ✨ What's Inside

- 🖼️ **Photo Grid** - Responsive masonry layout with customizable sizes (1×1, 2×1, 1×2, 2×2)
- 🔍 **Lightbox** - Full-screen gallery with keyboard navigation
- 📅 **Booking System** - Coupon-based client booking with time slots
- 📧 **Contact Form** - Email integration via Resend API
- ⚙️ **Admin Panel** - Full control through web UI - **no code editing required!**
- 🎨 **Setup Wizard** - Guided first-time configuration
- 🐳 **Docker Ready** - One-command deployment
- 📱 **Mobile First** - Fully responsive design

---

## 🚀 Quick Start

### Local Development

```bash
# Clone repo
git clone <your-repo-url>
cd photographer-portfolio-app

# Install dependencies (use pnpm!)
pnpm install

# Set up environment
cp .env.example .env
# Edit .env and add your Resend API key

# Start dev server
pnpm dev
```

🌐 Open [http://localhost:3000/setup](http://localhost:3000/setup) to configure your portfolio!

---

## 🌍 Deployment

### Option 1: Vercel (Recommended for Simplicity)

**✅ Perfect for small portfolios with moderate traffic**

**Cost**: **FREE** for most photographers!
- Free tier: Unlimited bandwidth, 100GB/month builds
- Only pay if you exceed (unlikely for portfolios)

**Deploy in 2 minutes:**

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **Import Project**
3. Select your repo
4. Add environment variable:
   - `RESEND_API_KEY` - Your Resend API key ([get free key](https://resend.com))
5. Click **Deploy** ✨

**After deployment:**
- Navigate to `your-app.vercel.app/setup`
- Complete wizard to configure your portfolio
- Upload photos via admin panel

**Pros:**
- ✅ Zero configuration
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Auto-scaling
- ✅ Free SSL certificates

**Cons:**
- ❌ 100MB photo upload limit on free tier
- ❌ Limited serverless execution time

---

### Option 2: VPS with Docker (Full Control)

**✅ Best for unlimited uploads & full customization**

**Cost**: **$5-10/month** (DigitalOcean, Hetzner, Vultr)

**Requirements:**
- Linux VPS (Ubuntu 22.04+ recommended)
- 1GB RAM minimum
- Docker + Docker Compose

**Deploy:**

```bash
# On your VPS
git clone <your-repo-url>
cd photographer-portfolio-app

# Set up environment
cp .env.example .env
nano .env  # Add your Resend API key

# Build and start
docker-compose up -d --build

# Application runs on port 3044
```

**Nginx reverse proxy (optional but recommended):**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Upload limit for large photos
    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:3044;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve uploads directly (faster)
    location /uploads/ {
        alias /var/www/photo-portfolio-data/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Enable HTTPS (free SSL):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

**Pros:**
- ✅ Unlimited photo uploads
- ✅ Full control
- ✅ Custom domain
- ✅ Direct file serving via nginx

**Cons:**
- ❌ Manual server management
- ❌ Monthly cost ($5-10)

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| ![Next.js](https://img.shields.io/badge/-Next.js_15-black?style=flat&logo=next.js) | React framework with App Router |
| ![TypeScript](https://img.shields.io/badge/-TypeScript-3178c6?style=flat&logo=typescript&logoColor=white) | Type-safe JavaScript |
| ![Tailwind](https://img.shields.io/badge/-Tailwind_4.0-38bdf8?style=flat&logo=tailwind-css&logoColor=white) | Utility-first CSS |
| ![Sharp](https://img.shields.io/badge/-Sharp-99cc00?style=flat) | High-performance image processing |
| ![Resend](https://img.shields.io/badge/-Resend-000000?style=flat) | Transactional email API |
| ![Docker](https://img.shields.io/badge/-Docker-2496ed?style=flat&logo=docker&logoColor=white) | Containerization |
| ![pnpm](https://img.shields.io/badge/-pnpm-f69220?style=flat&logo=pnpm&logoColor=white) | Fast package manager |

**Database:** JSON file-based (photos.json, bookings.json, coupons.json, settings.json)

---

## 📖 Usage

### For Photographers

1. **Complete Setup Wizard** (`/setup`)
   - Add your name, bio, contact info
   - Upload profile photo
   - Configure email

2. **Upload Photos** (`/admin`)
   - Click "Upload Photo"
   - Choose album and grid size
   - Drag to reorder

3. **Manage Bookings** (`/admin/bookings`)
   - Create coupon codes in **Coupons**
   - Share code with clients
   - Confirm bookings

4. **Update Anytime** (`/admin/settings`)
   - Change bio, email, social media
   - Update profile photo

### For Clients

1. Browse portfolio at main URL
2. Click photos for full-screen view
3. Book session with coupon code at `/booking`
4. Contact via form on About page

---

## 🔐 Security

- ✅ Password-protected admin panel
- ✅ File upload validation (type, size)
- ✅ Path traversal protection
- ✅ Environment-based secrets
- ✅ HTTPS ready (via Vercel or nginx)

**Production checklist:**
- [ ] Change admin password in `lib/auth.ts`
- [ ] Enable HTTPS
- [ ] Keep Resend API key private
- [ ] Regular backups of `data/` folder

---

## 📁 Data Persistence

All data stored in:
```
data/
├── uploads/          # Photos (full-size + thumbnails)
└── lib/
    ├── settings.json  # Portfolio config
    ├── photos.json    # Photo metadata
    ├── bookings.json  # Booking data
    └── coupons.json   # Coupon codes
```

**Backup:** Simply copy the `data/` folder!

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Photos not showing | Check `data/uploads/` permissions: `chmod -R 755 data/` |
| Email not sending | Verify `RESEND_API_KEY` in `.env` is correct |
| Upload fails | Check file size (≤100MB) and disk space |
| Can't login to admin | Check password in `lib/auth.ts` |

More help: [Full Documentation](./CLAUDE.md)

---

## 📄 License

MIT License - Free to use, modify, and deploy!

---

## 🙏 Support

Built with ❤️ for photographers

⭐ **Star this repo** if you find it useful!

🐛 **Report bugs** via [GitHub Issues](../../issues)

📧 **Questions?** Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guides

---

**Ready to launch your portfolio?** [Deploy to Vercel](https://vercel.com/new) in 2 minutes! 🚀
