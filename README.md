# Applied-LLM-Platform

## Description

This project is used for training developer to understand the numbers of core concepts of LLM at software development level.

## 🚀 Quick Links

- **[Getting Started Guide](GETTING_STARTED.md)** - New to this project? Start here!
- **[Next Steps](NEXT_STEPS.md)** - What to do next with this repository
- **[Recommendations](RECOMMENDATIONS.md)** - Comprehensive improvement roadmap
- **[Contributing](CONTRIBUTING.md)** - How to contribute to this project

## List of Examples

### Developer Agent
A powerful LLM-powered shell agent that can understand and execute shell commands based on natural language instructions. This agent can:
- Execute complex shell operations through simple English commands
- Handle file system operations, text processing, and system commands
- Create short POC projects such as web servers, databases, and backend APIs
- Handle Kubernetes, Docker, and other containerization tasks
- Provide reasoning of commands before execution
- Maintain context and handle multi-step tasks

[Developer Agent](./docs/DeveloperAgent.md)

https://github.com/user-attachments/assets/1ecab839-f7cd-4ca2-9f12-cf92c7bd96c9

### Chat
A basic chat implementation demonstrating:
- Direct interaction with OpenAI's GPT models
- Simple conversation handling
- Basic prompt engineering techniques
- Memory management for contextual conversations

https://github.com/user-attachments/assets/ab4950d1-9ad7-4f61-a79f-2fbcf72bac08

### Chat with Tools
An advanced chat system that incorporates:
- Custom tool integration with LLM
- Function calling capabilities
- Dynamic response handling
- Tool-augmented conversations for enhanced functionality

https://github.com/user-attachments/assets/9b3ebb4c-b231-417e-9bf7-ebfad94d7d2d

### Chat with Insurance API
A specialized chat implementation that:
- Integrates with insurance-specific APIs
- Handles insurance-related queries and calculations
- Provides policy information and quotes
- Demonstrates real-world API integration with LLM

https://github.com/user-attachments/assets/a8d4cef0-4f69-4df4-a40b-9aeedc8a8dac

### RAG Chunking Raw Text
A Retrieval-Augmented Generation (RAG) example showing:
- Text chunking strategies for large documents
- Efficient document processing
- Optimal chunk size determination
- Enhanced context retrieval for more accurate responses

https://github.com/user-attachments/assets/18f7a74e-968f-44dd-a29c-c91b5ee3098c

### RAG Qdrant
An advanced RAG implementation using Qdrant vector database:
- Vector-based similarity search
- Efficient document embedding and storage
- Fast and accurate information retrieval
- Scalable knowledge base management

https://github.com/user-attachments/assets/b9be1ad1-f23b-4f83-ae9d-16af1f6661bd

## 📖 Documentation

### For Users
- **[Getting Started](GETTING_STARTED.md)** - Complete setup guide with troubleshooting
- **[Testing Guide](tests/README.md)** - How to run and write tests

### For Contributors
- **[Contributing Guide](CONTRIBUTING.md)** - Code style, PR guidelines, development workflow
- **[Recommendations](RECOMMENDATIONS.md)** - Future improvements and roadmap
- **[Next Steps](NEXT_STEPS.md)** - Immediate action items

### Feature Documentation
- **[Developer Agent](docs/DeveloperAgent.md)** - LLM-powered shell agent
- **[ReAct with Tavily](docs/REACT_TAVILY_SEARCH.md)** - Internet-connected AI agent
- **[Prisma Guide](docs/PRISMA_Guide.md)** - Database setup and usage
- **[Pipeline API](docs/PIPELINE_API_Guide.md)** - Document processing pipeline
- **[PostgreSQL Setup](docs/SETUP_POSTGRESQL_DOCKER_LOCALLY.md)** - Database configuration

## Getting Started

> 💡 **New here?** Check out the **[Complete Getting Started Guide](GETTING_STARTED.md)** for detailed setup instructions with troubleshooting.

### Quick Start (5 minutes)

Setup the `.env` file:

- Create a `.env` file in the root directory
- Add the following:

```bash
OPENAI_API_KEY=YOUR_KEY
DATABASE_URL="******localhost:5432/playground"
```

Install:

```bash
npm install
#or
yarn
```

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Testing

This project includes end-to-end tests using Playwright.

### Running Tests

```bash
# Install Playwright browsers (first time only)
npm run playwright:install

# Run all tests
npm run test:e2e

# Run tests with UI mode
npm run test:e2e:ui

# View test report
npm run test:e2e:report
```

For more details, see [tests/README.md](./tests/README.md).

## Setup Qdrant Vector Database

