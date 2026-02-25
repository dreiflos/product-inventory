package com.example.project_inventory.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProductDTO {
    private Long id;
    private String name;
    private Double price;
    private List<ProductCompositionDTO> compositions;
}
