# SVIS Backend — Production Deployment Checklist

Use this checklist to ensure all security, performance, and stability guidelines are met before deploying the SVIS backend to production environments.

---

## 1. Environment Security & Zod Validation
Verify that all critical environment keys are set. The application utilizes a Zod schema validator (`env_config.js`) to block startups if variables are misconfigured:
- [ ] **NODE_ENV**: Must be set to `production`.
- [ ] **PORT**: Define the service port (e.g., `5000` or via reverse proxy).
- [ ] **MONGODB_URI**: Provide a secure, production-grade MongoDB Atlas URL.
- [ ] **JWT_SECRET**: Use a cryptographically strong, random string (min 32 chars).
- [ ] **JWT_REFRESH_SECRET**: Separate strong secret for refresh token signing.
- [ ] **CLOUDINARY_CLOUD_NAME**: Required for student image hosting.
- [ ] **CLOUDINARY_API_KEY**: Required for student image hosting.
- [ ] **CLOUDINARY_API_SECRET**: Required for student image hosting.
- [ ] **APP_URL**: The root URL of the deployment server (required to construct correct verification links).

---

## 2. Security Configuration

### Standard Protection Middlewares
- [ ] **Helmet**: Security headers are active. Ensure `crossOriginResourcePolicy: false` is toggled if serving images locally, or specify Cloudinary CDN domains in the content security policy headers.
- [ ] **CORS**: Restrict `origin` configurations to the verified frontend production URL. Avoid using `origin: true` (which matches all domains) in production.
- [ ] **Rate Limiter**: Standardized to `100 requests per 15 minutes` under production. Verify that the server reverse-proxy (e.g., Nginx) correctly forwards client IPs (`trust proxy` settings in Express).

### Cookies and Session Keys
- [ ] **HTTPS Cookie Transmission**: Ensure refresh token cookies are flagged:
  - `secure: true` (forces HTTPS transmission).
  - `httpOnly: true` (prevents cross-site scripting access).
  - `sameSite: "strict"` or `"lax"` (mitigates CSRF vulnerabilities).

---

## 3. Database & Mongoose Index Check
The application utilizes indexes heavily to optimize paginated lookups, search parameters, and relationships. Ensure all indexes are generated:
- [ ] **User**: `staffId` (unique), `email` (unique).
- [ ] **Student**: `matricNumber` (unique), `email` (unique), `faculty` (ref index), `department` (ref index).
- [ ] **QRIdentity**: `student` (unique), `verificationId` (unique).
- [ ] **VerificationLog**: `staff` (ref index), `student` (ref index), `matricNumber` (index).

---

## 4. Storage & File Directory Management
If running in local fallback mode (no Cloudinary API keys supplied):
- [ ] **Permissions**: Confirm the application process has write permissions for the `/uploads` directory.
- [ ] **Disk Backup**: Run recurring backups of the `/uploads` folder to prevent loss of uploaded student images.
- [ ] **Size limits**: Verify disk quota limits can handle 5MB per upload.

---

## 5. Process Clustering & Availability
- [ ] **Process Manager (PM2)**: Configure PM2 to auto-restart the application on crashes:
  ```bash
  pm2 start server.js --name "svis-backend" -i max
  ```
- [ ] **SSL Reverse Proxy (Nginx / Cloudflare)**: Configure an Nginx block with let's encrypt SSL certificates proxying request feeds down to Port 5000:
  ```nginx
  server {
      listen 443 ssl;
      server_name api.svis.uni.edu;

      ssl_certificate /etc/letsencrypt/live/api.svis.uni.edu/fullchain.pem;
      ssl_certificate_key /etc/letsencrypt/live/api.svis.uni.edu/privkey.pem;

      location / {
          proxy_pass http://localhost:5000;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection 'upgrade';
          proxy_set_header Host $host;
          proxy_cache_bypass $http_upgrade;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      }
  }
  ```

---

## 6. Logs Rotation and Auditing
The application writes error and HTTP access logs under `logs/`:
- [ ] **Log Rotation Daemon**: Set up `logrotate` or integrate PM2 log rotating plugins (`pm2-logrotate`) to ensure logs don't exhaust system storage.
