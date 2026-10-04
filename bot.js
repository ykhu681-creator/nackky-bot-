const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent 
    ] 
});

const PREFIX = '!upload';

// ฟังก์ชันย่อโค้ด Lua
function minifyLua(code) {
    let minified = code;
    minified = minified.replace(/--\[\[[\s\S]*?\]\]/g, ''); // ลบคอมเมนต์หลายบรรทัด
    minified = minified.replace(/--[^\r\n]*/g, '');        // ลบคอมเมนต์บรรทัดเดียว
    minified = minified.replace(/[\n\r\t]/g, ' ');         // เปลี่ยนขึ้นบรรทัดใหม่เป็นช่องว่าง
    minified = minified.replace(/\s+/g, ' ');              // ยุบช่องว่าง
    minified = minified.trim();
    return minified;
}

client.once('ready', () => {
    console.log(`🤖 Bot ${client.user.tag} ออนไลน์และพร้อมใช้งานแล้ว!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith(PREFIX)) {
        let rawCode = message.content.slice(PREFIX.length).trim();

        if (!rawCode) {
            return message.reply('❌ กรุณาส่งโค้ดที่ต้องการย่อต่อท้ายคำสั่งด้วย เช่น:\n`!upload print("Hello Nackky")`');
        }

        let minifiedCode = minifyLua(rawCode);

        try {
            // ส่งโค้ดไปฝากไว้ที่ Hastebin เพื่อเอาลิงก์ Raw
            const response = await axios.post('https://www.toptal.com/developers/hastebin/documents', minifiedCode);
            const key = response.data.key;
            const rawUrl = `https://www.toptal.com/developers/hastebin/raw/${key}`;
            
            // สร้างรูปแบบ loadstring พร้อมใช้งาน
            const loadstringResult = `loadstring(game:HttpGet("${rawUrl}"))()`;

            message.reply(`🔥 **ย่อและอัปโหลดสำเร็จ!**\nก๊อปปี้บรรทัดนี้ไปรันได้เลย:\n\`\`\`lua\n${loadstringResult}\n\`\`\``);

        } catch (error) {
            console.error(error);
            message.reply('❌ เกิดข้อผิดพลาดในการอัปโหลดโค้ด');
        }
    }
});

client.login('MTU1NjE2MzMyODU0NjcwMTM2Mw.GLEd1r.g9X-TQJVb-D00AO55-MgMLxjv9nCsRinUG76r0');
