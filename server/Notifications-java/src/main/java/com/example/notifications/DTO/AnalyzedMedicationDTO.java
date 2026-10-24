package com.example.notifications.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.time.LocalDate;

@Data
public class AnalyzedMedicationDTO {

    // מיפוי medicine_name מהפייתון לתוך name בג'אווה
    @JsonProperty("medicine_name")
    private String name;

    // הפייתון מחזיר מחרוזת (לדוגמה: "2 טבליות")
    @JsonProperty("dosage")
    private String dosage;

    // הפייתון מחזיר מספר נקי (int)
    @JsonProperty("frequency")
    private int frequency;

    // שדה לקליטת תאריך ההנפקה מהפייתון לצורך החישוב
    @JsonProperty("issue_date")
    private String issueDateRaw;

    // שדה לקליטת מספר ימי הטיפול מהפייתון לצורך החישוב
    @JsonProperty("duration")
    private Integer duration;

    // השדה הסופי שיחושב בג'אווה (לא מקבל @JsonProperty כי הוא מחושב פנימית)
    private LocalDate endDate;
}