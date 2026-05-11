package com.organia.taskmanager.controller;

import com.organia.taskmanager.model.Role;
import com.organia.taskmanager.model.User;
import com.organia.taskmanager.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserRepository userRepository;

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllUsers_ShouldReturnOk_ForAdmin() throws Exception {
        // Arrange
        User admin = User.builder()
                .id(1L)
                .name("Admin")
                .email("admin@organia.com")
                .role(Role.ADMIN)
                .tasks(Collections.emptyList())
                .build();
        
        when(userRepository.findAll()).thenReturn(List.of(admin));

        // Act & Assert
        mockMvc.perform(get("/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Admin"))
                .andExpect(jsonPath("$[0].role").value("ADMIN"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void getAllUsers_ShouldReturnForbidden_ForNormalUser() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/admin/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    void getAllUsers_ShouldReturnUnauthorized_ForAnonymous() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/admin/users"))
                .andExpect(status().isUnauthorized());
    }
}
