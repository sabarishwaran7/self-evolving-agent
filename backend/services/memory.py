import datetime
import math
from typing import List, Dict, Any
from backend.database import DatabaseHelper

class MemoryService:
    @staticmethod
    def calculate_tf_idf_similarity(text1: str, text2: str) -> float:
        """Pure Python cosine-similarity equivalent using term frequency."""
        def get_words(text: str) -> List[str]:
            return [w.lower() for w in text.split() if len(w) > 2]
            
        words1 = get_words(text1)
        words2 = get_words(text2)
        
        if not words1 or not words2:
            return 0.0
            
        all_words = set(words1 + words2)
        freq1 = {w: words1.count(w) for w in all_words}
        freq2 = {w: words2.count(w) for w in all_words}
        
        dot_product = sum(freq1[w] * freq2[w] for w in all_words)
        magnitude1 = math.sqrt(sum(freq1[w]**2 for w in all_words))
        magnitude2 = math.sqrt(sum(freq2[w]**2 for w in all_words))
        
        if magnitude1 * magnitude2 == 0:
            return 0.0
            
        return dot_product / (magnitude1 * magnitude2)

    @staticmethod
    async def add_feedback_to_memory(user_id: str, category: str, feedback_text: str, rating: int) -> dict:
        """Processes user feedback, synthesizes a dynamic rule (learned pattern), and stores it."""
        # Clean and categorize the rule based on feedback keywords
        keywords = feedback_text.lower()
        
        # Self-Evolving Rule Synthesizer
        rule = "Ensure writing remains highly academic."
        if "formal" in keywords or "academic" in keywords:
            rule = "Use a highly academic, authoritative tone. Avoid casual descriptors, contractions, or generic adjectives."
        elif "math" in keywords or "equation" in keywords or "formula" in keywords:
            rule = "Include formal mathematical equations or LaTeX formulations to explain system layouts and computational models."
        elif "explain" in keywords or "detail" in keywords or "stack" in keywords:
            rule = "Provide deep explanations of software libraries, databases, and structural code flows in the Methodology and Architecture sections."
        elif "citation" in keywords or "reference" in keywords:
            rule = "Strictly format citation lists as ordered indices e.g., [1], [2] and align them strictly in the reference matrix."
        elif "concise" in keywords or "short" in keywords:
            rule = "Synthesize information into brief, information-dense paragraphs and bulleted structures."
        else:
            rule = f"Incorporate user formatting request: '{feedback_text}'"

        memory_doc = {
            "userId": user_id,
            "feedbackText": feedback_text,
            "category": category,
            "learnedPattern": rule,
            "rating": rating,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
        
        saved = await DatabaseHelper.insert("ai_memory", memory_doc)
        return saved

    @staticmethod
    async def get_adaptive_instructions(user_id: str, query_context: str) -> str:
        """Queries the user's past feedback memory, scores relevance, and returns system adapters."""
        all_memories = await DatabaseHelper.find("ai_memory", {"userId": user_id})
        if not all_memories:
            return ""

        # Score and filter memories based on relevance to current paper topic or keywords
        relevant_rules = []
        for mem in all_memories:
            score = MemoryService.calculate_tf_idf_similarity(query_context, mem.get("feedbackText", ""))
            # If relevant or a high-priority feedback (rating < 3 or > 4), we apply it!
            if score > 0.1 or mem.get("rating", 3) >= 4:
                relevant_rules.append(mem.get("learnedPattern"))

        if not relevant_rules:
            # Fallback to the latest 2 rules learned to support dynamic evolution
            sorted_memories = sorted(all_memories, key=lambda x: x.get("timestamp", ""), reverse=True)
            relevant_rules = [m.get("learnedPattern") for m in sorted_memories[:2]]

        # Deduplicate
        relevant_rules = list(set(relevant_rules))
        
        if relevant_rules:
            formatted_rules = "\n".join(f"- {rule}" for rule in relevant_rules)
            return f"\n=== SELF-EVOLVED USER PREFERENCES (ADAPT TO THESE RULES) ===\n{formatted_rules}\n"
        
        return ""
