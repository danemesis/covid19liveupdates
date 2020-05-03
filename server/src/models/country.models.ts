import { UserPresentationalCountryNameString } from './tsTypes.models';

export interface Country {
    name: UserPresentationalCountryNameString;
    region: string;
    continent: string;
    iso3: string;
}
