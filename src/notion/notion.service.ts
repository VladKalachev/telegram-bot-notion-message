import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Client } from '@notionhq/client';
import { TelegramService } from 'src/telegram/telegram.service';

@Injectable()
export class NotionService {
  private readonly notion: Client;
  private readonly logger = new Logger(NotionService.name);
  private sentMessages: Set<string> = new Set();

  constructor(
    private readonly configService: ConfigService,
    private readonly telegramService: TelegramService,
  ) {
    const notionToken = this.configService.get<string>('NOTION_API_KEY');
    if (!notionToken) {
      this.logger.error('NOTION_API_KEY is not defined');
      throw new Error('NOTION_API_KEY is not defined');
    }

    this.notion = new Client({ auth: notionToken });
    this.logger.log('Notion client initialized');
    this.handleCron();
  }

  async getDatabaseEntries() {
    const databaseId = this.configService.get<string>('NOTION_PAGE_ID');
    if (!databaseId) {
      this.logger.error('NOTION_PAGE_ID is not defined');
      throw new Error('NOTION_PAGE_ID is not defined');
    }

    try {
      const response = await this.notion.databases.query({
        database_id: this.configService.get<string>('NOTION_PAGE_ID'),
      });

      const entries = response.results.map((page) => {
        const properties = (page as any).properties;
        return {
          id: page.id,
          Name: properties.Name.title[0]?.plain_text,
          Date: properties.Date.date?.start,
        };
      });

      return entries;
    } catch (error) {
      this.logger.error(`Error fetching database entries: ${error.message}`);
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES, { timeZone: 'Europe/Moscow' })
  async handleCron() {
    try {
      this.logger.log('Fetching database entries from Notion');
      const records = await this.getDatabaseEntries();
      const today = new Date().toISOString().split('T')[0]; // Формат YYYY-MM-DD

      for (const record of records) {
        if (!record.Date || !record.Name) {
          this.logger.warn('Entry is missing Date or Name field', record);
          continue;
        }

        const recordDate = new Date(record.Date).toISOString().split('T')[0];

        if (recordDate === today) {
          if (!this.sentMessages.has(record.id)) {
            const chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');
            await this.telegramService.sendMessage(chatId, record.Name);
            this.sentMessages.add(record.id);
          }
        }
      }
    } catch (error) {
      this.logger.error('Error in scheduled task', error);
    }
  }
}
