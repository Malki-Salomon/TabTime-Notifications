package com.example.notifications.Controllers;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.notifications.Entities.Notification;
import com.example.notifications.Services.NotificationService;
import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

//    @PostMapping
//    public Notification createNotification(@RequestBody Notification notification) {
//        return notificationService.createNotification(notification);
//    }

    @GetMapping
    public List<Notification> getAllNotifications() {
        return notificationService.getAllNotifications();
    }

//    @GetMapping("/{id}")
//    public Notification getNotificationById(@PathVariable Long id) {
//        return notificationService.getNotificationById(id);
//    }

    @PutMapping("/{id}")
    public Notification updateNotification(@PathVariable Long id,@Valid @RequestBody Notification notification) {
        return notificationService.updateNotification(id, notification);
    }

    @DeleteMapping
    public void cleanupNotifications() {
        notificationService.deleteOldNotifications();
    }

//    @DeleteMapping("/{id}")
//    public void deleteNotification(@PathVariable Long id) {
//        notificationService.deleteNotification(id);
//    }
}