
### Instruction: Build a Sentence Similarity Page

**Objective:**  
Create a page that demonstrates sentence similarity using embeddings and cosine similarity. The page should be modular, visually clean, and utilize `shadcn` and `Tailwind CSS` (already installed).

---

### Requirements:

1. **File Location:**  
   - Place the page in the `components` folder.

2. **Styling:**  
   - Use `shadcn` components and `Tailwind CSS` for styling.

3. **Page Structure:**  
   The page should consist of two main sections:

   - **Section-Main:**  
     - Contains a **textarea** for the main sentence to be compared.  
     - Include a display area to show the **embedding value** of the main sentence after processing.  

   - **Section-ListSentences:**  
     - Contains a **vertical list of textareas** for sentences to be compared with the main sentence.  
     - Include a **button** to dynamically add new textareas to the list.  
     - Each sentence in the list should have a display area to show its **embedding value**.  

4. **Functionality:**  
   - Add a **"Get Embeddings" button** that triggers a placeholder function `getEmbeddings`.  
     - The function should accept:  
       - `main: string` (the main sentence).  
       - `sentences: string[]` (the list of sentences).  
     - The function should return a vector embedding for each sentence (no implementation required).  

   - Add a **"Calculate Cosine Similarity" button** that triggers a placeholder function `calculateCosineSimilarity`.  
     - This function should compute the cosine similarity between the main sentence and each sentence in the list (no implementation required).  

---

### Implementation Notes:

- **Modularity:**  
  - Break the page into reusable components (e.g., `MainSentence`, `SentenceList`, `EmbeddingDisplay`).  

- **Placeholder Functions:**  
  - Define the `getEmbeddings` and `calculateCosineSimilarity` functions as placeholders. Focus on the UI and data flow rather than the actual logic.  

- **User Experience:**  
  - Ensure the UI is intuitive and responsive.  
  - Use appropriate `shadcn` components (e.g., buttons, textareas, cards) for a polished look.  

- **Styling:**  
  - Leverage `Tailwind CSS` utilities for spacing, alignment, and responsiveness.  

---

### Example Component Structure:

```plaintext
components/
└── SentenceSimilarityPage/
    ├── MainSentence.tsx       // Main textarea and embedding display
    ├── SentenceList.tsx       // List of textareas and embedding displays
    ├── EmbeddingDisplay.tsx   // Reusable component for showing embedding values
    └── index.tsx             // Main page layout and logic
```
