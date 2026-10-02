# Nexora AI

## AI-Powered Document Intelligence & Semantic Search Platform

Nexora AI is a full-stack AI document intelligence platform that allows users to upload documents, extract and process their content, generate semantic embeddings, search documents using natural language, and ask questions using Retrieval-Augmented Generation (RAG).

The platform is designed with a production-oriented architecture using **Next.js, React, Node.js, Express.js, PostgreSQL, pgvector, Python, FastAPI, Sentence Transformers, Supabase Storage, and Ollama**.

---

## Features

- User registration and authentication
- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- PDF document upload
- Private document storage using Supabase Storage
- PDF text extraction
- Page-level document processing
- Text chunking with overlap
- Local AI embedding generation
- Semantic document search
- PostgreSQL + pgvector vector storage
- Retrieval-Augmented Generation (RAG)
- AI-powered document question answering
- Source citations with document and page references
- AI query persistence
- AI query statistics
- Document metadata tracking
- Document deletion
- Secure signed document preview URLs
- Processing status tracking
- Page and chunk statistics
- User-level document ownership
- Responsive Next.js dashboard

---

# Architecture

```text
                         ┌─────────────────────┐
                         │      Next.js        │
                         │   React Frontend    │
                         │                     │
                         │  Dashboard / Auth   │
                         └──────────┬──────────┘
                                    │
                                    │ HTTP / REST
                                    ▼
                         ┌─────────────────────┐
                         │   Node.js +         │
                         │   Express.js        │
                         │                     │
                         │ Authentication      │
                         │ Document API        │
                         │ RAG API             │
                         │ Search API          │
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
          │                  │
          │ BGE-small       │
          └──────────────────┘

                   │
                   │ RAG Context
                   ▼
          ┌──────────────────┐
          │     Ollama       │
          │                  │
          │  Qwen 2.5 3B     │
          └──────────────────┘

Tech Stack
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
- Signed URLs for document previews
AI / Machine Learning
- Python
- FastAPI
- Sentence Transformers
- BAAI/bge-small-en-v1.5
- 384-dimensional embeddings
- Ollama
- Qwen 2.5 3B
- Retrieval-Augmented Generation (RAG)
Project Structure
Nexora AI/
│
├── client/
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/
│   │   │   │   └── page.tsx
│   │   │   │
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
│   │
│   ├── src/
│   │   │
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
│   │
│   ├── main.py
│   └── requirements.txt
│
├── .gitignore
└── README.md

Core Workflow
1. User Authentication
Users can create an account and log in.
Register
   ↓
Password hashing
   ↓
PostgreSQL users table
   ↓
Login
   ↓
JWT token
   ↓
Protected API requests

Passwords are never stored directly.
2. Document Upload
The user uploads a PDF from the dashboard.
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
PostgreSQL documents table

The uploaded document initially receives:
status = processing

3. PDF Processing
PDF documents are processed page by page.
PDF
 ↓
PDF text extraction
 ↓
Individual pages
 ↓
Text chunks
 ↓
Embeddings
 ↓
PostgreSQL + pgvector

Each chunk stores:
- Document ID
- Chunk content
- Page number
- Chunk index
- Embedding
- Creation timestamp
4. Text Chunking
Documents are divided into smaller pieces before generating embeddings.
Current chunk configuration:
Chunk size: 1000 characters
Overlap:    150 characters

The overlap helps preserve context between neighboring chunks.
5. Embedding Generation
Nexora AI uses a separate Python ML service.
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

Embeddings are normalized before being stored.
6. Vector Storage
Embeddings are stored using PostgreSQL's pgvector extension.
The database uses:
VECTOR(384)

for document embeddings.
Example:
Document Chunk
      │
      ├── content
      ├── page_number
      ├── chunk_index
      └── embedding VECTOR(384)

7. Semantic Search
Users can search their documents using natural language.
Example:
"What is binary search?"

The query is converted into an embedding.
User Query
    ↓
Embedding Service
    ↓
384-dimensional vector
    ↓
pgvector similarity search
    ↓
Relevant document chunks

The backend uses vector distance to retrieve semantically similar chunks.
8. Retrieval-Augmented Generation
Nexora AI combines semantic retrieval with a local LLM.
User Question
      ↓
Generate Query Embedding
      ↓
pgvector Search
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

The LLM is instructed to answer using only the retrieved document context.
9. Citations
RAG responses include document and page information.
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

This allows users to trace an answer back to the source document.
10. Document Preview
Documents are stored in a private Supabase Storage bucket.
The application does not expose the bucket publicly.
Instead:
User
 ↓
GET /api/documents/:id/preview
 ↓
Ownership verification
 ↓
Supabase signed URL
 ↓
Temporary document access

Signed preview URLs currently expire after a short period.
11. Document Ownership
Document queries are scoped to the authenticated user.
For example:
WHERE d.id = $1
AND d.user_id = $2

This prevents users from accessing another user's documents through document IDs.
The same ownership approach is used for:
- Document listing
- Document deletion
- Document preview
- Semantic search
12. AI Query History
AI questions are persisted in PostgreSQL.
Table:
ai_queries

Each query contains:
id
user_id
question
created_at

This allows the dashboard to track AI usage.
API
Authentication
Register
POST /api/auth/register

Request:
{
  "email": "user@example.com",
  "password": "password"
}

Login
POST /api/auth/login

Request:
{
  "email": "user@example.com",
  "password": "password"
}

Response includes a JWT token.
Documents
Get Documents
GET /api/documents
Authorization: Bearer <token>

Upload Document
POST /api/documents
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form field:
file

Delete Document
DELETE /api/documents/:id
Authorization: Bearer <token>

Preview Document
GET /api/documents/:id/preview
Authorization: Bearer <token>

RAG
Ask Question
POST /api/rag/ask
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "question": "What is binary search?"
}

AI Query Statistics
GET /api/queries/stats
Authorization: Bearer <token>

Database Schema
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

Environment Variables
Never commit real environment variables or secrets to GitHub.
Server
Create:
server/.env

Example:
PORT=5000

DATABASE_URL=your_postgresql_connection_string

JWT_SECRET=your_jwt_secret

SUPABASE_URL=your_supabase_url

SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

Client
Create:
client/.env.local

Example:
NEXT_PUBLIC_API_URL=http://localhost:5000

Running Locally
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

2. Install Backend Dependencies
cd server
npm install

3. Configure Backend
Create:
server/.env

Add the required environment variables.
4. Start Backend
npm run dev

Backend:
http://localhost:5000

5. Install Frontend Dependencies
Open another terminal:
cd client
npm install

6. Configure Frontend
Create:
client/.env.local

Add:
NEXT_PUBLIC_API_URL=http://localhost:5000

7. Start Frontend
npm run dev

Frontend:
http://localhost:3000

8. Start ML Service
Open another terminal:
cd ml-service

Create/activate your Python environment and install:
pip install -r requirements.txt

Start FastAPI:
python -m uvicorn main:app --reload --port 8000

ML service:
http://localhost:8000

9. Start Ollama
Make sure Ollama is running.
Verify:
ollama list

The current project uses:
qwen2.5:3b

If the model is not installed:
ollama pull qwen2.5:3b

Ollama API:
http://localhost:11434

Local Services
When running locally, Nexora AI uses:
Service	Port
Next.js	3000
Express API	5000
FastAPI ML Service	8000
Ollama	11434
PostgreSQL	Supabase


Security
Nexora AI follows several security practices:
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
Current Document Processing Status
Documents follow this processing lifecycle:
uploaded
   ↓
processing
   ↓
processed

If document processing encounters an error:
processing
   ↓
failed

The document metadata tracks:
status
page_count
chunk_count

Current AI Pipeline
                    DOCUMENT INGESTION

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
Chunking
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

Question answering:
                    RAG PIPELINE

User Question
 │
 ▼
Embedding Service
 │
 ▼
Query Vector
 │
 ▼
pgvector Similarity Search
 │
 ▼
Top Relevant Chunks
 │
 ▼
Context Construction
 │
 ▼
Ollama / Qwen 2.5 3B
 │
 ▼
Answer
 │
 ▼
Document + Page Citations

Example
Upload:
DSA_Cheat_Sheet.pdf

Ask:
What is binary search?

Nexora AI:
1. Generates an embedding for the question.
2. Searches document chunks using pgvector.
3. Retrieves relevant content.
4. Sends the retrieved context to the local LLM.
5. Generates a concise answer.
6. Returns document and page citations.
Development Roadmap
Completed
- [x] Project initialization
- [x] Next.js frontend
- [x] Express backend
- [x] PostgreSQL connection
- [x] Supabase integration
- [x] Database schema
- [x] JWT authentication
- [x] bcrypt password hashing
- [x] Protected API routes
- [x] Supabase private storage
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
- [x] Page and chunk metadata
- [x] Document processing status
Planned
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
Engineering Goals
Nexora AI is being developed with a focus on:
- Clean architecture
- Separation of concerns
- Secure API design
- Scalable data processing
- Vector search
- AI integration
- Production-oriented backend development
- Database optimization
- Modern React/Next.js development
- Cloud-ready architecture
License
This project is currently developed as a portfolio project.
License information will be added before public production release.
Author
Gautam Kumar Yadav
Nexora AI is being developed as a full-stack AI engineering portfolio project focused on modern web development, AI-powered search, RAG, vector databases, and scalable backend architecture.