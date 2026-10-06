# 🧠 Nexora AI — AI-Powered Document Intelligence & RAG Platform

> **Upload documents. Search them semantically. Ask questions. Get grounded answers with source citations.**

Nexora AI is a **full-stack AI document intelligence platform** that transforms PDFs into searchable, queryable knowledge.

Instead of simply sending documents to an LLM, Nexora AI implements an end-to-end **Retrieval-Augmented Generation (RAG)** pipeline:

**PDF → Text Extraction → Chunking → Embeddings → pgvector → Semantic Retrieval → RAG → Local LLM → Source Citations**

The platform combines **Next.js, React, Node.js, Express.js, PostgreSQL, pgvector, Python, FastAPI, Sentence Transformers, Supabase Storage, and Ollama** into a modular AI architecture.

---

## 🎯 Why Nexora AI?

Nexora AI was built to demonstrate practical **AI engineering, backend development, database design, security, and system architecture** rather than simply integrating an LLM API.

The project focuses on:

- 📄 Secure PDF ingestion and processing
- 🧩 Intelligent text chunking
- 🧠 Semantic embeddings
- 🔎 Vector similarity search
- 📚 Retrieval-Augmented Generation
- 🤖 Local LLM inference
- 📌 Source-level citations
- 🗄️ PostgreSQL + pgvector
- 🔐 User-level document isolation
- ⚡ Dedicated Python ML service
- ☁️ Private cloud document storage
- 🏗️ Modular service architecture

---

# ✨ Key Features

## 🔐 Authentication & Authorization

- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Bearer token authorization
- User-level resource ownership
- Secure document access validation

---

## 📄 Document Intelligence

- PDF upload
- Private document storage
- PDF text extraction
- Page-level processing
- Document metadata
- Processing status tracking
- Page and chunk statistics
- Secure document deletion
- Secure document preview

---

## 🧩 Intelligent Text Processing

Documents are processed into smaller overlapping chunks before generating embeddings.

Current configuration:

