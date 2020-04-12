export const catchAsyncError = async <T>(promiseLike: Promise<T>): Promise<[Error, T]> => {
    try {
        const result = await promiseLike;
        return [undefined, result];
    } catch (e) {
        return [e, undefined]
    }
};
