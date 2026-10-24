package com.example.notifications.Services;
import com.example.notifications.Entities.MedicationSchedule;
import com.example.notifications.Exceptions.ConflictException;
import com.example.notifications.Exceptions.ResourceNotFoundException;
import com.example.notifications.Repositories.MedicationRepository;
import com.example.notifications.Entities.Medication;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class MedicationService {

    @Autowired
    private MedicationRepository medicationRepository;

//    public Medication createMedication(Medication newMedication)
//    {
//
//        // 1. חיפוש תרופה קיימת למשתמש הספציפי עם אותו שם
//        Optional<Medication> existingMedicationOpt = medicationRepository
//                .findByUserAndName(newMedication.getUser(), newMedication.getName());
//
//        if (existingMedicationOpt.isPresent())
//        {
//            Medication existingMedication = existingMedicationOpt.get();
//
//            // 2. בדיקה האם כל הנתונים זהים (מלבד התאריך)
//            // נבדוק את המינון (dosagePerDay) ואת סוג לוח הזמנים (fixedSchedule)
//            // שימוש ב-equals לצורך השוואת מחרוזות (dosage) ובדוק את ה-frequency החדש
//            if (existingMedication.getDosage().equals(newMedication.getDosage()) &&
//                    existingMedication.getFrequency() == newMedication.getFrequency() &&
//                    existingMedication.isFixedSchedule() == newMedication.isFixedSchedule())
//            {
//                // עדכון התאריך בלבד ושמירה
//                existingMedication.setEndDate(newMedication.getEndDate());
//                existingMedication.setCreatedAt(LocalDate.now()); // מעדכן לתאריך הנוכחי
//                return medicationRepository.save(existingMedication);
//            }
//        }
//
//        // 3. אם לא נמצאה תרופה או שהנתונים האחרים שונים - יצירת תרופה חדשה
//        return medicationRepository.save(newMedication);
//    }
@Transactional
public Medication createMedication(Medication newMedication) {

    // קישור דו-כיווני ראשוני עבור המקרה של יצירה חדשה
    if (newMedication.getSchedules() != null) {
        for (MedicationSchedule schedule : newMedication.getSchedules()) {
            schedule.setMedication(newMedication);
        }
    }

    // חיפוש תרופה קיימת
    Optional<Medication> existingMedicationOpt = medicationRepository
            .findByUserAndName(newMedication.getUser(), newMedication.getName());

    if (existingMedicationOpt.isPresent()) {
        Medication existingMedication = existingMedicationOpt.get();

        // השוואה בטוחה של הנתונים
        if (Objects.equals(existingMedication.getDosage(), newMedication.getDosage()) &&
                existingMedication.getFrequency() == newMedication.getFrequency() &&
                existingMedication.isFixedSchedule() == newMedication.isFixedSchedule()) {

            // עדכון שדות התרופה
            existingMedication.setEndDate(newMedication.getEndDate());
            existingMedication.setCreatedAt(LocalDate.now());

            // גירסה סופר יעילה: עדכון ערכי השעות הקיימות במקום מחיקה והוספה
            if (newMedication.getSchedules() != null && !newMedication.getSchedules().isEmpty()) {
                List<MedicationSchedule> existingSchedules = existingMedication.getSchedules();
                List<MedicationSchedule> newSchedules = newMedication.getSchedules();

                // כיוון שה-frequency זהה, כמות השעות זהה לחלוטין. נעדכן לפי אינדקס.
                for (int i = 0; i < newSchedules.size(); i++) {
                    if (i < existingSchedules.size()) {
                        // מעדכנים רק את השעה של הרשומה הקיימת ב-DB!
                        existingSchedules.get(i).setTimeOfDay(newSchedules.get(i).getTimeOfDay());
                        existingSchedules.get(i).setTake(newSchedules.get(i).isTake());
                    }
                }
            }

            // בזכות ה-Transactional, Hibernate יריץ פקודות UPDATE בלבד (0 פקודות DELETE/INSERT!)
            return medicationRepository.save(existingMedication);
        }
    }

    return medicationRepository.save(newMedication);
}
    public List<Medication> getAllMedications() {
        return medicationRepository.findAll();
    }

    public Medication getMedicationById(Long id) {
        return medicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medication not found"));
    }

    public List<Medication> getMedicationsByUserId(Long userId) {
        List<Medication> medications = medicationRepository.findByUser_Id(userId);

//        if (medications.isEmpty()) {
//            throw new ResourceNotFoundException("No medications found for user id: " + userId);        }

        return medications;
    }

    @Transactional
    public Medication updateMedication(Long id, Medication updatedMedication) {
        // 1. שליפת התרופה הקיימת מה-DB לפי ה-ID שלה
        Medication existingMedication = getMedicationById(id);

        // 2. עדכון השדות הבסיסיים של התרופה
        existingMedication.setName(updatedMedication.getName());
        existingMedication.setDosage(updatedMedication.getDosage());
        existingMedication.setFrequency(updatedMedication.getFrequency());
        existingMedication.setEndDate(updatedMedication.getEndDate());
        existingMedication.setFixedSchedule(updatedMedication.isFixedSchedule());
        existingMedication.setCreatedAt(LocalDate.now());

        // 3. עדכון זמני הנטילה באמצעות הלולאה היעילה (לפי אינדקסים)
        if (updatedMedication.getSchedules() != null && !updatedMedication.getSchedules().isEmpty()) {
            List<MedicationSchedule> existingSchedules = existingMedication.getSchedules();
            List<MedicationSchedule> newSchedules = updatedMedication.getSchedules();

            // כאן בדיוק נכנסת הלולאה שמבצעת UPDATE בלבד ב-DB ללא מחיקות מיותרות!
            for (int i = 0; i < newSchedules.size(); i++) {
                if (i < existingSchedules.size()) {
                    existingSchedules.get(i).setTimeOfDay(newSchedules.get(i).getTimeOfDay());

                    // שימוש ב-setTake ו-isTake המעודכנים של אופציה א'
                    existingSchedules.get(i).setTake(newSchedules.get(i).isTake());
                }
            }
        }

        // 4. שמירה סופית של הישות המעודכנת
        return medicationRepository.save(existingMedication);
    }

//@Transactional
//public Medication updateMedication(Long id, Medication updatedMedication) {
//    Medication existingMedication = getMedicationById(id);
//
//    // עדכון שדות בסיסיים
//    existingMedication.setName(updatedMedication.getName());
//    existingMedication.setDosage(updatedMedication.getDosage());
//    existingMedication.setFrequency(updatedMedication.getFrequency());
//    existingMedication.setEndDate(updatedMedication.getEndDate());
//    existingMedication.setFixedSchedule(updatedMedication.isFixedSchedule());
//
//    // פתרון הבעיה השנייה: עדכון מערך השעות בעת עריכה רגילה
//    if (updatedMedication.getSchedules() != null) {
//        // בזכות orphanRemoval = true, ניקוי הרשימה ימחק את השורות הישנות מה-DB
//        existingMedication.getSchedules().clear();
//
//        for (MedicationSchedule schedule : updatedMedication.getSchedules()) {
//            schedule.setMedication(existingMedication); // חובה לקשר את התרופה לכל שעה
//            existingMedication.getSchedules().add(schedule);
//        }
//    } else {
//        existingMedication.getSchedules().clear();
//    }
//
//    return medicationRepository.save(existingMedication);
//}
    public void deleteMedication(Long id) {

        if (!medicationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cannot delete: Medication not found with id: " + id);
        }
        medicationRepository.deleteById(id);
    }
    @Transactional
    public void cleanupExpiredMedications() {
        // מחיקת כל התרופות שתאריך הסיום שלהן עבר (קטן מהיום)
        LocalDate today = LocalDate.now();
        medicationRepository.deleteByEndDateBefore(today);
    }
}
