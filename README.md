# 🧠 Nexora AI — AI-Powered Document Intelligence & RAG Platform

> Upload documents. Search them semantically. Ask questions. Get grounded answers with source citations.

Nexora AI is a full-stack **AI document intelligence platform** that allows users to upload PDF documents, extract and process their content, generate semantic embeddings, search documents using natural language, and ask questions using **Retrieval-Augmented Generation (RAG)**.

The platform combines **Next.js, React, Node.js, Express.js, PostgreSQL, pgvector, Python, FastAPI, Sentence Transformers, Supabase Storage, and Ollama** into a service-oriented AI architecture. :chatgpt-content-reference{index="1"}

---

## 🚀 Why Nexora AI?

Traditional document systems rely heavily on keyword-based search.

Nexora AI explores a more intelligent approach:

```text
Documents
    ↓
Text Extraction
    ↓
Chunking
    ↓
Embeddings
    ↓
Vector Storage
    ↓
Semantic Search
    ↓
Relevant Context
    ↓
RAG
    ↓
AI Answer + Citations

The goal is to make large collections of documents easier to search, understand, and interact with using natural language.
⭐ Key Features
📄 Document Intelligence
- PDF document upload
- Private document storage
- Page-level text extraction
- Text chunking with overlap
- Document metadata tracking
- Processing status tracking
- Page and chunk statistics
- Document deletion
- Secure document preview
🔎 Semantic Search
- Natural-language document search
- Sentence Transformer embeddings
- 384-dimensional vectors
- PostgreSQL + pgvector
- Vector similarity search
- User-scoped document retrieval
🤖 RAG Question Answering
- Retrieval-Augmented Generation
- Local LLM inference through Ollama
- Qwen 2.5 3B
- Context-aware answers
- Source-grounded responses
- Document and page-level citations
🔐 Security
- JWT authentication
- bcrypt password hashing
- Protected API routes
- User-level document ownership
- Private Supabase Storage
- Signed preview URLs
- Parameterized SQL queries
- File upload restrictions
- Environment-based secrets
📊 AI Usage & Metadata
- AI query persistence
- AI query statistics
- Document metadata
- Processing lifecycle tracking
- Page/chunk statistics
These capabilities are part of the current implementation described in the project source.    Pasted text
🏗️ System Architecture
                         ┌─────────────────────┐
                         │      Next.js        │
                         │   React Frontend    │
                         │                     │
                         │  Dashboard / Auth   │
                         └──────────┬──────────┘
                                    │
                                 HTTP/REST
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Node.js +         │
                         │   Express.js        │
                         │                     │
                         │ Authentication      │
                         │ Document API        │
                         │ Search API          │
                         │ RAG API             │
                         └──────┬───────┬──────┘
                                │       │
                    ┌───────────┘       └──────────────┐
                    ▼                                  ▼
          ┌──────────────────┐               ┌──────────────────┐
          │   PostgreSQL     │               │ Supabase Storage │
          │                  │               │                  │
          │ Users            │               │ Private PDFs     │
          │ Documents        │               │ Signed URLs      │
          │ Chunks           │               └──────────────────┘
          │ AI Queries       │
          │ pgvector         │
          └────────┬─────────┘
                   │
                   │ Vector Search
                   ▼
          ┌──────────────────┐
          │  Python ML       │
          │  FastAPI         │
          │                  │
          │ Sentence        │
          │ Transformers    │
          │ BGE-small       │
          └────────┬─────────┘
                   │
                   │ RAG Context
                   ▼
          ┌──────────────────┐
          │     Ollama       │
          │                  │
          │  Qwen 2.5 3B     │
          └──────────────────┘

Service Responsibilities
Service	Responsibility
Next.js / React	Dashboard, authentication, document interface
Node.js / Express	REST APIs, authentication, business logic
PostgreSQL	Users, documents, chunks, AI queries
pgvector	Vector similarity search
Supabase Storage	Private PDF storage
Python / FastAPI	Embedding generation
Sentence Transformers	Semantic embeddings
Ollama	Local LLM inference
Qwen 2.5 3B	RAG answer generation


🧠 AI / RAG Architecture
The most important engineering component of Nexora AI is its document-to-answer pipeline.
📥 Document Ingestion Pipeline
PDF
 │
 ▼
Supabase Storage
 │
 ▼
PDF Parser
 │
 ▼
Page Extraction
 │
 ▼
Text Chunking
 │
 ▼
Embedding Service
 │
 ▼
BAAI/bge-small-en-v1.5
 │
 ▼
384D Vector
 │
 ▼
PostgreSQL + pgvector

✂️ Text Chunking
Documents are divided into smaller pieces before generating embeddings.
Current configuration:
Chunk Size : 1000 characters
Overlap    : 150 characters

Chunk overlap helps preserve contextual continuity between neighboring chunks.    Pasted text
🔢 Embedding Generation
Nexora AI uses a dedicated Python ML service for embedding generation.
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
384-dimensional vector

Embeddings are normalized before storage.    Pasted text
🗄️ Vector Search
Embeddings are stored using PostgreSQL's pgvector extension.
Document Chunk
      │
      ├── content
      ├── page_number
      ├── chunk_index
      └── embedding VECTOR(384)

The backend performs vector similarity search to retrieve semantically relevant document chunks.    Pasted text
🤖 Retrieval-Augmented Generation
Nexora AI combines semantic retrieval with a local LLM.
User Question
      ↓
Generate Query Embedding
      ↓
pgvector Similarity Search
      ↓
Retrieve Relevant Chunks
      ↓
Build Context
      ↓
Ollama
      ↓
Qwen 2.5 3B
      ↓
Answer + Citations

The LLM is instructed to answer using the retrieved document context, helping keep responses grounded in the user's uploaded material.    Pasted text
📚 Source Citations
A major part of the RAG workflow is traceability.
Responses can include:
- Document ID
- Document name
- Page number
- Similarity information
Example:
{
  "answer": "Binary search operates in O(log n) time on a sorted array.",
  "citations": [
    {
      "documentId": "document-id",
      "documentName": "DSA_Cheat_Sheet.pdf",
      "pageNumber": 1,
      "similarity": 0.738
    }
  ]
}

This allows users to trace an AI-generated answer back to the source document.    Pasted text
🔐 Document Security & Ownership
Documents are stored in a private Supabase Storage bucket rather than being publicly accessible.
Document previews use temporary signed URLs.
User
 ↓
GET /api/documents/:id/preview
 ↓
Ownership Verification
 ↓
Supabase Signed URL
 ↓
Temporary Document Access

Document queries are scoped to the authenticated user:
WHERE d.id = $1
AND d.user_id = $2

The same ownership model is applied to:
- Document listing
- Document deletion
- Document preview
- Semantic search
This prevents users from accessing another user's documents through document IDs.    Pasted text
🔄 Complete AI Workflow
1️⃣ Upload
Next.js
   ↓
POST /api/documents
   ↓
JWT Authentication
   ↓
Multer
   ↓
Supabase Storage
   ↓
PostgreSQL

2️⃣ Process
PDF
 ↓
Text Extraction
 ↓
Page Extraction
 ↓
Chunking
 ↓
Embedding Generation
 ↓
pgvector

3️⃣ Search
User Query
 ↓
Query Embedding
 ↓
Vector Similarity Search
 ↓
Relevant Chunks

4️⃣ Generate Answer
Relevant Chunks
 ↓
Context Construction
 ↓
Ollama
 ↓
Qwen 2.5 3B
 ↓
Grounded Answer
 ↓
Document + Page Citations

🛠️ Tech Stack
Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Next.js App Router
Backend
- Node.js
- Express.js
- TypeScript
- JWT
- bcrypt
- Multer
Database
- PostgreSQL
- pgvector
- Supabase PostgreSQL
Storage
- Supabase Storage
- Private document bucket
- Signed URLs
AI / Machine Learning
- Python
- FastAPI
- Sentence Transformers
- BAAI/bge-small-en-v1.5
- 384-dimensional embeddings
- Ollama
- Qwen 2.5 3B
- Retrieval-Augmented Generation
The project source defines this stack across the frontend, backend, database, storage, and AI layers.    Pasted text
📁 Project Structure
Nexora AI/
│
├── client/
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/
│   │   │   │   └── page.tsx
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
│   │   │   ├── auth.controller.ts
│   │   │   ├── document.controller.ts
│   │   │   ├── query.controller.ts
│   │   │   └── rag.controller.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   └── upload.middleware.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── document.routes.ts
│   │   │   ├── query.routes.ts
│   │   │   └── rag.routes.ts
│   │   │
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── chunk.repository.ts
│   │   │   ├── chunk.service.ts
│   │   │   ├── document.repository.ts
│   │   │   ├── document.service.ts
│   │   │   ├── embedding.service.ts
│   │   │   ├── llm.service.ts
│   │   │   ├── pdf.service.ts
│   │   │   ├── query.repository.ts
│   │   │   ├── rag.service.ts
│   │   │   └── search.repository.ts
│   │   │
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── .env
│   └── package.json
│
├── ml-service/
│   ├── main.py
│   └── requirements.txt
│
├── .gitignore
└── README.md

The service/repository separation makes the backend structure easy to understand and provides clear boundaries between API handling, business logic, persistence, embeddings, PDF processing, and RAG.    Pasted text
🔌 API Overview
🔐 Authentication
POST /api/auth/register
POST /api/auth/login

📄 Documents
GET    /api/documents
POST   /api/documents
DELETE /api/documents/:id
GET    /api/documents/:id/preview

🤖 RAG
POST /api/rag/ask

📊 AI Query Statistics
GET /api/queries/stats

All protected endpoints use:
Authorization: Bearer <token>

🗄️ Database Design
Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

Documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_url TEXT,
    file_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'uploaded',
    page_count INT DEFAULT 0,
    chunk_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

Document Chunks
CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    page_number INT,
    chunk_index INT NOT NULL,
    embedding VECTOR(384),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

AI Queries
CREATE TABLE ai_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

🔒 Security
Nexora AI currently implements:
- JWT authentication
- bcrypt password hashing
- Protected API routes
- User-level document ownership checks
- Private Supabase Storage
- Temporary signed URLs
- Environment variables for secrets
- File upload size restrictions
- Parameterized PostgreSQL queries
- Database foreign-key constraints
- Cascading cleanup for document chunks
   Pasted text
📊 Document Processing Lifecycle
uploaded
    ↓
processing
    ↓
processed

If processing fails:
processing
    ↓
failed

Document metadata tracks:
status
page_count
chunk_count

🧪 Example
Upload
DSA_Cheat_Sheet.pdf

Ask
What is binary search?

Nexora AI
1. Generate an embedding for the question
2. Search document chunks using pgvector
3. Retrieve relevant content
4. Build the RAG context
5. Send context to the local LLM
6. Generate the answer
7. Return document and page citations

This demonstrates the complete document → embedding → retrieval → generation → citation pipeline.    Pasted text
⚙️ Environment Variables
⚠️ Never commit real secrets to GitHub.

Backend
Create:
server/.env

Example:
PORT=5000

DATABASE_URL=your_postgresql_connection_string

JWT_SECRET=your_jwt_secret

SUPABASE_URL=your_supabase_url

SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

Frontend
Create:
client/.env.local

NEXT_PUBLIC_API_URL=http://localhost:5000

💻 Local Development
Prerequisites
Install:
- Node.js
- npm
- Python 3.10+
- PostgreSQL / Supabase
- Ollama
- Git
1. Clone
git clone https://github.com/YOUR_USERNAME/nexora-ai.git
cd nexora-ai

Replace YOUR_USERNAME with the actual GitHub repository URL before publishing the README.

2. Backend
cd server
npm install
npm run dev

Backend:
http://localhost:5000

3. Frontend
cd client
npm install
npm run dev

Frontend:
http://localhost:3000

4. ML Service
cd ml-service
pip install -r requirements.txt

Start FastAPI:
python -m uvicorn main:app --reload --port 8000

ML service:
http://localhost:8000

5. Ollama
Verify Ollama:
ollama list

Current model:
qwen2.5:3b

If required:
ollama pull qwen2.5:3b

Ollama API:
http://localhost:11434

🌐 Local Services
Service	Port
Next.js	3000
Express API	5000
FastAPI ML Service	8000
Ollama	11434
PostgreSQL	Supabase


🎯 Engineering Focus
Nexora AI is designed around practical AI-engineering and full-stack engineering challenges.
🧠 AI Engineering
- Retrieval-Augmented Generation
- Semantic search
- Embedding generation
- Vector similarity search
- Local LLM inference
- Context retrieval
- Source-grounded responses
⚙️ Backend Engineering
- REST API architecture
- Authentication
- Authorization
- Service/repository separation
- PostgreSQL data modeling
- Secure document access
- File processing
🗄️ Data Engineering
- PostgreSQL
- pgvector
- Vector embeddings
- Document chunking
- Metadata tracking
- Similarity search
🔐 Security Engineering
- JWT
- bcrypt
- Ownership validation
- Signed URLs
- Parameterized queries
- Private storage
- Secret management
🖥️ Frontend Engineering
- Next.js
- React
- TypeScript
- App Router
- Responsive dashboard
- API integration
🛣️ Development Roadmap
✅ Completed
- [x] Project initialization
- [x] Next.js frontend
- [x] Express backend
- [x] PostgreSQL connection
- [x] Supabase integration
- [x] Database schema
- [x] JWT authentication
- [x] bcrypt password hashing
- [x] Protected API routes
- [x] Private Supabase storage
- [x] PDF upload
- [x] PDF text extraction
- [x] Page-level extraction
- [x] Text chunking
- [x] Python ML service
- [x] Sentence Transformer embeddings
- [x] 384-dimensional vectors
- [x] pgvector integration
- [x] Semantic search
- [x] RAG question answering
- [x] Ollama integration
- [x] Source citations
- [x] AI query persistence
- [x] Document deletion
- [x] Document preview
- [x] Page/chunk metadata
- [x] Document processing status
🔵 Planned
- [ ] Advanced semantic search UI
- [ ] Search result interface
- [ ] Citation click-through
- [ ] Multi-document search
- [ ] Document comparison
- [ ] AI-generated document summaries
- [ ] Background processing jobs
- [ ] Redis integration
- [ ] PostgreSQL vector indexing optimization
- [ ] Full-text search
- [ ] Hybrid search
- [ ] Query performance optimization
- [ ] Improved error handling
- [ ] Rate limiting
- [ ] API validation
- [ ] Automated testing
- [ ] Docker production setup
- [ ] CI/CD
- [ ] AWS deployment
- [ ] Production monitoring
- [ ] Production logging
The roadmap is intentionally separated from the completed implementation so recruiters can distinguish what exists today from what is planned next.    Pasted text
📌 Current Project Status
🟢 Active Development
Nexora AI currently demonstrates a complete core pipeline:
User Authentication
       ↓
PDF Upload
       ↓
Private Storage
       ↓
PDF Processing
       ↓
Text Chunking
       ↓
Embedding Generation
       ↓
pgvector Storage
       ↓
Semantic Search
       ↓
RAG Retrieval
       ↓
Local LLM
       ↓
AI Answer
       ↓
Source Citations

💼 Resume Description
Nexora AI — AI-Powered Document Intelligence & RAG Platform
Developed a full-stack AI document intelligence platform using Next.js, Node.js, Express.js, PostgreSQL, pgvector, Python, FastAPI, Sentence Transformers, and Ollama. Implemented secure PDF ingestion, page-level text extraction, overlapping chunking, 384-dimensional semantic embeddings, vector similarity search, and Retrieval-Augmented Generation with source-level citations. Designed user-scoped document access using JWT authentication, private Supabase Storage, signed URLs, and parameterized PostgreSQL queries.

🧠 What This Project Demonstrates
Area	Demonstrated Skills
Full Stack	Next.js, React, Node.js, Express
AI/ML	Embeddings, RAG, Sentence Transformers, LLMs
Vector Search	PostgreSQL, pgvector, similarity search
Backend	REST APIs, services, repositories
Security	JWT, bcrypt, ownership validation
Storage	Supabase Storage, signed URLs
Database	PostgreSQL, relational modeling
AI Infrastructure	FastAPI, Ollama
Architecture	Service-oriented design
Frontend	Next.js, TypeScript, responsive UI


👨‍💻 Author
Gautam Kumar Yadav
Software Engineer · Full-Stack Developer · AI/ML Enthusiast
🔗 GitHub:
https://github.com/Gautam0804
📄 License
This project is currently developed as a portfolio project.
License information will be added before public production release.
⭐ Final Vision
Nexora AI aims to evolve into a more capable AI knowledge and document intelligence platform where users can:
- 🔎 Search large document collections semantically
- 🤖 Ask questions across multiple documents
- 📚 Receive grounded AI answers
- 🔗 Trace answers back to source pages
- 📊 Compare and summarize documents
- ⚡ Process documents asynchronously
- 🧠 Combine semantic and keyword search
- ☁️ Deploy the platform at scale
Built with code, curiosity & chai ☕
