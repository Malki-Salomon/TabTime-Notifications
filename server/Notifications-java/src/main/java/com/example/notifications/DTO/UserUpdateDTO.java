package com.example.notifications.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserUpdateDTO {

    @NotBlank(message = "שם המשתמש הוא שדה חובה")
    @Size(min = 2, max = 50, message = "השם חייב להיות בין 2 ל-50 תווים")
    private String name;

    @NotBlank(message = "אימייל הוא שדה חובה")
    @Email(message = "פורמט אימייל לא תקין")
    private String email;

    // שדות ה-Push יכולים להיות null במידה והמשתמש לא מעדכן מכשיר,
    // לכן לא נשים עליהם @NotBlank קשיח אם הם לא חובה בכל עדכון פרופיל
    private String pushEndpoint;
    private String pushP256dh;
    private String pushAuth;
}