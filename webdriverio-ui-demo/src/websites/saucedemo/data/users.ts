export interface SauceUser {
  username: string;
  password: string;
}

export const STANDARD_USER: SauceUser = {
  username: 'standard_user',
  password: 'secret_sauce',
};

export const LOCKED_OUT_USER: SauceUser = {
  username: 'locked_out_user',
  password: 'secret_sauce',
};
