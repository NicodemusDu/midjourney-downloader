import { Client, GatewayIntentBits, Collection, PermissionFlagsBits,} from "discord.js";
const { Guilds, MessageContent, GuildMessages, GuildMembers } = GatewayIntentBits
const client = new Client({intents:[Guilds, MessageContent, GuildMessages]})
import { Command, SlashCommand } from "./types";
import { config } from "dotenv";
import { readdirSync } from "fs";
import { join } from "path";
config()

client.slashCommands = new Collection<string, SlashCommand>()
client.commands = new Collection<string, Command>()
client.cooldowns = new Collection<string, number>()

const handlersDir = join(__dirname, "./handlers")
readdirSync(handlersDir).forEach(handler => {
    import(`${handlersDir}/${handler}`)
    .then(handlerModule => {
        handlerModule.default(client);
    })
    .catch(err => {
        console.log(err);
    }) 
})

client.login(process.env.TOKEN)