<h1 align="center">🧠 Nexora AI</h1>

<p align="center">
  <b>Chat with your PDFs. Get answers grounded in your documents, with page-level citations.</b><br/>
  A full-stack RAG platform with a dedicated ML microservice and 100% local LLM inference.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-black?logo=nextdotjs" />
  <img src="https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/pgvector-336791" />
  <img src="https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Ollama-Qwen_2.5-orange" />
  <!-- TODO: add after setting up GitHub Actions -->
  <!-- <img src="https://github.com/YOUR_USERNAME/nexora-ai/actions/workflows/ci.yml/badge.svg" /> -->
</p>

<p align="center">
  <a href="YOUR_LIVE_DEMO_LINK">🌐 Live Demo</a> ·
  <a href="YOUR_VIDEO_LINK">🎥 Demo Video</a> ·
  <a href="#-architecture">🏗️ Architecture</a> ·
  <a href="#-performance--evaluation">📊 Results</a> ·
  <a href="#-known-limitations">⚠️ Limitations</a>
</p>

<!-- TODO: record a 10-15s GIF: upload PDF -> ask question -> cited answer -->
![Nexora AI Demo](./docs/demo.gif)

---

## 📸 Screenshots

<!-- TODO: add real screenshots to /docs -->
| Login | Document Library | Answer with Citations |
|:---:|:---:|:---:|
| ![Login](./docs/login.png) | ![Documents](./docs/documents.png) | ![Answer](./docs/answer.png) |

---

## 💡 The Problem

LLMs hallucinate, and pasting entire documents into a prompt is slow, costly, and
sends private data to third parties. Nexora AI retrieves **only the relevant passages**
from a user's own PDFs and generates answers **with traceable sources**, running the
LLM locally so documents never leave the user's infrastructure.

## ⚡ What It Does

- 📄 Upload PDFs to **private, per-user storage**
- 🔎 **Semantic search** by meaning, not just keywords
- 🤖 Ask questions in natural language and get **grounded answers**
- 📌 Every answer includes **citations**: document, page number, similarity score
- 🔐 **Strict user isolation**: no user can access another user's documents
- 🏠 **Local LLM inference** via Ollama, so no data goes to third-party AI APIs
- ⚙️ Tracks the processing lifecycle of every document (`processing → processed / failed`)

---

## 🏗️ Architecture

```text
                 ┌───────────────────────┐
                 │      Next.js UI       │
                 │   React + TypeScript  │
                 └───────────┬───────────┘
                             │
                             ▼
                 ┌───────────────────────┐        ┌──────────────────────┐
                 │   Node.js + Express   │───────►│   Supabase Storage   │
                 │       REST API        │        │ Private PDFs + signed│
                 └──────┬─────────┬──────┘        │         URLs         │
                        │         │               └──────────────────────┘
          ┌─────────────┘         └───────────────┐
          ▼                                       ▼
┌────────────────────┐                  ┌────────────────────┐
│ PostgreSQL+pgvector│                  │  Python + FastAPI  │
│ users, documents,  │                  │    ML Service      │
│ chunks, 384-d      │                  │ BGE-small-en-v1.5  │
│ embeddings         │                  │  (384-d vectors)   │
└────────────────────┘                  └────────────────────┘
          │
          │ top-k retrieved chunks → context builder
          ▼
┌────────────────────┐
│  Ollama · Qwen 2.5 │──► Grounded answer + citations
│        3B          │
└────────────────────┘
```

### RAG pipeline

```text
Ingestion:  PDF → page extraction → overlapping chunks (1000 / 150) → embeddings → pgvector
Query:      Question → query embedding → pgvector similarity search → top-k chunks
            → context builder → Qwen 2.5 3B → cited answer
```

### Document lifecycle

```text
uploaded → processing → processed
                     ↘ failed
```

Tracked per document: status, page count, chunk count, created/updated timestamps.

---

## 🧩 Engineering Highlights

