# VPS Deployment Guide - mareksvaton.cz

## 🎯 Overview

Tato aplikace běží na VPS serveru "had" (SSH alias: `ssh had`) stejně jako ostatní projekty.

**Production Info**:
- **Domain**: mareksvaton.cz (bude namířeno na VPS)
- **VPS Path**: `/var/www/fotimanalogem`
- **Docker Port**: 3050 (internal container port 3000)
- **Stack**: Docker + Nginx + Let's Encrypt SSL
- **Data Storage**: `/var/www/fotimanalogem/data/`

## 📋 Prerequisites

1. ✅ DNS záznamy na Active24 musí směřovat na VPS IP
2. ✅ SSH přístup: `ssh had`
3. ✅ Git repo je pushnutý na GitHub
4. ✅ Docker a Nginx běží na VPS

## 🚀 Initial Deployment (První nasazení)

### 1. Připrav projekt lokálně

```bash
# Ujisti se, že všechny změny jsou commitnuté
cd /Users/lukaskarel/Projects/photographer-portfolio-app
git add .
git commit -m "Prepare for VPS deployment"
git push
```

### 2. Setup na VPS

Spusť tento příkaz **z lokálního počítače**:

```bash
ssh had << 'EOF'
  # Vytvoř složky
  sudo mkdir -p /var/www/fotimanalogem
  cd /var/www/fotimanalogem

  # Clone repo
  sudo git clone https://github.com/iamLukyy/photographer-portfolio-app.git .

  # Vytvoř data složky
  sudo mkdir -p data/uploads data/lib

  # Zkopíruj základní JSON soubory
  sudo cp lib/settings.json data/lib/settings.json
  sudo cp lib/photos.json data/lib/photos.json
  sudo cp lib/bookings.json data/lib/bookings.json
  sudo cp lib/coupons.json data/lib/coupons.json

  # Nastav práva
  sudo chmod -R 755 data/

  # Vytvoř .env soubor
  sudo tee .env > /dev/null << 'ENVEOF'
NODE_ENV=production
RESEND_API_KEY=re_tvuj_resend_api_key
CONTACT_EMAIL=info@mareksvaton.cz
ADMIN_PASSWORD=tvoje_bezpecne_heslo
ADMIN_COOKIE_SECURE=true
ENVEOF

  echo "✅ Project setup complete!"
EOF
```

### 3. Vytvoř docker-compose.yml

```bash
ssh had "cd /var/www/fotimanalogem && sudo tee docker-compose.yml > /dev/null" << 'EOF'
version: '3.8'

services:
  fotimanalogem:
    build: .
    container_name: fotimanalogem_app
    restart: unless-stopped
    ports:
      - "3050:3000"
    environment:
      - NODE_ENV=production
      - RESEND_API_KEY=${RESEND_API_KEY}
      - CONTACT_EMAIL=${CONTACT_EMAIL}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
      - ADMIN_COOKIE_SECURE=${ADMIN_COOKIE_SECURE}
    volumes:
      - ./data/uploads:/app/public/uploads
      - ./data/lib:/app/lib
    networks:
      - fotimanalogem_network

networks:
  fotimanalogem_network:
    driver: bridge
EOF
```

### 4. Build a spusť Docker

```bash
ssh had "cd /var/www/fotimanalogem && sudo docker compose build && sudo docker compose up -d"
```

### 5. Vytvoř Nginx konfiguraci

```bash
ssh had "sudo tee /etc/nginx/sites-available/mareksvaton.cz > /dev/null" << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name mareksvaton.cz www.mareksvaton.cz;

    # Upload limit pro velké fotky
    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:3050;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Přímé servírování fotek (rychlejší než přes Next.js)
    location /uploads/ {
        alias /var/www/fotimanalogem/data/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF
```

### 6. Aktivuj Nginx a získej SSL

```bash
# Aktivuj config
ssh had "sudo ln -s /etc/nginx/sites-available/mareksvaton.cz /etc/nginx/sites-enabled/"

# Test konfigurace
ssh had "sudo nginx -t"

# Reload nginx
ssh had "sudo systemctl reload nginx"

# Získej SSL certifikát (Let's Encrypt)
ssh had "sudo certbot --nginx -d mareksvaton.cz -d www.mareksvaton.cz"
```

### 7. Otevři setup wizard

Otevři browser a jdi na:
```
https://mareksvaton.cz/setup
```

Vyplň všechny údaje fotografa a dokončit setup.

---

## 🔄 Development Workflow (Běžný vývoj)

### Postup při vývoji změn:

#### 1. Lokální vývoj (na svém počítači)
```bash
cd /Users/lukaskarel/Projects/photographer-portfolio-app

# Udělej změny v kódu
# Test změny lokálně
pnpm dev

# Commit změny
git add .
git commit -m "Popis změny"
git push
```

#### 2. Deploy na VPS (aplikuj změny)
```bash
# Pull a rebuild - vše v jednom příkazu
ssh had "cd /var/www/fotimanalogem && sudo git pull && sudo docker compose build && sudo docker compose up -d"
```

#### 3. Sleduj logy (pokud něco nefunguje)
```bash
ssh had "cd /var/www/fotimanalogem && sudo docker compose logs -f"
```

---

## 🛠️ Užitečné příkazy

### Docker operace
```bash
# Status kontejneru
ssh had "cd /var/www/fotimanalogem && sudo docker compose ps"

# Restart aplikace
ssh had "cd /var/www/fotimanalogem && sudo docker compose restart"

# Sleduj logy (real-time)
ssh had "cd /var/www/fotimanalogem && sudo docker compose logs -f"

# Stop kontejneru
ssh had "cd /var/www/fotimanalogem && sudo docker compose down"

# Full restart (včetně buildu)
ssh had "cd /var/www/fotimanalogem && sudo docker compose down && sudo docker compose build && sudo docker compose up -d"
```

