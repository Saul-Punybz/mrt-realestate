# MRT Real Estate — Save Point (March 10, 2026)

## Proyecto
- **Sitio:** MRT Real Estate — mrtrealestate.com
- **Tech:** Astro 5.16.6, React 19, Tailwind CSS v4, Vercel
- **Ubicacion local:** `/Users/saulgonzalez/Downloads/mrt-realestate/`
- **Dev server:** `npm run dev` → http://localhost:4321/
- **Brokerage:** Blue Ribbon Real Estate LLC — Lic. E-405
- **Contacto principal:** Marilyn Rivera — (787) 939-8739 — marilyn@mrtrealestate.com

## Deployment
- **GitHub:** https://github.com/Saul-Punybz/mrt-realestate
- **Vercel:** https://mrt-realestate.vercel.app
- **Vercel team:** example-pages-projects
- **Deploy:** `vercel --prod` desde el directorio del proyecto

---

## Completado

### Paginas (43 total, todas building OK)
- [x] **Inicio** (`/`) — Hero, servicios, YouTube videos (3 embeds), ubicaciones, CTA
- [x] **Propiedades** (`/properties`) — Listings exclusivos con filtros + sección de alquileres + MLS map portal con scroll protection
- [x] **Vende tu Propiedad** (`/sell`) — Hero, formulario, proceso
- [x] **Nosotros** (`/about`) — Equipo real con fotos: Marilyn, Arelis, Marla
- [x] **Calculadoras** (`/calculators`) — Calculadora de hipoteca y ROI
- [x] **Blog** (`/blog`) — 6 artículos con imágenes reales de listings
- [x] **Contacto** (`/contact`) — Formulario, YouTube/Zillow/WhatsApp links
- [x] **Co-Broke** (`/co-broke`) — Politica de cooperacion entre corredores
- [x] **Showing** (`/showing`) — Solicitar visita, 3 pasos, contacto
- [x] **EDI** (`/edi`) — Electronic Data Interchange info
- [x] **Admin** (`/admin`) — Panel con settings, email, Google, MLS API (5 paginas)
- [x] **22 Property Detail Pages** — Cada listing con galería, detalles, mapa, contacto
- [x] **6 Blog Posts** — Guía compra, Act 60, zonas, hipoteca, Airbnb, mercado

### Datos Reales (110+ fotos)
- [x] 22 listings extraídos de RealtyHD con fotos reales descargadas
- [x] Fotos de equipo reales (Marilyn, Arelis, Marla)
- [x] Blog usa fotos de listings reales (no Unsplash)
- [x] Cero imágenes de Unsplash en todo el sitio

### Últimos Cambios (Sesión Mar 10)
- [x] **Footer rediseñado** — Banner dorado con Co-Broke/Showing/EDI prominentes, ciudades reales, social links reales
- [x] **SearchBar actualizado** — Ciudades y tipos de propiedad reales de MRT
- [x] **Blog images** — Reemplazadas todas las imágenes Unsplash por fotos de listings
- [x] **Direcciones corregidas** — "San Juan" → "Arecibo" en todo el sitio (contact, sell, admin, BaseLayout schema)
- [x] **Links rotos arreglados** — Removidos /privacy, /terms, href="#" placeholders
- [x] **MLS Map portal** — Branded top/bottom bars con logo MRT, "En vivo" indicator, phone CTA
- [x] **Scroll protection en MLS map** — Click-to-activate overlay, auto-deactivate al scrollear fuera, pointer-events:none por defecto. Resuelve el problema de quedar atrapado en el mapa.
- [x] **PropertyFilters compactados** — Padding reducido, texto xs, beds/baths side-by-side, property types como chips, amenities removidos
- [x] **Properties page layout** — Hero → Listings Grid (con filtros) → Alquileres → MLS Map → SEO content
- [x] **Subido a GitHub** — Repo público Saul-Punybz/mrt-realestate
- [x] **Desplegado a Vercel** — Build exitoso, 43 páginas, producción live

