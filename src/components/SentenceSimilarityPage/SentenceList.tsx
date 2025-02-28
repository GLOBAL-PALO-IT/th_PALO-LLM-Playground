import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { EmbeddingDisplay } from "./EmbeddingDisplay"
import { Plus, X } from "lucide-react"

interface SentenceListProps {
  sentences: string[];
  embeddings: (number[] | null)[];
  similarities: (number | null)[];
  onSentenceChange: (index: number, value: string) => void;
  onAddSentence: () => void;
  onRemoveSentence: (index: number) => void;
}

export const SentenceList = ({
  sentences,
  embeddings,
  similarities,
  onSentenceChange,
  onAddSentence,
  onRemoveSentence,
}: SentenceListProps) => {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Comparison Sentences</CardTitle>
        <Button onClick={onAddSentence} variant="outline" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {sentences
          .map((sentence, index) => ({ sentence, index, similarity: similarities[index] }))
          .sort((a, b) => {
            // Handle null values and sort by similarity score
            if (a.similarity === null) return 1;
            if (b.similarity === null) return -1;
            return b.similarity - a.similarity;
          })
          .map(({ sentence, index }) => (
          <div key={index} className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => onRemoveSentence(index)}
            >
              <X className="h-4 w-4" />
            </Button>
            <Textarea
              placeholder={`Enter sentence ${index + 1} to compare...`}
              value={sentence}
              onChange={(e) => onSentenceChange(index, e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex gap-2">
              <div className="flex-1">
                <EmbeddingDisplay embedding={embeddings[index]} label="Embedding:" />
              </div>
              {similarities[index] !== null && (
                <Card className="flex-1 mt-2">
                  <CardContent className="pt-4">
                    <div className="text-sm font-medium mb-2">Similarity Score:</div>
                    <div className="text-sm text-muted-foreground">
                      {similarities[index]?.toFixed(4)}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
