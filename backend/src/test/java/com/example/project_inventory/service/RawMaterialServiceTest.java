package com.example.project_inventory.service;

import com.example.project_inventory.domain.model.RawMaterial;
import com.example.project_inventory.domain.repository.RawMaterialRepository;
import com.example.project_inventory.domain.service.RawMaterialService;
import com.example.project_inventory.dto.RawMaterialDTO;
import com.example.project_inventory.exception.BusinessException;
import com.example.project_inventory.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RawMaterialServiceTest {

    @Mock
    private RawMaterialRepository rawMaterialRepository;

    @InjectMocks
    private RawMaterialService rawMaterialService;

    private RawMaterial material;

    @BeforeEach
    void setUp() {
        material = new RawMaterial();
        material.setId(1L);
        material.setName("Steel");
        material.setStockQuantity(100);
    }

    @Test
    void findAll_shouldReturnListOfDtos() {
        when(rawMaterialRepository.findAll()).thenReturn(List.of(material));

        List<RawMaterialDTO> result = rawMaterialService.findAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Steel");
        assertThat(result.get(0).getStockQuantity()).isEqualTo(100);
    }

    @Test
    void findById_whenExists_shouldReturnMaterial() {
        when(rawMaterialRepository.findById(1L)).thenReturn(Optional.of(material));

        RawMaterial found = rawMaterialService.findById(1L);

        assertThat(found.getName()).isEqualTo("Steel");
    }

    @Test
    void findById_whenNotExists_shouldThrowResourceNotFoundException() {
        when(rawMaterialRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> rawMaterialService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void save_withValidData_shouldReturnDto() {
        when(rawMaterialRepository.save(any())).thenReturn(material);

        RawMaterialDTO result = rawMaterialService.save(material);

        assertThat(result.getName()).isEqualTo("Steel");
        verify(rawMaterialRepository, times(1)).save(material);
    }

    @Test
    void save_withBlankName_shouldThrowBusinessException() {
        material.setName("   ");

        assertThatThrownBy(() -> rawMaterialService.save(material))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("name");
    }

    @Test
    void save_withNegativeStock_shouldThrowBusinessException() {
        material.setStockQuantity(-5);

        assertThatThrownBy(() -> rawMaterialService.save(material))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("quantity");
    }

    @Test
    void update_whenExists_shouldUpdateFields() {
        RawMaterial updated = new RawMaterial();
        updated.setName("Aluminum");
        updated.setStockQuantity(200);

        when(rawMaterialRepository.findById(1L)).thenReturn(Optional.of(material));
        when(rawMaterialRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        RawMaterialDTO result = rawMaterialService.update(1L, updated);

        assertThat(result.getName()).isEqualTo("Aluminum");
        assertThat(result.getStockQuantity()).isEqualTo(200);
    }

    @Test
    void delete_whenExists_shouldCallRepository() {
        when(rawMaterialRepository.existsById(1L)).thenReturn(true);

        rawMaterialService.delete(1L);

        verify(rawMaterialRepository, times(1)).deleteById(1L);
    }

    @Test
    void delete_whenNotExists_shouldThrowResourceNotFoundException() {
        when(rawMaterialRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> rawMaterialService.delete(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
