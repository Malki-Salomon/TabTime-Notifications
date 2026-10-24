package com.example.notifications.Entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import jakarta.validation.constraints.NotBlank;

@Entity
@Data
public class Medication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "חובה לשייך תרופה למשתמש")
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @NotBlank(message = "שם התרופה אינו יכול להיות ריק")
    @Column(nullable = false)
    private String name;

    @Min(value = 1, message = "התדירות היומית חייב להיות לפחות 1")
    @Column(nullable = false)
    private int frequency;

    @NotBlank(message = "מינון התרופה אינו יכול להיות ריק")
    @Column(nullable = false)
    private String dosage;

    @NotNull(message = "חובה להזין תאריך סיום לטיפול")
    @FutureOrPresent(message = "תאריך הסיום לא יכול להיות בעבר")
    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private boolean fixedSchedule;

    private LocalDate createdAt = LocalDate.now();

    @OneToMany(mappedBy = "medication", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<MedicationSchedule> schedules;
}