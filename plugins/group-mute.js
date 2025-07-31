const config = require('../config')
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')

cmd({
    pattern: "mute",
    alias: ["groupmute"],
    react: "🔇",
    desc: "Mute the group (Only admins can send messages).",
    category: "group",
    filename: __filename
},           
async (conn, mek, m, { from, isGroup, senderNumber, isAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        
        // Get fresh group metadata to check current admin status
        const groupInfo = await conn.groupMetadata(from);
        const isUserAdmin = groupInfo.participants.find(p => p.id === m.sender)?.admin;
        const isBotAdmin = groupInfo.participants.find(p => p.id === conn.user.jid)?.admin;

        if (!isBotAdmin) return reply("❌ The bot needs to be an admin to mute the group.");
        if (!isUserAdmin) return reply("❌ Only group admins can use this command.");

        await conn.groupSettingUpdate(from, "announcement");
        reply("✅ Group has been muted. Only admins can send messages now.");
    } catch (e) {
        console.error("Error muting group:", e);
        reply("❌ Failed to mute the group. Please try again.");
    }
});
