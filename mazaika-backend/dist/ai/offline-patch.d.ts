export interface PatchResult {
    html: string;
    explanation: string;
}
export declare function applySemanticOfflinePatch(sourceHtml: string, promptText: string, isRu: boolean): PatchResult;
