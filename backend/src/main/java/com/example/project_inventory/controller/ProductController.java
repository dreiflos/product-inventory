package com.example.project_inventory.controller;

import com.example.project_inventory.domain.model.Product;
import com.example.project_inventory.domain.service.ProductService;
import com.example.project_inventory.dto.CompositionRequestDTO;
import com.example.project_inventory.dto.ProductCompositionDTO;
import com.example.project_inventory.dto.ProductDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAll() {
        return ResponseEntity.ok(productService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.findByIdAsDto(id));
    }

    @PostMapping
    public ResponseEntity<ProductDTO> create(@RequestBody Product product) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.save(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> update(@PathVariable Long id, @RequestBody Product product) {
        return ResponseEntity.ok(productService.update(id, product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/compositions")
    public ResponseEntity<ProductCompositionDTO> addComposition(
            @PathVariable Long id,
            @Valid @RequestBody CompositionRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.addComposition(id, request));
    }

    @DeleteMapping("/{id}/compositions/{compositionId}")
    public ResponseEntity<Void> removeComposition(
            @PathVariable Long id,
            @PathVariable Long compositionId) {
        productService.removeComposition(id, compositionId);
        return ResponseEntity.noContent().build();
    }
}
