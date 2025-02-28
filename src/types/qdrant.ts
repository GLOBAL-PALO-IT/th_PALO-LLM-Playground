export interface SearchResultPoint {
    id: string | number
    version?: number
    score?: number
    payload?:
      | Record<string, unknown>
      | {
          [key: string]: unknown
        }
      | null
      | undefined
    vector?:
      | Record<string, unknown>
      | number[]
      | number[][]
      | {
          [key: string]:
            | number[]
            | number[][]
            | {
                text: string
                model?: string | null | undefined
              }
            | {
                indices: number[]
                values: number[]
              }
            | undefined
        }
      | {
          text: string
          model?: string | null | undefined
        }
      | null
      | undefined
    shard_key?: string | number | Record<string, unknown> | null | undefined
    order_value?: number | Record<string, unknown> | null | undefined
  }
  export interface SearchResult {
    points: SearchResultPoint[]
  }