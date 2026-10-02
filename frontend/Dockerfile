services:
  - type: web
    name: ai-video-generator-api
    env: python
    plan: free
    region: oregon
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: JWT_SECRET_KEY
        generateValue: true
      - key: DATABASE_URL
        value: sqlite:///./app.db
      - key: REPLICATE_API_TOKEN
        sync: false
      - key: VIDEO_MODEL
        value: genmo/mochi-1-preview
