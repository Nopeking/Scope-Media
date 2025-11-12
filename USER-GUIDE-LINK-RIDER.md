# How to Link Your Rider Profile - User Guide

## Overview
This guide explains how riders can link their profile to their account **on their own**, without needing admin approval.

---

## Step-by-Step Instructions

### 1. **Log In**
First, you need to be logged in to the platform.
- Go to the website
- Click the user icon in the top right
- Sign in with your credentials

### 2. **Navigate to Link Rider Page**
Once logged in, you'll see a new menu item:
- Look at the navigation menu at the top
- Click on **"Link Rider"** (it has a user check icon ✓)
- Or visit directly: `http://localhost:3000/profile/link-rider`

### 3. **Enter Your FEI Registration Number**
On the Link Rider page:
- You'll see a form with a text field
- Enter your **FEI Registration Number**
  - Example: `10012345`
  - This is the number on your FEI rider card
- Click the **"Link Rider"** button

### 4. **Confirmation**
If your FEI Registration number is found:
- ✅ You'll see a success message
- Your rider profile will appear below the form
- You can see all your information:
  - Full name
  - Licence number
  - Club information
  - Country
  - Contact details

### 5. **View Your Linked Profiles**
- All your linked rider profiles appear on the same page
- You can link multiple profiles if you have more than one FEI Registration
- Each profile shows a "Pending Verification" or "Verified" badge

### 6. **Unlink (if needed)**
If you linked the wrong profile:
- Click the **"Unlink"** button next to the profile
- Confirm the action
- The profile will be removed from your account
- You can link a different one

---

## What Information Do I Need?

You only need **ONE** piece of information:
- ✅ **FEI Registration Number**

That's it! The system will automatically find your profile in the database.

---

## What Happens After Linking?

1. **Immediate Access**: Your profile is linked instantly - no waiting!
2. **View Your Data**: You can see all your rider information
3. **Pending Verification**: Your link shows as "Pending Verification" initially
4. **Admin Verification**: An admin may verify your link later (optional)
5. **Keep Updated**: When rider data syncs from the federation, your linked profile updates automatically

---

## Troubleshooting

### "No rider found with that FEI Registration number"
**Reason**: Your profile might not be in the database yet.

**Solutions**:
1. Check if you entered the correct FEI Registration number
2. Wait for the next sync (happens every 6 hours automatically)
3. Contact an admin to manually add your profile
4. Verify your FEI Registration number on your FEI rider card

### "Rider already linked to your account"
**Reason**: You've already linked this profile!

**Solution**:
- Scroll down to see your linked profiles
- Your profile is already there

### "You must be logged in"
**Reason**: Your session expired or you're not logged in.

**Solution**:
- Log in again
- Try linking again

### "Cannot find the Link Rider menu"
**Reason**: You might not be logged in.

**Solution**:
- The "Link Rider" menu only appears for logged-in users
- Log in first, then check the navigation menu

---

## Privacy & Security

✅ **Secure**: Only you can link to your own profile
✅ **Private**: Only you can see your linked profiles (plus admins)
✅ **Protected**: All data is secured with Row Level Security
✅ **Verified**: Admins can verify your link for extra security

---

## Benefits of Linking

Once linked, you can:
- ✅ View your complete rider profile
- ✅ Track your competition history
- ✅ Keep your information updated automatically
- ✅ Access personalized features (future updates)
- ✅ Receive notifications about your competitions

---

## Example

**Sarah wants to link her rider profile:**

1. Sarah logs in to the platform
2. She sees "Link Rider" in the menu and clicks it
3. She enters her FEI Registration: `10087654`
4. She clicks "Link Rider"
5. ✅ Success! Her profile appears:
   - Name: Sarah Johnson
   - Licence: EEF-SJR-0087654
   - Club: Dubai Equestrian Club
   - Country: UAE
6. Sarah can now see all her rider information on this page

---

## Need Help?

If you're having trouble:
1. Check your FEI Registration number is correct
2. Make sure you're logged in
3. Contact support or an admin
4. Check if the rider database has been synced recently

---

## For Admins

If you're an admin helping users:
1. Make sure the rider database is synced: `/admin/riders`
2. Users can link profiles themselves - no admin action needed
3. You can verify links later if needed (optional feature)
4. Check the database has the user's FEI Registration number
