import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import db from './database.js';
import { mainMenu, guildMenu, permissionMenu, cancelMenu } from './menus.js';

export const commandStates = {};

export const isSuperAdmin = (userId) => {
    return userId.toString() === process.env.TELEGRAM_BOT_ADMIN_ID;
};

export const isAuthorized = async (userId) => {
    if (isSuperAdmin(userId)) {
        return true;
    }
    const result = await db.query('SELECT * FROM bot_permissions WHERE user_id = $1', [userId.toString()]);
    return result.rows.length > 0;
};

export async function handleCreateAdmin(bot, chatId, text, state) {
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

export async function selectGuildForAction(bot, chatId, actionPrefix) {
    try {
        const result = await db.query('SELECT DISTINCT guild FROM admins ORDER BY guild');
        if (result.rows.length === 0) {
            bot.sendMessage(chatId, "No guilds found.", mainMenu);
            return;
        }

        const inlineKeyboard = result.rows.map(row => ([{
            text: row.guild,
            callback_data: `${actionPrefix}:${row.guild}`
        }]));

        bot.sendMessage(chatId, "Please select a guild:", {
            reply_markup: {
                inline_keyboard: inlineKeyboard
            }
        });
    } catch (error) {
        console.error('Error fetching guilds for action:', error);
        bot.sendMessage(chatId, "An error occurred while fetching the list of guilds.", mainMenu);
    }
}

export async function handleViewGuildMembers(bot, chatId, guildName) {
    try {
        const adminsResult = await db.query('SELECT username FROM admins WHERE guild = $1 ORDER BY username', [guildName]);
        const usersResult = await db.query('SELECT username, rank FROM users WHERE guild = $1 ORDER BY username', [guildName]);

        let message = `*Members of Guild: ${guildName}*\n\n`;

        if (adminsResult.rows.length === 0) {
            message += '*Admins:*\n_No admins found._\n\n';
        } else {
            const adminList = adminsResult.rows.map(row => `- \`${row.username}\``).join('\n');
            message += `*Admins:*\n${adminList}\n\n`;
        }

        if (usersResult.rows.length === 0) {
            message += '*Users (Members):*\n_No users found._';
        } else {
            const userList = usersResult.rows.map(row => `- \`${row.username}\` (Rank: ${row.rank})`).join('\n');
            message += `*Users (Members):*\n${userList}`;
        }

        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

    } catch (error) {
        console.error('Error viewing guild members:', error);
        bot.sendMessage(chatId, "An error occurred while fetching guild members.", mainMenu);
    }
}

export async function handleListDomains(bot, chatId, guildName) {
    try {
        const result = await db.query('SELECT url, template FROM guilddomains WHERE guild = $1 ORDER BY url', [guildName]);
        if (result.rows.length === 0) {
            bot.sendMessage(chatId, `No domains found for guild *${guildName}*.`, { parse_mode: 'Markdown' });
            return;
        }
        const domainList = result.rows.map(row => `- \`${row.url}\` (Template: ${row.template})`).join('\n');
        bot.sendMessage(chatId, `*Domains for ${guildName}:*\n${domainList}`, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Error listing domains:', error);
        bot.sendMessage(chatId, "An error occurred while listing domains.", mainMenu);
    }
}

export async function showGuildManagementOptions(bot, chatId) {
    try {
        const result = await db.query('SELECT DISTINCT guild FROM admins ORDER BY guild');
        if (result.rows.length === 0) {
            bot.sendMessage(chatId, "No guilds found to manage.", mainMenu);
            return;
        }

        const inlineKeyboard = result.rows.map(row => ([{
            text: row.guild,
            callback_data: `manage_guild:${row.guild}`
        }]));

        bot.sendMessage(chatId, "Please select a guild to manage:", {
            reply_markup: {
                inline_keyboard: inlineKeyboard
            }
        });
    } catch (error) {
        console.error('Error fetching guilds:', error);
        bot.sendMessage(chatId, "An error occurred while fetching the list of guilds.", mainMenu);
    }
}

export async function showGuildActions(bot, chatId, guildName) {
    const isPaused = await db.query('SELECT * FROM paused_guilds WHERE guild = $1', [guildName]);
    const status = isPaused.rows.length > 0 ? ' (Paused)' : '';

    const inlineKeyboard = [
        [
            { text: "Pause Guild", callback_data: `pause_guild:${guildName}` },
            { text: "Unpause Guild", callback_data: `unpause_guild:${guildName}` }
        ],
        [
            { text: "Delete Guild", callback_data: `delete_guild:${guildName}` }
        ],
        [
            { text: "« Back to Guild List", callback_data: `back_to_guilds` }
        ]
    ];

    bot.sendMessage(chatId, `Managing Guild: *${guildName}*${status}`, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: inlineKeyboard
        }
    });
}

export async function handleCreateUser(bot, chatId, text, state) {
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

export async function handleAddDomain(bot, chatId, text, state) {
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

export async function handlePauseGuild(bot, chatId, guildName) {
    try {
        const isPaused = await db.query('SELECT * FROM paused_guilds WHERE guild = $1', [guildName]);
        if (isPaused.rows.length > 0) {
            bot.answerCallbackQuery(chatId, { text: `Guild ${guildName} is already paused.` });
        } else {
            const query = 'INSERT INTO paused_guilds (guild) VALUES ($1)';
            await db.query(query, [guildName]);
            bot.answerCallbackQuery(chatId, { text: `Guild ${guildName} has been paused.` });
        }
    } catch (error) {
        console.error('Error pausing guild:', error);
        bot.answerCallbackQuery(chatId, { text: 'An error occurred while pausing the guild.' });
    }
}

export async function handleUnpauseGuild(bot, chatId, guildName) {
    try {
        const isPaused = await db.query('SELECT * FROM paused_guilds WHERE guild = $1', [guildName]);
        if (isPaused.rows.length === 0) {
            bot.answerCallbackQuery(chatId, { text: `Guild ${guildName} is not paused.` });
        } else {
            const query = 'DELETE FROM paused_guilds WHERE guild = $1';
            await db.query(query, [guildName]);
            bot.answerCallbackQuery(chatId, { text: `Guild ${guildName} has been unpaused.` });
        }
    } catch (error) {
        console.error('Error unpausing guild:', error);
        bot.answerCallbackQuery(chatId, { text: 'An error occurred while unpausing the guild.' });
    }
}

export async function handleDeleteGuild(bot, chatId, guildName) {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM guilddomains WHERE guild = $1', [guildName]);
        await client.query('DELETE FROM cashouts WHERE guild = $1', [guildName]);
        await client.query('DELETE FROM users WHERE guild = $1', [guildName]);
        await client.query('DELETE FROM admins WHERE guild = $1', [guildName]);
        await client.query('DELETE FROM guildsettings WHERE guild = $1', [guildName]);
        await client.query('DELETE FROM paused_guilds WHERE guild = $1', [guildName]);
        await client.query('COMMIT');
        bot.answerCallbackQuery(chatId, { text: `Guild ${guildName} has been deleted.` });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting guild:', error);
        bot.answerCallbackQuery(chatId, { text: 'An error occurred while deleting the guild.' });
    } finally {
        client.release();
    }
}

export async function handleAddUserPermission(bot, chatId, text) {
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

export async function handleRemoveUserPermission(bot, chatId, text) {
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
