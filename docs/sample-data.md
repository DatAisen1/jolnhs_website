# Sample Content Data (for admin panel encoding)

> **SAMPLE ONLY** — every name, figure, and link below is invented test data,
> not official JOLNHS or DepEd information. It exists so the site can be
> developed and demoed end-to-end without waiting for school sign-off.
> Replace each value with the real one via the same admin screens when the
> school provides it. Nothing needs a database re-seed — the admin panel
> writes straight to Supabase.

Encode in any order; each section notes where it goes and where it appears.

---

## 1. Site Settings — Admin → Settings → Save Changes

Appears in the public footer, contact page, and page metadata.

| Field | Sample value |
|---|---|
| Site Name | `Julia Ortiz Luis National High School` |
| Tagline | `Excellence in education, service to community.` |
| Address | `Sto. Domingo, Nueva Ecija, Philippines` |
| Email | `info@jolnhs.example.edu` |
| Facebook Handle | `@JOLNHSsample` |
| Facebook URL | `https://www.facebook.com/jolnhs.sample` |
| Google Maps URL | `https://maps.google.com/?q=Sto.+Domingo,+Nueva+Ecija` |
| School Type | `Public Secondary School (National High School)` |
| Department | `Department of Education (DepEd)` |
| Programs Offered | `Junior High School (Grades 7–10), Senior High School (Grades 11–12): STEM, ABM, HUMSS, GAS, TVL` |
| Mission Statement | `To provide quality, accessible, and values-driven secondary education that prepares every learner for college, work, and responsible citizenship.` |
| Office Hours | `Monday–Friday: 7:00 AM – 5:00 PM, Saturday: Closed, Sunday: Closed, Holidays: Closed` |

**Office Hours format matters** — the footer parses it as comma-separated
`Day: Hours` pairs, so keep exactly this shape.

---

## 2. Staff & Faculty — Admin → Staff & Faculty → Add

Each entry needs: name, position, category. Photo is optional (placeholder
shows if none). Sample names are invented.

### Administrators

| Name | Position |
|---|---|
| Maria Corazon D. Reyes | School Principal II |
| Jose Miguel A. Santos | Assistant Principal, JHS |
| Lorna B. Villanueva | Assistant Principal, SHS |

### JHS Faculty

| Name | Position |
|---|---|
| Ricardo C. Dela Cruz | Teacher III — Mathematics |
| Angelica M. Ramos | Teacher II — English |
| Paolo Vincent G. Aquino | Teacher I — Science |
| Katrina S. Bautista | Teacher I — Filipino |
| Dennis P. Mercado | Teacher II — Araling Panlipunan |
| Rowena T. Gutierrez | Teacher I — MAPEH |

### SHS Faculty

| Name | Position |
|---|---|
| Ferdinand L. Ortega | Teacher III — STEM |
| Cristina Joy E. Navarro | Teacher II — ABM |
| Marvin J. Salazar | Teacher I — HUMSS |
| Irene V. Dominguez | Teacher I — TVL |

### Staff (non-teaching)

| Name | Position |
|---|---|
| Alberto R. Magpantay | Administrative Officer II |
| Sheila Ann P. Corpuz | School Registrar |
| Nomer B. Ilagan | School Nurse |

---

## 3. Campus Life — Admin → Campus Life (one tab per section)

Each section has: Eyebrow, Title, Tagline, Description, Statistics
(label + value), Highlights (title + description), and Officers
(name + position).

### Student Athletes (`athletes`)

- **Eyebrow:** `Sports & Athletics`
- **Title:** `Student Athletes`
- **Tagline:** `Discipline on the court, excellence in the classroom.`
- **Description:** `JOLNHS athletes represent the school in district, division, and regional meets across volleyball, basketball, athletics, and sepak takraw. The program balances competitive training with academic support.`
- **Statistics:**
  - `Student Athletes` → `120+`
  - `Sports Disciplines` → `6`
  - `Division Medals (sample)` → `18`
- **Highlights:**
  - `District Volleyball Champions` → `The girls' volleyball team took first place at the district meet (sample).`
  - `Regional Qualifiers` → `Five track athletes qualified for the regional athletics competition (sample).`
  - `Sports Clinic Program` → `Free weekend clinics introduce Grade 7 learners to organized sports (sample).`
- **Officers:**
  - `John Rey P. Castillo` → `Team Captain, Volleyball`
  - `Aira Nicole D. Flores` → `Team Captain, Basketball`

### Parents–Teachers Association (`pta`)

- **Eyebrow:** `Community`
- **Title:** `Parents–Teachers Association`
- **Tagline:** `Stronger school, stronger community.`
- **Description:** `The PTA partners with the school on projects, programs, and parent engagement. It meets monthly and leads fundraising for campus improvements.`
- **Statistics:**
  - `Active Members` → `250+`
  - `Projects Funded (sample)` → `8`
  - `General Assemblies / Year` → `4`
