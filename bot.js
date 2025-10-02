import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import db from './database.js';
import { mainMenu, guildMenu, permissionMenu, cancelMenu, viewDataMenu } from './menus.js';
import {
    commandStates,
    isSuperAdmin,
    isAuthorized,
    handleCreateAdmin,
    handleCreateUser,
    handleAddDomain,
    handlePauseGuild,
    handleUnpauseGuild,
    handleDeleteGuild,
    handleAddUserPermission,
    handleRemoveUserPermission,
    showGuildManagementOptions,
    showGuildActions,
    selectGuildForAction,
    handleViewGuildMembers,
    handleListDomains
} from './handlers.js';

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome to the Xekku Panel Bot! Please choose an option from the menu below.", mainMenu);
});

bot.onText(/\/help/, (msg) => {
    const helpMessage = `
*Xekku Panel Help*

This bot helps you manage your Xekku Panel guilds, admins, and users.

*Available Commands:*
/start - Show the main menu.
/help - Show this help message.
/cancel - Cancel the current operation.

*Main Menu Options:*
- *Create Admin*: Create a new admin for a guild.
- *Create User*: Create a new user under an admin's guild.
- *Add Domain*: Add a new domain to a guild.
- *Manage Guild*: Access options to pause, unpause, or delete a guild.
- *Manage Permissions* (Super Admin only): Grant or revoke bot usage permissions.
    `;
    bot.sendMessage(msg.chat.id, helpMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/cancel/, (msg) => {
    const chatId = msg.chat.id;
    if (commandStates[chatId]) {
        delete commandStates[chatId];
        bot.sendMessage(chatId, "Operation cancelled.", mainMenu);
    } else {
        bot.sendMessage(chatId, "There is no operation to cancel.", mainMenu);
    }
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;

    if (text.startsWith('/')) return;

    if (text === 'Cancel') {
        if (commandStates[chatId]) {
            delete commandStates[chatId];
            bot.sendMessage(chatId, "Operation cancelled.", mainMenu);
        } else {
            bot.sendMessage(chatId, "There is no operation to cancel.", mainMenu);
        }
        return;
    }

    if (!await isAuthorized(userId)) {
        bot.sendMessage(chatId, "You are not authorized to use this bot.");
        return;
    }

    const state = commandStates[chatId];

    if (state) {
        try {
            switch (state.command) {
                case 'createadmin':
                    await handleCreateAdmin(bot, chatId, text, state);
                    break;
                case 'createuser':
                    await handleCreateUser(bot, chatId, text, state);
                    break;
                case 'adddomain':
                    await handleAddDomain(bot, chatId, text, state);
                    break;
                case 'adduserpermission':
                    await handleAddUserPermission(bot, chatId, text);
                    break;
                case 'removeuserpermission':
                    await handleRemoveUserPermission(bot, chatId, text);
                    break;
            }
        } catch (error) {
            console.error('Error in state handler:', error);
            bot.sendMessage(chatId, "An unexpected error occurred. Please try again.", mainMenu);
            delete commandStates[chatId];
        }
    } else {
        switch (text) {
            case 'Add User Permission':
                commandStates[chatId] = { command: 'adduserpermission', step: 1 };
                bot.sendMessage(chatId, "Please enter the Telegram User ID to grant permission.", cancelMenu);
                break;
            case 'Remove User Permission':
                commandStates[chatId] = { command: 'removeuserpermission', step: 1 };
                bot.sendMessage(chatId, "Please enter the Telegram User ID to revoke permission.", cancelMenu);
                break;
            case 'List Permissions':
                if (!isSuperAdmin(userId)) {
                    bot.sendMessage(chatId, "You are not authorized for this action.");
                    return;
                }
                try {
                    const result = await db.query('SELECT * FROM bot_permissions');
                    if (result.rows.length === 0) {
                        bot.sendMessage(chatId, "No users have been granted permission.", permissionMenu);
                        return;
                    }
                    const userIds = result.rows.map(row => `- ${row.user_id}`).join('\n');
                    bot.sendMessage(chatId, `*Authorized Users:*\n${userIds}`, { parse_mode: 'Markdown', ...permissionMenu });
                } catch (error) {
                    console.error('Error listing permissions:', error);
                    bot.sendMessage(chatId, "An unexpected error occurred while listing permissions. Please check the logs.", permissionMenu);
                }
                break;
            case 'Create Admin':
                commandStates[chatId] = { command: 'createadmin', step: 1 };
                bot.sendMessage(chatId, "Please enter the username for the new admin.", cancelMenu);
                break;
            case 'Create User':
                commandStates[chatId] = { command: 'createuser', step: 1 };
                bot.sendMessage(chatId, "Please enter the username for the new user.", cancelMenu);
                break;
            case 'Add Domain':
                commandStates[chatId] = { command: 'adddomain', step: 1 };
                bot.sendMessage(chatId, "Please enter the domain URL.", cancelMenu);
                break;
            case 'Manage Guild':
                await showGuildManagementOptions(bot, chatId);
                break;
            case 'View Data':
                bot.sendMessage(chatId, "Please choose a data type to view.", viewDataMenu);
                break;
            case 'View Guild Members':
                await selectGuildForAction(bot, chatId, 'view_members');
                break;
            case 'List Domains':
                await selectGuildForAction(bot, chatId, 'view_domains');
                break;
            case 'Manage Permissions':
                if (!isSuperAdmin(userId)) {
                    bot.sendMessage(chatId, "You are not authorized for this action.");
                    return;
                }
                bot.sendMessage(chatId, "Please choose a permission management option.", permissionMenu);
                break;
            case 'Back to Main Menu':
                bot.sendMessage(chatId, "Returning to the main menu.", mainMenu);
                break;
            default:
                bot.sendMessage(chatId, "I'm sorry, I don't understand that command. Please use the menu or type /help.", mainMenu);
        }
    }
});

bot.on('callback_query', async (callbackQuery) => {
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const data = callbackQuery.data;

    const [action, value] = data.split(':');

    if (action === 'manage_guild') {
        const guildName = value;
        await showGuildActions(bot, chatId, guildName);
        bot.deleteMessage(chatId, messageId); // Clean up the previous message
    } else if (action === 'pause_guild') {
        const guildName = value;
        await handlePauseGuild(bot, callbackQuery.id, guildName);
        await showGuildActions(bot, chatId, guildName); // Refresh the menu
        bot.deleteMessage(chatId, messageId);
    } else if (action === 'unpause_guild') {
        const guildName = value;
        await handleUnpauseGuild(bot, callbackQuery.id, guildName);
        await showGuildActions(bot, chatId, guildName); // Refresh the menu
        bot.deleteMessage(chatId, messageId);
    } else if (action === 'delete_guild') {
        const guildName = value;
        const confirmationKeyboard = {
            inline_keyboard: [
                [
                    { text: "YES, DELETE IT", callback_data: `confirm_delete_guild:${guildName}` },
                    { text: "NO, CANCEL", callback_data: `manage_guild:${guildName}` }
                ]
            ]
        };
        bot.editMessageText(`*Are you absolutely sure?*\nThis will permanently delete the guild *${guildName}* and all its data.`, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'Markdown',
            reply_markup: confirmationKeyboard
        });
    } else if (action === 'confirm_delete_guild') {
        const guildName = value;
        await handleDeleteGuild(bot, callbackQuery.id, guildName);
        bot.editMessageText(`Guild ${guildName} has been deleted.`, {
            chat_id: chatId,
            message_id: messageId
        });
    } else if (action === 'back_to_guilds') {
        await showGuildManagementOptions(bot, chatId);
        bot.deleteMessage(chatId, messageId);
    } else if (action === 'view_members') {
        const guildName = value;
        await handleViewGuildMembers(bot, chatId, guildName);
        bot.deleteMessage(chatId, messageId);
    } else if (action === 'view_domains') {
        const guildName = value;
        await handleListDomains(bot, chatId, guildName);
        bot.deleteMessage(chatId, messageId);
    } else {
        bot.answerCallbackQuery(callbackQuery.id);
    }
});

console.log('Telegram bot is running...');
