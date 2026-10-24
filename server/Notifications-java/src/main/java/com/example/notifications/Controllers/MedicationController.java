package com.example.notifications.Controllers;

import com.example.notifications.DTO.AnalyzedMedicationDTO;
import com.example.notifications.Services.ImageAnalysisService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.notifications.Entities.Medication;
import com.example.notifications.Services.MedicationService;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/medications")
public class MedicationController {

    @Autowired
    private MedicationService medicationService;
    @Autowired
    private ImageAnalysisService imageAnalysisService;



    @PostMapping("/analyze-image")
    public ResponseEntity<?> analyzeImage(@RequestParam(value = "file", required = false) MultipartFile file) {
        // 1. הדפסת בדיקה - האם הבקשה בכלל נכנסה לקונטרולר?
        System.out.println(">>> CONTROLLER: Received a request to /analyze-image");

        if (file == null) {
            System.err.println(">>> CONTROLLER ERROR: MultipartFile 'file' is NULL! check React FormData name.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("הקובץ לא התקבל בשרת הג'אווה. ודא ששם השדה ב-FormData בריאקט הוא 'file'.");
        }

        if (file.isEmpty()) {
            System.err.println(">>> CONTROLLER ERROR: File was received but it is EMPTY.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("הקובץ שהועלה ריק.");
        }

        System.out.println(">>> CONTROLLER: File received successfully. Name: " + file.getOriginalFilename() + ", Size: " + file.getSize());

        try {
            AnalyzedMedicationDTO result = imageAnalysisService.analyzeMedicationImage(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println(">>> CONTROLLER ERROR: Exception caught inside controller execution:");
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("שגיאה פנימית במהלך עיבוד התמונה: " + e.getMessage());
        }
    }
    @PostMapping
    public Medication createMedication(@Valid @RequestBody Medication medication) {
        return medicationService.createMedication(medication);
    }

    @GetMapping
    public List<Medication> getAllMedications() {
        return medicationService.getAllMedications();
    }

    @GetMapping("/{id}")
    public Medication getMedicationById(@PathVariable Long id) {
        return medicationService.getMedicationById(id);
    }

    @GetMapping("/user/{userId}")
    public List<Medication> getMedicationsByUserId(@PathVariable Long userId) {
        System.out.println("DEBUG: נכנסתי לפונקציה עם ID: " );
        return medicationService.getMedicationsByUserId(userId);
    }

    @PutMapping("/{id}")
    public Medication updateMedication(@PathVariable Long id, @RequestBody Medication medication) {
        return medicationService.updateMedication(id, medication);
    }

    @DeleteMapping("/{id}")
    public void deleteMedication(@PathVariable Long id) {
        medicationService.deleteMedication(id);
    }
}