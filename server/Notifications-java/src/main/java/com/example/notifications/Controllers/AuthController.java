package com.example.notifications.Controllers;

import com.example.notifications.DTO.LoginRequest;
import com.example.notifications.Entities.User;
import com.example.notifications.Services.UserService;
import com.example.notifications.jwt.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder; // הזרקת רכיב הצפנת הסיסמאות

    @PostMapping("/register")
    public User register(@Valid @RequestBody User user) {
        // ה-Service כעת מבצע הצפנת BCrypt לפני השמירה
        return userService.createUser(user);
    }

    @PostMapping("/login")
    public String login(@Valid @RequestBody LoginRequest loginRequest) {
        // 1. שליפת המשתמש המלא מבסיס הנתונים לפי האימייל
        User user = userService.getUserByEmail(loginRequest.getEmail());

        // 2. בדיקה: האם המשתמש קיים והאם הסיסמה שהזין תואמת לזו שמוצפנת ב-DB
        if (user != null && passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            // 3. במידה והכל תקין - יצירת טוקן JWT והחזרתו
            // שים לב: אנו מעבירים לטוקן את האימייל ואת התפקיד הקבוע "ROLE_USER"[cite: 2]
            return jwtUtil.generateToken(user.getEmail());
        } else {
            // במידה והאימות נכשל
            throw new RuntimeException("Invalid email or password");
        }
    }
}