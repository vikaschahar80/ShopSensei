import { Product, UserBehavior } from "@shared/schema";

export interface RecommendationEngine {
  generateRecommendations(userId: string, userBehavior: UserBehavior[], allProducts: Product[]): Product[];
  calculateSimilarity(user1Behavior: UserBehavior[], user2Behavior: UserBehavior[]): number;
}

export class CollaborativeFilteringEngine implements RecommendationEngine {
  generateRecommendations(userId: string, userBehavior: UserBehavior[], allProducts: Product[]): Product[] {
    // Simple collaborative filtering implementation
    const userProductIds = new Set(userBehavior.map(b => b.productId));
    
    // Find products not yet interacted with by the user
    const candidateProducts = allProducts.filter(p => !userProductIds.has(p.id) && p.isActive);
    
    // Score products based on similarity to user's behavior patterns
    const scoredProducts = candidateProducts.map(product => {
      let score = 0;
      
      // Category preference scoring
      const userCategories = userBehavior
        .map(b => allProducts.find(p => p.id === b.productId)?.categoryId)
        .filter(Boolean);
      
      const categoryCount = userCategories.filter(cat => cat === product.categoryId).length;
      score += categoryCount * 2;
      
      // Tag similarity scoring
      const userTags = userBehavior
        .map(b => allProducts.find(p => p.id === b.productId)?.tags)
        .filter(Boolean)
        .flat();
      
      const tagMatches = product.tags?.filter(tag => userTags.includes(tag)).length || 0;
      score += tagMatches;
      
      // Price range preference
      const userPrices = userBehavior
        .map(b => allProducts.find(p => p.id === b.productId)?.price)
        .filter(Boolean)
        .map(p => parseFloat(p as string));
      
      if (userPrices.length > 0) {
        const avgUserPrice = userPrices.reduce((a, b) => a + b, 0) / userPrices.length;
        const productPrice = parseFloat(product.price);
        const priceDiff = Math.abs(avgUserPrice - productPrice) / avgUserPrice;
        score += Math.max(0, 1 - priceDiff); // Closer to avg price = higher score
      }
      
      // Rating boost
      score += parseFloat(product.rating || "0") * 0.5;
      
      return { product, score };
    });
    
    // Return top 6 recommendations
    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(item => item.product);
  }
  
  calculateSimilarity(user1Behavior: UserBehavior[], user2Behavior: UserBehavior[]): number {
    const user1Products = Array.from(user1Behavior.map(b => b.productId).filter(Boolean));
    const user2Products = Array.from(user2Behavior.map(b => b.productId).filter(Boolean));
    
    const intersection = user1Products.filter(x => user2Products.includes(x));
    const union = Array.from(new Set([...user1Products, ...user2Products]));
    
    // Jaccard similarity
    return intersection.length / union.length;
  }
}

export const recommendationEngine = new CollaborativeFilteringEngine();
