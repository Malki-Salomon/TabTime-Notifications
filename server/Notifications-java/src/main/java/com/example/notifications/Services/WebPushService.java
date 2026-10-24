package com.example.notifications.Services;

import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;


/**
 * שירות האחראי על ניהול ושליחת התראות דחיפה (Web Push) למשתמשי המערכת.
 * השירות משתמש בפרוטוקול VAPID לצורך אימות מול שרתי ה-Push של הדפדפנים.
 */
@Service
public class WebPushService {


    @Value("${vapid.public.key}")
    private String publicKey;

    @Value("${vapid.private.key}")
    private String privateKey;

    /**
     * שולח התראת דחיפה בזמן אמת למכשיר של המשתמש הרלוונטי.
     *
     * @param notificationEntity ישות המכילה את נתוני ההתראה, המשתמש והתרופה שיש ליטול.
     * @throws Exception במקרה של שגיאה ביצירת הקשר עם שרת ה-Push או בהצפנת המידע.
     */
    public void sendPush(com.example.notifications.Entities.Notification notificationEntity) throws Exception {
        // אתחול מנוע השליחה באמצעות מפתחות ה-VAPID
        PushService pushService = new PushService(publicKey, privateKey, "mailto:admin@example.com");

        // חילוץ פרטי המשתמש מההתראה
        var user = notificationEntity.getUser();
       // יצירת אובייקט מנוי (Subscription) המכיל את כתובת היעד ומפתחות ההצפנה הייחודיים של דפדפן המשתמש
        Subscription sub = new Subscription(
                user.getPushEndpoint(),
                new Subscription.Keys(user.getPushP256dh(), user.getPushAuth())
        );

        // יצירת תוכן ההודעה
        String message = "הגיע הזמן ליטול: " + notificationEntity.getMedication().getDosage()+" "+ notificationEntity.getMedication().getName() +" ";

     // בניית מחרוזת בפורמט JSON (Payload) המגדירה את המבנה שהדפדפן יקבל: כותרת, תוכן ומזהה ייחודי
        String payload = String.format("{\"title\": \"תזכורת תרופה\", \"body\": \"%s\", \"id\": %d}",
                message, notificationEntity.getId());
      // יצירת אובייקט ההתראה הסופי המשלב את יעד השליחה (sub) יחד עם התוכן המוצפן (payload)
        Notification n = new Notification(sub, payload);

        pushService.send(n);
    }
}