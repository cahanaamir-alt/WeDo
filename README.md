# 🏠 משימות הבית — PWA

אפליקציית משימות ביתיות משותפת עם התחברות Google וסנכרון בזמן אמת.

## תכונות

- ✅ התחברות עם חשבון Google
- 👥 משק בית משותף — הזמנה עם קוד
- 🔄 סנכרון בזמן אמת בין כל המשתמשים
- 🔴 סימון דחיפות (דחוף / בינוני / רגיל)
- 📁 קטגוריות (מטבח, ניקיון, גינה, קניות...)
- ⭐ תיוג "להיום"
- ↕️ Drag & Drop לשינוי סדר
- 🔍 חיפוש ופילטרים
- 📊 תצוגת Kanban
- 📅 שיוך לימים בשבוע
- 🔄 תדירות למשימות חוזרות
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
    // Users: each user can read/write their own doc
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Households: members can read/write
    match /households/{householdId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null
        && request.auth.uid in resource.data.members.map(m, m.uid);

      // Tasks: household members can read/write
      match /tasks/{taskId} {
        allow read, write: if request.auth != null
          && request.auth.uid in get(/databases/$(database)/documents/households/$(householdId)).data.members.map(m, m.uid);
      }
    }
  }
}
```

4. לחץ **Publish**

### 4. רשום Web App

1. בדף הראשי של הפרויקט → לחץ על אייקון **</>** (Web)
2. תן שם (למשל `household-tasks-web`) → **Register app**
3. העתק את ה-`firebaseConfig` שמופיע

### 5. הכנס את ההגדרות לקוד

פתח את `index.html` ומצא את הבלוק הבא (שורה ~בערך 260):

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
# צור repo חדש ב-GitHub בשם household-tasks
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/household-tasks.git
git push -u origin main
```

1. היכנס ל-**Settings** של ה-repo → **Pages**
2. תחת **Source** בחר **Deploy from a branch** → **main** → **/ (root)** → **Save**
3. תוך דקה-שתיים, האפליקציה תהיה זמינה ב:
   `https://YOUR_USERNAME.github.io/household-tasks/`

---

## התקנה כ-PWA על הטלפון

### אייפון (Safari):
1. פתח את הקישור ב-Safari
2. לחץ על כפתור השיתוף (⬆️)
3. בחר **"הוסף למסך הבית"**

### אנדרואיד (Chrome):
1. פתח את הקישור ב-Chrome
2. לחץ על שלוש הנקודות (⋮) למעלה
3. בחר **"Add to Home screen"** / **"התקן אפליקציה"**

---

## מבנה הקבצים

```
household-tasks/
├── index.html       ← האפליקציה (הכל בקובץ אחד)
├── manifest.json    ← הגדרות PWA
├── sw.js            ← Service Worker לעבודה אופליין
└── README.md        ← המדריך הזה
```

## מבנה Firestore

```
users/{uid}
  └── householdId: string

households/{householdId}
  ├── name: string
  ├── inviteCode: string
  ├── createdBy: string (uid)
  ├── members: [{uid, displayName, photoURL, email}]
  └── tasks/{taskId}
       ├── title, category, urgency, status
       ├── recurrence, nextDate, days
       ├── isToday, createdAt, completedAt
       └── createdBy, createdByName
```
