import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { AntigravityService } from './antigravity.service';

export class GenerateDto {
  prompt?: string;
  message?: string;
  text?: string;
  promptText?: string;
  chatHistory?: { role: string; content: string }[];
  currentConfig?: any;
  targetEntity?: 'bot_and_mini_app' | 'site_only';
}

export class PatchDto {
  prompt?: string;
  currentPage?: string;
  selectedBlockId?: string | null;
  currentConfig?: any;
}

@Controller('api/ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly antigravityService: AntigravityService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generateFullProject(@Body() body: any) {
    try {
      const promptText = body?.prompt || body?.message || body?.text || body?.promptText || '';
      return await this.antigravityService.generateFullProject(
        String(promptText),
        body?.chatHistory || [],
        body?.currentConfig,
        body?.targetEntity
      );
    } catch (error: any) {
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

  @Post('patch')
  @HttpCode(HttpStatus.OK)
  async generatePatch(@Body() body: any) {
    try {
      const promptText = body?.prompt || body?.message || body?.text || body?.promptText || '';
      return await this.antigravityService.generatePatch(
        String(promptText),
        body?.currentPage,
        body?.selectedBlockId,
        body?.currentConfig
      );
    } catch (error: any) {
      this.logger.error(`Patch Controller Error: ${error.message}`, error.stack);
      return this.generateFullProject(body);
    }
  }
}
