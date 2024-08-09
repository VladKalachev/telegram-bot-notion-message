import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectBot, On, Start, Update } from 'nestjs-telegraf';
import { NotionService } from 'src/notion/notion.service';
import { Context, Telegraf } from 'telegraf';

@Injectable()
@Update()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly configService: ConfigService,
    private readonly notionService: NotionService,
  ) {}

  @Start()
  async startCommand(ctx: Context) {
    await ctx.reply(`Привет, ${ctx.message.from.first_name}!`);
  }

  @On('text')
  async sendMessageNotion(ctx: Context) {
    const message = ctx.text;
    this.notionService.setMessage(message);
  }

  async sendMessage(chatId: string, text: string) {
    try {
      await this.bot.telegram.sendMessage(chatId, text);
    } catch (error) {
      console.error('Error sending Telegram message', error);
    }
  }
}
