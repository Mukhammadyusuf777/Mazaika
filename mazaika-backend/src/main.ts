import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
    
    // CORS — allow all frontend domains (useful for Vercel preview links and grants)
    app.enableCors({
      origin: true, // Dynamically allows the incoming origin
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
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Mazaika backend running on port ${port}`);
  } catch (err) {
    console.error('❌ Failed to start application:', err);
    process.exit(1);
  }
}
bootstrap();
