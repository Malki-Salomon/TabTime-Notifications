package com.example.notifications.Repositories;

import com.example.notifications.Entities.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.repository.query.Param;
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // שליפת התראות שעומדות להימחק כדי לבדוק את לוגיקת הלו"ז
    @Query("SELECT n FROM Notification n WHERE n.scheduledTime <= :time AND (n.confirmed = true OR n.sent = true)")
    List<Notification> findOldNotifications(@Param("time") LocalDateTime time);

    @Modifying
    @Transactional
    @Query("DELETE FROM Notification n " +
            "WHERE n.confirmed = true " +
            "OR (n.sent = true AND n.confirmed = false AND n.scheduledTime <= :time)")
    void deleteOld(@Param("time") LocalDateTime time);

    @Query("SELECT n FROM Notification n JOIN FETCH n.user WHERE n.sent = false AND n.scheduledTime <= :now")
    List<Notification> findPendingNotifications(@Param("now") LocalDateTime now);
}
