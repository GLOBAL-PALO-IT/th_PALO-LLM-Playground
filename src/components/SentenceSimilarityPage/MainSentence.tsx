import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmbeddingDisplay } from "./EmbeddingDisplay"

interface MainSentenceProps {
  value: string;
  onChange: (value: string) => void;
  embedding: number[] | null;
}

export const MainSentence = ({ value, onChange, embedding }: MainSentenceProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Main Sentence</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Enter the main sentence to compare..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[100px]"
        />
        <EmbeddingDisplay embedding={embedding} />
      </CardContent>
    </Card>
  );
};
