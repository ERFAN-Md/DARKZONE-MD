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
    from, sender, isGroup, reply, isAdmins, isBotAdmins, groupMetadata
}) => {
    try {
        // Basic checks
        if (!isGroup) return reply("❌ This command only works in groups!");
        if (!isAdmins) return reply("❌ Only admins can use this command!");
        if (!isBotAdmins) return reply("❌ I need admin rights to demote members!");

        // Get fresh group info
        const groupInfo = await conn.groupMetadata(from);
        const botJid = conn.user.jid;
        
        // Find target user
        let targetUser;
        if (m.quoted) {
            targetUser = m.quoted.sender;
        } else if (m.mentionedJid && m.mentionedJid[0]) {
            targetUser = m.mentionedJid[0];
        } else {
            return reply("❌ Please reply to or mention an admin!\nExample: .demote @user");
        }

        // Validations
        if (targetUser === sender) return reply("❌ You can't demote yourself!");
        if (targetUser === botJid) return reply("❌ I can't demote myself!");
        if (targetUser === groupInfo.owner) return reply("❌ Cannot demote the group owner!");

        // Check if target is actually an admin
        const targetIsAdmin = groupInfo.participants.find(p => p.id === targetUser)?.admin;
        if (!targetIsAdmin) return reply("❌ This user isn't an admin!");

        // Perform demotion
        await conn.groupParticipantsUpdate(from, [targetUser], "demote");
        
        // Success message with mention
        const mention = targetUser.split('@')[0];
        return reply(`⬇️ @${mention} has been demoted to member!`, { 
            mentions: [targetUser] 
        });

    } catch (error) {
        console.error("Demote error:", error);
        if (error.message.includes("not authorized")) {
            reply("❌ I don't have permission to demote this user!");
        } else {
            reply("❌ Failed to demote. Please try again.");
        }
    }
});
