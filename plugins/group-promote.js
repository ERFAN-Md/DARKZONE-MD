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
        
        // Check if sender is admin
        const groupAdmins = await Void.groupMetadata(citel.chat).then(m => m.participants.filter(p => p.admin).map(p => p.id));
        if (!groupAdmins.includes(citel.sender)) return citel.reply("❌ Only admins can promote members!");

        // Get target user
        let target;
        if (citel.quoted) {
            target = citel.quoted.sender;
        } else if (citel.mentionedJid && citel.mentionedJid[0]) {
            target = citel.mentionedJid[0];
        } else {
            return citel.reply("❌ Please reply to a message or mention a user!");
        }

        // Promote the user
        await Void.groupParticipantsUpdate(citel.chat, [target], "promote");
        
        // Success message with mention
        return citel.reply(`✅ @${target.split('@')[0]} has been promoted to admin!`, { 
            mentions: [target] 
        });

    } catch (error) {
        console.error("Promote Error:", error);
        return citel.reply("❌ Failed to promote user. Please try again.");
    }
});
