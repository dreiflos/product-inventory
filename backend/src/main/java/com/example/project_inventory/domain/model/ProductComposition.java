package com.example.project_inventory.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
    @JsonIgnoreProperties({"compositions"})
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne
    @JoinColumn(name = "RAW_MATERIAL_id", nullable = false)
    private RawMaterial rawMaterial;

    @Column(name = "required_quantity", nullable = false)
    private Integer requiredQuantity;
}
