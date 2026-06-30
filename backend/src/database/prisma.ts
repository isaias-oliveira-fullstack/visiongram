import path from 'node:path'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

function ensureUrlParam(url: string, key: string, value: string) {
  const [base, query = ''] = url.split('?')
  const params = new URLSearchParams(query)
  if (!params.has(key)) {
    params.set(key, value)
  }
  return `${base}?${params.toString()}`
}

function resolveDatabaseUrl() {
  let url = process.env.DATABASE_URL?.trim()
  if (!url) {
    return undefined
  }

  if (!/\bsslmode=[^&]+/i.test(url)) {
    url = ensureUrlParam(url, 'sslmode', 'require')
  }

  if (!/\buselibpqcompat=[^&]+/i.test(url)) {
    url = ensureUrlParam(url, 'uselibpqcompat', 'true')
  }

  return url
}

const resolvedDatabaseUrl = resolveDatabaseUrl()
console.log('Prisma database setup', {
  hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
  hasSslMode: Boolean(process.env.DATABASE_URL?.match(/\bsslmode=[^&]+/i)),
  resolvedHasUseLibpqCompat: Boolean(resolvedDatabaseUrl?.match(/\buselibpqcompat=[^&]+/i)),
  resolvedUrlIncludesRequire: Boolean(resolvedDatabaseUrl?.match(/\bsslmode=require/i))
})

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: resolvedDatabaseUrl
    }
  }
})

export default prisma
