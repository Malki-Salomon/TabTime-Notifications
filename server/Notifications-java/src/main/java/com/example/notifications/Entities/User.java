package com.example.notifications.Entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Entity
@Data
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "שם המשתמש הוא שדה חובה")
    @Size(min = 2, max = 50, message = "השם חייב להיות בין 2 ל-50 תווים")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "אימייל הוא שדה חובה")
    @Email(message = "פורמט אימייל לא תקין")
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank(message = "סיסמה היא שדה חובה")
    /* הסבר ה-Regex:
       (?=(.*[a-zA-Z]){4,}) - לפחות 4 אותיות (גדולות או קטנות)
       (?=(.*[0-9]){4,})    - לפחות 4 ספרות
       (?=.*[!@#$%^&*(),.?":{}|<>]) - לפחות תו מיוחד אחד
    */
    @Pattern(
            regexp = "^(?=(.*[a-zA-Z]){4,})(?=(.*[0-9]){4,})(?=.*[!@#$%^&*(),.?\":{}|<>]).*$",
            message = "הסיסמה חייבת להכיל לפחות 4 אותיות, 4 ספרות ותו מיוחד אחד"
    )
    @Size(min = 9, message = "הסיסמה חייבת להיות באורך של 9 תווים לפחות (4 אותיות + 4 ספרות + תו מיוחד)")    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String password;

    @NotBlank(message = "פרטי Push Endpoint חסרים")
    @Column(nullable = false)
    private String pushEndpoint;

    @NotBlank(message = "מפתח p256dh חסר")
    @Column(nullable = false)
    private String pushP256dh;

    @NotBlank(message = "מפתח Auth חסר")
    @Column(nullable = false)
    private String pushAuth;
}