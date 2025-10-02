export const mainMenu = {
    reply_markup: {
        keyboard: [
            ['Create Admin', 'Create User'],
            ['Add Domain', 'Manage Guild'],
            ['View Data', 'Manage Permissions']
        ],
        resize_keyboard: true,
        one_time_keyboard: true
    }
};

export const viewDataMenu = {
    reply_markup: {
        keyboard: [
            ['View Guild Members', 'List Domains'],
            ['Back to Main Menu']
        ],
        resize_keyboard: true,
        one_time_keyboard: true
    }
};

export const guildMenu = {
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

export const permissionMenu = {
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

export const cancelMenu = {
    reply_markup: {
        keyboard: [
            ['Cancel']
        ],
        resize_keyboard: true,
        one_time_keyboard: true
    }
};
