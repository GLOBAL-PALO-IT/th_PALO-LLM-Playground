'use client'
import React from 'react'
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MainSentence } from "./MainSentence"
import { SentenceList } from "./SentenceList"
import OpenAI from 'openai'
import { calculateCosineSimilarity } from '@/lib/utils'


export const SentenceSimilarityPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [mainSentence, setMainSentence] = useState("");
  const [sentences, setSentences] = useState<string[]>([""]);
  const [mainEmbedding, setMainEmbedding] = useState<number[]>([]);
  const [embeddings, setEmbeddings] = useState<(number[] | null)[]>([]);
  const [similarities, setSimilarities] = useState<(number | null)[]>([null]);

// Placeholder functions as per requirements
const getEmbeddings = async(mainSentence: string, sentences: string[]) => {
  setIsLoading(true)
  try {
    const allQuery = [mainSentence, ...sentences]
    if (!allQuery || allQuery.length === 0) return
    const response = await fetch('/api/runEmbedding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        texts: [mainSentence, ...sentences],
      }),
    })
    const { embeddings }: { embeddings: OpenAI.Embeddings.Embedding[] } =
      await response.json()
    if (!embeddings || embeddings.length === 0) return []
    return embeddings.map(embedding => embedding.embedding)
  } catch (error: any) {
    console.error('Error:', error.message)
    return []
  } finally {
    setIsLoading(false)
  }
}

const getCosineSimilarity = (main: number[], compare: number[]) => {
  if (!mainEmbedding || !embeddings) return -1
  const similarities = embeddings?.map((embedding, index) => {
    return {
      similarity: calculateCosineSimilarity(
        embedding?embedding:[],
        mainEmbedding?mainEmbedding:[]
      ),
      index,
    }
  })
  //sort from highest to lowest
  const sortedSimilarities = similarities
    .slice()
    .sort((a, b) => b.similarity - a.similarity)
  return sortedSimilarities
}
  const handleAddSentence = () => {
    setSentences([...sentences, ""]);
    setEmbeddings([...embeddings, null]);
    setSimilarities([...similarities, null]);
  };

  const handleRemoveSentence = (index: number) => {
    setSentences(sentences.filter((_, i) => i !== index));
    setEmbeddings(embeddings.filter((_, i) => i !== index));
    setSimilarities(similarities.filter((_, i) => i !== index));
  };

  const handleSentenceChange = (index: number, value: string) => {
    const newSentences = [...sentences];
    newSentences[index] = value;
    setSentences(newSentences);
  };

  const handleGetEmbeddings = async () => {
    const allEmbeddings = await getEmbeddings(mainSentence, sentences);
    setMainEmbedding(allEmbeddings?allEmbeddings[0]:[]);
    setEmbeddings(allEmbeddings?allEmbeddings.slice(1):[]);
    setSimilarities(sentences.map(() => null));
    // delay 0.5 sec
    await new Promise(resolve => setTimeout(resolve, 500));
    handleCalculateSimilarity()
  };

  const handleCalculateSimilarity = () => {
    if (!mainEmbedding || embeddings.includes(null)) return;
    
    const newSimilarities = embeddings.map(embedding => 
      embedding ? calculateCosineSimilarity(mainEmbedding, embedding) : null
    );
    setSimilarities(newSimilarities);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <MainSentence
        value={mainSentence}
        onChange={setMainSentence}
        embedding={mainEmbedding}
      />
      
      <SentenceList
        sentences={sentences}
        embeddings={embeddings}
        similarities={similarities}
        onSentenceChange={handleSentenceChange}
        onAddSentence={handleAddSentence}
        onRemoveSentence={handleRemoveSentence}
      />

      <div className="flex gap-4">
        <Button 
          onClick={handleGetEmbeddings}
          disabled={!mainSentence || sentences.every(s => !s) || isLoading}
        >
          Get Embeddings and Similarity
        </Button>
      </div>
    </div>
  );
};
