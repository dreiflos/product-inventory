package com.example.project_inventory.controller;

import com.example.project_inventory.domain.service.ProductionService;
import com.example.project_inventory.dto.ProductionReportDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/production")
@RequiredArgsConstructor
public class ProductionController {
    private final ProductionService productionService;

    @GetMapping("/suggested")
    public ResponseEntity<ProductionReportDTO> getSuggestedProduction() {
        return ResponseEntity.ok(productionService.calculateSuggestedProduction());
    }
}
