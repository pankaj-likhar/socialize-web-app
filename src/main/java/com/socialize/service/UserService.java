package com.socialize.service;

import com.socialize.entity.User;
import com.socialize.exception.BadRequestException;
import com.socialize.exception.UserNotFoundException;
import com.socialize.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ImageUploadService imageUploadService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       ImageUploadService imageUploadService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.imageUploadService = imageUploadService;
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

    public User uploadProfileImage(String email, MultipartFile image) {
        // Find logged-in user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Delete old profile image from Cloudinary if it exists
        if (user.getProfileImagePublicId() != null &&
                !user.getProfileImagePublicId().isBlank()) {

            imageUploadService.deleteImage(
                    user.getProfileImagePublicId()
            );
        }

        // Upload new image to Cloudinary
        Map uploadResult = imageUploadService.uploadImage(image);

        // Save new image data
        user.setProfileImageUrl(
                (String) uploadResult.get("secure_url")
        );

        user.setProfileImagePublicId(
                (String) uploadResult.get("public_id")
        );

        // Save updated user
        return userRepository.save(user);
    }
}
