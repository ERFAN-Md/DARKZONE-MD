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
    from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isCreator, isDev, isAdmins, reply
}) => {
    try {
        // Check if the command is used in a group
        if (!isGroup) return reply("❌ This command can only be used in groups.");

        // Check if the bot is an admin
        if (!isBotAdmins) return reply("❌ Bot needs to be admin to perform this action.");

        // Check if the user is an admin (allow group admins to use)
        if (!isAdmins) return reply("❌ Only group admins can use this command.");

        let number;
        if (m.quoted) {
            number = m.quoted.sender.split("@")[0];
        } else if (args[0] && args[0].includes("@")) {
            number = args[0].replace(/[@\s]/g, '');
        } else if (args[0]) {
            number = args[0];
        } else {
            return reply("❌ Please reply to an admin's message or mention an admin to demote.\nExample: .demote @user");
        }

        // Validate the number
        if (!number.match(/^\d+$/)) {
            return reply("❌ Invalid number format. Please provide a valid phone number.");
        }

        const jid = number + "@s.whatsapp.net";

        // Check if target is in the group
        const participantExists = participants.some(p => p.id === jid);
        if (!participantExists) {
            return reply("❌ This user is not in the group.");
        }

        // Prevent demoting the bot itself
        if (jid === conn.user.jid) return reply("❌ I can't demote myself!");

        // Get fresh group metadata
        const groupInfo = await conn.groupMetadata(from);
        
        // Prevent demoting the group creator
        if (jid === groupInfo.owner) return reply("❌ Cannot demote the group creator.");

        // Check if target is actually an admin
        const targetIsAdmin = groupInfo.participants.find(p => p.id === jid)?.admin;
        if (!targetIsAdmin) return reply("❌ This user is not an admin.");

        // Perform the demote action
        await conn.groupParticipantsUpdate(from, [jid], "demote");
        reply(`⬇️ Successfully demoted @${number} to member.`, { mentions: [jid] });

    } catch (error) {
        console.error("Demote command error:", error);
        reply("❌ Failed to demote. Please try again later.");
    }
});
