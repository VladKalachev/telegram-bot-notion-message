import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

    this.setMessage('text');
  }

  async setMessage(text: string) {
    const databaseId = this.configService.get<string>('NOTION_PAGE_ID');
    if (!databaseId) {
      this.logger.error('NOTION_PAGE_ID is not defined');
      throw new Error('NOTION_PAGE_ID is not defined');
    }

    try {
      await this.notion.pages.create({
        parent: {
          database_id: this.configService.get<string>('NOTION_PAGE_ID'),
        },
        properties: {
          title: {
            title: [
              {
                text: {
                  content: text,
                },
              },
            ],
          },
        },
      });
    } catch (error) {
      this.logger.error(`Error fetching database entries: ${error.message}`);
      throw error;
    }
  }
}