| Area | What I built | Why it matters |
|---|---|---|
| **Service separation** | Python/FastAPI embedding service, separate from the Node API | Clean boundary between app logic and ML; the model can scale or be swapped independently |
| **Vector search** | pgvector inside PostgreSQL | One database for relational and vector data, no extra infrastructure |
| **Chunking** | 1000-char chunks with 150-char overlap | Preserves context across chunk boundaries and improves retrieval |
| **Normalized embeddings** | Vectors normalized before storage | Consistent similarity scoring |
| **Security** | JWT + bcrypt, ownership check on every query (`WHERE d.id = $1 AND d.user_id = $2`), parameterized SQL, private bucket, short-lived signed URLs | Prevents cross-user data access and SQL injection |
| **Hallucination control** | LLM instructed to answer from retrieved context only, returned with sources | Users can verify every claim |
| **Data integrity** | Foreign keys + cascading cleanup | No orphaned chunks or queries |
| **Privacy** | Local LLM inference with Ollama | Document content never sent to external AI APIs |

---

## 📊 Performance & Evaluation

> Numbers below were measured on my machine: `<CPU / RAM / GPU>`.
> <!-- TODO: replace every XX with a value you actually measured. Delete rows you did not measure. -->

### Performance

| Metric | Result |
|---|---|
| Test corpus | XX PDFs · XX pages · XX chunks |
| PDF ingestion (extract + chunk + embed) | ~XX s for a XX-page PDF |
| Query embedding latency | ~XX ms |
| pgvector similarity search | ~XX ms over XX chunks |
| End-to-end answer latency (Qwen 2.5 3B, local) | ~XX s |

### Retrieval quality

I wrote XX questions with known answers across XX PDFs and checked whether the correct
source chunk appeared in the top-k results.

| Metric | Result |
|---|---|
| Correct source in top-1 | XX / XX |
| Correct source in top-3 | XX / XX |
| Correct source in top-5 | XX / XX |

---

## 🔒 Security & Data Isolation

**Authentication**
- JWT authentication with bearer tokens
- bcrypt password hashing (passwords are never stored directly)
- Protected API routes

**Authorization**
- Every document operation is scoped to the authenticated user:
  listing, deletion, preview, and semantic search
- Ownership enforced at the **query level**, not only in middleware:

```sql
WHERE d.id = $1
  AND d.user_id = $2
```

**Storage**
- Private Supabase Storage bucket
- Ownership verification before access
- Short-lived signed URLs for previews

**Database & Config**
- Parameterized SQL queries
- Foreign keys with cascading cleanup
- Secrets via environment variables, never committed

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js (App Router), React, TypeScript, Tailwind CSS |
| **Backend** | Node.js, Express.js, TypeScript, JWT, bcrypt, Multer, REST APIs |
| **Database** | PostgreSQL, pgvector, Supabase PostgreSQL |
| **Storage** | Supabase Storage (private buckets, signed URLs) |
| **AI / ML** | Python, FastAPI, Sentence Transformers, BAAI/bge-small-en-v1.5 (384-d), Ollama, Qwen 2.5 3B |

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/documents` | List the user's documents |
| POST | `/api/documents` | Upload and process a PDF |
| GET | `/api/documents/:id/preview` | Signed preview URL |
| DELETE | `/api/documents/:id` | Delete document, file, and chunks |
| POST | `/api/rag/ask` | Ask a question, returns answer + citations |
| GET | `/api/queries/stats` | Query statistics |

Protected endpoints require:

```text
Authorization: Bearer <token>
```

### Example

```http
POST /api/rag/ask
Authorization: Bearer <token>

{ "question": "What is binary search?" }
```

<!-- TODO: paste your real response shape here -->
```json
{
  "answer": "Binary search is ...",
  "sources": [
    { "documentId": "...", "documentName": "DSA_Cheat_Sheet.pdf", "page": 4, "score": 0.82 }
  ]
}
```

---

## 🗄️ Database Design

```text
users              id, email, password_hash, created_at
documents          id, user_id, name, file_url, file_type, status,
                   page_count, chunk_count, created_at, updated_at
