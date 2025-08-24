# Final Appwrite Setup Instructions

Hello! It looks like my messages aren't getting through correctly. This file contains the final steps needed to get your PeerSpark application working perfectly.

The errors you are seeing in your browser console are all caused by the Appwrite backend configuration not yet matching the application code. Here are the two manual steps you need to take in your Appwrite dashboard to fix all the remaining issues.

---

### **Step 1: Fix `401 Unauthorized` Errors**

This error happens because your Appwrite project doesn't recognize your Vercel URL as a trusted source.

1.  Go to your Appwrite project dashboard at **cloud.appwrite.io**.
2.  In the left sidebar, click on **Auth**.
3.  Click the **Settings** tab at the top.
4.  Scroll down to the **Hostnames** section.
5.  In the input field, type your Vercel app's domain (e.g., `peerspark-gl.vercel.app`) and click the **Add Hostname** button.

This will fix the `401 Unauthorized` errors.

---

### **Step 2: Fix `Unknown attribute: "plan"` Error**

This error happens during registration because the code is trying to assign a `plan` to a new user, but the attribute doesn't exist in your database yet.

1.  In your Appwrite project, go to the **Databases** section in the left sidebar.
2.  Click on your database (named `peerspark-main-db`).
3.  Click on your `users` collection.
4.  Click on the **Attributes** tab.
5.  Click the **Create attribute** button.
6.  For the **Key**, enter `plan`.
7.  For the **Type**, choose `String`.
8.  For the **Size**, enter `50`.
9.  For the **Default value**, enter `free`.
10. Click **Create**.

---

After you complete these two steps, the registration and login errors will be resolved. The application code is correct and is just waiting for this backend configuration. Thank you for your patience.
