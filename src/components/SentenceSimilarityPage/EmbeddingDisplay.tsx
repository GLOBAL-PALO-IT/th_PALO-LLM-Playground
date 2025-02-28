import { Card, CardContent } from "@/components/ui/card"

interface EmbeddingDisplayProps {
  embedding: number[] | null;
  label?: string;
}

export const EmbeddingDisplay = ({ embedding, label }: EmbeddingDisplayProps) => {
  return (
    <Card className="w-full mt-2">
      <CardContent className="pt-4">
        <div className="text-sm font-medium mb-2">{label || 'Embedding Value:'}</div>
        <div className="text-sm text-muted-foreground break-all">
          {embedding ? JSON.stringify(embedding.slice(0, 5)) + '...' : 'No embedding generated yet'}
        </div>
      </CardContent>
    </Card>
  );
};
