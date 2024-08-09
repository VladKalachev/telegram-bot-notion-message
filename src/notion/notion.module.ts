import { Module } from '@nestjs/common';
import { NotionController } from './notion.controller';
import { NotionService } from './notion.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TelegramModule } from 'src/telegram/telegram.module';

@Module({
  imports: [ScheduleModule.forRoot(), ConfigModule, TelegramModule],
  controllers: [NotionController],
  providers: [NotionService],
})
export class NotionModule {}
