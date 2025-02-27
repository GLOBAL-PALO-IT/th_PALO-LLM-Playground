export const extractEval = (evaluationText: string): number => {
    const ratingRegex = /- Total rating: (\d+)/;

    // Execute the regex on the text
    const match = evaluationText.match(ratingRegex);

    // Check if a match was found and extract the score
    if (match && match[1]) {
        const totalScore = parseInt(match[1], 10);
        console.log("Total score:", totalScore);
        return totalScore
        
    } else {
        console.log("Total score not found.");
        return 0
    }
    
}