document_chunks    id, document_id, content, page_number, chunk_index,
                   embedding VECTOR(384), created_at
ai_queries         id, user_id, question, created_at
```

Foreign keys and cascading deletes link users → documents → chunks and users → queries.

---

## 📂 Project Structure

```text
nexora-ai/
├── client/                 # Next.js frontend
│   └── src/
│       ├── app/            # App Router pages (auth, layout, home)
│       └── lib/api.ts      # API client
├── server/                 # Express REST API
│   └── src/
│       ├── config/         # db.ts, supabase.ts
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       ├── app.ts
│       └── server.ts
└── ml-service/             # FastAPI embedding service
    ├── main.py
    └── requirements.txt
```

---

## 🚀 Run Locally

**Prerequisites:** Node.js, npm, Python 3.10+, PostgreSQL with pgvector (or Supabase), Ollama, Git

```bash
git clone https://github.com/YOUR_USERNAME/nexora-ai.git
cd nexora-ai
```

| Service | Command | Port |
|---|---|---|
| API | `cd server && npm install && npm run dev` | 5000 |
| Frontend | `cd client && npm install && npm run dev` | 3000 |
| ML service | `cd ml-service && pip install -r requirements.txt && python -m uvicorn main:app --reload --port 8000` | 8000 |
| Local LLM | `ollama pull qwen2.5:3b` | 11434 |

<details>
<summary><b>Environment variables</b></summary>

`server/.env`
```env
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

`client/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

> ⚠️ Never commit real credentials, JWT secrets, or Supabase service-role keys.
</details>

### 🧪 Try it

1. Register and log in
2. Upload a PDF (for example `DSA_Cheat_Sheet.pdf`)
3. Wait for status `processed`
4. Ask: *"What is binary search?"*
5. Check the answer and its page citations

<!-- TODO (optional): add a one-command Docker Compose setup and document it here -->

---

## ⚠️ Known Limitations

Being upfront about the current scope:

- **PDF only.** Other formats (DOCX, TXT, etc.) are not supported yet.
- **No OCR.** Scanned or image-only PDFs may not yield usable text.
- **Small local model.** Qwen 2.5 3B is fast and private but can miss nuance or make mistakes on complex questions. Citations are there so answers can be verified.
- **Single-document focus.** Multi-document search and comparison are planned.
- **Synchronous processing.** Ingestion is not yet handled by a background job queue.
- **No automated test suite or CI yet.**
<!-- TODO: edit this list to match reality as you add features -->

---

## 🛣️ Roadmap

- [ ] Multi-document search and document comparison
- [ ] Hybrid search (full-text + vector) with re-ranking
- [ ] HNSW vector indexing and query benchmarks
- [ ] Background processing jobs (Redis queue)
- [ ] Document summarization
- [ ] Clickable citations that open the source page
- [ ] Rate limiting
- [ ] Automated tests and CI/CD (GitHub Actions)
- [ ] Docker Compose and production deployment (AWS)
- [ ] Monitoring and logging

---

## 📚 What I Learned

- Chunk size and overlap directly affect retrieval quality
- Why a separate ML service keeps the main backend simple
- Enforcing authorization at the **query level**, not only in middleware
- Trade-offs between small local models and hosted LLM APIs
- Designing a processing lifecycle so failures are visible and recoverable
<!-- TODO: adjust to your real experience -->

---

## 👨‍💻 Author

**Gautam Kumar Yadav**: Software Engineer · Full-Stack · AI/ML

[LinkedIn](https://www.linkedin.com/in/gautam-yadav-10922726b) · [Portfolio](https://gautam-portfolio-self.vercel.app/) · [Email](mailto:gautamcodesin@gmail.com)

---

> 🚧 **Status:** Active development. Maintained as a portfolio project; a formal open-source license can be added before public release.

<p align="center"><i>Built with code, curiosity & chai ☕</i></p>
