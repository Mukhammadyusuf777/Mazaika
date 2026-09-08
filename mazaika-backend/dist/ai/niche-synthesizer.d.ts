export interface NicheProduct {
    id: number;
    title: string;
    price: number;
    priceFormatted: string;
    category: string;
    badge: string;
    rating: string;
    img: string;
    desc: string;
}
export interface NicheConfig {
    nicheKey: string;
    appName: string;
    appCategory: string;
    themeColor: string;
    accentHex: string;
    gradientFrom: string;
    gradientTo: string;
    heroBadge: string;
    heroTitle: string;
    heroDesc: string;
    ctaText: string;
    products: NicheProduct[];
}
export declare function detectNiche(promptText: string): string;
export declare function getNicheConfig(niche: string, isRu: boolean): NicheConfig;
export declare function generateComprehensiveProject(promptText: string, target: 'site_only' | 'bot_and_mini_app', isRu: boolean): {
    html: string;
    bot_blocks: any[];
    bot_edges: any[];
    bot_code: string;
    appName: string;
};
