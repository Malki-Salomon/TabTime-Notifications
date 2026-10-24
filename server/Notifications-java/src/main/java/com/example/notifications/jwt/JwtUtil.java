package com.example.notifications.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * רכיב (Component) לניהול אסימוני JWT (JSON Web Tokens).
 * מחלקה זו אחראית על יצירת מפתח הצפנה, הנפקת אסימונים מאובטחים למשתמשים,
 * ופענוח/אימות האסימונים המתקבלים מהלקוח.
 */
@Component
public class JwtUtil {
    // יצירת מפתח הצפנה מאובטח
    SecretKey key = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    /**
     * מנפיק ומייצר אסימון JWT חתום עבור משתמש נתון.
     *
     * @param username שם המשתמש עבורו מונפק האסימון
     * @return מחרוזת ה-JWT המוצפנת והחתומה
     */

    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", "ROLE_USER") // הגדרת תפקיד קבוע למשתמש היחיד
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // תוקף ל-10 שעות
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * מפענח אסימון JWT, מאמת את תוקפו וחתימתו, ומחלץ את הנתונים השמורים בו.
     *
     * @param token מחרוזת האסימון שהתקבלה מהלקוח
     * @return אובייקט Claims המכיל את המידע וההרשאות של האסימון
     * @throws io.jsonwebtoken.JwtException אם האסימון פג תוקף, שונה או אינו תקין
     */
    public Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key) // הגדרת המפתח הסודי לאימות החתימה
                .build()
                .parseClaimsJws(token)// פענוח ואימות של מחרוזת ה-JWT
                .getBody();// שליפת גוף האסימון המכיל את הנתונים
    }
}
