package com.example.project_inventory.service;

import com.example.project_inventory.domain.model.Product;
import com.example.project_inventory.domain.model.ProductComposition;
import com.example.project_inventory.domain.model.RawMaterial;
import com.example.project_inventory.domain.repository.ProductCompositionRepository;
import com.example.project_inventory.domain.repository.ProductRepository;
import com.example.project_inventory.domain.repository.RawMaterialRepository;
import com.example.project_inventory.domain.service.ProductService;
import com.example.project_inventory.dto.CompositionRequestDTO;
import com.example.project_inventory.dto.ProductCompositionDTO;
import com.example.project_inventory.dto.ProductDTO;
import com.example.project_inventory.exception.BusinessException;
import com.example.project_inventory.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductCompositionRepository compositionRepository;

    @Mock
    private RawMaterialRepository rawMaterialRepository;

    @InjectMocks
    private ProductService productService;

    private Product product;
    private RawMaterial rawMaterial;

    @BeforeEach
    void setUp() {
        product = new Product();
        product.setId(1L);
        product.setName("Widget A");
        product.setPrice(99.90);
        product.setCompositions(new ArrayList<>());

        rawMaterial = new RawMaterial();
        rawMaterial.setId(1L);
        rawMaterial.setName("Steel");
        rawMaterial.setStockQuantity(100);
    }

    @Test
    void findAll_shouldReturnDtoList() {
        when(productRepository.findAllWithCompositionsOrderByPriceDesc()).thenReturn(List.of(product));

        List<ProductDTO> result = productService.findAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Widget A");
        assertThat(result.get(0).getPrice()).isEqualTo(99.90);
    }

    @Test
    void findById_whenNotExists_shouldThrowResourceNotFoundException() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void save_withValidProduct_shouldReturnDto() {
        when(productRepository.save(any())).thenReturn(product);

        ProductDTO result = productService.save(product);

        assertThat(result.getName()).isEqualTo("Widget A");
        verify(productRepository, times(1)).save(product);
    }

    @Test
    void save_withBlankName_shouldThrowBusinessException() {
        product.setName("");

        assertThatThrownBy(() -> productService.save(product))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("name");
    }

    @Test
    void save_withNegativePrice_shouldThrowBusinessException() {
        product.setPrice(-10.0);

        assertThatThrownBy(() -> productService.save(product))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("price");
    }

    @Test
    void update_whenExists_shouldUpdateNameAndPrice() {
        Product updated = new Product();
        updated.setName("Widget B");
        updated.setPrice(150.00);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ProductDTO result = productService.update(1L, updated);

        assertThat(result.getName()).isEqualTo("Widget B");
        assertThat(result.getPrice()).isEqualTo(150.00);
    }

    @Test
    void delete_whenNotExists_shouldThrowResourceNotFoundException() {
        when(productRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> productService.delete(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void addComposition_withValidRequest_shouldReturnDto() {
        CompositionRequestDTO request = new CompositionRequestDTO();
        request.setRawMaterialId(1L);
        request.setQuantity(5);

        ProductComposition saved = new ProductComposition();
        saved.setId(10L);
        saved.setProduct(product);
        saved.setRawMaterial(rawMaterial);
        saved.setRequiredQuantity(5);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(rawMaterialRepository.findById(1L)).thenReturn(Optional.of(rawMaterial));
        when(compositionRepository.save(any())).thenReturn(saved);

        ProductCompositionDTO result = productService.addComposition(1L, request);

        assertThat(result.getRawMaterialId()).isEqualTo(1L);
        assertThat(result.getRequiredQuantity()).isEqualTo(5);
        assertThat(result.getRawMaterialName()).isEqualTo("Steel");
    }

    @Test
    void addComposition_whenRawMaterialAlreadyLinked_shouldThrowBusinessException() {
        // Simulate material already in the composition list
        ProductComposition existing = new ProductComposition();
        existing.setRawMaterial(rawMaterial);
        product.getCompositions().add(existing);

        CompositionRequestDTO request = new CompositionRequestDTO();
        request.setRawMaterialId(1L);
        request.setQuantity(3);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(rawMaterialRepository.findById(1L)).thenReturn(Optional.of(rawMaterial));

        assertThatThrownBy(() -> productService.addComposition(1L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already associated");
    }

    @Test
    void removeComposition_whenCompositionBelongsToDifferentProduct_shouldThrowBusinessException() {
        Product otherProduct = new Product();
        otherProduct.setId(99L);

        ProductComposition composition = new ProductComposition();
        composition.setId(5L);
        composition.setProduct(otherProduct);

        when(productRepository.existsById(1L)).thenReturn(true);
        when(compositionRepository.findById(5L)).thenReturn(Optional.of(composition));

        assertThatThrownBy(() -> productService.removeComposition(1L, 5L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("does not belong");
    }
}
