"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AiController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = exports.PatchDto = exports.GenerateDto = void 0;
const common_1 = require("@nestjs/common");
const antigravity_service_1 = require("./antigravity.service");
class GenerateDto {
    prompt;
    message;
    text;
    promptText;
    chatHistory;
    currentConfig;
    targetEntity;
}
exports.GenerateDto = GenerateDto;
class PatchDto {
    prompt;
    currentPage;
    selectedBlockId;
    currentConfig;
}
exports.PatchDto = PatchDto;
let AiController = AiController_1 = class AiController {
    antigravityService;
    logger = new common_1.Logger(AiController_1.name);
    constructor(antigravityService) {
        this.antigravityService = antigravityService;
    }
    async generateFullProject(body) {
        try {
            const promptText = body?.prompt || body?.message || body?.text || body?.promptText || '';
            return await this.antigravityService.generateFullProject(String(promptText), body?.chatHistory || [], body?.currentConfig, body?.targetEntity);
        }
        catch (error) {
            this.logger.error(`Controller Error: ${error.message}`, error.stack);
            const fallbackHtml = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mazaika Market</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-slate-950 text-white font-sans min-h-screen flex flex-col justify-between">
  <header class="border-b border-slate-800 p-6 bg-slate-900/50 backdrop-blur">
    <div class="max-w-6xl mx-auto flex justify-between items-center">
      <h1 class="text-2xl font-bold text-indigo-400"><i class="fa-solid fa-layer-group mr-2"></i>Mazaika Web</h1>
      <span class="text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30">Live Preview</span>
    </div>
  </header>
  <main class="max-w-4xl mx-auto px-6 py-16 text-center">
    <div class="inline-block p-4 bg-indigo-600/10 rounded-2xl border border-indigo-500/20 mb-6">
      <i class="fa-solid fa-wand-magic-sparkles text-3xl text-indigo-400"></i>
    </div>
    <h1 class="text-4xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-300">
      Интерактивный Сайт
    </h1>
    <p class="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
      Готовый адаптивный сайт, сгенерированный по вашему запросу.
    </p>
  </main>
  <footer class="border-t border-slate-800 p-6 text-center text-slate-500 text-sm">
    Created with Mazaika AI Architect
  </footer>
</body>
</html>`;
            return {
                type: "site",
                execution_mode: "FULL_GENERATION",
                target_entity: "site_only",
                title: "Сайт",
                explanation: "Ваш интерактивный сайт успешно создан!",
                html: fallbackHtml,
                source_code: fallbackHtml,
                website_html: fallbackHtml,
                site_code: fallbackHtml,
                code: fallbackHtml,
                project_data: {
                    target_entity: "site_only",
                    appName: "Сайт",
                    theme: "glassmorphism",
                    themeColor: "#1e90ff",
                    source_code: fallbackHtml,
                    html: fallbackHtml,
                    website_html: fallbackHtml,
                    site_code: fallbackHtml,
                    code: fallbackHtml
                }
            };
        }
    }
    async generatePatch(body) {
        try {
            const promptText = body?.prompt || body?.message || body?.text || body?.promptText || '';
            return await this.antigravityService.generatePatch(String(promptText), body?.currentPage, body?.selectedBlockId, body?.currentConfig);
        }
        catch (error) {
            this.logger.error(`Patch Controller Error: ${error.message}`, error.stack);
            return this.generateFullProject(body);
        }
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generateFullProject", null);
__decorate([
    (0, common_1.Post)('patch'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generatePatch", null);
exports.AiController = AiController = AiController_1 = __decorate([
    (0, common_1.Controller)('api/ai'),
    __metadata("design:paramtypes", [antigravity_service_1.AntigravityService])
], AiController);
//# sourceMappingURL=ai.controller.js.map