const ngrok = require('ngrok');

export const runNgrok = async (appPort) => {
    const url = await ngrok.connect(appPort);
    return url;
};

export const stopNgrok = async (url) => {
    await ngrok.disconnect();
    await ngrok.kill();
};
