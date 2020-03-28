# covid19liveupdates
bot for covid19 live updates in Telegram messanger

## Main dependencies 
##### Telegram chat bot: https://github.com/yagop/node-telegram-bot-api
##### Data maining: https://github.com/pomber/covid19 

#### Other
<ul>
 <li><a href="https://github.com/meeDamian/country-emoji">emoji</a></li>
 <li><a href="https://github.com/richorama/country-code-lookup">Country lookup</a></li>
</ul>


## Run

##### Add Telegram bot API key
1. Receive from BotFather Key
2. Add to the project, <a href='https://github.com/danbilokha/covid19liveupdates/tree/master/server/src/bots/telegram'>More about it</a>

##### Setup secure connection, e.g. 
1. ngrok http 3000
2. find https proxy 
3. copy it 
4. replace it in telegram/index.ts `bot.setWebHook(URL)`
