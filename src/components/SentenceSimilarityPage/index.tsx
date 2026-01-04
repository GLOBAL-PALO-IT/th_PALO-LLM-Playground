'use client'
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { calculateCosineSimilarity } from '@/lib/utils'
import OpenAI from 'openai'
import { useState } from "react"
import { exampleOfQuery } from "./exampleOfQuery"
import { MainSentence } from "./MainSentence"
import { SentenceList } from "./SentenceList"
import { QueryShowCases } from "./types"
export const SentenceSimilarityPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [mainSentence, setMainSentence] = useState("");
  const [sentences, setSentences] = useState<string[]>([""]);
  const [mainEmbedding, setMainEmbedding] = useState<number[]>([]);
  const [embeddings, setEmbeddings] = useState<(number[] | null)[]>([]);
  const [similarities, setSimilarities] = useState<(number | null)[]>([null]);

  const handleCopyState = () => {
    const state: QueryShowCases = {
      mainSentence,
      sentences,
      // mainEmbedding,
      // embeddings,
      similarities
    };
    navigator.clipboard.writeText(JSON.stringify(state, null, 2));
  };

  const handleExampleSelect = (value: string) => {
    const selectedExample = exampleOfQuery.find(
      (example) => example.mainSentence === value
    );
    if (selectedExample) {
      setMainSentence(selectedExample.mainSentence);
      setSentences(selectedExample.sentences);
      // Reset embeddings and similarities when selecting new example
      setMainEmbedding([]);
      setEmbeddings([]);
      setSimilarities([null]);
    }
  };

  // Add the Select component at the top of the form
  const ExampleSelect = () => (
    <div className="w-full max-w-sm mb-4">
      <Select onValueChange={handleExampleSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select an example" />
        </SelectTrigger>
        <SelectContent>
          {exampleOfQuery.map((example) => (
            <SelectItem 
              key={example.mainSentence} 
              value={example.mainSentence}
            >
              {example.mainSentence}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  // Placeholder functions as per requirements
  const getEmbeddings = async (mainSentence: string, sentences: string[]) => {
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
    if (!allEmbeddings) {
      setMainEmbedding([]);
      setEmbeddings([]);
      setSimilarities(sentences.map(() => null));
      return;
    }
    
    const newMainEmbedding = allEmbeddings[0];
    const newEmbeddings = allEmbeddings.slice(1);
    
    // Calculate similarities directly with the new embeddings
    const newSimilarities = newEmbeddings.map(embedding =>
      embedding ? calculateCosineSimilarity(newMainEmbedding, embedding) : null
    );
    
    setMainEmbedding(newMainEmbedding);
    setEmbeddings(newEmbeddings);
    setSimilarities(newSimilarities);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <ExampleSelect />
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
        <Button
          variant="outline"
          onClick={handleCopyState}
        >
          Copy State
        </Button>
      </div>
    </div>
  );
};
