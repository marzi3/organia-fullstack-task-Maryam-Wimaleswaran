package com.organia.taskmanager.controller;

import com.organia.taskmanager.dto.UserResponse;
import com.organia.taskmanager.model.User;
import com.organia.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller for administrative operations.
 * Protected by Spring Security to allow access only for ADMIN role.
 */
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;

    /**
     * Get a list of all registered users.
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userRepository.findAll().stream()
                .map(user -> UserResponse.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .createdAt(user.getCreatedAt())
                        .taskCount(user.getTasks().size())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    /**
     * Delete a user by their ID.
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
