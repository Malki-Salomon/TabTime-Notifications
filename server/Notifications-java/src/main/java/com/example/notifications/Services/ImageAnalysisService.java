

//
//
//package com.example.notifications.Services;
//
//import com.example.notifications.DTO.AnalyzedMedicationDTO;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.http.MediaType;
//import org.springframework.http.client.MultipartBodyBuilder;
//import org.springframework.stereotype.Service;
//import org.springframework.web.multipart.MultipartFile;
//import org.springframework.web.reactive.function.BodyInserters;
//import org.springframework.web.reactive.function.client.WebClient;
//import org.springframework.web.reactive.function.client.WebClientResponseException;
//
//import java.time.LocalDate;
//import java.time.format.DateTimeFormatter;
//
//@Service
//public class ImageAnalysisService {
//    private final WebClient webClient;
//
//    public ImageAnalysisService(@Value("${python.ocr.url:http://127.0.0.1:5000}") String pythonUrl) {
//        this.webClient = WebClient.builder()
//                .baseUrl(pythonUrl)
//                .build();
//    }
//
//    public AnalyzedMedicationDTO analyzeMedicationImage(MultipartFile file) {
//        System.out.println("i come to java");
//
//        // בניית גוף הבקשה כ-Multipart
//        MultipartBodyBuilder builder = new MultipartBodyBuilder();
//        builder.part("file", file.getResource())
//                .filename(file.getOriginalFilename());
//
//        try {
//            // ביצוע הפנייה לשרת הפייתון לנקודת הקצה /extract-label שהגדרת בפייתון
//            AnalyzedMedicationDTO dto = webClient.post()
//                    .uri("/extract-label")
//                    .contentType(MediaType.MULTIPART_FORM_DATA)
//                    .body(BodyInserters.fromMultipartData(builder.build()))
//                    .retrieve()
//                    .bodyToMono(AnalyzedMedicationDTO.class)
//                    .block(); // קריאה סינכרונית חוסמת שממתינה לתשובת ה-AI
//
//            // חישוב והשמת תאריך הסיום (endDate) בתוך ה-DTO במידה והנתונים חזרו
//            if (dto != null) {
//                calculateAndSetEndDate(dto);
//            }
//
//            return dto;
//
//        } catch (WebClientResponseException e) {
//            // שרת הפייתון החזיר קוד שגיאה (למשל 400 או 500) - נזרוק שגיאה עם הפירוט
//            throw new IllegalArgumentException("שגיאה בעיבוד התמונה בשרת ה-AI: " + e.getResponseBodyAsString());
//        } catch (Exception e) {
//            // שרת הפייתון כבוי או שיש בעיית רשת/חיבור
//            throw new IllegalStateException("שרת פענוח התמונות אינו זמין כרגע, אנא נסה שוב מאוחר יותר.");
//        }
//    }
package com.example.notifications.Services;

