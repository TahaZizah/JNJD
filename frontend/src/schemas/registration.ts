import { z } from 'zod'

const MOROCCAN_PHONE = /^0[67][0-9]{8}$/
const ALLOWED_EXTENSIONS = /\.(pdf|png|jpg|jpeg)$/i

export const memberSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(150, 'Full name must not exceed 150 characters'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(255, 'Email too long'),
  phone: z
    .string()
    .regex(MOROCCAN_PHONE, 'Phone must be a valid Moroccan number (e.g. 0612345678)'),
  tshirtSize: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'OTHER'], {
    errorMap: () => ({ message: 'Please select a t-shirt size' }),
  }),
  tshirtSizeCustom: z.string().max(50).optional(),
  schoolName: z.string().max(255).optional(),
  proofFileKey: z.string().optional(),
  cvFileKey: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.tshirtSize === 'OTHER' && !data.tshirtSizeCustom?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['tshirtSizeCustom'],
      message: 'Please specify your custom t-shirt size',
    })
  }
})

export const officialMemberSchema = memberSchema.superRefine((data, ctx) => {
  if (!data.schoolName?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['schoolName'],
      message: 'School name is required for official teams',
    })
  }
  if (!data.proofFileKey?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['proofFileKey'],
      message: 'Proof of enrollment is required for official teams',
    })
  }
})

export const registrationSchema = z.object({
  teamName: z
    .string()
    .min(2, 'Team name must be at least 2 characters')
    .max(100, 'Team name must not exceed 100 characters'),
  isOfficial: z.boolean(),
  description: z.string().max(1000, 'Description must not exceed 1000 characters').optional(),
  members: z.tuple([memberSchema, memberSchema, memberSchema]),
}).superRefine((data, ctx) => {
  const emails = data.members.map(m => m.email.toLowerCase().trim()).filter(Boolean)
  const seenEmails = new Set<string>()
  emails.forEach((email, i) => {
    if (seenEmails.has(email)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['members', i, 'email'],
        message: 'Each member must have a unique email address',
      })
    }
    seenEmails.add(email)
  })

  const phones = data.members.map(m => m.phone.trim()).filter(Boolean)
  const seenPhones = new Set<string>()
  phones.forEach((phone, i) => {
    if (seenPhones.has(phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['members', i, 'phone'],
        message: 'Each member must have a unique phone number',
      })
    }
    seenPhones.add(phone)
  })
})

export const officialRegistrationSchema = z.object({
  teamName: z.string().min(2).max(100),
  isOfficial: z.boolean(),
  description: z.string().max(1000).optional(),
  members: z.tuple([officialMemberSchema, officialMemberSchema, officialMemberSchema]),
})

export type MemberFormValues = z.infer<typeof memberSchema>
export type RegistrationFormValues = z.infer<typeof registrationSchema>

const CV_EXTENSIONS = /\.(pdf|doc|docx)$/i

export function validateFileForUpload(
  file: File,
  allowedExtensions: RegExp = ALLOWED_EXTENSIONS,
): string | null {
  if (!allowedExtensions.test(file.name)) {
    const isCV = allowedExtensions === CV_EXTENSIONS
    return isCV
      ? 'Only PDF, DOC, and DOCX files are allowed'
      : 'Only PDF, PNG, JPG, and JPEG files are allowed'
  }
  if (file.size > 5 * 1024 * 1024) {
    return 'File size must not exceed 5 MB'
  }
  return null
}

/**
 * Sanitize phone input: digits only, must start with 0, max 10 chars.
 */
export function sanitizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, '')
  if (digits.length > 0 && digits[0] !== '0') {
    digits = '0' + digits
  }
  return digits.slice(0, 10)
}

/**
 * Validate email format (contains @ and a dot after @).
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export { CV_EXTENSIONS }
