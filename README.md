# PALO-LLM-PLAYGROUND

## Description

This project is used for training developer to understand the numbers of core concepts of LLM at software development level.

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

## Getting Started

Set up Key Globally:

- In your `~/.bash_profile` or other type of shell profile
- OpenAI: Add `export OPENAI_API_KEY='YOUR_KEY'`

Setup the `.env` file:

- Create a `.env` file in the root directory
- Add the following:

```bash
OPENAI_API_KEY=YOUR_KEY
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

## Setup Prisma SQLite

This project uses Prisma with SQLite as the database. Here's how to set it up and interact with it:

### Initial Setup

1. The database schema is defined in `prisma/schema.prisma`
2. After any schema changes, run the following command to apply migrations:

```bash
npx prisma migrate dev
```

This will:
- Create a new migration file
- Apply the migration to your database
- Generate the Prisma Client

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

The database file is located at `prisma/dev.db` by default.
