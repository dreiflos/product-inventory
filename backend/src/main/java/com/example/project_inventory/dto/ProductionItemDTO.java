package com.example.project_inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProductionItemDTO {
    private String productName;
    private Integer quantityToProduce;
    private Double subtotal;
}