### Equipo (About Page)
- [x] **Marilyn Rivera** — Fundadora & Agente Principal (`/images/team/marilyn.jpeg`)
- [x] **Arelis Gonzalez Estrada** — Agente & Inspectora, G&G Inspectors (`/images/team/arelis.jpeg`)
- [x] **Marla Enid Fuster Lamourt** — Agente, Lic. C-20059 (`/images/team/marla.jpeg`)

---

## Pendiente / Por Mejorar

### Alta Prioridad
- [ ] **Custom domain** — Configurar mrtrealestate.com en Vercel (Settings > Domains)
- [ ] **Verificar Xposure data-id:** El ID 659384 de InterfaceExpress. Verificar en admin.realtyhd.com
- [ ] **Fotos de equipo** — Crop/resize para uniformidad

### Media Prioridad
- [ ] **Blog content** — Los artículos son genéricos, necesitan contenido real
- [ ] **Contact form backend** — Los formularios no envían emails (necesita SendGrid o similar)
- [ ] **Search functionality** — El SearchBar del hero no es funcional
- [ ] **Hero image** — Considerar imagen real de PR en vez de gradiente
- [ ] **FeaturedProperties** — Conectar a MLS/Xposure en vez de data estática

### Baja Prioridad
- [ ] **SEO meta tags** — Revisar OG images por página
- [ ] **Logo real** — Se usa círculo dorado "MRT", considerar logo oficial
- [ ] **Responsive testing** — Verificar mobile en todos los breakpoints
- [ ] **Performance** — YouTube iframes pesan, considerar lazy load
- [ ] **Accessibility** — Contraste, alt texts, focus states
- [ ] **Estadísticas About** — "$500M+", "1,200+", etc. son placeholder
- [ ] **Admin panel backend** — Settings pages sin backend funcional

---

## Estructura de Archivos Clave

```
src/
  pages/
    index.astro          # Homepage
    about.astro          # Nosotros + equipo
    sell.astro           # Vende tu propiedad
    contact.astro        # Contacto
    calculators.astro    # Calculadoras
    co-broke.astro       # Co-Broke policy
    showing.astro        # Solicitar showing
    edi.astro            # EDI info
    properties/
      index.astro        # Listings + MLS map portal
      [slug].astro       # Property detail
    blog/
      index.astro        # Blog listing
      [slug].astro       # Blog post
    admin/               # Admin panel (5 pages)
    api/                 # API routes (contact, property-inquiry)
  components/
    common/
      Header.astro       # Nav header (fixed)
      Footer.astro       # Footer con banner dorado + social links
    home/
      Hero.astro         # Main hero
      FeaturedProperties.tsx
      SearchBar.tsx
    properties/
      PropertyFilters.tsx  # Filtros compactos
      PropertyGrid.tsx     # Grid de listings
      PropertyCard.tsx     # Card individual
      PropertyGallery.tsx  # Galería de fotos
      PropertyDetails.tsx  # Detalles de propiedad
    forms/
      ContactForm.tsx    # Formulario de contacto
    calculators/
      MortgageCalculator.tsx
      ROICalculator.tsx
  data/
    listings.ts          # 22 listings con datos reales + fotos
  layouts/
    BaseLayout.astro     # Layout base (SEO, Schema.org)
    AdminLayout.astro    # Layout admin
  styles/
    global.css           # Tailwind v4 theme (navy/gold)
public/
  images/
    listings/            # 110+ fotos reales de propiedades (~39MB)
    team/                # Fotos de equipo (3)
```

---

## Credenciales / IDs
- **Xposure/RealtyHD user ID:** 659384
- **MLS Portal:** properties.listingspuertorico.com/userId_659384
- **YouTube:** @mrtrealestate1547
- **Zillow:** /profile/MRT%20Real%20Estate
- **WhatsApp:** +17879398739
- **Brokerage:** Blue Ribbon Real Estate LLC — Lic. E-405
- **Marla Lic.:** C-20059

---

## Como Continuar

```bash
cd /Users/saulgonzalez/Downloads/mrt-realestate
npm run dev
# Abre http://localhost:4321/
```

Para deploy a Vercel:
```bash
cd /Users/saulgonzalez/Downloads/mrt-realestate
vercel --prod
```

Para continuar con Claude Code, di: **"CONTINUE MRT"** y lee este archivo.
