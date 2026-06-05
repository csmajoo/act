# Deploy Supabase Edge Functions for Google Calendar OAuth

Panduan deploy Edge Functions ke Supabase untuk handle Google Calendar OAuth + sync.

## 📋 Prasyarat

1. **Supabase CLI** terinstall:
   ```bash
   npm install -g supabase
   ```

2. **Login ke Supabase**:
   ```bash
   supabase login
   ```

3. **Link ke project Anda**:
   ```bash
   cd "/home/aan/Claude Project/Productivity"
   supabase link --project-ref fnkbvqrvcsnwnuhjkwbe
   ```

## 🔐 Set Environment Variables (Secrets)

Edge Functions perlu credentials Google. Set secrets via CLI:

```bash
# Replace YOUR_CLIENT_ID and YOUR_CLIENT_SECRET with values from Google Cloud Console
supabase secrets set GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
supabase secrets set GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
supabase secrets set GOOGLE_REDIRECT_URI=https://fnkbvqrvcsnwnuhjkwbe.supabase.co/functions/v1/google-callback
supabase secrets set FRONTEND_URL=https://csmajoo.github.io/act/
supabase secrets set GOOGLE_CALENDAR_TZ=Asia/Jakarta
```

> Get your Google OAuth credentials from: https://console.cloud.google.com/apis/credentials

**Verifikasi:**
```bash
supabase secrets list
```

## 🚀 Deploy Edge Functions

Deploy semua 5 functions sekaligus:

```bash
supabase functions deploy google-auth-url --no-verify-jwt
supabase functions deploy google-callback --no-verify-jwt
supabase functions deploy google-status --no-verify-jwt
supabase functions deploy google-disconnect --no-verify-jwt
supabase functions deploy google-event --no-verify-jwt
```

> `--no-verify-jwt` karena kita verify auth via session token kita sendiri (bukan Supabase Auth)

## 🔧 Update Google OAuth Redirect URI

**WAJIB!** Tambahkan callback URL ke Google Cloud Console:

1. Buka: https://console.cloud.google.com/apis/credentials
2. Pilih OAuth Client Anda
3. Di **Authorized redirect URIs**, tambahkan:
   ```
   https://fnkbvqrvcsnwnuhjkwbe.supabase.co/functions/v1/google-callback
   ```
4. Save

## 🗄️ Update Database Schema

Jalankan `SUPABASE_ADD_GOOGLE_COLS.sql` di Supabase SQL Editor untuk pastikan kolom google_* ada di users table.

## ✅ Test

1. Buka https://csmajoo.github.io/act/
2. Login
3. Klik **📅 Hubungkan Google Calendar**
4. Authorize di Google
5. Otomatis redirect balik dengan status connected ✓

## 🔍 Debug

Lihat logs Edge Function di Supabase Dashboard:
- Functions → pilih function → Logs

Atau via CLI:
```bash
supabase functions logs google-callback
```

## 📂 Edge Functions Structure

```
supabase/functions/
├── _shared/
│   ├── cors.ts          # CORS helpers
│   ├── google.ts        # Google API helpers
│   └── supabase.ts      # Supabase admin client + auth
├── google-auth-url/     # Generate OAuth consent URL
├── google-callback/     # Handle OAuth callback, save tokens
├── google-status/       # Check connection status
├── google-disconnect/   # Remove Google tokens
└── google-event/        # Create/Update/Delete calendar events
```

## 🐛 Troubleshooting

**Error: "Google not configured"**
→ Set secrets via `supabase secrets set` lalu redeploy

**Error: "redirect_uri_mismatch"**
→ Tambahkan callback URL ke Google Cloud Console

**Error: "Unauthorized"**
→ User belum login atau session expired

**Functions tidak respond:**
→ Check logs di Supabase Dashboard → Functions
