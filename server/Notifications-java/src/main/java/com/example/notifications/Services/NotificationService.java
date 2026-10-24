



package com.example.notifications.Services;

import com.example.notifications.Entities.MedicationSchedule;
import com.example.notifications.Entities.Notification;
import com.example.notifications.Exceptions.ResourceNotFoundException;
import com.example.notifications.Repositories.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    /**
     * יוצר התראה חדשה על בסיס לוח זמנים קיים.
     * מסומן כ-Transactional כי הוא מבצע כתיבה למסד הנתונים.
     */
    @Transactional
    public void createNotificationFromSchedule(MedicationSchedule schedule, LocalDate date) {
        LocalDateTime scheduledTime = LocalDateTime.of(date, schedule.getTimeOfDay());

        Notification notification = new Notification();
        notification.setUser(schedule.getUser());
        notification.setMedication(schedule.getMedication());
        notification.setScheduledTime(scheduledTime);
        notification.setSent(false); // ברירת מחדל להתראה חדשה

        notificationRepository.save(notification);
    }
//    public Notification createNotification(Notification notification) {
//        return notificationRepository.save(notification);
//    }
    /**
     * מחזיר את כל ההתראות הקיימות.
     * שימוש ב-readOnly=true לשיפור ביצועים כיוון שזו פעולת קריאה בלבד.
     */
    @Transactional(readOnly = true)
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    /**
     * שליפת התראה ספציפית לפי מזהה.
     */
    @Transactional(readOnly = true)
    public Notification getNotificationById(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
    }

    /**
     * עדכון פרטי התראה קיימת.
     */
    @Transactional
    public Notification updateNotification(Long id, Notification updatedNotification) {
        Notification existingNotification = getNotificationById(id);

        existingNotification.setScheduledTime(updatedNotification.getScheduledTime());
        existingNotification.setSent(updatedNotification.isSent());

        return notificationRepository.save(existingNotification);
    }

    /**
     * מחיקת התראות ישנות מהמסד (כאלו שנשלחו או שעבר זמנן).
     */
    @Transactional
    public void deleteOldNotifications() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(1);
        notificationRepository.deleteOld(cutoff);
    }

    /**
     * מחיקת התראה ספציפית לפי מזהה.
     */
    @Transactional
    public void deleteNotification(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Notification not found");
        }
        notificationRepository.deleteById(id);
    }
}