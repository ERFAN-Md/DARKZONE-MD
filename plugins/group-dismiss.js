const { cmd } = require('../command');

cmd({
    pattern: "demote",
    alias: ["d", "dismiss", "removeadmin"],
    desc: "Demotes a group admin to normal member",
    category: "admin",
    react: "⬇️",
    filename: __filename
},
async(conn, mek, m, {
    from, sender, isGroup, reply, participants
}) => {
    try {
        if (!isGroup) return reply("❌ This command only works in groups!");
        
        // Get fresh group metadata
        const groupInfo = await conn.groupMetadata(from);
        const botJid = conn.user.jid;
        const isBotAdmin = groupInfo.participants.find(p => p.id === botJid)?.admin;
        
        if (!isBotAdmin) {
            return reply("❌ I need admin rights to demote members!");
        }

        // Get mentioned user or quoted user
        let targetUser = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);
        
        if (!targetUser) {
            return reply("❌ Please mention or reply to the admin you want to demote!\nExample: .demote @user");
        }

        // Check if target is in group
        const isInGroup = groupInfo.participants.some(p => p.id === targetUser);
        if (!isInGroup) return reply("❌ This user isn't in the group!");

        // Check if target is actually an admin
        const targetIsAdmin = groupInfo.participants.find(p => p.id === targetUser)?.admin;
        if (!targetIsAdmin) return reply("❌ This user isn't an admin!");

        // Don't allow demoting yourself
        if (targetUser === sender) return reply("❌ You can't demote yourself!");

        // Don't allow demoting the bot
        if (targetUser === botJid) return reply("❌ I can't demote myself!");

        // Perform the demote action
        await conn.groupParticipantsUpdate(from, [targetUser], "demote");
        
        // Success message with mention
        const mention = targetUser.split('@')[0];
        await reply(`⬇️ Successfully demoted @${mention} to member!`, { 
            mentions: [targetUser] 
        });

    } catch (error) {
        console.error("Demote error:", error);
        if (error.message.includes("not authorized")) {
            reply("❌ I don't have permission to demote this user!");
        } else {
            reply("❌ An error occurred while trying to demote. Please try again.");
        }
    }
});
