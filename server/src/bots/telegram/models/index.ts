export interface TelagramChat {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    type: string | 'private';
}