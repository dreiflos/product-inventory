package com.example.project_inventory.domain.service;


import com.example.project_inventory.domain.model.Product;
import com.example.project_inventory.domain.model.RawMaterial;
import com.example.project_inventory.domain.repository.ProductRepository;
import com.example.project_inventory.domain.repository.RawMaterialRepository;
import com.example.project_inventory.dto.ProductionItemDTO;
import com.example.project_inventory.dto.ProductionReportDTO;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductionService {

    private final ProductRepository productRepository;
    private final RawMaterialRepository rawMaterialRepository;

    @Transactional(readOnly = true)
    public ProductionReportDTO calculateSuggestedProduction() {
        List<Product> products = productRepository.findAllWithCompositionsOrderByPriceDesc();

        Map<Long, Double> temporaryStock = rawMaterialRepository.findAll().stream()
                .collect(Collectors.toMap(RawMaterial::getId, RawMaterial::getStockQuantity));

        List<ProductionItemDTO> items = new ArrayList<>();

        for (Product product : products) {
            if (product.getCompositions() == null || product.getCompositions().isEmpty()) continue;

            int maxQuantity = Integer.MAX_VALUE;

            for (var comp : product.getCompositions()) {
                double required = comp.getRequiredQuantity();
                if (required <= 0) continue;

                double available = temporaryStock.getOrDefault(comp.getRawMaterial().getId(), 0.0);
                int possible = (int) (available / required);

                if (possible < maxQuantity) {
                    maxQuantity = possible;
                }
            }

            if (maxQuantity > 0 && maxQuantity != Integer.MAX_VALUE) {
                for (var comp : product.getCompositions()) {
                    Long id = comp.getRawMaterial().getId();
                    double totalUsed = comp.getRequiredQuantity() * maxQuantity;
                    temporaryStock.put(id, temporaryStock.get(id) - totalUsed);
                }

                items.add(new ProductionItemDTO(
                        product.getName(),
                        maxQuantity,
                        maxQuantity * product.getPrice()
                ));
            }
        }

        double total = items.stream()
                .mapToDouble(ProductionItemDTO::getSubtotal)
                .sum();

        return new ProductionReportDTO(items, total);
    }
}