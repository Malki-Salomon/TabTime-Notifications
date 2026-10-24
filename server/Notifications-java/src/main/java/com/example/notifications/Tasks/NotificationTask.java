package com.example.notifications.Tasks;

import com.example.notifications.Entities.Medication;
import com.example.notifications.Entities.MedicationSchedule;
import com.example.notifications.Entities.Notification;
import com.example.notifications.Repositories.MedicationScheduleRepository;
import com.example.notifications.Repositories.NotificationRepository;
import com.example.notifications.Services.MedicationService;
import com.example.notifications.Services.NotificationService;
import com.example.notifications.Services.WebPushService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor // מייצר בנאי לכל ה-final fields אוטומטית
public class NotificationTask {

    private final MedicationScheduleRepository scheduleRepository;

    private final NotificationRepository notificationRepository;

    private final NotificationService notificationService;

    private final MedicationService medicationService;

    private final WebPushService webPushService;



    // רץ בכל שעה עגולה יצירת התראה לטבלת התראות
    @Scheduled(cron = "0 */2 * * * *")
    public void generateHourlyNotifications() {
        LocalDateTime now = LocalDateTime.now();
        LocalTime currentTime = now.toLocalTime();
        LocalTime nextHour = currentTime.plusHours(1);
        LocalDate threeDaysFromNow = now.toLocalDate().plusDays(3);

        List<MedicationSchedule> allSchedules = scheduleRepository.findAll();

        for (MedicationSchedule schedule : allSchedules) {
            LocalTime scheduleTime = schedule.getTimeOfDay();

            // בדיקה האם השעה של הלו"ז היא בשעה הקרובה
            boolean isWithinNextHour = scheduleTime.isAfter(currentTime.minusMinutes(1))
                    && scheduleTime.isBefore(nextHour);

            if (isWithinNextHour) {
                Medication medication = schedule.getMedication();
                boolean shouldCreate = false;

                if (schedule.isTake()) {
                    shouldCreate = true;
                } else if (medication.getEndDate().isEqual(threeDaysFromNow)) {
                    shouldCreate = true;
                }

                if (shouldCreate) {
                    notificationService.createNotificationFromSchedule(schedule, now.toLocalDate());
                }
            }
        }
    }
    // 2. ניקוי יומי של תרופות שתוקפן פג (רץ בחצות)
   @Scheduled(cron = "0 0 0 * * *")
    public void runDailyCleanup() {
        System.out.println("Starting daily cleanup of expired medications...");
        medicationService.cleanupExpiredMedications();
        System.out.println("Cleanup finished.");
    }


    // רץ פעם בשעה (3,600,000 מילישניות)
    //מחיקת התראות מטבלת התראות
    @Scheduled(fixedDelay = 3600000)
    @Transactional
    public void cleanupOldData() {
        // הגדרת זמן חיתוך של שעה אחורה למניעת התנגשויות בזמן אמת
        LocalDateTime cutoff = LocalDateTime.now().minusHours(1);

        // 1. שלב הבדיקה: שליפת כל ההתראות שעומדות להימחק
        List<Notification> oldNotifications = notificationRepository.findOldNotifications(cutoff);

        for (Notification note : oldNotifications) {
            boolean shouldRemoveFromSchedule = false;

            // תנאי 1: התראה של סיום חבילה מוחקים שנשלחה מוחקים בכל מקרה)
            if (!note.isTake()) {
                shouldRemoveFromSchedule = true;
            }
            // תנאי 2: התראה על נטילת תרופה (isTake = true) והטיפול בתרופה מסתיים היום
            else if (note.getMedication() != null) {
                LocalDate endDate = note.getMedication().getEndDate();
                if (endDate != null && endDate.isEqual(LocalDate.now())) {
                    shouldRemoveFromSchedule = true;
                }
            }

            // אם אחד התנאים התקיים - מוחקים את השורה הספציפית מלוח הזמנים הקבוע
            if (shouldRemoveFromSchedule && note.getMedication() != null) {
                LocalTime scheduleTimeOnly = note.getScheduledTime().toLocalTime();
                scheduleRepository.deleteByMedicationIdAndTime(
                        note.getMedication().getId(),
                        scheduleTimeOnly
                );
            }
        }

        // 2. שלב המחיקה הסופית: מחיקת ההתראות עצמן מטבלת notification
        notificationRepository.deleteOld(cutoff);
    }

    @Scheduled(fixedDelay = 30000) // ריצה כל 30 שניות
    @Transactional
    public void sendUnsentNotifications() {
        LocalDateTime now = LocalDateTime.now();
        List<com.example.notifications.Entities.Notification> pending =
                notificationRepository.findPendingNotifications(now);

        for (com.example.notifications.Entities.Notification note : pending) {
            try {
                // ביצוע השליחה באמצעות פרטי המשתמש המקושרים
                webPushService.sendPush(note);

                // סימון כנשלח כדי שלא יישלח שוב בריצה הבאה
                note.setSent(true);
                notificationRepository.save(note);

                System.out.println("Notification sent successfully to user: " + note.getUser().getName());
            } catch (Exception e) {
                // במקרה של שגיאה, ההתראה תישאר sent=false ותנוסה שוב בריצה הבאה
                System.err.println("Error sending push for notification " + note.getId() + ": " + e.getMessage());
            }
        }
    }

}