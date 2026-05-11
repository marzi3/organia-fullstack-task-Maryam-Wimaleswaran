package com.organia.taskmanager.service;

import com.organia.taskmanager.dto.AuthResponse;
import com.organia.taskmanager.dto.RegisterRequest;
import com.organia.taskmanager.model.Role;
import com.organia.taskmanager.model.User;
import com.organia.taskmanager.repository.UserRepository;
import com.organia.taskmanager.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest("Test User", "test@example.com", "password123");
    }

    @Test
    void register_ShouldCreateUserRole_ForNormalEmail() {
        // Arrange
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashed_password");
        when(jwtService.generateToken(any())).thenReturn("mock_token");
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        // Act
        AuthResponse response = authService.register(registerRequest);

        // Assert
        assertNotNull(response);
        assertEquals("USER", response.getRole());
        verify(userRepository, times(1)).save(argThat(user -> user.getRole() == Role.USER));
    }

    @Test
    void register_ShouldCreateAdminRole_ForAdminEmail() {
        // Arrange
        registerRequest.setEmail("admin@organia.com");
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashed_password");
        when(jwtService.generateToken(any())).thenReturn("mock_token");
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        // Act
        AuthResponse response = authService.register(registerRequest);

        // Assert
        assertNotNull(response);
        assertEquals("ADMIN", response.getRole());
        verify(userRepository, times(1)).save(argThat(user -> user.getRole() == Role.ADMIN));
    }

    @Test
    void register_ShouldThrowException_WhenEmailExists() {
        // Arrange
        when(userRepository.existsByEmail(any())).thenReturn(true);

        // Act & Assert
        assertThrows(RuntimeException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any());
    }
}
