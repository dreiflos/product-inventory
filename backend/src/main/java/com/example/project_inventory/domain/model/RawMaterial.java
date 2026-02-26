package com.example.project_inventory.domain.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "RAW_MATERIAL")
@Data

public class RawMaterial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "stock_quantity", nullable = false)
    private Double stockQuantity;
}
