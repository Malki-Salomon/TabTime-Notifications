# TabTime

An application for decoding medication instructions. The user uploads a photo of a medication label; the system recognizes the text using OCR, extracts the medication name, dosage, frequency and treatment duration, and creates automatic intake reminders. Reminders are delivered in the background via Web Push, even when the app is closed in the browser.

> This project was created for educational purposes. The application does not replace the instructions of a doctor or pharmacist, and the data extracted from the image must be verified for correctness.

## Features

- Registration and login with JWT authentication
- Upload a medication label image and automatically extract its details (Hebrew and English)
- Calculation of the treatment end date from the issue date and treatment duration
- Management of medications and intake times
- Web Push reminders at intake time, plus a reminder 3 days before a medication runs out
- Hebrew interface with right-to-left (RTL) support

## Project Structure

```
TabTime/
├── server/        # Backend: Spring Boot
├── client/        # Frontend: React
└── python/   # Python service: OCR and data extraction
```

## Architecture

```
React (:3000)  ──▶  Spring Boot (:8080)  ──▶  Python FastAPI (:5000)
                          │                     ├─ Tesseract (OCR)
                          ▼                     └─ Ollama (qwen2.5)
                    H2 (local file)
```

1. The client sends an image to the server.
2. The server forwards it to the Python service.
3. The Python service recognizes the text with Tesseract, and the `qwen2.5` model in Ollama extracts structured data from it.
4. The server calculates the end date and returns the data to the user for confirmation.
5. A scheduled job on the server creates notifications and sends them as Web Push.

## Tech Stack

| Component | Technologies |
|-----------|--------------|
| Server | Java 21, Spring Boot 4, Spring Security + JWT, Spring Data JPA, H2 |
| Client | React 19, Vite, Redux Toolkit (RTK Query), MUI, Service Worker |
| OCR | Python, FastAPI, pytesseract, Tesseract-OCR, Ollama (`qwen2.5`) |

## System Requirements

- Windows
- Java 21 or higher
- Node.js 20.19 or higher
- Python 3.10 or higher
- Tesseract-OCR with Hebrew and English language data
- Ollama

## VAPID Keys Setup

VAPID keys are required for sending Web Push notifications. To generate a key pair (one time only):

```bash
npx web-push generate-vapid-keys
```

Configure the keys on both the server and the client:

**Server** – in `server/Notifications-java/src/main/resources/application.properties`:

| Setting | Description |
|---------|-------------|
| `vapid.public.key` | The public key |
| `vapid.private.key` | The private key |

**Client** – in `client/.env`:

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | The server address, e.g. `http://localhost:8080` |
| `VITE_VAPID_PUBLIC_KEY` | The public key (identical to the one on the server) |

## Installation and Running

Start the components in the following order, each in a separate terminal window.

### 1. OCR Service

Install Tesseract-OCR: [tesseract-ocr-w64-setup-5.5.0.20241111.exe](https://github.com/tesseract-ocr/tesseract/releases/download/5.5.0/tesseract-ocr-w64-setup-5.5.0.20241111.exe).
**Make sure to select the Hebrew and English languages during installation.** It should be installed at `C:\Program Files\Tesseract-OCR\`, or the path must be updated in `python/p.py`.

Install Ollama: [https://ollama.com/download/windows](https://ollama.com/download/windows)

```bash
ollama run qwen2.5        # downloads the model on first run

cd python
pip install -r requirements.txt
python p.py
```

The service will start at `http://127.0.0.1:5000`.

### 2. Server

```bash
cd server/Notifications-java
mvnw.cmd spring-boot:run
```

The server will start at `http://localhost:8080`. On Linux/Mac use `./mvnw`.

### 3. Client

```bash
cd client
npm install
npm run dev
```

The application is available at `http://localhost:3000`. Web Push notifications work only on `localhost` or over HTTPS.

## Main API Endpoints

All endpoints except `/auth/**` require the header `Authorization: Bearer <token>`.

| Endpoint | Description |
|----------|-------------|
| `POST /auth/register`, `POST /auth/login` | Registration and login |
| `POST /medications/analyze-image` | Analyze a label image (file field: `file`) |
| `/medications` | Medication management (CRUD) |
| `/medication-schedules` | Intake schedule management (CRUD) |
| `/notifications` | View and update notifications |
| `/api/users` | User management |
