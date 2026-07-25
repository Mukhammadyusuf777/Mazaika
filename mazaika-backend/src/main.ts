import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
    
    // CORS — allow frontend domains
    app.enableCors({
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://mazaika.pages.dev',
        process.env.FRONTEND_URL,
      ].filter(Boolean) as string[],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    });

    // Global validation
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false, // Allow extra fields for flexibility
    }));

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Mazaika backend running on port ${port}`);
  } catch (err) {
    console.error('❌ Failed to start application:', err);
    process.exit(1);
  }
}
bootstrap();
