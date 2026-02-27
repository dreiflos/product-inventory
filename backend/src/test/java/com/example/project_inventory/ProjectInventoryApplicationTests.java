package com.example.project_inventory;

import com.example.project_inventory.domain.repository.ProductCompositionRepository;
import com.example.project_inventory.domain.repository.ProductRepository;
import com.example.project_inventory.domain.repository.RawMaterialRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockbean.MockBean;

@SpringBootTest
class ProjectInventoryApplicationTests {

    // Mock the repositories so the context loads without a real database connection
    @MockBean
    private ProductRepository productRepository;

    @MockBean
    private RawMaterialRepository rawMaterialRepository;

    @MockBean
    private ProductCompositionRepository productCompositionRepository;

    @Test
    void contextLoads() {
        // Verifies that the Spring context starts up correctly
    }
}
