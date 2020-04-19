Please, feel free to create PRs with suggestion & improvements of that document.

## Information
This file describes everything you need to know for writing code in a way we do it. Morever, here you'll find all basic answers how to start & develop.

We have <a href='https://github.com/danbilokha/covid19liveupdates/issues/14'>special issue</a> for those who want to join. We (and world) need you :) 

## To write the code
Follow style guidelines & folder structure; stay passionate and **code**,
- You can contribute straight away, no need to wait - **create your PR**,
- Contact any collaborator for adding your to contributors list.

## Style guidelines
_TODO: split this in sections_
- Typescript means types whenever possible,
- prefer arrow functions,
- prefer functional type of coding, 
- try to avoid side effects,
- no camel case,

## Folder structure
1. <h4>`*/src/bots/[messangerPlatform]`</h4>
Only contains platform related logic (e.g. .env file; sending messages; platform related interface adaption).

Take a look into `server/bots/telegram/*` for an example.

2. <h4>`*/src/models/*`</h4>
Contains models used in application (regardless of a platform it's running (Telegram, Viber ... ))

3. <h4>`*/src/routes/*`</h4>
Leave for now.

4. <h4>`*/src/services/*`</h4>
    - `/api`. Only responsible for API calls,
    - `/domain`. Has all domain-specific logic (data mapping, resolving),
    - `/utils`. Service helpers.
    - todo? `/`

5. <h4>`*/src/models/utils*`</h4>
    - `*/messages` User message representation (should not be dependent on any platform),
    - `utils.ts` Infrastructure helpers,
    - `[helperFunction].ts` Have project wide helpers (e.g. _deepCopy_, _isEqual_ etc.). If you want to create
    new helper function - create file `[helperFunctionName].ts` for that.

All inner folder's structure preferebly should follow structure above (fine-grained approach).

## Running for development

#### Prerequirements
Checked, that the application works with
- Node **version v10.16.0**
- npm **version 6.9.0**

on Windows 10, x64 machine


##### Telegram
- Open <a href='https://t.me/botfather'>BotFather</a>,
- Create your development version of the bot (for your local testing purpose) via `/newbot` command
- Receive from <a href='https://t.me/botfather'>BotFather</a> Key & Copy it,
- Create `.env` in `/server/src/bots/telegram` file and add received **key** there (<a href='https://github.com/danbilokha/covid19liveupdates/tree/master/server/src/environments'>more about it, example of the file</a>),
- Add to the project,
- run `npm i`
- run `npm run start:watch`, `npm run start:inspect` for debugging 
(<a href='https://medium.com/the-node-js-collection/debugging-node-js-with-google-chrome-4965b5f910f4'>Useful link</a>)

<b>Hints</b>
- If you\'re running locally, you can run `ngrok http 3000` copy `https url` 
paste to `APP_URL` <a href='https://github.com/danbilokha/covid19liveupdates/tree/master/server/src/environments'>
env variable</a> and reloading will be faster and cheaper for CPU

##### If any questions and/or issues, 
- contact any collaborator,
- or text via mail (danbilokha@gmail.com) or via Telegram (@danbilokha)


### Restrictions and Limitations
For running the application we need to have secure connection (as some all known messengers
do not support running via http) thus we are using <a href='https://github.com/bubenshchykov/ngrok'>**ngrok**</a> library 
for that, currently. It creates public domain with secured connection with we are using for redirecting all messages
to our local machines.
