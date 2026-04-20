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

export { CV_EXTENSIONS }
