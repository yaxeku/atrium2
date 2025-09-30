import TelegramBot from 'node-telegram-bot-api';
import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const { Pool } = pg;
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const db = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const commandStates = {};

const mainMenu = {
    reply_markup: {
        keyboard: [
            ['Create Admin', 'Create User'],
            ['Add Domain', 'Manage Guild'],
            ['Manage Permissions']
        ],
        resize_keyboard: true,
        one_time_keyboard: true
    }
};

const guildMenu = {
    reply_markup: {
        keyboard: [
            ['Pause Guild', 'Unpause Guild'],
            ['Delete Guild'],
            ['Back to Main Menu']
        ],
        resize_keyboard: true,
        one_time_keyboard: true
    }
};

const permissionMenu = {
    reply_markup: {
        keyboard: [
            ['Add User Permission', 'Remove User Permission'],
            ['List Permissions'],
            ['Back to Main Menu']
        ],
        resize_keyboard: true,
        one_time_keyboard: true
    }
};

const cancelMenu = {
    reply_markup: {
        keyboard: [
            ['Cancel']
        ],
        resize_keyboard: true,
        one_time_keyboard: true
    }
};

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome to the Atrium Bot! Please choose an option from the menu below.", mainMenu);
});

bot.onText(/\/help/, (msg) => {
    const helpMessage = `
*Atrium Bot Help*

This bot helps you manage your Atrium guilds, admins, and users.

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

const isSuperAdmin = (userId) => {
    return userId.toString() === process.env.TELEGRAM_BOT_ADMIN_ID;
};

const isAuthorized = async (userId) => {
    if (isSuperAdmin(userId)) {
        return true;
    }
    const result = await db.query('SELECT * FROM bot_permissions WHERE user_id = $1', [userId.toString()]);
    return result.rows.length > 0;
};

async function handleCreateAdmin(chatId, text, state) {
    const saltRounds = 10;
    if (state.step === 1) {
        state.username = text;
        state.step = 2;
        bot.sendMessage(chatId, "Please enter the password for the new admin.", cancelMenu);
    } else if (state.step === 2) {
        state.password = text;
        state.step = 3;
        bot.sendMessage(chatId, "Please enter the guild for the new admin.", cancelMenu);
    } else if (state.step === 3) {
        state.guild = text;
        try {
            const existingAdmin = await db.query('SELECT * FROM admins WHERE username = $1', [state.username]);
            if (existingAdmin.rows.length > 0) {
                bot.sendMessage(chatId, `Admin with username ${state.username} already exists.`, mainMenu);
            } else {
                const hashedPassword = await bcrypt.hash(state.password, saltRounds);
                const userid = uuidv4();
                const query = 'INSERT INTO admins (userid, username, password, guild) VALUES ($1, $2, $3, $4)';
                await db.query(query, [userid, state.username, hashedPassword, state.guild]);
                bot.sendMessage(chatId, `Admin ${state.username} created successfully for guild ${state.guild}.`, mainMenu);
            }
        } catch (error) {
            console.error('Error creating admin:', error);
            bot.sendMessage(chatId, "An unexpected error occurred while creating the admin. Please check the logs.", mainMenu);
        }
        delete commandStates[chatId];
    }
}

async function handleCreateUser(chatId, text, state) {
    const saltRounds = 10;
    if (state.step === 1) {
        state.username = text;
        state.step = 2;
        bot.sendMessage(chatId, "Please enter the user ID for the new user.", cancelMenu);
    } else if (state.step === 2) {
        state.userid = text;
        state.step = 3;
        bot.sendMessage(chatId, "Please enter the password for the new user.", cancelMenu);
    } else if (state.step === 3) {
        state.password = text;
        state.step = 4;
        bot.sendMessage(chatId, "Please enter the rank for the new user.", cancelMenu);
    } else if (state.step === 4) {
        state.rank = text;
        state.step = 5;
        bot.sendMessage(chatId, "Please enter the guild for the new user.", cancelMenu);
    } else if (state.step === 5) {
        state.guild = text;
        try {
            const existingUser = await db.query('SELECT * FROM users WHERE username = $1', [state.username]);
            if (existingUser.rows.length > 0) {
                bot.sendMessage(chatId, `User with username ${state.username} already exists.`, mainMenu);
            } else {
                const hashedPassword = await bcrypt.hash(state.password, saltRounds);
                const query = 'INSERT INTO users (username, userid, password, rank, guild) VALUES ($1, $2, $3, $4, $5)';
                await db.query(query, [state.username, state.userid, hashedPassword, state.rank, state.guild]);
                bot.sendMessage(chatId, `User ${state.username} created successfully in guild ${state.guild}.`, mainMenu);
            }
        } catch (error) {
            console.error('Error creating user:', error);
            bot.sendMessage(chatId, "An unexpected error occurred while creating the user. Please check the logs.", mainMenu);
        }
        delete commandStates[chatId];
    }
}

async function handleAddDomain(chatId, text, state) {
    if (state.step === 1) {
        state.url = text;
        state.step = 2;
        bot.sendMessage(chatId, "Please enter the template for the domain.", cancelMenu);
    } else if (state.step === 2) {
        state.template = text;
        state.step = 3;
        bot.sendMessage(chatId, "Please enter the guild for the domain.", cancelMenu);
    } else if (state.step === 3) {
        state.guild = text;
        try {
            const existingDomain = await db.query('SELECT * FROM guilddomains WHERE url = $1 AND guild = $2', [state.url, state.guild]);
            if (existingDomain.rows.length > 0) {
                bot.sendMessage(chatId, `Domain ${state.url} already exists in this guild.`, mainMenu);
            } else {
                const query = 'INSERT INTO guilddomains (url, template, guild) VALUES ($1, $2, $3)';
                await db.query(query, [state.url, state.template, state.guild]);
                bot.sendMessage(chatId, `Domain ${state.url} added successfully to guild ${state.guild}.`, mainMenu);
            }
        } catch (error) {
            console.error('Error adding domain:', error);
            bot.sendMessage(chatId, "An unexpected error occurred while adding the domain. Please check the logs.", mainMenu);
        }
        delete commandStates[chatId];
    }
}

async function handlePauseGuild(chatId, text) {
    const guildToPause = text;
    try {
        const guildExists = await db.query('SELECT * FROM admins WHERE guild = $1', [guildToPause]);
        if (guildExists.rows.length === 0) {
            bot.sendMessage(chatId, `Guild ${guildToPause} does not exist.`, guildMenu);
        } else {
            const isPaused = await db.query('SELECT * FROM paused_guilds WHERE guild = $1', [guildToPause]);
            if (isPaused.rows.length > 0) {
                bot.sendMessage(chatId, `Guild ${guildToPause} is already paused.`, guildMenu);
            } else {
                const query = 'INSERT INTO paused_guilds (guild) VALUES ($1)';
                await db.query(query, [guildToPause]);
                bot.sendMessage(chatId, `Guild ${guildToPause} has been paused.`, guildMenu);
            }
        }
    } catch (error) {
        console.error('Error pausing guild:', error);
        bot.sendMessage(chatId, "An unexpected error occurred while pausing the guild. Please check the logs.", guildMenu);
    }
    delete commandStates[chatId];
}

async function handleUnpauseGuild(chatId, text) {
    const guildToUnpause = text;
    try {
        const isPaused = await db.query('SELECT * FROM paused_guilds WHERE guild = $1', [guildToUnpause]);
        if (isPaused.rows.length === 0) {
            bot.sendMessage(chatId, `Guild ${guildToUnpause} is not paused.`, guildMenu);
        } else {
            const query = 'DELETE FROM paused_guilds WHERE guild = $1';
            await db.query(query, [guildToUnpause]);
            bot.sendMessage(chatId, `Guild ${guildToUnpause} has been unpaused.`, guildMenu);
        }
    } catch (error) {
        console.error('Error unpausing guild:', error);
        bot.sendMessage(chatId, "An unexpected error occurred while unpausing the guild. Please check the logs.", guildMenu);
    }
    delete commandStates[chatId];
}

async function handleDeleteGuild(chatId, text, state) {
    if (state.step === 1) {
        state.guild = text;
        const guildExists = await db.query('SELECT * FROM admins WHERE guild = $1', [state.guild]);
        if (guildExists.rows.length === 0) {
            bot.sendMessage(chatId, `Guild ${state.guild} does not exist.`, guildMenu);
            delete commandStates[chatId];
        } else {
            state.step = 2;
            bot.sendMessage(chatId, `Are you sure you want to delete the guild ${state.guild}? This action cannot be undone. Type 'YES' to confirm.`, cancelMenu);
        }
    } else if (state.step === 2) {
        if (text === 'YES') {
            const client = await db.connect();
            try {
                await client.query('BEGIN');
                await client.query('DELETE FROM guilddomains WHERE guild = $1', [state.guild]);
                await client.query('DELETE FROM cashouts WHERE guild = $1', [state.guild]);
                await client.query('DELETE FROM users WHERE guild = $1', [state.guild]);
                await client.query('DELETE FROM admins WHERE guild = $1', [state.guild]);
                await client.query('DELETE FROM guildsettings WHERE guild = $1', [state.guild]);
                await client.query('DELETE FROM paused_guilds WHERE guild = $1', [state.guild]);
                await client.query('COMMIT');
                bot.sendMessage(chatId, `Guild ${state.guild} and all associated data have been deleted.`, guildMenu);
            } catch (error) {
                await client.query('ROLLBACK');
                console.error('Error deleting guild:', error);
                bot.sendMessage(chatId, "An unexpected error occurred while deleting the guild. Please check the logs.", guildMenu);
            } finally {
                client.release();
            }
        } else {
            bot.sendMessage(chatId, "Guild deletion cancelled.", guildMenu);
        }
        delete commandStates[chatId];
    }
}

async function handleAddUserPermission(chatId, text) {
    const userIdToAdd = text;
    if (isNaN(parseInt(userIdToAdd))) {
        bot.sendMessage(chatId, "Invalid User ID. Please provide a valid Telegram User ID.", permissionMenu);
        delete commandStates[chatId];
        return;
    }
    try {
        await db.query('INSERT INTO bot_permissions (user_id) VALUES ($1)', [userIdToAdd]);
        bot.sendMessage(chatId, `User ${userIdToAdd} has been granted permission.`, permissionMenu);
    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, "An error occurred while adding user permission.", permissionMenu);
    }
    delete commandStates[chatId];
}

async function handleRemoveUserPermission(chatId, text) {
    const userIdToRemove = text;
    try {
        await db.query('DELETE FROM bot_permissions WHERE user_id = $1', [userIdToRemove]);
        bot.sendMessage(chatId, `User ${userIdToRemove} has had their permission revoked.`, permissionMenu);
    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, "An error occurred while removing user permission.", permissionMenu);
    }
    delete commandStates[chatId];
}

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
                    await handleCreateAdmin(chatId, text, state);
                    break;
                case 'createuser':
                    await handleCreateUser(chatId, text, state);
                    break;
                case 'adddomain':
                    await handleAddDomain(chatId, text, state);
                    break;
                case 'pauseguild':
                    await handlePauseGuild(chatId, text);
                    break;
                case 'unpauseguild':
                    await handleUnpauseGuild(chatId, text);
                    break;
                case 'deleteguild':
                    await handleDeleteGuild(chatId, text, state);
                    break;
                case 'adduserpermission':
                    await handleAddUserPermission(chatId, text);
                    break;
                case 'removeuserpermission':
                    await handleRemoveUserPermission(chatId, text);
                    break;
            }
        } catch (error) {
            console.error('Error in state handler:', error);
            bot.sendMessage(chatId, "An unexpected error occurred. Please try again.", mainMenu);
            delete commandStates[chatId];
        }
    } else {
        switch (text) {
            case 'Pause Guild':
                commandStates[chatId] = { command: 'pauseguild', step: 1 };
                bot.sendMessage(chatId, "Please enter the name of the guild to pause.", cancelMenu);
                break;
            case 'Unpause Guild':
                commandStates[chatId] = { command: 'unpauseguild', step: 1 };
                bot.sendMessage(chatId, "Please enter the name of the guild to unpause.", cancelMenu);
                break;
            case 'Delete Guild':
                commandStates[chatId] = { command: 'deleteguild', step: 1 };
                bot.sendMessage(chatId, "Please enter the name of the guild to delete.", cancelMenu);
                break;
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
                bot.sendMessage(chatId, "Please choose a guild management option.", guildMenu);
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

console.log('Telegram bot is running...');
