# 🗄️ Supabase Database Setup Guide

This guide will help you set up Supabase as your database service and migrate from JSON file storage to a proper PostgreSQL database.

## 🚀 **Step 1: Create Supabase Account**

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign Up"
3. Sign up with GitHub, Google, or email
4. Verify your email address

## 🏗️ **Step 2: Create New Project**

1. Click "New Project"
2. Choose your organization
3. Enter project details:
   - **Name:** `ai-recruiter-db` (or your preferred name)
   - **Database Password:** Create a strong password (save this!)
   - **Region:** Choose closest to your users
4. Click "Create new project"
5. Wait for project to be created (2-3 minutes)

## 🔑 **Step 3: Get API Keys**

1. In your project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## ⚙️ **Step 4: Update Environment Variables**

1. In your project root, edit `.env` file:
```bash
# Add these lines to your .env file:
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

2. **Important:** Never commit your `.env` file to Git!

## 🗃️ **Step 5: Create Database Tables**

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `database/schema.sql`
4. Click "Run" to execute the SQL

## 🔄 **Step 6: Migrate Existing Data (Optional)**

If you have existing data in your JSON files, you can migrate it:

1. **Export current data:**
   ```bash
   # Your current data is in data/app-data.json
   # You can manually copy this data to Supabase tables
   ```

2. **Or use the migration script:**
   ```bash
   npm run migrate-data
   ```

## 🧪 **Step 6: Test Database Connection**

1. **Build and start your server:**
   ```bash
   npm run build
   npm start
   ```

2. **Check server logs** - you should see:
   ```
   🗄️ Database service initialized with Supabase
   ✅ Database health check passed
   ```

## 📊 **Step 7: Verify in Supabase Dashboard**

1. Go to **Table Editor** in your Supabase dashboard
2. You should see these tables:
   - `jobs`
   - `candidates` 
   - `campaigns`
   - `email_config`

3. Check that sample data was inserted correctly

## 🚨 **Troubleshooting**

### **Error: "Missing Supabase environment variables"**
- Check your `.env` file has `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Restart your server after updating `.env`

### **Error: "Database health check failed"**
- Verify your Supabase project is active
- Check your API keys are correct
- Ensure tables were created successfully

### **Error: "Permission denied"**
- Check Row Level Security (RLS) policies in Supabase
- Verify your API key has the correct permissions

## 🔒 **Security Notes**

1. **Never expose your service role key** in client-side code
2. **Use environment variables** for sensitive data
3. **Enable RLS policies** for production use
4. **Regular backups** are automatically handled by Supabase

## 📈 **Next Steps**

After successful setup:

1. **Remove JSON file storage** - update `src/server.ts` to use `databaseService`
2. **Test all CRUD operations** - create, read, update, delete data
3. **Monitor performance** - check Supabase dashboard for query performance
4. **Set up authentication** - add user login system (optional)

## 🆘 **Need Help?**

- **Supabase Docs:** [https://supabase.com/docs](https://supabase.com/docs)
- **Discord Community:** [https://discord.supabase.com](https://discord.supabase.com)
- **GitHub Issues:** Check existing issues or create new ones

---

**🎉 Congratulations!** You now have a professional PostgreSQL database powering your AI Recruiter application!
