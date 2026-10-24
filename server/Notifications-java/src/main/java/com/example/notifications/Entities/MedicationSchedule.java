package com.example.notifications.Entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalTime;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Data
public class MedicationSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "שיוך לתרופה הוא חובה")
    @ManyToOne
    @JoinColumn(name = "medication_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonBackReference
    private Medication medication;

    @NotNull(message = "שיוך למשתמש הוא חובה")
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @NotNull(message = "חובה להזין שעה לנטילה")
    @Column(nullable = false)
    private LocalTime timeOfDay;


    @Column(nullable = false)
    @JsonProperty("isTake") // שומר על תאימות מלאה לריאקט ששולח "isTake"
    private boolean take;
}