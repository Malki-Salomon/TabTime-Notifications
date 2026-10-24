package com.example.notifications.Repositories;

import com.example.notifications.Entities.MedicationSchedule;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicationScheduleRepository extends JpaRepository<MedicationSchedule, Long> {

    List<MedicationSchedule> findByUser_Id(Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM MedicationSchedule ms WHERE ms.medication.id = :medicationId AND ms.timeOfDay = :time")
    void deleteByMedicationIdAndTime(@Param("medicationId") Long medicationId, @Param("time") java.time.LocalTime time);
}