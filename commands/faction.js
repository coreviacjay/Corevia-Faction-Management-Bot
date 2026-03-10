const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");
const fs = require("fs");
const path = require("path");

const factionsPath = path.join(__dirname, "../data/factions.json");

function loadFactions() {
    return JSON.parse(fs.readFileSync(factionsPath, "utf8"));
}

function saveFactions(data) {
    fs.writeFileSync(factionsPath, JSON.stringify(data, null, 4));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("faction")
        .setDescription("Manage FiveM factions through Discord.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

        // BASIC MANAGEMENT
        .addSubcommand(sub =>
            sub.setName("create")
                .setDescription("Create a faction.")
                .addStringOption(o => o.setName("name").setDescription("Faction name").setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName("delete")
                .setDescription("Delete a faction.")
                .addStringOption(o => o.setName("name").setDescription("Faction name").setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName("addmember")
                .setDescription("Add a member to a faction.")
                .addStringOption(o => o.setName("faction").setDescription("Faction name").setRequired(true))
                .addUserOption(o => o.setName("user").setDescription("User").setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName("removemember")
                .setDescription("Remove a member from a faction.")
                .addStringOption(o => o.setName("faction").setDescription("Faction name").setRequired(true))
                .addUserOption(o => o.setName("user").setDescription("User").setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName("promote")
                .setDescription("Promote a faction member.")
                .addStringOption(o => o.setName("faction").setDescription("Faction name").setRequired(true))
                .addUserOption(o => o.setName("user").setDescription("User").setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName("demote")
                .setDescription("Demote a faction member.")
                .addStringOption(o => o.setName("faction").setDescription("Faction name").setRequired(true))
                .addUserOption(o => o.setName("user").setDescription("User").setRequired(true))
        )

        // FINANCE
        .addSubcommand(sub =>
            sub.setName("depositmoney")
                .setDescription("Deposit money into a faction bank.")
                .addStringOption(o => o.setName("faction").setDescription("Faction name").setRequired(true))
                .addIntegerOption(o => o.setName("amount").setDescription("Amount").setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName("withdrawmoney")
                .setDescription("Withdraw money from a faction bank.")
                .addStringOption(o => o.setName("faction").setDescription("Faction name").setRequired(true))
                .addIntegerOption(o => o.setName("amount").setDescription("Amount").setRequired(true))
        )

        // WEAPONS
        .addSubcommand(sub =>
            sub.setName("addweapon")
                .setDescription("Add a weapon to a faction inventory.")
                .addStringOption(o => o.setName("faction").setDescription("Faction name").setRequired(true))
                .addStringOption(o => o.setName("weapon").setDescription("Weapon name").setRequired(true))
                .addIntegerOption(o => o.setName("amount").setDescription("Amount").setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName("removeweapon")
                .setDescription("Remove a weapon from a faction inventory.")
                .addStringOption(o => o.setName("faction").setDescription("Faction name").setRequired(true))
                .addStringOption(o => o.setName("weapon").setDescription("Weapon name").setRequired(true))
                .addIntegerOption(o => o.setName("amount").setDescription("Amount").setRequired(true))
        )

        // DRUGS
        .addSubcommand(sub =>
            sub.setName("adddrug")
                .setDescription("Add drugs to a faction inventory.")
                .addStringOption(o => o.setName("faction").setDescription("Faction name").setRequired(true))
                .addStringOption(o => o.setName("drug").setDescription("Drug name").setRequired(true))
                .addIntegerOption(o => o.setName("amount").setDescription("Amount").setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName("removedrug")
                .setDescription("Remove drugs from a faction inventory.")
                .addStringOption(o => o.setName("faction").setDescription("Faction name").setRequired(true))
                .addStringOption(o => o.setName("drug").setDescription("Drug name").setRequired(true))
                .addIntegerOption(o => o.setName("amount").setDescription("Amount").setRequired(true))
        )

        // CUSTOM ITEMS
        .addSubcommand(sub =>
            sub.setName("additem")
                .setDescription("Add a custom item to a faction inventory.")
                .addStringOption(o => o.setName("faction").setDescription("Faction name").setRequired(true))
                .addStringOption(o => o.setName("item").setDescription("Item name").setRequired(true))
                .addIntegerOption(o => o.setName("amount").setDescription("Amount").setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName("removeitem")
                .setDescription("Remove a custom item from a faction inventory.")
                .addStringOption(o => o.setName("faction").setDescription("Faction name").setRequired(true))
                .addStringOption(o => o.setName("item").setDescription("Item name").setRequired(true))
                .addIntegerOption(o => o.setName("amount").setDescription("Amount").setRequired(true))
        )

        // VIEW INVENTORY
        .addSubcommand(sub =>
            sub.setName("inventory")
                .setDescription("View a faction's inventory.")
                .addStringOption(o => o.setName("faction").setDescription("Faction name").setRequired(true))
        )

        // ABOUT (SUMMARY)
        .addSubcommand(sub =>
            sub.setName("about")
                .setDescription("View a summary of a faction.")
                .addStringOption(o => o.setName("faction").setDescription("Faction name").setRequired(true))
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const factions = loadFactions();

        const factionName = interaction.options.getString("faction")?.toLowerCase();
        const amount = interaction.options.getInteger("amount");
        const weapon = interaction.options.getString("weapon");
        const drug = interaction.options.getString("drug");
        const item = interaction.options.getString("item");

        const reply = (msg) => interaction.reply({ content: msg, flags: 64 });

        // BASIC CREATE / DELETE use "name" instead of "faction"
        if (sub === "create") {
            const name = interaction.options.getString("name").toLowerCase();
            if (factions[name]) return reply("❌ Faction already exists.");

            factions[name] = {
                members: {},
                bank: 0,
                weapons: {},
                drugs: {},
                items: {}
            };

            saveFactions(factions);
            return reply(`✅ Faction **${name}** created.`);
        }

        if (sub === "delete") {
            const name = interaction.options.getString("name").toLowerCase();
            if (!factions[name]) return reply("❌ Faction does not exist.");

            delete factions[name];
            saveFactions(factions);
            return reply(`🗑️ Faction **${name}** deleted.`);
        }

        // Everything below this point uses factionName
        if (["addmember","removemember","promote","demote","depositmoney","withdrawmoney","addweapon","removeweapon","adddrug","removedrug","additem","removeitem","inventory","about"].includes(sub)) {
            if (!factionName || !factions[factionName]) {
                return reply("❌ Faction does not exist.");
            }

            // Ensure finance fields exist
            factions[factionName].bank ??= 0;
            factions[factionName].weapons ??= {};
            factions[factionName].drugs ??= {};
            factions[factionName].items ??= {};
            factions[factionName].members ??= {};
        }

        // MEMBER MANAGEMENT
        if (sub === "addmember") {
            const user = interaction.options.getUser("user");
            factions[factionName].members[user.id] = { rank: 1 };
            saveFactions(factions);
            return reply(`➕ Added <@${user.id}> to **${factionName}** as rank 1.`);
        }

        if (sub === "removemember") {
            const user = interaction.options.getUser("user");
            if (!factions[factionName].members[user.id]) return reply("❌ Member not found.");
            delete factions[factionName].members[user.id];
            saveFactions(factions);
            return reply(`➖ Removed <@${user.id}> from **${factionName}**.`);
        }

        if (sub === "promote") {
            const user = interaction.options.getUser("user");
            if (!factions[factionName].members[user.id]) return reply("❌ Member not found.");
            factions[factionName].members[user.id].rank++;
            saveFactions(factions);
            return reply(`⬆️ Promoted <@${user.id}> in **${factionName}**.`);
        }

        if (sub === "demote") {
            const user = interaction.options.getUser("user");
            if (!factions[factionName].members[user.id]) return reply("❌ Member not found.");
            if (factions[factionName].members[user.id].rank <= 1) return reply("❌ Already lowest rank.");
            factions[factionName].members[user.id].rank--;
            saveFactions(factions);
            return reply(`⬇️ Demoted <@${user.id}> in **${factionName}**.`);
        }

        // MONEY
        if (sub === "depositmoney") {
            factions[factionName].bank += amount;
            saveFactions(factions);
            return reply(`💰 Deposited **$${amount}** into **${factionName}**.`);
        }

        if (sub === "withdrawmoney") {
            if (factions[factionName].bank < amount) return reply("❌ Not enough money.");
            factions[factionName].bank -= amount;
            saveFactions(factions);
            return reply(`💸 Withdrew **$${amount}** from **${factionName}**.`);
        }

        // WEAPONS
        if (sub === "addweapon") {
            factions[factionName].weapons[weapon] ??= 0;
            factions[factionName].weapons[weapon] += amount;
            saveFactions(factions);
            return reply(`🔫 Added **${amount}x ${weapon}** to **${factionName}**.`);
        }

        if (sub === "removeweapon") {
            if (!factions[factionName].weapons[weapon] || factions[factionName].weapons[weapon] < amount)
                return reply("❌ Not enough weapons.");
            factions[factionName].weapons[weapon] -= amount;
            saveFactions(factions);
            return reply(`🔫 Removed **${amount}x ${weapon}** from **${factionName}**.`);
        }

        // DRUGS
        if (sub === "adddrug") {
            factions[factionName].drugs[drug] ??= 0;
            factions[factionName].drugs[drug] += amount;
            saveFactions(factions);
            return reply(`🌿 Added **${amount}x ${drug}** to **${factionName}**.`);
        }

        if (sub === "removedrug") {
            if (!factions[factionName].drugs[drug] || factions[factionName].drugs[drug] < amount)
                return reply("❌ Not enough drugs.");
            factions[factionName].drugs[drug] -= amount;
            saveFactions(factions);
            return reply(`🌿 Removed **${amount}x ${drug}** from **${factionName}**.`);
        }

        // ITEMS
        if (sub === "additem") {
            factions[factionName].items[item] ??= 0;
            factions[factionName].items[item] += amount;
            saveFactions(factions);
            return reply(`📦 Added **${amount}x ${item}** to **${factionName}**.`);
        }

        if (sub === "removeitem") {
            if (!factions[factionName].items[item] || factions[factionName].items[item] < amount)
                return reply("❌ Not enough items.");
            factions[factionName].items[item] -= amount;
            saveFactions(factions);
            return reply(`📦 Removed **${amount}x ${item}** from **${factionName}**.`);
        }

        // INVENTORY (detailed)
        if (sub === "inventory") {
            const f = factions[factionName];

            const embed = new EmbedBuilder()
                .setColor("#00AEEF")
                .setTitle(`📦 Inventory — ${factionName}`)
                .addFields(
                    { name: "💰 Bank", value: `$${f.bank}`, inline: false },
                    {
                        name: "🔫 Weapons",
                        value: Object.keys(f.weapons).length
                            ? Object.entries(f.weapons).map(([k, v]) => `${k}: ${v}`).join("\n")
                            : "None"
                    },
                    {
                        name: "🌿 Drugs",
                        value: Object.keys(f.drugs).length
                            ? Object.entries(f.drugs).map(([k, v]) => `${k}: ${v}`).join("\n")
                            : "None"
                    },
                    {
                        name: "📦 Items",
                        value: Object.keys(f.items).length
                            ? Object.entries(f.items).map(([k, v]) => `${k}: ${v}`).join("\n")
                            : "None"
                    }
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed], flags: 64 });
        }

        // ABOUT (summary)
        if (sub === "about") {
            const f = factions[factionName];

            const memberCount = Object.keys(f.members).length;
            const weaponCount = Object.values(f.weapons).reduce((a, b) => a + b, 0);
            const drugCount = Object.values(f.drugs).reduce((a, b) => a + b, 0);
            const itemCount = Object.values(f.items).reduce((a, b) => a + b, 0);

            const embed = new EmbedBuilder()
                .setColor("#00AEEF")
                .setTitle(`🏛️ About — ${factionName}`)
                .addFields(
                    { name: "💰 Bank", value: `$${f.bank}`, inline: true },
                    { name: "👥 Members", value: `${memberCount}`, inline: true },
                    { name: "🔫 Weapons (total)", value: `${weaponCount}`, inline: true },
                    { name: "🌿 Drugs (total)", value: `${drugCount}`, inline: true },
                    { name: "📦 Items (total)", value: `${itemCount}`, inline: true }
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed], flags: 64 });
        }
    }
};
