const { Telegraf } = require('telegraf');
const axios = require('axios');

const BOT_TOKEN = '1668307994:AAGzNQ1wG8A2_0q2khMUhkPk7NzBi3wEvFE';

(async () => {

	const bot = new Telegraf(BOT_TOKEN)
	bot.start((ctx) => ctx.reply('Paste domain list with separator "\\n"'))
	bot.help((ctx) => ctx.reply('Paste domain list with separator "\\n"'))
	bot.on('text', async (ctx) => {
		ctx.reply('Process...')

		const domains = ctx.update.message.text.split('\n');


        const request = axios.create({
            baseURL: 'http://138.68.69.213:9000',
            headers: {
                "accept": "application/json"
            }
        })

        

        let test = await request.post('/site', { "sites": domains }).then(res => {
            console.log('11111111', res.data);
            ctx.reply(res.data)
        });

        

        
		

		// const responseMessage = checkFullResult.map(r => {
		// 	if (r.canSubmit && r.crm) return `${r.domain} 👍`
		// 	else return `${r.domain} 😢 ${r.message.join('\n')}`
		// })

		// ctx.reply(res.data)
	})

	bot.launch()
})()