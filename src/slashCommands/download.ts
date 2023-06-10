/*
 * @Author: NicodemusDu nicodemusdu@gmail.com
 * @Date: 2023-06-10 15:33:38
 * @LastEditors: NicodemusDu nicodemusdu@gmail.com
 * @LastEditTime: 2023-06-10 15:42:50
 * @FilePath: \midjourney-downloader\src\slashCommands\download.ts
 * @Description:
 *
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved.
 */
import {
    SlashCommandBuilder,
    ChannelType,
    TextChannel,
    EmbedBuilder,
    ButtonComponent,
    MessageActionRowComponent,
    ActionRow,
    Collection,
    CommandInteraction,
    CacheType
} from 'discord.js';
import { getThemeColor } from '../functions';
import { SlashCommand } from '../types';
import fs from 'fs';
import request from 'request';

const downloadImage = async (url: string, name: string) => {
    // const cleanFileName = name.replace(/[<>:"\/\\|?*]+/g, '').slice(0, 200);

    // request(url).pipe(fs.createWriteStream(`download/${cleanFileName.trim()}.png`));
    request(url).pipe(fs.createWriteStream(`download/${name}`));
};

const parseMessage = (messages:Collection<any, any>): [number, string | undefined] => {
    let firstMessageId:string | undefined = undefined;
    let imageSize:number = 0;
    messages.forEach((message) => {
        firstMessageId = message.id;
        if (message.attachments.size > 0) {
            const attachment = message.attachments.first();

            let isUpperImage = false;
            const componentsResult: ActionRow<MessageActionRowComponent>[] = message.components;
            const componentResult: MessageActionRowComponent[] = [];
            componentsResult.forEach((component) => {
                if (component?.components?.length) {
                    componentResult.push(...component.components);
                }
            });
            componentResult.forEach((component) => {
                if (component instanceof ButtonComponent && component.customId?.startsWith("MJ::BOOKMARK")) {
                    isUpperImage = true;
                }
            })
            if (isUpperImage) {
                // Get the first attachment
                // Check if the attachment is an image
                if (
                    attachment &&
                    attachment.contentType?.includes('image')
                ) {
                    // Download the attachment
                    const content = message.cleanContent;

                    console.log('image url:\t', attachment.url);
                    // let imageName = content
                    //     .replace(/^\*\*/, '')
                    //     .replace(/^(simple )?water drop,?/, '')
                    //     .replace(/--.*$/, '');
                    const url:string = attachment.url;
                    const last = url.lastIndexOf('/');
                    let imageName = url.slice(last+1, url.length);
                    console.log('imageName:\t', imageName);
                    downloadImage(url, imageName);
                }
            }
        }
    });
    return [imageSize,firstMessageId];
}

const readMessage = (interaction:CommandInteraction<CacheType>, 
                    isReadAll: boolean,
                    limit: number, id: string | undefined) => {
    interaction.channel?.messages
    .fetch({ 
        limit, 
        before: id
    })
    .then(async (messages) => {
        if (interaction.channel?.type === ChannelType.DM) return;
        const [size, messageId] = parseMessage(messages);
        if(messageId && isReadAll) {
            console.log('lastMessageId:\t', messageId)
            readMessage(interaction,isReadAll, limit, messageId);
        } else {
            console.log('exit');
        }
    });
}

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('download')
        .setDescription('download all image')
        .addIntegerOption(option => {
            return option
            .setMaxValue(100)
            .setMinValue(1)
            .setName("number")
            .setDescription("Number of images to download")
        })
        .addBooleanOption((option) => {
            return option
            .setName("readall")
            .setDescription("If true, read all images")
        }),
        execute: (interaction) => {
            let limit = Number(interaction.options.get("number")?.value || 1);
            const isReadAll = Boolean(interaction.options.get("readall")?.value ?? false); // limit < 0, read all message
            let lastMessageId = undefined;
            let imageSize = 0;
            if(isReadAll) {
                limit = 100;
            }
            readMessage(interaction, isReadAll, limit, undefined);
            interaction.reply(`${imageSize}`);
        },
        cooldown: 10,
};

export default command;
