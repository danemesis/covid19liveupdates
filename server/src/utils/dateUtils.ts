export const addDays = (date: string | Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

export let Now = new Date();
