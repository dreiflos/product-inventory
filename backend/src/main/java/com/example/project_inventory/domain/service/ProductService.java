package com.example.project_inventory.domain.service;

import com.example.project_inventory.domain.model.Product;
import com.example.project_inventory.domain.model.ProductComposition;
import com.example.project_inventory.domain.model.RawMaterial;
import com.example.project_inventory.domain.repository.ProductCompositionRepository;
import com.example.project_inventory.domain.repository.ProductRepository;
import com.example.project_inventory.domain.repository.RawMaterialRepository;
import com.example.project_inventory.dto.CompositionRequestDTO;
import com.example.project_inventory.dto.ProductCompositionDTO;
import com.example.project_inventory.dto.ProductDTO;
import com.example.project_inventory.exception.BusinessException;
import com.example.project_inventory.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductCompositionRepository compositionRepository;
    private final RawMaterialRepository rawMaterialRepository;

    public List<ProductDTO> findAll() {
        return productRepository.findAllWithCompositionsOrderByPriceDesc()
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    public ProductDTO findByIdAsDto(Long id) {
        return convertToDto(findById(id));
    }

    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    @Transactional
    public ProductDTO save(Product product) {
        if (product.getName() == null || product.getName().isBlank()) {
            throw new BusinessException("Product name is required");
        }
        if (product.getPrice() == null || product.getPrice() < 0) {
            throw new BusinessException("Product price must be a non-negative value");
        }
        if (product.getCompositions() != null) {
            product.getCompositions().forEach(comp -> comp.setProduct(product));
        }
        return convertToDto(productRepository.save(product));
    }

    @Transactional
    public ProductDTO update(Long id, Product productDetails) {
        Product product = findById(id);

        if (productDetails.getName() == null || productDetails.getName().isBlank()) {
            throw new BusinessException("Product name is required");
        }
        if (productDetails.getPrice() == null || productDetails.getPrice() < 0) {
            throw new BusinessException("Product price must be a non-negative value");
        }

        product.setName(productDetails.getName());
        product.setPrice(productDetails.getPrice());

        return convertToDto(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    @Transactional
    public ProductCompositionDTO addComposition(Long productId, CompositionRequestDTO request) {
        Product product = findById(productId);

        RawMaterial rawMaterial = rawMaterialRepository.findById(request.getRawMaterialId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Raw material not found with id: " + request.getRawMaterialId()));

        boolean alreadyExists = product.getCompositions().stream()
                .anyMatch(c -> c.getRawMaterial().getId().equals(rawMaterial.getId()));
        if (alreadyExists) {
            throw new BusinessException("Raw material '" + rawMaterial.getName() +
                    "' is already associated with this product");
        }

        ProductComposition composition = new ProductComposition();
        composition.setProduct(product);
        composition.setRawMaterial(rawMaterial);
        composition.setRequiredQuantity(request.getQuantity());

        ProductComposition saved = compositionRepository.save(composition);
        return convertCompositionToDto(saved);
    }

    @Transactional
    public void removeComposition(Long productId, Long compositionId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }
        ProductComposition composition = compositionRepository.findById(compositionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Composition not found with id: " + compositionId));

        if (!composition.getProduct().getId().equals(productId)) {
            throw new BusinessException("Composition does not belong to product with id: " + productId);
        }

        compositionRepository.deleteById(compositionId);
    }


    public ProductDTO convertToDto(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setPrice(product.getPrice());
        if (product.getCompositions() != null) {
            dto.setCompositions(product.getCompositions().stream()
                    .map(this::convertCompositionToDto)
                    .toList());
        }
        return dto;
    }

    private ProductCompositionDTO convertCompositionToDto(ProductComposition comp) {
        ProductCompositionDTO dto = new ProductCompositionDTO();
        dto.setId(comp.getId());
        dto.setRawMaterialId(comp.getRawMaterial().getId());
        dto.setRawMaterialName(comp.getRawMaterial().getName());
        dto.setRequiredQuantity(comp.getRequiredQuantity());
        return dto;
    }
}