[Qdrant](https://qdrant.tech/documentation/quickstart/)

```bash
docker pull qdrant/qdrant
docker run -d \
    --name qdrant \
    --restart always \
    -p 6333:6333 -p 6334:6334 \
    -v $(pwd)/qdrant_storage:/qdrant/storage:z \
    qdrant/qdrant
```

### Config Volume

The -v flag mounts the qdrant_storage directory as a volume, which is where the Qdrant data will be stored.
and you need to configure docker to have permission to access the volume, by Going to Setting > Resources > File Sharing and adding the qdrant_storage directory or parent directory to the list.

### Check if Qdrant run

- If you’ve set up a deployment locally with the Qdrant Quickstart, navigate to http://localhost:6333/dashboard.

- If you’ve set up a deployment in a cloud cluster, find your Cluster URL in your cloud dashboard, at https://cloud.qdrant.io. Add :6333/dashboard to the end of the URL.

## Setup Neo4j Graph Database

[Neo4j](https://neo4j.com/docs/operations-manual/current/docker/introduction/)

```bash
docker run \
    --name neo4j \
    --restart always \
    --publish=7474:7474 --publish=7687:7687 \
    -e NEO4J_AUTH=neo4j/yourpassword \
    -e NEO4JLABS_PLUGINS='["apoc"]' \
    -v $PWD/data:/data \
    -v $PWD/logs:/logs \
    neo4j:5.26.0
```

- Username is `neo4j`
- Password is `yourpassword`
- URI is `neo4j://localhost:7687`

## Setup Prisma with PostgreSQL

This project uses Prisma with PostgreSQL as the database. Here's how to set it up and interact with it:

### Initial Setup

1. **Set up PostgreSQL locally** - Follow the **[PostgreSQL Setup Guide](docs/SETUP_POSTGRESQL_DOCKER_LOCALLY.md)** to run PostgreSQL using Docker
2. The database schema is defined in `prisma/schema.prisma`
3. After setting up PostgreSQL and configuring your `.env` file, run migrations:

```bash
npx prisma migrate dev
```

This will:
- Create a new migration file
- Apply the migration to your database
- Generate the Prisma Client

For detailed Prisma commands and workflows, see the **[Prisma Guide](docs/PRISMA_Guide.md)**.

### Using Prisma Studio

To view and edit your database through a GUI interface:

1. Run Prisma Studio:
```bash
npx prisma studio
```

2. Open your browser and navigate to `http://localhost:5555`

### What You Should See

When Prisma Studio opens, you should see:
- All your defined models listed in the left sidebar
- Empty tables if this is a fresh setup
- Ability to add, edit, and delete records directly through the interface
- Real-time updates as you modify the data

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Report bugs** - [Open a bug report](https://github.com/pacozaa/Applied-LLM-Platform/issues/new?template=bug_report.md)
2. **Suggest features** - [Request a feature](https://github.com/pacozaa/Applied-LLM-Platform/issues/new?template=feature_request.md)
3. **Improve docs** - [Suggest documentation improvements](https://github.com/pacozaa/Applied-LLM-Platform/issues/new?template=documentation.md)
4. **Add examples** - Create new LLM integration patterns
5. **Write tests** - Increase test coverage

See our **[Contributing Guide](CONTRIBUTING.md)** for detailed guidelines.

## 📊 Project Status

- **Test Coverage**: ~5% (targeting 60-70%)
- **Examples**: 20+ LLM integration patterns
- **Documentation**: Comprehensive guides available
- **CI/CD**: Playwright E2E tests configured

See **[NEXT_STEPS.md](NEXT_STEPS.md)** for immediate action items and **[RECOMMENDATIONS.md](RECOMMENDATIONS.md)** for the full roadmap.

## 🚀 Deployment

### Azure Container Apps

Deploy this project to Azure Container Apps using the provided ARM template:

- **[Azure Deployment Guide](azure/DEPLOYMENT.md)** - Complete guide for deploying to Azure
- **[Azure Templates](azure/)** - ARM templates and configuration files

The deployment includes:
- Azure Container Apps (Next.js application)
- Azure Database for PostgreSQL
- Auto-scaling and monitoring
- HTTPS endpoints

See the [azure/DEPLOYMENT.md](azure/DEPLOYMENT.md) for detailed deployment instructions.

## 📝 License

This project is for educational purposes. Check the repository for license details.

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [OpenAI](https://openai.com/)
- [Langchain](https://www.langchain.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Qdrant](https://qdrant.tech/)
- [Neo4j](https://neo4j.com/)
- [Prisma](https://www.prisma.io/)

