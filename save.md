# MRT Real Estate — Save Point (March 6, 2026)

## Proyecto
- **Sitio:** MRT Real Estate — mrtrealestate.com
- **Tech:** Astro 5.16.6, React 19, Tailwind CSS v4, Vercel
- **Ubicacion local:** `/Users/saulgonzalez/Downloads/mrt-realestate/`
- **Dev server:** `npm run dev` → http://localhost:4321/
- **Brokerage:** Blue Ribbon Real Estate LLC — Lic. E-405
- **Contacto principal:** Marilyn Rivera — (787) 939-8739 — marilyn@mrtrealestate.com

---

## Completado

### Paginas Principales
- [x] **Inicio** (`/`) — Hero, servicios, YouTube videos (3 embeds), ubicaciones, CTA
- [x] **Propiedades** (`/properties`) — Xposure embed exclusivos (data-id=659384) + iframe MLS portal (listingspuertorico.com/userId_659384) + contenido SEO
- [x] **Vende tu Propiedad** (`/sell`) — Hero corregido (imagen absolute, layout fixed), formulario, proceso
- [x] **Nosotros** (`/about`) — Equipo real con fotos: Marilyn, Arelis, Marla
- [x] **Calculadoras** (`/calculators`) — Calculadora de hipoteca y ROI
- [x] **Blog** (`/blog`) — Blog con artículos
- [x] **Contacto** (`/contact`) — Formulario y mapa
- [x] **Admin** (`/admin`) — Panel de admin con settings, email, Google, MLS API

### Paginas Nuevas (creadas en esta sesion)
- [x] **Co-Broke** (`/co-broke`) — Politica de cooperacion entre corredores, terminos, proceso, contacto
- [x] **Showing** (`/showing`) — Solicitar visita, 3 pasos, contacto (telefono, WhatsApp, email)
- [x] **EDI** (`/edi`) — Electronic Data Interchange, integraciones (Stellar MLS, Xposure, Zillow)

### Equipo (About Page)
- [x] **Marilyn Rivera** — Fundadora & Agente Principal, foto real (`/images/team/marilyn.jpeg`)
- [x] **Arelis Gonzalez Estrada** — Agente & Inspectora, 8 años experiencia, G&G Inspectors, bilingue, foto real (`/images/team/arelis.jpeg`)
- [x] **Marla Enid Fuster Lamourt** — Agente, Lic. C-20059, KW desde 2018, foto real (`/images/team/marla.jpeg`)

### Footer
- [x] Redes sociales: Facebook, Instagram, YouTube, Zillow, WhatsApp
- [x] YouTube → youtube.com/@mrtrealestate1547
- [x] Zillow → zillow.com/profile/MRT%20Real%20Estate
- [x] WhatsApp → wa.me/17879398739
- [x] "Operando bajo Blue Ribbon Real Estate LLC — Lic. E-405"
- [x] Links a Co-Broke, Showing, EDI en Quick Links

### YouTube (Main Page)
- [x] Seccion con 3 videos embebidos
- [x] Boton "Ver Todos los Videos" → canal de YouTube

### Integraciones MLS
- [x] Xposure/RealtyHD embed script en pagina de propiedades (data-id="659384")
- [x] iframe de listingspuertorico.com con userId_659384 para busqueda MLS completa

---

## Pendiente / Por Mejorar

### Alta Prioridad
- [ ] **Verificar Xposure data-id:** El ID 659384 viene de InterfaceExpress/listingspuertorico.com. Puede que Xposure necesite un data-id diferente. Verificar en el admin de Xposure (admin.realtyhd.com) que el embed muestre los listings exclusivos correctamente.
- [ ] **Facebook e Instagram links:** Los iconos estan en el footer pero apuntan a "#". Necesitan las URLs reales de las paginas de Facebook e Instagram de MRT Real Estate.
- [ ] **Fotos de equipo — tamaño/calidad:** Las fotos de Arelis y Marla pueden necesitar crop/resize para uniformidad. Marilyn's photo es de WhatsApp (comprimida).

### Media Prioridad
- [ ] **Privacy Policy** (`/privacy`) — Link existe en footer pero la pagina no tiene contenido real
- [ ] **Terms of Service** (`/terms`) — Link existe en footer pero la pagina no tiene contenido real
- [ ] **Blog content** — Los articulos del blog son placeholder/genericos, necesitan contenido real
- [ ] **Property detail pages** (`/properties/[slug]`) — Actualmente usan data estatica de ejemplo
- [ ] **FeaturedProperties component** — Usa data hardcoded, deberia conectar a MLS/Xposure
- [ ] **Hero image** — Main page usa stock photo de Unsplash, considerar imagen real de Puerto Rico/propiedades de MRT
- [ ] **Contact form** — No tiene backend conectado, los formularios no envian emails
- [ ] **Search functionality** — El SearchBar del hero no esta funcional

### Baja Prioridad
- [ ] **SEO meta tags** — Revisar OG images, Twitter cards para cada pagina
- [ ] **Logo real** — Se usa un circulo dorado con "MRT", considerar logo oficial si existe
- [ ] **Responsive testing** — Verificar mobile en todos los breakpoints
- [ ] **Performance** — YouTube iframes pesan, considerar lazy load o click-to-play
- [ ] **Accessibility** — Revisar contraste, alt texts, focus states
- [ ] **Estadisticas del About** — "$500M+", "1,200+", "15+", "98%" son placeholder, verificar numeros reales
- [ ] **Locations section** — Los counts de propiedades (150, 45, 38, 62) son placeholder
- [ ] **Admin panel** — Tiene paginas de settings/email/Google/MLS API pero no tienen backend funcional
- [ ] **Mapa en Contact** — Verificar que el embed de Google Maps tiene la ubicacion correcta

---

## Estructura de Archivos Clave

```
src/
  pages/
    index.astro          # Main page
    about.astro          # Nosotros + equipo
    sell.astro           # Vende tu propiedad
    contact.astro        # Contacto
    calculators.astro    # Calculadoras
    co-broke.astro       # Co-Broke policy (NEW)
    showing.astro        # Solicitar showing (NEW)
    edi.astro            # EDI info (NEW)
    properties/
      index.astro        # Listings (Xposure + MLS portal)
      [slug].astro       # Property detail
    blog/
      index.astro        # Blog listing
      [slug].astro       # Blog post
    admin/               # Admin panel pages
  components/
    common/
      Header.astro       # Nav header (fixed)
      Footer.astro       # Footer with social links
      Navigation.astro   # Nav links
    home/
      Hero.astro         # Main hero section
      FeaturedProperties.tsx  # React component
      Stats.astro        # Stats section
    properties/          # Property components
  layouts/
    BaseLayout.astro     # Base layout wrapper
  styles/
    global.css           # Tailwind v4 theme (navy/gold)
public/
  images/
    team/
      marilyn.jpeg       # Foto real
      arelis.jpeg        # Foto real
      marla.jpeg         # Extraida de PDF
```

---

## Credenciales / IDs Importantes
- **Xposure/RealtyHD user ID:** 659384
- **MLS Portal:** properties.listingspuertorico.com/userId_659384
- **YouTube:** @mrtrealestate1547
- **Zillow:** /profile/MRT%20Real%20Estate
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
vercel --prod
```

Para continuar con Claude Code, di: **"CONTINUE MRT"** y lee este archivo.
