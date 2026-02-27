package com.example.project_inventory.controller;

import com.example.project_inventory.domain.model.RawMaterial;
import com.example.project_inventory.domain.service.RawMaterialService;
import com.example.project_inventory.dto.RawMaterialDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/raw-materials")
@RequiredArgsConstructor
public class RawMaterialController {

    private final RawMaterialService rawMaterialService;

    @GetMapping
    public ResponseEntity<List<RawMaterialDTO>> getAll() {
        return ResponseEntity.ok(rawMaterialService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RawMaterialDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(rawMaterialService.findByIdAsDto(id));
    }

    @PostMapping
    public ResponseEntity<RawMaterialDTO> create(@RequestBody RawMaterial material) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rawMaterialService.save(material));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RawMaterialDTO> update(@PathVariable Long id, @RequestBody RawMaterial material) {
        return ResponseEntity.ok(rawMaterialService.update(id, material));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        rawMaterialService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
