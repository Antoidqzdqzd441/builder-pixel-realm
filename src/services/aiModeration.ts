import axios from 'axios';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export interface ModerationResult {
  isApproved: boolean;
  reason?: string;
  confidence: number;
}

export class AIModeration {
  private static instance: AIModeration;
  
  private constructor() {}
  
  public static getInstance(): AIModeration {
    if (!AIModeration.instance) {
      AIModeration.instance = new AIModeration();
    }
    return AIModeration.instance;
  }

  public async moderateComment(content: string): Promise<ModerationResult> {
    try {
      const response = await axios.post(
        `${OPENROUTER_BASE_URL}/chat/completions`,
        {
          model: 'openai/gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `Tu es un modérateur IA pour une plateforme de portfolios créatifs. 
              
              Ton rôle est d'analyser les commentaires et de déterminer s'ils sont appropriés.
              
              CRITÈRES D'APPROBATION:
              ✅ Commentaires constructifs sur l'art/design
              ✅ Encouragements et compliments
              ✅ Questions techniques pertinentes
              ✅ Critiques constructives et respectueuses
              ✅ Discussions créatives positives
              
              CRITÈRES DE REJET:
              ❌ Insultes, harcèlement ou attaques personnelles
              ❌ Contenu sexuel explicite ou inapproprié
              ❌ Spam ou contenu publicitaire
              ❌ Propos discriminatoires (racisme, sexisme, etc.)
              ❌ Menaces ou incitations à la violence
              ❌ Contenu hors sujet ou perturbateur
              
              Réponds UNIQUEMENT avec un JSON valide dans ce format:
              {
                "approved": true/false,
                "reason": "Raison si rejeté",
                "confidence": 0.0-1.0
              }
              
              Sois modéré mais ferme. Privilégie la sécurité de la communauté.`
            },
            {
              role: 'user',
              content: `Analyse ce commentaire et détermine s'il doit être approuvé:\n\n"${content}"`
            }
          ],
          max_tokens: 150,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'X-Title': 'PortfolioHub Moderation'
          }
        }
      );

      const aiResponse = response.data.choices[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('No response from AI');
      }

      // Parse AI response
      const moderationData = JSON.parse(aiResponse);
      
      return {
        isApproved: moderationData.approved === true,
        reason: moderationData.reason || undefined,
        confidence: Math.min(Math.max(moderationData.confidence || 0.5, 0), 1)
      };

    } catch (error) {
      console.error('AI Moderation error:', error);
      
      // Fallback moderation with basic keyword detection
      return this.fallbackModeration(content);
    }
  }

  private fallbackModeration(content: string): ModerationResult {
    const lowerContent = content.toLowerCase();
    
    // Basic inappropriate content detection
    const badWords = [
      'connard', 'salaud', 'merde', 'putain', 'con', 'idiot', 'débile',
      'nazi', 'hitler', 'mort', 'tuer', 'suicide', 'spam', 'publicité',
      'sexe', 'porn', 'xxx', 'nude', 'fuck', 'shit', 'bitch', 'asshole'
    ];
    
    const foundBadWords = badWords.filter(word => lowerContent.includes(word));
    
    if (foundBadWords.length > 0) {
      return {
        isApproved: false,
        reason: `Contenu inapproprié détecté (modération automatique de secours)`,
        confidence: 0.7
      };
    }
    
    // Check for excessive caps (potential spam)
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.7 && content.length > 10) {
      return {
        isApproved: false,
        reason: 'Message en majuscules excessives (potentiel spam)',
        confidence: 0.6
      };
    }
    
    // Check for very short or very long messages
    if (content.trim().length < 3) {
      return {
        isApproved: false,
        reason: 'Message trop court',
        confidence: 0.8
      };
    }
    
    if (content.length > 1000) {
      return {
        isApproved: false,
        reason: 'Message trop long',
        confidence: 0.7
      };
    }
    
    // If no issues found, approve
    return {
      isApproved: true,
      confidence: 0.5
    };
  }
}

// Export singleton instance
export const aiModeration = AIModeration.getInstance();
