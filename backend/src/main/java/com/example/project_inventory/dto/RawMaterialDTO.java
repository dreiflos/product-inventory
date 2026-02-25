package com.example.project_inventory.dto;

import lombok.Data;

@Data
public class RawMaterialDTO {
    private Long id;
    private String name;
    private Double stockQuantity;
}
