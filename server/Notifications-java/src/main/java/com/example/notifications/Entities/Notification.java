package com.example.notifications.Entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Data
//שינוי 1
@Table(name = "notification", indexes = {
        @Index(name = "idx_sent_scheduled_time", columnList = "sent, scheduledTime, confirmed")
})
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "שיוך לתרופה הוא חובה")
    @ManyToOne
    @JoinColumn(name = "medication_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Medication medication;

    @NotNull(message = "שיוך למשתמש הוא חובה")
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @NotNull(message = "זמן ההתראה הוא שדה חובה")
    @Column(nullable = false)
    private LocalDateTime scheduledTime;

    @Column(nullable = false)
    @JsonProperty("isTake")
    private boolean isTake;

    private boolean sent = false;
    //שינוי
    private boolean confirmed = false;
}