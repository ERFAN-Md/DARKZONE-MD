const { cmd } = require('../command');

cmd({
    pattern: "promote",
    alias: ["p", "makeadmin"],
    desc: "Promotes a member to group admin",
    category: "admin",
    react: "⬆️",
    filename: __filename
},
async (Void, citel, text) => {
    try {
        if (!citel.isGroup) return citel.reply("❌ This command only works in groups!");
        
        // Get fresh group metadata
        const groupInfo = await Void.groupMetadata(citel.chat);
        const isBotAdmin = groupInfo.participants.find(p => p.id === Void.user.jid)?.admin;
        
        // Check if bot is admin
        if (!Admin) return citel.reply("❌ I need admin rights to promote members!");

        // Check if sender is admin
        const isUserAdmin = groupInfo.participants.find(p => p.id === citel.sender)?.admin;
        if (!isUserAdmin) return citel.reply("❌ Only admins can promote members!");

        // Get target user
        let target;
        if (citel.quoted) {
            target = citel.quoted.sender;
        } else if (text && text.match(/@\d+/)) {
            target = text.match(/@\d+/)[0].replace('@', '') + '@s.whatsapp.net';
        } else if (citel.mentionedJid && citel.mentionedJid[0]) {
            target = citel.mentionedJid[0];
        } else {
            return citel.reply("❌ Please reply to a message or mention a user!\nExample: .promote @user");
        }

        // Check if target is already admin
        const targetIsAdmin = groupInfo.participants.find(p => p.id === target)?.admin;
        if (targetIsAdmin) return citel.reply("❌ This user is already an admin!");

        // Check if target is in group
        const isInGroup = groupInfo.participants.some(p => p.id === target);
        if (!isInGroup) return citel.reply("❌ This user isn't in the group!");

        // Don't allow promoting yourself
        if (target === citel.sender) return citel.reply("❌ You can't promote yourself!");

        // Don't allow promoting the bot
        if (target === Void.user.jid) return citel.reply("❌ I can't promote myself!");

        // Promote the user
        await Void.groupParticipantsUpdate(citel.chat, [target], "promote");
        
        // Success message with mention
        return citel.reply(`⬆️ @${target.split('@')[0]} has been promoted to admin!`, { 
            mentions: [target] 
        });

    } catch (error) {
        console.error("Promote Error:", error);
        if (error.message.includes("not authorized")) {
            return citel.reply("❌ I don't have permission to promote this user!");
        } else {
            return citel.reply("❌ Failed to promote user. Please try again.");
        }
    }
});
