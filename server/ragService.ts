import { DocumentChunk, KnowledgeDocument, buildAllChunks } from './knowledgeData';

export interface RetrievedChunk {
  chunk: DocumentChunk;
  score: number;
  excerpt: string;
}

export class RAGService {
  private documents: KnowledgeDocument[];
  private chunks: DocumentChunk[];

  constructor(initialDocs: KnowledgeDocument[]) {
    this.documents = [...initialDocs];
    this.chunks = buildAllChunks(this.documents);
  }

  public getDocuments(): KnowledgeDocument[] {
    return this.documents;
  }

  public addDocument(doc: KnowledgeDocument): void {
    this.documents.push(doc);
    this.reindexAll();
  }

  public removeDocument(id: string): boolean {
    const initialLen = this.documents.length;
    this.documents = this.documents.filter(d => d.id !== id);
    if (this.documents.length !== initialLen) {
      this.reindexAll();
      return true;
    }
    return false;
  }

  public reindexDocument(id: string): boolean {
    const doc = this.documents.find(d => d.id === id);
    if (!doc) return false;
    doc.status = 'indexed';
    this.reindexAll();
    return true;
  }

  private reindexAll(): void {
    this.chunks = buildAllChunks(this.documents);
  }

  public search(query: string, courseId?: string, topK = 5): RetrievedChunk[] {
    if (!query || this.chunks.length === 0) return [];

    const queryWords = query
      .toLowerCase()
      .replace(/[^a-z0-9\s_-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);

    const scored = this.chunks.map(chunk => {
      let score = 0;
      const lowerContent = chunk.content.toLowerCase();
      const lowerDocName = chunk.docName.toLowerCase();
      const lowerCourseName = chunk.courseName.toLowerCase();

      // Course match bonus
      if (courseId && courseId !== 'all' && courseId !== 'general') {
        if (chunk.courseId === courseId) {
          score += 15;
        } else if (chunk.courseId === 'general') {
          score += 2;
        } else {
          // Chunk is from a different specific course
          score -= 10;
        }
      }

      // Keyword matching & density
      for (const word of queryWords) {
        if (lowerDocName.includes(word)) score += 8;
        if (lowerCourseName.includes(word)) score += 6;

        // Occurrences in content
        const matches = (lowerContent.match(new RegExp(`\\b${word}`, 'g')) || []).length;
        if (matches > 0) {
          score += Math.min(matches * 4, 20);
        }
      }

      // Phrase match bonus
      if (query.length > 5 && lowerContent.includes(query.toLowerCase().trim())) {
        score += 25;
      }

      // Excerpt creation
      const firstWord = queryWords.find(w => lowerContent.includes(w));
      let excerpt = '';
      if (firstWord) {
        const idx = lowerContent.indexOf(firstWord);
        const start = Math.max(0, idx - 60);
        const end = Math.min(chunk.content.length, idx + 180);
        excerpt = (start > 0 ? '...' : '') + chunk.content.substring(start, end).replace(/\n/g, ' ') + (end < chunk.content.length ? '...' : '');
      } else {
        excerpt = chunk.content.substring(0, 180).replace(/\n/g, ' ') + '...';
      }

      return {
        chunk,
        score,
        excerpt
      };
    });

    // Filter positive score, sort desc, take topK
    const relevant = scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    // If no exact match found, return top general chunks matching courseId if available
    if (relevant.length === 0 && courseId && courseId !== 'all') {
      const courseChunks = this.chunks
        .filter(c => c.courseId === courseId)
        .slice(0, topK)
        .map(chunk => ({
          chunk,
          score: 5,
          excerpt: chunk.content.substring(0, 180).replace(/\n/g, ' ') + '...'
        }));
      return courseChunks;
    }

    // Normalize similarity between 0.70 and 0.98
    const maxScore = Math.max(...relevant.map(r => r.score), 1);
    return relevant.map(r => ({
      ...r,
      score: Number(Math.min(0.98, Math.max(0.72, 0.72 + (r.score / maxScore) * 0.25)).toFixed(2))
    }));
  }
}
