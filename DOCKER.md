# Docker Setup - Photo Portfolio

## 📋 Přehled

Tento projekt je nakonfigurován pro snadné nasazení pomocí Docker a Docker Compose.

**Port:** `3044` (mapován na interní port 3000)

## 🚀 Rychlý start

### 1. Příprava environment variables

Vytvoř `.env.local` soubor s potřebnými proměnnými:

```bash
cp .env.example .env.local
```

Uprav `.env.local` a nastav:
- `RESEND_API_KEY` - tvůj Resend API klíč
- `CONTACT_EMAIL` - email pro příjem zpráv z kontaktního formuláře

### 2. Build Docker image

```bash
docker-compose build
```

### 3. Spuštění aplikace

```bash
docker-compose up -d
```

Aplikace bude dostupná na: **http://localhost:3044**

## 🛠️ Užitečné příkazy

### Zobrazení logů
```bash
docker-compose logs -f photo-portfolio
```

### Zastavení aplikace
```bash
docker-compose down
```

### Restart aplikace
```bash
docker-compose restart
```

### Rebuild a restart po změnách
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Odstranění všeho (včetně volumes)
```bash
docker-compose down -v
```

## 📁 Struktura Docker souborů

```
.
├── Dockerfile           # Multi-stage build definice
├── docker-compose.yml   # Docker Compose konfigurace
├── .dockerignore       # Soubory ignorované při build
├── .env.example        # Příklad environment variables
└── DOCKER.md          # Tato dokumentace
```

## 🔧 Konfigurace

### Port mapping

V `docker-compose.yml` je nastaven port `3044:3000`:
- `3044` - externí port (přístupný z hostu)
- `3000` - interní port v kontejneru

Pro změnu externího portu uprav `docker-compose.yml`:

```yaml
ports:
  - "TVŮJ_PORT:3000"
```

### Environment variables

Všechny environment variables můžeš nastavit v:
1. `.env.local` souboru (preferovaný způsob)
2. Nebo přímo v `docker-compose.yml` v sekci `environment`

### Volumes (volitelné)

Pokud chceš mít photos dynamicky načítané z hostu, odkomentuj v `docker-compose.yml`:

```yaml
volumes:
  - ./photos:/app/photos:ro
  - ./lib/photos.json:/app/lib/photos.json:ro
```

## 🏥 Health check

Docker Compose obsahuje health check, který kontroluje dostupnost aplikace každých 30 sekund.

Status můžeš zkontrolovat:
```bash
docker-compose ps
```

## 🐛 Troubleshooting

### Port je obsazený
Pokud je port 3044 obsazený, změň ho v `docker-compose.yml`.

Zkontroluj obsazené porty:
```bash
lsof -ti:3044
```

### Build selhává
1. Zkontroluj, že máš nainstalovaný Docker a Docker Compose
2. Ujisti se, že máš dostatek místa na disku
3. Zkus build s `--no-cache`:
   ```bash
   docker-compose build --no-cache
   ```

### Aplikace nefunguje
1. Zkontroluj logy:
   ```bash
   docker-compose logs -f
   ```
2. Ověř, že jsou správně nastavené environment variables
3. Zkontroluj health status:
   ```bash
   docker-compose ps
   ```

## 📦 Production deployment

Pro nasazení na server:

1. Nakopíruj celý projekt na server
2. Nastav `.env.local` s produkčními hodnotami
3. Spusť `docker-compose up -d`
4. (Volitelně) Nastav reverse proxy (nginx/traefik) pro HTTPS

### Příklad nginx konfigurace

```nginx
server {
    listen 80;
    server_name tvojadomena.cz;

    location / {
        proxy_pass http://localhost:3044;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔐 Bezpečnost

- **.env.local** soubor je v `.gitignore` a `.dockerignore`
- Nikdy necommituj API klíče do gitu
- V produkci používej HTTPS (např. přes nginx reverse proxy)
- Pravidelně aktualizuj Docker image

## 💡 Tipy

1. **Multi-stage build** zajišťuje minimální velikost finálního image
2. **Health check** automaticky restartuje nefunkční kontejner
3. **PNPM** je použit pro rychlejší instalaci závislostí
4. **Standalone output** optimalizuje Next.js pro Docker
5. **Node 20 Alpine** poskytuje nejmenší možný base image

## 📚 Další zdroje

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
