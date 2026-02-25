package com.example.project_inventory.dto;

import lombok.Data;

@Data
public class ProductCompositionDTO {
    private Long rawMaterialId;
    private String rawMaterialName;
    private Double requiredQuantity;
}
