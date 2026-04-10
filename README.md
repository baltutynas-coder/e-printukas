# 🖨️ e.printukas.lt

Elektroninė parduotuvė — drabužių ir tekstilės e-shop.

## Technologijos

| Sluoksnis | Technologija |
|-----------|-------------|
| Frontend | Next.js + React + Tailwind CSS |
| Backend | Node.js + Express |
| Duomenų bazė | PostgreSQL + Prisma ORM |
| Auth | JWT (tik admin) |
| Mokėjimai | Stripe |
| Nuotraukos | Cloudinary (prod) / lokalu (dev) |

## Greitas paleidimas

### 1. Klonuoti projektą
```bash
git clone https://github.com/TAVO-USERNAME/e-printukas.git
cd e-printukas
```

### 2. Įdiegti priklausomybes
```bash
cd backend && npm install
```

### 3. Sukonfigūruoti aplinką
```bash
cp .env.example .env
# Redaguok .env failą su savo reikšmėmis
```

### 4. Paleisti PostgreSQL
Reikia PostgreSQL duomenų bazės. Galimi variantai:
- **Supabase** (nemokama) — supabase.com
- **Docker**: `docker run -p 5432:5432 -e POSTGRES_DB=eprintukas -e POSTGRES_PASSWORD=secret postgres:16`
- **Lokaliai** — postgresql.org/download

### 5. Sukurti DB lenteles
```bash
cd backend
npx prisma migrate dev --name init
```

### 6. Užpildyti pradiniais duomenimis
```bash
npm run db:seed
```

### 7. Paleisti serverį
```bash
npm run dev
```

API veikia: http://localhost:4000

### 8. Patikrinti
```bash
curl http://localhost:4000/api/health
```

## API Maršrutai

### Vieši (klientams)
| Metodas | URL | Aprašymas |
|---------|-----|-----------|
| GET | /api/products | Produktų sąrašas |
| GET | /api/products/:slug | Produkto detalės |
| GET | /api/categories | Kategorijų sąrašas |
| POST | /api/orders | Sukurti užsakymą |

### Admin (reikia JWT token)
| Metodas | URL | Aprašymas |
|---------|-----|-----------|
| POST | /api/auth/login | Prisijungti |
| POST | /api/auth/register | Pirmas admin (tik kartą) |
| POST | /api/products | Sukurti produktą |
| PUT | /api/products/:id | Redaguoti |
| DELETE | /api/products/:id | Ištrinti |
| GET | /api/orders | Visi užsakymai |
| PUT | /api/orders/:id/status | Keisti statusą |

## Admin prisijungimas (dev)
- **Email:** admin@eprintukas.lt
- **Slaptažodis:** admin123

## Failų struktūra
```
e-printukas/
├── backend/
│   ├── config/db.js          # DB prisijungimas
│   ├── middleware/auth.js     # JWT autentifikacija
│   ├── routes/
│   │   ├── auth.js           # Admin login/register
│   │   ├── products.js       # Produktų CRUD
│   │   ├── categories.js     # Kategorijų CRUD
│   │   ├── orders.js         # Užsakymai
│   │   └── upload.js         # Nuotraukų įkėlimas
│   ├── seed.js               # Pradiniai duomenys
│   └── server.js             # Express serveris
├── frontend/                  # (Next.js — bus sukurta)
├── prisma/schema.prisma       # DB schema
├── .env.example               # Aplinkos kintamieji
└── README.md
```
