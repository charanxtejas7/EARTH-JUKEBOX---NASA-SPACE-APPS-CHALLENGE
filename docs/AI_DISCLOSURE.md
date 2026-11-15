# Earth Jukebox — AI Assistance Disclosure

> **NASA Space Apps Challenge 2026**  
> In accordance with hackathon rules on transparency and integrity, this document discloses all AI tools, models, and AI-assisted source files used during the development of Earth Jukebox.

---

## 1. Human Authorship & Concept Statement

> [Our team chose this challenge because we felt that understanding our changing planet should not depend entirely on the ability to see it. While exploring NASA’s Earth Information Center visualizations, we began thinking about how the same imagery could be experienced through another sense. This led us to the idea of Earth Jukebox: translating the colours, brightness and spatial patterns of NASA’s rendered Earth imagery into sound, creating a more inclusive and engaging way for people to experience our planet.]

**Core Statement**:  
The original concept, scientific scope, artistic sound design philosophies, musical scale choices, and UI/UX design architecture are entirely the team's own work. Artificial Intelligence was utilized strictly as an engineering assistant and pair programmer to accelerate code implementation, debug WebGL/GLSL shaders, construct Web Audio DSP graphs, and audit accessibility compliance. All code was reviewed, tested, and validated by the human team.

---

## 2. AI Tools Utilized

- **Claude 3.5 Sonnet** (Anthropic): Used for frontend component structuring, CSS layout refinements, and documentation drafting.
- **Google Antigravity** (Google DeepMind): Used for terminal orchestration, WebGL shader debugging, Web Audio API synthesis graph construction, and automated claims auditing.

---

## 3. Comprehensive File-by-File AI Assistance Log

| File Path | Role of AI Assistance | Human Team Oversight & Input |
|---|---|---|
| `src/audio/analyse.js` | Implementation of 2D canvas `drawImage` and `getImageData` pixel column sampling algorithms. | Formulated the $160 \times 80$ uniform sampling grid concept and 8-latitude-band division. |
| `src/audio/engine.js` | Construction of Web Audio oscillator voice nodes, dynamics compressor, and binary RIFF LIST/INFO WAV encoder. | Specified 16-bit 44.1 kHz stereo format requirements and audio envelope timings. |
| `src/audio/mapping.js` | Coding the mathematical transfer functions and scale step lookup tables. | Conceived the 7 musical scales, root tonics, timbre descriptors, and artistic narrative rationales. |
| `src/components/SpaceScene.jsx` | Implementation of custom GLSL vertex/fragment shaders for sphere-to-plane morphing and Three.js Raycaster seeking. | Defined the 3D-to-2D visual concept and interactive "Touch the Earth" audio probe design. |
| `src/components/Controls.jsx` | React component scaffolding and magnetic cursor drift logic. | Decided control hierarchy, 52px magnetic button size, and projection lock rules. |
| `src/components/NowShowing.jsx` | Component formatting and honest science disclaimer display. | Mandated the exact honest science statement and stand-in artwork labeling rules. |
| `src/components/NowPlayingHud.jsx` | Real-time oscilloscope canvas drawing logic and WAV export button handler. | Specified UI positioning and 1-click export requirement. |
| `src/components/AboutPanel.jsx` | Drawer layout and metadata rendering. | Curated plain-language data explanations and color meaning descriptions. |
| `src/components/Sources.jsx` | Dynamic mapping of `nasa-assets.json` to credit items. | Verified exact NASA SVS and Worldview credit lines and guidelines URL. |
| `src/components/TourModal.jsx` | Interactive climate landmark carousel component. | Selected the 7 geographic locations and authored scientific descriptions. |
| `src/components/DiscoverModal.jsx` | Full-frame color histogram bucket visualization. | Designed the Acoustic DNA and spectral distribution interface. |
| `src/components/SoundGalleryModal.jsx` | Sound gallery grid component layout. | Defined track arrangement and browsing experience. |
| `src/components/ExecutiveReviewModal.jsx` | Global awards criteria evaluation modal scaffolding. | Directed alignment with NASA Space Apps Challenge award categories. |
| `src/lib/standins.js` | Algorithmic procedural 2D canvas patterns. | Mandated strict standalone code art rules (no AI-generated imagery). |
| `src/lib/scramble.js` | Text transition scramble effect utility. | Requested subtle, non-stroboscopic visual feedback on track changes. |
| `src/lib/benchmark.js` | Automated performance telemetry and latency sampling class. | Defined the empirical measurement methodology (300 frames, 10 clicks). |
| `scripts/fetch-nasa.mjs` | Node.js script for streaming SVS media with hostname validation. | Established security constraint: allowlist only official `svs.gsfc.nasa.gov` URLs. |
| `scripts/fetch-worldview.mjs` | Node.js script for fetching GIBS snapshots with hostname validation. | Selected the 4 Worldview satellite products and verified date strings. |
| `src/App.jsx` | React root state orchestration, keyboard shortcuts, and ARIA live regions. | Supervised application architecture, data flow, and interaction design. |

---

## 4. Verification and Review Statement

Every line of code generated with AI assistance was reviewed for:
1. Strict adherence to hackathon rules (no NASA logos, no false endorsements, no AI-generated images/videos/audio).
2. Code correctness, absence of runtime console errors, and deterministic audio reproduction.
3. Security boundaries (zero external runtime calls, strict hostname validation on setup scripts).
4. Accessibility compliance (WCAG 2.1 AA focus rings, screen reader announcements, and reduced motion).
