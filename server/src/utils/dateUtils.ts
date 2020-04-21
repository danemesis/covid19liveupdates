export const addDays = (date: string | Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

export let Now = new Date();
