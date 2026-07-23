"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    try {
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        app.enableCors({
            origin: [
                'http://localhost:5173',
                'http://localhost:5174',
                'https://mazaika.pages.dev',
                process.env.FRONTEND_URL,
            ].filter(Boolean),
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            credentials: true,
        });
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: false,
        }));
        const port = process.env.PORT || 3000;
        await app.listen(port);
        console.log(`🚀 Mazaika backend running on port ${port}`);
    }
    catch (err) {
        console.error('❌ Failed to start application:', err);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map