package com.example.project_inventory.domain.service;

import com.example.project_inventory.domain.model.RawMaterial;
import com.example.project_inventory.domain.repository.RawMaterialRepository;
import com.example.project_inventory.dto.RawMaterialDTO;
import com.example.project_inventory.exception.BusinessException;
import com.example.project_inventory.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RawMaterialService {

    private final RawMaterialRepository rawMaterialRepository;

    public List<RawMaterialDTO> findAll() {
        return rawMaterialRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    public RawMaterialDTO findByIdAsDto(Long id) {
        return convertToDto(findById(id));
    }

    public RawMaterial findById(Long id) {
        return rawMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Raw material not found with id: " + id));
    }

    @Transactional
    public RawMaterialDTO save(RawMaterial material) {
        validateMaterial(material);
        return convertToDto(rawMaterialRepository.save(material));
    }

    @Transactional
    public RawMaterialDTO update(Long id, RawMaterial materialDetails) {
        validateMaterial(materialDetails);
        RawMaterial material = findById(id);
        material.setName(materialDetails.getName());
        material.setStockQuantity(materialDetails.getStockQuantity());
        return convertToDto(rawMaterialRepository.save(material));
    }

    @Transactional
    public void delete(Long id) {
        if (!rawMaterialRepository.existsById(id)) {
            throw new ResourceNotFoundException("Raw material not found with id: " + id);
        }
        rawMaterialRepository.deleteById(id);
    }

    private void validateMaterial(RawMaterial material) {
        if (material.getName() == null || material.getName().isBlank()) {
            throw new BusinessException("Raw material name is required");
        }
        if (material.getStockQuantity() == null || material.getStockQuantity() < 0) {
            throw new BusinessException("Stock quantity must be a non-negative value");
        }
    }

    public RawMaterialDTO convertToDto(RawMaterial material) {
        RawMaterialDTO dto = new RawMaterialDTO();
        dto.setId(material.getId());
        dto.setName(material.getName());
        dto.setStockQuantity(material.getStockQuantity());
        return dto;
    }
}
