export const catchAsyncError = async (promiseLike: Promise<unknown>): Promise<[Error, unknown]> => {
    try {
        const result = await promiseLike;
        return [undefined, result];
    } catch (e) {
        return [e, undefined]
    }
};
