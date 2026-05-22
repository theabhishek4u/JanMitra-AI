# 🏛️ Hackathon Submission: JanMitra AI
## Next-Gen Autonomous Grievance Redressal & Predictive Smart Governance Platform

---

### 🚀 Elevator Pitch
**JanMitra AI** (Jan = People, Mitra = Friend) is an AI-powered, autonomous public grievance redressal and predictive municipal governance platform. By translating, categorizing, and auto-routing citizen complaints (filed via Hindi, English, Hinglish text, photos, or voice) in seconds, it eliminates administrative silos, automates SLAs, and forecasts municipal hazards before they happen.

---

### 🔴 The Problem (Why JanMitra AI is needed)
Modern municipal administrations handle thousands of citizen grievances daily, but are choked by **three systemic bottlenecks**:
1. **Language & Interface Barriers:** Citizens struggle with rigid forms and lack localized language options. Many prefer speaking (voice) or writing in mixed dialects (*Hinglish* or local languages), which traditional IT portals cannot parse.
2. **Manual Dispatch & Administrative Silos:** A grievance sits for days waiting for human operators to manually read, categorize, and route it to the correct department (e.g., distinguishing whether a water leak goes to Jal Nigam or PWD). This results in routing errors and extreme delays.
3. **Reactive Governance (Fixing after failure):** Municipalities only act *after* a disaster occurs (e.g., clearing waterlogging after a street is flooded). There is no predictive infrastructure utilizing historical citizen datasets to deploy preventative resources.

---

### 🟢 The Solution (What we built)
**JanMitra AI** bridges the gap between citizens and local authorities with a **three-way autonomous architecture**:

#### 1. The Citizen Engagement Portal
*   **Multilingual NLP Engine:** Accepts complaints in Hindi (Devanagari), Hinglish (Roman Hindi), or English.
*   **Voice Filing:** Speech-to-text integration captures oral complaints and converts them to structured, high-accuracy summaries.
*   **Interactive Diagnostic Timeline:** A visual "holographic" processing suite shows citizens how the AI engine scans their input, estimates a trust index, screens for spam, and matches their issue with the correct nodal officer in real-time.
*   **GIS Geolocation Mapping:** Integrated geocoding maps and reverse-geocodes complaint coordinates (e.g., Gomti Nagar, Lucknow) to pinpoint repair sites exactly.

#### 2. The Officer Command Console
*   **Autonomous Smart Routing:** Automatically assigns incoming complaints to the corresponding municipal department (Nagar Nigam, Jal Nigam, PWD, UPPCL) with **94%+ accuracy** using weighted NLP keyword heuristics.
*   **Active Hotspot Detection:** Monitors incoming ticket streams and alerts officers if a localized spike occurs (e.g., *"🔥 HOTSPOT ALERT: 5 active sewer complaints in Sector 14"*), prompting emergency crew deployments.
*   **Duplicate Merging Heuristics:** Automatically identifies and merges overlapping complaints about the same issue from the same area, preventing redundant workflows.
*   **SLA Auto-Escalation Engine:** An AI agent that tracks resolution deadlines. If a department delays action, the ticket automatically escalates up the hierarchy (e.g., from Ward Inspector to Chief Engineer) with instant notifications.

#### 3. The Predictive Governance & Admin Dashboard
*   **Rich Interactive Analytics:** Beautiful telemetry graphs (grievance trends, category counts, department resolution times) built with **Recharts**.
*   **Preventative Municipal Forecasting:** Predicts seasonal municipal crises (e.g., pre-monsoon drainage blocks, summer electric grid strain) based on historical monthly datasets, enabling proactive resource allocation.

---

### 💻 Technology Stack & Architecture
*   **Frontend Framework:** Next.js 16 (App Router) & React 19 (for ultra-fast loading, SSR, and clean component architecture).
*   **Styling & Animations:** Tailwind CSS v4 & Framer Motion (for fluid animations, premium neon-glowing custom borders, glassmorphic UI elements, and a futuristic Command Center HUD).
*   **Mapping & GIS:** Leaflet & React Leaflet (real-time interactive location coordinates and department overlays).
*   **Data Visualizations:** Recharts (responsive administrative performance charting).
*   **Database (Supabase / PostgreSQL):** Custom-designed database schema featuring custom Enum types, spatial indices, automatic row-level security (RLS) policies, and trigger logs.

---

### 🌟 Key Innovations & Judge Delighters ("Wow" Factors)
1. **The Interactive AI Playground:** Built a fully operational simulation sandbox directly on the landing page! Judges can click real-world presets (like a broken water pipe description written in pure Hinglish) and witness the AI run a step-by-step diagnostic scanning sweep, outputting department matches, officer names, and priority tiers within 4 seconds.
2. **Futuristic Visual Design:** Swapped template UIs for custom dark-mode aesthetics, dynamic glassmorphic card widgets, radial color blends, glowing neon laser sweep bars, and real-time blinking active indicators.
3. **The Duplication & Hotspot Algorithmic Engine:** A clever backend heuristic that aggregates complaints and prevents municipal system choke-ups by collapsing multiple user reports into unified "master cases."

---

### 📈 Future Roadmap & Scalability
*   **Computer Vision Multi-modal Uplift:** Expanding the current photo scanner mock into a fully trained convolutional neural network (CNN) model that identifies the severity of road potholes or garbage piles from photos.
*   **WhatsApp & Telegram Bot Integration:** Allowing citizens in rural sectors to file grievances via WhatsApp voice notes, which JanMitra converts, routes, and logs automatically.
*   **IoT Smart-Sensors Integration:** Connecting water-pressure and electricity grid sensors to trigger self-filing tickets before citizens even realize a utility pipe has burst.
