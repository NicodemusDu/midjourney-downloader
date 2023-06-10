import { SlashCommandBuilder, ChannelType, TextChannel, EmbedBuilder, ButtonComponent , MessageActionRowComponent} from "discord.js"
import { getThemeColor } from "../functions";
import { SlashCommand } from "../types";
import fs from "fs";
import request from 'request';

const downloadImage = async (url: string, name: string) => {
    const cleanFileName = name.replace(/[<>:"\/\\|?*]+/g, '').slice(0, 200);

    // request(url, (error, response, body) => {
    //     if (!error && response.statusCode == 200) {
    //         fs.writeFile(name, body, 'binary', (err) => {
    //             if (err) throw err;
    //             console.log('File saved successfully!');
    //         });
    //     }
    // });
    request(url).pipe(fs.createWriteStream(`download/${cleanFileName}.png`));
};
const command : SlashCommand = {
    command: new SlashCommandBuilder()
    .setName("download")
    .setDescription("download all image")
    ,
    execute: interaction => {
        interaction.channel?.messages.fetch({limit: 2})
        .then(async messages => {
            if(interaction.channel?.type === ChannelType.DM) return;
            messages.forEach(message=>{
                if (message.attachments.size > 0) {
                    const attachment = message.attachments.first();
                    console.log(JSON.stringify(message));

                    let isUpperImage = false;
                    const componentsResult = message.components;
                    const componentResult = MessageActionRowComponent[];
                    componentsResult.forEach((component=>{
                        if(component?.components?.length){
                            componentResult.push(component.components);
                        } else {
                        }
                    }))
                    componentResult.forEach(()=>{
                        if(component instanceof ButtonComponent) {
                            isUpperImage = true;
                        }

                    })
                    if(isUpperImage){
                        // Get the first attachment
                        // Check if the attachment is an image
                        if (attachment && attachment.contentType?.includes('image')) {
                            // Download the attachment
                            const content = message.cleanContent;

                            console.log('image url:\t', attachment.url);
                            let imageName = content.replace(/^\*\*/,'').replace(/^water drop,?/, '').replace(/--.*$/, '');
                            downloadImage(attachment.url, imageName);
                        }
                    }
                }
            })
            interaction.reply(`${messages.size}`);    
        })
    },
    cooldown: 10
}

export default command
