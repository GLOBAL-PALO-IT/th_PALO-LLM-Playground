# Getting Started with Applied-LLM-Platform

Welcome to Applied-LLM-Platform! This guide will help you get up and running quickly.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18.0 or higher ([Download](https://nodejs.org/))
- **npm** v9.0 or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Docker Desktop** (Optional, for Qdrant and Neo4j)

Check your versions:
```bash
node --version  # Should be v18.0+
npm --version   # Should be v9.0+
git --version
```

## 🚀 Quick Start (5 minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/pacozaa/Applied-LLM-Platform.git
cd th_Applied-LLM-Platform
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages (~2-3 minutes).

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local
```

Open `.env.local` in your favorite editor and add your OpenAI API key:

```bash
OPENAI_API_KEY=sk-your-api-key-here
```

**Where to get API keys:**
- OpenAI: [platform.openai.com](https://platform.openai.com/api-keys) (Required)
- Tavily: [tavily.com](https://tavily.com) (Optional - for ReAct search agent)
- Langfuse: [langfuse.com](https://langfuse.com) (Optional - for observability)

### 4. Initialize the Database

```bash
npx prisma generate
npx prisma db push
```

### 5. Start the Development Server

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

### 6. Explore! 🎉

Open your browser and navigate to:
- **Main Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Simple Chat**: [http://localhost:3000/chat](http://localhost:3000/chat)
- **RAG Agentic**: [http://localhost:3000/ragAgentic](http://localhost:3000/ragAgentic)
- **Developer Agent**: [http://localhost:3000/react](http://localhost:3000/react)

---

## 🎯 What to Try First

### Beginner-Friendly Examples

1. **Basic Chat** (`/chat`)
   - Simple conversation with GPT-4
   - No additional setup needed
   - Great for understanding LLM basics

2. **Chat with Tools** (`/chatWithTools`)
   - See how LLMs can use functions
   - Demonstrates function calling
   - No external services needed

3. **RAG with Raw Chunking** (`/ragRawChunk`)
   - Learn about document chunking
   - Understand RAG basics
   - No vector database needed

### Intermediate Examples

4. **ReAct Agent with Search** (`/reactSearch`)
   - Requires `TAVILY_API_KEY`
   - Shows internet-connected AI
   - Demonstrates ReAct framework

5. **RAG Agentic** (`/ragAgentic`)
   - Advanced RAG implementation
   - Multi-step reasoning
   - Uses Qdrant (optional)

6. **Developer Agent** (`/react`)
   - AI that writes shell commands
   - Demonstrates autonomous agents
   - Be careful - runs on your machine!

---

## 🔧 Optional: Advanced Setup

### Set Up Qdrant (Vector Database)

Required for: `/ragQdrant`, `/ragAgentic`

```bash
# Pull the Docker image
docker pull qdrant/qdrant

# Run Qdrant
docker run -d \
    --name qdrant \
    --restart always \
    -p 6333:6333 -p 6334:6334 \
    -v $(pwd)/qdrant_storage:/qdrant/storage:z \
    qdrant/qdrant
```

Verify it's running: [http://localhost:6333/dashboard](http://localhost:6333/dashboard)

### Set Up Neo4j (Graph Database)

Required for: `/ragGraph`, `/ragChatGraph`, `/ragGraphPipeline`

```bash
# Run Neo4j
docker run -d \
    --name neo4j \
    --restart always \
    -p 7474:7474 -p 7687:7687 \
    -e NEO4J_AUTH=neo4j/yourpassword \
    -e NEO4JLABS_PLUGINS='["apoc"]' \
    -v $PWD/data:/data \
    -v $PWD/logs:/logs \
    neo4j:5.26.0
```

Update `.env`:
```bash
NEO4J_URI=neo4j://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=yourpassword
```

Verify it's running: [http://localhost:7474](http://localhost:7474)

### Set Up PostgreSQL (Optional)

The project uses SQLite by default, but you can use PostgreSQL:

```bash
# Update .env
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/playground"

# Run migrations
npx prisma migrate dev
```

See [docs/SETUP_POSTGRESQL_DOCKER_LOCALLY.md](docs/SETUP_POSTGRESQL_DOCKER_LOCALLY.md) for details.

---

## 🧪 Running Tests

### End-to-End Tests (Playwright)

```bash
# Install Playwright browsers (first time only)
npm run playwright:install

# Run all E2E tests
npm run test:e2e

# Run with UI (interactive)
npm run test:e2e:ui
```

### Unit Tests (Jest)

```bash
# Run unit tests
npm run test:unit

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

---

## 🆘 Troubleshooting

### "Cannot find module 'next'"

**Solution**: Dependencies not installed
```bash
npm install
```

### "Error: OPENAI_API_KEY is not set"

**Solution**: Add your API key to `.env`
```bash
OPENAI_API_KEY=sk-your-api-key-here
```

### Port 3000 already in use

**Solution**: Stop other processes or use a different port
```bash
# Use a different port
PORT=3001 npm run dev
```

### Qdrant connection failed

**Solution**: Make sure Qdrant is running
```bash
docker ps | grep qdrant
# If not running:
docker start qdrant
```

### Prisma errors

**Solution**: Regenerate Prisma client
```bash
npx prisma generate
npx prisma db push
```

### TypeScript errors

**Solution**: Restart your IDE and TypeScript server

### Still having issues?

1. Check the [main README.md](README.md)
2. Check specific feature docs in [docs/](docs/)
3. Search existing [GitHub Issues](https://github.com/pacozaa/Applied-LLM-Platform/issues)
4. Open a new issue with:
   - Your Node.js version
   - Your operating system
   - Error messages
   - Steps to reproduce

---

## 📚 Next Steps

Now that you're set up:

1. **Explore Examples**: Try each example page to understand different patterns
2. **Read Documentation**: Check out [docs/](docs/) for detailed guides
3. **Modify Code**: Try changing prompts or adding features
4. **Run Tests**: Ensure everything works with `npm run test:e2e`
5. **Build Something**: Use this as a foundation for your own projects

### Learning Resources

- 📖 [Developer Agent Guide](docs/DeveloperAgent.md)
- 📖 [ReAct with Tavily Search](docs/REACT_TAVILY_SEARCH.md)
- 📖 [Prisma Database Guide](docs/PRISMA_Guide.md)
- 📖 [Pipeline API Guide](docs/PIPELINE_API_Guide.md)

### Example Projects to Try

1. **Build a Custom Chatbot**: Modify `/chat` with your own personality
2. **Create a RAG System**: Add your own documents to search
3. **Build an Agent**: Extend the Developer Agent with new capabilities
4. **Add a New Tool**: Create a custom tool for the chat-with-tools example

---

## 🤝 Contributing

We welcome contributions! Before starting:

1. Read [CONTRIBUTING.md](CONTRIBUTING.md) (coming soon)
2. Check existing issues and PRs
3. Open an issue to discuss major changes
4. Follow the existing code style

---

## 📞 Get Help

- **Documentation**: Check [docs/](docs/) folder
- **Issues**: [GitHub Issues](https://github.com/pacozaa/Applied-LLM-Platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/pacozaa/Applied-LLM-Platform/discussions)

---

## ✅ Checklist

Before you start developing, make sure:

- [ ] Node.js v18+ installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with OPENAI_API_KEY
- [ ] Prisma database initialized
- [ ] Dev server running (`npm run dev`)
- [ ] Can access [http://localhost:3000](http://localhost:3000)
- [ ] Basic chat works

**Optional (for advanced features):**
- [ ] Qdrant running (for vector search examples)
- [ ] Neo4j running (for graph database examples)
- [ ] Tavily API key (for ReAct search agent)

---

Happy coding! 🚀
