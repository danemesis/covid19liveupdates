export type UpperCaseString = string;
export type UserPresentationalCountryNameString = string;
export type Modify<T, R> = Omit<T, keyof R> & R;