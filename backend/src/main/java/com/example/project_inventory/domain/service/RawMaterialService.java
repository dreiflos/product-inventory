package com.example.project_inventory.domain.service;

import com.example.project_inventory.domain.model.RawMaterial;
import com.example.project_inventory.domain.repository.RawMaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RawMaterialService {

    private final RawMaterialRepository rawMaterialRepository;

    public List<RawMaterial> findAll() {
        return rawMaterialRepository.findAll();
    }

    public RawMaterial findById(Long id) {
        return rawMaterialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Raw Material not found with id: " + id));
    }

    @Transactional
    public RawMaterial save(RawMaterial material) {
        return rawMaterialRepository.save(material);
    }

    @Transactional
    public RawMaterial update(Long id, RawMaterial materialDetails) {
        RawMaterial material = findById(id);

        material.setName(materialDetails.getName());
        material.setStockQuantity(materialDetails.getStockQuantity());

        return rawMaterialRepository.save(material);
    }

    @Transactional
    public void delete(Long id) {
        rawMaterialRepository.deleteById(id);
    }

    @Transactional
    public void addStock(Long id, Double quantity) {
        RawMaterial material = findById(id);
        material.setStockQuantity(material.getStockQuantity() + quantity);
        rawMaterialRepository.save(material);
    }
}