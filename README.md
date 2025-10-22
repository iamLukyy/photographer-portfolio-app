# Photography Portfolio & Booking System

A modern, minimalist photography portfolio application with integrated booking system. Built with Next.js 15, TypeScript, and Docker-ready for easy deployment.

**Perfect for professional photographers** - No coding required to customize your portfolio!

## ✨ Features

### Portfolio Management
- **Photo Upload & Organization** - Upload high-resolution images up to 100MB
- **Smart Thumbnails** - Automatic thumbnail generation with Sharp
- **Flexible Grid Layout** - Customizable grid sizes (1×1, 2×1, 1×2, 2×2)
- **Album Organization** - Organize photos into custom albums
- **Drag & Drop Reordering** - Intuitive photo arrangement
- **Lightbox Gallery** - Full-screen image viewing with keyboard navigation

### Booking System
- **Coupon-Based Access** - Generate unique booking codes for clients
- **Time Slot Management** - Configurable booking durations (1h, 2h, 5h, etc.)
- **Status Tracking** - Pending, confirmed, and cancelled bookings
- **Client Management** - Track client details and booking history
- **Admin Interface** - Easy booking confirmation and management

### Customization Through Admin Panel
- **Settings Panel** - Configure all personal information through admin UI
- **Profile Management** - Upload profile photo, set bio, contact info
- **Brand Customization** - Set site title, photographer name, location
- **No Code Editing Required** - All configuration through web interface
- **Setup Wizard** - Guided first-time configuration

### Contact Form
- **Email Integration** - Powered by Resend API
- **Form Validation** - Client and server-side validation
- **Professional Templates** - Clean email formatting

## 🚀 Tech Stack

- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **Image Processing**: Sharp (automatic thumbnail generation)
- **Email**: Resend API
- **Database**: JSON file-based (photos.json, bookings.json, coupons.json, settings.json)
- **Deployment**: Docker + Nginx
- **Package Manager**: pnpm

