const { cmd } = require('../command');

cmd({
    pattern: "demote",
    alias: ["d", "removeadmin"],
    desc: "Remove admin status from another admin",
    category: "admin",
    react: "⬇️",
    filename: __filename
},
async (Void, citel, text) => {
    try {
        if (!citel.isGroup) return citel.reply("❌ Command only works in groups!");
        
        // Get fresh group info
        const groupInfo = await Void.groupMetadata(citel.chat);
        const participants = groupInfo.participants;
        
        // Check if sender is admin
        const senderAdmin = participants.find(p => p.id === citel.sender)?.admin;
        if (!senderAdmin) return citel.reply("❌ Only admins can use this command!");
        
        // Check if bot is admin
        const botAdmin = participants.find(p => p.id === Void.user.jid)?.admin;
        if (!botAdmin) return citel.reply("❌ I need admin rights to demote!");

        // Get target user
        let target;
        if (citel.quoted) {
            target = citel.quoted.sender;
        } else if (citel.mentionedJid?.[0]) {
            target = citel.mentionedJid[0];
        } else {
            return citel.reply("❌ Reply to or mention an admin!\nExample: .demote @user");
        }

        // Check if target exists in group
        const targetParticipant = participants.find(p => p.id === target);
        if (!targetParticipant) return citel.reply("❌ User not found in group!");

        // Check if target is actually admin
        if (!targetParticipant.admin) return citel.reply("❌ User is not an admin!");

        // Prevent demoting group owner
        if (target === groupInfo.owner) return citel.reply("❌ Cannot demote group owner!");

        // Perform demotion
        await Void.groupParticipantsUpdate(citel.chat, [target], "demote");
        
        // Success message
        return citel.reply(`⬇️ @${target.split('@')[0]} is no longer admin!`, { 
            mentions: [target] 
        });

    } catch (error) {
        console.error("Demote error:", error);
        return citel.reply("❌ Failed to demote. I may not have enough permissions.");
    }
});
