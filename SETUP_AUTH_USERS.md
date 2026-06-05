# 🔐 Setup Supabase Auth Users - Automated

**Status**: Ready to create auth users with default password "122333"

---

## 📋 Quick Setup (3 langkah)

### STEP 1: Get Service Role Key

1. Go to: https://app.supabase.com/project/fnkbvqrvcsnwnuhjkwbe/settings/api
2. Scroll down ke section **"Project API keys"**
3. Copy value dari **"service_role key"** (NOT anon public key)
4. Simpan di tempat aman (Anda akan paste di terminal)

---

### STEP 2: Run Setup Script

**Di terminal**, jalankan command ini:

```bash
cd "/home/aan/Claude Project/Productivity"

# Ganti SERVICE_ROLE_KEY_HERE dengan key yang Anda copy dari STEP 1
SUPABASE_SERVICE_ROLE_KEY="SERVICE_ROLE_KEY_HERE" node setup-auth-users.js
```

**Contoh** (dengan key yang disamarkan):
```bash
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." node setup-auth-users.js
```

---

### STEP 3: Verify Users Created

Setelah script selesai:

1. Go to: https://app.supabase.com/project/fnkbvqrvcsnwnuhjkwbe/auth/users
2. Kamu seharusnya lihat 7 users yang sudah created ✅

---

## 🧪 Test Login

Setelah users created, test login dengan:

```
URL: https://csmajoo.github.io/act/
Email: aan.sayudi@majoo.id
Password: 122333
```

---

## 📝 Users Created

| Email | Password |
|-------|----------|
| aan.sayudi@majoo.id | 122333 |
| jhovan@majoo.id | 122333 |
| rofby.hidayadi@majoo.id | 122333 |
| ridho.valentin@majoo.id | 122333 |
| suro.rahardi@majoo.id | 122333 |
| taufiq.hadiyanto@majoo.id | 122333 |
| rahmat.hidayat@majoo.id | 122333 |

---

## ⚠️ Troubleshooting

### Error: "SUPABASE_SERVICE_ROLE_KEY not set"
- Copy Service Role Key dari Supabase Settings
- Paste di command sesuai format: `SUPABASE_SERVICE_ROLE_KEY="..." node setup-auth-users.js`

### Error: "User already exists"
- User sudah created sebelumnya, tidak apa-apa ✅
- Script akan skip dan lanjut ke user berikutnya

### Error: "Invalid API key"
- Service Role Key tidak valid
- Cek lagi di: https://app.supabase.com/project/fnkbvqrvcsnwnuhjkwbe/settings/api
- Make sure copy **service_role key** (bukan anon key)

---

**Silakan jalankan STEP 1 & 2, lalu test login!** 🚀