## 📦 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Docker and Docker Compose (for production deployment)
- Resend API key (free tier available at [resend.com](https://resend.com))

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd photographer-portfolio-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Resend API key:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   CONTACT_EMAIL=your-email@example.com
   ```

4. **Run development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   - Portfolio: http://localhost:3000
   - Setup Wizard: http://localhost:3000/setup (first launch)
   - Admin Panel: http://localhost:3000/admin (after setup)

6. **Complete setup wizard**
   - Fill in your personal information
   - Upload a profile photo
   - Configure email and social media
   - Set your site branding

## 🐳 Docker Deployment

### Building and Running

1. **Create production environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```

2. **Build and start containers**
   ```bash
   docker-compose up -d --build
   ```

3. **Application will be available on port 3044**
   - Access at: http://your-domain:3044
   - Or configure nginx reverse proxy (see DEPLOYMENT.md)

4. **Complete setup wizard**
   - On first launch, navigate to `/setup`
   - Follow the guided configuration
   - Access admin panel after setup

### Data Persistence

The application uses bind mounts for data persistence:
- `./data/uploads` - Photo storage (both full-size and thumbnails)
- `./data/lib` - Metadata files:
  - `settings.json` - Your portfolio configuration
  - `photos.json` - Photo metadata and organization
  - `bookings.json` - Booking data
  - `coupons.json` - Coupon codes

**Important**: Data survives container restarts and rebuilds!

## ⚙️ Configuration

### Setup Wizard (`/setup`)

On first launch, you'll be guided through a 3-step setup wizard:

**Step 1: Basic Information**
- Your name
- Email address
- Site title

**Step 2: About You**
- Location (city, country)
- Bio/About text
- Equipment/camera system
- Languages you speak

**Step 3: Social & Contact**
- Instagram handle
- Additional contact information
- Resend API configuration guide

### Admin Panel (`/admin`)

After completing setup, access the full admin panel:

**Settings** (`/admin/settings`)
- Update all information from setup wizard
- Upload/change profile photo
- Modify site branding
- Configure email preferences

**Photo Management** (`/admin`)
- Upload photos (max 100MB per photo)
- Assign photos to albums
- Set grid sizes for custom layouts
- Reorder photos with drag & drop or arrow buttons
- Delete photos with confirmation

**Bookings** (`/admin/bookings`)
- View all bookings (confirmed, pending, cancelled)
- Confirm or cancel reservations
- Delete old bookings
- Track client information

**Coupons** (`/admin/coupons`)
- Generate unique booking codes
- Set time slot durations (1h, 2h, 5h, etc.)
- Activate/deactivate coupons
- Copy coupon codes to share with clients
- Track coupon usage and creation dates

### Email Configuration (Resend)

The portfolio uses Resend for sending contact form emails. It's free and easy to set up!

**Step-by-step guide:**

1. **Sign up at [resend.com](https://resend.com)**
   - Free tier includes:
     - 100 emails/day
     - 3,000 emails/month
     - Perfect for most photographers!

2. **Get your API key**
   - After signup, navigate to **API Keys** in dashboard
   - Click **"Create API Key"**
   - Give it a name (e.g., "Portfolio App")
   - Copy the key (starts with `re_`)

3. **Add to environment**

   Edit `.env` file:
   ```env
   RESEND_API_KEY=re_your_actual_api_key_here
   CONTACT_EMAIL=your-email@example.com
   ```

4. **Restart application**
   ```bash
   # Development
   pnpm dev

   # Docker
   docker-compose restart
   ```

5. **Test the contact form**
   - Go to your About page
   - Send a test message
   - Check your email!

**Optional: Verify your domain**
- For production, verify your domain in Resend
- Send emails from `hello@yourdomain.com` instead of `onboarding@resend.dev`
- See [Resend docs](https://resend.com/docs/dashboard/domains/introduction) for details

## 📁 Project Structure

```
photographer-portfolio-app/
├── app/
│   ├── admin/              # Admin panel
│   │   ├── settings/       # Settings configuration UI
│   │   ├── bookings/       # Booking management
│   │   └── coupons/        # Coupon management
│   ├── api/                # API routes
│   │   ├── photos/         # Photo CRUD operations
│   │   ├── bookings/       # Booking operations
│   │   ├── coupons/        # Coupon operations
│   │   ├── settings/       # Settings management
│   │   └── contact/        # Contact form email
│   ├── about/              # About page with contact form
│   ├── booking/            # Public booking interface
│   ├── setup/              # First-time setup wizard
│   └── uploads/            # Dynamic upload serving route
├── components/             # Reusable React components
│   ├── Header.tsx          # Dynamic navigation header
│   ├── PhotoGrid.tsx       # Masonry grid layout
│   ├── Lightbox.tsx        # Full-screen viewer
│   └── ...
├── lib/                    # Data and utilities
│   ├── settings.json       # Portfolio configuration ⚙️
│   ├── photos.json         # Photo metadata
│   ├── bookings.json       # Booking data
│   ├── coupons.json        # Coupon codes
│   ├── auth.ts             # Admin authentication
│   └── thumbnails.ts       # Thumbnail generation
├── types/                  # TypeScript definitions
│   ├── settings.ts         # Settings type definition
│   └── photo.ts            # Photo type definition
├── public/
│   ├── uploads/            # Uploaded photos & thumbnails
│   └── profile-placeholder.svg
├── docker-compose.yml      # Docker configuration
├── Dockerfile              # Docker image
└── .env.example            # Environment template
```

## 🎨 Usage Guide

### For Photographers

**Initial Setup** (5 minutes)
1. Launch the application
2. Navigate to `/setup` (auto-redirects on first launch)
3. Complete the 3-step wizard
4. Upload your profile photo
5. Get your Resend API key and add to `.env`

**Adding Photos**
1. Go to Admin Panel (`/admin`)
2. Click **"Upload Photo"** button
3. Select image (JPEG, PNG, WebP up to 100MB)
4. Assign to an album (e.g., "Portraits", "Weddings", "Commercial")
5. Choose grid size (1×1 Normal, 2×1 Wide, 1×2 Tall, 2×2 Large)
6. Photo appears immediately on your portfolio!

**Managing Bookings**
1. Create a coupon code in **Coupons** section
   - Set client name and email
   - Choose slot duration (1h, 2h, 5h, etc.)
   - Copy the generated code
2. Share booking link `/booking` and coupon code with client
3. Client selects available time slot
4. Confirm booking in **Bookings** section

**Updating Information**
1. Go to **Settings** (`/admin/settings`)
2. Update any information
3. Click **"Save Settings"**
4. Changes appear immediately across the site

### For Clients

**Viewing Portfolio**
- Browse photographer's work at main URL
- Click any photo for full-screen view
- Filter by albums if available
- Navigate with keyboard (← → arrows, Esc to close)

**Booking a Session**
1. Receive coupon code from photographer
2. Go to booking page
3. Enter coupon code
4. Select available date and time
5. Provide your information
6. Confirm booking
7. Receive confirmation email

**Contacting Photographer**
- Use contact form on About page
- Email is sent directly to photographer
- Or use direct email/Instagram links provided

## 🔒 Security

- **Admin Authentication** - Password-protected admin panel
- **File Validation** - Size and type checks on uploads
- **Path Traversal Protection** - Secure file serving
- **Email Validation** - Server and client-side validation
- **No Sensitive Data in Git** - .env files excluded
- **Environment Variables** - API keys never in code

**Security Best Practices:**
- Change default admin password in production
- Use HTTPS in production (via nginx/Traefik)
- Keep Resend API key private
- Regularly update dependencies
- Use Docker secrets for sensitive data in production

## 🐛 Troubleshooting

### Photos Not Showing

**Problem**: Uploaded photos appear as grey boxes or 404

**Solutions**:
- Check if `data/uploads/` directory exists
- Verify file permissions: `chmod -R 755 data/`
- Check if Docker volume mounts are correct
- For production: Ensure nginx serves `/uploads/` correctly
- Check browser console for 404 errors

### Thumbnails Not Generating

**Problem**: Grey boxes instead of thumbnails

**Solutions**:
- Check Sharp installation: `pnpm list sharp`
- Verify write permissions on `data/uploads/thumbnails/`
- Check server logs for errors
- Try re-uploading the photo
- Ensure enough disk space

### Email Not Sending

**Problem**: Contact form submits but no email received

**Solutions**:
- Verify Resend API key is correct (starts with `re_`)
- Check email is configured in Settings panel
- Verify Resend account is active (login to resend.com)
- Check server logs: `docker-compose logs -f` or console
- Verify `.env` file is loaded: check environment variables
- Test API key with Resend dashboard

### Upload Fails

**Problem**: Photo upload fails or shows error

**Solutions**:
- Check file size - must be ≤ 100MB
- Verify file format - JPEG, PNG, WebP, or GIF only
- Check available disk space
- Verify nginx upload limit (if using nginx)
- Check Docker container logs for errors

### Setup Wizard Not Accessible

**Problem**: Cannot access `/setup` page

**Solutions**:
- Clear browser cache and cookies
- Check if `lib/settings.json` exists
- Try directly navigating to `/setup`
- Check if `isConfigured` is `false` in settings.json

### Admin Login Not Working

**Problem**: Cannot log into admin panel

**Solutions**:
- Check admin password in `lib/auth.ts` (default: varies)
- Clear browser cookies
- Try incognito/private browsing mode
- Check browser console for errors

## 🚀 Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed production deployment guide including:
- VPS setup and requirements
- Nginx configuration examples
- SSL certificate setup with Let's Encrypt
- Docker production best practices
- Environment variable security
- Backup and maintenance procedures

## 📚 Additional Documentation

- **DEPLOYMENT.md** - Complete production deployment guide
- **CLAUDE.md** - Development notes and architecture details

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs via GitHub Issues
- Suggest features
- Submit pull requests
- Improve documentation

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Credits

Built with modern web technologies:
- [Next.js](https://nextjs.org) - React framework
- [React](https://react.dev) - UI library
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Sharp](https://sharp.pixelplumbing.com) - Image processing
- [Resend](https://resend.com) - Email delivery
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [Docker](https://www.docker.com) - Containerization

---

**Made for photographers, by photographers** 📸

Ready to launch your photography portfolio? Star this repo and share it with fellow photographers!
