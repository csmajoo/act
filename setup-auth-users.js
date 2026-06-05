#!/usr/bin/env node

/**
 * Supabase Auth User Creator
 * Creates auth users for all employees with default password
 * 
 * Usage: node setup-auth-users.js
 */

const https = require('https')

// Configuration
const SUPABASE_PROJECT_ID = 'fnkbvqrvcsnwnuhjkwbe'
const SUPABASE_API_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Default password for all users
const DEFAULT_PASSWORD = '122333'

// Users to create
const USERS = [
  { email: 'aan.sayudi@majoo.id', name: 'Aan Sayudi' },
  { email: 'jhovan@majoo.id', name: 'Jhovan Hidayat' },
  { email: 'rofby.hidayadi@majoo.id', name: 'Rofbi Hidayadi' },
  { email: 'ridho.valentin@majoo.id', name: 'Ridho Valentin' },
  { email: 'suro.rahardi@majoo.id', name: 'Suro Rahadi' },
  { email: 'taufiq.hadiyanto@majoo.id', name: 'Taufiq Hadiyanto' },
  { email: 'rahmat.hidayat@majoo.id', name: 'Rahmat Hidayat' }
]

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable not set')
  console.error('\nTo get Service Role Key:')
  console.error('1. Go to: https://app.supabase.com/project/fnkbvqrvcsnwnuhjkwbe/settings/api')
  console.error('2. Copy "service_role key" (NOT anon key)')
  console.error('3. Run: SUPABASE_SERVICE_ROLE_KEY="<key>" node setup-auth-users.js')
  process.exit(1)
}

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${SUPABASE_PROJECT_ID}.supabase.co`,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      }
    }

    const req = https.request(options, (res) => {
      let responseData = ''

      res.on('data', (chunk) => {
        responseData += chunk
      })

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData)
          resolve({ status: res.statusCode, data: parsed })
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData })
        }
      })
    })

    req.on('error', (e) => {
      reject(e)
    })

    if (data) {
      req.write(JSON.stringify(data))
    }
    req.end()
  })
}

async function createAuthUser(email) {
  try {
    const response = await makeRequest('POST', '/auth/v1/admin/users', {
      email: email,
      password: DEFAULT_PASSWORD,
      email_confirm: true
    })

    if (response.status === 201 || response.status === 200) {
      console.log(`✅ Created auth user: ${email}`)
      return true
    } else if (response.status === 422 && response.data.message?.includes('already exists')) {
      console.log(`⚠️  User already exists: ${email}`)
      return true
    } else {
      console.log(`❌ Failed to create ${email}: ${response.data.message || response.data}`)
      return false
    }
  } catch (error) {
    console.log(`❌ Error creating ${email}: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('🚀 Starting Supabase Auth User Creation...\n')
  console.log(`📧 Default password for all users: ${DEFAULT_PASSWORD}`)
  console.log(`👥 Users to create: ${USERS.length}\n`)

  let success = 0
  let failed = 0

  for (const user of USERS) {
    const created = await createAuthUser(user.email)
    if (created) {
      success++
    } else {
      failed++
    }
    // Small delay between requests
    await new Promise(r => setTimeout(r, 500))
  }

  console.log(`\n📊 Summary:`)
  console.log(`✅ Success: ${success}`)
  console.log(`❌ Failed: ${failed}`)
  
  if (failed === 0) {
    console.log(`\n🎉 All users created successfully!`)
    console.log(`\n📝 Test Login Credentials:`)
    USERS.slice(0, 3).forEach(u => {
      console.log(`   Email: ${u.email} | Password: ${DEFAULT_PASSWORD}`)
    })
    console.log(`   ... and 4 more users`)
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
