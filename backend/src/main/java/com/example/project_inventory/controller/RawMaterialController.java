package com.example.project_inventory.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/raw-materials")
@RequiredArgsConstructor
public class RawMaterialController {

    private final RawMaterialService rawMaterialService;

    @GetMapping
    public List<RawMaterial> getAll() {
        return rawMaterialService.findAll();
    }

    @PostMapping
    public ResponseEntity<RawMaterial> create(@RequestBody RawMaterial material) {
        RawMaterial savedMaterial = rawMaterialService.save(material);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedMaterial);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RawMaterial> getById(@PathVariable Long id) {
        return ResponseEntity.ok(rawMaterialService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RawMaterial> update(@PathVariable Long id, @RequestBody RawMaterial material) {
        return ResponseEntity.ok(rawMaterialService.update(id, material));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        rawMaterialService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
