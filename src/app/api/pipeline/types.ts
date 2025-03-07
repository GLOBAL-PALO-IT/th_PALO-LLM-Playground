import { DocumentPipeline, TranslationPipeline, EnrichmentPipeline, EvaluationPipeline } from '@prisma/client'

// Document Pipeline Types
export type DocumentPipelineResponse = DocumentPipeline & {
  TranslationPipeline?: TranslationPipeline[]
  EnrichmentPipeline?: EnrichmentPipeline[]
  EvaluationPipeline?: EvaluationPipeline[]
}

export type DocumentPipelineCreateInput = {
  fileName: string
  content?: any
  metadata?: any
}

export type DocumentPipelineUpdateInput = Partial<DocumentPipelineCreateInput>

// Translation Pipeline Types
export type TranslationPipelineWithDocument = TranslationPipeline & {
  document: DocumentPipeline
}

export type TranslationPipelineCreateInput = {
  docId: string
  fileName: string
  page?: number
  input: string
  output?: string
  metadata?: any
}

export type TranslationPipelineUpdateInput = Partial<Omit<TranslationPipelineCreateInput, 'docId'>>

// Enrichment Pipeline Types
export type EnrichmentPipelineWithDocument = EnrichmentPipeline & {
  document: DocumentPipeline
}

export type EnrichmentPipelineCreateInput = {
  docId: string
  fileName: string
  page?: number
  input: string
  output?: any
  metadata?: any
}

export type EnrichmentPipelineUpdateInput = Partial<Omit<EnrichmentPipelineCreateInput, 'docId'>>

// Evaluation Pipeline Types
export type EvaluationPipelineWithDocument = EvaluationPipeline & {
  document: DocumentPipeline
}

export type EvaluationPipelineCreateInput = {
  docId: string
  fileName: string
  page?: number
  input: string
  output: string
  question?: string
  grounded_context?: string
  grounded_answer?: string
  llm_answer?: string
  llm_score?: number
  metadata?: any
}

export type EvaluationPipelineUpdateInput = Partial<Omit<EvaluationPipelineCreateInput, 'docId'>>