import com.example.notifications.DTO.AnalyzedMedicationDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.core.io.ByteArrayResource;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class ImageAnalysisService {
    private final WebClient webClient;

    // שימוש מפורש ב-127.0.0.1 כדי לעקוף בעיות IPv6 ב-Windows
    public ImageAnalysisService(@Value("${python.ocr.url:http://127.0.0.1:5000}") String pythonUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(pythonUrl)
                .build();
    }

    public AnalyzedMedicationDTO analyzeMedicationImage(MultipartFile file) {
        System.out.println("i come to java");

        try {
            // 1. בניית גוף הבקשה כ-Multipart
            MultipartBodyBuilder builder = new MultipartBodyBuilder();

            // 2. שימוש מובנה ב-Resource של הקובץ - שומר אוטומטית על השם המקורי וסוג הקובץ
            builder.part("file", file.getResource());

            // 3. ביצוע הפנייה לשרת הפייתון
            AnalyzedMedicationDTO dto = webClient.post()
                    .uri("/extract-label")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .bodyToMono(AnalyzedMedicationDTO.class)
                    .block(); // קריאה סינכרונית חוסמת

            if (dto != null) {
                calculateAndSetEndDate(dto);
            }

            return dto;

        } catch (WebClientResponseException e) {
            System.err.println("Python returned error: " + e.getResponseBodyAsString());
            throw new IllegalArgumentException("שגיאה בעיבוד התמונה בשרת ה-AI: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            System.err.println("Internal Java error in Service:");
            e.printStackTrace(); // מדפיס את השגיאה הפנימית של ג'אווה לקונסול
            throw new IllegalStateException("שרת פענוח התמונות אינו זמין כרגע, אנא נסה שוב מאוחר יותר.");
        }
    }

    /**
     * פונקציית עזר המפרסרת את תאריך ההנפקה ומחשבת את תאריך הסיום (תאריך הנפקה + משך ימים)
     */
//    private void calculateAndSetEndDate(AnalyzedMedicationDTO dto) {
//        try {
//            // 1. ניקוי מחרוזת התאריך מתווים שאינם מספרים או מפרידים (למשל אם השתרבבו אותיות מה-OCR)
//            String rawDate = dto.getIssueDateRaw().replaceAll("[^0-9/.-]", "").strip();
//
//            // 2. החלפת נקודות ומקפים בסלאשים לטובת פורמט אחיד (d/M/yyyy)
//            rawDate = rawDate.replace(".", "/").replace("-", "/");
//
//            // 3. יצירת פורמטר גמיש שתומך בימים וחודשים עם ספרה אחת או שתיים (למשל 1/5/2026 או 12/05/2026)
//            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("d/M/yyyy");
//            LocalDate issueDate = LocalDate.parse(rawDate, formatter);
//
//            // 4. חישוב תאריך הסיום: תאריך ההנפקה ועוד כמות הימים שהפייתון שלח
//            LocalDate calculatedEndDate = issueDate.plusDays(dto.getDuration());
//
//            // 5. שמירת התוצאה בשדה הסופי ב-DTO
//            dto.setEndDate(calculatedEndDate);
//
//        }
//        catch (Exception e) {
//            // שכבת הגנה: במידה והתאריך שחזר מה-OCR משובש לחלוטין ולא ניתן לפרסור,
//            // המערכת לא תתרסק אלא תקבע את תאריך הסיום כברירת מחדל: תאריך היום + כמות ימי הטיפול.
//            System.err.println("שגיאה בפרסור תאריך מה-OCR, משתמש בתאריך הנוכחי כגיבוי: " + e.getMessage());
//            int days = dto.getDuration() > 0 ? dto.getDuration() : 7;
//            dto.setEndDate(LocalDate.now().plusDays(days));
//        }
//    }
    private void calculateAndSetEndDate(AnalyzedMedicationDTO dto) {
        System.out.println(">>> SERVICE: Starting date calculation...");

        // הגנה 1: בדיקה אם תאריך ההנפקה קיים
        if (dto.getIssueDateRaw() == null || dto.getIssueDateRaw().trim().isEmpty()) {
            System.err.println(">>> SERVICE WARNING: issue_date is missing. Skipping calculation.");
            return;
        }

        // הגנה 2: בדיקה אם משך הזמן (duration) קיים
        if (dto.getDuration() == null) {
            System.err.println(">>> SERVICE WARNING: duration is missing (null). Setting duration to 0.");
            dto.setDuration(0);
        }

        try {
            String rawDate = dto.getIssueDateRaw().trim();
            System.out.println(">>> SERVICE: Parsing raw date from Python: '" + rawDate + "'");

            LocalDate issueDate = null;

            if (rawDate.contains("-")) {
                issueDate = LocalDate.parse(rawDate);
            } else if (rawDate.contains("/")) {
                String[] parts = rawDate.split("/");
                String yearPart = parts[parts.length - 1];

                java.time.format.DateTimeFormatter formatter;
                if (yearPart.length() == 2) {
                    formatter = java.time.format.DateTimeFormatter.ofPattern("d/M/yy");
                } else {
                    formatter = java.time.format.DateTimeFormatter.ofPattern("d/M/yyyy");
                }

                issueDate = LocalDate.parse(rawDate, formatter);
            } else {
                throw new IllegalArgumentException("Unknown date format: " + rawDate);
            }

            // חישוב תאריך הסיום (duration הוא כעת Integer, והפעולה עובדת חלק)
            LocalDate endDate = issueDate.plusDays(dto.getDuration());
            dto.setEndDate(endDate);

            System.out.println(">>> SERVICE: Date calculated successfully. End Date: " + endDate);

        } catch (Exception e) {
            System.err.println(">>> SERVICE CRITICAL WARNING: Date calculation failed! Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}