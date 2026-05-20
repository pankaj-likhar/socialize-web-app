package com.socialize.controller;

import com.socialize.entity.User;
import com.socialize.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.getUser(id);
    }

    @PostMapping
    public User createNewUser(@Valid @RequestBody User user) {
        return userService.createNewUser(user);
    }

    @GetMapping
    public List<User> getAllusers() {
        return userService.getAllUser();
    }

    @PatchMapping("/{id}")
    public User updateUserDetails(@RequestBody User user,
                                  @PathVariable Long id) {
        return userService.updateUserDetails(user, id);
    }

    @DeleteMapping("/{id}")
    public String deleteUserAccount(@PathVariable Long id) {
        return userService.deleteUser(id);
    }

    @PatchMapping("/profile-image")
    public User uploadProfileImage(
            @RequestParam("image") MultipartFile image,
            Authentication auth) {

        return userService.uploadProfileImage(
                auth.getName(),
                image
        );
    }
}
