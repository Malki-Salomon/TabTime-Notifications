package com.example.notifications.Services;

import java.util.List;

import com.example.notifications.DTO.UserUpdateDTO;
import com.example.notifications.Exceptions.ConflictException;
import com.example.notifications.Exceptions.ResourceNotFoundException; // הוסף אימפורט
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import com.example.notifications.Repositories.UserRepository;
import com.example.notifications.Entities.User;

@Service
@RequiredArgsConstructor
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new ConflictException("Email already exists");
        }
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id)); // שינוי ל-ResourceNotFoundException
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email)); // שינוי ל-ResourceNotFoundException
    }
    public User updateUserByEmail(String email, UserUpdateDTO updateDto) {
        // 1. שליפת המשתמש הקיים מהדאטה-בייס
        User existingUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 2. בדיקה אם האימייל החדש תפוס על ידי משתמש אחר
        if (!email.equals(updateDto.getEmail()) &&
                userRepository.existsByEmail(updateDto.getEmail())) {
            throw new ConflictException("Email already exists");
        }

        // 3. עדכון השדות הבסיסיים מתוך ה-DTO
        existingUser.setName(updateDto.getName());
        existingUser.setEmail(updateDto.getEmail());

        // 4. עדכון שדות ה-Push רק אם הם סופקו ב-DTO (לא null)
        if (updateDto.getPushEndpoint() != null) {
            existingUser.setPushEndpoint(updateDto.getPushEndpoint());
        }
        if (updateDto.getPushP256dh() != null) {
            existingUser.setPushP256dh(updateDto.getPushP256dh());
        }
        if (updateDto.getPushAuth() != null) {
            existingUser.setPushAuth(updateDto.getPushAuth());
        }

        // הסיסמה (password) של existingUser נשארת כפי שהייתה ולא משתנה!

        // 5. שמירה סופית בדאטה-בייס והחזרת הישות המעודכנת
        return userRepository.save(existingUser);
    }
//    public User updateUserByEmail(String email, User updatedUser) {
//        User existingUser = userRepository.findByEmail(email)
//                .orElseThrow(() -> new ResourceNotFoundException("User not found")); // שינוי
//
//        if (!email.equals(updatedUser.getEmail()) &&
//                userRepository.existsByEmail(updatedUser.getEmail())) {
//            throw new ConflictException("Email already exists"); // שינוי ל-ConflictException
//        }
//
//        existingUser.setName(updatedUser.getName());
//        existingUser.setEmail(updatedUser.getEmail());
//        existingUser.setPassword(updatedUser.getPassword());
//        existingUser.setPushEndpoint(updatedUser.getPushEndpoint());
//        existingUser.setPushP256dh(updatedUser.getPushP256dh());
//        existingUser.setPushAuth(updatedUser.getPushAuth());
//
//        return userRepository.save(existingUser);
//    }

    @Transactional
    public void deleteUserByEmail(String email) {
        if (!userRepository.existsByEmail(email)) {
            throw new ResourceNotFoundException("User not found");
        }
        userRepository.deleteByEmail(email);
    }
}