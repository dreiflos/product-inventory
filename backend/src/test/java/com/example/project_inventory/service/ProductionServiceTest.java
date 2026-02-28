package com.example.project_inventory.service;

import com.example.project_inventory.domain.model.Product;
import com.example.project_inventory.domain.model.ProductComposition;
import com.example.project_inventory.domain.model.RawMaterial;
import com.example.project_inventory.domain.repository.ProductRepository;
import com.example.project_inventory.domain.repository.RawMaterialRepository;
import com.example.project_inventory.domain.service.ProductionService;
import com.example.project_inventory.dto.ProductionReportDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductionServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private RawMaterialRepository rawMaterialRepository;

    @InjectMocks
    private ProductionService productionService;

    private RawMaterial buildMaterial(Long id, String name, int stock) {
        RawMaterial m = new RawMaterial();
        m.setId(id);
        m.setName(name);
        m.setStockQuantity(stock);
        return m;
    }

    private Product buildProduct(Long id, String name, double price, RawMaterial mat, int qty) {
        Product p = new Product();
        p.setId(id);
        p.setName(name);
        p.setPrice(price);

        ProductComposition comp = new ProductComposition();
        comp.setRawMaterial(mat);
        comp.setRequiredQuantity(qty);
        p.setCompositions(new ArrayList<>(List.of(comp)));
        return p;
    }

    @Test
    void calculateSuggestedProduction_withEnoughStock_shouldSuggestCorrectQuantity() {
        RawMaterial steel = buildMaterial(1L, "Steel", 100);
        Product widget = buildProduct(1L, "Widget", 50.0, steel, 10);

        when(productRepository.findAllWithCompositionsOrderByPriceDesc()).thenReturn(List.of(widget));
        when(rawMaterialRepository.findAll()).thenReturn(List.of(steel));

        ProductionReportDTO report = productionService.calculateSuggestedProduction();

        assertThat(report.getSuggestedItems()).hasSize(1);
        assertThat(report.getSuggestedItems().get(0).getQuantityToProduce()).isEqualTo(10); // 100 / 10
        assertThat(report.getSuggestedItems().get(0).getSubtotal()).isEqualTo(500.0);
        assertThat(report.getTotalEstimatedValue()).isEqualTo(500.0);
    }

    @Test
    void calculateSuggestedProduction_withNoStock_shouldReturnEmptyList() {
        RawMaterial steel = buildMaterial(1L, "Steel", 0);
        Product widget = buildProduct(1L, "Widget", 50.0, steel, 10);

        when(productRepository.findAllWithCompositionsOrderByPriceDesc()).thenReturn(List.of(widget));
        when(rawMaterialRepository.findAll()).thenReturn(List.of(steel));

        ProductionReportDTO report = productionService.calculateSuggestedProduction();

        assertThat(report.getSuggestedItems()).isEmpty();
        assertThat(report.getTotalEstimatedValue()).isEqualTo(0.0);
    }

    @Test
    void calculateSuggestedProduction_withProductWithoutCompositions_shouldSkipIt() {
        Product emptyProduct = new Product();
        emptyProduct.setId(1L);
        emptyProduct.setName("Ghost Product");
        emptyProduct.setPrice(999.0);
        emptyProduct.setCompositions(new ArrayList<>());

        when(productRepository.findAllWithCompositionsOrderByPriceDesc()).thenReturn(List.of(emptyProduct));
        when(rawMaterialRepository.findAll()).thenReturn(List.of());

        ProductionReportDTO report = productionService.calculateSuggestedProduction();

        assertThat(report.getSuggestedItems()).isEmpty();
    }

    @Test
    void calculateSuggestedProduction_sharedMaterial_shouldPrioritizeHigherPriceFirst() {
        RawMaterial steel = buildMaterial(1L, "Steel", 10);

        Product premium = buildProduct(1L, "Premium Widget", 200.0, steel, 5);  // needs 5 per unit
        Product cheap   = buildProduct(2L, "Cheap Widget",   50.0, steel, 5);   // also needs 5 per unit

        when(productRepository.findAllWithCompositionsOrderByPriceDesc()).thenReturn(List.of(premium, cheap));
        when(rawMaterialRepository.findAll()).thenReturn(List.of(steel));

        ProductionReportDTO report = productionService.calculateSuggestedProduction();

        assertThat(report.getSuggestedItems()).hasSize(1);
        assertThat(report.getSuggestedItems().get(0).getProductName()).isEqualTo("Premium Widget");
        assertThat(report.getSuggestedItems().get(0).getQuantityToProduce()).isEqualTo(2);
    }
}
