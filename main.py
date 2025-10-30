import os
import logging
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

logging.basicConfig(level=logging.INFO)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.message.from_user
    await update.message.reply_text(
        f"Привет, {user.first_name}! 👋\n\n"
        "🏠 Я бот для поиска квартир в Симферополе!\n\n"
        "Команды:\n"
        "/start - начать работу\n"
        "/search - поиск квартир\n"
        "/help - помощь"
    )

async def search(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("🔍 Ищем квартиры в Симферополе...")

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("ℹ️ Используйте /search для поиска квартир")

def main():
    BOT_TOKEN = os.environ.get("BOT_TOKEN")
    if not BOT_TOKEN:
        print("❌ BOT_TOKEN не установлен! Добавьте в Railway Variables")
        return
        
    application = Application.builder().token(BOT_TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("search", search))
    application.add_handler(CommandHandler("help", help_command))
    
    print("🤖 Бот запущен!")
    application.run_polling()

if __name__ == "__main__":
    main()
