package com.example.notifications.Repositories;

import com.example.notifications.Entities.Medication;
import com.example.notifications.Entities.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MedicationRepository extends JpaRepository<Medication, Long> {
    List<Medication> findByUser_Id(Long userId);
    Optional<Medication> findByUserAndName(User user, String name);
    /**
     * מוחק את כל התרופות שתאריך הסיום שלהן קטן מהתאריך שנשלח.
     */
    @Modifying
    @Transactional
    void deleteByEndDateBefore(LocalDate date);
}