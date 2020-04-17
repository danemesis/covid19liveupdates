import * as ngrok from 'ngrok';

export const runNgrok = async (appPort) => {
    return ngrok.connect(appPort);
};

export const stopNgrok = async () => {
    await ngrok.disconnect();
    await ngrok.kill();
};
