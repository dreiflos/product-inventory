package com.example.project_inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class ProductionReportDTO {
    private List<ProductionItemDTO> suggestedItems;
    private Double totalEstimatedValue;
}

@Data
@AllArgsConstructor
class ProductionItemDTO {
    private String productName;
    private Integer quantityToProduce;
    private Double subtotal;
}
