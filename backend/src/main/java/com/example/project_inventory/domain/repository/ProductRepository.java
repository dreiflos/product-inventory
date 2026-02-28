package com.example.project_inventory.domain.repository;

import com.example.project_inventory.domain.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findAllByOrderByPriceDesc();
    @Query("SELECT DISTINCT p FROM Product p " +
            "LEFT JOIN FETCH p.compositions c " +
            "LEFT JOIN FETCH c.rawMaterial " +
            "ORDER BY p.price DESC")
    List<Product> findAllWithCompositionsOrderByPriceDesc();
}