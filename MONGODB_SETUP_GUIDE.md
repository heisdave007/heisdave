# MongoDB Connection Troubleshooting - Complete Checklist

## ❌ Current Error: `querySrv ENOTFOUND`
This means MongoDB Atlas cannot find your connection because your IP is not whitelisted.

## ✅ Step-by-Step Fix

### Step 1: Find Your Public IP Address
Visit: https://www.whatismyipaddress.com
Write down your IP address (looks like: 192.168.1.100 or similar)

### Step 2: Whitelist Your IP in MongoDB Atlas

1. **Login to MongoDB Atlas:**
   - Go to https://cloud.mongodb.com
   - Sign in with your account

2. **Go to Network Access:**
   - Click "Networking" in left sidebar
   - Click "IP Access List" tab
   - You should see a yellow warning if no IPs are whitelisted

3. **Add Your IP:**
   - Click "Add IP Address" button
   - **Option A (Recommended for Development):**
     - Click "Add Current IP Address"
     - MongoDB auto-detects your IP
     - Click "Confirm"
   
   - **Option B (If above doesn't work):**
     - Manually enter your IP from step 1
     - Click "Confirm"

4. **Allow All IPs (Only for Local Development):**
   - Enter: `0.0.0.0/0`
   - Add description: "Development"
   - Click "Confirm"
   - **⚠️ WARNING:** Only use for development. Remove before production!

### Step 3: Verify MongoDB URL

Your current URL in config.env should look like:
```
MONGODB_URL= mongodb+srv://davidbarivuregbarazia_db_user:8AmGfVOnLPwzkNTE@productscollection.j8azugc.mongodb.net/productscollection?appName=productscollectionx
```

✅ Check:
- [x] `mongodb+srv://` at the start
- [x] Username: `davidbarivuregbarazia_db_user`
- [x] Password: `8AmGfVOnLPwzkNTE`
- [x] Cluster: `productscollection.j8azugc`
- [x] Database name: `/productscollection` (before the ?)
- [x] No spaces or special characters

### Step 4: Verify Credentials

1. Go to MongoDB Atlas Dashboard
2. Click "Databases" 
3. Click "Connect" on your cluster
4. Select "Drivers" → "Node.js"
5. Copy the connection string
6. Verify it matches your config.env (with your password)

## 📋 Checklist Before Running npm start

- [ ] 1. IP address is whitelisted in MongoDB Atlas
- [ ] 2. MongoDB URL is correct in config.env
- [ ] 3. Username and password are correct
- [ ] 4. Database name is in the URL (/productscollection)
- [ ] 5. Can ping MongoDB (see test below)

## 🧪 Test MongoDB Connection

### Test 1: Verify DNS Resolution
```powershell
# Run this in PowerShell
nslookup productscollection.j8azugc.mongodb.net

# Should return IP addresses, not "NXDOMAIN"
```

### Test 2: Test with MongoDB Compass (Optional)
1. Download: https://www.mongodb.com/products/compass
2. Paste your connection string
3. Click "Connect"
4. If it connects, your URL and IP are correct

### Test 3: Check Node Modules Are Installed
```powershell
cd "c:\Users\David\Desktop\NODE.JS EX"
npm list mongoose stripe dotenv

# Should show all modules installed
```

## Common Issues & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `querySrv ENOTFOUND` | IP not whitelisted | Add IP to MongoDB Atlas |
| `Authentication failed` | Wrong password | Copy password from MongoDB > Database > Connect |
| `getaddrinfo ENOTFOUND` | Wrong hostname | Check cluster name in URL |
| `ECONNREFUSED` | MongoDB server down | Check cluster status in Atlas |

## 🚀 Next Steps

1. **Whitelist your IP in MongoDB Atlas** (see steps above)
2. **Restart server:** `npm start`
3. **Should see:** `✓ Database connected successfully`
4. **If still fails:** Follow Test 1 & 2 above

## Network Access Settings Location

- MongoDB Dashboard → Click Project
- Left sidebar: "Networking"
- Tab: "IP Access List"
- Button: "Add IP Address"

## ⚠️ Important

- After whitelisting IP, **wait 5-10 seconds** before restarting server
- If using **VPN/Proxy**, your IP changes - whitelist the VPN IP
- If using **mobile hotspot**, use `0.0.0.0/0` (development only)
- If in **different location/network**, whitelist that IP too
