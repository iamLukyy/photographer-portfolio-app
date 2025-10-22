# Contact Form Setup Instructions

Kontaktní formulář je plně funkční a posílá emaily na **lukyn.karel97@gmail.com** přes službu Resend.

## Kroky pro nastavení:

### 1. Vytvoř Resend účet
1. Jdi na https://resend.com
2. Zaregistruj se (zdarma pro 3,000 emailů/měsíc)
3. Ověř svůj email

### 2. Získej API klíč
1. Po přihlášení jdi na https://resend.com/api-keys
2. Klikni na "Create API Key"
3. Dej mu jméno (např. "Portfolio Contact Form")
4. Zkopíruj API klíč (začíná s `re_`)

### 3. Nastav API klíč
1. Vytvoř soubor `.env.local` v root složce projektu (pokud neexistuje)
2. Přidej svůj Resend API klíč:
```
RESEND_API_KEY=re_your_actual_api_key_here
```
(Nahraď `re_your_actual_api_key_here` svým skutečným API klíčem z Resend)

### 4. Restartuj dev server
```bash
pnpm run dev
```

### 5. Pro production (Vercel)
1. Jdi do Vercel dashboard
2. Vyber svůj projekt
3. Jdi do Settings → Environment Variables
4. Přidej novou proměnnou:
   - **Name**: `RESEND_API_KEY`
   - **Value**: tvůj Resend API klíč
   - **Environment**: Production, Preview, Development
5. Redeploy aplikaci

## Jak to funguje:

- Formulář je na `/about` stránce
- Když někdo odešle zprávu:
  - Email přijde na **lukyn.karel97@gmail.com**
  - "Reply-To" je nastaveno na email odesílatele
  - Email obsahuje pěkně formátovanou zprávu s všemi detaily

## Testování:

1. Jdi na `http://localhost:3000/about`
2. Scroll dolů na kontaktní formulář
3. Vyplň email a zprávu
4. Klikni "Send Message"
5. Měl bys dostat potvrzení "Message sent successfully!"
6. Email by měl přijít na lukyn.karel97@gmail.com

## Poznámky:

- Resend používá `onboarding@resend.dev` jako testovací sender
- Pro production můžeš nastavit vlastní doménu v Resend
- Všechny emaily mají nastavenou Reply-To na odesílatele
- Formulář má validaci emailů a error handling

## Troubleshooting:

Pokud emaily nepřicházejí:
1. Zkontroluj že API klíč je správně nastaven v `.env.local`
2. Zkontroluj konzoli v prohlížeči pro chyby
3. Podívej se do Resend dashboardu na logs (https://resend.com/logs)
4. Zkontroluj spam složku
