# 🏠 משימות הבית — PWA

אפליקציית משימות ביתיות משותפת עם התחברות Google וסנכרון בזמן אמת.

## תכונות

- ✅ התחברות עם חשבון Google
- 👥 משק בית משותף — הזמנה עם קוד ייחודי
- 🔄 סנכרון בזמן אמת בין כל המשתמשים
- 👤 שיוך משימות לחבר ספציפי + סינון "שלי"
- 🔴 סימון דחיפות (דחוף / בינוני / רגיל)
- 📁 קטגוריות (מטבח, ניקיון, גינה, קניות...)
- ⭐ תיוג "להיום"
- ↕️ Drag & Drop לשינוי סדר (נשמר ב-Firestore)
- 🔍 חיפוש + פילטרים (קטגוריה, דחיפות, יום, תדירות, שיוך)
- 📊 תצוגת Kanban עם תפריט פעולות
- 📅 שיוך לימים בשבוע + קיצור "כל הימים"
- 🔄 תדירות למשימות חוזרות
- 🗑️ מחיקה עם Undo (5 שניות לבטל)
- 🌙 Dark Mode אוטומטי (לפי הגדרת המערכת)
- 📡 זיהוי מצב offline עם באנר
- 🔒 הגנת XSS — כל הקלט עובר escaping
- 💾 PWA — ניתן להתקנה על מסך הבית

---

## הגדרת Firebase (חד-פעמי)

### 1. צור פרויקט Firebase

1. היכנס ל-[Firebase Console](https://console.firebase.google.com)
2. לחץ **Add project** → תן שם (למשל `household-tasks`) → **Create Project**

### 2. הפעל Authentication

1. בתפריט הצד: **Authentication** → **Get started**
2. בטאב **Sign-in method** → לחץ **Google** → הפעל → בחר Support email → **Save**

### 3. צור Firestore Database

1. בתפריט הצד: **Firestore Database** → **Create database**
2. בחר **Start in production mode** → בחר region קרוב (למשל `europe-west3`) → **Create**
3. בטאב **Rules** החלף את התוכן ב:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users: each user reads/writes only their own doc
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Households
    match /households/{householdId} {

      // Only members can read their household
      allow read: if request.auth != null
        && request.auth.uid in resource.data.members.map(m, m.uid);

      // Any authenticated user can create a household
      allow create: if request.auth != null
        && request.resource.data.keys().hasAll(['name', 'inviteCode', 'createdBy', 'members'])
        && request.resource.data.name is string
        && request.resource.data.name.size() <= 50
        && request.resource.data.inviteCode is string
        && request.resource.data.members.size() >= 1;

      // Only members can update
      allow update: if request.auth != null
        && request.auth.uid in resource.data.members.map(m, m.uid);

      // Only creator can delete
      allow delete: if request.auth != null
        && request.auth.uid == resource.data.createdBy;

      // Tasks subcollection: only household members
      match /tasks/{taskId} {
        allow read, write: if request.auth != null
          && request.auth.uid in get(/databases/$(database)/documents/households/$(householdId)).data.members.map(m, m.uid);
      }
    }

    // Allow reading households by invite code (for joining)
    // This is handled by the query + the general read rule above.
    // New members join via the client updating the members array,
    // which requires existing member permission. To allow joining,
    // we add a special rule: anyone can update IF they are only
    // adding themselves to members.
  }
}
```

> **הערה חשובה**: ה-rules למעלה מגבילים read רק לחברי המשק.
> כדי שתהליך ההצטרפות (join) יעבוד, צריך להוסיף rule שמאפשר query לפי inviteCode.
> אפשרות פשוטה: צור Cloud Function `joinHousehold` שעושה את ה-query בצד שרת.
> לחלופין, שמור את הקודים ב-collection נפרד `inviteCodes/{code}` עם `householdId` בלבד,
> שפתוח ל-read לכל authenticated user, ואז ה-join יהיה דרכו.

4. לחץ **Publish**

### 4. רשום Web App

1. בדף הראשי של הפרויקט → לחץ על אייקון **</>** (Web)
2. תן שם (למשל `household-tasks-web`) → **Register app**
3. העתק את ה-`firebaseConfig` שמופיע

### 5. הכנס את ההגדרות לקוד

פתח את `index.html` ומצא את הבלוק הבא (חפש `YOUR_API_KEY`):

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

החלף את הערכים בערכים שקיבלת מ-Firebase.

### 6. הוסף Authorized Domain

1. ב-Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. הוסף: `YOUR_USERNAME.github.io`

---

## העלאה ל-GitHub Pages

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/household-tasks.git
git push -u origin main
```

1. **Settings** → **Pages** → **Source**: Deploy from branch → **main** → **/ (root)** → **Save**
2. תוך דקה-שתיים: `https://YOUR_USERNAME.github.io/household-tasks/`

---

## התקנה כ-PWA

### אייפון (Safari):
1. פתח ב-Safari → כפתור שיתוף (⬆️) → **"הוסף למסך הבית"**

### אנדרואיד (Chrome):
1. פתח ב-Chrome → שלוש נקודות (⋮) → **"Add to Home screen"** / **"התקן אפליקציה"**

---

## מבנה Firestore

```
users/{uid}
  └── householdId: string

households/{householdId}
  ├── name: string
  ├── inviteCode: string (unique)
  ├── createdBy: string (uid)
  ├── members: [{uid, displayName, photoURL, email}]
  └── tasks/{taskId}
       ├── title, category, urgency, status, order
       ├── recurrence, nextDate, days[]
       ├── isToday, assignedTo (uid)
       ├── createdAt, completedAt
       └── createdBy, createdByName
```
