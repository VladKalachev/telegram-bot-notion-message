import { Module } from '@nestjs/common';
import { TelegramModule } from './telegram/telegram.module';
import { NotionModule } from './notion/notion.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), TelegramModule, NotionModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
