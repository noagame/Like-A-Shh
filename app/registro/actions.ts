"use server";
import { signUp as registerAccount } from '@/app/login/actions';
export async function signUp(formData: FormData) {
  return registerAccount(formData);
}
