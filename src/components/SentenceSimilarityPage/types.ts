export interface QueryShowCases {
    mainSentence: string;
    sentences: string[];
    mainEmbedding?: number[];
    embeddings?: (number[] | null)[];
    similarities?: (number | null)[];
}