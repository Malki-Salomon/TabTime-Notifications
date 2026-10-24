package com.example.notifications.Controllers;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.notifications.Entities.MedicationSchedule;
import com.example.notifications.Services.MedicationScheduleService;
import java.util.List;

@RestController
@RequestMapping("/medication-schedules")
public class MedicationScheduleController {

    @Autowired
    private MedicationScheduleService medicationScheduleService;

    @PostMapping
    public MedicationSchedule createSchedule(@Valid @RequestBody MedicationSchedule schedule) {
        return medicationScheduleService.createSchedule(schedule);
    }

    @GetMapping
    public List<MedicationSchedule> getAllSchedules() {
        return medicationScheduleService.getAllSchedules();
    }

    @GetMapping("/user/{userId}")
    public List<MedicationSchedule> getSchedulesByUserId(@PathVariable Long userId) {
        return medicationScheduleService.getSchedulesByUserId(userId);
    }

    @PutMapping("/{id}")
    public MedicationSchedule updateSchedule(@PathVariable Long id,@Valid @RequestBody MedicationSchedule schedule) {
        return medicationScheduleService.updateSchedule(id, schedule);
    }

    @DeleteMapping("/{id}")
    public void deleteSchedule(@PathVariable Long id) {
        medicationScheduleService.deleteSchedule(id);
    }
}