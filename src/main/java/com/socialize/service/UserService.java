package com.socialize.service;

import com.socialize.entity.User;
import com.socialize.exception.BadRequestException;
import com.socialize.exception.UserNotFoundException;
import com.socialize.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User getUser(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    public User createNewUser(User user) {
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new BadRequestException("Password cannot be empty");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new BadRequestException("Email already exists");
        }
        //HASH PASSWORD
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public List<User> getAllUser() {
        return userRepository.findAll();
    }

    public User updateUserDetails(User user, Long userId) {
        User existingUser = userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException("User not found"));
        if (user.getName() != null && !user.getName().isBlank()) {
            existingUser.setName(user.getName());
        }
        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            if (userRepository.existsByEmail(user.getEmail()) &&
                    !existingUser.getEmail().equals(user.getEmail())) {
                throw new BadRequestException("Email already exists");
            }
            existingUser.setEmail(user.getEmail());
        }
        if (user.getPassword() != null) {
            if (user.getPassword().isBlank()) {
                throw new BadRequestException("Password cannot be empty");
            }
            //  HASH PASSWORD
            existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(existingUser);
    }

    public String deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException("User not found");
        }
        userRepository.deleteById(userId);
        return "User account deleted successfully";
    }
}
