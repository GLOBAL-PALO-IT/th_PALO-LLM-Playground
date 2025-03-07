# Pipeline API Documentation

This document provides information about the Pipeline API endpoints for managing document processing pipelines in the system.

## Overview

The Pipeline API provides endpoints for managing four types of pipelines:

1. **Document Pipeline**: Manages document metadata and content
2. **Translation Pipeline**: Manages document translation operations
3. **Enrichment Pipeline**: Manages document enrichment operations
4. **Evaluation Pipeline**: Manages document evaluation operations

## Base URL

All API endpoints are relative to the base URL of your Next.js application.

## Document Pipeline API

### Get All Documents

```
GET /api/pipeline/document
```

**Response**:
```json
[
  {
    "id": "uuid",
    "fileName": "example.pdf",
    "content": { ... },
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "metadata": { ... }
  },
  ...
]
```

### Create Document

```
POST /api/pipeline/document
```

**Request Body**:
```json
{
  "fileName": "example.pdf",
  "content": { ... },
  "metadata": { ... }
}
```

**Required Fields**:
- `fileName`: String

**Response**:
```json
{
  "id": "uuid",
  "fileName": "example.pdf",
  "content": { ... },
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "metadata": { ... }
}
```

### Get Document by ID

```
GET /api/pipeline/document/:id
```

**Response**:
```json
{
  "id": "uuid",
  "fileName": "example.pdf",
  "content": { ... },
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "metadata": { ... },
  "TranslationPipeline": [ ... ],
  "EnrichmentPipeline": [ ... ],
  "EvaluationPipeline": [ ... ]
}
```

### Update Document

```
PUT /api/pipeline/document/:id
```

**Request Body**:
```json
{
  "fileName": "updated.pdf",
  "content": { ... },
  "metadata": { ... }
}
```

**Response**:
```json
{
  "id": "uuid",
  "fileName": "updated.pdf",
  "content": { ... },
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "metadata": { ... }
}
```

### Delete Document

```
DELETE /api/pipeline/document/:id
```

**Response**: Empty with status 204

## Translation Pipeline API

### Get All Translations

```
GET /api/pipeline/translation
```

**Query Parameters**:
- `docId` (optional): Filter by document ID

**Response**:
```json
[
  {
    "id": "uuid",
    "docId": "document-uuid",
    "fileName": "example.pdf",
    "page": 1,
    "input": "Original text",
    "output": "Translated text",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "metadata": { ... },
    "document": { ... }
  },
  ...
]
```

### Create Translation

```
POST /api/pipeline/translation
```

**Request Body**:
```json
{
  "docId": "document-uuid",
  "fileName": "example.pdf",
  "page": 1,
  "input": "Original text",
  "output": "Translated text",
  "metadata": { ... }
}
```

**Required Fields**:
- `docId`: String
- `fileName`: String
- `input`: String

**Response**:
```json
{
  "id": "uuid",
  "docId": "document-uuid",
  "fileName": "example.pdf",
  "page": 1,
  "input": "Original text",
  "output": "Translated text",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "metadata": { ... }
}
```

### Get Translation by ID

```
GET /api/pipeline/translation/:id
```

**Response**:
```json
{
  "id": "uuid",
  "docId": "document-uuid",
  "fileName": "example.pdf",
  "page": 1,
  "input": "Original text",
  "output": "Translated text",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "metadata": { ... },
  "document": { ... }
}
```

### Update Translation

```
PUT /api/pipeline/translation/:id
```

**Request Body**:
```json
{
  "fileName": "updated.pdf",
  "page": 2,
  "input": "Updated original text",
  "output": "Updated translated text",
  "metadata": { ... }
}
```

**Response**:
```json
{
  "id": "uuid",
  "docId": "document-uuid",
  "fileName": "updated.pdf",
  "page": 2,
  "input": "Updated original text",
  "output": "Updated translated text",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "metadata": { ... }
}
```

### Delete Translation

```
DELETE /api/pipeline/translation/:id
```

**Response**: Empty with status 204

## Enrichment Pipeline API

### Get All Enrichments

```
GET /api/pipeline/enrichment
```

**Query Parameters**:
- `docId` (optional): Filter by document ID

**Response**:
```json
[
  {
    "id": "uuid",
    "docId": "document-uuid",
    "fileName": "example.pdf",
    "page": 1,
    "input": "Original text",
    "output": { ... },
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "metadata": { ... },
    "document": { ... }
  },
  ...
]
```

### Create Enrichment

```
POST /api/pipeline/enrichment
```

**Request Body**:
```json
{
  "docId": "document-uuid",
  "fileName": "example.pdf",
  "page": 1,
  "input": "Original text",
  "output": { ... },
  "metadata": { ... }
}
```

**Required Fields**:
- `docId`: String
- `fileName`: String
- `input`: String

**Response**:
```json
{
  "id": "uuid",
  "docId": "document-uuid",
  "fileName": "example.pdf",
  "page": 1,
  "input": "Original text",
  "output": { ... },
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "metadata": { ... }
}
```

