# Contact Form Setup Instructions

The contact form sends emails to your configured email address via Resend API.

## Setup Steps:

### 1. Create Resend Account
1. Go to https://resend.com
2. Sign up (free for 3,000 emails/month)
3. Verify your email

### 2. Get API Key
1. After login, go to https://resend.com/api-keys
2. Click "Create API Key"
3. Give it a name (e.g., "Portfolio Contact Form")
4. Copy the API key (starts with `re_`)

### 3. Configure API Key
1. Create `.env.local` file in project root (if it doesn't exist)
2. Add your Resend API key:
```
RESEND_API_KEY=re_your_actual_api_key_here
```
(Replace `re_your_actual_api_key_here` with your actual Resend API key)

### 4. Restart Dev Server
```bash
pnpm run dev
```

### 5. For Production (Vercel)
1. Go to Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add new variable:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Your Resend API key
   - **Environment**: Production, Preview, Development
5. Redeploy the application

## How it Works:

- The form is on the `/about` page
- When someone submits a message:
  - Email is sent to the address configured in `lib/settings.json`
  - "Reply-To" is set to the sender's email
  - Email contains a nicely formatted message with all details

## Testing:

1. Go to `http://localhost:3000/about`
2. Scroll down to the contact form
3. Fill in email and message
4. Click "Send Message"
5. You should see "Message sent successfully!"
6. Email should arrive at your configured email address

## Notes:

- Resend uses `onboarding@resend.dev` as test sender
- For production, you can configure your own domain in Resend
- All emails have Reply-To set to the sender's address
- Form has email validation and error handling

## Troubleshooting:

If emails are not arriving:
1. Check that API key is correctly set in `.env.local`
2. Check browser console for errors
3. Check Resend dashboard logs (https://resend.com/logs)
4. Check spam folder
