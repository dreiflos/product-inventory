package com.example.project_inventory.domain.service;

import com.example.project_inventory.domain.model.Product;
import com.example.project_inventory.domain.model.RawMaterial;
import com.example.project_inventory.domain.repository.ProductRepository;
import com.example.project_inventory.domain.repository.RawMaterialRepository;
import com.example.project_inventory.dto.ProductionReportDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductionService {

    private final ProductRepository productRepository;
    private final RawMaterialRepository rawMaterialRepository;

    public List<Map<String, Object>> calculateSuggestedProduction() {
        List<Product> products = productRepository.findAllByOrderByPriceDesc();

        Map<Long, Double> temporaryStock = rawMaterialRepository.findAll().stream()
                .collect(Collectors.toMap(RawMaterial::getId, RawMaterial::getStockQuantity));

        List<Map<String, Object>> suggestion = new ArrayList<>();
        double totalRevenue = 0.0;


        for (Product product : products) {
            int quantityProduced = 0;
            boolean canProduce = true;

            while (canProduce) {
                for (var comp : product.getCompositions()) {
                    double required = comp.getRequiredQuantity();
                    double available = temporaryStock.getOrDefault(comp.getRawMaterial().getId(), 0.0);

                    if (available < required) {
                        canProduce = false;
                        break;
                    }
                }

                if (canProduce) {
                    for (var comp : product.getCompositions()) {
                        Long id = comp.getRawMaterial().getId();
                        temporaryStock.put(id, temporaryStock.get(id) - comp.getRequiredQuantity());
                    }
                    quantityProduced++;
                }
            }

            if (quantityProduced > 0) {
                Map<String, Object> item = new HashMap<>();
                item.put("productName", product.getName());
                item.put("quantity", quantityProduced);
                item.put("subtotal", quantityProduced * product.getPrice());
                suggestion.add(item);
                totalRevenue += (quantityProduced * product.getPrice());
            }
        }
        return suggestion;
    }
}