### Get Enrichment by ID

```
GET /api/pipeline/enrichment/:id
```

**Response**:
```json
{
  "id": "uuid",
  "docId": "document-uuid",
  "fileName": "example.pdf",
  "page": 1,
  "input": "Original text",
  "output": { ... },
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "metadata": { ... },
  "document": { ... }
}
```

### Update Enrichment

```
PUT /api/pipeline/enrichment/:id
```

**Request Body**:
```json
{
  "fileName": "updated.pdf",
  "page": 2,
  "input": "Updated original text",
  "output": { ... },
  "metadata": { ... }
}
```

**Response**:
```json
{
  "id": "uuid",
  "docId": "document-uuid",
  "fileName": "updated.pdf",
  "page": 2,
  "input": "Updated original text",
  "output": { ... },
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "metadata": { ... }
}
```

### Delete Enrichment

```
DELETE /api/pipeline/enrichment/:id
```

**Response**: Empty with status 204

## Evaluation Pipeline API

### Get All Evaluations

```
GET /api/pipeline/evaluation
```

**Query Parameters**:
- `docId` (optional): Filter by document ID

**Response**:
```json
[
  {
    "id": "uuid",
    "docId": "document-uuid",
    "fileName": "example.pdf",
    "page": 1,
    "input": "Original text",
    "output": "Evaluation result",
    "question": "Question text",
    "grounded_context": "Context text",
    "grounded_answer": "Grounded answer",
    "llm_answer": "LLM answer",
    "llm_score": 5,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "metadata": { ... },
    "document": { ... }
  },
  ...
]
```

### Create Evaluation

```
POST /api/pipeline/evaluation
```

**Request Body**:
```json
{
  "docId": "document-uuid",
  "fileName": "example.pdf",
  "page": 1,
  "input": "Original text",
  "output": "Evaluation result",
  "question": "Question text",
  "grounded_context": "Context text",
  "grounded_answer": "Grounded answer",
  "llm_answer": "LLM answer",
  "llm_score": 5,
  "metadata": { ... }
}
```

**Required Fields**:
- `docId`: String
- `fileName`: String
- `input`: String
- `output`: String

**Response**:
```json
{
  "id": "uuid",
  "docId": "document-uuid",
  "fileName": "example.pdf",
  "page": 1,
  "input": "Original text",
  "output": "Evaluation result",
  "question": "Question text",
  "grounded_context": "Context text",
  "grounded_answer": "Grounded answer",
  "llm_answer": "LLM answer",
  "llm_score": 5,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "metadata": { ... }
}
```

### Get Evaluation by ID

```
GET /api/pipeline/evaluation/:id
```

**Response**:
```json
{
  "id": "uuid",
  "docId": "document-uuid",
  "fileName": "example.pdf",
  "page": 1,
  "input": "Original text",
  "output": "Evaluation result",
  "question": "Question text",
  "grounded_context": "Context text",
  "grounded_answer": "Grounded answer",
  "llm_answer": "LLM answer",
  "llm_score": 5,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "metadata": { ... },
  "document": { ... }
}
```

### Update Evaluation

```
PUT /api/pipeline/evaluation/:id
```

**Request Body**:
```json
{
  "fileName": "updated.pdf",
  "page": 2,
  "input": "Updated original text",
  "output": "Updated evaluation result",
  "question": "Updated question",
  "grounded_context": "Updated context",
  "grounded_answer": "Updated grounded answer",
  "llm_answer": "Updated LLM answer",
  "llm_score": 4,
  "metadata": { ... }
}
```

**Response**:
```json
{
  "id": "uuid",
  "docId": "document-uuid",
  "fileName": "updated.pdf",
  "page": 2,
  "input": "Updated original text",
  "output": "Updated evaluation result",
  "question": "Updated question",
  "grounded_context": "Updated context",
  "grounded_answer": "Updated grounded answer",
  "llm_answer": "Updated LLM answer",
  "llm_score": 4,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "metadata": { ... }
}
```

### Delete Evaluation

```
DELETE /api/pipeline/evaluation/:id
```

**Response**: Empty with status 204

## Error Handling

All API endpoints return appropriate HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `204 No Content`: Resource deleted successfully
- `400 Bad Request`: Invalid request (missing required fields)
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses include a JSON object with an error message:

```json
{
  "error": "Error message"
}
```

## Usage Examples

### Frontend Example: Fetch All Documents

```typescript
const fetchDocuments = async () => {
  const response = await fetch('/api/pipeline/document', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch documents');
  }
  
  return await response.json();
};
```

### Frontend Example: Create a Document

```typescript
const createDocument = async (documentData) => {
  const response = await fetch('/api/pipeline/document', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(documentData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create document');
  }
  
  return await response.json();
};
```

### Frontend Example: Create a Translation for a Document

```typescript
const createTranslation = async (translationData) => {
  const response = await fetch('/api/pipeline/translation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(translationData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create translation');
  }
  
  return await response.json();
};
```
