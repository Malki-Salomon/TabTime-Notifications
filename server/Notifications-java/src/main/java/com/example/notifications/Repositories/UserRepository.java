package com.example.notifications.Repositories;


import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.notifications.Entities.User;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    void deleteByEmail(String email);

}