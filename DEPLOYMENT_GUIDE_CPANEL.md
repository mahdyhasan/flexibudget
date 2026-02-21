# FlexiBudget cPanel Deployment Guide

## 📋 Pre-Deployment Checklist

✅ pnpm-lock.yaml already removed (cPanel will use npm)
✅ Application analyzed - NO database needed
✅ Build tested successfully locally

---

## 📦 Files to Upload

### **Required Files to Upload:**
```
flexibudget/
├── package.json              ✅ UPLOAD
├── next.config.ts            ✅ UPLOAD
├── tsconfig.json             ✅ UPLOAD
├── tailwind.config.ts        ✅ UPLOAD
├── postcss.config.mjs        ✅ UPLOAD
├── components.json           ✅ UPLOAD
├── .gitignore               ✅ UPLOAD
├── .env                     ✅ UPLOAD (with production values)
├── src/                     ✅ UPLOAD (entire folder)
└── public/                  ✅ UPLOAD (entire folder)
```

### **DO NOT Upload:**
❌ `node_modules/`
❌ `.next/`
❌ `pnpm-lock.yaml` (already removed)
❌ `package-lock.json` (doesn't exist yet - cPanel will create it)

---

## 🔧 cPanel Setup Instructions

### **Step 1: Upload Files**

1. Log in to cPanel
2. Go to **File Manager**
3. Navigate to `/home/YOUR_USERNAME/public_html/`
4. Create a folder named `flexibudget`
5. Upload all the ✅ marked files/folders above
6. Set permissions:
   - Folders: `755`
   - Files: `644`
   - `.env` file: `600` (for security)

### **Step 2: Create Node.js Application**

1. In cPanel, go to **Setup Node.js App** (usually under Software section)
2. Click **"Create Application"**
3. Fill in these values:

| Setting | Value |
|---------|-------|
| Node.js Version | `22.2.0` (or closest available) |
| Application Mode | `Development` |
| Application Root | `/home/YOUR_USERNAME/public_html/flexibudget` |
| Application URL | Leave blank (auto-generated) or specify subdomain |
| Application Startup File | `package.json` |

4. Click **"Create"**

### **Step 3: Install Dependencies**

1. After creation, find your application in the list
2. Click **"Run NPM Install"**
3. Wait for installation to complete (this generates `package-lock.json`)

### **Step 4: Configure Environment Variables**

1. Scroll down to **"Environment Variables"** section
2. Click **"Edit"**
3. Add these variables:

```
OPENAI_API_KEY = your_actual_openai_key_here
NEXT_PUBLIC_APP_URL = https://2017techware.com/flexibudget
```

4. Click **"Save"**

### **Step 5: Start the Application**

1. Find your application again
2. Click **"Restart"** button
3. Wait for the application to start

### **Step 6: Access Your Application**

Your app will be accessible at:
- **https://2017techware.com/flexibudget** (if in subdirectory)

---

## 🔑 Environment Variables Reference

| Variable | Value | Required? |
|----------|-------|-----------|
| `OPENAI_API_KEY` | Your OpenAI API key | ✅ Required |
| `NEXT_PUBLIC_APP_URL` | `https://2017techware.com/flexibudget` | ⚠️ Recommended |
| `DATABASE_URL` | (Not needed) | ❌ Not used |

---

## 🐛 Troubleshooting

### **Issue: Application won't start**
- Check error logs in **Setup Node.js App** → **View Log**
- Ensure all files are uploaded correctly
- Verify environment variables are set

### **Issue: 404 errors**
- Check that `.next/` folder is NOT uploaded (cPanel generates it)
- Verify application root path is correct
- Ensure port is properly assigned (cPanel does this automatically)

### **Issue: API errors**
- Verify OPENAI_API_KEY is correct
- Check that the key has sufficient credits
- Review application logs for specific errors

### **Issue: Port conflicts**
- cPanel automatically assigns ports
- No action needed if you see port errors during setup

---

## 📝 Important Notes

1. **No Database Setup Required** - This application doesn't use a database
2. **No Prisma Commands Needed** - Skip all `prisma db push`, `prisma generate`, etc.
3. **No Local Build Needed** - cPanel handles the build process
4. **Keep .env File** - Upload it with your production API key
5. **Development Mode** - Good for testing. For production, switch to "Production" mode later.

---

## ✅ Final Checklist Before Deployment

- [ ] All required files uploaded
- [ ] `node_modules/` and `.next/` NOT uploaded
- [ ] `.env` file contains production values
- [ ] Node.js app created in cPanel
- [ ] NPM install completed successfully
- [ ] Environment variables configured
- [ ] Application restarted
- [ ] Application accessible at https://2017techware.com/flexibudget

---

## 🚀 After Deployment

1. **Test the application** - Visit https://2017techware.com/flexibudget
2. **Check all features** - Test calculator, chat, and all components
3. **Monitor logs** - Keep an eye on application logs in cPanel
4. **Set up backups** - Configure regular backups through cPanel

---

## 📞 Need Help?

If you encounter any issues:

1. Check the **View Log** button in cPanel Node.js Setup
2. Verify all files are uploaded with correct permissions
3. Ensure environment variables are properly set
4. Review this guide for troubleshooting steps

---

**Deployment Summary:**
- 🎯 Target: cPanel shared hosting
- 📁 Path: `/home/YOUR_USERNAME/public_html/flexibudget`
- 🔗 URL: `https://2017techware.com/flexibudget`
- 🚀 Mode: Development
- 💾 Database: None required
- 🔑 Key Config: OPENAI_API_KEY

Good luck with your deployment! 🎉