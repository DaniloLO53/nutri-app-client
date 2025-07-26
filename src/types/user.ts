export type User = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  cpf?: string;
};

export type UserSignUpDTO = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  passwordConfirmation?: string;
  cpf?: string;
};

export const UserRole = {
  ROLE_PATIENT: 'ROLE_PATIENT',
  ROLE_NUTRITIONIST: 'ROLE_NUTRITIONIST',
} as const;

export type UserRoleEnum = keyof typeof UserRole;
export type UserRoleValue = (typeof UserRole)[keyof typeof UserRole];

export type UserSignInDTO = {
  email: string;
  password?: string;
  role: UserRoleEnum;
};

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  token?: string | null;
};

export type UserWithoutId = Omit<User, 'id'>;
