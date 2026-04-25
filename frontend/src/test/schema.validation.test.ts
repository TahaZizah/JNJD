/**
 * Vitest unit tests — registration Zod schema & validation helpers
 *
 * Covers:
 *   - UI-02: Client-side validation (schema correctness for all fields)
 *   - UP-04: File validation (allowed extensions, size limit, content-type guard)
 *   - Edge cases: Moroccan phone regex, email, tshirtSize, official team rules
 *
 * Run:
 *   cd frontend && npm test
 */
import { describe, it, expect } from 'vitest'
import {
  memberSchema,
  officialMemberSchema,
  registrationSchema,
  officialRegistrationSchema,
  validateFileForUpload,
  CV_EXTENSIONS,
} from '../schemas/registration'

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

const validMember = {
  fullName: 'Ahmed Benali',
  email: 'ahmed@example.ma',
  phone: '0612345678',
  tshirtSize: 'M' as const,
}

const validOfficialMember = {
  ...validMember,
  schoolName: 'ENSIAS',
  proofFileKey: 'proofs/uuid/proof.pdf',
}

const validTeam = {
  teamName: 'Team Alpha',
  isOfficial: false as const,
  members: [validMember, { ...validMember, email: 'sec@test.ma', phone: '0698765432' }, { ...validMember, email: 'trd@test.ma', phone: '0711223344' }] as [typeof validMember, typeof validMember, typeof validMember],
}

function makeFile(name: string, sizeBytes: number, type = 'application/pdf'): File {
  const content = new Uint8Array(sizeBytes).fill(65) // Fill with 'A'
  return new File([content], name, { type })
}

// ─────────────────────────────────────────────────────────────────────────────
// Member Schema
// ─────────────────────────────────────────────────────────────────────────────

