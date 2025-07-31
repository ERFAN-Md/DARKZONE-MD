const config = require('../config')
const { cmd, commands } = require('../command')

cmd({
    pattern: "mute",
    alias: ["groupmute"],
    react: "🔇",
    desc: "Mute the group (Only admins can send messages)",
    category: "group",
    filename: __filename
},           
async (conn, mek, m, { from, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");

        // Get fresh group metadata
        const groupInfo = await conn.groupMetadata(from);
        const participant = groupInfo.participants.find(p => p.id === m.sender);
        
        // Check if user is admin
        if (!participant?.admin) return reply("❌ Only group admins can use this command.");

        // Check if bot is admin
        const botParticipant = groupInfo.participants.find(p => p.id === conn.user.jid);
        if (!botParticipant?.admin) {
            return reply("❌ The bot must be admin to mute the group.");
        }

        // Perform the mute action
        await conn.groupSettingUpdate(from, "announcement");
        return reply("✅ Group has been muted. Only admins can send messages now.");

    } catch (e) {
        console.error("Mute command error:", e);
        return reply("❌ Failed to mute the group. Please try again.");
    }
});