- **Highlights:**
  - `Feeding Program Support` → `PTA volunteers assist the school-based feeding program (sample).`
  - `Campus Beautification` → `Funded repainting of the main gate and garden landscaping (sample).`
  - `Brigada Eskwela` → `Annual week-long cleanup and repair drive before classes open (sample).`
- **Officers:**
  - `Imelda G. Santiago` → `PTA President`
  - `Renato L. Padilla` → `PTA Vice President`
  - `Grace T. Alonzo` → `Secretary–Treasurer`

### Student Organizations (`organizations`)

- **Eyebrow:** `Clubs & Societies`
- **Title:** `Student Organizations`
- **Tagline:** `Find your people, build your passion.`
- **Description:** `From the student government to subject clubs and interest groups, JOLNHS organizations give learners space to lead, create, and serve.`
- **Statistics:**
  - `Active Organizations` → `14`
  - `Club Members` → `400+`
  - `Events per Year (sample)` → `20+`
- **Highlights:**
  - `Supreme Student Government` → `Leads student initiatives, intramurals, and student week activities (sample).`
  - `Science & Math Club` → `Runs quiz bees, fairs, and peer tutoring sessions (sample).`
  - `Performing Arts Guild` → `Produces the annual foundation day showcase (sample).`
- **Officers:**
  - `Sophia Mae R. Fernandez` → `SSG President`
  - `Karl Vincent M. Torres` → `SSG Vice President`

### Campus Journalists (`journalists`)

- **Eyebrow:** `Student Media`
- **Title:** `Campus Journalists`
- **Tagline:** `Telling the school's story, one issue at a time.`
- **Description:** `The campus press corps covers school events, publishes the school paper, and competes in division and regional schools press conferences.`
- **Statistics:**
  - `Staff Writers` → `24`
  - `Issues Published / Year` → `4`
  - `RSPC Awards (sample)` → `6`
- **Highlights:**
  - `The Ortiz Ledger` → `The school paper publishes quarterly in print and online (sample).`
  - `DSPC Qualifiers` → `Eight writers advanced to the division press conference (sample).`
  - `Photojournalism Wins` → `Two first-place finishes in photojournalism (sample).`
- **Officers:**
  - `Bea Antoinette L. Cruz` → `Editor-in-Chief`
  - `Miguel Angelo S. Reyes` → `Associate Editor`

---

## 4. Budget — Admin → Budget (repeat of earlier sample data)

### Step 1 — Fiscal year

Create `SY 2026-2027`, then set: Total proposed budget `4850000`,
hero heading `Budget Transparency`, disclaimer
`SAMPLE DATA: The figures on this page are illustrative test data and are not official JOLNHS or DepEd financial records.`

### Step 2 — Categories (8, totalling ₱4,850,000)

| Name | Allocation | Icon | Color |
|---|---|---|---|
| Instructional Materials | `1150000` | Instructional Materials | Primary Blue |
| Facilities & Maintenance | `980000` | Facilities & Maintenance | Sapphire |
| ICT & Technology | `720000` | ICT & Technology | Sky Blue |
| Utilities | `610000` | Utilities | Deep Navy |
| Student Programs | `540000` | Student Programs | Light Blue |
| Sports & PE | `320000` | Sports & PE | Midnight |
| Health & Nutrition | `280000` | Health & Nutrition | Near Ink |
| Administrative & Operations | `250000` | Administrative & Operations | Pale Blue |

### Step 3 — Accomplishments (title / date / amount / status / period)

- Science Laboratory Supplies Restocked / 2026-07-15 / 185000 / Completed / July 2026
- Grade 11 Learning Modules Printed / 2026-09-30 / 240000 / In Progress / Sept–Oct 2026
- Building B Roof Repair / 2026-06-20 / 350000 / Completed / June 2026
- Comfort Room Renovation / 2026-11-15 / 280000 / Upcoming / Nov 2026
- Computer Laboratory Upgrade / 2026-08-10 / 420000 / Completed / August 2026
- Campus Wi-Fi Expansion / 2026-10-20 / 150000 / In Progress / Oct 2026
- Leadership Training Seminar / 2026-08-25 / 60000 / Completed / August 2026
- Intramurals 2026 / 2026-09-12 / 90000 / Completed / September 2026
- School-Based Feeding Program / 2026-08-01 / 150000 / In Progress / Aug 2026 – Mar 2027

---

## Still genuinely needed from the school (not blocking)

- Real photos for staff, officers, gallery, and the homepage hero
  (`public/videos/hero.mp4` + `public/images/hero-poster.jpg`)
- Swapping every sample value above for the real one via the admin panel
