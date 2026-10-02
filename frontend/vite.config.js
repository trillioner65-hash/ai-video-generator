:root {
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.5;
  color: #e5eefc;
  background: #081120;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}

html, body, #root {
  margin: 0;
  min-height: 100%;
  min-height: 100vh;
}

body {
  background: radial-gradient(circle at top, #102346, #081120 55%);
}

button, input, select, textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px 20px;
}

.auth-card,
.app-card {
  width: min(1040px, 100%);
  background: rgba(12, 19, 33, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 24px;
  box-shadow: 0 28px 80px rgba(2, 6, 23, 0.55);
}

.auth-card {
  padding: 28px;
}

.auth-header {
  margin-bottom: 20px;
}

.eyebrow {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #7dd3fc;
}

h1 {
  margin: 8px 0 0;
  font-size: clamp(2rem, 4vw, 3rem);
}

.auth-toggle {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.auth-toggle button,
.primary-btn,
.secondary-btn {
  border: 0;
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 700;
}

.auth-toggle button {
  background: rgba(148, 163, 184, 0.12);
  color: white;
}

.auth-toggle button.active,
.primary-btn {
  background: linear-gradient(135deg, #38bdf8, #8b5cf6);
  color: white;
}

.auth-form {
  display: grid;
  gap: 16px;
}

.auth-form label,
.field {
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #d6e7ff;
  font-weight: 600;
}

.auth-form input,
textarea,
select {
  width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.9);
  color: white;
  padding: 14px 16px;
}

textarea {
  min-height: 180px;
  resize: vertical;
}

.page-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
}

.app-card {
  padding: 28px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.session-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.85);
}

.secondary-btn {
  background: rgba(148, 163, 184, 0.1);
  color: white;
}

.controls-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr);
  gap: 24px;
}

.sidebar-grid {
  display: grid;
  gap: 16px;
}

.status {
  margin-top: 20px;
  border-radius: 12px;
  padding: 12px 14px;
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(96, 165, 250, 0.2);
  color: #dbeafe;
}

.status.error {
  background: rgba(239, 68, 68, 0.09);
  border-color: rgba(248, 113, 113, 0.3);
  color: #fecaca;
}

.job-panel {
  margin-top: 24px;
  background: rgba(2, 6, 23, 0.45);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 18px;
  padding: 18px;
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
}

.status-queued {
  background: rgba(250, 204, 21, 0.12);
  color: #fcd34d;
}

.status-processing {
  background: rgba(96, 165, 250, 0.12);
  color: #93c5fd;
}

.status-completed {
  background: rgba(34, 197, 94, 0.12);
  color: #86efac;
}

.status-failed {
  background: rgba(248, 113, 113, 0.12);
  color: #fca5a5;
}

.output-block {
  margin-top: 16px;
}

video {
  width: 100%;
  max-height: 420px;
  border-radius: 18px;
  background: #020617;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.download-link {
  display: inline-block;
  margin-top: 14px;
  color: #7dd3fc;
  font-weight: 700;
  text-decoration: none;
}

.gallery-panel {
  margin-top: 28px;
  border-top: 1px solid rgba(148, 163, 184, 0.15);
  padding-top: 24px;
}

.gallery-header h2 {
  margin: 0 0 16px;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}

.video-card {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 18px;
  padding: 12px;
}

.video-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.video-meta a {
  color: #7dd3fc;
  text-decoration: none;
  font-weight: 700;
}

.empty-state {
  color: #cbd5e1;
}

code {
  font-size: 12px;
  color: #cbd5e1;
}

@media (max-width: 760px) {
  .controls-grid {
    grid-template-columns: 1fr;
  }

  .app-card,
  .auth-card {
    padding: 18px;
  }

  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }
}

