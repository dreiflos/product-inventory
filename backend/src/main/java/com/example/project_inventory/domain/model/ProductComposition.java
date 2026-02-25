package com.example.project_inventory.domain.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "PRODUCT_COMPOSITION")
@Data
public class ProductComposition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne
    @JoinColumn(name = "raw_material_id", nullable = false)
    private RawMaterial rawMaterial;

    @Column(name = "required_quantity", nullable = false)
    private Double requiredQuantity;
}