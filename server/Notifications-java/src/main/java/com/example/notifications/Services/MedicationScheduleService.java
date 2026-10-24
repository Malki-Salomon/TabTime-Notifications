package com.example.notifications.Services;

import com.example.notifications.Exceptions.ResourceNotFoundException;
import com.example.notifications.Repositories.MedicationScheduleRepository;
import com.example.notifications.Entities.MedicationSchedule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MedicationScheduleService {

    @Autowired
    private MedicationScheduleRepository medicationScheduleRepository;

    public MedicationSchedule createSchedule(MedicationSchedule schedule) {
        return medicationScheduleRepository.save(schedule);
    }

    public List<MedicationSchedule> getAllSchedules() {
        return medicationScheduleRepository.findAll();
    }

    public List<MedicationSchedule> getSchedulesByUserId(Long userId) {

        List<MedicationSchedule> schedules = medicationScheduleRepository.findByUser_Id(userId);

        // 3. בדיקה לוגית: האם נמצאה מערכת שעות?
        // אם הרשימה ריקה, נזרוק שגיאה לפי בקשתך
        if (schedules.isEmpty()) {
            throw new ResourceNotFoundException("No medication schedules found for user id: " + userId);
        }

        return schedules;
    }

    public MedicationSchedule getScheduleById(Long id) {
        return medicationScheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found"));
    }

    public MedicationSchedule updateSchedule(Long id, MedicationSchedule updatedSchedule) {

        MedicationSchedule existingSchedule = getScheduleById(id);
        existingSchedule.setTimeOfDay(updatedSchedule.getTimeOfDay());
        existingSchedule.setTake(updatedSchedule.isTake());

        return medicationScheduleRepository.save(existingSchedule);
    }

    public void deleteSchedule(Long id) {
        if (!medicationScheduleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cannot delete: Medication schedule not found with id: " + id);
        }
        medicationScheduleRepository.deleteById(id);
    }
}