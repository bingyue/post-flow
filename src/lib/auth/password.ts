import { compare, hash } from 'bcryptjs'

const MIN_PASSWORD_LENGTH = 8

export function validatePassword(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return '密码至少需要 8 位'
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return '密码需要同时包含字母和数字'
  }
  return null
}

export function hashPassword(password: string) {
  return hash(password, 12)
}

export function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash)
}
