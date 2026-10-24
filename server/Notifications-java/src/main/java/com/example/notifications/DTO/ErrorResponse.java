package com.example.notifications.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ErrorResponse {
    private int status;      // קוד HTTP (למשל 404)
    private String message;   // הודעה בעברית/אנגלית למשתמש
    private long timestamp;   // מתי זה קרה
}