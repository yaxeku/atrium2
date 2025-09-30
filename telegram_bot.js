import TelegramBot from 'node-telegram-bot-api';
import pg from 'pg';
import dotenv from 'dotenv';

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

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome to the Atrium Bot!");
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

bot.onText(/\/adduserpermission (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!isSuperAdmin(userId)) {
        bot.sendMessage(chatId, "You are not authorized to use this command.");
        return;
    }

    const userIdToAdd = match[1];
    try {
        await db.query('INSERT INTO bot_permissions (user_id) VALUES ($1)', [userIdToAdd]);
        bot.sendMessage(chatId, `User ${userIdToAdd} has been granted permission.`);
    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, "An error occurred while adding user permission.");
    }
});

bot.onText(/\/removeuserpermission (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!isSuperAdmin(userId)) {
        bot.sendMessage(chatId, "You are not authorized to use this command.");
        return;
    }

    const userIdToRemove = match[1];
    try {
        await db.query('DELETE FROM bot_permissions WHERE user_id = $1', [userIdToRemove]);
        bot.sendMessage(chatId, `User ${userIdToRemove} has had their permission revoked.`);
    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, "An error occurred while removing user permission.");
    }
});

bot.onText(/\/listpermissions/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!isSuperAdmin(userId)) {
        bot.sendMessage(chatId, "You are not authorized to use this command.");
        return;
    }

    try {
        const result = await db.query('SELECT * FROM bot_permissions');
        const userIds = result.rows.map(row => row.user_id).join('\n');
        bot.sendMessage(chatId, `Authorized Users:\n${userIds}`);
    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, "An error occurred while listing user permissions.");
    }
});

bot.onText(/\/createadmin (.+) (.+) (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!await isAuthorized(userId)) {
        bot.sendMessage(chatId, "You are not authorized to use this command.");
        return;
    }

    const newAdminUsername = match[1];
    const newAdminPassword = match[2];
    const newAdminGuild = match[3];

    try {
        const existingAdmin = await db.query('SELECT * FROM admins WHERE username = $1', [newAdminUsername]);
        if (existingAdmin.rows.length > 0) {
            bot.sendMessage(chatId, `Admin with username ${newAdminUsername} already exists.`);
            return;
        }

        const query = 'INSERT INTO admins (username, password, guild) VALUES ($1, $2, $3)';
        await db.query(query, [newAdminUsername, newAdminPassword, newAdminGuild]);
        bot.sendMessage(chatId, `Admin ${newAdminUsername} created successfully for guild ${newAdminGuild}.`);
    } catch (error) {
        console.error('Error creating admin:', error);
        bot.sendMessage(chatId, "An unexpected error occurred while creating the admin. Please check the logs.");
    }
});

bot.onText(/\/createuser (.+) (.+) (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!await isAuthorized(userId)) {
        bot.sendMessage(chatId, "You are not authorized to use this command.");
        return;
    }

    const adminResult = await db.query('SELECT guild FROM admins WHERE username = $1', [msg.from.username]);
    if (adminResult.rows.length === 0) {
        bot.sendMessage(chatId, "You are not registered as an admin.");
        return;
    }
    const adminGuild = adminResult.rows[0].guild;

    const newUsername = match[1];
    const newPassword = match[2];
    const newRank = match[3];

    try {
        const existingUser = await db.query('SELECT * FROM users WHERE username = $1', [newUsername]);
        if (existingUser.rows.length > 0) {
            bot.sendMessage(chatId, `User with username ${newUsername} already exists.`);
            return;
        }

        const query = 'INSERT INTO users (username, password, rank, guild) VALUES ($1, $2, $3, $4)';
        await db.query(query, [newUsername, newPassword, newRank, adminGuild]);
        bot.sendMessage(chatId, `User ${newUsername} created successfully in guild ${adminGuild}.`);
    } catch (error) {
        console.error('Error creating user:', error);
        bot.sendMessage(chatId, "An unexpected error occurred while creating the user. Please check the logs.");
    }
});