```text
Chunk size: 1000 characters
Overlap:    150 characters

Chunk overlap helps preserve contextual information between neighboring chunks during retrieval.
🧠 Semantic Embeddings
Nexora AI uses:
BAAI/bge-small-en-v1.5
to convert document chunks and user queries into 384-dimensional embeddings.
Embedding generation is handled through a dedicated Python + FastAPI ML service.
Node.js
   ↓
FastAPI ML Service
   ↓
Sentence Transformers
   ↓
BGE-small-en-v1.5
   ↓
384D Embedding

🔎 Semantic Search
Nexora AI uses PostgreSQL + pgvector for semantic vector search.
Instead of depending only on exact keyword matches, user queries are converted into embeddings and compared against stored document embeddings.
User Query
    ↓
Query Embedding
    ↓
pgvector Similarity Search
    ↓
Relevant Document Chunks

🤖 Retrieval-Augmented Generation
The core AI pipeline combines semantic retrieval with local LLM generation.
                    User Question
                          │
                          ▼
                  Query Embedding
                          │
                          ▼
                  pgvector Search
                          │
                          ▼
                  Relevant Chunks
                          │
                          ▼
                   Context Builder
                          │
                          ▼
                  Ollama / Qwen 2.5 3B
                          │
                          ▼
                  Grounded Answer
                          │
                          ▼
                    Citations

The LLM is instructed to use the retrieved document context when generating answers.
This allows Nexora AI to provide responses grounded in the user's uploaded documents.
📌 Source Citations
Generated answers maintain source information including:
- Document ID
- Document name
- Page number
- Similarity score
This makes responses easier to trace back to the original document content.
Example flow:
Question
   ↓
Relevant Chunk
   ↓
Document + Page Metadata
   ↓
LLM Context
   ↓
Answer
   ↓
Source Citation

🏗️ System Architecture
                    ┌───────────────────────┐
                    │      Next.js UI       │
                    │   React + TypeScript  │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   Node.js + Express   │
                    │       REST API        │
                    └───────┬───────┬───────┘
                            │       │
                ┌───────────┘       └──────────────┐
                ▼                                  ▼
       ┌──────────────────┐              ┌──────────────────┐
       │   PostgreSQL     │              │ Supabase Storage │
       │    + pgvector    │              │   Private PDFs   │
       └────────┬─────────┘              └──────────────────┘
                │
                │ Vector Search
                ▼
       ┌──────────────────┐
       │ Python + FastAPI │
       │   ML Service     │
       └────────┬─────────┘
                │
                ▼
       ┌──────────────────────┐
       │ Sentence Transformers│
       │ BGE-small-en-v1.5    │
       │    384D Embeddings   │
       └──────────────────────┘

                RAG Context
                    │
                    ▼
          ┌──────────────────┐
          │      Ollama      │
          │   Qwen 2.5 3B   │
          └────────┬─────────┘
                   │
                   ▼
             Cited Answer

🔄 End-to-End Document Pipeline
1. Authentication
Register
   ↓
Password Hashing
   ↓
PostgreSQL
   ↓
Login
   ↓
JWT Token
   ↓
Protected Requests

Passwords are never stored directly.
2. Document Upload
Next.js
   ↓
POST /api/documents
   ↓
JWT Authentication
   ↓
Multer Upload Handling
   ↓
Supabase Private Storage
   ↓
Document Metadata → PostgreSQL
   ↓
Status = processing

3. PDF Processing
PDF
 ↓
Text Extraction
 ↓
Page Extraction
 ↓
Chunking
 ↓
Overlapping Chunks
 ↓
Embedding Generation
 ↓
PostgreSQL + pgvector

4. Embedding Generation
Node.js
   ↓
POST /embed
   ↓
FastAPI
   ↓
Sentence Transformers
   ↓
BAAI/bge-small-en-v1.5
   ↓
384D Vector
   ↓
PostgreSQL + pgvector

Embeddings are normalized before storage.
5. Semantic Retrieval
Natural Language Query
        ↓
Query Embedding
        ↓
pgvector Similarity Search
        ↓
Relevant Chunks
        ↓
Similarity Ranking

6. RAG Generation
User Question
      ↓
Query Embedding
      ↓
Vector Search
      ↓
Relevant Context
      ↓
Ollama
      ↓
Qwen 2.5 3B
      ↓
Grounded Answer
      ↓
Source Citations

🔒 Security & Data Isolation
Security is treated as part of the application architecture.
Authentication
- JWT authentication
- bcrypt password hashing
- Protected routes
- Bearer token authorization
Authorization
Document operations are scoped to the authenticated user.
For example:
WHERE d.id = $1
AND d.user_id = $2

This ownership model is applied to operations including:
- Document listing
- Document deletion
- Document preview
- Semantic search
Storage Security
- Private Supabase Storage bucket
- Ownership verification
- Signed URLs
- Short-lived preview access
Database Security
- Parameterized SQL queries
- Foreign key relationships
- Cascading cleanup
- User-scoped queries
Configuration Security
Sensitive credentials are stored through environment variables rather than committed to source control.
⚙️ Processing Lifecycle
Documents follow a controlled processing lifecycle:
uploaded
    ↓
processing
    ↓
processed

If processing fails:
processing
    ↓
failed

The system tracks:
- Processing status
- Page count
- Chunk count
- Creation timestamp
- Update timestamp
🛠️ Technology Stack
Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- App Router
Backend
- Node.js
- Express.js
- TypeScript
- JWT
- bcrypt
- Multer
- REST APIs
Database
- PostgreSQL
- pgvector
- Supabase PostgreSQL
Storage
- Supabase Storage
- Private buckets
- Signed URLs
AI / ML
- Python
- FastAPI
- Sentence Transformers
- BAAI/bge-small-en-v1.5
- 384-dimensional embeddings
- Ollama
- Qwen 2.5 3B
- Retrieval-Augmented Generation
📂 Project Structure
nexora-ai/
│
├── client/
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   │
│   │   └── lib/
│   │       └── api.ts
│   │
│   ├── public/
│   ├── .env.local
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts
│   │   │   └── supabase.ts
│   │   │
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── .env
│   └── package.json
│
└── ml-service/
    ├── main.py
    └── requirements.txt

🔌 API Overview
Authentication
POST /api/auth/register
POST /api/auth/login

Documents
GET    /api/documents
POST   /api/documents
DELETE /api/documents/:id
GET    /api/documents/:id/preview

RAG
POST /api/rag/ask

Query Statistics
GET /api/queries/stats

Protected endpoints use:
Authorization: Bearer <token>

🗄️ Database Design
Users
users
├── id
├── email
├── password_hash
└── created_at

Documents
documents
├── id
├── user_id
├── name
├── file_url
├── file_type
├── status
├── page_count
├── chunk_count
├── created_at
└── updated_at

Document Chunks
document_chunks
├── id
├── document_id
├── content
├── page_number
├── chunk_index
├── embedding VECTOR(384)
└── created_at

AI Queries
ai_queries
├── id
├── user_id
├── question
└── created_at

Foreign keys and cascading cleanup maintain relationships between users, documents, chunks, and queries.
🌐 Environment Configuration
Server
Create:
server/.env

PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

Client
Create:
client/.env.local

NEXT_PUBLIC_API_URL=http://localhost:5000

⚠️ Never commit real credentials, JWT secrets, or Supabase service-role keys to GitHub.

🚀 Local Development
Prerequisites
Install:
- Node.js
- npm
- Python 3.10+
- PostgreSQL / Supabase
- Ollama
- Git
1. Clone Repository
git clone https://github.com/YOUR_USERNAME/nexora-ai.git
cd nexora-ai

Replace YOUR_USERNAME with your actual GitHub repository URL.

2. Start Backend
cd server
npm install
npm run dev

Backend:
http://localhost:5000

3. Start Frontend
cd client
npm install
npm run dev

Frontend:
http://localhost:3000

4. Start ML Service
cd ml-service

pip install -r requirements.txt

python -m uvicorn main:app --reload --port 8000

ML service:
http://localhost:8000

5. Start Ollama
Pull the configured model:
ollama pull qwen2.5:3b

Ollama provides the local LLM inference layer for the RAG pipeline.
🔗 Local Services
Service	Port	Responsibility
Next.js	3000	Frontend
Express	5000	REST API
FastAPI	8000	Embedding service
Ollama	11434	Local LLM
PostgreSQL	—	Application + vector data
Supabase Storage	—	Private document storage


🧪 Example Workflow
Upload:
DSA_Cheat_Sheet.pdf

Then ask:
What is binary search?

Nexora processes the request through:
PDF
 ↓
Text Extraction
 ↓
Page Processing
 ↓
Chunking
 ↓
BGE Embeddings
 ↓
pgvector
 ↓
Semantic Retrieval
 ↓
Relevant Context
 ↓
Qwen 2.5 3B
 ↓
Answer + Page Citation

🧠 Key Engineering Decisions
Why RAG?
Instead of sending an entire document directly to an LLM, RAG retrieves only the most relevant information.
This helps the system:
- Retrieve relevant context
- Reduce unnecessary prompt content
- Ground answers in uploaded documents
- Provide source references
Why Embeddings?
Embeddings represent text as numerical vectors that capture semantic relationships.
This enables retrieval based on meaning, rather than only exact keyword matches.
Why pgvector?
pgvector allows vector search to operate alongside application data inside PostgreSQL.
This keeps the current architecture relatively simple while providing native vector storage and similarity search capabilities.
Why a Separate Python ML Service?
The project separates application responsibilities from ML responsibilities:
Node.js / Express
        ↓
Application Logic
        ↓
FastAPI
        ↓
Embedding Model

This provides a clear service boundary between the main backend and machine-learning functionality.
📈 Current Implementation
✅ Implemented
- Next.js frontend
- React UI
- Express REST API
- PostgreSQL integration
- pgvector integration
- Supabase Storage
- JWT authentication
- bcrypt password hashing
- Protected APIs
- User-level document ownership
- PDF upload
- PDF text extraction
- Page-level processing
- Overlapping chunking
- Python FastAPI ML service
- Sentence Transformer embeddings
- 384-dimensional vectors
- Semantic vector search
- RAG pipeline
- Ollama integration
- Qwen 2.5 3B
- Source citations
- AI query persistence
- Document deletion
- Secure document preview
- Processing status
- Page/chunk metadata
🛣️ Roadmap
Planned improvements include:
- 🔎 Advanced semantic search UI
- 📑 Search result interface
- 📌 Citation click-through
- 📚 Multi-document search
- 🔄 Document comparison
- 📝 Document summarization
- ⚙️ Background processing jobs
- ⚡ Redis-based infrastructure
- 🚀 Vector indexing optimization
- 🔍 Full-text search
- 🔀 Hybrid search
- 📊 Query performance optimization
- 🛡️ Advanced rate limiting
- 🧪 Automated testing
- 🐳 Production Docker deployment
- 🔄 CI/CD
- ☁️ AWS deployment
- 📈 Production monitoring and logging
💼 What Nexora AI Demonstrates
Frontend Engineering
- Next.js
- React
- TypeScript
- Responsive UI architecture
Backend Engineering
- REST API design
- Authentication
- Authorization
- Service architecture
- File processing
Database Engineering
- PostgreSQL
- Relational schema design
- Foreign keys
- Parameterized queries
- pgvector
- Vector similarity search
AI Engineering
- Text embeddings
- Semantic search
- Chunking strategies
- Retrieval-Augmented Generation
- Local LLM inference
- Context retrieval
- Grounded responses
- Source citations
Security
- JWT
- bcrypt
- User-level ownership
- Private storage
- Signed URLs
- Protected APIs
System Design
- Frontend/backend separation
- Dedicated ML service
- Storage abstraction
- Vector retrieval pipeline
- Modular architecture
📌 Resume Description
Developed a full-stack AI document intelligence and RAG platform using Next.js, Node.js, Express.js, PostgreSQL, pgvector, Python, FastAPI, Sentence Transformers, and Ollama. Implemented secure PDF ingestion, page-level text extraction, overlapping chunking, 384-dimensional semantic embeddings, vector similarity search, and Retrieval-Augmented Generation with source-level citations. Designed user-scoped document access using JWT authentication, private Supabase Storage, signed URLs, and parameterized PostgreSQL queries.

🎯 Technical Interview Areas
Nexora AI provides strong discussion points around:
- RAG architecture
- Embeddings
- Vector similarity
- Chunk size and overlap
- pgvector
- Semantic search
- Context retrieval
- LLM hallucination mitigation
- Citation generation
- PDF processing
- JWT authentication
- Authorization
- User ownership isolation
- PostgreSQL schema design
- FastAPI service separation
- Local LLM inference
- Node.js ↔ Python service communication
The complete AI flow can be explained as:
PDF
 ↓
Text Extraction
 ↓
Chunking
 ↓
Embedding
 ↓
Vector Storage
 ↓
Query Embedding
 ↓
Similarity Search
 ↓
Retrieved Context
 ↓
LLM
 ↓
Grounded Answer
 ↓
Citation

📊 Project Status
Status: 🚧 Active Development
Nexora AI currently provides a strong foundation for document intelligence, semantic retrieval, and RAG-based question answering.
Future development will focus on improving scalability, search quality, observability, automated testing, deployment, and production infrastructure.
👨‍💻 Author
Gautam Kumar Yadav
Software Engineer | Full-Stack Development | Java | DSA | AI/ML
📄 License
This project is currently maintained as a portfolio project.
A formal open-source license can be added before public production release.
🌟 Vision
Nexora AI is being developed toward a complete document intelligence platform where users can upload knowledge, search it semantically, ask questions across documents, and receive answers grounded in the original source material.
The goal is not simply to build another AI chatbot.
The goal is to demonstrate how modern web engineering, secure backend architecture, vector search, and practical AI systems can work together to solve a real problem.

☕ Built with code, curiosity & chai.