describe('memberSchema', () => {

  it('accepts a fully valid member', () => {
    const result = memberSchema.safeParse(validMember)
    expect(result.success).toBe(true)
  })

  describe('fullName', () => {
    it('rejects empty string', () => {
      const r = memberSchema.safeParse({ ...validMember, fullName: '' })
      expect(r.success).toBe(false)
    })

    it('rejects single character', () => {
      const r = memberSchema.safeParse({ ...validMember, fullName: 'A' })
      expect(r.success).toBe(false)
    })

    it('rejects name > 150 chars', () => {
      const r = memberSchema.safeParse({ ...validMember, fullName: 'A'.repeat(151) })
      expect(r.success).toBe(false)
    })

    it('accepts exactly 150 chars', () => {
      const r = memberSchema.safeParse({ ...validMember, fullName: 'A'.repeat(150) })
      expect(r.success).toBe(true)
    })
  })

  describe('email', () => {
    it('rejects invalid email', () => {
      const r = memberSchema.safeParse({ ...validMember, email: 'not-an-email' })
      expect(r.success).toBe(false)
    })

    it('accepts standard email', () => {
      const r = memberSchema.safeParse({ ...validMember, email: 'test@example.com' })
      expect(r.success).toBe(true)
    })

    it('rejects email > 255 chars', () => {
      const r = memberSchema.safeParse({ ...validMember, email: 'a'.repeat(250) + '@b.com' })
      expect(r.success).toBe(false)
    })
  })

  describe('phone — Moroccan format (^0[67][0-9]{8}$)', () => {
    const validPhones = ['0612345678', '0698765432', '0712345678', '0798765432']
    const invalidPhones = ['1234567890', '062345678', '06123456789', '0512345678', '+212612345678', '']

    validPhones.forEach(phone => {
      it(`accepts valid phone: ${phone}`, () => {
        const r = memberSchema.safeParse({ ...validMember, phone })
        expect(r.success).toBe(true)
      })
    })

    invalidPhones.forEach(phone => {
      it(`rejects invalid phone: "${phone}"`, () => {
        const r = memberSchema.safeParse({ ...validMember, phone })
        expect(r.success).toBe(false)
      })
    })
  })

  describe('tshirtSize', () => {
    const validSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'OTHER'] as const
    validSizes.forEach(size => {
      it(`accepts size ${size}`, () => {
        const data = size === 'OTHER'
          ? { ...validMember, tshirtSize: size, tshirtSizeCustom: '3XL' }
          : { ...validMember, tshirtSize: size }
        expect(memberSchema.safeParse(data).success).toBe(true)
      })
    })

    it('rejects unknown size "XXXL"', () => {
      const r = memberSchema.safeParse({ ...validMember, tshirtSize: 'XXXL' })
      expect(r.success).toBe(false)
    })

    it('rejects OTHER without tshirtSizeCustom', () => {
      const r = memberSchema.safeParse({ ...validMember, tshirtSize: 'OTHER' })
      expect(r.success).toBe(false)
    })

    it('rejects OTHER with blank tshirtSizeCustom', () => {
      const r = memberSchema.safeParse({ ...validMember, tshirtSize: 'OTHER', tshirtSizeCustom: '   ' })
      expect(r.success).toBe(false)
    })

    it('accepts OTHER with non-blank tshirtSizeCustom', () => {
      const r = memberSchema.safeParse({ ...validMember, tshirtSize: 'OTHER', tshirtSizeCustom: '3XL' })
      expect(r.success).toBe(true)
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Official Member Schema
// ─────────────────────────────────────────────────────────────────────────────

describe('officialMemberSchema', () => {

  it('accepts a valid official member', () => {
    expect(officialMemberSchema.safeParse(validOfficialMember).success).toBe(true)
  })

  it('rejects missing schoolName', () => {
    const r = officialMemberSchema.safeParse({ ...validOfficialMember, schoolName: undefined })
    expect(r.success).toBe(false)
    const errors = !r.success ? r.error.flatten().fieldErrors : {}
    expect(errors.schoolName).toBeDefined()
  })

  it('rejects blank schoolName', () => {
    const r = officialMemberSchema.safeParse({ ...validOfficialMember, schoolName: '   ' })
    expect(r.success).toBe(false)
  })

  it('rejects missing proofFileKey', () => {
    const r = officialMemberSchema.safeParse({ ...validOfficialMember, proofFileKey: undefined })
    expect(r.success).toBe(false)
    const errors = !r.success ? r.error.flatten().fieldErrors : {}
    expect(errors.proofFileKey).toBeDefined()
  })

  it('rejects blank proofFileKey', () => {
    const r = officialMemberSchema.safeParse({ ...validOfficialMember, proofFileKey: '' })
    expect(r.success).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Registration Schema
// ─────────────────────────────────────────────────────────────────────────────

describe('registrationSchema', () => {

  it('accepts a valid unofficial team', () => {
    expect(registrationSchema.safeParse(validTeam).success).toBe(true)
  })

  it('rejects teamName < 2 chars', () => {
    expect(registrationSchema.safeParse({ ...validTeam, teamName: 'A' }).success).toBe(false)
  })

  it('rejects teamName > 100 chars', () => {
    expect(registrationSchema.safeParse({ ...validTeam, teamName: 'A'.repeat(101) }).success).toBe(false)
  })

  it('rejects description > 1000 chars', () => {
    const r = registrationSchema.safeParse({ ...validTeam, description: 'A'.repeat(1001) })
    expect(r.success).toBe(false)
  })

  it('accepts description exactly 1000 chars', () => {
    const r = registrationSchema.safeParse({ ...validTeam, description: 'A'.repeat(1000) })
    expect(r.success).toBe(true)
  })

  it('rejects when only 2 members provided (tuple validation)', () => {
    const shortTeam = { ...validTeam, members: [validMember, validMember] as any }
    expect(registrationSchema.safeParse(shortTeam).success).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Official Registration Schema
// ─────────────────────────────────────────────────────────────────────────────

describe('officialRegistrationSchema', () => {
  const officialTeam = {
    teamName: 'Official Team',
    isOfficial: true,
    members: [validOfficialMember, validOfficialMember, validOfficialMember] as [
      typeof validOfficialMember, typeof validOfficialMember, typeof validOfficialMember
    ],
  }

  it('accepts a fully valid official team', () => {
    expect(officialRegistrationSchema.safeParse(officialTeam).success).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// validateFileForUpload — UP-04
// ─────────────────────────────────────────────────────────────────────────────

describe('validateFileForUpload (proof files)', () => {

  describe('Allowed extensions', () => {
    const allowed = ['proof.pdf', 'proof.png', 'proof.jpg', 'proof.jpeg',
                     'proof.PDF', 'proof.PNG'] // Case insensitive

    allowed.forEach(name => {
      it(`accepts ${name}`, () => {
        const file = makeFile(name, 1024)
        expect(validateFileForUpload(file)).toBeNull()
      })
    })
  })

  describe('Rejected extensions', () => {
    const rejected = ['malware.exe', 'script.sh', 'document.txt', 'archive.zip',
                      'spreadsheet.xlsx', 'video.mp4', 'noextension']

    rejected.forEach(name => {
      it(`rejects ${name}`, () => {
        const file = makeFile(name, 1024)
        expect(validateFileForUpload(file)).not.toBeNull()
        expect(validateFileForUpload(file)).toMatch(/allowed/i)
      })
    })
  })

  describe('File size limit (5 MB)', () => {
    it('accepts file exactly at 5 MB', () => {
      const file = makeFile('proof.pdf', 5 * 1024 * 1024)
      expect(validateFileForUpload(file)).toBeNull()
    })

    it('rejects file 1 byte over 5 MB', () => {
      const file = makeFile('proof.pdf', 5 * 1024 * 1024 + 1)
      const error = validateFileForUpload(file)
      expect(error).not.toBeNull()
      expect(error).toMatch(/5 MB/i)
    })

    it('rejects 10 MB file', () => {
      const file = makeFile('proof.pdf', 10 * 1024 * 1024)
      expect(validateFileForUpload(file)).not.toBeNull()
    })
  })
})

describe('validateFileForUpload (CV files)', () => {

  describe('Allowed CV extensions', () => {
    ['cv.pdf', 'cv.doc', 'cv.docx', 'cv.PDF'].forEach(name => {
      it(`accepts ${name} as CV`, () => {
        const file = makeFile(name, 1024)
        expect(validateFileForUpload(file, CV_EXTENSIONS)).toBeNull()
      })
    })
  })

  describe('Rejected CV extensions', () => {
    ['cv.png', 'cv.jpg', 'cv.jpeg', 'cv.txt'].forEach(name => {
      it(`rejects ${name} for CV upload`, () => {
        const file = makeFile(name, 1024)
        const error = validateFileForUpload(file, CV_EXTENSIONS)
        expect(error).not.toBeNull()
        expect(error).toMatch(/PDF|DOC|DOCX/i)
      })
    })
  })
})