### Git operace
```bash
# Zkontroluj stav na VPS
ssh had "cd /var/www/fotimanalogem && sudo git status"

# Pull nejnovější změny
ssh had "cd /var/www/fotimanalogem && sudo git pull"

# Zobraz aktuální commit
ssh had "cd /var/www/fotimanalogem && sudo git log -1"
```

### Data operace
```bash
# Záloha dat
ssh had "cd /var/www && sudo tar -czf fotimanalogem-backup-$(date +%F).tar.gz fotimanalogem/data/"

# Zkontroluj velikost uploads
ssh had "du -sh /var/www/fotimanalogem/data/uploads/"

# Seznam fotek
ssh had "ls -lh /var/www/fotimanalogem/data/uploads/"
```

### Nginx operace
```bash
# Test konfigurace
ssh had "sudo nginx -t"

# Reload nginx (po změně configu)
ssh had "sudo systemctl reload nginx"

# Restart nginx
ssh had "sudo systemctl restart nginx"

# Sleduj nginx error log
ssh had "sudo tail -f /var/log/nginx/error.log"
```

---

## 🔒 Environment Variables

Edituj na VPS:
```bash
ssh had "cd /var/www/fotimanalogem && sudo nano .env"
```

**Důležité proměnné**:
```env
NODE_ENV=production
RESEND_API_KEY=re_xxxxx              # Z resend.com
CONTACT_EMAIL=info@mareksvaton.cz    # Email pro kontakty
ADMIN_PASSWORD=silne_heslo           # Heslo pro admin panel
ADMIN_COOKIE_SECURE=true             # Pro HTTPS
```

Po změně `.env` **restart Docker**:
```bash
ssh had "cd /var/www/fotimanalogem && sudo docker compose restart"
```

---

## 📊 Monitoring

### Kontrola stavu
```bash
# Je aplikace běžící?
ssh had "sudo docker ps | grep fotimanalogem"

# Kolik zabírá místa?
ssh had "du -sh /var/www/fotimanalogem"

# Volné místo na disku
ssh had "df -h"

# Test HTTP odpovědi
curl -I https://mareksvaton.cz
```

### SSL certifikát
```bash
# Ověř platnost SSL
ssh had "sudo certbot certificates | grep mareksvaton.cz -A 5"

# Ruční obnovení (automatické běží přes cron)
ssh had "sudo certbot renew --nginx"
```

---

## 🐛 Troubleshooting

### Aplikace nereaguje
```bash
# 1. Zkontroluj Docker
ssh had "cd /var/www/fotimanalogem && sudo docker compose ps"

# 2. Zkontroluj logy
ssh had "cd /var/www/fotimanalogem && sudo docker compose logs --tail=100"

# 3. Restart
ssh had "cd /var/www/fotimanalogem && sudo docker compose restart"
```

### Upload nefunguje
```bash
# Zkontroluj práva na uploads
ssh had "ls -la /var/www/fotimanalogem/data/uploads"

# Oprav práva
ssh had "sudo chmod -R 755 /var/www/fotimanalogem/data"
```

### 502 Bad Gateway
```bash
# Je Docker kontejner běžící?
ssh had "sudo docker ps | grep fotimanalogem"

# Zkontroluj port 3050
ssh had "sudo netstat -tlnp | grep 3050"

# Test nginx proxy
curl http://localhost:3050
```

### Změny se neprojevují
```bash
# Force rebuild bez cache
ssh had "cd /var/www/fotimanalogem && sudo docker compose build --no-cache && sudo docker compose up -d"
```

---

## 📁 Důležité cesty na VPS

| Co | Cesta |
|----|-------|
| Projekt | `/var/www/fotimanalogem` |
| Data | `/var/www/fotimanalogem/data` |
| Fotky | `/var/www/fotimanalogem/data/uploads` |
| Metadata | `/var/www/fotimanalogem/data/lib/*.json` |
| Nginx config | `/etc/nginx/sites-available/mareksvaton.cz` |
| SSL certifikáty | `/etc/letsencrypt/live/mareksvaton.cz/` |
| Docker logs | `docker compose logs` (v project dir) |

---

## ✅ Checklist pro deployment

- [ ] DNS záznamy změněny na Active24 (A záznamy)
- [ ] Projekt naklonován do `/var/www/fotimanalogem`
- [ ] `.env` soubor vytvořen a vyplněn
- [ ] `docker-compose.yml` vytvořen
- [ ] Data složky vytvořeny (`data/uploads`, `data/lib`)
- [ ] JSON soubory zkopírovány do `data/lib/`
- [ ] Docker image buildnutý a běžící
- [ ] Nginx konfigurace vytvořena a aktivována
- [ ] SSL certifikát získán (Certbot)
- [ ] Setup wizard dokončen (`/setup`)
- [ ] Test uploadu fotky v admin panelu
- [ ] Test kontaktního formuláře

---

## 🎨 Post-deployment

1. Otevři `https://mareksvaton.cz/setup`
2. Vyplň údaje fotografa
3. Upload profilovou fotku
4. Přihlaš se do `/admin`
5. Nahraj první fotky
6. Test booking systému
7. Test kontaktního formuláře

---

## 📞 Support

**Běžné příkazy pro rychlou opravu**:
```bash
# Quick restart
ssh had "cd /var/www/fotimanalogem && sudo docker compose restart"

# Full rebuild
ssh had "cd /var/www/fotimanalogem && sudo git pull && sudo docker compose build && sudo docker compose up -d"

# View logs
ssh had "cd /var/www/fotimanalogem && sudo docker compose logs -f"
```

---

Made with ♥♥ for photographers by Luky
