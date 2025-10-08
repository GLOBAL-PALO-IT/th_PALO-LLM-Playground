export interface EmbeddingQdrant {
  embedding: number[]
  pageContent: string
  metadata: Record<string, any>
}

export interface OperationInfo {
  operation_id?: number | null | undefined
  status: 'acknowledged' | 'completed'
}
