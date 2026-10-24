// Minimal service worker for web push subscription
self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("push", (event) => {
  let data = { title: "תזכורת תרופה", body: "הגיע הזמן לקחת את התרופה" };
  try { if (event.data) data = { ...data, ...event.data.json() }; } catch (_) {}
  // event.waitUntil(self.registration.showNotification(data.title, { body: data.body }));
  const options = {
    body: data.body,       // שימוש בתוכן הדינמי שפוענח מהשרת
    icon: '/logo192.png',  // נתיב לאייקון האפליקציה (בתיקיית public של הראקט)
    badge: '/logo192.png',
    
    // 🔥 מונע מההתראה להיעלם לבד – היא תישאר על המסך עד שהמשתמש יגיב
    requireInteraction: true, 
    
    // 🛠️ הוספת הכפתורים בתחתית ההתראה
    actions: [
      {
        action: 'confirm_take',
        title: '✅ אשר וסגור',
      }
    ],

    data: {
      notificationId: data.id // לוקח את ה-ID שהגיע מה-payload של השרת
    }
  };

  
  // הצגת ההתראה בפועל עם הכותרת הדינמית והאפשרויות שהגדרנו
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});


self.addEventListener('notificationclick', (event) => {
  // סוגר את ההתראה מהמסך של המשתמש מיד
  event.notification.close(); 

  // בדיקה האם הלחיצה הייתה על כפתור האישור שלנו
  if (event.action === 'confirm_take') {
    
    // שליפת ה-ID ששמרנו קודם לכן באובייקט ה-data
    const id = event.notification.data?.notificationId;

    if (id) {
      // ביצוע קריאת השרת ישירות מתוך ה-Service Worker!
      event.waitUntil(
        fetch(`http://localhost:8080/api/notifications/${id}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id: id,
    confirmed: true,
    sent: true
  })
})
.then(response => {
  // אם העדכון הצליח (200 OK) או שההתראה כבר נמחקה מהשרת (404) 
  // מבחינתנו הכל תקין והתהליך הסתיים בהצלחה, פשוט עוצרים כאן בלי להודיע כלום
  if (response.ok || response.status === 404) {
    return; 
  }
  
  // זורקים שגיאה ל-catch רק אם יש תקלה אמיתית בשרת (כמו שגיאה 500 או קריסה)
  throw new Error("תקלה בעדכון ההתראה מול ה-Backend");
})
.catch(error => {
  // שגיאות רשת אמיתיות (כמו שרת כבוי) עדיין ירשמו ללוג של הדפדפן לצרכי דיבאג
  console.error("שגיאת רשת ב-Service Worker:", error);
})
      );
    } else {
      console.error("לא נמצא מזהה (ID) עבור ההתראה הזו, לא ניתן לעדכן ב-DB.");
    }
  }
});



// // Minimal service worker for web push subscription
// self.addEventListener("install", (e) => self.skipWaiting());
// self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

// // 1. מאזין לקבלת ההתראה מהשרת
// self.addEventListener("push", (event) => {
//   let data = { title: "תזכורת תרופה", body: "הגיע הזמן לקחת את התרופה" };
  
//   try { 
//     if (event.data) data = { ...data, ...event.data.json() }; 
//   } catch (_) {
//     // אם הפיענוח נכשל (למשל בטקסט חופשי ב-DevTools), נשתמש בברירת המחדל
//   }

//   // הגדרות התצוגה המורחבות של ההתראה
//   const options = {
//     body: data.body, // לוקח את גוף ההודעה שפוענח מהשרת
//     icon: '/logo192.png', // ודא שיש לך קובץ כזה בתיקיית public, או שנה לנתיב הלוגו שלך
//     badge: '/logo192.png',
    
//     // 🔥 משאיר את ההתראה על המסך עד שהמשתמש מגיב לה
//     requireInteraction: true, 
    
//     // 🛠️ הוספת כפתורי הפעולה בתחתית ההתראה
//     actions: [
//       {
//         action: 'confirm_take',
//         title: '✅ אישור שנטלתי',
//       },
//       {
//         action: 'dismiss',
//         title: '❌ סגור',
//       }
//     ]
//   };

//   event.waitUntil(
//     self.registration.showNotification(data.title, options)
//   );
// });

// // 2. מאזין חדש: מטפל בלחיצות של המשתמש על ההתראה או על הכפתורים
// self.addEventListener('notificationclick', function(event) {
//   // סוגר את ההתראה מהמסך מיד בכל סוג של לחיצה
//   event.notification.close(); 

//   if (event.action === 'confirm_take') {
//     console.log('המשתמש לחץ על כפתור: אישור שנטלתי');
//     // כאן בעתיד תוכל להוסיף fetch כדי לעדכן את ה-DB שהתרופה נלקחה
//   } 
//   else if (event.action === 'dismiss') {
//     console.log('המשתמש לחץ על כפתור: סגור');
//   } 
//   else {
//     // לחיצה על גוף ההתראה עצמה (לא על הכפתורים) - פותח את האתר מחדש
//     event.waitUntil(
//       clients.openWindow('http://localhost:3000/dashboard')
//     );
//   }
// });
