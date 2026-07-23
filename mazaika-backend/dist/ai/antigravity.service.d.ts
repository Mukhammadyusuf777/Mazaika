export declare class AntigravityService {
    private readonly logger;
    generate(promptText: string): Promise<{
        type: string;
        execution_mode: string;
        target_entity: any;
        explanation: any;
        html: any;
        source_code: any;
        website_html: any;
        site_code: any;
        code: any;
        project_data: {
            target_entity: any;
            appName: any;
            theme: any;
            themeColor: any;
            source_code: any;
            html: any;
            website_html: any;
            site_code: any;
            code: any;
            blocks: any;
            bot_blocks: any;
            site_blocks: any;
        };
    } | {
        type: string;
        execution_mode: string;
        target_entity: string;
        title: string;
        explanation: string;
        html: string;
        source_code: string;
        website_html: string;
        site_code: string;
        code: string;
        project_data: {
            target_entity: string;
            appName: string;
            theme: string;
            themeColor: string;
            source_code: string;
            html: string;
            website_html: string;
            site_code: string;
            code: string;
            blocks: never[];
            bot_blocks?: undefined;
            bot_edges?: undefined;
        };
    } | {
        type: string;
        execution_mode: string;
        target_entity: string;
        title: string;
        explanation: string;
        project_data: {
            target_entity: string;
            appName: string;
            bot_blocks: {
                id: string;
                type: string;
                position: {
                    x: number;
                    y: number;
                };
                data: {
                    label: string;
                    emoji: string;
                    color: string;
                    text: string;
                };
            }[];
            bot_edges: never[];
            theme?: undefined;
            themeColor?: undefined;
            source_code?: undefined;
            html?: undefined;
            website_html?: undefined;
            site_code?: undefined;
            code?: undefined;
            blocks?: undefined;
        };
        html?: undefined;
        source_code?: undefined;
        website_html?: undefined;
        site_code?: undefined;
        code?: undefined;
    }>;
    generateFullProject(promptText: string, chatHistory?: any[], currentConfig?: any, targetEntity?: 'bot_and_mini_app' | 'site_only'): Promise<{
        type: string;
        execution_mode: string;
        target_entity: any;
        explanation: any;
        html: any;
        source_code: any;
        website_html: any;
        site_code: any;
        code: any;
        project_data: {
            target_entity: any;
            appName: any;
            theme: any;
            themeColor: any;
            source_code: any;
            html: any;
            website_html: any;
            site_code: any;
            code: any;
            blocks: any;
            bot_blocks: any;
            site_blocks: any;
        };
    } | {
        type: string;
        execution_mode: string;
        target_entity: string;
        title: string;
        explanation: string;
        html: string;
        source_code: string;
        website_html: string;
        site_code: string;
        code: string;
        project_data: {
            target_entity: string;
            appName: string;
            theme: string;
            themeColor: string;
            source_code: string;
            html: string;
            website_html: string;
            site_code: string;
            code: string;
            blocks: never[];
            bot_blocks?: undefined;
            bot_edges?: undefined;
        };
    } | {
        type: string;
        execution_mode: string;
        target_entity: string;
        title: string;
        explanation: string;
        project_data: {
            target_entity: string;
            appName: string;
            bot_blocks: {
                id: string;
                type: string;
                position: {
                    x: number;
                    y: number;
                };
                data: {
                    label: string;
                    emoji: string;
                    color: string;
                    text: string;
                };
            }[];
            bot_edges: never[];
            theme?: undefined;
            themeColor?: undefined;
            source_code?: undefined;
            html?: undefined;
            website_html?: undefined;
            site_code?: undefined;
            code?: undefined;
            blocks?: undefined;
        };
        html?: undefined;
        source_code?: undefined;
        website_html?: undefined;
        site_code?: undefined;
        code?: undefined;
    }>;
    private generateViaCloudflare;
    generatePatch(promptText: string, currentPageUrl?: string, selectedBlockId?: string | null, currentConfig?: any): Promise<{
        type: string;
        execution_mode: string;
        target_entity: any;
        explanation: any;
        html: any;
        source_code: any;
        website_html: any;
        site_code: any;
        code: any;
        project_data: {
            target_entity: any;
            appName: any;
            theme: any;
            themeColor: any;
            source_code: any;
            html: any;
            website_html: any;
            site_code: any;
            code: any;
            blocks: any;
            bot_blocks: any;
            site_blocks: any;
        };
    } | {
        type: string;
        execution_mode: string;
        target_entity: string;
        title: string;
        explanation: string;
        html: string;
        source_code: string;
        website_html: string;
        site_code: string;
        code: string;
        project_data: {
            target_entity: string;
            appName: string;
            theme: string;
            themeColor: string;
            source_code: string;
            html: string;
            website_html: string;
            site_code: string;
            code: string;
            blocks: never[];
            bot_blocks?: undefined;
            bot_edges?: undefined;
        };
    } | {
        type: string;
        execution_mode: string;
        target_entity: string;
        title: string;
        explanation: string;
        project_data: {
            target_entity: string;
            appName: string;
            bot_blocks: {
                id: string;
                type: string;
                position: {
                    x: number;
                    y: number;
                };
                data: {
                    label: string;
                    emoji: string;
                    color: string;
                    text: string;
                };
            }[];
            bot_edges: never[];
            theme?: undefined;
            themeColor?: undefined;
            source_code?: undefined;
            html?: undefined;
            website_html?: undefined;
            site_code?: undefined;
            code?: undefined;
            blocks?: undefined;
        };
        html?: undefined;
        source_code?: undefined;
        website_html?: undefined;
        site_code?: undefined;
        code?: undefined;
    }>;
    private formatResponse;
    private generateFailsafe;
    private extractJsonObject;
}