bot.onText(/\/adddomain (.+) (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!await isAuthorized(userId)) {
        bot.sendMessage(chatId, "You are not authorized to use this command.");
        return;
    }

    const adminResult = await db.query('SELECT guild FROM admins WHERE username = $1', [msg.from.username]);
    if (adminResult.rows.length === 0) {
        bot.sendMessage(chatId, "You are not registered as an admin.");
        return;
    }
    const adminGuild = adminResult.rows[0].guild;

    const newDomainUrl = match[1];
    const newDomainTemplate = match[2];

    try {
        const existingDomain = await db.query('SELECT * FROM guilddomains WHERE url = $1 AND guild = $2', [newDomainUrl, adminGuild]);
        if (existingDomain.rows.length > 0) {
            bot.sendMessage(chatId, `Domain ${newDomainUrl} already exists in this guild.`);
            return;
        }

        const query = 'INSERT INTO guilddomains (url, template, guild) VALUES ($1, $2, $3)';
        await db.query(query, [newDomainUrl, newDomainTemplate, adminGuild]);
        bot.sendMessage(chatId, `Domain ${newDomainUrl} added successfully to guild ${adminGuild}.`);
    } catch (error) {
        console.error('Error adding domain:', error);
        bot.sendMessage(chatId, "An unexpected error occurred while adding the domain. Please check the logs.");
    }
});

bot.onText(/\/pauseguild (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!await isAuthorized(userId)) {
        bot.sendMessage(chatId, "You are not authorized to use this command.");
        return;
    }

    const guildToPause = match[1];

    try {
        const guildExists = await db.query('SELECT * FROM admins WHERE guild = $1', [guildToPause]);
        if (guildExists.rows.length === 0) {
            bot.sendMessage(chatId, `Guild ${guildToPause} does not exist.`);
            return;
        }

        const isPaused = await db.query('SELECT * FROM paused_guilds WHERE guild = $1', [guildToPause]);
        if (isPaused.rows.length > 0) {
            bot.sendMessage(chatId, `Guild ${guildToPause} is already paused.`);
            return;
        }

        const query = 'INSERT INTO paused_guilds (guild) VALUES ($1)';
        await db.query(query, [guildToPause]);
        bot.sendMessage(chatId, `Guild ${guildToPause} has been paused.`);
    } catch (error) {
        console.error('Error pausing guild:', error);
        bot.sendMessage(chatId, "An unexpected error occurred while pausing the guild. Please check the logs.");
    }
});

bot.onText(/\/unpauseguild (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!await isAuthorized(userId)) {
        bot.sendMessage(chatId, "You are not authorized to use this command.");
        return;
    }

    const guildToUnpause = match[1];

    try {
        const isPaused = await db.query('SELECT * FROM paused_guilds WHERE guild = $1', [guildToUnpause]);
        if (isPaused.rows.length === 0) {
            bot.sendMessage(chatId, `Guild ${guildToUnpause} is not paused.`);
            return;
        }

        const query = 'DELETE FROM paused_guilds WHERE guild = $1';
        await db.query(query, [guildToUnpause]);
        bot.sendMessage(chatId, `Guild ${guildToUnpause} has been unpaused.`);
    } catch (error) {
        console.error('Error unpausing guild:', error);
        bot.sendMessage(chatId, "An unexpected error occurred while unpausing the guild. Please check the logs.");
    }
});

bot.onText(/\/deleteguild (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!await isAuthorized(userId)) {
        bot.sendMessage(chatId, "You are not authorized to use this command.");
        return;
    }

    const guildToDelete = match[1];

    const guildExists = await db.query('SELECT * FROM admins WHERE guild = $1', [guildToDelete]);
    if (guildExists.rows.length === 0) {
        bot.sendMessage(chatId, `Guild ${guildToDelete} does not exist.`);
        return;
    }

    bot.sendMessage(chatId, `Are you sure you want to delete the guild ${guildToDelete}? This action cannot be undone. Type 'YES' to confirm.`);

    bot.once('message', async (confirmMsg) => {
        if (confirmMsg.text === 'YES') {
            const client = await db.connect();
            try {
                await client.query('BEGIN');
                await client.query('DELETE FROM guilddomains WHERE guild = $1', [guildToDelete]);
                await client.query('DELETE FROM cashouts WHERE guild = $1', [guildToDelete]);
                await client.query('DELETE FROM users WHERE guild = $1', [guildToDelete]);
                await client.query('DELETE FROM admins WHERE guild = $1', [guildToDelete]);
                await client.query('DELETE FROM guildsettings WHERE guild = $1', [guildToDelete]);
                await client.query('DELETE FROM paused_guilds WHERE guild = $1', [guildToDelete]);
                await client.query('COMMIT');
                bot.sendMessage(chatId, `Guild ${guildToDelete} and all associated data have been deleted.`);
            } catch (error) {
                await client.query('ROLLBACK');
                console.error('Error deleting guild:', error);
                bot.sendMessage(chatId, "An unexpected error occurred while deleting the guild. Please check the logs.");
            } finally {
                client.release();
            }
        } else {
            bot.sendMessage(chatId, "Guild deletion cancelled.");
        }
    });
});

console.log('Telegram bot is running...');
